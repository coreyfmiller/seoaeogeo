import { NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGeminiSingle } from '@/lib/gemini'
import { getAuthUser } from '@/lib/supabase/auth-helpers'

export const maxDuration = 60

/**
 * Keyword Arena V3 Retry: Re-scores a single failed site with full scan details.
 * No additional credit cost.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { url, userSiteUrl, googleRank } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log(`[Arena V3 Retry] Re-scoring: ${url}`)

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
        googleRank: googleRank ?? null,
        aiStatus: 'scored',
        isUserSite: url === userSiteUrl,
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
    })
  } catch (error: any) {
    console.error('[Arena V3 Retry] Error:', error)
    const msg = error.message || 'Retry failed'
    // Classify the error for better user messaging
    let userMessage = msg
    if (msg.includes('timeout') || msg.includes('TIMEOUT') || msg.includes('timed out')) {
      userMessage = 'This site took too long to respond. It may be blocking automated crawlers or have a very slow server.'
    } else if (msg.includes('403') || msg.includes('Forbidden') || msg.includes('blocked')) {
      userMessage = 'This site is blocking our crawler. Some sites use security tools (like Cloudflare) that prevent automated access.'
    } else if (msg.includes('404') || msg.includes('Not Found')) {
      userMessage = 'This page could not be found. The URL may be incorrect or the page may have been removed.'
    } else if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('DNS')) {
      userMessage = 'Could not connect to this site. The domain may be down or the URL may be incorrect.'
    } else if (msg.includes('SSL') || msg.includes('certificate')) {
      userMessage = 'This site has an SSL certificate issue that prevented our crawler from connecting securely.'
    } else if (msg.includes('Navigation') || msg.includes('net::')) {
      userMessage = 'This site failed to load in our browser. It may use heavy JavaScript that prevents crawling, or it may be blocking automated access.'
    }
    return NextResponse.json({
      success: false,
      error: userMessage,
    }, { status: 500 })
  }
}
