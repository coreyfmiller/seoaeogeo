import { NextResponse } from 'next/server';
import { performScan } from '@/lib/crawler';
import { analyzeWithGemini } from '@/lib/gemini';

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

        // 2. Gemini Intelligence (Analysis)
        console.log(`[API] Starting Gemini analysis...`);
        const aiAnalysis = await analyzeWithGemini({
            title: scanResult.title,
            description: scanResult.description,
            thinnedText: scanResult.thinnedText,
            schemas: scanResult.schemas,
            structuralData: scanResult.structuralData

        });
        console.log(`[API] Analysis complete.`);

        return NextResponse.json({
            success: true,
            data: {
                ...scanResult,
                ai: aiAnalysis
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
