/**
 * Safe localStorage wrapper that handles QuotaExceededError gracefully.
 * On quota error: clears stale scan/battle/arena data and retries once.
 */

const EVICTABLE_PREFIXES = [
  'arena_v3_', 'battle_v3_', 'arena_v2_', 'battle_v2_',
  'scan_result_', 'deep_scan_',
]

function evictStaleData() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && EVICTABLE_PREFIXES.some(p => key.startsWith(p))) {
      localStorage.removeItem(key)
    }
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    // Quota exceeded — evict old data and retry once
    try {
      evictStaleData()
      localStorage.setItem(key, value)
      return true
    } catch {
      // Still can't fit — give up silently
      console.warn(`[Storage] Could not save "${key}" — quota exceeded even after eviction`)
      return false
    }
  }
}
