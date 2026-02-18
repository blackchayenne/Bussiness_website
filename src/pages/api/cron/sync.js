import { SyncManager } from '@/lib/drive/sync'
import { getEnabledDrives } from '@/lib/config/manager'
import { isMockMode } from '@/lib/drive/client'
import { logInfo, logError } from '@/lib/utils/logger'

export default async function handler(req, res) {
  // Verify this is a legitimate Vercel Cron request
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow SYNC_SECRET for manual triggers
    const syncSecret = req.query.secret || req.headers['x-sync-secret']
    if (syncSecret !== process.env.SYNC_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
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

    if (enabledDrives.length === 0) {
      await logInfo('Cron sync: No enabled drives found')
      return res.status(200).json({
        success: true,
        message: 'No enabled drives to sync',
        synced: 0,
      })
    }

    const syncManager = new SyncManager()
    const results = []

    for (const drive of enabledDrives) {
      if (!drive.folderId) continue

      try {
        const result = await syncManager.incrementalSync(drive.folderId, {
          warehouseName: drive.name,
        })
        await logInfo('Cron sync completed', {
          driveId: drive.id,
          driveName: drive.name,
          folderId: drive.folderId,
          success: result.success,
          changesProcessed: result.changesProcessed,
        })
        results.push({
          driveId: drive.id,
          name: drive.name,
          success: result.success,
          changes: result.changesProcessed,
          error: result.error,
        })
      } catch (error) {
        await logError('Cron sync error', {
          driveId: drive.id,
          driveName: drive.name,
          folderId: drive.folderId,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
        results.push({
          driveId: drive.id,
          name: drive.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    await logInfo('Cron sync batch completed', {
      totalDrives: enabledDrives.length,
      success: successCount,
      failed: failCount,
    })

    return res.status(200).json({
      success: true,
      synced: successCount,
      failed: failCount,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    await logError('Cron sync fatal error', {
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Sync failed',
    })
  }
}
