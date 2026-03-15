import { NextRequest, NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { analyzeWithGemini } from '@/lib/gemini'
import { performLiveInterrogation } from '@/lib/gemini-interrogation'
import { detectSiteType } from '@/lib/site-type-detector'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    console.log('[V3 API] Starting analysis for:', url)

    // Step 1: Crawl the page
    console.log('[V3 API] Crawling page...')
    const pageData = await performScan(url)

    // Step 2: Detect site type
    console.log('[V3 API] Detecting site type...')
    const siteTypeResult = detectSiteType(pageData, [])
    pageData.siteType = siteTypeResult.primaryType
    console.log('[V3 API] Site type detected:', siteTypeResult.primaryType, 'confidence:', siteTypeResult.confidence)

    // Step 3: AI Analysis (Gemini + Live Interrogation in parallel)
    console.log('[V3 API] Starting AI analysis...')
    const [aiAnalysis, liveInterrogation] = await Promise.all([
      analyzeWithGemini({
        title: pageData.title,
        description: pageData.description,
        thinnedText: pageData.thinnedText,
        summarizedContent: pageData.summarizedContent,
        schemas: pageData.schemas,
        structuralData: pageData.structuralData
      }),
      performLiveInterrogation({
        domain: pageData.url,
        title: pageData.title,
        description: pageData.description,
        contentSummary: pageData.thinnedText,
      })
    ])

    console.log('[V3 API] AI analysis complete')
    console.log('[V3 API] Semantic flags:', JSON.stringify(aiAnalysis.semanticFlags, null, 2))
    
    // Attach AI results to pageData
    pageData.semanticFlags = aiAnalysis.semanticFlags
    pageData.schemaQuality = aiAnalysis.schemaQuality
    pageData.aiAnalysis = aiAnalysis
    pageData.liveInterrogation = liveInterrogation

    // Step 4: Grade the page (V2 scoring with AI data and site type)
    console.log('[V3 API] Grading page with V2 scorer...')
    const graderResult = calculateScoresFromScanResult(pageData)

    // Step 5: Generate enhanced penalties with explanations and fixes
    console.log('[V3 API] Generating enhanced penalties...')
    let enhancedPenalties = []
    try {
      enhancedPenalties = convertBreakdownToEnhancedPenalties(
        graderResult.breakdown.seo,
        graderResult.breakdown.aeo,
        graderResult.breakdown.geo
      )
      console.log('[V3 API] Generated', enhancedPenalties.length, 'enhanced penalties')
    } catch (penaltyError: any) {
      console.error('[V3 API] Error generating enhanced penalties:', penaltyError.message)
    }

    // Step 6: Format scores
    const scores = {
      seo: { score: graderResult.seoScore },
      aeo: { score: graderResult.aeoScore },
      geo: { score: graderResult.geoScore },
    }

    // Step 7: Mock Core Web Vitals (TODO: Add real measurement)
    const cwv = {
      lcp: { value: 2400, category: 'FAST' as const, score: 95, displayValue: '2.4 s' },
      inp: { value: 150, category: 'FAST' as const, score: 90, displayValue: '150 ms' },
      cls: { value: 0.05, category: 'FAST' as const, score: 100, displayValue: '0.05' },
      overallCategory: 'FAST' as const,
      performanceScore: 95,
      fetchedAt: new Date().toISOString(),
      strategy: 'mobile' as const,
      hasRealUserData: false,
    }

    // Step 8: Combine results
    const result = {
      url,
      pageData,
      scores,
      graderResult,
      enhancedPenalties,
      siteTypeResult,
      aiAnalysis,
      liveInterrogation,
      cwv,
      analyzedAt: new Date().toISOString(),
      version: 'v3'
    }

    console.log('[V3 API] Analysis complete')
    console.log('[V3 API] SEO:', scores.seo.score, 'AEO:', scores.aeo.score, 'GEO:', scores.geo.score)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('[V3 API] Error:', error)
    console.error('[V3 API] Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: error.message || 'Analysis failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
