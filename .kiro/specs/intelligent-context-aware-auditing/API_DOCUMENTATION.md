# API Documentation - Intelligent Context-Aware Auditing System

## Table of Contents
1. [Site Type Detection](#site-type-detection)
2. [Multi-Page Crawler](#multi-page-crawler)
3. [Fix Generator](#fix-generator)
4. [Gap Analyzer](#gap-analyzer)
5. [Priority Scorer](#priority-scorer)
6. [Page Cache](#page-cache)
7. [Schema Validator](#schema-validator)

---

## Site Type Detection

### `detectSiteType(pageData: PageData): SiteTypeResult`

Analyzes a website to determine its primary type and confidence level.

**Parameters:**
- `pageData: PageData` - Page data including schemas, content, structure, and URL

**Returns:** `SiteTypeResult`
```typescript
{
  primaryType: SiteType,
  secondaryTypes?: SiteType[],
  confidence: number, // 0-100
  reasoning: string,
  recommendedSchemas: string[]
}
```

**Site Types:**
- `e-commerce` - Online stores
- `local-business` - Physical locations
- `blog` - Content-focused sites
- `saas` - Software as a Service
- `portfolio` - Personal/professional portfolios
- `restaurant` - Food service businesses
- `contractor` - Service contractors
- `professional-services` - Consulting, legal, etc.
- `news-media` - News publications
- `educational` - Schools, courses
- `general` - Default/ambiguous sites

**Confidence Levels:**
- High (70-100): Clear signals, use automatically
- Medium (40-69): Suggest with confirmation option
- Low (0-39): Require manual selection

**Example:**
```typescript
const result = detectSiteType({
  schemas: [{ type: 'Product' }],
  content: 'Buy now, add to cart, checkout',
  structure: { hasProductPages: true },
  url: 'https://shop.example.com'
});
// Returns: { primaryType: 'e-commerce', confidence: 85, ... }
```

### `getRecommendedSchemas(siteType: SiteType): string[]`

Returns recommended schema types for a given site type.

**Parameters:**
- `siteType: SiteType` - The detected site type

**Returns:** `string[]` - Array of recommended schema type names

**Example:**
```typescript
getRecommendedSchemas('e-commerce');
// Returns: ['Product', 'Offer', 'Review', 'AggregateRating', 'Organization']
```

---

## Multi-Page Crawler

### `crawlMultiplePages(config: CrawlConfig): Promise<MultiPageResult>`

Crawls multiple pages from a website with intelligent prioritization.

**Parameters:**
```typescript
interface CrawlConfig {
  url: string;
  maxPages: number; // 1, 10, 20, or 50
  respectRobotsTxt?: boolean;
  timeout?: number; // milliseconds
  onProgress?: (current: number, total: number) => void;
}
```

**Returns:** `Promise<MultiPageResult>`
```typescript
{
  pages: PageScan[];
  linkGraph: LinkGraph;
  orphanPages: string[];
  duplicateContent: DuplicateGroup[];
  siteWideIssues: SiteWideIssue[];
  crawlStats: {
    totalPages: number;
    successfulPages: number;
    failedPages: number;
    duration: number;
  };
}
```

**Features:**
- Parallel batch processing (3 pages at a time)
- Intelligent page prioritization
- Orphan page detection
- Duplicate content detection
- Site-wide issue aggregation
- Timeout protection

**Example:**
```typescript
const result = await crawlMultiplePages({
  url: 'https://example.com',
  maxPages: 20,
  respectRobotsTxt: true,
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  }
});
```

### `buildInternalLinkGraph(pages: PageScan[]): LinkGraph`

Constructs an internal link graph from crawled pages.

**Parameters:**
- `pages: PageScan[]` - Array of crawled pages

**Returns:** `LinkGraph`
```typescript
{
  nodes: { url: string; inboundLinks: number; outboundLinks: number }[];
  edges: { from: string; to: string }[];
}
```

### `detectOrphans(linkGraph: LinkGraph, homepage: string): string[]`

Identifies pages with no inbound links (orphan pages).

**Parameters:**
- `linkGraph: LinkGraph` - The site's link graph
- `homepage: string` - Homepage URL (excluded from orphan detection)

**Returns:** `string[]` - Array of orphan page URLs

### `detectDuplicates(pages: PageScan[]): DuplicateGroup[]`

Identifies pages with identical or near-identical content.

**Parameters:**
- `pages: PageScan[]` - Array of crawled pages

**Returns:** `DuplicateGroup[]`
```typescript
{
  contentHash: string;
  pages: string[];
  similarity: number; // 0-100
}
```

### `aggregateSiteWideIssues(pages: PageScan[], orphans: string[], duplicates: DuplicateGroup[]): SiteWideIssue[]`

Aggregates common issues across all pages.

**Parameters:**
- `pages: PageScan[]` - All crawled pages
- `orphans: string[]` - Orphan page URLs
- `duplicates: DuplicateGroup[]` - Duplicate content groups

**Returns:** `SiteWideIssue[]`

**Issue Types:**
- `missing-h1` - Pages without H1 tags
- `thin-content` - Pages with <300 words
- `missing-meta` - Pages without meta descriptions
- `poor-alt-coverage` - Images without alt text
- `orphan-pages` - Pages with no inbound links
- `duplicate-content` - Identical content across pages

---

## Fix Generator

### `generateFix(issue: Issue, pageData: PageData, siteType?: SiteType): FixInstruction`

Generates platform-specific fix instructions with code examples.

**Parameters:**
- `issue: Issue` - The SEO/AEO/GEO issue to fix
- `pageData: PageData` - Page context
- `siteType?: SiteType` - Optional site type for context-aware fixes

**Returns:** `FixInstruction`
```typescript
{
  title: string;
  description: string;
  platform: 'wordpress' | 'shopify' | 'nextjs' | 'react' | 'html';
  steps: InstructionStep[];
  code?: string;
  estimatedTime: string;
  difficulty: 'easy' | 'moderate' | 'difficult';
  validationLinks: { tool: string; url: string }[];
}
```

**Example:**
```typescript
const fix = generateFix(
  { type: 'missing-schema', schemaType: 'LocalBusiness' },
  pageData,
  'local-business'
);
// Returns platform-specific instructions with pre-populated schema code
```

### `detectPlatform(html: string): Platform`

Detects the website platform from HTML content.

**Parameters:**
- `html: string` - Page HTML

**Returns:** `Platform` - 'wordpress' | 'shopify' | 'nextjs' | 'react' | 'html'

**Detection Signals:**
- WordPress: wp-content, wp-includes
- Shopify: cdn.shopify.com, Shopify.theme
- Next.js: __NEXT_DATA__, _next/static
- React: react-root, data-reactroot

### `generateSchemaCode(schemaType: string, pageData: PageData, platform: Platform): string`

Generates schema markup code pre-populated with site data.

**Parameters:**
- `schemaType: string` - Schema.org type (e.g., 'LocalBusiness')
- `pageData: PageData` - Page data for pre-population
- `platform: Platform` - Target platform

**Returns:** `string` - Platform-specific schema code

**Features:**
- Pre-populates with extracted site data
- Platform-specific formatting (HTML script tag vs React component)
- JSON-LD validation
- Required property checking

---

## Gap Analyzer

### `analyzeCompetitorGaps(yourSite: SiteData, competitors: string[]): Promise<GapAnalysis>`

Analyzes gaps between your site and competitors.

**Parameters:**
- `yourSite: SiteData` - Your site's data
- `competitors: string[]` - Competitor URLs

**Returns:** `Promise<GapAnalysis>`
```typescript
{
  schemaGaps: SchemaGap[];
  contentGaps: ContentGap[];
  structuralGaps: StructuralGap[];
  competitiveAdvantageScore: number; // 0-100
  quickWins: Gap[];
  yourStrengths: Strength[];
}
```

**Gap Types:**
- **Schema Gaps**: Missing schema types competitors have
- **Content Gaps**: Topics/pages competitors cover
- **Structural Gaps**: Features like FAQ, blog, case studies

**Example:**
```typescript
const gaps = await analyzeCompetitorGaps(
  yourSiteData,
  ['https://competitor1.com', 'https://competitor2.com']
);
// Returns: { schemaGaps: [...], contentGaps: [...], ... }
```

### `calculateAdvantageScore(yourSite: SiteData, competitors: SiteData[]): number`

Calculates competitive advantage score (0-100).

**Factors:**
- Schema diversity and quality
- Content depth and breadth
- Structural features
- Technical performance

---

## Priority Scorer

### `calculatePriority(recommendations: Recommendation[], siteType?: SiteType): PriorityRecommendation[]`

Scores and prioritizes recommendations by ROI.

**Parameters:**
- `recommendations: Recommendation[]` - All recommendations
- `siteType?: SiteType` - Optional site type for context-aware scoring

**Returns:** `PriorityRecommendation[]`
```typescript
{
  ...recommendation,
  impact: number; // 1-10
  effort: number; // 1-10
  roi: number; // impact / effort
  category: 'Quick Win' | 'High Priority' | 'Medium Priority' | 'Long-term Investment' | 'Low Priority';
  reasoning: string;
  estimatedScoreGain: number;
}
```

**ROI Formula:** `ROI = Impact / Effort`

**Categories:**
- **Quick Win**: High impact, low effort (ROI > 2.0)
- **High Priority**: High impact, medium effort (ROI 1.5-2.0)
- **Medium Priority**: Balanced impact/effort (ROI 1.0-1.5)
- **Long-term Investment**: High effort, high impact (ROI 0.5-1.0)
- **Low Priority**: Low impact or very high effort (ROI < 0.5)

**Example:**
```typescript
const prioritized = calculatePriority(recommendations, 'e-commerce');
// Returns recommendations sorted by ROI with categories
```

### `estimateScoreGain(recommendations: PriorityRecommendation[]): number`

Estimates total score improvement from implementing recommendations.

**Parameters:**
- `recommendations: PriorityRecommendation[]` - Prioritized recommendations

**Returns:** `number` - Estimated total score gain (0-100)

---

## Page Cache

### `PageCache.getInstance(): PageCache`

Returns singleton cache instance.

**Returns:** `PageCache` - Global cache instance

### `cache.set(url: string, data: PageScan, ttl?: number): void`

Stores page data in cache.

**Parameters:**
- `url: string` - Page URL (normalized automatically)
- `data: PageScan` - Page scan data
- `ttl?: number` - Time to live in milliseconds (default: 24 hours)

### `cache.get(url: string): PageScan | null`

Retrieves cached page data.

**Parameters:**
- `url: string` - Page URL

**Returns:** `PageScan | null` - Cached data or null if expired/missing

### `cache.has(url: string): boolean`

Checks if URL is cached and not expired.

### `cache.delete(url: string): boolean`

Removes entry from cache.

### `cache.clear(): void`

Clears all cache entries.

### `cache.cleanup(): number`

Removes expired entries, returns count removed.

### `cache.getStats(): CacheStats`

Returns cache statistics.

**Returns:** `CacheStats`
```typescript
{
  size: number;
  entries: {
    url: string;
    age: number; // milliseconds
    ttl: number; // milliseconds remaining
  }[];
}
```

---

## Schema Validator

### `validateSchema(schema: any): ValidationResult`

Validates schema markup structure and completeness.

**Parameters:**
- `schema: any` - Schema.org JSON-LD object

**Returns:** `ValidationResult`
```typescript
{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
  missingRequired: string[];
  hasPlaceholders: boolean;
}
```

**Validation Checks:**
- Required properties present
- No placeholder values (e.g., "Your Business Name")
- Valid property types
- Proper nesting structure

**Example:**
```typescript
const result = validateSchema({
  "@type": "LocalBusiness",
  "name": "Example Business",
  "address": { "@type": "PostalAddress" }
});
// Returns: { isValid: true, score: 85, warnings: [...] }
```

---

## Usage Examples

### Complete Audit Flow

```typescript
// 1. Crawl multiple pages
const crawlResult = await crawlMultiplePages({
  url: 'https://example.com',
  maxPages: 20,
  respectRobotsTxt: true
});

// 2. Detect site type
const siteType = detectSiteType(crawlResult.pages[0]);

// 3. Generate recommendations
const recommendations = generateRecommendations(
  crawlResult.pages,
  crawlResult.siteWideIssues,
  siteType
);

// 4. Analyze competitor gaps (optional)
const gaps = await analyzeCompetitorGaps(
  { pages: crawlResult.pages },
  ['https://competitor.com']
);

// 5. Prioritize recommendations
const prioritized = calculatePriority(
  [...recommendations, ...gaps.quickWins],
  siteType.primaryType
);

// 6. Generate fix instructions
const fixes = prioritized.map(rec => 
  generateFix(rec, crawlResult.pages[0], siteType.primaryType)
);
```

### Caching Strategy

```typescript
const cache = PageCache.getInstance();

// Check cache before crawling
if (cache.has(url)) {
  const cached = cache.get(url);
  console.log('Using cached data');
  return cached;
}

// Crawl and cache
const result = await performDeepScan(url);
cache.set(url, result, 24 * 60 * 60 * 1000); // 24 hours

// Periodic cleanup
setInterval(() => {
  const removed = cache.cleanup();
  console.log(`Removed ${removed} expired entries`);
}, 60 * 60 * 1000); // Every hour
```

---

## Error Handling

All async functions follow this error pattern:

```typescript
try {
  const result = await crawlMultiplePages(config);
  return { success: true, data: result };
} catch (error) {
  console.error('Crawl failed:', error);
  return { 
    success: false, 
    error: error.message,
    partialResults: error.partialData // If available
  };
}
```

**Common Errors:**
- `TIMEOUT_ERROR` - Crawl exceeded time limit
- `NETWORK_ERROR` - Connection failed
- `RATE_LIMIT_ERROR` - API rate limit hit
- `VALIDATION_ERROR` - Invalid input parameters
- `ROBOTS_BLOCKED` - Blocked by robots.txt

---

## Performance Considerations

### Crawling
- Parallel batch size: 3 pages
- Timeout: 60s for 10 pages, 180s for 50 pages
- Cache TTL: 24 hours
- Respect robots.txt delays

### API Calls
- Gemini API: Batch requests when possible
- Rate limiting: Exponential backoff on 429 errors
- Fallback: Graceful degradation if API unavailable

### Memory
- Cache cleanup: Automatic on expired entries
- Large sites: Stream processing for 50+ pages
- Browser instances: Pooled and reused

---

## Type Definitions

See `lib/types/audit.ts` for complete type definitions.
