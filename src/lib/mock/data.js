const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/img1/400/300',
  'https://picsum.photos/seed/img2/400/300',
  'https://picsum.photos/seed/img3/400/300',
  'https://picsum.photos/seed/img4/400/300',
  'https://picsum.photos/seed/img5/400/300',
  'https://picsum.photos/seed/img6/400/300',
  'https://picsum.photos/seed/img7/400/300',
  'https://picsum.photos/seed/img8/400/300',
  'https://picsum.photos/seed/img9/400/300',
  'https://picsum.photos/seed/img10/400/300',
]

function getPlaceholderImage(index) {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]
}

function generateMockImages(folderId, count, startIndex = 0) {
  const images = []
  const baseTime = new Date('2024-01-01')

  for (let i = 0; i < count; i++) {
    const index = startIndex + i
    const modifiedTime = new Date(
      baseTime.getTime() + index * 24 * 60 * 60 * 1000
    ).toISOString()

    images.push({
      id: `mock-image-${folderId}-${index}`,
      name: `Image ${index + 1}.jpg`,
      folderId,
      mimeType: 'image/jpeg',
      modifiedTime,
      thumbUrl: getPlaceholderImage(index),
      viewUrl: getPlaceholderImage(index),
      size: Math.floor(Math.random() * 5000000) + 100000,
    })
  }

  return images
}

export function generateMockFolders() {
  const folders = []
  const baseTime = new Date('2024-01-01')

  folders.push({
    id: 'mock-root',
    name: 'E-Warehouse Demo',
    parentId: null,
    path: 'E-Warehouse Demo',
    coverFileId: 'mock-image-mock-root-0',
    coverThumbUrl: getPlaceholderImage(0),
    imageCount: 5,
    lastModified: baseTime.toISOString(),
    children: ['mock-folder-1', 'mock-folder-2', 'mock-folder-3'],
  })

  const categories = [
    { id: 'mock-folder-1', name: 'Nature', imageCount: 12 },
    { id: 'mock-folder-2', name: 'Architecture', imageCount: 8 },
    { id: 'mock-folder-3', name: 'People', imageCount: 15 },
  ]

  categories.forEach((cat, catIndex) => {
    folders.push({
      id: cat.id,
      name: cat.name,
      parentId: 'mock-root',
      path: `E-Warehouse Demo/${cat.name}`,
      coverFileId: `mock-image-${cat.id}-0`,
      coverThumbUrl: getPlaceholderImage(catIndex * 10),
      imageCount: cat.imageCount,
      lastModified: new Date(
        baseTime.getTime() + catIndex * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      children: [`${cat.id}-sub1`, `${cat.id}-sub2`],
    })

    const subs = [
      { suffix: 'sub1', name: 'Favorites', imageCount: 6 },
      { suffix: 'sub2', name: 'Recent', imageCount: 4 },
    ]

    subs.forEach((sub, subIndex) => {
      folders.push({
        id: `${cat.id}-${sub.suffix}`,
        name: sub.name,
        parentId: cat.id,
        path: `E-Warehouse Demo/${cat.name}/${sub.name}`,
        coverFileId: `mock-image-${cat.id}-${sub.suffix}-0`,
        coverThumbUrl: getPlaceholderImage(catIndex * 10 + subIndex + 20),
        imageCount: sub.imageCount,
        lastModified: new Date(
          baseTime.getTime() + (catIndex * 2 + subIndex) * 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        children: [],
      })
    })
  })

  return folders
}

export function generateMockIndex() {
  const folders = generateMockFolders()
  const folderMap = {}
  const files = {}
  const folderFiles = {}

  folders.forEach((folder) => {
    folderMap[folder.id] = folder

    const images = generateMockImages(folder.id, folder.imageCount)
    const imageIds = []

    images.forEach((img) => {
      files[img.id] = img
      imageIds.push(img.id)
    })

    folderFiles[folder.id] = imageIds
  })

  return {
    rootFolderId: 'mock-root',
    folders: folderMap,
    files,
    folderFiles,
    startPageToken: 'mock-token-12345',
    lastSyncTime: new Date().toISOString(),
    lastFullCrawlTime: new Date().toISOString(),
  }
}

export function buildMockFolderTree(index, folderId = index.rootFolderId) {
  const folder = index.folders[folderId]
  if (!folder) return null

  const children = []
  for (const childId of folder.children || []) {
    const childNode = buildMockFolderTree(index, childId)
    if (childNode) {
      children.push(childNode)
    }
  }

  return {
    id: folder.id,
    name: folder.name,
    path: folder.path,
    imageCount: folder.imageCount,
    coverThumbUrl: folder.coverThumbUrl,
    lastModified: folder.lastModified,
    children,
  }
}

export function getMockSyncStatus() {
  return {
    lastSyncTime: new Date().toISOString(),
    lastFullCrawlTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    totalFolders: 10,
    totalImages: 50,
    isSyncing: false,
    error: null,
  }
}

let cachedMockIndex = null

export function getMockIndex() {
  if (!cachedMockIndex) {
    cachedMockIndex = generateMockIndex()
  }
  return cachedMockIndex
}

export function getMockFolderTree() {
  const index = getMockIndex()
  return buildMockFolderTree(index)
}

export function getMockFolderImages(folderId) {
  const index = getMockIndex()
  const fileIds = index.folderFiles[folderId] || []
  return fileIds.map((id) => index.files[id]).filter(Boolean)
}

export function getMockFolder(folderId) {
  const index = getMockIndex()
  return index.folders[folderId] || null
}

export function searchMockFolders(query) {
  const index = getMockIndex()
  const lowerQuery = query.toLowerCase()

  return Object.values(index.folders).filter(
    (folder) =>
      folder.name.toLowerCase().includes(lowerQuery) ||
      folder.path.toLowerCase().includes(lowerQuery)
  )
}

export function searchMockImages(query) {
  const index = getMockIndex()
  const lowerQuery = query.toLowerCase()

  return Object.values(index.files).filter((file) =>
    file.name.toLowerCase().includes(lowerQuery)
  )
}

export function isMockMode() {
  return !process.env.GOOGLE_DRIVE_API_KEY
}
