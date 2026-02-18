import { createDriveClient } from './client'
import { DriveCrawler } from './crawler'
import { IMAGE_MIME_TYPES } from './types'
import { buildThumbnailUrl, buildViewUrl } from './parser'
import { getCache } from '../cache'
import { reportSyncChanges } from '../reporting/change-reporter'

export class SyncManager {
  constructor(client) {
    this.client = client || createDriveClient()
    this.crawler = new DriveCrawler(this.client)
  }

  async fullSync(rootFolderId) {
    const index = await this.crawler.crawl(rootFolderId)
    const cache = getCache()
    await cache.set(`index:${rootFolderId}`, index)
    return index
  }

  async incrementalSync(rootFolderId, options = {}) {
    const cache = getCache()
    const index = await cache.get(`index:${rootFolderId}`)

    if (!index) {
      return {
        success: false,
        changesProcessed: 0,
        foldersUpdated: 0,
        filesAdded: 0,
        filesRemoved: 0,
        newStartPageToken: null,
        error: 'No index found. Run a full sync first.',
      }
    }

    if (!index.startPageToken) {
      return {
        success: false,
        changesProcessed: 0,
        foldersUpdated: 0,
        filesAdded: 0,
        filesRemoved: 0,
        newStartPageToken: null,
        error: 'No start page token found. Run a full sync first.',
      }
    }

    try {
      const { changes, newStartPageToken, nextPageToken } =
        await this.client.listAllChanges(index.startPageToken)
      const updatedToken = newStartPageToken || nextPageToken

      if (changes.length === 0) {
        if (updatedToken) {
          index.startPageToken = updatedToken
        }
        index.lastSyncTime = new Date().toISOString()
        await cache.set(`index:${rootFolderId}`, index)

        return {
          success: true,
          changesProcessed: 0,
          foldersUpdated: 0,
          filesAdded: 0,
          filesRemoved: 0,
          newStartPageToken: updatedToken,
        }
      }

      const result = await this.processChanges(index, changes)

      if (newStartPageToken) {
        index.startPageToken = newStartPageToken
      } else if (nextPageToken) {
        index.startPageToken = nextPageToken
      }
      index.lastSyncTime = new Date().toISOString()
      await cache.set(`index:${rootFolderId}`, index)
      const reportResult = await reportSyncChanges({
        warehouseName: options.warehouseName,
        rootFolderId,
        events: result.events,
      })

      return {
        success: true,
        changesProcessed: changes.length,
        foldersUpdated: result.foldersUpdated,
        filesAdded: result.filesAdded,
        filesRemoved: result.filesRemoved,
        report: reportResult,
        newStartPageToken: newStartPageToken || nextPageToken,
      }
    } catch (error) {
      console.error('Incremental sync error:', error)
      return {
        success: false,
        changesProcessed: 0,
        foldersUpdated: 0,
        filesAdded: 0,
        filesRemoved: 0,
        newStartPageToken: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async processChanges(index, changes) {
    let foldersUpdated = 0
    let filesAdded = 0
    let filesRemoved = 0
    const events = []

    const foldersToUpdate = new Set()

    for (const change of changes) {
      const { fileId, removed, file } = change

      if (removed) {
        if (index.files[fileId]) {
          const removedFile = this.removeFileFromIndex(index, fileId)
          const deletedFolderId = removedFile?.folderId || null
          if (deletedFolderId) {
            foldersToUpdate.add(deletedFolderId)
          }
          if (removedFile) {
            const folderPath = index.folders[removedFile.folderId]?.path || ''
            events.push({
              timestamp: new Date().toISOString(),
              action: 'Cikarildi',
              itemType: 'Dosya',
              name: removedFile.name,
              path: folderPath ? `${folderPath}/${removedFile.name}` : removedFile.name,
            })
          }
          filesRemoved++
        } else if (index.folders[fileId]) {
          const removedFolder = index.folders[fileId]
          const parentId = removedFolder?.parentId || null
          events.push({
            timestamp: new Date().toISOString(),
            action: 'Cikarildi',
            itemType: 'Klasor',
            name: removedFolder?.name || fileId,
            path: removedFolder?.path || '',
          })
          this.removeFolderFromIndex(index, fileId)
          if (parentId) {
            foldersToUpdate.add(parentId)
          }
          foldersUpdated++
        }
        continue
      }

      if (!file) continue

      const parentId = file.parents?.[0] || null
      const isFolder = file.mimeType === 'application/vnd.google-apps.folder'

      if (isFolder) {
        const parentExists = parentId ? !!index.folders[parentId] : false
        const existingFolder = index.folders[fileId]

        if (!parentExists) {
          if (existingFolder && fileId !== index.rootFolderId) {
            const oldParentId = existingFolder.parentId
            this.removeFolderFromIndex(index, fileId)
            if (oldParentId) {
              foldersToUpdate.add(oldParentId)
            }
            foldersUpdated++
          }
          continue
        }

        if (!existingFolder) {
          try {
            const { folder, images } = await this.crawler.crawlSingleFolder(
              file.id,
              index.folders[parentId].path
            )
            folder.parentId = parentId
            index.folders[file.id] = folder

            const imageIds = []
            for (const img of images) {
              index.files[img.id] = img
              imageIds.push(img.id)
            }
            index.folderFiles[file.id] = imageIds

            if (!index.folders[parentId].children) {
              index.folders[parentId].children = []
            }
            if (!index.folders[parentId].children.includes(file.id)) {
              index.folders[parentId].children.push(file.id)
            }
            events.push({
              timestamp: new Date().toISOString(),
              action: 'Eklendi',
              itemType: 'Klasor',
              name: folder.name,
              path: folder.path,
            })
            foldersUpdated++
            filesAdded += images.length
            foldersToUpdate.add(parentId)
          } catch (error) {
            console.error(`Error crawling new folder ${file.id}:`, error)
          }
          continue
        }

        const parentChanged = existingFolder.parentId !== parentId
        const nameChanged = existingFolder.name !== file.name

        if (parentChanged) {
          const oldParentId = existingFolder.parentId
          if (oldParentId && index.folders[oldParentId]?.children) {
            index.folders[oldParentId].children = index.folders[
              oldParentId
            ].children.filter((id) => id !== file.id)
            foldersToUpdate.add(oldParentId)
          }

          if (!index.folders[parentId].children) {
            index.folders[parentId].children = []
          }
          if (!index.folders[parentId].children.includes(file.id)) {
            index.folders[parentId].children.push(file.id)
          }
          existingFolder.parentId = parentId
          foldersToUpdate.add(parentId)
        }

        if (nameChanged) {
          existingFolder.name = file.name
        }

        if (parentChanged || nameChanged) {
          this.updateFolderPath(index, file.id, index.folders[parentId].path)
        }

        foldersUpdated++
        continue
      }

      const isImage = IMAGE_MIME_TYPES.includes(file.mimeType)

      if (!isImage) {
        const removedFile = this.removeFileFromIndex(index, fileId)
        if (removedFile?.folderId) {
          foldersToUpdate.add(removedFile.folderId)
          const folderPath = index.folders[removedFile.folderId]?.path || ''
          events.push({
            timestamp: new Date().toISOString(),
            action: 'Cikarildi',
            itemType: 'Dosya',
            name: removedFile.name,
            path: folderPath ? `${folderPath}/${removedFile.name}` : removedFile.name,
          })
          filesRemoved++
        }
        continue
      }

      if (!parentId || !index.folders[parentId]) {
        const removedFile = this.removeFileFromIndex(index, fileId)
        if (removedFile?.folderId) {
          foldersToUpdate.add(removedFile.folderId)
          const folderPath = index.folders[removedFile.folderId]?.path || ''
          events.push({
            timestamp: new Date().toISOString(),
            action: 'Cikarildi',
            itemType: 'Dosya',
            name: removedFile.name,
            path: folderPath ? `${folderPath}/${removedFile.name}` : removedFile.name,
          })
          filesRemoved++
        }
        continue
      }

      const driveImage = {
        id: file.id,
        name: file.name,
        folderId: parentId,
        mimeType: file.mimeType,
        modifiedTime: file.modifiedTime,
        thumbUrl: file.thumbnailLink || buildThumbnailUrl(file.id),
        viewUrl: file.webViewLink || buildViewUrl(file.id),
        size: file.size ? parseInt(file.size, 10) : undefined,
      }

      const existingFile = index.files[file.id]
      if (existingFile) {
        const oldParentId = existingFile.folderId
        index.files[file.id] = driveImage

        if (oldParentId !== parentId) {
          if (index.folderFiles[oldParentId]) {
            index.folderFiles[oldParentId] = index.folderFiles[oldParentId].filter(
              (id) => id !== file.id
            )
            foldersToUpdate.add(oldParentId)
          }

          if (!index.folderFiles[parentId]) {
            index.folderFiles[parentId] = []
          }
          if (!index.folderFiles[parentId].includes(file.id)) {
            index.folderFiles[parentId].push(file.id)
          }
        }
      } else {
        index.files[file.id] = driveImage
        if (!index.folderFiles[parentId]) {
          index.folderFiles[parentId] = []
        }
        if (!index.folderFiles[parentId].includes(file.id)) {
          index.folderFiles[parentId].push(file.id)
        }
        const folderPath = index.folders[parentId]?.path || ''
        events.push({
          timestamp: new Date().toISOString(),
          action: 'Eklendi',
          itemType: 'Dosya',
          name: driveImage.name,
          path: folderPath ? `${folderPath}/${driveImage.name}` : driveImage.name,
        })
        filesAdded++
      }
      foldersToUpdate.add(parentId)
    }

    for (const folderId of foldersToUpdate) {
      this.updateFolderMetadata(index, folderId)
      foldersUpdated++
    }

    return { foldersUpdated, filesAdded, filesRemoved, events }
  }

  removeFolderFromIndex(index, folderId) {
    const folder = index.folders[folderId]
    if (!folder) return

    if (folder.children) {
      for (const childId of folder.children) {
        this.removeFolderFromIndex(index, childId)
      }
    }

    const fileIds = index.folderFiles[folderId] || []
    for (const fileId of fileIds) {
      delete index.files[fileId]
    }
    delete index.folderFiles[folderId]

    if (folder.parentId && index.folders[folder.parentId]) {
      const parent = index.folders[folder.parentId]
      if (parent.children) {
        parent.children = parent.children.filter((id) => id !== folderId)
      }
    }

    delete index.folders[folderId]
  }

  updateFolderMetadata(index, folderId) {
    const folder = index.folders[folderId]
    if (!folder) return

    const fileIds = index.folderFiles[folderId] || []
    const files = fileIds.map((id) => index.files[id]).filter(Boolean)

    folder.imageCount = files.length

    if (files.length > 0) {
      const sorted = [...files].sort(
        (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
      )
      const cover = sorted[0]
      folder.coverFileId = cover.id
      folder.coverThumbUrl = cover.thumbUrl
      folder.lastModified = cover.modifiedTime
    } else {
      folder.coverFileId = null
      folder.coverThumbUrl = null
    }
  }

  removeFileFromIndex(index, fileId) {
    const existing = index.files[fileId]
    if (!existing) return null

    delete index.files[fileId]

    if (index.folderFiles[existing.folderId]) {
      index.folderFiles[existing.folderId] = index.folderFiles[
        existing.folderId
      ].filter((id) => id !== fileId)
    }

    return existing
  }

  updateFolderPath(index, folderId, parentPath) {
    const folder = index.folders[folderId]
    if (!folder) return

    const newPath = parentPath ? `${parentPath}/${folder.name}` : folder.name
    folder.path = newPath

    if (folder.children) {
      for (const childId of folder.children) {
        this.updateFolderPath(index, childId, newPath)
      }
    }
  }

  async checkSyncNeeded(rootFolderId, maxAge = 5 * 60 * 1000) {
    const cache = getCache()
    const index = await cache.get(`index:${rootFolderId}`)

    if (!index || !index.lastSyncTime) {
      return true
    }

    const lastSync = new Date(index.lastSyncTime).getTime()
    const now = Date.now()
    return now - lastSync > maxAge
  }
}

export function createSyncManager() {
  return new SyncManager()
}
