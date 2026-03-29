/**
 * Shared backlink fetcher with cache layer.
 * Used by Pro Audit, Deep Scan, and Competitor Duel.
 * Cache TTL: own site = 30 days, competitor = 7 days (managed by backlink-cache.ts).
 */

import { isMozConfigured, getMozBacklinkData, type MozBacklinkData } from '@/lib/moz'
import { getCachedBacklinks, cacheBacklinks } from '@/lib/backlink-cache'

/**
 * Fetch backlinks with Supabase cache layer.
 * Returns null if Moz isn't configured or fetch fails (non-fatal).
 */
export async function fetchBacklinksWithCache(
  url: string,
  isOwnSite: boolean = true
): Promise<MozBacklinkData | null> {
  if (!isMozConfigured()) return null

  try {
    const cached = await getCachedBacklinks(url, isOwnSite)
    if (cached) return cached

    const data = await getMozBacklinkData(url)
    await cacheBacklinks(url, data)
    return data
  } catch (err: any) {
    console.error(`[Backlink Fetcher] Failed for ${url}:`, err.message)
    return null
  }
}

/**
 * Build a backlink context string for Gemini prompt injection.
 * Single-site version (for Pro Audit / Deep Scan).
 */
export function buildSingleSiteBacklinkContext(
  data: MozBacklinkData | null,
  url: string
): string {
  if (!data) return ''

  let ctx = '\n\nBACKLINK AUTHORITY DATA (from Moz):\n'
  ctx += `Domain: ${url}\n`
  ctx += `  Domain Authority: ${data.metrics.domainAuthority}/100\n`
  ctx += `  Page Authority: ${data.metrics.pageAuthority}/100\n`
  ctx += `  Total Backlinks: ${data.metrics.totalBacklinks.toLocaleString()}\n`
  ctx += `  Linking Domains: ${data.metrics.linkingDomains.toLocaleString()}\n`
  ctx += `  Spam Score: ${data.metrics.spamScore}%\n`

  if (data.backlinks.length > 0) {
    ctx += `  Top ${data.backlinks.length} backlinks by DA:\n`
    data.backlinks.forEach(b => {
      ctx += `    - ${b.sourceDomain} (DA: ${b.domainAuthority}) → anchor: "${b.anchorText}" ${b.isDofollow ? 'dofollow' : 'nofollow'}\n`
    })
  }

  ctx += '\nUse this backlink data to inform your recommendations. If DA is low, suggest specific link-building strategies. If spam score is high, recommend a backlink audit.\n'
  return ctx
}
