export interface ScanHistoryEntry {
  url: string
  type: 'free-v3' | 'free-v4' | 'pro' | 'deep' | 'competitive'
  scores?: { seo: number; aeo: number; geo: number }
  timestamp: string
}

const STORAGE_KEY = 'scan_history'
const MAX_ENTRIES = 50

export function saveScanToHistory(entry: ScanHistoryEntry) {
  try {
    const existing: ScanHistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // Avoid duplicate for same url+type within last minute
    const dominated = existing.filter(e => !(e.url === entry.url && e.type === entry.type))
    dominated.unshift(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dominated.slice(0, MAX_ENTRIES)))
  } catch {}
}

export function getScanHistory(): ScanHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
