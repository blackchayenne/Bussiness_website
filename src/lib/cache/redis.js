export class RedisCache {
  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      throw new Error(
        'Redis cache requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables'
      )
    }

    this.baseUrl = url
    this.token = token
  }

  async request(command) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Redis error: ${error}`)
    }

    return response.json()
  }

  async get(key) {
    try {
      const { result } = await this.request(['GET', key])
      if (result === null) return null
      return JSON.parse(result)
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key, value, ttl) {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await this.request(['SET', key, serialized, 'EX', ttl.toString()])
      } else {
        await this.request(['SET', key, serialized])
      }
    } catch (error) {
      console.error('Redis SET error:', error)
      throw error
    }
  }

  async delete(key) {
    try {
      await this.request(['DEL', key])
    } catch (error) {
      console.error('Redis DEL error:', error)
    }
  }

  async has(key) {
    try {
      const { result } = await this.request(['EXISTS', key])
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  }

  async clear() {
    try {
      const keys = await this.keys('index:*')
      const syncKeys = await this.keys('sync:*')
      const allKeys = [...keys, ...syncKeys]
      if (allKeys.length > 0) {
        await this.request(['DEL', ...allKeys])
      }
    } catch (error) {
      console.error('Redis CLEAR error:', error)
    }
  }

  async keys(pattern) {
    try {
      const { result } = await this.request(['KEYS', pattern || '*'])
      return result || []
    } catch (error) {
      console.error('Redis KEYS error:', error)
      return []
    }
  }
}

export function isRedisConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
