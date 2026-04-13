export type ScanType = 'free-v3' | 'free-v4' | 'pro' | 'deep' | 'competitive' | 'keyword-arena' | 'ai-test'

export interface ScanHistoryEntry {
  url: string
  type: ScanType
  scores?: { seo: number; aeo: number; geo: number }
  timestamp: string
  hasFullResult?: boolean
}

// One cached result per scan type — keeps localStorage lean
const RESULT_KEY_PREFIX = 'duelly_latest_'
const HISTORY_KEY = 'scan_history'

function latestResultKey(type: ScanType) {
  return `${RESULT_KEY_PREFIX}${type}`
}

function latestEntryKey(type: ScanType) {
  return `${RESULT_KEY_PREFIX}${type}_entry`
}

/**
 * Save a scan result. Only the most recent result per type is kept in localStorage.
 * Older results are purged locally but remain in Supabase.
 */
export function saveScanToHistory(entry: ScanHistoryEntry, fullResult?: any) {
  try {
    if (fullResult) {
      entry.hasFullResult = true
      try {
        const json = JSON.stringify(fullResult)
        localStorage.setItem(latestResultKey(entry.type), json)
        localStorage.setItem(latestEntryKey(entry.type), JSON.stringify(entry))
      } catch {
        // Storage full — clear all cached results and retry
        clearAllCachedResults()
        try {
          localStorage.setItem(latestResultKey(entry.type), JSON.stringify(fullResult))
          localStorage.setItem(latestEntryKey(entry.type), JSON.stringify(entry))
        } catch {
          entry.hasFullResult = false
        }
      }
    }

    // Also maintain a lightweight history list (entries only, no full results)
    const existing: ScanHistoryEntry[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    // Remove any previous entry of the same type
    const filtered = existing.filter(e => e.type !== entry.type)
    filtered.unshift(entry)
    const trimmed = filtered.slice(0, 20) // Keep last 20 entries (metadata only, tiny)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  } catch {}
}

export function getScanHistory(): ScanHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function getFullScanResult(entry: ScanHistoryEntry): any | null {
  try {
    // Check for DB-fetched result first (set by dashboard when loading from Supabase)
    const dbResult = sessionStorage.getItem('db_scan_result')
    if (dbResult) {
      sessionStorage.removeItem('db_scan_result')
      return JSON.parse(dbResult)
    }
    // Load from the one-per-type cache
    const data = localStorage.getItem(latestResultKey(entry.type))
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/** Get the most recent cached scan for a given type */
export function getLatestFullScan(type: ScanType): { entry: ScanHistoryEntry; result: any } | null {
  try {
    const entryJson = localStorage.getItem(latestEntryKey(type))
    if (!entryJson) return null
    const entry: ScanHistoryEntry = JSON.parse(entryJson)
    const resultJson = localStorage.getItem(latestResultKey(type))
    if (!resultJson) return null
    return { entry, result: JSON.parse(resultJson) }
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

/** Route path for a given scan type */
export function getRouteForType(type: ScanHistoryEntry['type']): string {
  switch (type) {
    case 'free-v3': return '/free-audit'
    case 'pro': return '/pro-audit'
    case 'deep': return '/deep-scan'
    case 'competitive': return '/battle-mode'
    case 'keyword-arena': return '/keyword-arena'
    case 'ai-test': return '/ai-test'
    default: return '/free-audit'
  }
}

/** Clear all scan history and cached results */
export function clearScanHistory() {
  try {
    clearAllCachedResults()
    localStorage.removeItem(HISTORY_KEY)

    // Clear tool-specific localStorage caches
    const toolKeys = [
      'battle_v3_siteA', 'battle_v3_siteB', 'battle_v3_data', 'battle_v3_backlinks',
      'arena_v3_keyword', 'arena_v3_userSite', 'arena_v3_result',
      'ai_test_keyword', 'ai_test_userUrl', 'ai_test_result',
    ]
    for (const key of toolKeys) {
      try { localStorage.removeItem(key) } catch {}
    }

    localStorage.setItem('duelly_history_cleared', 'true')
  } catch {}
}

/** Check if history was recently cleared (tool pages should skip auto-loading) */
export function wasHistoryCleared(): boolean {
  try {
    if (localStorage.getItem('duelly_history_cleared') === 'true') {
      localStorage.removeItem('duelly_history_cleared')
      return true
    }
  } catch {}
  return false
}

/** Clear all cached full results (one per type) */
function clearAllCachedResults() {
  const types: ScanType[] = ['free-v3', 'free-v4', 'pro', 'deep', 'competitive', 'keyword-arena', 'ai-test']
  for (const type of types) {
    try { localStorage.removeItem(latestResultKey(type)) } catch {}
    try { localStorage.removeItem(latestEntryKey(type)) } catch {}
  }
}

/** Export all scan history + full results as a JSON blob */
export function exportScanHistory(): string {
  const entries = getScanHistory()
  const fullResults: Record<string, any> = {}
  const types: ScanType[] = ['free-v3', 'free-v4', 'pro', 'deep', 'competitive', 'keyword-arena', 'ai-test']
  for (const type of types) {
    const latest = getLatestFullScan(type)
    if (latest) {
      fullResults[type] = latest.result
    }
  }
  return JSON.stringify({ entries, fullResults }, null, 2)
}

/** Import scan history from a JSON blob (merges with existing) */
export function importScanHistory(json: string): { imported: number } {
  const data = JSON.parse(json)
  const incoming: ScanHistoryEntry[] = data.entries || []
  const existing = getScanHistory()
  const existingKeys = new Set(existing.map(e => `${e.url}|${e.type}|${e.timestamp}`))

  let imported = 0
  for (const entry of incoming) {
    const key = `${entry.url}|${entry.type}|${entry.timestamp}`
    if (existingKeys.has(key)) continue
    imported++
  }

  // Merge: keep one per type from incoming if newer
  const merged = [...incoming, ...existing]
  const seen = new Set<string>()
  const deduped = merged.filter(e => {
    if (seen.has(e.type)) return false
    seen.add(e.type)
    return true
  }).slice(0, 20)

  localStorage.setItem(HISTORY_KEY, JSON.stringify(deduped))
  return { imported }
}
