import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Menu, X, AlertTriangle, Database } from 'lucide-react'
import FolderTree from '@/components/warehouse/FolderTree'
import FolderGrid from '@/components/warehouse/FolderGrid'
import ImageGrid from '@/components/warehouse/ImageGrid'
import Lightbox from '@/components/warehouse/Lightbox'
import SearchFilter from '@/components/warehouse/SearchFilter'
import SyncStatus from '@/components/warehouse/SyncStatus'
import Breadcrumb from '@/components/warehouse/Breadcrumb'

export default function WarehousePage() {
  const [drives, setDrives] = useState([])
  const [isLoadingDrives, setIsLoadingDrives] = useState(true)
  const [rootFolderId, setRootFolderId] = useState(null)
  const [tree, setTree] = useState(null)
  const [isLoadingTree, setIsLoadingTree] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState([])
  const [childFolders, setChildFolders] = useState([])
  const [images, setImages] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState(null)
  const [isMock, setIsMock] = useState(false)
  const [folderToDriveMap, setFolderToDriveMap] = useState({})

  const loadAllDrives = useCallback(async () => {
    setIsLoadingDrives(true)
    try {
      const configRes = await fetch('/api/drive/config', { cache: 'no-store' })
      const configData = await configRes.json()

      if (!configRes.ok) {
        console.error('Failed to load config:', configData.error)
        setIsLoadingDrives(false)
        return
      }

      const configDrives = configData.config?.drives || []
      const driveIndex = configData.index?.drives || {}

      const enabledDrives = configDrives
        .map((d) => ({
          id: d.id,
          name: d.name,
          folderId: d.folderId || driveIndex[d.id]?.folderId,
          enabled: d.enabled,
        }))
        .filter((d) => d.enabled && d.folderId)

      if (enabledDrives.length === 0) {
        setIsLoadingDrives(false)
        return
      }

      const initialDrives = enabledDrives.map((d) => ({
        id: d.id,
        name: d.name,
        folderId: d.folderId,
        tree: null,
        isLoading: true,
      }))
      setDrives(initialDrives)

      const treePromises = enabledDrives.map(async (d) => {
        try {
          const res = await fetch(`/api/drive/tree?folderId=${d.folderId}`)
          const data = await res.json()
          return { folderId: d.folderId, tree: data.tree, error: null }
        } catch (err) {
          return { folderId: d.folderId, tree: null, error: err }
        }
      })

      const results = await Promise.all(treePromises)

      setDrives((prev) =>
        prev.map((drive) => {
          const result = results.find((r) => r.folderId === drive.folderId)
          return {
            ...drive,
            tree: result?.tree || null,
            isLoading: false,
          }
        })
      )

      const loadedTrees = results.filter((r) => r.tree).map((r) => r.tree)
      if (loadedTrees.length > 0) {
        const mergedTree = {
          id: 'merged-root',
          name: 'All Warehouses',
          path: '',
          imageCount: loadedTrees.reduce((sum, t) => sum + t.imageCount, 0),
          coverThumbUrl: loadedTrees[0]?.coverThumbUrl || null,
          lastModified: new Date().toISOString(),
          children: loadedTrees,
        }
        setTree(mergedTree)

        // Build folder-to-drive lookup map for O(1) access
        const driveMap = {}
        for (const result of results) {
          if (!result.tree) continue
          const drive = enabledDrives.find((d) => d.folderId === result.folderId)
          if (!drive) continue
          const buildMap = (node) => {
            driveMap[node.id] = drive.folderId
            for (const child of node.children || []) {
              buildMap(child)
            }
          }
          buildMap(result.tree)
        }
        setFolderToDriveMap(driveMap)

        setRootFolderId(enabledDrives[0].folderId)
        setSelectedFolderId(loadedTrees[0]?.id || null)
      }
    } catch (err) {
      console.error('Failed to load drives:', err)
    } finally {
      setIsLoadingDrives(false)
    }
  }, [])

  const loadTree = useCallback(async (folderId, forceRefresh = false) => {
    setIsLoadingTree(true)
    setError(null)

    try {
      const refreshParam = forceRefresh ? '&refresh=true' : ''
      const response = await fetch(`/api/drive/tree?folderId=${folderId}${refreshParam}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load folder tree')
      }

      setTree(data.tree)
      setIsMock(data.mock || false)

      const actualRootId = data.rootFolderId || folderId
      setRootFolderId(actualRootId)

      if (data.tree) {
        setSelectedFolderId(data.tree.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folder tree')
    } finally {
      setIsLoadingTree(false)
    }
  }, [])

  const loadFolderContent = useCallback(
    async (folderId, page = 1) => {
      if (!rootFolderId) return

      setIsLoadingContent(true)
      setError(null)

      try {
        const [folderRes, imagesRes] = await Promise.all([
          fetch(`/api/drive/folders/${folderId}?rootId=${rootFolderId}`),
          fetch(`/api/drive/folders/${folderId}/images?rootId=${rootFolderId}&page=${page}&pageSize=50`),
        ])

        const folderData = await folderRes.json()
        const imagesData = await imagesRes.json()

        if (!folderRes.ok) {
          throw new Error(folderData.error || 'Failed to load folder')
        }

        setChildFolders(folderData.childFolders || [])
        setImages(imagesData.images || [])
        setPagination(imagesData.pagination || null)

        buildBreadcrumbPath(folderId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load folder content')
      } finally {
        setIsLoadingContent(false)
      }
    },
    [rootFolderId, tree]
  )

  const buildBreadcrumbPath = useCallback(
    (targetId) => {
      if (!tree) return

      const path = []

      const findPath = (node, currentPath) => {
        const newPath = [...currentPath, node]

        if (node.id === targetId) {
          path.push(
            ...newPath.map((n) => ({
              id: n.id,
              name: n.name,
              parentId: null,
              path: n.path,
              coverFileId: null,
              coverThumbUrl: n.coverThumbUrl,
              imageCount: n.imageCount,
              lastModified: n.lastModified,
            }))
          )
          return true
        }

        for (const child of node.children || []) {
          if (findPath(child, newPath)) return true
        }

        return false
      }

      findPath(tree, [])
      setBreadcrumbPath(path)
    },
    [tree]
  )

  useEffect(() => {
    loadAllDrives()
  }, [loadAllDrives])

  useEffect(() => {
    if (selectedFolderId && rootFolderId) {
      setCurrentPage(1)
      loadFolderContent(selectedFolderId, 1)
    }
  }, [selectedFolderId, rootFolderId, loadFolderContent])

  const handleFolderSelect = (folderId) => {
    const driveFolderId = folderToDriveMap[folderId]
    if (driveFolderId) {
      setRootFolderId(driveFolderId)
    }
    setSelectedFolderId(folderId)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    if (selectedFolderId) {
      loadFolderContent(selectedFolderId, page)
    }
  }

  const handleImageClick = (image, index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handleSearchImageSelect = (image, folderId) => {
    setSelectedFolderId(folderId)
    setTimeout(() => {
      const index = images.findIndex((img) => img.id === image.id)
      if (index >= 0) {
        setLightboxIndex(index)
        setLightboxOpen(true)
      }
    }, 500)
  }

  const handleRefresh = (forceRefresh = false) => {
    if (rootFolderId) {
      loadTree(rootFolderId, forceRefresh)
    }
  }

  return (
    <>
      <Head>
        <title>E-Warehouse | Marble Professionals</title>
        <meta
          name="description"
          content="Warehouse browser for products and inventory."
        />
      </Head>

      <section className="pt-32 pb-10 bg-marble-cream">
        <div className="container-wide">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500">
                Internal Portal
              </p>
              <h1 className="mt-3 font-display text-display-sm text-stone-900">
                E-Warehouse
              </h1>
            </div>
            {isMock && (
              <span className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                Demo Mode
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="container-wide">
          <div className="border border-stone-200 bg-white rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-stone-100 rounded-lg lg:hidden"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <span className="text-sm font-medium text-stone-700">Warehouse Browser</span>
              </div>

              {rootFolderId && (
                <div className="flex items-center gap-4 flex-1 justify-end">
                  <SearchFilter
                    rootId={rootFolderId}
                    onFolderSelect={handleFolderSelect}
                    onImageSelect={handleSearchImageSelect}
                  />
                  <SyncStatus rootId={rootFolderId} onRefresh={handleRefresh} />
                </div>
              )}
            </div>

            <div className="flex min-h-[600px] relative">
              {(rootFolderId || drives.length > 0) && (
                <aside
                  className={`bg-white border-r border-stone-200 w-72 flex-shrink-0 overflow-y-auto transition-all duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                  } fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto top-[57px] lg:top-0`}
                >
                  <div className="p-3">
                    {drives.map((drive) => (
                      <div key={drive.id} className="mb-4">
                        <div className="px-3 py-2 text-sm font-semibold text-stone-900 bg-stone-50 rounded-sm mb-1 flex items-center gap-2 border border-stone-200">
                          <Database className="h-4 w-4 text-accent-gold" />
                          <span className="leading-tight">{drive.name}</span>
                          {drive.isLoading && (
                            <span className="ml-auto">
                              <div className="animate-spin h-3 w-3 border-2 border-stone-400 border-t-transparent rounded-full" />
                            </span>
                          )}
                        </div>
                        {drive.tree && (
                          <FolderTree
                            tree={drive.tree}
                            selectedFolderId={selectedFolderId}
                            onFolderSelect={handleFolderSelect}
                          />
                        )}
                      </div>
                    ))}

                    {drives.length === 0 && tree && (
                      <>
                        <h2 className="px-2 py-1 text-xs font-medium text-stone-500 uppercase">
                          Folders
                        </h2>
                        <FolderTree
                          tree={tree}
                          selectedFolderId={selectedFolderId}
                          onFolderSelect={handleFolderSelect}
                        />
                      </>
                    )}
                  </div>
                </aside>
              )}

              {sidebarOpen && rootFolderId && (
                <div
                  className="fixed inset-0 bg-black/20 z-30 lg:hidden top-[57px]"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              <main className="flex-1 overflow-y-auto">
                {isLoadingDrives ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-stone-400 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-stone-500">Loading warehouses...</p>
                    </div>
                  </div>
                ) : !rootFolderId && drives.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="max-w-xl w-full text-center">
                      <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">
                        Warehouse not configured
                      </h2>
                      <p className="text-stone-600 mb-6">
                        Add Drive links in config/drives.json to load folders.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 lg:p-6">
                    {breadcrumbPath.length > 0 && (
                      <div className="mb-4">
                        <Breadcrumb path={breadcrumbPath} onNavigate={handleFolderSelect} />
                      </div>
                    )}

                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                      </div>
                    )}

                    {isLoadingTree && (
                      <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-4 border-stone-400 border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="text-stone-500">Loading folder structure...</p>
                        </div>
                      </div>
                    )}

                    {!isLoadingTree && selectedFolderId && (
                      <div className="space-y-8">
                        {childFolders.length > 0 && (
                          <section>
                            <h2 className="text-lg font-semibold text-stone-900 mb-4">
                              Folders ({childFolders.length})
                            </h2>
                            <FolderGrid
                              folders={childFolders}
                              onFolderClick={handleFolderSelect}
                              isLoading={isLoadingContent}
                            />
                          </section>
                        )}

                        <section>
                          <h2 className="text-lg font-semibold text-stone-900 mb-4">
                            Images {pagination && `(${pagination.totalItems})`}
                          </h2>
                          <ImageGrid
                            images={images}
                            pagination={pagination || undefined}
                            onImageClick={handleImageClick}
                            onPageChange={handlePageChange}
                            isLoading={isLoadingContent}
                          />
                        </section>
                      </div>
                    )}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </section>

      <Lightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  )
}
