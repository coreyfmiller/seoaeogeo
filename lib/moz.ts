/**
 * Moz Links API wrapper
 * Uses Moz's v2 Links API for backlink data and URL metrics.
 * Requires MOZ_ACCESS_ID and MOZ_SECRET_KEY env vars.
 * 
 * Docs: https://moz.com/help/links-api
 */

const MOZ_ACCESS_ID = process.env.MOZ_ACCESS_ID || ''
const MOZ_SECRET_KEY = process.env.MOZ_SECRET_KEY || ''
const MOZ_API_BASE = 'https://lsapi.seomoz.com/v2'

const MOZ_BACKLINK_LIMIT = parseInt(process.env.MOZ_BACKLINK_LIMIT || '10', 10)

export interface MozUrlMetrics {
  domain: string
  domainAuthority: number
  pageAuthority: number
  linkingDomains: number
  totalBacklinks: number
  spamScore: number
}

export interface MozBacklink {
  sourceDomain: string
  sourceUrl: string
  targetUrl: string
  anchorText: string
  domainAuthority: number
  pageAuthority: number
  spamScore: number
  isDofollow: boolean
  firstDiscovered: string | null
  lastSeen: string | null
}

export interface MozBacklinkData {
  metrics: MozUrlMetrics
  backlinks: MozBacklink[]
}

/** Check if Moz API is configured */
export function isMozConfigured(): boolean {
  return !!(MOZ_ACCESS_ID && MOZ_SECRET_KEY)
}

/** Build auth header for Moz API */
function getAuthHeader(): string {
  const credentials = Buffer.from(`${MOZ_ACCESS_ID}:${MOZ_SECRET_KEY}`).toString('base64')
  return `Basic ${credentials}`
}

/** Extract root domain from URL */
function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase()
}

/**
 * Get URL metrics (DA, PA, linking domains, etc.) for a domain.
 * This does NOT count against Moz row quota.
 */
export async function getMozUrlMetrics(targetUrl: string): Promise<MozUrlMetrics> {
  if (!isMozConfigured()) throw new Error('Moz API not configured')

  const domain = extractDomain(targetUrl)
  console.log(`[Moz] Fetching URL metrics for: ${domain}`)

  const res = await fetch(`${MOZ_API_BASE}/url_metrics`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targets: [domain],
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[Moz] URL metrics failed (${res.status}):`, body)
    throw new Error(`Moz API error: ${res.status}`)
  }

  const data = await res.json()
  const result = data.results?.[0] || data

  return {
    domain,
    domainAuthority: Math.round(result.domain_authority || 0),
    pageAuthority: Math.round(result.page_authority || 0),
    linkingDomains: result.root_domains_to_root_domain || result.linking_root_domains || 0,
    totalBacklinks: result.external_links_to_root_domain || result.total_links || 0,
    spamScore: Math.round((result.spam_score || 0) * 100),
  }
}

/**
 * Get top backlinks for a domain, sorted by source DA descending.
 * Each backlink returned counts as 1 row against Moz quota.
 */
export async function getMozBacklinks(targetUrl: string, limit?: number): Promise<MozBacklink[]> {
  if (!isMozConfigured()) throw new Error('Moz API not configured')

  const domain = extractDomain(targetUrl)
  const fetchLimit = limit || MOZ_BACKLINK_LIMIT
  console.log(`[Moz] Fetching top ${fetchLimit} backlinks for: ${domain}`)

  const res = await fetch(`${MOZ_API_BASE}/links`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: domain,
      target_type: 'root_domain',
      filter: 'external+follow',
      sort: 'source_domain_authority',
      sort_direction: 'desc',
      limit: fetchLimit,
    }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[Moz] Backlinks failed (${res.status}):`, body)
    throw new Error(`Moz API error: ${res.status}`)
  }

  const data = await res.json()
  const links = data.results || data || []

  return links.map((link: any) => ({
    sourceDomain: link.source?.root_domain || link.source_domain || '',
    sourceUrl: link.source?.page || link.source_url || '',
    targetUrl: link.target?.page || link.target_url || '',
    anchorText: link.anchor_text || '',
    domainAuthority: Math.round(link.source?.domain_authority || link.source_domain_authority || 0),
    pageAuthority: Math.round(link.source?.page_authority || link.source_page_authority || 0),
    spamScore: Math.round((link.source?.spam_score || 0) * 100),
    isDofollow: link.nofollow !== true && link.rel !== 'nofollow',
    firstDiscovered: link.first_discovered || null,
    lastSeen: link.last_seen || null,
  }))
}

/**
 * Get full backlink data (metrics + top backlinks) for a domain.
 * Convenience function that calls both endpoints in parallel.
 */
export async function getMozBacklinkData(targetUrl: string, limit?: number): Promise<MozBacklinkData> {
  const [metrics, backlinks] = await Promise.all([
    getMozUrlMetrics(targetUrl),
    getMozBacklinks(targetUrl, limit),
  ])
  return { metrics, backlinks }
}
