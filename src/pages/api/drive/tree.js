import { DriveCrawler } from '@/lib/drive/crawler'
import { getCache } from '@/lib/cache'
import { createDriveClient, isMockMode } from '@/lib/drive/client'
import { getMockIndex, buildMockFolderTree } from '@/lib/mock/data'
import { buildThumbnailUrl } from '@/lib/drive/parser'
import { logError, logInfo } from '@/lib/utils/logger'
import { checkRateLimit, getRateLimitHeaders, getClientId, RATE_LIMITS } from '@/lib/utils/rate-limit'
import { isValidFolderId } from '@/lib/utils/validators'

function findCoverFromChildren(index, childIds) {
  for (const childId of childIds) {
    const childFolder = index.folders[childId]
    if (!childFolder) continue

    const childImages = index.folderFiles[childId] || []
    if (childImages.length > 0) {
      return buildThumbnailUrl(childImages[0])
    }

    if (childFolder.children && childFolder.children.length > 0) {
      const grandchildCover = findCoverFromChildren(index, childFolder.children)
      if (grandchildCover) {
        return grandchildCover
      }
    }
  }
  return null
}

function buildFolderTree(index, folderId = index.rootFolderId) {
  const folder = index.folders[folderId]
  if (!folder) return null

  const children = []
  for (const childId of folder.children || []) {
    const childNode = buildFolderTree(index, childId)
    if (childNode) {
      children.push(childNode)
    }
  }

  children.sort((a, b) => a.name.localeCompare(b.name))

  let coverThumbUrl = folder.coverThumbUrl
  if (!coverThumbUrl && folder.children && folder.children.length > 0) {
    coverThumbUrl = findCoverFromChildren(index, folder.children)
  }

  let totalImageCount = folder.imageCount
  for (const child of children) {
    totalImageCount += child.imageCount
  }

  return {
    id: folder.id,
    name: folder.name,
    path: folder.path,
    imageCount: totalImageCount,
    coverThumbUrl,
    lastModified: folder.lastModified,
    children,
  }
}

