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
        const scanResult = await performScan(url);

        // 2. Gemini Intelligence (Analysis)
        const aiAnalysis = await analyzeWithGemini({
            title: scanResult.title,
            description: scanResult.description,
            thinnedText: scanResult.thinnedText,
            schemas: scanResult.schemas
        });

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
