/**
 * Parse a Google Drive URL and extract the folder/file ID.
 */
export function parseDriveUrl(url) {
  if (!url || typeof url !== 'string') {
    return { type: 'unknown', id: null, error: 'Invalid URL provided' }
  }

  const trimmedUrl = url.trim()

  if (!isGoogleDriveUrl(trimmedUrl)) {
    return { type: 'unknown', id: null, error: 'Not a valid Google Drive URL' }
  }

  try {
    const urlObj = new URL(trimmedUrl)

    const folderMatch = urlObj.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    if (folderMatch) {
      return { type: 'folder', id: validateFolderId(folderMatch[1]) }
    }

    const fileMatch = urlObj.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) {
      return {
        type: 'file',
        id: validateFolderId(fileMatch[1]),
        error: 'This is a file link, not a folder link. Please provide a folder link.',
      }
    }

    const idParam = urlObj.searchParams.get('id')
    if (idParam) {
      const validId = validateFolderId(idParam)
      if (urlObj.pathname.includes('folderview')) {
        return { type: 'folder', id: validId }
      }
      return { type: 'folder', id: validId }
    }

    const directIdMatch = urlObj.pathname.match(/\/([a-zA-Z0-9_-]{20,})\/?$/)
    if (directIdMatch) {
      return { type: 'folder', id: validateFolderId(directIdMatch[1]) }
    }

    return { type: 'unknown', id: null, error: 'Could not extract folder ID from URL' }
  } catch {
    return { type: 'unknown', id: null, error: 'Invalid URL format' }
  }
}

export function isGoogleDriveUrl(url) {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname === 'drive.google.com' ||
      urlObj.hostname === 'www.drive.google.com' ||
      urlObj.hostname === 'docs.google.com'
    )
  } catch {
    return false
  }
}

export function validateFolderId(id) {
  if (!id) return null
  const idPattern = /^[a-zA-Z0-9_-]{10,100}$/
  if (!idPattern.test(id)) return null
  return id
}

export function sanitizeFolderId(input) {
  if (!input || typeof input !== 'string') return null
  const sanitized = input.trim()
  if (sanitized.startsWith('http')) {
    const parsed = parseDriveUrl(sanitized)
    return parsed.id
  }
  return validateFolderId(sanitized)
}

export function buildThumbnailUrl(fileId, size = 400) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${size}-h${size}-c`
}

export function buildFullImageUrl(fileId) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w1920`
}

export function buildViewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view`
}

export function buildDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

export function buildFolderUrl(folderId) {
  return `https://drive.google.com/drive/folders/${folderId}`
}
