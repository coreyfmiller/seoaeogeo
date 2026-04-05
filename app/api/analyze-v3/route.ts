import { NextRequest } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { analyzeWithGemini } from '@/lib/gemini'
import { performLiveInterrogation } from '@/lib/gemini-interrogation'
import { detectSiteType } from '@/lib/site-type-detector'
import { createSSEStream, createProgressTicker, SSE_HEADERS } from '@/lib/sse-helpers'
import { fetchPageSpeedInsights } from '@/lib/pagespeed'
import { getAuthUser, useCredits, refundCredits, incrementScanCount } from '@/lib/supabase/auth-helpers'
import { createScanJob, completeScanJob, failScanJob, updateScanProgress } from '@/lib/scan-jobs'
import { fetchBacklinksWithCache } from '@/lib/backlink-fetcher'
import { saveScanToDb } from '@/lib/scan-history-db'
import { generateAIExpertAnalysis } from '@/lib/gemini-expert-analysis'

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

  const { allowed } = await useCredits(user.id, 10)
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Insufficient credits. Pro Audit costs 10 credits.' }), {
      status: 402, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Create persistent scan job
  try { await createScanJob(user.id, 'pro', url, 10) } catch (e) { console.error('[V4 API] Scan job create failed:', e) }

  const stream = createSSEStream(async (send) => {
    try {
      // Step 1: Crawl
      send({ type: 'progress', phase: 'Crawling page and extracting content...', progress: 10 })
      updateScanProgress(user.id, 'pro', 10, 'Crawling page...').catch(() => {})
      const pageData = await performScan(url)

      // Check for bot protection (Cloudflare, Sucuri, etc.) — both structured and title fallback
      const isBotProtected = pageData.botProtection?.detected ||
        pageData.title?.toLowerCase().includes('just a moment') ||
        pageData.title?.toLowerCase().includes('attention required') ||
        pageData.title?.toLowerCase() === 'robot or human?'

      if (isBotProtected) {
        const protectionType = pageData.botProtection?.type || 'Cloudflare'
        send({ type: 'error', error: `This site has ${protectionType} bot protection enabled. Our crawler received a challenge page instead of the actual website content. Please try disabling bot protection temporarily, or contact your hosting provider to whitelist our crawler.` })
        if (user) { try { await refundCredits(user.id, creditCost) } catch {} }
        return
      }

      send({ type: 'progress', phase: 'Detecting site type...', progress: 25 })
      updateScanProgress(user.id, 'pro', 25, 'Detecting site type...').catch(() => {})

      // Step 2: Site type
      const siteTypeResult = detectSiteType(pageData, [])
      pageData.siteType = siteTypeResult.primaryType
      send({ type: 'progress', phase: `Detected: ${siteTypeResult.primaryType}. Starting AI analysis...`, progress: 30 })
      updateScanProgress(user.id, 'pro', 30, `Detected: ${siteTypeResult.primaryType}. Starting AI...`).catch(() => {})

      // Step 3: AI Analysis + PageSpeed + Backlinks (all parallel)
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
      const backlinkPromise = fetchBacklinksWithCache(url, true)

      const ticker1 = createProgressTicker(send, 'Analyzing content with Gemini AI...', 30, 70)
      const liveInterrogation = await interrogationPromise
      let sub = ticker1.stop()
      sub = Math.max(sub, 60)
      send({ type: 'progress', phase: 'Live interrogation complete. Waiting for deep analysis...', progress: sub })
      updateScanProgress(user.id, 'pro', sub, 'Live interrogation complete. Deep analysis...').catch(() => {})

      const ticker2 = createProgressTicker(send, 'Deep AI analysis in progress...', sub, 85)
      const aiAnalysis = await geminiPromise
      ticker2.stop()

      pageData.semanticFlags = aiAnalysis.semanticFlags
      pageData.schemaQuality = aiAnalysis.schemaQuality
      pageData.aiAnalysis = aiAnalysis

      // Override heuristic site type with AI-detected type if available
      if (aiAnalysis.detectedSiteType && aiAnalysis.detectedSiteType !== 'general') {
        const aiSiteType = aiAnalysis.detectedSiteType
        if (aiSiteType !== siteTypeResult.primaryType) {
          console.log(`[V3 API] AI site type override: ${siteTypeResult.primaryType} → ${aiSiteType}`)
          siteTypeResult.primaryType = aiSiteType
          pageData.siteType = aiSiteType
        }
      }
      pageData.liveInterrogation = liveInterrogation
      send({ type: 'progress', phase: 'AI complete. Calculating scores...', progress: 78 })
      updateScanProgress(user.id, 'pro', 78, 'Calculating scores...').catch(() => {})

      // Step 4: Grade
      const graderResult = calculateScoresFromScanResult(pageData)
      send({ type: 'progress', phase: 'Generating actionable fixes...', progress: 88 })
      updateScanProgress(user.id, 'pro', 88, 'Generating actionable fixes...').catch(() => {})

      // Step 5: Enhanced penalties
      let enhancedPenalties: any[] = []
      try {
        enhancedPenalties = convertBreakdownToEnhancedPenalties(graderResult.breakdown.seo, graderResult.breakdown.aeo, graderResult.breakdown.geo, pageData.platformDetection?.platform)
      } catch (e: any) { console.error('[V4 API] Penalty error:', e.message) }

      send({ type: 'progress', phase: 'Finalizing report...', progress: 95 })
      updateScanProgress(user.id, 'pro', 95, 'Finalizing report...').catch(() => {})

      const scores = { seo: { score: graderResult.seoScore }, aeo: { score: graderResult.aeoScore }, geo: { score: graderResult.geoScore } }
      const cwv = await pageSpeedPromise
      const backlinkData = await backlinkPromise

      // Generate AI expert analysis
      const sd = pageData.structuralData || {}
      let expertAnalysis: string | null = null
      try {
        expertAnalysis = await generateAIExpertAnalysis({
          context: 'pro-audit', url,
          scores: { seo: graderResult.seoScore, aeo: graderResult.aeoScore, geo: graderResult.geoScore },
          siteType: siteTypeResult.primaryType, platform: pageData.platformDetection?.label,
          wordCount: sd.wordCount, schemaCount: (pageData.schemas || []).length,
          criticalIssues: graderResult.criticalIssues,
          domainAuthority: backlinkData?.metrics?.domainAuthority,
          totalBacklinks: backlinkData?.metrics?.totalBacklinks,
          spamScore: backlinkData?.metrics?.spamScore,
          responseTimeMs: pageData.technical?.responseTimeMs,
          hasH1: (sd.semanticTags?.h1Count || 0) > 0,
          altTextPct: sd.media?.totalImages > 0 ? Math.round((sd.media.imagesWithAlt / sd.media.totalImages) * 100) : 100,
          internalLinks: sd.links?.internal, externalLinks: sd.links?.external,
        })
      } catch (err) {
        console.error('[V4 API] Expert analysis failed:', err instanceof Error ? err.message : err)
      }

      send({ type: 'progress', phase: 'Audit complete!', progress: 100 })
      await incrementScanCount(user.id, 'pro')
      const resultData = {
        url, pageData, scores, graderResult, enhancedPenalties, siteTypeResult,
        platformDetection: pageData.platformDetection,
        aiAnalysis, liveInterrogation, cwv, backlinkData, expertAnalysis,
        analyzedAt: new Date().toISOString(), version: 'v4'
      }
      // Persist result to scan_jobs so user can retrieve it if they navigated away
      try { await completeScanJob(user.id, 'pro', resultData) } catch (e) { console.error('[V4 API] Scan job complete failed:', e) }
      // Save to persistent scan history
      saveScanToDb(user.id, 'pro', url, { seo: graderResult.seoScore, aeo: graderResult.aeoScore, geo: graderResult.geoScore }, resultData).catch(() => {})
      send({ type: 'result', success: true, data: resultData })
    } catch (error: any) {
      console.error('[V4 API] Error:', error)
      // Refund credits on failure
      try { await refundCredits(user.id, 10) } catch (e) { console.error('[V4 API] Refund failed:', e) }
      try { await failScanJob(user.id, 'pro') } catch (e) { console.error('[V4 API] Scan job fail update failed:', e) }
      send({ type: 'error', success: false, error: error.message || 'Analysis failed', creditsRefunded: 10 })
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
