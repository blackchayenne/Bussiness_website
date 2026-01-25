import { promises as fs } from 'fs'
import path from 'path'

export class FileCache {
  constructor(cacheDir) {
    this.cacheDir = cacheDir || path.join(process.cwd(), '.cache', 'drive')
    this.initialized = false
  }

  async ensureDir() {
    if (this.initialized) return

    try {
      await fs.mkdir(this.cacheDir, { recursive: true })
      this.initialized = true
    } catch (error) {
      console.error('Failed to create cache directory:', error)
      throw error
    }
  }

  getFilePath(key) {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
    return path.join(this.cacheDir, `${safeKey}.json`)
  }

  async get(key) {
    await this.ensureDir()
    try {
      const filePath = this.getFilePath(key)
      const data = await fs.readFile(filePath, 'utf-8')
      const entry = JSON.parse(data)

      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.delete(key)
        return null
      }

      return entry.value
    } catch {
      return null
    }
  }

  async set(key, value, ttl) {
    await this.ensureDir()
    const entry = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : null,
      createdAt: Date.now(),
    }
    const filePath = this.getFilePath(key)
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8')
  }

  async delete(key) {
    await this.ensureDir()
    try {
      const filePath = this.getFilePath(key)
      await fs.unlink(filePath)
    } catch {
      // ignore
    }
  }

  async has(key) {
    const value = await this.get(key)
    return value !== null
  }

  async clear() {
    await this.ensureDir()
    try {
      const files = await fs.readdir(this.cacheDir)
      await Promise.all(
        files
          .filter((f) => f.endsWith('.json'))
          .map((f) => fs.unlink(path.join(this.cacheDir, f)))
      )
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  async keys(pattern) {
    await this.ensureDir()
    try {
      const files = await fs.readdir(this.cacheDir)
      let keys = files
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''))

      if (pattern) {
        const safePattern = pattern.replace(/[^a-zA-Z0-9_\-\*\?]/g, '_')
        const regex = new RegExp(
          '^' + safePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
        )
        keys = keys.filter((key) => regex.test(key))
      }

      return keys
    } catch {
      return []
    }
  }
}
