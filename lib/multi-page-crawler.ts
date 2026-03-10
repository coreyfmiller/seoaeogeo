import { performDeepScan, type PageScan } from './crawler-deep';
import type { SiteWideIssue, OrphanPage, DuplicateGroup } from './types/audit';

/**
 * Multi-Page Crawler with Link Graph Analysis
 * Extends the basic crawler with orphan detection, duplicate content detection,
 * and site-wide issue aggregation.
 */

export interface MultiPageScanResult {
  domain: string;
  pagesCrawled: number;
  pages: PageScan[];
  siteWideIssues: SiteWideIssue[];
  internalLinkGraph: Map<string, number>;
  orphanPages: OrphanPage[];
  duplicateGroups: DuplicateGroup[];
  crawlMetadata: CrawlMetadata;
}

export interface CrawlMetadata {
  startTime: Date;
  endTime: Date;
  durationMs: number;
  failedPages: FailedPage[];
  robotsTxtRespected: boolean;
  crawlDepthLimit: number;
}

export interface FailedPage {
  url: string;
  error: string;
  statusCode?: number;
}

/**
 * Perform multi-page crawl with enhanced analysis
 */
export async function crawlMultiplePages(
  baseUrl: string,
  maxPages: number = 10
): Promise<MultiPageScanResult> {
  const startTime = new Date();
  
  try {
    // Use existing deep scan crawler
    const deepScanResult = await performDeepScan(baseUrl, maxPages);
    
    // Build internal link graph
    const linkGraph = buildInternalLinkGraph(deepScanResult.pages);
    
    // Detect orphan pages
    const orphans = detectOrphans(deepScanResult.pages, linkGraph);
    
    // Detect duplicate content
    const duplicates = detectDuplicates(deepScanResult.pages);
    
    // Aggregate site-wide issues
    const siteWideIssues = aggregateSiteWideIssues(deepScanResult.pages, orphans, duplicates);
    
    const endTime = new Date();
    
    return {
      domain: deepScanResult.domain,
      pagesCrawled: deepScanResult.pagesCrawled,
      pages: deepScanResult.pages,
      siteWideIssues,
      internalLinkGraph: linkGraph,
      orphanPages: orphans,
      duplicateGroups: duplicates,
      crawlMetadata: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime(),
        failedPages: [], // TODO: Track failed pages in crawler
        robotsTxtRespected: true, // TODO: Implement robots.txt checking
        crawlDepthLimit: maxPages
      }
    };
  } catch (error) {
    throw new Error(`Multi-page crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build internal link graph showing inbound link counts for each page
 */
export function buildInternalLinkGraph(pages: PageScan[]): Map<string, number> {
  const linkGraph = new Map<string, number>();
  
  // Initialize all pages with 0 inbound links
  pages.forEach(page => {
    linkGraph.set(normalizeUrl(page.url), 0);
  });
  
  // Count inbound links for each page
  pages.forEach(sourcePage => {
    sourcePage.outboundLinks.forEach(targetUrl => {
      const normalized = normalizeUrl(targetUrl);
      if (linkGraph.has(normalized)) {
        linkGraph.set(normalized, (linkGraph.get(normalized) || 0) + 1);
      }
    });
  });
  
  return linkGraph;
}

/**
 * Detect orphan pages (pages with 0-1 inbound links, excluding homepage)
 */
export function detectOrphans(pages: PageScan[], linkGraph: Map<string, number>): OrphanPage[] {
  const orphans: OrphanPage[] = [];
  
  pages.forEach(page => {
    // Skip homepage (first page is always homepage)
    if (page === pages[0]) return;
    
    const normalized = normalizeUrl(page.url);
    const inboundCount = linkGraph.get(normalized) || 0;
    
    // Orphan if 0-1 inbound links
    if (inboundCount <= 1) {
      orphans.push({
        url: page.url,
        inboundCount,
        severity: inboundCount === 0 ? 'critical' : 'medium'
      });
    }
  });
  
  return orphans;
}

/**
 * Detect duplicate or near-duplicate content across pages
 */
export function detectDuplicates(pages: PageScan[]): DuplicateGroup[] {
  const contentHashes = new Map<string, PageScan[]>();
  
  // Group pages by content hash
  pages.forEach(page => {
    const hash = simpleHash(page.thinnedText.substring(0, 500));
    if (!contentHashes.has(hash)) {
      contentHashes.set(hash, []);
    }
    contentHashes.get(hash)!.push(page);
  });
  
  // Return groups with 2+ pages (duplicates)
  const duplicateGroups: DuplicateGroup[] = [];
  
  contentHashes.forEach(group => {
    if (group.length > 1) {
      duplicateGroups.push({
        pages: group.map(p => p.url),
        similarity: 'high', // Simple hash = high similarity
        recommendation: group.length === 2 
          ? 'Consolidate these pages or differentiate their content'
          : `${group.length} pages have very similar content - consolidate or differentiate`
      });
    }
  });
  
  return duplicateGroups;
}

/**
 * Aggregate site-wide issues across all pages
 */
export function aggregateSiteWideIssues(
  pages: PageScan[],
  orphans: OrphanPage[],
  duplicates: DuplicateGroup[]
): SiteWideIssue[] {
  const issues: SiteWideIssue[] = [];
  
  // 1. Missing H1 tags
  const missingH1Pages = pages.filter(p => !p.hasH1);
  if (missingH1Pages.length > 0) {
    issues.push({
      type: 'missing-h1',
      affectedPages: missingH1Pages.map(p => p.url),
      count: missingH1Pages.length,
      severity: missingH1Pages.length > pages.length * 0.5 ? 'critical' : 'high',
      description: `${missingH1Pages.length} page(s) missing H1 tags`
    });
  }
  
  // 2. Thin content (<300 words)
  const thinContentPages = pages.filter(p => p.wordCount < 300);
  if (thinContentPages.length > 0) {
    issues.push({
      type: 'thin-content',
      affectedPages: thinContentPages.map(p => p.url),
      count: thinContentPages.length,
      severity: thinContentPages.length > pages.length * 0.3 ? 'high' : 'medium',
      description: `${thinContentPages.length} page(s) with thin content (<300 words)`
    });
  }
  
  // 3. Missing meta descriptions
  const missingMetaPages = pages.filter(p => !p.description || p.description.length === 0);
  if (missingMetaPages.length > 0) {
    issues.push({
      type: 'missing-meta',
      affectedPages: missingMetaPages.map(p => p.url),
      count: missingMetaPages.length,
      severity: missingMetaPages.length > pages.length * 0.5 ? 'critical' : 'high',
      description: `${missingMetaPages.length} page(s) missing meta descriptions`
    });
  }
  
  // 4. Poor image alt text coverage
  const poorAltPages = pages.filter(p => {
    if (p.imgTotal === 0) return false;
    const coverage = p.imgWithAlt / p.imgTotal;
    return coverage < 0.5; // Less than 50% coverage
  });
  if (poorAltPages.length > 0) {
    issues.push({
      type: 'poor-alt-coverage',
      affectedPages: poorAltPages.map(p => p.url),
      count: poorAltPages.length,
      severity: poorAltPages.length > pages.length * 0.3 ? 'high' : 'medium',
      description: `${poorAltPages.length} page(s) with poor image alt text coverage (<50%)`
    });
  }
  
  // 5. Orphan pages
  if (orphans.length > 0) {
    issues.push({
      type: 'orphan-pages',
      affectedPages: orphans.map(o => o.url),
      count: orphans.length,
      severity: orphans.some(o => o.severity === 'critical') ? 'critical' : 'medium',
      description: `${orphans.length} orphaned page(s) with minimal internal links`
    });
  }
  
  // 6. Duplicate content
  if (duplicates.length > 0) {
    const totalDuplicatePages = duplicates.reduce((sum, group) => sum + group.pages.length, 0);
    issues.push({
      type: 'duplicate-content',
      affectedPages: duplicates.flatMap(g => g.pages),
      count: totalDuplicatePages,
      severity: duplicates.length > 2 ? 'high' : 'medium',
      description: `${totalDuplicatePages} page(s) in ${duplicates.length} duplicate content group(s)`
    });
  }
  
  return issues;
}

/**
 * Simple hash function for content similarity detection
 */
export function simpleHash(text: string): string {
  // Remove whitespace and convert to lowercase for comparison
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // Simple hash: first 100 chars + length
  const sample = normalized.substring(0, 100);
  return `${sample}_${normalized.length}`;
}

/**
 * Normalize URL for comparison (remove trailing slash, fragments, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash, fragment, and query params for comparison
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Prioritize pages for crawling based on importance signals
 */
export function prioritizePages(links: string[], homepageUrl: string): string[] {
  const scored = links.map(url => {
    let score = 0;
    const urlLower = url.toLowerCase();
    
    // Priority 1: Important page types (50 points)
    if (/\/(about|services|products|contact)/i.test(urlLower)) score += 50;
    if (/\/(blog|news|articles)/i.test(urlLower)) score += 30;
    
    // Priority 2: URL depth (closer to homepage = higher priority)
    const depth = url.split('/').filter(Boolean).length - 2; // Subtract protocol and domain
    score += Math.max(0, 30 - (depth * 10)); // Max 30 points for depth 0
    
    // Priority 3: Shorter URLs are often more important
    const pathLength = url.split('/').filter(Boolean).length;
    score += Math.max(0, 20 - (pathLength * 5)); // Max 20 points
    
    // Penalty: Low priority pages
    if (/\/(privacy|terms|legal|cookie)/i.test(urlLower)) score -= 20;
    
    return { url, score };
  });
  
  // Sort by score descending
  return scored.sort((a, b) => b.score - a.score).map(s => s.url);
}
