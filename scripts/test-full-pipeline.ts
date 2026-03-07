import { performScan } from '../lib/crawler';
import { analyzeWithGemini } from '../lib/gemini';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('Using Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 4) + '...' + process.env.GOOGLE_GENERATIVE_AI_API_KEY?.slice(-4));

async function testFullPipeline() {
    const url = 'https://www.google.com';
    console.log(`🚀 Testing Full Pipeline for: ${url}`);

    try {
        // 1. Crawl
        console.log('--- Step 1: Crawling ---');
        const scanResult = await performScan(url);
        console.log('✅ Crawl Successful. Title:', scanResult.title);

        // 2. AI Analysis
        console.log('--- Step 2: Gemini Analysis ---');
        const aiResult = await analyzeWithGemini({
            title: scanResult.title,
            description: scanResult.description,
            thinnedText: scanResult.thinnedText,
            schemas: scanResult.schemas
        });

        console.log('✅ AI Analysis Successful!');
        console.log('SEO Score:', aiResult.scores.seo);
        console.log('AEO Score:', aiResult.scores.aeo);
        console.log('GEO Score:', aiResult.scores.geo);
        console.log('Recommendations Count:', aiResult.recommendations.length);
        console.log('------------------------');
    } catch (error) {
        console.error('❌ Pipeline Failed:', error);
    }
}

testFullPipeline();
