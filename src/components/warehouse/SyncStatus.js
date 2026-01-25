'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

function formatRelativeTime(dateString) {
  if (!dateString) return 'Never'

  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

export default function SyncStatus({ rootId, onRefresh }) {
  const [status, setStatus] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStatus = async () => {
    if (!rootId) return

    try {
      const response = await fetch(`/api/drive/status?folderId=${rootId}`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [rootId])

  const handleRefresh = async () => {
    if (isRefreshing || !rootId) return

    setIsRefreshing(true)
    try {
      onRefresh?.(true)
      await fetchStatus()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!rootId) return null

  return (
    <div className="flex items-center gap-4 text-sm">
      {status && (
        <div className="flex items-center gap-4 text-stone-500">
          <span>{status.totalFolders} folders</span>
          <span>{status.totalImages} images</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {status?.isSyncing ? (
          <>
            <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
            <span className="text-stone-700">Syncing...</span>
          </>
        ) : status?.error ? (
          <>
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700">Sync issue</span>
          </>
        ) : status?.lastSyncTime ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-stone-500">
              Updated {formatRelativeTime(status.lastSyncTime)}
            </span>
          </>
        ) : null}
      </div>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1 px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors disabled:opacity-50"
        title="Refresh from Google Drive"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  )
}
