import { NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGeminiSingle } from '@/lib/gemini'
import { getAuthUser, useCredits, refundCredits, incrementScanCount } from '@/lib/supabase/auth-helpers'
import { saveScanToDb } from '@/lib/scan-history-db'

export const maxDuration = 300

/**
 * Keyword Arena V3 API
 * Same scoring pipeline as Pro Audit + richer scan data for insights.
 * Returns googleRank, scanDetails (structural data, meta checks, schema info).
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

    const { urls, keyword, userSiteUrl, googleRanks } = await req.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'At least one URL is required' }, { status: 400 })
    }

    // googleRanks is a map of url -> google position (1-based) sent from the frontend
    const rankMap: Record<string, number | null> = googleRanks || {}

    const allUrls: string[] = [...urls]
    if (userSiteUrl && !allUrls.includes(userSiteUrl)) {
      allUrls.unshift(userSiteUrl)
    }

    const finalUrls = allUrls.slice(0, 10)
    creditCost = finalUrls.length * 5

    const { allowed } = await useCredits(user.id, creditCost)
    if (!allowed) {
      return NextResponse.json({
        error: `Insufficient credits. Keyword Arena with ${finalUrls.length} sites costs ${creditCost} credits.`
      }, { status: 402 })
    }

    console.log(`[Arena V3] Scanning ${finalUrls.length} sites in parallel (batches of 3) for: "${keyword}"`)

    const BATCH_SIZE = 3
    const sites: any[] = []
    for (let i = 0; i < finalUrls.length; i += BATCH_SIZE) {
      const batch = finalUrls.slice(i, i + BATCH_SIZE)
      console.log(`[Arena V3] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.join(', ')}`)
      const results = await Promise.all(batch.map(url => scoreSite(url, userSiteUrl, rankMap[url] ?? null)))
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
    const userSite = scoredSites.find(s => s.isUserSite)
    const userSiteRank = userSite
      ? scoredSites.indexOf(userSite) + 1
      : null

    // Compute arena averages for comparison
    const arenaAvg = computeArenaAverages(scoredSites)

    await incrementScanCount(user.id, 'competitive')

    console.log(`[Arena V3] Done. ${scoredSites.length} scored, ${sites.length - scoredSites.length} failed.`)

    const resultData = {
      keyword, sites, userSiteRank, arenaAvg,
      totalSites: sites.length,
      scoredSites: scoredSites.length,
      creditCost,
    }

    // Save to persistent scan history
    const userSiteScores = userSite?.scores
    saveScanToDb(user.id, 'keyword-arena', `${keyword} (${sites.length} sites)`,
      userSiteScores?.seo != null ? { seo: userSiteScores.seo, aeo: userSiteScores.aeo ?? 0, geo: userSiteScores.geo ?? 0 } : null,
      resultData
    ).catch(() => {})

    return NextResponse.json({ success: true, data: resultData })
  } catch (error: any) {
    console.error('[Arena V3] Error:', error)
    if (user && creditCost > 0) {
      try { await refundCredits(user.id, creditCost) } catch (e) { console.error('[Arena V3] Refund failed:', e) }
    }
    return NextResponse.json({
      success: false,
      error: error.message || 'Arena analysis failed',
      creditsRefunded: user && creditCost > 0 ? creditCost : 0,
    }, { status: 500 })
  }
}


/**
 * Score a single site — returns richer data than V2 for insights.
 */
async function scoreSite(url: string, userSiteUrl?: string, googleRank?: number | null) {
  try {
    const scan = await performScan(url)
    const siteType = detectSiteType(scan)
    scan.siteType = siteType.primaryType

    const aiAnalysis = await analyzeWithGeminiSingle({
      title: scan.title,
      description: scan.description,
      thinnedText: scan.thinnedText,
      summarizedContent: scan.summarizedContent,
      schemas: scan.schemas,
      structuralData: scan.structuralData,
      platform: scan.platformDetection?.label,
    })

    scan.semanticFlags = aiAnalysis.semanticFlags
    scan.schemaQuality = aiAnalysis.schemaQuality

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
      googleRank: googleRank ?? null,
      aiStatus: 'scored' as const,
      isUserSite: url === userSiteUrl,
      // Richer scan data for insights (no raw HTML, just structured metrics)
      scanDetails: {
        wordCount: scan.structuralData?.wordCount || 0,
        h1Count: scan.structuralData?.semanticTags?.h1Count || 0,
        h2Count: scan.structuralData?.semanticTags?.h2Count || 0,
        internalLinks: scan.structuralData?.links?.internal || 0,
        externalLinks: scan.structuralData?.links?.external || 0,
        totalImages: scan.structuralData?.media?.totalImages || 0,
        imagesWithAlt: scan.structuralData?.media?.imagesWithAlt || 0,
        hasSchema: aiAnalysis.schemaQuality?.hasSchema || false,
        schemaTypes: aiAnalysis.schemaQuality?.schemaTypes || [],
        schemaScore: aiAnalysis.schemaQuality?.score || 0,
        hasOgTitle: scan.metaChecks?.hasOgTitle || false,
        hasOgDescription: scan.metaChecks?.hasOgDescription || false,
        hasOgImage: scan.metaChecks?.hasOgImage || false,
        hasTwitterCard: scan.metaChecks?.hasTwitterCard || false,
        hasViewport: scan.metaChecks?.hasViewport || false,
        titleLength: scan.metaChecks?.titleLength || 0,
        descriptionLength: scan.metaChecks?.descriptionLength || 0,
        isHttps: scan.technical?.isHttps || false,
        responseTimeMs: scan.technical?.responseTimeMs || 0,
        platform: scan.platformDetection?.label || null,
      },
    }
  } catch (err: any) {
    console.error(`[Arena V3] Failed: ${url}:`, err.message)
    return {
      url,
      title: url,
      description: '',
      siteType: 'general',
      scores: { seo: null, aeo: null, geo: null, overall: null },
      googleRank: googleRank ?? null,
      aiStatus: 'failed' as const,
      isUserSite: url === userSiteUrl,
      error: err.message,
      scanDetails: null,
    }
  }
}

/**
 * Compute arena-wide averages for comparison insights.
 */
function computeArenaAverages(scoredSites: any[]) {
  if (scoredSites.length === 0) return null

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  const details = scoredSites.filter(s => s.scanDetails).map(s => s.scanDetails)

  return {
    seo: avg(scoredSites.map(s => s.scores.seo)),
    aeo: avg(scoredSites.map(s => s.scores.aeo)),
    geo: avg(scoredSites.map(s => s.scores.geo)),
    overall: avg(scoredSites.map(s => s.scores.overall)),
    wordCount: avg(details.map(d => d.wordCount)),
    schemaAdoption: details.filter(d => d.hasSchema).length,
    totalSites: details.length,
    avgSchemaScore: avg(details.map(d => d.schemaScore)),
    ogAdoption: details.filter(d => d.hasOgTitle && d.hasOgDescription).length,
    altTextCoverage: avg(details.map(d => d.totalImages > 0 ? Math.round((d.imagesWithAlt / d.totalImages) * 100) : 100)),
  }
}
