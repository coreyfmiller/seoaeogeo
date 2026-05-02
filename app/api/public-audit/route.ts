import { NextRequest, NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { analyzeWithGemini } from '@/lib/gemini'
import { performLiveInterrogation } from '@/lib/gemini-interrogation'
import { detectSiteType } from '@/lib/site-type-detector'
import { fetchPageSpeedInsights } from '@/lib/pagespeed'
import { fetchBacklinksWithCache } from '@/lib/backlink-fetcher'
import { generateAIExpertAnalysis } from '@/lib/gemini-expert-analysis'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const maxDuration = 300

// ---------------------------------------------------------------------------
// Rate limiter: 3 requests per minute per API key
// ---------------------------------------------------------------------------
const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60_000
const requestLog = new Map<string, number[]>()

function checkRateLimit(key: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now()
  const timestamps = (requestLog.get(key) || []).filter(t => now - t < RATE_WINDOW_MS)

  if (timestamps.length >= RATE_LIMIT) {
    const oldestInWindow = timestamps[0]
    return { allowed: false, remaining: 0, retryAfterMs: RATE_WINDOW_MS - (now - oldestInWindow) }
  }

  timestamps.push(now)
  requestLog.set(key, timestamps)
  return { allowed: true, remaining: RATE_LIMIT - timestamps.length, retryAfterMs: 0 }
}

// ---------------------------------------------------------------------------
// Log API usage (fire-and-forget)
// ---------------------------------------------------------------------------
function logApiUsage(
  url: string,
  scores: { seo: number; aeo: number; geo: number } | null,
  durationMs: number,
  success: boolean,
  error?: string
) {
  supabaseAdmin.from('api_usage_log').insert({
    api_key: 'public-audit',
    url,
    seo_score: scores?.seo ?? 0,
    geo_score: scores?.geo ?? 0,
    duration_ms: durationMs,
    success,
    error: error || null,
  }).then(() => {}).catch(() => {})
}

/**
 * Strip fix instructions from enhanced penalties.
 * Keeps: category, component, penalty, explanation, severity, pointsDeducted
 * Removes: fix (the actual implementation steps)
 */
function stripFixes(penalties: any[]): any[] {
  return penalties.map(p => ({
    category: p.category,
    component: p.component,
    penalty: p.penalty,
    explanation: p.explanation,
    severity: p.severity,
    pointsDeducted: p.pointsDeducted,
  }))
}

/**
 * Strip fix instructions from AI recommendations.
 * Keeps: rank, title, description, priority, effort, domain, impact, impactedScores, affectedElement
 * Removes: howToFix, codeSnippet
 */
function stripRecommendationFixes(recommendations: any[]): any[] {
  if (!recommendations) return []
  return recommendations.map(r => ({
    rank: r.rank,
    title: r.title,
    description: r.description,
    affectedElement: r.affectedElement,
    priority: r.priority,
    effort: r.effort,
    domain: r.domain,
    impact: r.impact,
    impactedScores: r.impactedScores,
  }))
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // 1. API key auth
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.PUBLIC_AUDIT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized. Provide a valid x-api-key header.' }, { status: 401 })
  }

  // 2. Rate limit
  const rateCheck = checkRateLimit(apiKey)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 3 requests per minute.', retryAfterMs: rateCheck.retryAfterMs },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
    )
  }

  // 3. Parse body
  let url: string
  try {
    const body = await request.json()
    url = body.url
  } catch {
    return NextResponse.json({ error: 'Invalid request body. Expected JSON with { "url": "..." }' }, { status: 400 })
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  try {
    // -----------------------------------------------------------------------
    // Step 1: Crawl the page
    // -----------------------------------------------------------------------
    const pageData = await performScan(url)

    if (pageData.botProtection?.detected) {
      const durationMs = Date.now() - startTime
      logApiUsage(url, null, durationMs, false, `Bot protection: ${pageData.botProtection.type}`)
      return NextResponse.json({
        error: 'Bot protection detected. The site returned a challenge page instead of content.',
        type: pageData.botProtection.type,
      }, { status: 422 })
    }

    // -----------------------------------------------------------------------
    // Step 2: Site type detection
    // -----------------------------------------------------------------------
    const siteTypeResult = detectSiteType(pageData, [])
    ;(pageData as any).siteType = siteTypeResult.primaryType

    // -----------------------------------------------------------------------
    // Step 3: AI Analysis + PageSpeed + Backlinks + Live Interrogation (parallel)
    // -----------------------------------------------------------------------
    const [aiResult, pageSpeedResult, backlinkResult, interrogationResult] = await Promise.allSettled([
      analyzeWithGemini({
        title: pageData.title,
        description: pageData.description,
        thinnedText: pageData.thinnedText,
        summarizedContent: pageData.summarizedContent,
        schemas: pageData.schemas,
        structuralData: pageData.structuralData,
        platform: pageData.platformDetection?.label,
      }),
      fetchPageSpeedInsights(url),
      fetchBacklinksWithCache(url, true),
      performLiveInterrogation({
        domain: pageData.url,
        title: pageData.title,
        description: pageData.description,
        contentSummary: pageData.thinnedText,
      }),
    ])

    // Inject AI results
    const aiAnalysis = aiResult.status === 'fulfilled' ? aiResult.value : null
    if (aiAnalysis) {
      ;(pageData as any).semanticFlags = aiAnalysis.semanticFlags
      ;(pageData as any).schemaQuality = aiAnalysis.schemaQuality
      ;(pageData as any).aiAnalysis = aiAnalysis

      if (aiAnalysis.detectedSiteType && aiAnalysis.detectedSiteType !== 'general') {
        siteTypeResult.primaryType = aiAnalysis.detectedSiteType
        ;(pageData as any).siteType = aiAnalysis.detectedSiteType
      }
    }

    const cwv = pageSpeedResult.status === 'fulfilled' ? pageSpeedResult.value : null
    const backlinkData = backlinkResult.status === 'fulfilled' ? backlinkResult.value : null
    const liveInterrogation = interrogationResult.status === 'fulfilled' ? interrogationResult.value : null

    // -----------------------------------------------------------------------
    // Step 4: Grade
    // -----------------------------------------------------------------------
    const graderResult = calculateScoresFromScanResult(pageData)

    // -----------------------------------------------------------------------
    // Step 5: Enhanced penalties (strip fixes)
    // -----------------------------------------------------------------------
    let enhancedPenalties: any[] = []
    try {
      const rawPenalties = convertBreakdownToEnhancedPenalties(
        graderResult.breakdown.seo,
        graderResult.breakdown.aeo,
        graderResult.breakdown.geo,
        pageData.platformDetection?.platform
      )
      enhancedPenalties = stripFixes(rawPenalties)
    } catch (e: any) {
      console.error('[Public Audit API] Penalty error:', e.message)
    }

    // -----------------------------------------------------------------------
    // Step 6: Expert analysis
    // -----------------------------------------------------------------------
    const sd = pageData.structuralData || {}
    let expertAnalysis: any = null
    try {
      expertAnalysis = await generateAIExpertAnalysis({
        context: 'pro-audit',
        url,
        scores: { seo: graderResult.seoScore, aeo: graderResult.aeoScore, geo: graderResult.geoScore },
        siteType: siteTypeResult.primaryType,
        platform: pageData.platformDetection?.label,
        wordCount: sd.wordCount,
        schemaCount: (pageData.schemas || []).length,
        criticalIssues: graderResult.criticalIssues,
        domainAuthority: backlinkData?.metrics?.domainAuthority,
        totalBacklinks: backlinkData?.metrics?.totalBacklinks,
        spamScore: backlinkData?.metrics?.spamScore,
        responseTimeMs: pageData.technical?.responseTimeMs,
        hasH1: (sd.semanticTags?.h1Count || 0) > 0,
        altTextPct: sd.media?.totalImages > 0 ? Math.round((sd.media.imagesWithAlt / sd.media.totalImages) * 100) : 100,
        internalLinks: sd.links?.internal,
        externalLinks: sd.links?.external,
      })
    } catch (err) {
      console.error('[Public Audit API] Expert analysis failed:', err instanceof Error ? err.message : err)
    }

    // -----------------------------------------------------------------------
    // Step 7: Build response (everything EXCEPT fix instructions)
    // -----------------------------------------------------------------------
    const durationMs = Date.now() - startTime
    const scores = {
      seo: graderResult.seoScore,
      aeo: graderResult.aeoScore,
      geo: graderResult.geoScore,
    }

    logApiUsage(url, scores, durationMs, true)

    const response = {
      url: pageData.url,
      analyzedAt: new Date().toISOString(),
      durationMs,

      // Scores
      scores,

      // Site context
      siteType: {
        primary: siteTypeResult.primaryType,
        secondary: siteTypeResult.secondaryTypes,
        confidence: siteTypeResult.confidence,
      },
      platform: pageData.platformDetection ? {
        platform: pageData.platformDetection.platform,
        label: pageData.platformDetection.label,
        confidence: pageData.platformDetection.confidence,
      } : null,

      // Expert analysis
      expertAnalysis,

      // Roadmap to 100: penalties with severity and points lost, but NO fix instructions
      roadmapTo100: enhancedPenalties,

      // AI recommendations: title, description, priority, domain, impact — but NO howToFix or codeSnippet
      recommendations: stripRecommendationFixes(aiAnalysis?.recommendations || []),

      // On-page AI audit
      onPageAudit: {
        seoAnalysis: aiAnalysis?.seoAnalysis ? {
          onPageIssues: aiAnalysis.seoAnalysis.onPageIssues,
          contentQuality: aiAnalysis.seoAnalysis.contentQuality,
          metaAnalysis: aiAnalysis.seoAnalysis.metaAnalysis,
          keywordOpportunities: aiAnalysis.seoAnalysis.keywordOpportunities,
        } : null,
        aeoAnalysis: aiAnalysis?.aeoAnalysis ? {
          questionsAnswered: aiAnalysis.aeoAnalysis.questionsAnswered,
          missingSchemas: aiAnalysis.aeoAnalysis.missingSchemas,
          snippetEligibilityScore: aiAnalysis.aeoAnalysis.snippetEligibilityScore,
          topOpportunities: aiAnalysis.aeoAnalysis.topOpportunities,
        } : null,
        geoAnalysis: aiAnalysis?.geoAnalysis ? {
          sentimentScore: aiAnalysis.geoAnalysis.sentimentScore,
          brandPerception: aiAnalysis.geoAnalysis.brandPerception,
          citationLikelihood: aiAnalysis.geoAnalysis.citationLikelihood,
          llmContextClarity: aiAnalysis.geoAnalysis.llmContextClarity,
          visibilityGaps: aiAnalysis.geoAnalysis.visibilityGaps,
        } : null,
        schemaQuality: aiAnalysis?.schemaQuality ? {
          score: aiAnalysis.schemaQuality.score,
          hasSchema: aiAnalysis.schemaQuality.hasSchema,
          schemaTypes: aiAnalysis.schemaQuality.schemaTypes,
          issues: aiAnalysis.schemaQuality.issues,
          strengths: aiAnalysis.schemaQuality.strengths,
        } : null,
      },

      // Keyword opportunities (from SEO analysis)
      keywordOpportunities: aiAnalysis?.seoAnalysis?.keywordOpportunities || [],

      // Live AI interrogation
      liveInterrogation: liveInterrogation ? {
        identifiedQuery: liveInterrogation.identifiedQuery,
        isRecommended: liveInterrogation.isRecommended,
        shareOfVoiceData: liveInterrogation.shareOfVoiceData,
        aiCitations: liveInterrogation.aiCitations,
      } : null,

      // Core Web Vitals
      coreWebVitals: cwv ? {
        lcp: cwv.lcp,
        inp: cwv.inp,
        cls: cwv.cls,
        overallCategory: cwv.overallCategory,
        performanceScore: cwv.performanceScore,
      } : null,

      // Backlink data
      backlinks: backlinkData ? {
        domainAuthority: backlinkData.metrics?.domainAuthority ?? 0,
        totalBacklinks: backlinkData.metrics?.totalBacklinks ?? 0,
        spamScore: backlinkData.metrics?.spamScore ?? 0,
        topBacklinks: (backlinkData.backlinks || []).slice(0, 10).map((b: any) => ({
          source: b.source || b.url,
          anchor: b.anchor || '',
          domainAuthority: b.domainAuthority ?? 0,
        })),
      } : null,

      // Page metrics
      pageMetrics: {
        title: pageData.title,
        description: pageData.description,
        wordCount: sd.wordCount ?? 0,
        schemaCount: (pageData.schemas || []).length,
        hasH1: (sd.semanticTags?.h1Count || 0) > 0,
        isHttps: pageData.url?.startsWith('https'),
        responseTimeMs: pageData.technical?.responseTimeMs ?? 0,
        internalLinks: sd.links?.internal ?? 0,
        externalLinks: sd.links?.external ?? 0,
        totalImages: sd.media?.totalImages ?? 0,
        imagesWithAlt: sd.media?.imagesWithAlt ?? 0,
        altTextCoverage: sd.media?.totalImages > 0
          ? Math.round((sd.media.imagesWithAlt / sd.media.totalImages) * 100)
          : 100,
      },

      // Score breakdown by category
      scoreBreakdown: {
        seo: graderResult.breakdown.seo.map((cat: any) => ({
          name: cat.name,
          score: cat.score,
          maxScore: cat.maxScore,
          percentage: cat.percentage,
          components: cat.components.map((c: any) => ({
            score: c.score,
            maxScore: c.maxScore,
            status: c.status,
            feedback: c.feedback,
            issues: c.issues,
          })),
        })),
        aeo: graderResult.breakdown.aeo.map((cat: any) => ({
          name: cat.name,
          score: cat.score,
          maxScore: cat.maxScore,
          percentage: cat.percentage,
          components: cat.components.map((c: any) => ({
            score: c.score,
            maxScore: c.maxScore,
            status: c.status,
            feedback: c.feedback,
            issues: c.issues,
          })),
        })),
        geo: graderResult.breakdown.geo.map((cat: any) => ({
          name: cat.name,
          score: cat.score,
          maxScore: cat.maxScore,
          percentage: cat.percentage,
          components: cat.components.map((c: any) => ({
            score: c.score,
            maxScore: c.maxScore,
            status: c.status,
            feedback: c.feedback,
            issues: c.issues,
          })),
        })),
      },
    }

    return NextResponse.json(response, {
      headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit failed'
    console.error('[Public Audit API] Error:', message)
    logApiUsage(url, null, Date.now() - startTime, false, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
