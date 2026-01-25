import { getCache } from '@/lib/cache'
import { isMockMode } from '@/lib/drive/client'
import { getMockFolderImages } from '@/lib/mock/data'
import { checkRateLimit, getClientId, RATE_LIMITS } from '@/lib/utils/rate-limit'
import { isValidFolderId, isValidPage, isValidPageSize } from '@/lib/utils/validators'
import { DriveCrawler } from '@/lib/drive/crawler'

function sortImages(images, sortBy, sortOrder) {
  const sorted = [...images]

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        comparison = (a.size || 0) - (b.size || 0)
        break
      case 'modifiedTime':
      default:
        comparison = new Date(a.modifiedTime).getTime() - new Date(b.modifiedTime).getTime()
        break
    }

    return sortOrder === 'desc' ? -comparison : comparison
  })

  return sorted
}

export default async function handler(req, res) {
  const { folderId } = req.query
  const rootId = req.query.rootId
  const pageParam = req.query.page || '1'
  const pageSizeParam = req.query.pageSize || '50'
  const sortBy = req.query.sortBy || 'modifiedTime'
  const sortOrder = req.query.sortOrder || 'desc'

  const clientId = getClientId(req)
  const rateLimit = checkRateLimit(`images:${clientId}`, RATE_LIMITS.images)
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }

  if (!folderId || !isValidFolderId(folderId)) {
    return res.status(400).json({ error: 'Invalid folder ID' })
  }

  const page = parseInt(pageParam, 10)
  const pageSize = parseInt(pageSizeParam, 10)

  if (!isValidPage(page)) {
    return res.status(400).json({ error: 'Invalid page number' })
  }

  if (!isValidPageSize(pageSize, 100)) {
    return res.status(400).json({ error: 'Invalid page size (1-100)' })
  }

  if (isMockMode()) {
    const allImages = getMockFolderImages(folderId)
    const sorted = sortImages(allImages, sortBy, sortOrder)

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const images = sorted.slice(start, end)

    return res.status(200).json({
      images,
      pagination: {
        page,
        pageSize,
        totalItems: allImages.length,
        totalPages: Math.ceil(allImages.length / pageSize),
        hasNext: end < allImages.length,
        hasPrev: page > 1,
      },
      mock: true,
    })
  }

  try {
    if (!rootId || !isValidFolderId(rootId)) {
      return res.status(400).json({ error: 'Root folder ID required' })
    }

    const cache = getCache()
    let index = await cache.get(`index:${rootId}`)

    // Auto-load index if not in cache (handles serverless cold starts)
    if (!index) {
      const crawler = new DriveCrawler()
      index = await crawler.crawl(rootId)
      await cache.set(`index:${rootId}`, index)
    }

    const fileIds = index.folderFiles[folderId] || []
    const allImages = fileIds.map((id) => index.files[id]).filter(Boolean)
    const sorted = sortImages(allImages, sortBy, sortOrder)

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const images = sorted.slice(start, end)

    return res.status(200).json({
      images,
      pagination: {
        page,
        pageSize,
        totalItems: allImages.length,
        totalPages: Math.ceil(allImages.length / pageSize),
        hasNext: end < allImages.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Images error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get images'
    return res.status(500).json({ error: message })
  }
}
