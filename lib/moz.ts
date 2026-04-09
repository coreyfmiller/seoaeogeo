/**
 * Moz API wrapper
 * 
 * Two APIs used:
 *   NEW: api.moz.com/jsonrpc (x-moz-token) → URL metrics (DA, PA, link counts) — 1 row per call
 *   LEGACY: lsapi.seomoz.com/v2 (Basic auth) → backlinks list — 1 row per link returned
 * 
 * Env vars: MOZ_API_TOKEN (new API token or base64 legacy creds — works for both)
 */

const MOZ_API_TOKEN = process.env.MOZ_API_TOKEN || ''
const MOZ_BACKLINK_LIMIT = parseInt(process.env.MOZ_BACKLINK_LIMIT || '10', 10)

// Decode legacy credentials from the token (it's base64 of "accessId:secretKey")
function getLegacyAuth(): string {
  // The token IS the base64 string already
  return MOZ_API_TOKEN
}

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
  /** True when only nofollow links were found (no dofollow backlinks exist) */
  nofollowOnly?: boolean
}

export function isMozConfigured(): boolean {
  return !!MOZ_API_TOKEN
}

function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase()
}

/**
 * Get URL metrics via NEW API (api.moz.com/jsonrpc).
 * Costs 1 row.
 */
export async function getMozUrlMetrics(targetUrl: string): Promise<MozUrlMetrics> {
  if (!isMozConfigured()) throw new Error('Moz API not configured')

  const domain = extractDomain(targetUrl)
  console.log(`[Moz] Fetching URL metrics for: ${domain}`)

  const res = await fetch('https://api.moz.com/jsonrpc', {
    method: 'POST',
    headers: {
      'x-moz-token': MOZ_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method: 'data.site.metrics.fetch',
      params: { data: { site_query: { query: domain, scope: 'domain' } } },
    }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[Moz] URL metrics error (${res.status}):`, body)
    throw new Error(`Moz API error: ${res.status}`)
  }

  const data = await res.json()
  if (data.error) throw new Error(`Moz API: ${data.error.message}`)

  const m = data.result?.site_metrics || {}

  return {
    domain,
    domainAuthority: Math.round(m.domain_authority ?? 0),
    pageAuthority: Math.round(m.page_authority ?? 0),
    linkingDomains: m.root_domains_to_root_domain ?? 0,
    totalBacklinks: m.external_pages_to_root_domain ?? 0,
    spamScore: m.spam_score ?? 0,
  }
}

/**
 * Get top backlinks via LEGACY API (lsapi.seomoz.com/v2).
 * Tries follow-only first. If empty, falls back to all external links.
 * Costs 1 row per link returned.
 */
export async function getMozBacklinks(targetUrl: string, limit?: number): Promise<MozBacklink[]> {
  if (!isMozConfigured()) throw new Error('Moz API not configured')

  const domain = extractDomain(targetUrl)
  const desiredCount = limit || MOZ_BACKLINK_LIMIT

  // Try follow-only first (quality links)
  const followLinks = await fetchMozLinks(domain, desiredCount, 'external+follow')
  if (followLinks.length > 0) {
    console.log(`[Moz] Found ${followLinks.length} dofollow backlinks for: ${domain}`)
    return followLinks
  }

  // Fallback: fetch all external links (includes nofollow)
  console.log(`[Moz] No dofollow backlinks for ${domain}, falling back to all external links`)
  const allLinks = await fetchMozLinks(domain, desiredCount, 'external')
  if (allLinks.length > 0) {
    // Mark these as nofollow-only results so the UI can show a note
    allLinks.forEach(l => { (l as any)._nofollowFallback = true })
  }
  return allLinks
}

/** Internal: fetch and deduplicate backlinks from Moz legacy API */
async function fetchMozLinks(domain: string, desiredCount: number, filter: string): Promise<MozBacklink[]> {
  const fetchLimit = desiredCount * 3
  console.log(`[Moz] Fetching top ${fetchLimit} backlinks for: ${domain} (filter: ${filter})`)

  const res = await fetch('https://lsapi.seomoz.com/v2/links', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getLegacyAuth()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: domain,
      target_type: 'root_domain',
      filter,
      sort: 'source_domain_authority',
      limit: fetchLimit,
    }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[Moz] Backlinks error (${res.status}):`, body)
    throw new Error(`Moz Links API error: ${res.status}`)
  }

  const data = await res.json()
  const links = data.results || []

  const allLinks: MozBacklink[] = links.map((link: any) => {
    const src = link.source || {}
    return {
      sourceDomain: src.root_domain || src.subdomain || '',
      sourceUrl: src.page || '',
      targetUrl: link.target?.page || '',
      anchorText: link.anchor_text || '',
      domainAuthority: Math.round(src.domain_authority ?? 0),
      pageAuthority: Math.round(src.page_authority ?? 0),
      spamScore: src.spam_score ?? 0,
      isDofollow: !link.nofollow,
      firstDiscovered: link.first_discovered || null,
      lastSeen: link.last_seen || null,
    }
  })

  // Deduplicate by root domain — keep the highest-DA link per domain
  const seenDomains = new Map<string, MozBacklink>()
  for (const link of allLinks) {
    const key = link.sourceDomain.replace(/^www\./, '').replace(/\.$/, '').toLowerCase()
    const existing = seenDomains.get(key)
    if (!existing || link.domainAuthority > existing.domainAuthority) {
      seenDomains.set(key, link)
    }
  }

  return Array.from(seenDomains.values())
    .sort((a, b) => b.domainAuthority - a.domainAuthority)
    .slice(0, desiredCount)
}

/**
 * Get full backlink data (metrics + top backlinks) for a domain.
 * Runs both calls in parallel.
 */
export async function getMozBacklinkData(targetUrl: string, limit?: number): Promise<MozBacklinkData> {
  const [metrics, backlinks] = await Promise.all([
    getMozUrlMetrics(targetUrl),
    getMozBacklinks(targetUrl, limit),
  ])
  const nofollowOnly = backlinks.length > 0 && backlinks.every(b => !b.isDofollow)
  return { metrics, backlinks, nofollowOnly }
}
