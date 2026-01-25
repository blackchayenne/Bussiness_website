'use client'

import { useEffect, useState } from 'react'
import { Folder, Image, Clock, Loader2 } from 'lucide-react'
import { normalizeFolderName } from '@/lib/warehouse/display'

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function FolderCard({ folder, onClick }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [sourceIndex, setSourceIndex] = useState(0)

  const extractFileId = (url) => {
    if (!url) return null
    const match = url.match(/\/d\/([^=?/]+)/)
    return match ? match[1] : null
  }

  const fileId = folder.coverFileId || extractFileId(folder.coverThumbUrl)
  const defaultPrimary = fileId
    ? `https://lh3.googleusercontent.com/d/${fileId}=w400-h300-c`
    : null
  const defaultFallback = fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
    : null

  const primaryUrl = folder.coverThumbUrl || defaultPrimary
  const fallbackUrl = folder.coverThumbUrl
    ? folder.coverThumbUrl === defaultPrimary
      ? defaultFallback
      : defaultPrimary
    : defaultFallback

  const proxyUrl = fileId ? `/api/drive/image/${fileId}?sz=600` : null
  const sources = [primaryUrl, proxyUrl, fallbackUrl].filter(Boolean)
  const coverUrl = sources[sourceIndex]

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setSourceIndex(0)
  }, [folder.id, fileId])

  const handleImageError = () => {
    const nextIndex = sourceIndex + 1
    if (nextIndex < sources.length) {
      setSourceIndex(nextIndex)
      setIsLoading(true)
    } else {
      setIsLoading(false)
      setHasError(true)
    }
  }

  return (
    <div
      onClick={() => onClick(folder.id)}
      className="group bg-white rounded-sm border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-md cursor-pointer transition-all duration-200"
    >
      <div className="aspect-video bg-stone-100 relative overflow-hidden">
        {coverUrl && !hasError ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-stone-400 animate-spin" />
              </div>
            )}
            <img
              src={coverUrl}
              alt={folder.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoading(false)}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Folder className="h-16 w-16 text-stone-300" />
          </div>
        )}

        {folder.imageCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-stone-900/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Image className="h-3 w-3" />
            {folder.imageCount}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-stone-900 truncate group-hover:text-stone-700">
          {normalizeFolderName(folder.name)}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
          <Clock className="h-3 w-3" />
          <span>{formatDate(folder.lastModified)}</span>
        </div>
      </div>
    </div>
  )
}
