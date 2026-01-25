import { getCache } from '@/lib/cache'
import { isMockMode } from '@/lib/drive/client'
import { getMockFolder } from '@/lib/mock/data'
import { buildThumbnailUrl } from '@/lib/drive/parser'
import { isValidFolderId } from '@/lib/utils/validators'

function findCoverImageInSubtree(index, startFolderId) {
  const stack = [startFolderId]
  let bestImage = null

  while (stack.length > 0) {
    const folderId = stack.pop()
    const fileIds = index.folderFiles[folderId] || []

    for (const fileId of fileIds) {
      const image = index.files[fileId]
      if (!image) continue

      if (!bestImage || image.modifiedTime > bestImage.modifiedTime) {
        bestImage = image
      }
    }

    const children = index.folders[folderId]?.children || []
    for (const childId of children) {
      stack.push(childId)
    }
  }

  return bestImage
}

export default async function handler(req, res) {
  const { folderId } = req.query
  const rootId = req.query.rootId

  if (!folderId || !isValidFolderId(folderId)) {
    return res.status(400).json({ error: 'Invalid folder ID' })
  }

  if (isMockMode()) {
    const folder = getMockFolder(folderId)
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' })
    }
    return res.status(200).json({ folder, mock: true })
  }

  try {
    if (!rootId || !isValidFolderId(rootId)) {
      return res.status(400).json({ error: 'Root folder ID required' })
    }

    const cache = getCache()
    const index = await cache.get(`index:${rootId}`)
    if (!index) {
      return res.status(404).json({ error: 'Index not found. Please load the folder tree first.' })
    }

    const folder = index.folders[folderId]
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found in index' })
    }

    const childFolders = []
    for (const childId of folder.children || []) {
      const child = index.folders[childId]
      if (child) {
        const childFolder = { ...child }
        if (!childFolder.coverThumbUrl) {
          const coverImage = findCoverImageInSubtree(index, childId)
          if (coverImage) {
            childFolder.coverFileId = coverImage.id
            childFolder.coverThumbUrl = buildThumbnailUrl(coverImage.id)
            childFolder.lastModified = coverImage.modifiedTime
          }
        }
        childFolders.push(childFolder)
      }
    }

    childFolders.sort((a, b) => a.name.localeCompare(b.name))

    return res.status(200).json({
      folder,
      childFolders,
      imageCount: index.folderFiles[folderId]?.length || 0,
    })
  } catch (error) {
    console.error('Folder error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get folder'
    return res.status(500).json({ error: message })
  }
}
