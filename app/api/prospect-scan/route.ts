import { NextRequest, NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { analyzeWithGemini } from '@/lib/gemini'
import { detectSiteType } from '@/lib/site-type-detector'
import { getMozUrlMetrics } from '@/lib/moz'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const maxDuration = 120

// ---------------------------------------------------------------------------
// In-memory rate limiter: 5 requests per minute per API key
// ---------------------------------------------------------------------------
const RATE_LIMIT = 5
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
// Log API usage to Supabase (fire-and-forget)
// ---------------------------------------------------------------------------
function logApiUsage(url: string, seoScore: number, geoScore: number, durationMs: number, success: boolean, error?: string) {
  supabaseAdmin.from('api_usage_log').insert({
    api_key: 'prospect',
    url,
    seo_score: seoScore,
    geo_score: geoScore,
    duration_ms: durationMs,
    success,
    error: error || null,
  }).then(() => {}).catch(() => {})
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // 1. API key auth
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.PROSPECT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit check
  const rateCheck = checkRateLimit(apiKey)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 5 requests per minute.', retryAfterMs: rateCheck.retryAfterMs },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
    )
  }

  // 3. Parse body
  let url: string
  try {
    const body = await request.json()
    url = body.url
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  try {
    // 4. Crawl the page
    const pageData = await performScan(url)

    if (pageData.botProtection?.detected) {
      logApiUsage(url, 0, 0, Date.now() - startTime, false, `Bot protection: ${pageData.botProtection.type}`)
      return NextResponse.json({
        error: 'Bot protection detected',
        type: pageData.botProtection.type,
      }, { status: 422 })
    }

    // 5. Site type detection
    const siteTypeResult = detectSiteType(pageData, [])
    ;(pageData as any).siteType = siteTypeResult.primaryType

    // 6. Run Gemini AI + Moz DA in parallel
    const [aiResult, mozResult] = await Promise.allSettled([
      analyzeWithGemini({
        title: pageData.title,
        description: pageData.description,
        thinnedText: pageData.thinnedText,
        summarizedContent: pageData.summarizedContent,
        schemas: pageData.schemas,
        structuralData: pageData.structuralData,
        platform: pageData.platformDetection?.label,
      }),
      getMozUrlMetrics(url),
    ])

    // 7. Inject AI results into pageData
    if (aiResult.status === 'fulfilled') {
      const ai = aiResult.value
      ;(pageData as any).semanticFlags = ai.semanticFlags
      ;(pageData as any).schemaQuality = ai.schemaQuality
      ;(pageData as any).aiAnalysis = ai

      if (ai.detectedSiteType && ai.detectedSiteType !== 'general') {
        ;(pageData as any).siteType = ai.detectedSiteType
      }
    }

    // 8. Grade with AI-enriched data
    const graderResult = calculateScoresFromScanResult(pageData)

    // 9. Extract critical issues
    const criticalIssues: string[] = []
    if (graderResult.breakdown) {
      for (const category of [...(graderResult.breakdown.seo || []), ...(graderResult.breakdown.geo || [])]) {
        for (const component of category.components || []) {
          if (component.status === 'critical' && component.feedback) {
            criticalIssues.push(component.feedback)
          }
        }
      }
    }

    // 10. Extract Moz DA
    const moz = mozResult.status === 'fulfilled' ? mozResult.value : null
    const durationMs = Date.now() - startTime

    // 11. Log usage
    logApiUsage(url, graderResult.seoScore, graderResult.geoScore, durationMs, true)

    // 12. Return response
    return NextResponse.json({
      url: pageData.url,
      seoScore: graderResult.seoScore,
      geoScore: graderResult.geoScore,
      domainAuthority: moz?.domainAuthority ?? 0,
      criticalIssues,
    }, {
      headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed'
    console.error('[Prospect Scan] Error:', message)
    logApiUsage(url, 0, 0, Date.now() - startTime, false, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
