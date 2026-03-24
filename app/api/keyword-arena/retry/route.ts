import { NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { prepareScanForGrading } from '@/lib/scan-preparation'
import { analyzeLiteIntelligence } from '@/lib/gemini-lite'
import { getAuthUser } from '@/lib/supabase/auth-helpers'

/**
 * Keyword Arena Retry: Re-scores a single site that failed AI analysis.
 * No additional credit cost — the user already paid.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { url, userSiteUrl } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log(`[Keyword Arena Retry] Re-scoring: ${url}`)

    const scan = await performScan(url, { lightweight: true })
    const siteTypeResult = prepareScanForGrading(scan)
    const graded = calculateScoresFromScanResult(scan)

    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    const aiResult = await analyzeLiteIntelligence({
      domain,
      title: scan.title || '',
      description: scan.description || '',
      wordCount: scan.structuralData?.wordCount || 0,
      hasH1: (scan.structuralData?.semanticTags?.h1Count || 0) > 0,
      isHttps: scan.technical?.isHttps ?? true,
      responseTimeMs: scan.technical?.responseTimeMs || 0,
      schemaCount: scan.schemas?.length || 0,
      imgTotal: scan.structuralData?.media?.totalImages || 0,
      imgWithAlt: scan.structuralData?.media?.imagesWithAlt || 0,
      internalLinks: scan.structuralData?.links?.internal || 0,
      siteType: siteTypeResult.primaryType,
    })

    if (!aiResult) {
      return NextResponse.json({
        success: false,
        error: 'AI analysis failed again. Try once more or skip this site.',
      }, { status: 502 })
    }

    const aiQuality = aiResult.domainHealthScore

    return NextResponse.json({
      success: true,
      site: {
        url,
        title: scan.title || url,
        description: scan.description || '',
        siteType: siteTypeResult.primaryType,
        scores: {
          seo: graded.seoScore,
          aeo: graded.aeoScore,
          geo: graded.geoScore,
          aiQuality,
          overall: Math.round((graded.seoScore + graded.aeoScore + graded.geoScore + aiQuality) / 4),
        },
        aiStatus: 'scored',
        aiBreakdown: aiResult.domainHealthBreakdown,
        isUserSite: url === userSiteUrl,
        penaltyCount: graded.breakdown.seo.reduce((sum: number, cat: any) =>
          sum + cat.components.filter((c: any) => c.status !== 'good').length, 0
        ),
      }
    })
  } catch (error: any) {
    console.error('[Keyword Arena Retry] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Retry failed',
    }, { status: 500 })
  }
}
