export class MemoryCache {
  constructor(maxSize = 1000) {
    this.store = new Map()
    this.maxSize = maxSize
  }

  async get(key) {
    const entry = this.store.get(key)
    if (!entry) return null

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.value
  }

  async set(key, value, ttl) {
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this.evictOldest()
    }

    const expiresAt = ttl ? Date.now() + ttl * 1000 : null
    this.store.set(key, { value, expiresAt })
  }

  async delete(key) {
    this.store.delete(key)
  }

  async has(key) {
    const entry = this.store.get(key)
    if (!entry) return false
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return false
    }
    return true
  }

  async clear() {
    this.store.clear()
  }

  async keys(pattern) {
    const allKeys = Array.from(this.store.keys())
    if (!pattern) return allKeys

    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    )
    return allKeys.filter((key) => regex.test(key))
  }

  evictOldest() {
    const firstKey = this.store.keys().next().value
    if (firstKey) {
      this.store.delete(firstKey)
    }
  }
}

let globalInstance = null

export function getMemoryCache() {
  if (!globalInstance) {
    globalInstance = new MemoryCache()
  }
  return globalInstance
}