function removeFolderFromIndex(index, folderId) {
  const folder = index.folders[folderId]
  if (!folder) return

  if (folder.children) {
    for (const childId of folder.children) {
      removeFolderFromIndex(index, childId)
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

async function validateAndCleanIndex(index) {
  const client = createDriveClient()
  const start = Date.now()
  let totalRemoved = 0

  const parentFolders = Object.values(index.folders).filter(
    (f) => f.children && f.children.length > 0
  )

  for (const parent of parentFolders) {
    if (!parent.children || parent.children.length === 0) continue

    try {
      const actualChildren = await client.listAllChildren(parent.id, {
        onlyFolders: true,
        maxResults: 10000,
      })

      const actualChildIds = new Set(actualChildren.map((c) => c.id))
      const cachedChildIds = parent.children
      const ghostChildIds = cachedChildIds.filter((id) => !actualChildIds.has(id))

      for (const ghostId of ghostChildIds) {
        removeFolderFromIndex(index, ghostId)
        totalRemoved++
      }

      parent.children = cachedChildIds.filter((id) => actualChildIds.has(id))
    } catch (error) {
      console.error(`Error validating children of ${parent.id}:`, error)
      if (parent.id !== index.rootFolderId) {
        removeFolderFromIndex(index, parent.id)
        totalRemoved++
      }
    }
  }

  if (totalRemoved > 0) {
    await logInfo('Live validation completed (parent-child check)', {
      totalParentsChecked: parentFolders.length,
      removedGhostFolders: totalRemoved,
      durationMs: Date.now() - start,
    })
  }

  return { index, removedCount: totalRemoved }
}

async function reconcileRootChildren(index) {
  const rootId = index.rootFolderId
  const rootFolder = index.folders[rootId]
  if (!rootFolder) {
    return index
  }

  const client = createDriveClient()
  const crawler = new DriveCrawler(client)

  const start = Date.now()
  const subfolders = await client.listAllChildren(rootId, {
    onlyFolders: true,
    maxResults: 10000,
  })

  const existingChildren = new Set(rootFolder.children || [])
  const currentChildren = []

  for (const subfolder of subfolders) {
    currentChildren.push(subfolder.id)
    const existing = index.folders[subfolder.id]
    if (existing) {
      existing.name = subfolder.name
      existing.parentId = rootId
      existing.path = `${rootFolder.path}/${subfolder.name}`
      existingChildren.delete(subfolder.id)
    } else {
      const { folder, images } = await crawler.crawlSingleFolder(
        subfolder.id,
        rootFolder.path
      )
      folder.parentId = rootId
      index.folders[subfolder.id] = folder

      const imageIds = []
      for (const img of images) {
        index.files[img.id] = img
        imageIds.push(img.id)
      }
      index.folderFiles[subfolder.id] = imageIds
    }
  }

  for (const staleId of existingChildren) {
    removeFolderFromIndex(index, staleId)
  }

  rootFolder.children = currentChildren
  await logInfo('Reconcile root children', {
    rootId,
    fetched: subfolders.length,
    removed: existingChildren.size,
    durationMs: Date.now() - start,
  })
  return index
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const folderId = req.query.folderId
    const forceRefresh = req.query.refresh === 'true'

    const clientId = getClientId(req)
    const rateLimit = checkRateLimit(`tree:${clientId}`, RATE_LIMITS.tree)

    if (!rateLimit.allowed) {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString())
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toString())
      res.setHeader('Retry-After', Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString())
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    if (!folderId || !isValidFolderId(folderId)) {
      return res.status(400).json({ error: 'Invalid folder ID' })
    }

    if (isMockMode()) {
      const mockIndex = getMockIndex()
      const tree = buildMockFolderTree(mockIndex, 'mock-root')
      return res.status(200).json({
        tree,
        totalFolders: Object.keys(mockIndex.folders).length,
        totalImages: Object.keys(mockIndex.files).length,
        lastSyncTime: mockIndex.lastSyncTime,
        mock: true,
      })
    }

    try {
      const cache = getCache()
      let index = await cache.get(`index:${folderId}`)
      let indexModified = false

      if (!index) {
        const crawler = new DriveCrawler()
        index = await crawler.crawl(folderId)
        indexModified = true
      } else if (forceRefresh) {
        index = await reconcileRootChildren(index)
        const { index: validatedIndex, removedCount } = await validateAndCleanIndex(index)
        index = validatedIndex
        if (removedCount > 0) {
          await logInfo('Ghost folders removed on refresh', { removedCount })
        }
        indexModified = true
      }

      if (indexModified) {
        index.lastSyncTime = new Date().toISOString()
        await cache.set(`index:${folderId}`, index)
      }

      const tree = buildFolderTree(index)
      return res.status(200).json({
        tree,
        rootFolderId: index.rootFolderId,
        totalFolders: Object.keys(index.folders).length,
        totalImages: Object.keys(index.files).length,
        lastSyncTime: index.lastSyncTime,
      })
    } catch (error) {
      console.error('Tree error:', error)
      await logError('Tree error', {
        folderId,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      const message = error instanceof Error ? error.message : 'Failed to load folder tree'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method === 'POST') {
    const clientId = getClientId(req)
    const rateLimit = checkRateLimit(`tree:${clientId}`, RATE_LIMITS.tree)

    if (!rateLimit.allowed) {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString())
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toString())
      res.setHeader('Retry-After', Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString())
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    const { folderId } = req.body || {}
    if (!folderId || !isValidFolderId(folderId)) {
      return res.status(400).json({ error: 'Invalid folder ID' })
    }

    if (isMockMode()) {
      return res.status(200).json({
        success: true,
        message: 'Mock mode - no crawl needed',
        mock: true,
      })
    }

    try {
      const crawler = new DriveCrawler()
      const index = await crawler.crawl(folderId)
      const cache = getCache()
      await cache.set(`index:${folderId}`, index)

      return res.status(200).json({
        success: true,
        totalFolders: Object.keys(index.folders).length,
        totalImages: Object.keys(index.files).length,
        lastSyncTime: index.lastSyncTime,
      })
    } catch (error) {
      console.error('Crawl error:', error)
      const message = error instanceof Error ? error.message : 'Failed to crawl folder'
      return res.status(500).json({ error: message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
