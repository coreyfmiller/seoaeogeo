import { NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { prepareScanForGrading } from '@/lib/scan-preparation'
import { getAuthUser, useCredits, refundCredits, incrementScanCount } from '@/lib/supabase/auth-helpers'

/**
 * Keyword Arena API: Crawls and scores multiple competitor URLs in parallel.
 * Credit cost: 5 per site (top 5 = 25 credits, top 10 = 50 credits)
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

    // Build full list: competitor URLs + optional user site
    const allUrls: string[] = [...urls]
    if (userSiteUrl && !allUrls.includes(userSiteUrl)) {
      allUrls.unshift(userSiteUrl)
    }

    // Cap at 10 sites max
    const finalUrls = allUrls.slice(0, 10)
    creditCost = finalUrls.length * 5

    const { allowed } = await useCredits(user.id, creditCost)
    if (!allowed) {
      return NextResponse.json({
        error: `Insufficient credits. Keyword Arena with ${finalUrls.length} sites costs ${creditCost} credits.`
      }, { status: 402 })
    }

    console.log(`[Keyword Arena] Scanning ${finalUrls.length} sites for keyword: "${keyword}"`)

    // Crawl all sites in parallel
    const scanResults = await Promise.allSettled(
      finalUrls.map(async (url) => {
        try {
          const scan = await performScan(url, { lightweight: true })
          const siteType = prepareScanForGrading(scan)
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
            isUserSite: url === userSiteUrl,
            penaltyCount: graded.breakdown.seo.reduce((sum: number, cat: any) =>
              sum + cat.components.filter((c: any) => c.status !== 'good').length, 0
            ),
          }
        } catch (err: any) {
          console.error(`[Keyword Arena] Failed to scan ${url}:`, err.message)
          return {
            url,
            title: url,
            description: '',
            siteType: 'general',
            scores: { seo: 0, aeo: 0, geo: 0, overall: 0 },
            isUserSite: url === userSiteUrl,
            error: err.message,
            penaltyCount: 0,
          }
        }
      })
    )

    const sites = scanResults.map((r) =>
      r.status === 'fulfilled' ? r.value : {
        url: 'unknown',
        title: 'Scan Failed',
        scores: { seo: 0, aeo: 0, geo: 0, overall: 0 },
        isUserSite: false,
        error: 'Scan failed',
        penaltyCount: 0,
      }
    )

    // Sort by overall score descending
    sites.sort((a, b) => b.scores.overall - a.scores.overall)

    // Find user site rank
    const userSiteRank = userSiteUrl
      ? sites.findIndex(s => s.isUserSite) + 1
      : null

    await incrementScanCount(user.id, 'competitive')

    console.log(`[Keyword Arena] Complete. ${sites.length} sites scored.`)

    return NextResponse.json({
      success: true,
      data: {
        keyword,
        sites,
        userSiteRank,
        totalSites: sites.length,
        creditCost,
      }
    })
  } catch (error: any) {
    console.error('[Keyword Arena] Error:', error)
    if (user && creditCost > 0) {
      try { await refundCredits(user.id, creditCost) } catch (e) { console.error('[Keyword Arena] Refund failed:', e) }
    }
    return NextResponse.json({
      success: false,
      error: error.message || 'Arena analysis failed',
      creditsRefunded: user && creditCost > 0 ? creditCost : 0,
    }, { status: 500 })
  }
}
