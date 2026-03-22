import { NextRequest } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { analyzeWithGemini } from '@/lib/gemini'
import { performLiveInterrogation } from '@/lib/gemini-interrogation'
import { detectSiteType } from '@/lib/site-type-detector'
import { createSSEStream, createProgressTicker, SSE_HEADERS } from '@/lib/sse-helpers'
import { fetchPageSpeedInsights } from '@/lib/pagespeed'
import { getAuthUser, useCredits } from '@/lib/supabase/auth-helpers'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const { url } = await request.json()

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Auth + credit check (Pro Audit = 10 credits)
  const user = await getAuthUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!user.is_admin) {
    const { allowed } = await useCredits(user.id, 10)
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Insufficient credits. Pro Audit costs 10 credits.' }), {
        status: 402, headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const stream = createSSEStream(async (send) => {
    try {
      // Step 1: Crawl
      send({ type: 'progress', phase: 'Crawling page and extracting content...', progress: 10 })
      const pageData = await performScan(url)
      send({ type: 'progress', phase: 'Detecting site type...', progress: 25 })

      // Step 2: Site type
      const siteTypeResult = detectSiteType(pageData, [])
      pageData.siteType = siteTypeResult.primaryType
      send({ type: 'progress', phase: `Detected: ${siteTypeResult.primaryType}. Starting AI analysis...`, progress: 30 })

      // Step 3: AI Analysis + PageSpeed (all parallel)
      const geminiPromise = analyzeWithGemini({
        title: pageData.title, description: pageData.description,
        thinnedText: pageData.thinnedText, summarizedContent: pageData.summarizedContent,
        schemas: pageData.schemas, structuralData: pageData.structuralData,
        platform: pageData.platformDetection?.label,
      })
      const interrogationPromise = performLiveInterrogation({
        domain: pageData.url, title: pageData.title,
        description: pageData.description, contentSummary: pageData.thinnedText,
      })
      const pageSpeedPromise = fetchPageSpeedInsights(url)

      const ticker1 = createProgressTicker(send, 'Analyzing content with Gemini AI...', 30, 70)
      const liveInterrogation = await interrogationPromise
      let sub = ticker1.stop()
      sub = Math.max(sub, 60)
      send({ type: 'progress', phase: 'Live interrogation complete. Waiting for deep analysis...', progress: sub })

      const ticker2 = createProgressTicker(send, 'Deep AI analysis in progress...', sub, 85)
      const aiAnalysis = await geminiPromise
      ticker2.stop()

      pageData.semanticFlags = aiAnalysis.semanticFlags
      pageData.schemaQuality = aiAnalysis.schemaQuality
      pageData.aiAnalysis = aiAnalysis
      pageData.liveInterrogation = liveInterrogation
      send({ type: 'progress', phase: 'AI complete. Calculating scores...', progress: 78 })

      // Step 4: Grade
      const graderResult = calculateScoresFromScanResult(pageData)
      send({ type: 'progress', phase: 'Generating actionable fixes...', progress: 88 })

      // Step 5: Enhanced penalties
      let enhancedPenalties: any[] = []
      try {
        enhancedPenalties = convertBreakdownToEnhancedPenalties(graderResult.breakdown.seo, graderResult.breakdown.aeo, graderResult.breakdown.geo, pageData.platformDetection?.platform)
      } catch (e: any) { console.error('[V3 API] Penalty error:', e.message) }

      send({ type: 'progress', phase: 'Finalizing report...', progress: 95 })

      const scores = { seo: { score: graderResult.seoScore }, aeo: { score: graderResult.aeoScore }, geo: { score: graderResult.geoScore } }
      const cwv = await pageSpeedPromise

      send({ type: 'progress', phase: 'Audit complete!', progress: 100 })
      send({ type: 'result', success: true, data: {
        url, pageData, scores, graderResult, enhancedPenalties, siteTypeResult,
        platformDetection: pageData.platformDetection,
        aiAnalysis, liveInterrogation, cwv, analyzedAt: new Date().toISOString(), version: 'v3'
      }})
    } catch (error: any) {
      console.error('[V3 API] Error:', error)
      send({ type: 'error', success: false, error: error.message || 'Analysis failed' })
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
