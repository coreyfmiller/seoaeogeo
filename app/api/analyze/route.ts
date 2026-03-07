import { NextResponse } from 'next/server';
import { performScan } from '@/lib/crawler';
import { analyzeWithGemini } from '@/lib/gemini';
import { performLiveInterrogation } from '@/lib/gemini-interrogation';

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
                schemas: scanResult.schemas,
                structuralData: scanResult.structuralData
            }),
            performLiveInterrogation({
                domain: scanResult.url,
                title: scanResult.title,
                description: scanResult.description,
                contentSummary: scanResult.thinnedText,
            })
        ]);

        console.log(`[API] Analysis complete.`);

        return NextResponse.json({
            success: true,
            data: {
                ...scanResult,
                ai: {
                    ...aiAnalysis,
                    liveInterrogation
                }
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal analysis error'
        }, { status: 500 });
    }
}
