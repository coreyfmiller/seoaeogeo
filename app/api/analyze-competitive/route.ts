import { NextResponse } from 'next/server';
import { performScan } from '@/lib/crawler';
import { analyzeCompetitive } from '@/lib/gemini-competitive';
import { analyzeWithGeminiSingle } from '@/lib/gemini';
import { calculateScoresFromScanResult } from '@/lib/grader-v2';
import { detectSiteType } from '@/lib/site-type-detector';
import { getAuthUser, useCredits, refundCredits, incrementScanCount } from '@/lib/supabase/auth-helpers';

/**
 * Competitive Analysis API: Receives two URLs and runs
 * two Crawler instances then a comparative Gemini analysis.
 */
export async function POST(req: Request) {
    let user: Awaited<ReturnType<typeof getAuthUser>> = null;
    try {
        // Auth + credit check (Competitive Intel = 20 credits)
        user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { allowed } = await useCredits(user.id, 20);
        if (!allowed) {
            return NextResponse.json({ error: 'Insufficient credits. Competitive Intel costs 20 credits.' }, { status: 402 });
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

        // Grade both sites with the same AI + grader pipeline as Pro Audit
        const [aiA, aiB] = await Promise.all([
            analyzeWithGeminiSingle({
                title: scanA.title, description: scanA.description,
                thinnedText: scanA.thinnedText, schemas: scanA.schemas,
                structuralData: scanA.structuralData,
            }).catch(() => null),
            analyzeWithGeminiSingle({
                title: scanB.title, description: scanB.description,
                thinnedText: scanB.thinnedText, schemas: scanB.schemas,
                structuralData: scanB.structuralData,
            }).catch(() => null),
        ]);

        const siteTypeA = detectSiteType(scanA, []);
        scanA.siteType = siteTypeA.primaryType;
        if (aiA) { scanA.semanticFlags = aiA.semanticFlags; scanA.schemaQuality = aiA.schemaQuality; }

        const siteTypeB = detectSiteType(scanB, []);
        scanB.siteType = siteTypeB.primaryType;
        if (aiB) { scanB.semanticFlags = aiB.semanticFlags; scanB.schemaQuality = aiB.schemaQuality; }

        const graderA = calculateScoresFromScanResult(scanA);
        const graderB = calculateScoresFromScanResult(scanB);

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

        // Override AI-generated scores with deterministic grader scores (same as Pro Audit)
        if (compareResult.comparison) {
            compareResult.comparison.seo = { ...compareResult.comparison.seo, siteA: graderA.seoScore, siteB: graderB.seoScore };
            compareResult.comparison.aeo = { ...compareResult.comparison.aeo, siteA: graderA.aeoScore, siteB: graderB.aeoScore };
            compareResult.comparison.geo = { ...compareResult.comparison.geo, siteA: graderA.geoScore, siteB: graderB.geoScore };
        }
        if (compareResult.seo) {
            compareResult.seo = { ...compareResult.seo, siteA: graderA.seoScore, siteB: graderB.seoScore };
            compareResult.aeo = { ...compareResult.aeo, siteA: graderA.aeoScore, siteB: graderB.aeoScore };
            compareResult.geo = { ...compareResult.geo, siteA: graderA.geoScore, siteB: graderB.geoScore };
        }

        await incrementScanCount(user.id, 'competitive');

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
        // Refund credits on failure
        if (user) {
            try { await refundCredits(user.id, 20); } catch (e) { console.error('[Competitive] Refund failed:', e); }
        }
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal analysis error',
            creditsRefunded: user ? 20 : 0,
        }, { status: 500 });
    }
}
