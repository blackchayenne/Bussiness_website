'use client'

import { useEffect, useCallback, useState } from 'react'
import { X, ChevronLeft, ChevronRight, ExternalLink, Download, Loader2 } from 'lucide-react'

export default function Lightbox({ images, currentIndex, isOpen, onClose, onNavigate }) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [sourceIndex, setSourceIndex] = useState(0)

  const currentImage = images[currentIndex]
  const hasNext = currentIndex < images.length - 1
  const hasPrev = currentIndex > 0

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (hasPrev) onNavigate(currentIndex - 1)
          break
        case 'ArrowRight':
          if (hasNext) onNavigate(currentIndex + 1)
          break
      }
    },
    [onClose, onNavigate, currentIndex, hasNext, hasPrev]
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    setIsLoading(true)
    setImageError(false)
    setSourceIndex(0)
  }, [currentIndex])

  const buildLargeFromThumb = (url, size) => {
    if (!url) return null
    const sized =
      url.replace(/=s\d+(-[a-z]+)?/i, `=s${size}`) ||
      url.replace(/=w\d+-h\d+(-[a-z]+)?/i, `=w${size}-h${size}`)
    return sized === url ? url : sized
  }

  const proxyUrl = currentImage ? `/api/drive/image/${currentImage.id}?sz=1920` : null
  const primaryUrl = currentImage
    ? `https://lh3.googleusercontent.com/d/${currentImage.id}=w1920`
    : null
  const largeThumbUrl = currentImage
    ? buildLargeFromThumb(currentImage.thumbUrl, 1600)
    : null
  const downloadUrl = currentImage
    ? `https://drive.google.com/uc?export=download&id=${currentImage.id}`
    : null
  const fallbackUrl = currentImage
    ? `https://drive.google.com/thumbnail?id=${currentImage.id}&sz=w1920`
    : null

  const sources = [
    proxyUrl,
    largeThumbUrl,
    currentImage?.thumbUrl,
    primaryUrl,
    downloadUrl,
    fallbackUrl,
  ].filter(Boolean)
  const fullSizeUrl = sources[sourceIndex]

  const handleImageError = useCallback(() => {
    const nextIndex = sourceIndex + 1
    if (nextIndex < sources.length) {
      setSourceIndex(nextIndex)
      setIsLoading(true)
      return
    }

    setIsLoading(false)
    setImageError(true)
  }, [sourceIndex, sources.length])

  useEffect(() => {
    if (!isOpen || !currentImage) return
    if (!isLoading || sources.length === 0) return

    const timeoutId = window.setTimeout(() => {
      handleImageError()
    }, 8000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isOpen, currentImage, isLoading, sources.length, handleImageError])

  if (!isOpen || !currentImage) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-400">
            {currentIndex + 1} / {images.length}
          </span>
          <h3 className="text-lg font-medium truncate max-w-md">
            {currentImage.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={currentImage.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Open in Google Drive"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <a
            href={`https://drive.google.com/uc?export=download&id=${currentImage.id}`}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-16">
        <button
          onClick={() => hasPrev && onNavigate(currentIndex - 1)}
          disabled={!hasPrev}
          className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        <div className="relative max-w-full max-h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          )}
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-white p-8">
              <ExternalLink className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg mb-4">Image failed to load</p>
              <a
                href={currentImage.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-sm transition-colors"
              >
                Open in Google Drive
              </a>
            </div>
          ) : (
            <img
              src={fullSizeUrl}
              alt={currentImage.name}
              key={fullSizeUrl}
              className={`max-w-full max-h-[calc(100vh-160px)] object-contain transition-opacity duration-200 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoading(false)}
              onError={handleImageError}
            />
          )}
        </div>

        <button
          onClick={() => hasNext && onNavigate(currentIndex + 1)}
          disabled={!hasNext}
          className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="p-4 text-center text-sm text-stone-400">
        Use arrow keys to navigate • Press Esc to close
      </div>
    </div>
  )
}
