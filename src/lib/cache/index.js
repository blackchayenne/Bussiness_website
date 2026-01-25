let cacheInstance = null

export function getCache() {
  if (cacheInstance) return cacheInstance

  // Check if Redis is configured (preferred for production)
  const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  const isVercel = process.env.VERCEL === '1'

  // Priority: explicit CACHE_PROVIDER > Redis if configured > memory on Vercel > file locally
  let provider = process.env.CACHE_PROVIDER
  if (!provider) {
    if (hasRedis) {
      provider = 'redis'
    } else if (isVercel) {
      provider = 'memory'
    } else {
      provider = 'file'
    }
  }

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
