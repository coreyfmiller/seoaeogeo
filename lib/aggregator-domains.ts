/**
 * Aggregator / Directory Domain Filter
 *
 * These domains are large aggregator platforms, directories, or review sites
 * that are NOT real competitors for local/business keyword searches.
 * A pizza shop doesn't compete with TripAdvisor — they compete with other pizza shops.
 *
 * Filtering these from Keyword Arena results gives users meaningful competitive
 * analysis against actual business competitors.
 *
 * NOTE: Facebook and Instagram are on this list because their Domain Authority (96+)
 * is inherited from the platform, not the business, making DA comparisons meaningless.
 * Businesses using Facebook/Instagram as their web presence are real competitors,
 * but their SEO metrics can't be meaningfully compared to independent websites.
 *
 * To add a domain: add the root domain (no www, no subdomains).
 * The matcher checks if the URL's hostname ends with any of these.
 */

const AGGREGATOR_DOMAINS: string[] = [
  // Review & directory platforms
  'tripadvisor.com',
  'tripadvisor.ca',
  'tripadvisor.co.uk',
  'yelp.com',
  'yelp.ca',
  'yelp.co.uk',
  'yellowpages.com',
  'yellowpages.ca',
  'bbb.org',
  'mapquest.com',
  'foursquare.com',

  // Home services aggregators
  'angi.com',
  'homeadvisor.com',
  'thumbtack.com',
  'houzz.com',
  'homestarr.com',
  'homestars.com',

  // Health directories
  'healthgrades.com',
  'zocdoc.com',
  'webmd.com',
  'vitals.com',
  'ratemds.com',

  // Legal directories
  'avvo.com',
  'findlaw.com',
  'justia.com',
  'lawyers.com',
  'martindale.com',

  // Real estate aggregators
  'realtor.com',
  'zillow.com',
  'trulia.com',
  'redfin.com',

  // Food delivery / reservation platforms
  'opentable.com',
  'grubhub.com',
  'doordash.com',
  'ubereats.com',
  'seamless.com',
  'skipthedishes.com',
  'menulog.com',

  // Job boards
  'indeed.com',
  'glassdoor.com',
  'ziprecruiter.com',

  // Community / encyclopedia / social (non-business)
  'wikipedia.org',
  'reddit.com',
  'quora.com',
  'pinterest.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'youtube.com',
  'facebook.com',
  'instagram.com',

  // Generic aggregators
  'manta.com',
  'chamberofcommerce.com',
  'superpages.com',
  'citysearch.com',
  'merchantcircle.com',
  'hotfrog.com',
  'brownbook.net',
  'cylex.com',
  'dandb.com',
  'dnb.com',
  'buzzfile.com',
]

/**
 * Check if a URL belongs to a known aggregator/directory domain.
 * Returns true if the URL should be filtered out.
 */
export function isAggregatorDomain(url: string): boolean {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase()
    return AGGREGATOR_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

/**
 * Filter an array of search results, removing aggregator domains.
 * Preserves the original order.
 */
export function filterAggregators<T extends { url: string }>(results: T[]): T[] {
  return results.filter(r => !isAggregatorDomain(r.url))
}

/** Exported for testing / admin visibility */
export function getAggregatorDomainList(): string[] {
  return [...AGGREGATOR_DOMAINS]
}
