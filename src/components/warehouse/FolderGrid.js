'use client'

import { Folder } from 'lucide-react'
import FolderCard from './FolderCard'

export default function FolderGrid({ folders, onFolderClick, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-sm border border-stone-200 overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-stone-200" />
            <div className="p-3">
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="mt-2 h-3 bg-stone-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-500">
        <Folder className="h-16 w-16 text-stone-300 mb-4" />
        <p>No subfolders found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} onClick={onFolderClick} />
      ))}
    </div>
  )
}
