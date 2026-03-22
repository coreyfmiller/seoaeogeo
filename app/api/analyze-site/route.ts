import { NextRequest } from 'next/server';
import { performDeepScan } from '@/lib/crawler-deep';
import { debugLog, clearDebugLog } from '@/lib/debug-logger';
import { scoreAndAggregatePages } from '@/lib/grader-aggregator';
import { validateAnalysisData } from '@/lib/data-validator';
import { detectSiteType } from '@/lib/site-type-detector';
import { createSSEStream, SSE_HEADERS } from '@/lib/sse-helpers';

export const maxDuration = 300

/**
 * Free Audit API — SSE streaming version
 * Crawls up to 5 pages, scores with Grader V2 (deterministic, no AI)
 */
export async function POST(request: NextRequest) {
  const { url, maxPages = 5 } = await request.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = createSSEStream(async (send) => {
    try {
      clearDebugLog();

      // Step 1: Crawl pages
      send({ type: 'progress', phase: 'Crawling pages and extracting content...', progress: 10 });
      const scanResults = await performDeepScan(url, maxPages);
      send({ type: 'progress', phase: `Crawled ${scanResults.pagesCrawled} pages. Scoring...`, progress: 30 });

      // Step 2: Score with Grader V2
      const { pagesWithScores, aggregated } = scoreAndAggregatePages(scanResults.pages);
      send({ type: 'progress', phase: 'Scores calculated. Detecting site type...', progress: 40 });

      // Step 2b: Site type detection (deterministic, zero cost)
      const homePage = scanResults.pages[0];
      const siteTypeResult = detectSiteType({
        schemas: homePage?.schemas || [],
        structuralData: { wordCount: homePage?.wordCount || 0 },
        title: homePage?.title || '',
        description: homePage?.description || '',
        url: scanResults.domain,
      } as any, scanResults.pages.map(p => p.schemas || []).flat());

      send({ type: 'progress', phase: 'Checking robots.txt & sitemap...', progress: 45 });

      // Step 3: Robots.txt & Sitemap check
      let robotsTxt = { exists: false, raw: '' };
      let sitemap = { exists: false };
      try {
        const baseOrigin = new URL(url.startsWith('http') ? url : `https://${url}`).origin;
        const [robotsRes, sitemapRes] = await Promise.allSettled([
          fetch(`${baseOrigin}/robots.txt`, { signal: AbortSignal.timeout(5000) }),
          fetch(`${baseOrigin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) }),
        ]);
        if (robotsRes.status === 'fulfilled' && robotsRes.value.ok) {
          const text = await robotsRes.value.text();
          robotsTxt = { exists: true, raw: text.substring(0, 2000) };
        }
        if (sitemapRes.status === 'fulfilled' && sitemapRes.value.ok) {
          sitemap = { exists: true };
        }
      } catch (e) {
        console.warn('[Free Audit] robots.txt/sitemap check failed:', e);
      }

      send({ type: 'progress', phase: 'Assembling results...', progress: 70 });

      // Step 4: Aggregate metrics (all deterministic — no AI)
      const totalWords = pagesWithScores.reduce((acc, p) => acc + (p.wordCount || 0), 0);
      const schemaCount = pagesWithScores.reduce((acc, p) => acc + (p.schemas?.length || 0), 0);
      const avgResponseTime = pagesWithScores.reduce((acc, p) => acc + (p.responseTimeMs || 0), 0) / (scanResults.pagesCrawled || 1);
      const httpsPct = pagesWithScores.filter(p => p.isHttps).length / (scanResults.pagesCrawled || 1);
      const h1Pct = pagesWithScores.filter(p => p.hasH1).length / (scanResults.pagesCrawled || 1);
      const perfPct = pagesWithScores.filter(p => p.responseTimeMs < 1500).length / (scanResults.pagesCrawled || 1);
      const globalTechScore = Math.round((httpsPct * 30) + (h1Pct * 30) + (perfPct * 40));

      // Deterministic domain-level metrics (replaces AI synthesis)
      const pagesWithDesc = pagesWithScores.filter(p => p.description && p.description.length > 0).length;
      const pagesWithTitle = pagesWithScores.filter(p => p.title && p.title.length > 0).length;
      const metadataHealth = scanResults.pagesCrawled > 0
        ? Math.round(((pagesWithDesc + pagesWithTitle) / (scanResults.pagesCrawled * 2)) * 100)
        : 0;
      const schemaCoverage = scanResults.pagesCrawled > 0
        ? Math.round((pagesWithScores.filter(p => (p.schemas?.length || 0) > 0).length / scanResults.pagesCrawled) * 100)
        : 0;
      const schemaHealthScore = schemaCount > 0 ? Math.min(100, Math.round((schemaCount / scanResults.pagesCrawled) * 50) + 50) : 0;
      const domainHealthScore = Math.round((httpsPct * 25) + (h1Pct * 25) + (perfPct * 25) + (metadataHealth / 100 * 25));
      // Brand consistency: check title similarity across pages
      const titles = pagesWithScores.map(p => p.title || '').filter(t => t.length > 0);
      const brandConsistency = titles.length > 1
        ? (() => {
            const words = titles.map(t => new Set(t.toLowerCase().split(/\s+/)));
            const commonWords = words.reduce((acc, set) => {
              const intersection = new Set([...acc].filter(w => set.has(w)));
              return intersection;
            });
            const avgLen = words.reduce((s, w) => s + w.size, 0) / words.length;
            return avgLen > 0 ? Math.round((commonWords.size / avgLen) * 100) : 0;
          })()
        : 50;

      // Step 5: Build standardized AI-shaped object (deterministic values)
      const standardizedAI = {
        scores: { seo: aggregated.seo, aeo: aggregated.aeo, geo: aggregated.geo },
        domainHealthScore,
        consistencyScore: brandConsistency,
        authorityMetrics: { schemaCoverage, metadataOptimization: metadataHealth },
        schemaHealthAudit: { overallScore: schemaHealthScore },
        _graderMetadata: {
          version: 'v2', aggregationMethod: 'weighted',
          pagesScored: pagesWithScores.length,
          scoreRanges: aggregated.range, averages: aggregated.averages, median: aggregated.median,
        },
      };

      const finalData = {
        ...scanResults, pages: pagesWithScores, robotsTxt, sitemap,
        totalWords, schemaCount, avgResponseTime, globalTechScore, ai: standardizedAI,
        siteTypeResult,
        platformDetection: scanResults.pages?.[0]?.platformDetection,
      };

      // Step 6: Validate
      send({ type: 'progress', phase: 'Validating data...', progress: 90 });
      const validatedData = validateAnalysisData(finalData);
      if (!validatedData) throw new Error('Data validation failed');

      debugLog('[Free Audit] Complete', {
        pagesCrawled: validatedData.pagesCrawled,
        seo: validatedData.ai?.scores?.seo,
        aeo: validatedData.ai?.scores?.aeo,
        geo: validatedData.ai?.scores?.geo,
      });

      send({ type: 'result', success: true, data: validatedData, progress: 100 });
    } catch (err: any) {
      console.error('[Free Audit] Error:', err);
      send({ type: 'error', error: err.message || 'Analysis failed' });
    }
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
