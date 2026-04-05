import { NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGeminiSingle } from '@/lib/gemini'
import { getAuthUser } from '@/lib/supabase/auth-helpers'

export const maxDuration = 60

/**
 * Keyword Arena V2 Retry: Re-scores a single failed site.
 * No additional credit cost.
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

    console.log(`[Arena V2 Retry] Re-scoring: ${url}`)

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

    // Override heuristic site type with AI-detected type if available
    if (aiAnalysis.detectedSiteType && aiAnalysis.detectedSiteType !== 'general') {
      siteType.primaryType = aiAnalysis.detectedSiteType
      scan.siteType = aiAnalysis.detectedSiteType
    }

    const graded = calculateScoresFromScanResult(scan)

    return NextResponse.json({
      success: true,
      site: {
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
        aiStatus: 'scored',
        isUserSite: url === userSiteUrl,
      }
    })
  } catch (error: any) {
    console.error('[Arena V2 Retry] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Retry failed',
    }, { status: 502 })
  }
}
