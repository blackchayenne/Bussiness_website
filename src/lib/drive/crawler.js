import { DriveClient, createDriveClient } from './client'
import { DEFAULT_CRAWL_OPTIONS, IMAGE_MIME_TYPES } from './types'
import { buildThumbnailUrl, buildViewUrl } from './parser'

export class DriveCrawler {
  constructor(client, options = {}) {
    this.client = client || createDriveClient()
    this.options = { ...DEFAULT_CRAWL_OPTIONS, ...options }
    this.visitedFolders = new Set()
  }

  async crawl(rootFolderId, onProgress) {
    this.visitedFolders.clear()

    const folders = {}
    const files = {}
    const folderFiles = {}

    const queue = []

    const rootInfo = await this.client.getFile(rootFolderId)
    if (rootInfo.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('The provided ID is not a folder')
    }

    queue.push([rootFolderId, null, rootInfo.name, 0])
    let processedCount = 0

    while (queue.length > 0 && Object.keys(folders).length < this.options.maxFolders) {
      const [folderId, parentId, path, depth] = queue.shift()

      if (this.visitedFolders.has(folderId)) {
        continue
      }
      this.visitedFolders.add(folderId)

      if (depth > this.options.maxDepth) {
        continue
      }

      try {
        const images = await this.client.listAllChildren(folderId, {
          onlyImages: true,
          maxResults: this.options.maxFilesPerFolder,
        })

        const imageIds = []
        let latestImage = null
        let latestTime = ''

        for (const img of images) {
          const driveImage = {
            id: img.id,
            name: img.name,
            folderId,
            mimeType: img.mimeType,
            modifiedTime: img.modifiedTime,
            thumbUrl: img.thumbnailLink || buildThumbnailUrl(img.id),
            viewUrl: img.webViewLink || buildViewUrl(img.id),
            size: img.size ? parseInt(img.size, 10) : undefined,
          }
          files[img.id] = driveImage
          imageIds.push(img.id)

          if (img.modifiedTime > latestTime) {
            latestTime = img.modifiedTime
            latestImage = img
          }
        }

        folderFiles[folderId] = imageIds

        const subfolders = await this.client.listAllChildren(folderId, {
          onlyFolders: true,
          maxResults: this.options.maxFolders,
        })

        const folder = {
          id: folderId,
          name: path.split('/').pop() || path,
          parentId,
          path,
          coverFileId: latestImage?.id || null,
          coverThumbUrl: latestImage
            ? latestImage.thumbnailLink || buildThumbnailUrl(latestImage.id)
            : null,
          imageCount: imageIds.length,
          lastModified: latestTime || new Date().toISOString(),
          children: subfolders.map((f) => f.id),
        }
        folders[folderId] = folder

        for (const subfolder of subfolders) {
          if (!this.visitedFolders.has(subfolder.id)) {
            queue.push([
              subfolder.id,
              folderId,
              `${path}/${subfolder.name}`,
              depth + 1,
            ])
          }
        }

        processedCount++
        if (onProgress) {
          onProgress({
            foldersProcessed: processedCount,
            totalFolders: processedCount + queue.length,
            imagesFound: Object.keys(files).length,
            currentFolder: path,
          })
        }
      } catch (error) {
        console.error(`Error processing folder ${folderId}:`, error)
      }
    }

    let startPageToken = null
    try {
      startPageToken = await this.client.getStartPageToken()
    } catch (error) {
      console.error('Could not get start page token:', error)
    }

    const now = new Date().toISOString()

    return {
      rootFolderId,
      folders,
      files,
      folderFiles,
      startPageToken,
      lastSyncTime: now,
      lastFullCrawlTime: now,
    }
  }

  async crawlSingleFolder(folderId, parentPath = '') {
    const folderInfo = await this.client.getFile(folderId)

    if (folderInfo.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('The provided ID is not a folder')
    }

    const [images, subfolders] = await Promise.all([
      this.client.listAllChildren(folderId, {
        onlyImages: true,
        maxResults: this.options.maxFilesPerFolder,
      }),
      this.client.listAllChildren(folderId, {
        onlyFolders: true,
        maxResults: this.options.maxFolders,
      }),
    ])

    const driveImages = images.map((img) => ({
      id: img.id,
      name: img.name,
      folderId,
      mimeType: img.mimeType,
      modifiedTime: img.modifiedTime,
      thumbUrl: img.thumbnailLink || buildThumbnailUrl(img.id),
      viewUrl: img.webViewLink || buildViewUrl(img.id),
      size: img.size ? parseInt(img.size, 10) : undefined,
    }))

    const sortedImages = [...driveImages].sort(
      (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    )
    const coverImage = sortedImages[0] || null

    const path = parentPath ? `${parentPath}/${folderInfo.name}` : folderInfo.name

    const folder = {
      id: folderId,
      name: folderInfo.name,
      parentId: null,
      path,
      coverFileId: coverImage?.id || null,
      coverThumbUrl: coverImage?.thumbUrl || null,
      imageCount: driveImages.length,
      lastModified: coverImage?.modifiedTime || folderInfo.modifiedTime,
      children: subfolders.map((f) => f.id),
    }

    return { folder, images: driveImages, subfolders }
  }
}

export function isImageFile(file) {
  return IMAGE_MIME_TYPES.includes(file.mimeType)
}

export function createCrawler(options) {
  return new DriveCrawler(undefined, options)
}
