'use client'

import { Image, ChevronLeft, ChevronRight } from 'lucide-react'
import ImageCard from './ImageCard'

export default function ImageGrid({
  images,
  pagination,
  onImageClick,
  onPageChange,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-sm border border-stone-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-stone-200" />
              <div className="p-2">
                <div className="h-3 bg-stone-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-500">
        <Image className="h-16 w-16 text-stone-300 mb-4" />
        <p>No images in this folder</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => onImageClick(image, index)}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-sm text-stone-500">
            Page {pagination.page} of {pagination.totalPages}
            <span className="text-stone-400 ml-2">
              ({pagination.totalItems} images)
            </span>
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
