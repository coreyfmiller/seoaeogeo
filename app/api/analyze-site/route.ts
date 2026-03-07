import { NextResponse } from 'next/server';
import { performDeepScan } from '@/lib/crawler-deep';
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide';

/**
 * Deep Site Analysis API (PRO Feature)
 */
export async function POST(req: Request) {
    try {
        const { url, maxPages = 10 } = await req.json();

        // 1. Paid Feature Check Placeholder (Paywall Logic goes here)
        // const isPro = checkUserPlan(req); 
        // if (!isPro) return NextResponse.json({ error: 'Pro Plan Required' }, { status: 403 });

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        console.log(`[API PRO] Starting Deep Site Audit for: ${url}`);

        // 2. Deep Crawler (Parallel Multi-Page Scan)
        const scanResults = await performDeepScan(url, maxPages);
        console.log(`[API PRO] Crawled ${scanResults.pagesCrawled} pages.`);

        // 3. Aggregate AI Analysis (Synthesis)
        console.log(`[API PRO] Running AI synthesis...`);
        const aiAnalysis = await analyzeSitewideIntelligence({
            domain: scanResults.domain,
            pages: scanResults.pages.map(p => ({
                url: p.url,
                title: p.title,
                description: p.description,
                schemas: p.schemas
            }))
        });

        console.log(`[API PRO] Deep Audit complete.`);

        return NextResponse.json({
            success: true,
            data: {
                ...scanResults,
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
