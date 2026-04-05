import { NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGeminiSingle } from '@/lib/gemini'
import { getAuthUser, useCredits, refundCredits, incrementScanCount } from '@/lib/supabase/auth-helpers'

export const maxDuration = 300

/**
 * Keyword Arena V2 API
 * Same scoring pipeline as Pro Audit:
 *   crawl → analyzeWithGemini (single call) → feed AI results into grader-v2
 * 
 * No heuristic fallback. If AI fails, scores are null.
 * Sites processed in parallel batches of 3 (Railway handles crawling).
 * Credit cost: 5 per site.
 */
export async function POST(req: Request) {
  let user: Awaited<ReturnType<typeof getAuthUser>> = null
  let creditCost = 0

  try {
    user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { urls, keyword, userSiteUrl } = await req.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'At least one URL is required' }, { status: 400 })
    }

    const allUrls: string[] = [...urls]
    if (userSiteUrl && !allUrls.includes(userSiteUrl)) {
      allUrls.unshift(userSiteUrl)
    }

    const finalUrls = allUrls.slice(0, 10)
    creditCost = 10

    const { allowed } = await useCredits(user.id, creditCost)
    if (!allowed) {
      return NextResponse.json({
        error: `Insufficient credits. Keyword Arena costs 10 credits.`
      }, { status: 402 })
    }

    console.log(`[Arena V2] Scanning ${finalUrls.length} sites in parallel (batches of 3) for: "${keyword}"`)

    // Process sites in parallel batches of 3 — Railway handles crawling, so no memory concern.
    // Batch size of 3 stays within Gemini free-tier rate limits (15 RPM).
    const BATCH_SIZE = 3
    const sites: any[] = []
    for (let i = 0; i < finalUrls.length; i += BATCH_SIZE) {
      const batch = finalUrls.slice(i, i + BATCH_SIZE)
      console.log(`[Arena V2] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.join(', ')}`)
      const results = await Promise.all(batch.map(url => scoreSite(url, userSiteUrl)))
      sites.push(...results)
    }

    // Scored first (by overall desc), failed at bottom
    sites.sort((a, b) => {
      if (a.scores.overall !== null && b.scores.overall === null) return -1
      if (a.scores.overall === null && b.scores.overall !== null) return 1
      if (a.scores.overall === null && b.scores.overall === null) return 0
      return (b.scores.overall ?? 0) - (a.scores.overall ?? 0)
    })

    const scoredSites = sites.filter(s => s.scores.overall !== null)
    const userSiteRank = userSiteUrl
      ? (() => { const idx = scoredSites.findIndex(s => s.isUserSite); return idx >= 0 ? idx + 1 : null })()
      : null

    await incrementScanCount(user.id, 'competitive')

    console.log(`[Arena V2] Done. ${scoredSites.length} scored, ${sites.length - scoredSites.length} failed.`)

    return NextResponse.json({
      success: true,
      data: {
        keyword, sites, userSiteRank,
        totalSites: sites.length,
        scoredSites: scoredSites.length,
        creditCost,
      }
    })
  } catch (error: any) {
    console.error('[Arena V2] Error:', error)
    if (user && creditCost > 0) {
      try { await refundCredits(user.id, creditCost) } catch (e) { console.error('[Arena V2] Refund failed:', e) }
    }
    return NextResponse.json({
      success: false,
      error: error.message || 'Arena analysis failed',
      creditsRefunded: user && creditCost > 0 ? creditCost : 0,
    }, { status: 500 })
  }
}

/**
 * Score a single site using the Pro Audit pipeline (single Gemini call).
 */
async function scoreSite(url: string, userSiteUrl?: string) {
  try {
    // Step 1: Full crawl (same as Pro Audit — no lightweight flag)
    const scan = await performScan(url)

    // Step 2: Site type detection
    const siteType = detectSiteType(scan)
    scan.siteType = siteType.primaryType

    // Step 3: AI analysis (single Gemini call — returns semanticFlags + schemaQuality)
    const aiAnalysis = await analyzeWithGeminiSingle({
      title: scan.title,
      description: scan.description,
      thinnedText: scan.thinnedText,
      summarizedContent: scan.summarizedContent,
      schemas: scan.schemas,
      structuralData: scan.structuralData,
      platform: scan.platformDetection?.label,
    })

    // Step 4: Feed AI results into scan data (same as Pro Audit v3)
    scan.semanticFlags = aiAnalysis.semanticFlags
    scan.schemaQuality = aiAnalysis.schemaQuality

    // Step 5: Grade with grader-v2 (now using AI-produced inputs)
    const graded = calculateScoresFromScanResult(scan)

    return {
      url,
      title: scan.title || url,
      description: scan.description || '',
      siteType: siteType.primaryType,
      scores: {
        seo: graded.seoScore,
        aeo: graded.aeoScore,
        geo: graded.geoScore,
        overall: Math.round((graded.seoScore + graded.aeoScore + graded.geoScore) / 3),
      },
      aiStatus: 'scored' as const,
      isUserSite: url === userSiteUrl,
    }
  } catch (err: any) {
    console.error(`[Arena V2] Failed: ${url}:`, err.message)
    return {
      url,
      title: url,
      description: '',
      siteType: 'general',
      scores: { seo: null, aeo: null, geo: null, overall: null },
      aiStatus: 'failed' as const,
      isUserSite: url === userSiteUrl,
      error: err.message,
    }
  }
}
