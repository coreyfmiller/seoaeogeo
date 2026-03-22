import { NextRequest } from 'next/server';
import { performDeepScan } from '@/lib/crawler-deep';
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide';
import { debugLog, clearDebugLog } from '@/lib/debug-logger';
import { scoreAndAggregatePages } from '@/lib/grader-aggregator';
import { validateAnalysisData } from '@/lib/data-validator';
import { createSSEStream, createProgressTicker, SSE_HEADERS } from '@/lib/sse-helpers';

export const maxDuration = 300

/**
 * Free Audit API — SSE streaming version
 * Crawls up to 5 pages, scores with Grader V2, runs AI synthesis
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
      send({ type: 'progress', phase: 'Scores calculated. Checking robots.txt & sitemap...', progress: 45 });

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

      // Step 4: AI Synthesis
      send({ type: 'progress', phase: 'Running AI domain analysis...', progress: 50 });
      const ticker = createProgressTicker(send, 'Analyzing domain intelligence with AI...', 50, 85);
      const aiAnalysis = await analyzeSitewideIntelligence({
        domain: scanResults.domain,
        pages: pagesWithScores.map(p => ({
          url: p.url, title: p.title, description: p.description,
          schemas: p.schemas, schemaTypes: p.schemaTypes, wordCount: p.wordCount,
          internalLinks: p.internalLinks, hasH1: p.hasH1, isHttps: p.isHttps,
          responseTimeMs: p.responseTimeMs, h2Count: p.h2Count, h3Count: p.h3Count,
          imgTotal: p.imgTotal, imgWithAlt: p.imgWithAlt, outboundLinks: p.outboundLinks,
        }))
      });
      ticker.stop();
      send({ type: 'progress', phase: 'Assembling results...', progress: 90 });

      // Step 5: Aggregate metrics
      const totalWords = pagesWithScores.reduce((acc, p) => acc + (p.wordCount || 0), 0);
      const schemaCount = pagesWithScores.reduce((acc, p) => acc + (p.schemas?.length || 0), 0);
      const avgResponseTime = pagesWithScores.reduce((acc, p) => acc + (p.responseTimeMs || 0), 0) / (scanResults.pagesCrawled || 1);
      const httpsPct = pagesWithScores.filter(p => p.isHttps).length / (scanResults.pagesCrawled || 1);
      const h1Pct = pagesWithScores.filter(p => p.hasH1).length / (scanResults.pagesCrawled || 1);
      const perfPct = pagesWithScores.filter(p => p.responseTimeMs < 1500).length / (scanResults.pagesCrawled || 1);
      const globalTechScore = Math.round((httpsPct * 30) + (h1Pct * 30) + (perfPct * 40));

      // Step 6: Standardize
      const standardizedAI = {
        ...aiAnalysis,
        scores: { seo: aggregated.seo, aeo: aggregated.aeo, geo: aggregated.geo },
        _originalScores: {
          domainHealthScore: aiAnalysis.domainHealthScore,
          consistencyScore: aiAnalysis.consistencyScore,
          aeoReadinessScore: aiAnalysis.aeoReadiness?.overallScore || 0,
        },
        _graderMetadata: {
          version: 'v2', aggregationMethod: 'weighted',
          pagesScored: pagesWithScores.length,
          scoreRanges: aggregated.range, averages: aggregated.averages, median: aggregated.median,
        },
      };

      const finalData = {
        ...scanResults, pages: pagesWithScores, robotsTxt, sitemap,
        totalWords, schemaCount, avgResponseTime, globalTechScore, ai: standardizedAI,
      };

      // Step 7: Validate
      send({ type: 'progress', phase: 'Validating data...', progress: 95 });
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
