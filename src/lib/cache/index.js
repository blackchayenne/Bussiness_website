let cacheInstance = null

export function getCache() {
  if (cacheInstance) return cacheInstance

  // Vercel has read-only filesystem, so default to memory there
  const isVercel = process.env.VERCEL === '1'
  const defaultProvider = isVercel ? 'memory' : 'file'
  const provider = process.env.CACHE_PROVIDER || defaultProvider

  switch (provider) {
    case 'redis': {
      const { RedisCache } = require('./redis')
      cacheInstance = new RedisCache()
      break
    }
    case 'file': {
      const { FileCache } = require('./file')
      cacheInstance = new FileCache()
      break
    }
    case 'memory':
    default: {
      const { MemoryCache } = require('./memory')
      cacheInstance = new MemoryCache()
      break
    }
  }

  return cacheInstance
}

export function resetCache() {
  cacheInstance = null
}

export function setCache(cache) {
  cacheInstance = cache
}
