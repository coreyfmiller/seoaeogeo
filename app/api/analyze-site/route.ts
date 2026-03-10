import { NextResponse } from 'next/server';
import { performDeepScan } from '@/lib/crawler-deep';
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide';
import { saveTestSnapshot } from '@/lib/test-data-store';
import { debugLog, clearDebugLog } from '@/lib/debug-logger';

/**
 * Deep Site Analysis API (PRO Feature)
 */
export async function POST(req: Request) {
    try {
        clearDebugLog(); // Clear previous logs
        const { url, maxPages = 10, saveSnapshot = false } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        debugLog('[API PRO] Starting Deep Site Audit', { url, maxPages });
        console.log(`[API PRO] Starting Deep Site Audit for: ${url}`);

        // 1. Deep Crawler (Parallel Multi-Page Scan)
        const scanResults = await performDeepScan(url, maxPages);
        console.log(`[API PRO] Crawled ${scanResults.pagesCrawled} pages.`);

        // 2. Robots.txt & Sitemap check (simple fetch, no Playwright needed)
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
            console.warn('[API PRO] robots.txt/sitemap check failed:', e);
        }

        // 3. Aggregate AI Analysis (Synthesis)
        console.log(`[API PRO] Running AI synthesis...`);
        const aiAnalysis = await analyzeSitewideIntelligence({
            domain: scanResults.domain,
            pages: scanResults.pages.map(p => ({
                url: p.url,
                title: p.title,
                description: p.description,
                schemas: p.schemas,
                schemaTypes: p.schemaTypes,
                wordCount: p.wordCount,
                internalLinks: p.internalLinks,
                hasH1: p.hasH1,
                isHttps: p.isHttps,
                responseTimeMs: p.responseTimeMs,
                h2Count: p.h2Count,
                h3Count: p.h3Count,
                imgTotal: p.imgTotal,
                imgWithAlt: p.imgWithAlt,
                outboundLinks: p.outboundLinks,
            }))
        });
        console.log(`[API PRO] AI analysis complete. Domain health score:`, aiAnalysis.domainHealthScore);
        console.log(`[API PRO] AI analysis keys:`, Object.keys(aiAnalysis));
        debugLog('[API PRO] AI analysis complete', { 
            domainHealthScore: aiAnalysis.domainHealthScore,
            keys: Object.keys(aiAnalysis),
            hasRecommendations: !!aiAnalysis.recommendations,
            recommendationsCount: aiAnalysis.recommendations?.length
        });

        // 4. Calculate Aggregate Metrics for Dashboard
        const totalWords = scanResults.pages.reduce((acc, p) => acc + (p.wordCount || 0), 0);
        const schemaCount = scanResults.pages.reduce((acc, p) => acc + (p.schemas?.length || 0), 0);
        const avgResponseTime = scanResults.pages.reduce((acc, p) => acc + (p.responseTimeMs || 0), 0) / (scanResults.pagesCrawled || 1);

        // Final tech score (weighted: 33% https, 33% H1s, 33% performance)
        const httpsPct = scanResults.pages.filter(p => p.isHttps).length / (scanResults.pagesCrawled || 1);
        const h1Pct = scanResults.pages.filter(p => p.hasH1).length / (scanResults.pagesCrawled || 1);
        const perfPct = scanResults.pages.filter(p => p.responseTimeMs < 1500).length / (scanResults.pagesCrawled || 1);
        const globalTechScore = Math.round((httpsPct * 30) + (h1Pct * 30) + (perfPct * 40));

        console.log(`[API PRO] Deep Audit complete.`);

        const finalData = {
            ...scanResults,
            robotsTxt,
            sitemap,
            totalWords,
            schemaCount,
            avgResponseTime,
            globalTechScore,
            ai: aiAnalysis
        };

        debugLog('[API PRO] Final data assembled', {
            pagesCrawled: finalData.pagesCrawled,
            globalTechScore: finalData.globalTechScore,
            aiDomainHealthScore: finalData.ai?.domainHealthScore,
            aiConsistencyScore: finalData.ai?.consistencyScore
        });

        // Save test snapshot if requested (for variance testing)
        if (saveSnapshot) {
            try {
                saveTestSnapshot({
                    timestamp: new Date().toISOString(),
                    url: scanResults.domain,
                    type: 'deep-site',
                    crawlData: {
                        pages: scanResults.pages,
                        totalWords,
                        schemaCount,
                        avgResponseTime,
                        pagesCrawled: scanResults.pagesCrawled,
                    },
                    aiResponses: {
                        raw: JSON.stringify(aiAnalysis),
                        parsed: aiAnalysis,
                        model: aiAnalysis._metadata?.model || 'gemini-2.5-flash',
                        inputTokens: aiAnalysis._metadata?.inputTokens || 0,
                        outputTokens: aiAnalysis._metadata?.outputTokens || 0,
                    },
                    scores: {
                        deterministic: {
                            schemaQuality: aiAnalysis.schemaHealthAudit?.overallScore || 0,
                            brandConsistency: aiAnalysis.consistencyScore || 0,
                            schemaValidation: aiAnalysis.schemaHealthAudit,
                            brandBreakdown: aiAnalysis.brandConsistencyBreakdown,
                        },
                        final: finalData,
                    },
                });
                console.log(`[API PRO] Test snapshot saved for ${scanResults.domain}`);
            } catch (snapshotError) {
                console.error('[API PRO] Failed to save snapshot:', snapshotError);
                // Don't fail the request if snapshot fails
            }
        }

        return NextResponse.json({
            success: true,
            data: finalData
        });

    } catch (error: any) {
        console.error('PRO API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Fatal analysis error'
        }, { status: 500 });
    }
}
