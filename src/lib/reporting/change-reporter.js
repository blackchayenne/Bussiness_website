const REPORT_WEBHOOK_URL = process.env.REPORT_WEBHOOK_URL?.trim()
const REPORT_WEBHOOK_SECRET = process.env.REPORT_WEBHOOK_SECRET?.trim()

function hasReporterConfig() {
  return !!REPORT_WEBHOOK_URL
}

function normalizeEvents(events, warehouseName, rootFolderId) {
  const warehouse = warehouseName || rootFolderId
  return events.map((event) => ({
    timestamp: event.timestamp || new Date().toISOString(),
    warehouse,
    action: event.action,
    itemType: event.itemType,
    name: event.name || '',
    path: event.path || '',
    rootFolderId,
  }))
}

export async function reportSyncChanges({ warehouseName, rootFolderId, events, summary }) {
  const hasEvents = Array.isArray(events) && events.length > 0
  const hasSummary = !!summary

  if (!hasReporterConfig() || (!hasEvents && !hasSummary)) {
    return { sent: false, reason: 'disabled_or_empty' }
  }

  const payload = {
    secret: REPORT_WEBHOOK_SECRET || null,
    events: hasEvents ? normalizeEvents(events, warehouseName, rootFolderId) : [],
    summary: hasSummary
      ? {
          warehouse: warehouseName || rootFolderId,
          rootFolderId,
          totalFiles: Number(summary.totalFiles || 0),
          totalFolders: Number(summary.totalFolders || 0),
          updatedAt: summary.updatedAt || new Date().toISOString(),
        }
      : null,
  }

  try {
    const response = await fetch(REPORT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return {
        sent: false,
        reason: `http_${response.status}`,
        detail: text,
      }
    }

    return { sent: true, count: payload.events.length }
  } catch (error) {
    return {
      sent: false,
      reason: 'request_failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
