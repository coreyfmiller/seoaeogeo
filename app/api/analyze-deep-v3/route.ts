import { NextRequest, NextResponse } from 'next/server'
import { crawlMultiplePages } from '@/lib/multi-page-crawler'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGemini } from '@/lib/gemini'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { saveScanSnapshot } from '@/lib/scan-snapshots'

export const maxDuration = 300 // 5 minutes for deep scan

export async function POST(request: NextRequest) {
  try {
    const { url, maxPages = 10 } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log(`[V3 Deep Scan] Starting analysis for ${url} (max ${maxPages} pages)`)

    // Step 1: Crawl multiple pages
    const crawlResult = await crawlMultiplePages(url, maxPages)

    if (!crawlResult.pages || crawlResult.pages.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to crawl pages' 
      }, { status: 500 })
    }

    console.log(`[V3 Deep Scan] Crawled ${crawlResult.pages.length} pages`)

    // Step 2: Detect site type from homepage
    const homepage = crawlResult.pages[0]
    const siteTypeResult = detectSiteType(homepage, crawlResult.pages)
    
    console.log(`[V3 Deep Scan] Detected site type: ${siteTypeResult.primaryType} (${siteTypeResult.confidence}% confidence)`)

    // Step 3: Analyze each page with AI + V2 grading
    const pageAnalyses = await Promise.all(
      crawlResult.pages.map(async (page) => {
        try {
          // AI content analysis via Gemini (same as V3 Beta)
          const aiAnalysis = await analyzeWithGemini({
            title: page.title,
            description: page.description,
            thinnedText: page.thinnedText,
            schemas: page.schemas,
            structuralData: {
              url: page.url,
              hasH1: page.hasH1,
              h2Count: page.h2Count,
              h3Count: page.h3Count,
              wordCount: page.wordCount,
              imgTotal: page.imgTotal,
              imgWithAlt: page.imgWithAlt,
              internalLinks: page.internalLinks,
              externalLinks: page.externalLinks,
              isHttps: page.isHttps
            }
          })

          // Build a scanResult object matching what V3 Beta passes to calculateScoresFromScanResult
          const scanResultForGrader = {
            url: page.url,
            title: page.title,
            description: page.description,
            schemas: page.schemas,
            structuralData: {
              url: page.url,
              title: page.title,
              description: page.description,
              hasH1: page.hasH1,
              h2Count: page.h2Count,
              h3Count: page.h3Count,
              wordCount: page.wordCount,
              imgTotal: page.imgTotal,
              imgWithAlt: page.imgWithAlt,
              internalLinks: page.internalLinks,
              externalLinks: page.externalLinks,
              isHttps: page.isHttps
            },
            semanticFlags: aiAnalysis?.semanticFlags || {},
            schemaQuality: aiAnalysis?.schemaQuality,
            technical: { responseTimeMs: page.responseTimeMs },
            siteType: siteTypeResult.primaryType
          }

          // V2 grading — same path as V3 Beta
          const graderResult = calculateScoresFromScanResult(scanResultForGrader)

          // Generate enhanced penalties
          const enhancedPenalties = convertBreakdownToEnhancedPenalties(
            graderResult.breakdown.seo,
            graderResult.breakdown.aeo,
            graderResult.breakdown.geo
          )

          return {
            url: page.url,
            title: page.title,
            scores: {
              seo: { score: graderResult.seoScore },
              aeo: { score: graderResult.aeoScore },
              geo: { score: graderResult.geoScore }
            },
            graderResult,
            enhancedPenalties,
            wordCount: page.wordCount
          }
        } catch (error) {
          console.error(`[V3 Deep Scan] Error analyzing ${page.url}:`, error)
          return null
        }
      })
    )

    const validAnalyses = pageAnalyses.filter(a => a !== null)

    if (validAnalyses.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to analyze any pages' 
      }, { status: 500 })
    }

    console.log(`[V3 Deep Scan] Successfully analyzed ${validAnalyses.length} pages`)

    // Step 4: Calculate aggregate scores
    const avgScores = {
      seo: Math.round(validAnalyses.reduce((sum, a) => sum + a.scores.seo.score, 0) / validAnalyses.length),
      aeo: Math.round(validAnalyses.reduce((sum, a) => sum + a.scores.aeo.score, 0) / validAnalyses.length),
      geo: Math.round(validAnalyses.reduce((sum, a) => sum + a.scores.geo.score, 0) / validAnalyses.length)
    }

    // Step 5: Schema coverage analysis
    const schemaCoverage = {
      totalPages: validAnalyses.length,
      pagesWithSchema: validAnalyses.filter(a => 
        a.graderResult.breakdown.seo.some((cat: any) => 
          cat.name.toLowerCase().includes('schema') && cat.score > 0
        )
      ).length
    }

    // Save snapshot for debugging
    const snapshotId = `deep-v3-${Date.now()}`
    saveScanSnapshot({
      id: snapshotId,
      url,
      timestamp: new Date().toISOString(),
      apiRoute: '/api/analyze-deep-v3',
      scores: avgScores,
      siteType: siteTypeResult.primaryType,
      rawAiScores: validAnalyses[0]?.graderResult,
      graderBreakdown: validAnalyses[0]?.graderResult?.breakdown,
      enhancedPenalties: validAnalyses[0]?.enhancedPenalties,
      fullResult: {
        pagesCrawled: validAnalyses.length,
        perPageScores: validAnalyses.map(a => ({
          url: a.url,
          seo: a.scores.seo.score,
          aeo: a.scores.aeo.score,
          geo: a.scores.geo.score
        }))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        url,
        analyzedAt: new Date().toISOString(),
        siteTypeResult,
        pagesCrawled: validAnalyses.length,
        scores: avgScores,
        pages: validAnalyses,
        schemaCoverage,
        siteWideIssues: crawlResult.siteWideIssues,
        orphanPages: crawlResult.orphanPages,
        duplicateGroups: crawlResult.duplicateGroups,
        crawlStats: {
          totalFound: crawlResult.pages.length,
          analyzed: validAnalyses.length,
          failed: pageAnalyses.length - validAnalyses.length
        }
      }
    })

  } catch (error: any) {
    console.error('[V3 Deep Scan] Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Analysis failed' 
    }, { status: 500 })
  }
}
