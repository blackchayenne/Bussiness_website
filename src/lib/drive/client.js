import { IMAGE_MIME_TYPES } from './types'

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'

export class DriveClient {
  constructor(config) {
    if (!config?.apiKey) {
      throw new Error('Google Drive API key is required')
    }
    this.apiKey = config.apiKey
  }

  async request(endpoint, params = {}) {
    const url = new URL(`${DRIVE_API_BASE}${endpoint}`)
    url.searchParams.set('key', this.apiKey)

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value)
      }
    }

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message = error.error?.message || response.statusText
      const code = error.error?.code || response.status

      if (code === 403) {
        throw new DriveApiError(
          'Access denied. Make sure the folder is shared publicly (Anyone with the link).',
          code
        )
      }
      if (code === 404) {
        throw new DriveApiError('Folder not found. Check the URL and make sure it exists.', code)
      }
      if (code === 429) {
        throw new DriveApiError('Rate limit exceeded. Please try again later.', code)
      }

      throw new DriveApiError(`Drive API error: ${message}`, code)
    }

    return response.json()
  }

  async getFile(fileId) {
    return this.request(`/files/${fileId}`, {
      fields: 'id,name,mimeType,modifiedTime,parents,thumbnailLink,webViewLink,iconLink,size',
      supportsAllDrives: 'true',
    })
  }

  async checkAccess(fileId) {
    try {
      const file = await this.getFile(fileId)
      return {
        accessible: true,
        isFolder: file.mimeType === 'application/vnd.google-apps.folder',
        name: file.name,
      }
    } catch (error) {
      if (error instanceof DriveApiError) {
        return { accessible: false, isFolder: false, name: '' }
      }
      throw error
    }
  }

  async listChildren(folderId, options = {}) {
    const { pageToken, pageSize = 100, onlyFolders, onlyImages } = options

    let query = `'${folderId}' in parents and trashed = false`

    if (onlyFolders) {
      query += ` and mimeType = 'application/vnd.google-apps.folder'`
    } else if (onlyImages) {
      const mimeConditions = IMAGE_MIME_TYPES.map(
        (mime) => `mimeType = '${mime}'`
      ).join(' or ')
      query += ` and (${mimeConditions})`
    }

    const params = {
      q: query,
      fields:
        'nextPageToken,files(id,name,mimeType,modifiedTime,parents,thumbnailLink,webViewLink,iconLink,size)',
      pageSize: pageSize.toString(),
      orderBy: 'modifiedTime desc',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    }

    if (pageToken) {
      params.pageToken = pageToken
    }

    return this.request('/files', params)
  }

  async listAllChildren(folderId, options = {}) {
    const { maxResults = 10000, ...listOptions } = options
    const allFiles = []
    let pageToken

    do {
      const response = await this.listChildren(folderId, {
        ...listOptions,
        pageToken,
        pageSize: Math.min(100, maxResults - allFiles.length),
      })

      if (response.files) {
        allFiles.push(...response.files)
      }

      pageToken = response.nextPageToken
    } while (pageToken && allFiles.length < maxResults)

    return allFiles
  }

  async getStartPageToken() {
    const response = await this.request('/changes/startPageToken', {
      supportsAllDrives: 'true',
    })
    return response.startPageToken
  }

  async listChanges(pageToken, options = {}) {
    const { pageSize = 100 } = options

    return this.request('/changes', {
      pageToken,
      pageSize: pageSize.toString(),
      fields:
        'nextPageToken,newStartPageToken,changes(kind,removed,fileId,file(id,name,mimeType,modifiedTime,parents,thumbnailLink,webViewLink,size),changeType,time)',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    })
  }

  async listAllChanges(pageToken, maxChanges = 1000) {
    const allChanges = []
    let currentToken = pageToken
    let newStartPageToken = null
    let nextPageToken = null

    do {
      const response = await this.listChanges(currentToken, {
        pageSize: Math.min(100, maxChanges - allChanges.length),
      })

      if (response.changes) {
        allChanges.push(...response.changes)
      }

      if (response.newStartPageToken) {
        newStartPageToken = response.newStartPageToken
        break
      }

      if (response.nextPageToken) {
        currentToken = response.nextPageToken
        nextPageToken = response.nextPageToken
      } else {
        break
      }
    } while (allChanges.length < maxChanges)

    return { changes: allChanges, newStartPageToken, nextPageToken }
  }
}

export class DriveApiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'DriveApiError'
    this.code = code
  }
}

export function createDriveClient() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey) {
    throw new Error(
      'GOOGLE_DRIVE_API_KEY environment variable is not set. Please set it in your .env.local file or Vercel environment variables.'
    )
  }
  return new DriveClient({ apiKey })
}

export function isMockMode() {
  return !process.env.GOOGLE_DRIVE_API_KEY
}

export async function validateFoldersExist(client, folderIds, concurrency = 5) {
  const validIds = new Set()

  for (let i = 0; i < folderIds.length; i += concurrency) {
    const batch = folderIds.slice(i, i + concurrency)
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        try {
          const result = await client.checkAccess(id)
          return { id, exists: result.accessible && result.isFolder }
        } catch {
          return { id, exists: false }
        }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.exists) {
        validIds.add(result.value.id)
      }
    }
  }

  return validIds
}
