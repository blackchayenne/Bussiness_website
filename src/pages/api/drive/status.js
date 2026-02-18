import { getCache } from '@/lib/cache'
import { isMockMode } from '@/lib/drive/client'
import { getMockSyncStatus, getMockIndex } from '@/lib/mock/data'
import { SyncManager } from '@/lib/drive/sync'
import { getEnabledDrives } from '@/lib/config/manager'
import { logError, logInfo } from '@/lib/utils/logger'
import { isValidFolderId } from '@/lib/utils/validators'

const AUTO_SYNC_MAX_AGE_MS = 30 * 60 * 1000

export default async function handler(req, res) {
  const folderId = req.query.folderId

  if (!folderId || !isValidFolderId(folderId)) {
    return res.status(400).json({ error: 'Invalid folder ID' })
  }

  if (isMockMode()) {
    const mockStatus = getMockSyncStatus()
    const mockIndex = getMockIndex()
    return res.status(200).json({
      ...mockStatus,
      totalFolders: Object.keys(mockIndex.folders).length,
      totalImages: Object.keys(mockIndex.files).length,
      mock: true,
    })
  }

  try {
    const cache = getCache()
    let index = await cache.get(`index:${folderId}`)

    if (!index) {
      return res.status(200).json({
        lastSyncTime: null,
        lastFullCrawlTime: null,
        totalFolders: 0,
        totalImages: 0,
        isSyncing: false,
        error: 'Index not found. Load the folder first.',
      })
    }

    let syncError = null

    try {
      const syncManager = new SyncManager()
      const needsSync = await syncManager.checkSyncNeeded(folderId, AUTO_SYNC_MAX_AGE_MS)

      if (needsSync) {
        const enabledDrives = await getEnabledDrives()
        const drive = enabledDrives.find((d) => d.folderId === folderId)
        const result = await syncManager.incrementalSync(folderId, {
          warehouseName: drive?.name,
        })
        if (!result.success) {
          syncError = result.error || 'Sync failed'
          await logError('Auto sync failed', { folderId, error: result.error })
        } else {
          const updatedIndex = await cache.get(`index:${folderId}`)
          if (updatedIndex) {
            index = updatedIndex
          }
          await logInfo('Auto sync completed', {
            folderId,
            changesProcessed: result.changesProcessed,
          })
        }
      }
    } catch (error) {
      syncError = error instanceof Error ? error.message : 'Sync failed'
      await logError('Auto sync error', { folderId, message: syncError })
    }

    return res.status(200).json({
      lastSyncTime: index.lastSyncTime,
      lastFullCrawlTime: index.lastFullCrawlTime,
      totalFolders: Object.keys(index.folders).length,
      totalImages: Object.keys(index.files).length,
      isSyncing: false,
      error: syncError,
    })
  } catch (error) {
    console.error('Status error:', error)
    await logError('Status error', {
      folderId,
      message: error instanceof Error ? error.message : 'Failed to get status',
    })
    const message = error instanceof Error ? error.message : 'Failed to get status'
    return res.status(500).json({ error: message })
  }
}
