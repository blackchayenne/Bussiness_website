'use client'

import { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Image } from 'lucide-react'
import { normalizeFolderName } from '@/lib/warehouse/display'

function TreeNode({ node, level, selectedFolderId, expandedIds, onToggle, onSelect }) {
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedFolderId === node.id
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-150 ${
          isSelected ? 'bg-marble-cream text-stone-900' : 'text-stone-700 hover:bg-stone-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className="p-0.5 hover:bg-stone-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-stone-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-stone-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {isSelected || isExpanded ? (
          <FolderOpen className="h-4 w-4 text-accent-gold flex-shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-stone-500 flex-shrink-0" />
        )}

        <span className="truncate text-sm font-medium flex-1">
          {normalizeFolderName(node.name)}
        </span>

        {node.imageCount > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-stone-500">
            <Image className="h-3 w-3" />
            {node.imageCount}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FolderTree({ tree, selectedFolderId, onFolderSelect }) {
  const [expandedIds, setExpandedIds] = useState(new Set())

  const handleToggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelect = useCallback(
    (id) => {
      onFolderSelect(id)
    },
    [onFolderSelect]
  )

  if (!tree) {
    return (
      <div className="p-4 text-stone-500 text-sm text-center">
        No folders loaded
      </div>
    )
  }

  return (
    <div className="py-2">
      <TreeNode
        node={tree}
        level={0}
        selectedFolderId={selectedFolderId}
        expandedIds={expandedIds}
        onToggle={handleToggle}
        onSelect={handleSelect}
      />
    </div>
  )
}
