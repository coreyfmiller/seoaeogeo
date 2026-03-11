import { NextResponse } from 'next/server';
import { performScan } from '@/lib/crawler';
import { analyzeWithGemini } from '@/lib/gemini';
import { performLiveInterrogation } from '@/lib/gemini-interrogation';
import { calculateDeterministicScores } from '@/lib/grader';
import { calculateScoresV2, convertBreakdownToPenaltyLedger, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2';
import { validateAnalysisData } from '@/lib/data-validator';

// Feature flag: Set to true to use new component-based scoring
const USE_GRADER_V2 = process.env.USE_GRADER_V2 === 'true' || true; // Default to V2

/**
 * Main Analysis API: Receives a URL and runs 
 * the Crawler -> Gemini pipeline.
 */
export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        // 1. Crawler Core (Retrieval)
        console.log(`[API] Starting crawl for: ${url}`);
        const scanResult = await performScan(url);
        console.log(`[API] Crawl finished: ${scanResult.title}`);

        // 2. Gemini Analysis & Live LLM Interrogation (Parallel)
        console.log(`[API] Starting Gemini analysis & Live LLM Interrogation...`);
        const [aiAnalysis, liveInterrogation] = await Promise.all([
            analyzeWithGemini({
                title: scanResult.title,
                description: scanResult.description,
                thinnedText: scanResult.thinnedText,
                summarizedContent: scanResult.summarizedContent, // NEW: Use optimized content
                schemas: scanResult.schemas,
                structuralData: scanResult.structuralData
            }),
            performLiveInterrogation({
                domain: scanResult.url,
                title: scanResult.title,
                description: scanResult.description,
                contentSummary: scanResult.summarizedContent || scanResult.thinnedText, // Use optimized content
            })
        ]);

        console.log(`[API] AI Analysis Complete. Calculating Scores (${USE_GRADER_V2 ? 'V2' : 'V1'})...`);
        
        let gradingResults;
        if (USE_GRADER_V2) {
            // Use new component-based scoring
            const v2Results = calculateScoresV2(
                scanResult.structuralData,
                scanResult.schemas,
                aiAnalysis.semanticFlags,
                scanResult.title.length,
                scanResult.description.length,
                scanResult.url,
                scanResult.title,
                scanResult.description,
                aiAnalysis.schemaQuality,
                scanResult.responseTimeMs
            );
            
            gradingResults = {
                seoScore: v2Results.seoScore,
                aeoScore: v2Results.aeoScore,
                geoScore: v2Results.geoScore,
                scores: {
                    seo: v2Results.seoScore,
                    aeo: v2Results.aeoScore,
                    geo: v2Results.geoScore
                },
                penaltyLedger: convertBreakdownToPenaltyLedger(v2Results.breakdown.seo),
                enhancedPenalties: convertBreakdownToEnhancedPenalties(
                    v2Results.breakdown.seo,
                    v2Results.breakdown.aeo,
                    v2Results.breakdown.geo
                ),
                scoringVersion: 'v2',
                breakdown: v2Results.breakdown,
                overallFeedback: v2Results.overallFeedback,
                criticalIssues: v2Results.criticalIssues
            };
        } else {
            // Use original scoring
            gradingResults = calculateDeterministicScores(
                scanResult.structuralData,
                scanResult.schemas,
                aiAnalysis.semanticFlags,
                scanResult.title.length,
                scanResult.description.length,
                aiAnalysis.schemaQuality
            );
            gradingResults.scoringVersion = 'v1';
        }

        console.log(`[API] Scoring Complete (${USE_GRADER_V2 ? 'V2' : 'V1'}).`);

        const finalData = {
            ...scanResult,
            ai: {
                ...aiAnalysis,
                ...gradingResults,
                liveInterrogation
            }
        };

        // VALIDATE DATA STRUCTURE
        console.log(`[API] Validating data structure...`);
        const validatedData = validateAnalysisData(finalData);
        if (!validatedData) {
            throw new Error('Data validation failed - AI returned incomplete data');
        }
        console.log(`[API] Data validation passed.`);

        return NextResponse.json({
            success: true,
            data: validatedData
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal analysis error'
        }, { status: 500 });
    }
}
