import { NextRequest, NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
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

    console.log('[V2 API] Starting analysis for:', url)

    // Step 1: Crawl the page
    console.log('[V2 API] Crawling page...')
    const pageData = await performScan(url)

    // Step 2: Detect site type
    console.log('[V2 API] Detecting site type...')
    const siteTypeResult = detectSiteType(pageData, [])
    pageData.siteType = siteTypeResult.primaryType
    console.log('[V2 API] Site type detected:', siteTypeResult.primaryType, 'confidence:', siteTypeResult.confidence)

    // Step 3: Apply semantic quality analysis based on content metrics
    console.log('[V2 API] Analyzing content quality...')
    const wordCount = pageData.structuralData?.wordCount || 0
    console.log('[V2 API] Word count:', wordCount)
    console.log('[V2 API] Schemas found:', pageData.schemas?.length || 0)
    
    // Analyze schema quality
    let schemaQuality = null
    if (pageData.schemas && pageData.schemas.length > 0) {
      // Basic schema quality check
      const hasRequiredProps = pageData.schemas.some((schema: any) => {
        return schema.name || schema.headline || schema['@type']
      })
      schemaQuality = {
        hasSchema: true,
        score: hasRequiredProps ? 70 : 40,
        issues: hasRequiredProps ? [] : ['Missing required properties in schema']
      }
    } else {
      schemaQuality = {
        hasSchema: false,
        score: 0,
        issues: ['No structured data found']
      }
    }
    pageData.schemaQuality = schemaQuality
    
    // For thin content (<500 words), apply quality penalties
    if (wordCount < 500) {
      console.log('[V2 API] Applying penalties for thin content (<500 words)')
      pageData.semanticFlags = {
        noDirectQnAMatching: true,  // Thin content rarely has good Q&A
        lowEntityDensity: true,      // Not enough content for entities
        poorFormattingConciseness: wordCount < 300,
        lackOfDefinitionStatements: true,
        promotionalTone: false,
        lackOfExpertiseSignals: true,  // No room for expertise signals
        lackOfHardData: true,          // No data/statistics
        heavyFirstPersonUsage: false,
        unsubstantiatedClaims: false,
      }
    } else {
      console.log('[V2 API] Content is substantial (>=500 words), assuming quality')
      // For longer content, assume quality (could enhance with real Gemini analysis later)
      pageData.semanticFlags = {
        noDirectQnAMatching: false,
        lowEntityDensity: false,
        poorFormattingConciseness: false,
        lackOfDefinitionStatements: false,
        promotionalTone: false,
        lackOfExpertiseSignals: false,
        lackOfHardData: false,
        heavyFirstPersonUsage: false,
        unsubstantiatedClaims: false,
      }
    }
    
    console.log('[V2 API] Semantic flags:', JSON.stringify(pageData.semanticFlags, null, 2))
    console.log('[V2 API] Schema quality:', JSON.stringify(schemaQuality, null, 2))

    // Step 4: Grade the page (V2 scoring with semantic data and site type)
    console.log('[V2 API] Grading page...')
    const graderResult = calculateScoresFromScanResult(pageData)

    // Step 4.5: Generate enhanced penalties with explanations and fixes
    console.log('[V2 API] Generating enhanced penalties...')
    let enhancedPenalties = []
    try {
      enhancedPenalties = convertBreakdownToEnhancedPenalties(
        graderResult.breakdown.seo,
        graderResult.breakdown.aeo,
        graderResult.breakdown.geo
      )
      console.log('[V2 API] Generated', enhancedPenalties.length, 'enhanced penalties')
    } catch (penaltyError: any) {
      console.error('[V2 API] Error generating enhanced penalties:', penaltyError.message)
      // Continue without enhanced penalties rather than failing the whole request
    }

    // Step 5: Format scores to match expected structure
    const scores = {
      seo: { score: graderResult.seoScore },
      aeo: { score: graderResult.aeoScore },
      geo: { score: graderResult.geoScore },
    }

    // Step 6: Mock Core Web Vitals for now (TODO: Add real measurement)
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

    // Step 7: Combine results
    const result = {
      url,
      pageData,
      scores,
      graderResult, // Include full breakdown
      enhancedPenalties, // Include explanations and fixes
      siteTypeResult, // Include site type detection
      cwv,
      analyzedAt: new Date().toISOString(),
    }

    console.log('[V2 API] Analysis complete')
    console.log('[V2 API] SEO:', scores.seo.score, 'AEO:', scores.aeo.score, 'GEO:', scores.geo.score)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('[V2 API] Error:', error)
    console.error('[V2 API] Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: error.message || 'Analysis failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
