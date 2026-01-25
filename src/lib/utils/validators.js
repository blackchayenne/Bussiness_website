export function isValidFolderId(id) {
  if (typeof id !== 'string') return false
  if (!id || id.length < 10 || id.length > 100) return false
  if (id === 'mock-root' || id.startsWith('mock-')) return true
  return /^[a-zA-Z0-9_-]+$/.test(id)
}

export function isValidDriveUrl(url) {
  if (typeof url !== 'string') return false
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

export function isValidSyncSecret(secret) {
  const expectedSecret = process.env.SYNC_SECRET
  if (!expectedSecret) {
    console.warn('SYNC_SECRET is not set')
    return false
  }
  return typeof secret === 'string' && secret === expectedSecret
}

export function isValidPage(page) {
  if (typeof page === 'string') {
    const num = parseInt(page, 10)
    return !isNaN(num) && num >= 1
  }
  return typeof page === 'number' && Number.isInteger(page) && page >= 1
}

export function isValidPageSize(size, maxSize = 100) {
  if (typeof size === 'string') {
    const num = parseInt(size, 10)
    return !isNaN(num) && num >= 1 && num <= maxSize
  }
  return (
    typeof size === 'number' &&
    Number.isInteger(size) &&
    size >= 1 &&
    size <= maxSize
  )
}

export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return ''
  return query.trim().slice(0, 100).replace(/[<>'"\\]/g, '')
}

export function validateEnvVars(required) {
  const missing = []
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }
  return {
    valid: missing.length === 0,
    missing,
  }
}
