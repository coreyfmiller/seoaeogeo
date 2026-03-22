import { NextResponse } from 'next/server';
import { performScan } from '@/lib/crawler';
import { analyzeCompetitive } from '@/lib/gemini-competitive';
import { getAuthUser, useCredits } from '@/lib/supabase/auth-helpers';

/**
 * Competitive Analysis API: Receives two URLs and runs
 * two Crawler instances then a comparative Gemini analysis.
 */
export async function POST(req: Request) {
    try {
        // Auth + credit check (Competitive Intel = 20 credits)
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!user.is_admin) {
            const { allowed } = await useCredits(user.id, 20);
            if (!allowed) {
                return NextResponse.json({ error: 'Insufficient credits. Competitive Intel costs 20 credits.' }, { status: 402 });
            }
        }

        const { siteAUrl, siteBUrl } = await req.json();

        if (!siteAUrl || !siteBUrl) {
            return NextResponse.json({ error: 'Two URLs are required for comparison' }, { status: 400 });
        }

        // 1. Crawler Core (Deep Retrieval - Parallel)
        console.log(`[API] Starting dual crawl for: ${siteAUrl} VS ${siteBUrl}`);
        const [scanA, scanB] = await Promise.all([
            performScan(siteAUrl, { lightweight: true }),
            performScan(siteBUrl, { lightweight: true })
        ]);

        // 2. Comparative Gemini Analysis
        console.log(`[API] Starting Comparative Gemini analysis...`);
        const compareResult = await analyzeCompetitive(
            {
                url: siteAUrl,
                title: scanA.title,
                description: scanA.description,
                thinnedText: scanA.thinnedText,
                schemas: scanA.schemas
            },
            {
                url: siteBUrl,
                title: scanB.title,
                description: scanB.description,
                thinnedText: scanB.thinnedText,
                schemas: scanB.schemas
            },
            { platform: scanA.platformDetection?.label }
        );

        console.log(`[API] Comparison Analysis complete.`);

        return NextResponse.json({
            success: true,
            data: {
                siteA: scanA,
                siteB: scanB,
                comparison: compareResult,
                platformDetection: scanA.platformDetection,
            }
        });

    } catch (error: any) {
        console.error('Competitive API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal analysis error'
        }, { status: 500 });
    }
}
