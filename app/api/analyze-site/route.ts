import { NextResponse } from 'next/server';
import { performDeepScan } from '@/lib/crawler-deep';
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide';

/**
 * Deep Site Analysis API (PRO Feature)
 */
export async function POST(req: Request) {
    try {
        const { url, maxPages = 10 } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

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
            }))
        });

        console.log(`[API PRO] Deep Audit complete.`);

        return NextResponse.json({
            success: true,
            data: {
                ...scanResults,
                robotsTxt,
                sitemap,
                ai: aiAnalysis
            }
        });

    } catch (error: any) {
        console.error('PRO API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Fatal analysis error'
        }, { status: 500 });
    }
}
