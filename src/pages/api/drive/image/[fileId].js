import { isValidFolderId } from '@/lib/utils/validators'
import { logError } from '@/lib/utils/logger'

export default async function handler(req, res) {
  const { fileId } = req.query
  const sizeParam = req.query.sz
  const size = sizeParam ? parseInt(sizeParam, 10) : null

  if (!fileId || !isValidFolderId(fileId)) {
    return res.status(400).json({ error: 'Invalid file ID' })
  }

  let driveUrl = null
  let fallbackUrl = null

  if (size && size > 0) {
    driveUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (apiKey) {
    fallbackUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true&key=${apiKey}`
    if (!driveUrl) {
      driveUrl = fallbackUrl
    }
  }

  if (!driveUrl) {
    return res.status(500).json({ error: 'GOOGLE_DRIVE_API_KEY is not set' })
  }

  try {
    const response = await fetch(driveUrl, { headers: { Accept: 'image/*' } })

    if (!response.ok && fallbackUrl && driveUrl !== fallbackUrl) {
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: { Accept: 'image/*' },
      })

      if (!fallbackResponse.ok) {
        const message = await fallbackResponse.text().catch(() => fallbackResponse.statusText)
        await logError('Image proxy fetch failed', {
          fileId,
          status: fallbackResponse.status,
          message,
        })
        return res.status(fallbackResponse.status).json({ error: message || 'Failed to fetch image' })
      }

      const contentType = fallbackResponse.headers.get('content-type') || 'application/octet-stream'
      const cacheControl = fallbackResponse.headers.get('cache-control') || 'private, max-age=300'

      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', cacheControl)
      const buffer = Buffer.from(await fallbackResponse.arrayBuffer())
      return res.status(200).send(buffer)
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText)
      await logError('Image proxy fetch failed', {
        fileId,
        status: response.status,
        message,
      })
      return res.status(response.status).json({ error: message || 'Failed to fetch image' })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const cacheControl = response.headers.get('cache-control') || 'private, max-age=300'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', cacheControl)
    const buffer = Buffer.from(await response.arrayBuffer())
    return res.status(200).send(buffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch image'
    await logError('Image proxy error', { fileId, message })
    return res.status(500).json({ error: message })
  }
}
