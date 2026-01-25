// Google Drive types (JSDoc only)

/**
 * @typedef {Object} DriveFile
 * @property {string} id
 * @property {string} name
 * @property {string} mimeType
 * @property {string} modifiedTime
 * @property {string[]=} parents
 * @property {string=} thumbnailLink
 * @property {string=} webViewLink
 * @property {string=} iconLink
 * @property {string=} size
 */

/**
 * @typedef {Object} DriveFolder
 * @property {string} id
 * @property {string} name
 * @property {string|null} parentId
 * @property {string} path
 * @property {string|null} coverFileId
 * @property {string|null} coverThumbUrl
 * @property {number} imageCount
 * @property {string} lastModified
 * @property {string[]=} children
 */

/**
 * @typedef {Object} DriveImage
 * @property {string} id
 * @property {string} name
 * @property {string} folderId
 * @property {string} mimeType
 * @property {string} modifiedTime
 * @property {string} thumbUrl
 * @property {string} viewUrl
 * @property {number=} size
 */

/**
 * @typedef {Object} FolderTreeNode
 * @property {string} id
 * @property {string} name
 * @property {string} path
 * @property {number} imageCount
 * @property {string|null} coverThumbUrl
 * @property {string} lastModified
 * @property {FolderTreeNode[]} children
 * @property {boolean=} isExpanded
 */

/**
 * @typedef {Object} DriveIndex
 * @property {string} rootFolderId
 * @property {Object.<string, DriveFolder>} folders
 * @property {Object.<string, DriveImage>} files
 * @property {Object.<string, string[]>} folderFiles
 * @property {string|null} startPageToken
 * @property {string} lastSyncTime
 * @property {string} lastFullCrawlTime
 */

/**
 * @typedef {Object} SyncStatus
 * @property {string|null} lastSyncTime
 * @property {string|null} lastFullCrawlTime
 * @property {number} totalFolders
 * @property {number} totalImages
 * @property {boolean} isSyncing
 * @property {string|null} error
 */

/**
 * @typedef {Object} DriveApiResponse
 * @property {Array=} files
 * @property {string=} nextPageToken
 * @property {string=} newStartPageToken
 * @property {Array=} changes
 */

/**
 * @typedef {Object} DriveChange
 * @property {string} kind
 * @property {boolean} removed
 * @property {string} fileId
 * @property {DriveFile=} file
 * @property {string} changeType
 * @property {string} time
 */

/**
 * @typedef {Object} CrawlOptions
 * @property {number} maxDepth
 * @property {number} maxFolders
 * @property {number} maxFilesPerFolder
 * @property {boolean} includeImages
 */

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const DEFAULT_CRAWL_OPTIONS = {
  maxDepth: 10,
  maxFolders: 500,
  maxFilesPerFolder: 1000,
  includeImages: true,
}
