'use client'

import { useCallback, useEffect, useState } from 'react'
import { Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImageCard({ image, onClick }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [sourceIndex, setSourceIndex] = useState(0)

  const defaultPrimary = `https://lh3.googleusercontent.com/d/${image.id}=w400-h400-c`
  const defaultFallback = `https://drive.google.com/thumbnail?id=${image.id}&sz=w400`

  const primaryUrl = image.thumbUrl || defaultPrimary
  const fallbackUrl = image.thumbUrl
    ? image.thumbUrl === defaultPrimary
      ? defaultFallback
      : defaultPrimary
    : defaultFallback

  const proxyUrl = `/api/drive/image/${image.id}?sz=400`
  const sources = [primaryUrl, proxyUrl, fallbackUrl].filter(Boolean)
  const thumbUrl = sources[sourceIndex]

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setSourceIndex(0)
  }, [image.id])

  const handleImageError = useCallback(() => {
    const nextIndex = sourceIndex + 1
    if (nextIndex < sources.length) {
      setSourceIndex(nextIndex)
      setIsLoading(true)
    } else {
      setIsLoading(false)
      setHasError(true)
    }
  }, [sourceIndex, sources.length])

  useEffect(() => {
    if (!isLoading || hasError) return
    const timeoutId = window.setTimeout(() => {
      handleImageError()
    }, 6000)
    return () => window.clearTimeout(timeoutId)
  }, [isLoading, hasError, handleImageError])

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-sm border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-md cursor-pointer transition-all duration-200"
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-stone-400 animate-spin" />
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-stone-300" />
          </div>
        ) : (
          <img
            src={thumbUrl}
            alt={image.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            onError={handleImageError}
          />
        )}

        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/30 transition-all duration-200 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
            View
          </span>
        </div>

        <a
          href={image.viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
        >
          <ExternalLink className="h-3.5 w-3.5 text-stone-600" />
        </a>
      </div>

      <div className="p-2">
        <p className="text-xs text-stone-800 truncate" title={image.name}>
          {image.name}
        </p>
        {image.size && (
          <p className="text-xs text-stone-500 mt-0.5">
            {formatFileSize(image.size)}
          </p>
        )}
      </div>
    </div>
  )
}
