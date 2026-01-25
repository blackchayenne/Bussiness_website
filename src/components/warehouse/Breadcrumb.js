'use client'

import { ChevronRight, Home } from 'lucide-react'
import { normalizeFolderName } from '@/lib/warehouse/display'

export default function Breadcrumb({ path, onNavigate }) {
  if (!path || path.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      <button
        onClick={() => onNavigate(path[0].id)}
        className="flex items-center gap-1 px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors flex-shrink-0"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Root</span>
      </button>

      {path.slice(1).map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-stone-400 flex-shrink-0" />
          <button
            onClick={() => onNavigate(folder.id)}
            className={`px-2 py-1 rounded transition-colors truncate max-w-[150px] ${
              index === path.length - 2
                ? 'text-stone-900 font-medium'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title={folder.name}
          >
            {normalizeFolderName(folder.name)}
          </button>
        </div>
      ))}
    </nav>
  )
}
