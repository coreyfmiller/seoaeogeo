import { performScan } from '@/lib/crawler';
import { analyzeWithGemini } from '@/lib/gemini';
import { performLiveInterrogation } from '@/lib/gemini-interrogation';
import { calculateDeterministicScores } from '@/lib/grader';
import { calculateScoresV2, convertBreakdownToPenaltyLedger, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2';
import { validateAnalysisData } from '@/lib/data-validator';
import { createSSEStream, createProgressTicker, SSE_HEADERS } from '@/lib/sse-helpers';

const USE_GRADER_V2 = process.env.USE_GRADER_V2 === 'true' || true;

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'No URL provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = createSSEStream(async (send) => {
    try {
      // Phase 1: Crawling
      send({ type: 'progress', phase: 'Crawling page and extracting content...', progress: 10 });
      const scanResult = await performScan(url);
      send({ type: 'progress', phase: 'Crawl complete. Starting AI analysis...', progress: 30 });

      // Phase 2: AI Analysis (parallel with progress ticker)
      send({ type: 'progress', phase: 'Analyzing content with Gemini AI...', progress: 35 });

      const geminiPromise = analyzeWithGemini({
        title: scanResult.title,
        description: scanResult.description,
        thinnedText: scanResult.thinnedText,
        summarizedContent: scanResult.summarizedContent,
        schemas: scanResult.schemas,
        structuralData: scanResult.structuralData
      });
      const interrogationPromise = performLiveInterrogation({
        domain: scanResult.url,
        title: scanResult.title,
        description: scanResult.description,
        contentSummary: scanResult.thinnedText,
      });

      const ticker1 = createProgressTicker(send, 'Analyzing content with Gemini AI...', 35, 75);
      const liveInterrogation = await interrogationPromise;
      let subProgress = ticker1.stop();
      subProgress = Math.max(subProgress, 65);
      send({ type: 'progress', phase: 'Live interrogation complete. Waiting for deep analysis...', progress: subProgress });

      const ticker2 = createProgressTicker(send, 'Deep AI analysis in progress...', subProgress, 90);
      const aiAnalysis = await geminiPromise;
      ticker2.stop();
      send({ type: 'progress', phase: 'AI analysis complete. Calculating scores...', progress: 75 });

      // Phase 3: Scoring
      let gradingResults;
      if (USE_GRADER_V2) {
        const v2Results = calculateScoresV2(
          scanResult.structuralData, scanResult.schemas, aiAnalysis.semanticFlags,
          scanResult.title.length, scanResult.description.length,
          scanResult.url, scanResult.title, scanResult.description,
          aiAnalysis.schemaQuality, scanResult.responseTimeMs
        );
        gradingResults = {
          seoScore: v2Results.seoScore, aeoScore: v2Results.aeoScore, geoScore: v2Results.geoScore,
          scores: { seo: v2Results.seoScore, aeo: v2Results.aeoScore, geo: v2Results.geoScore },
          penaltyLedger: convertBreakdownToPenaltyLedger(v2Results.breakdown.seo),
          enhancedPenalties: convertBreakdownToEnhancedPenalties(
            v2Results.breakdown.seo, v2Results.breakdown.aeo, v2Results.breakdown.geo,
            scanResult?.platformDetection?.platform
          ),
          scoringVersion: 'v2', breakdown: v2Results.breakdown,
          overallFeedback: v2Results.overallFeedback, criticalIssues: v2Results.criticalIssues
        };
      } else {
        gradingResults = calculateDeterministicScores(
          scanResult.structuralData, scanResult.schemas, aiAnalysis.semanticFlags,
          scanResult.title.length, scanResult.description.length, aiAnalysis.schemaQuality
        );
        gradingResults.scoringVersion = 'v1';
      }
      send({ type: 'progress', phase: 'Validating and finalizing report...', progress: 90 });

      // Phase 4: Validation
      const finalData = { ...scanResult, ai: { ...aiAnalysis, ...gradingResults, liveInterrogation } };
      const validatedData = validateAnalysisData(finalData);
      if (!validatedData) throw new Error('Data validation failed - AI returned incomplete data');

      send({ type: 'progress', phase: 'Audit complete!', progress: 100 });
      send({ type: 'result', success: true, data: validatedData });
    } catch (error: any) {
      console.error('API Error:', error);
      send({ type: 'error', success: false, error: error.message || 'Internal analysis error' });
    }
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
