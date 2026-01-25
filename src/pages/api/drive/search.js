import { getCache } from '@/lib/cache'
import { isMockMode } from '@/lib/drive/client'
import { searchMockFolders, searchMockImages } from '@/lib/mock/data'
import { isValidFolderId, sanitizeSearchQuery } from '@/lib/utils/validators'

export default async function handler(req, res) {
  const query = req.query.q || ''
  const rootId = req.query.rootId
  const type = req.query.type || 'all'
  const limit = parseInt(req.query.limit || '50', 10)

  const sanitizedQuery = sanitizeSearchQuery(query)
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' })
  }

  if (isMockMode()) {
    const results = { folders: [], images: [] }
    if (type === 'all' || type === 'folders') {
      results.folders = searchMockFolders(sanitizedQuery).slice(0, limit)
    }
    if (type === 'all' || type === 'images') {
      results.images = searchMockImages(sanitizedQuery).slice(0, limit)
    }

    return res.status(200).json({
      query: sanitizedQuery,
      results,
      totalFolders: results.folders.length,
      totalImages: results.images.length,
      mock: true,
    })
  }

  if (!rootId || !isValidFolderId(rootId)) {
    return res.status(400).json({ error: 'Root folder ID required' })
  }

  try {
    const cache = getCache()
    const index = await cache.get(`index:${rootId}`)
    if (!index) {
      return res.status(404).json({ error: 'Index not found. Load the folder first.' })
    }

    const lowerQuery = sanitizedQuery.toLowerCase()
    const results = { folders: [], images: [] }

    if (type === 'all' || type === 'folders') {
      results.folders = Object.values(index.folders)
        .filter(
          (folder) =>
            folder.name.toLowerCase().includes(lowerQuery) ||
            folder.path.toLowerCase().includes(lowerQuery)
        )
        .slice(0, limit)
        .map((folder) => ({
          id: folder.id,
          name: folder.name,
          path: folder.path,
          imageCount: folder.imageCount,
          coverThumbUrl: folder.coverThumbUrl,
        }))
    }

    if (type === 'all' || type === 'images') {
      results.images = Object.values(index.files)
        .filter((file) => file.name.toLowerCase().includes(lowerQuery))
        .slice(0, limit)
        .map((file) => ({
          id: file.id,
          name: file.name,
          folderId: file.folderId,
          thumbUrl: file.thumbUrl,
        }))
    }

    return res.status(200).json({
      query: sanitizedQuery,
      results,
      totalFolders: results.folders.length,
      totalImages: results.images.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    const message = error instanceof Error ? error.message : 'Search failed'
    return res.status(500).json({ error: message })
  }
}
