'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Folder, Image, Loader2 } from 'lucide-react'
import { normalizeFolderName } from '@/lib/warehouse/display'

export default function SearchFilter({ rootId, onFolderSelect, onImageSelect }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!query || query.length < 2 || !rootId) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/drive/search?q=${encodeURIComponent(query)}&rootId=${rootId}&limit=20`
        )
        if (response.ok) {
          const data = await response.json()
          setResults(data.results)
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, rootId])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClear = () => {
    setQuery('')
    setResults(null)
    setIsOpen(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleFolderClick = (folderId) => {
    onFolderSelect(folderId)
    setIsOpen(false)
    setQuery('')
  }

  const handleImageClick = (image) => {
    onImageSelect(image, image.folderId)
    setIsOpen(false)
    setQuery('')
  }

  const hasResults =
    results && (results.folders.length > 0 || results.images.length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setIsOpen(true)}
          placeholder="Search folders and images..."
          className="w-full pl-9 pr-9 py-2 border border-stone-200 rounded-sm focus:ring-2 focus:ring-stone-400 focus:border-stone-400 text-sm text-stone-900 placeholder-stone-400 bg-white"
          disabled={!rootId}
        />
        {(query || isLoading) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-stone-400 animate-spin" />
            ) : (
              <X className="h-4 w-4 text-stone-400 hover:text-stone-600" />
            )}
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-sm shadow-lg max-h-96 overflow-auto z-50">
          {!hasResults && !isLoading && (
            <div className="p-4 text-sm text-stone-500 text-center">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {results?.folders && results.folders.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-stone-500 bg-stone-50">
                Folders ({results.folders.length})
              </div>
              {results.folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-stone-50 text-left transition-colors"
                >
                  <Folder className="h-4 w-4 text-stone-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-stone-900 truncate">
                      {normalizeFolderName(folder.name)}
                    </div>
                    <div className="text-xs text-stone-500 truncate">
                      {folder.path}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-stone-400 flex-shrink-0">
                    {folder.imageCount} images
                  </span>
                </button>
              ))}
            </div>
          )}

          {results?.images && results.images.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-stone-500 bg-stone-50">
                Images ({results.images.length})
              </div>
              {results.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-stone-50 text-left transition-colors"
                >
                  {image.thumbUrl ? (
                    <img
                      src={image.thumbUrl}
                      alt=""
                      className="h-8 w-8 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <Image className="h-4 w-4 text-stone-400 flex-shrink-0" />
                  )}
                  <div className="text-sm text-stone-900 truncate">
                    {image.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
