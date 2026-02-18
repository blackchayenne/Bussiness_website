import { SyncManager } from '@/lib/drive/sync'
import { getCache } from '@/lib/cache'
import { isMockMode } from '@/lib/drive/client'
import { getEnabledDrives } from '@/lib/config/manager'
import { logError, logInfo } from '@/lib/utils/logger'
import { isValidFolderId, isValidSyncSecret } from '@/lib/utils/validators'

export default async function handler(req, res) {
  const resolveWarehouseName = async (folderId) => {
    const enabledDrives = await getEnabledDrives()
    const match = enabledDrives.find((d) => d.folderId === folderId)
    return match?.name || null
  }

  if (req.method === 'POST') {
    try {
      const { secret, folderId, fullSync } = req.body || {}

      if (!isValidSyncSecret(secret)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (!folderId || !isValidFolderId(folderId)) {
        return res.status(400).json({ error: 'Invalid folder ID' })
      }

      if (isMockMode()) {
        return res.status(200).json({
          success: true,
          message: 'Mock mode - no sync needed',
          mock: true,
        })
      }

      const syncManager = new SyncManager()

      if (fullSync) {
        const index = await syncManager.fullSync(folderId)
        await logInfo('Full sync completed', {
          folderId,
          totalFolders: Object.keys(index.folders).length,
          totalImages: Object.keys(index.files).length,
        })
        return res.status(200).json({
          success: true,
          type: 'full',
          totalFolders: Object.keys(index.folders).length,
          totalImages: Object.keys(index.files).length,
          lastSyncTime: index.lastSyncTime,
        })
      }

      const warehouseName = await resolveWarehouseName(folderId)
      const result = await syncManager.incrementalSync(folderId, { warehouseName })

      if (!result.success) {
        await logError('Incremental sync failed', { folderId, error: result.error })
        return res.status(500).json({ error: result.error || 'Sync failed' })
      }

      await logInfo('Incremental sync completed', {
        folderId,
        changesProcessed: result.changesProcessed,
        foldersUpdated: result.foldersUpdated,
        filesAdded: result.filesAdded,
        filesRemoved: result.filesRemoved,
      })
      return res.status(200).json({
        success: true,
        type: 'incremental',
        changesProcessed: result.changesProcessed,
        foldersUpdated: result.foldersUpdated,
        filesAdded: result.filesAdded,
        filesRemoved: result.filesRemoved,
      })
    } catch (error) {
      console.error('Sync error:', error)
      await logError('Sync error', {
        message: error instanceof Error ? error.message : 'Sync failed',
      })
      const message = error instanceof Error ? error.message : 'Sync failed'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method === 'GET') {
    const secret = req.query.secret

    if (!isValidSyncSecret(secret)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (isMockMode()) {
      return res.status(200).json({
        success: true,
        message: 'Mock mode - no sync needed',
        mock: true,
      })
    }

    try {
      const enabledDrives = await getEnabledDrives()
      const driveIds = enabledDrives
        .filter((d) => d.folderId)
        .map((d) => d.folderId)

      const cache = getCache()
      const keys = await cache.keys('index:*')
      const cachedIds = keys.map((k) => k.replace('index_', '').replace('index:', ''))

      const allIds = Array.from(new Set([...driveIds, ...cachedIds]))

      if (allIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No indexes to sync',
          synced: 0,
        })
      }

      const syncManager = new SyncManager()
      const results = []

      for (const folderId of allIds) {
        const drive = enabledDrives.find((d) => d.folderId === folderId)

        try {
          const result = await syncManager.incrementalSync(folderId, {
            warehouseName: drive?.name,
          })
          await logInfo('Sync all folder completed', {
            folderId,
            name: drive?.name,
            changesProcessed: result.changesProcessed,
            success: result.success,
          })
          results.push({
            folderId,
            name: drive?.name,
            success: result.success,
            changes: result.changesProcessed,
            error: result.error,
          })
        } catch (error) {
          await logError('Sync all folder error', {
            folderId,
            name: drive?.name,
            message: error instanceof Error ? error.message : 'Unknown error',
          })
          results.push({
            folderId,
            name: drive?.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return res.status(200).json({
        success: true,
        synced: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      })
    } catch (error) {
      console.error('Sync all error:', error)
      const message = error instanceof Error ? error.message : 'Sync failed'
      return res.status(500).json({ error: message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
