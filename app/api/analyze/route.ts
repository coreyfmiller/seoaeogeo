import { performScan } from '@/lib/crawler';
import { analyzeWithGemini } from '@/lib/gemini';
import { performLiveInterrogation } from '@/lib/gemini-interrogation';
import { calculateDeterministicScores } from '@/lib/grader';
import { calculateScoresV2, convertBreakdownToPenaltyLedger, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2';
import { validateAnalysisData } from '@/lib/data-validator';

const USE_GRADER_V2 = process.env.USE_GRADER_V2 === 'true' || true;

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'No URL provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(sseEvent(data)));
      };

      try {
        // Phase 1: Crawling
        send({ type: 'progress', phase: 'Crawling page and extracting content...', progress: 10 });
        console.log(`[API] Starting crawl for: ${url}`);
        const scanResult = await performScan(url);
        console.log(`[API] Crawl finished: ${scanResult.title}`);
        send({ type: 'progress', phase: 'Crawl complete. Starting AI analysis...', progress: 30 });

        // Phase 2: AI Analysis + Live Interrogation (separate for granular progress)
        send({ type: 'progress', phase: 'Analyzing content with Gemini AI...', progress: 35 });
        console.log(`[API] Starting Gemini analysis...`);

        // Start both but track them separately
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

        // Tick progress while waiting so the bar doesn't stall
        let subProgress = 35;
        const ticker = setInterval(() => {
          subProgress = Math.min(subProgress + 4, 75);
          send({ type: 'progress', phase: 'Analyzing content with Gemini AI...', progress: subProgress });
        }, 2000);

        // Wait for interrogation first (usually faster)
        const liveInterrogation = await interrogationPromise;
        clearInterval(ticker);
        subProgress = Math.max(subProgress, 65);
        send({ type: 'progress', phase: 'Live interrogation complete. Waiting for deep analysis...', progress: subProgress });

        // Resume ticking for the Gemini wait
        const ticker2 = setInterval(() => {
          subProgress = Math.min(subProgress + 4, 90);
          send({ type: 'progress', phase: 'Deep AI analysis in progress...', progress: subProgress });
        }, 2000);

        const aiAnalysis = await geminiPromise;
        clearInterval(ticker2);
        send({ type: 'progress', phase: 'AI analysis complete. Calculating scores...', progress: 75 });

        // Phase 3: Scoring
        console.log(`[API] AI Analysis Complete. Calculating Scores (${USE_GRADER_V2 ? 'V2' : 'V1'})...`);
        let gradingResults;
        if (USE_GRADER_V2) {
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
            scores: { seo: v2Results.seoScore, aeo: v2Results.aeoScore, geo: v2Results.geoScore },
            penaltyLedger: convertBreakdownToPenaltyLedger(v2Results.breakdown.seo),
            enhancedPenalties: convertBreakdownToEnhancedPenalties(
              v2Results.breakdown.seo, v2Results.breakdown.aeo, v2Results.breakdown.geo
            ),
            scoringVersion: 'v2',
            breakdown: v2Results.breakdown,
            overallFeedback: v2Results.overallFeedback,
            criticalIssues: v2Results.criticalIssues
          };
        } else {
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
        send({ type: 'progress', phase: 'Validating and finalizing report...', progress: 90 });

        // Phase 4: Validation
        console.log(`[API] Validating data structure...`);
        const finalData = {
          ...scanResult,
          ai: { ...aiAnalysis, ...gradingResults, liveInterrogation }
        };
        const validatedData = validateAnalysisData(finalData);
        if (!validatedData) {
          throw new Error('Data validation failed - AI returned incomplete data');
        }
        console.log(`[API] Data validation passed.`);

        // Final: Send result
        send({ type: 'progress', phase: 'Audit complete!', progress: 100 });
        send({ type: 'result', success: true, data: validatedData });
      } catch (error: any) {
        console.error('API Error:', error);
        send({ type: 'error', success: false, error: error.message || 'Internal analysis error' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
