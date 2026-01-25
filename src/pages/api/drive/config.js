import { readDrivesConfig, addDrive, removeDrive, updateDrive, updateSettings } from '@/lib/config/manager'
import { getCache } from '@/lib/cache'
import { isValidSyncSecret } from '@/lib/utils/validators'
import { checkRateLimit, getClientId, RATE_LIMITS } from '@/lib/utils/rate-limit'

export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const configData = await readDrivesConfig()
      const cache = getCache()

      const multiIndex = {
        drives: {},
        totalFolders: 0,
        totalImages: 0,
      }

      for (const drive of configData.drives) {
        if (!drive.folderId) continue

        const index = await cache.get(`index:${drive.folderId}`)
        multiIndex.drives[drive.id] = {
          config: drive,
          folderId: drive.folderId,
          folderCount: index ? Object.keys(index.folders).length : 0,
          imageCount: index ? Object.keys(index.files).length : 0,
          lastSyncTime: index?.lastSyncTime || null,
        }

        if (index) {
          multiIndex.totalFolders += Object.keys(index.folders).length
          multiIndex.totalImages += Object.keys(index.files).length
        }
      }

      return res.status(200).json({ config: configData, index: multiIndex })
    } catch (error) {
      console.error('Config GET error:', error)
      const message = error instanceof Error ? error.message : 'Failed to read config'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method === 'POST') {
    const secret = req.body?.secret || req.headers['x-sync-secret']
    if (!isValidSyncSecret(secret)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const clientId = getClientId(req)
    const rateLimit = checkRateLimit(`config:${clientId}`, RATE_LIMITS.sync)
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    try {
      const { id, name, url, enabled = true } = req.body || {}
      if (!id || !name || !url) {
        return res.status(400).json({ error: 'Missing required fields: id, name, url' })
      }
      const drive = await addDrive({ id, name, url, enabled })
      return res.status(200).json({ drive, message: 'Drive added successfully' })
    } catch (error) {
      console.error('Config POST error:', error)
      const message = error instanceof Error ? error.message : 'Failed to add drive'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method === 'PUT') {
    const secret = req.body?.secret || req.headers['x-sync-secret']
    if (!isValidSyncSecret(secret)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const clientId = getClientId(req)
    const rateLimit = checkRateLimit(`config:${clientId}`, RATE_LIMITS.sync)
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    try {
      const { type, driveId, updates, settings } = req.body || {}

      if (type === 'drive' && driveId) {
        const drive = await updateDrive(driveId, updates)
        if (!drive) {
          return res.status(404).json({ error: 'Drive not found' })
        }
        return res.status(200).json({ drive })
      }

      if (type === 'settings' && settings) {
        await updateSettings(settings)
        return res.status(200).json({ message: 'Settings updated' })
      }

      return res.status(400).json({ error: 'Invalid request' })
    } catch (error) {
      console.error('Config PUT error:', error)
      const message = error instanceof Error ? error.message : 'Failed to update'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method === 'DELETE') {
    const secret = req.query.secret || req.headers['x-sync-secret']
    if (!isValidSyncSecret(secret)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const clientId = getClientId(req)
    const rateLimit = checkRateLimit(`config:${clientId}`, RATE_LIMITS.sync)
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    try {
      const driveId = req.query.driveId
      if (!driveId) {
        return res.status(400).json({ error: 'Missing driveId parameter' })
      }
      await removeDrive(driveId)
      return res.status(200).json({ message: 'Drive removed successfully' })
    } catch (error) {
      console.error('Config DELETE error:', error)
      const message = error instanceof Error ? error.message : 'Failed to remove drive'
      return res.status(500).json({ error: message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
