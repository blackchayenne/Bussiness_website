const store = new Map()

export const RATE_LIMITS = {
  resolve: { limit: 10, interval: 60 * 1000 },
  tree: { limit: 20, interval: 60 * 1000 },
  images: { limit: 60, interval: 60 * 1000 },
  sync: { limit: 2, interval: 60 * 1000 },
}

export function checkRateLimit(key, config) {
  const now = Date.now()
  const entry = store.get(key)

  if (store.size > 10000) {
    cleanupExpired()
  }

  if (!entry || now > entry.resetAt) {
    const newEntry = {
      count: 1,
      resetAt: now + config.interval,
    }
    store.set(key, newEntry)
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: newEntry.resetAt,
    }
  }

  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count++
  store.set(key, entry)

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  }
}

export function getRateLimitHeaders(result) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
    'Retry-After': result.allowed
      ? '0'
      : Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
  }
}

export function getClientId(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = req.headers['x-real-ip']
  if (realIp) {
    return realIp
  }

  return 'anonymous'
}

function cleanupExpired() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}
