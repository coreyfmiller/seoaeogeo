/**
 * Backlink cache using Supabase.
 * Two-tier TTL:
 *   - User's own site: 30 days (they battle many competitors against it)
 *   - Competitor sites: 7 days (fresher data matters more)
 * 
 * Shared across all users — if User A fetches competitor.com,
 * User B gets cached data for free.
 */

import { supabaseAdmin } from './supabase/admin'
import type { MozBacklinkData } from './moz'

const OWN_SITE_TTL_DAYS = 30
const COMPETITOR_TTL_DAYS = 7

/** Normalize domain for cache key */
function normalizeDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase()
}

/** Check if cached data is still valid */
function isValid(cachedAt: string, isOwnSite: boolean): boolean {
  const ttlDays = isOwnSite ? OWN_SITE_TTL_DAYS : COMPETITOR_TTL_DAYS
  const age = Date.now() - new Date(cachedAt).getTime()
  return age < ttlDays * 24 * 60 * 60 * 1000
}

/**
 * Get cached backlink data for a domain.
 * Returns null if not cached or expired.
 */
export async function getCachedBacklinks(
  targetUrl: string,
  isOwnSite: boolean
): Promise<MozBacklinkData | null> {
  const domain = normalizeDomain(targetUrl)

  try {
    const { data, error } = await supabaseAdmin
      .from('backlink_cache')
      .select('url_metrics, top_backlinks, cached_at')
      .eq('domain', domain)
      .single()

    if (error || !data) return null
    if (!isValid(data.cached_at, isOwnSite)) return null

    console.log(`[Backlink Cache] HIT for ${domain} (age: ${Math.round((Date.now() - new Date(data.cached_at).getTime()) / 3600000)}h)`)
    return {
      metrics: data.url_metrics,
      backlinks: data.top_backlinks || [],
    }
  } catch {
    return null
  }
}

/**
 * Store backlink data in cache.
 * Uses upsert — overwrites existing entry for the domain.
 */
export async function cacheBacklinks(
  targetUrl: string,
  data: MozBacklinkData
): Promise<void> {
  const domain = normalizeDomain(targetUrl)

  try {
    await supabaseAdmin
      .from('backlink_cache')
      .upsert({
        domain,
        url_metrics: data.metrics,
        top_backlinks: data.backlinks,
        cached_at: new Date().toISOString(),
      }, { onConflict: 'domain' })

    console.log(`[Backlink Cache] Stored ${domain} (${data.backlinks.length} backlinks)`)
  } catch (err: any) {
    console.error(`[Backlink Cache] Failed to store ${domain}:`, err.message)
  }
}
