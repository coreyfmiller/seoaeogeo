export type ScanType = 'free-v3' | 'free-v4' | 'pro' | 'deep' | 'competitive' | 'keyword-arena'

export interface ScanHistoryEntry {
  url: string
  type: ScanType
  scores?: { seo: number; aeo: number; geo: number }
  timestamp: string
  hasFullResult?: boolean
}

const STORAGE_KEY = 'scan_history'
const RESULT_PREFIX = 'scan_result_'
const MAX_ENTRIES = 10
const MAX_FULL_RESULTS = 10

function resultKey(entry: { url: string; type: string; timestamp: string }) {
  // Create a stable key from url+type+timestamp
  const safe = `${entry.type}_${entry.url}_${entry.timestamp}`.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 120)
  return `${RESULT_PREFIX}${safe}`
}

export function saveScanToHistory(entry: ScanHistoryEntry, fullResult?: any) {
  try {
    const existing: ScanHistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    if (fullResult) {
      entry.hasFullResult = true
      try {
        localStorage.setItem(resultKey(entry), JSON.stringify(fullResult))
      } catch {
        // Storage full — evict oldest full results
        evictOldResults(existing)
        try { localStorage.setItem(resultKey(entry), JSON.stringify(fullResult)) } catch {
          entry.hasFullResult = false
        }
      }
    }

    existing.unshift(entry)
    const trimmed = existing.slice(0, MAX_ENTRIES)

    // Remove full results for any entries being purged
    const purged = existing.slice(MAX_ENTRIES)
    for (const old of purged) {
      if (old.hasFullResult) {
        try { localStorage.removeItem(resultKey(old)) } catch {}
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {}
}

export function getScanHistory(): ScanHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function getFullScanResult(entry: ScanHistoryEntry): any | null {
  if (!entry.hasFullResult) return null
  try {
    // Check for DB-fetched result first (set by dashboard when loading from Supabase)
    const dbResult = sessionStorage.getItem('db_scan_result')
    if (dbResult) {
      sessionStorage.removeItem('db_scan_result')
      return JSON.parse(dbResult)
    }
    // Fallback to localStorage
    const data = localStorage.getItem(resultKey(entry))
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/** Set a flag so the target page knows to load from history */
export function setLoadFromHistory(entry: ScanHistoryEntry) {
  sessionStorage.setItem('load_scan_entry', JSON.stringify(entry))
}

/** Check if a page should load from history, then clear the flag */
export function consumeLoadFromHistory(): ScanHistoryEntry | null {
  try {
    const raw = sessionStorage.getItem('load_scan_entry')
    if (!raw) return null
    sessionStorage.removeItem('load_scan_entry')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function evictOldResults(entries: ScanHistoryEntry[]) {
  // Remove full results beyond MAX_FULL_RESULTS, oldest first
  const withResults = entries.filter(e => e.hasFullResult).reverse()
  for (const old of withResults.slice(MAX_FULL_RESULTS - 1)) {
    try {
      localStorage.removeItem(resultKey(old))
      old.hasFullResult = false
    } catch {}
  }
}

/** Route path for a given scan type */
export function getRouteForType(type: ScanHistoryEntry['type']): string {
  switch (type) {
    case 'free-v3': return '/free-audit'
    case 'free-v4': return '/v4'
    case 'pro': return '/pro-audit'
    case 'deep': return '/deep-scan'
    case 'competitive': return '/battle-mode-v3'
    case 'keyword-arena': return '/keyword-arena-v3'
    default: return '/free-audit'
  }
}

/** Export all scan history + full results as a JSON blob */
export function exportScanHistory(): string {
  const entries = getScanHistory()
  const fullResults: Record<string, any> = {}
  for (const entry of entries) {
    if (entry.hasFullResult) {
      const result = getFullScanResult(entry)
      if (result) {
        fullResults[resultKey(entry)] = result
      }
    }
  }
  return JSON.stringify({ entries, fullResults }, null, 2)
}

/** Import scan history from a JSON blob (merges with existing) */
export function importScanHistory(json: string): { imported: number } {
  const data = JSON.parse(json)
  const incoming: ScanHistoryEntry[] = data.entries || []
  const incomingResults: Record<string, any> = data.fullResults || {}

  const existing = getScanHistory()

  // Build a set of existing keys to avoid exact duplicates (same url+type+timestamp)
  const existingKeys = new Set(existing.map(e => `${e.url}|${e.type}|${e.timestamp}`))

  let imported = 0
  const toAdd: ScanHistoryEntry[] = []

  for (const entry of incoming) {
    const key = `${entry.url}|${entry.type}|${entry.timestamp}`
    if (existingKeys.has(key)) continue

    // Restore full result if available
    if (entry.hasFullResult) {
      const rk = resultKey(entry)
      const result = incomingResults[rk]
      if (result) {
        try { localStorage.setItem(rk, JSON.stringify(result)) } catch {
          entry.hasFullResult = false
        }
      } else {
        entry.hasFullResult = false
      }
    }

    toAdd.push(entry)
    imported++
  }

  // Merge: new imports go on top, then existing
  const merged = [...toAdd, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))

  return { imported }
}

/** Get the most recent scan entry (with full result) for a given type */
export function getLatestFullScan(type: ScanHistoryEntry['type']): { entry: ScanHistoryEntry; result: any } | null {
  const history = getScanHistory()
  const latest = history.find(e => e.type === type && e.hasFullResult)
  if (!latest) return null
  const result = getFullScanResult(latest)
  if (!result) return null
  return { entry: latest, result }
}

/** Clear all scan history and full results from localStorage (including tool-specific caches) */
export function clearScanHistory() {
  try {
    const entries = getScanHistory()
    for (const entry of entries) {
      if (entry.hasFullResult) {
        try { localStorage.removeItem(resultKey(entry)) } catch {}
      }
    }
    localStorage.removeItem(STORAGE_KEY)

    // Clear tool-specific localStorage caches
    const toolKeys = [
      'battle_v3_siteA', 'battle_v3_siteB', 'battle_v3_data', 'battle_v3_backlinks',
      'arena_v3_keyword', 'arena_v3_userSite', 'arena_v3_result',
    ]
    for (const key of toolKeys) {
      try { localStorage.removeItem(key) } catch {}
    }
  } catch {}
}
