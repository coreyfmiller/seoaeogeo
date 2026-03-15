import { NextRequest } from 'next/server'
import { crawlMultiplePages } from '@/lib/multi-page-crawler'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGemini } from '@/lib/gemini'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { saveScanSnapshot } from '@/lib/scan-snapshots'
import { createSSEStream, SSE_HEADERS } from '@/lib/sse-helpers'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const { url, maxPages = 10 } = await request.json()

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const stream = createSSEStream(async (send) => {
    try {
      // Step 1: Crawl multiple pages
      send({ type: 'progress', phase: 'Crawling site pages...', progress: 5 })
      const crawlResult = await crawlMultiplePages(url, maxPages)

      if (!crawlResult.pages || crawlResult.pages.length === 0) {
        send({ type: 'error', success: false, error: 'Failed to crawl pages' })
        return
      }
      const totalPages = crawlResult.pages.length
      send({ type: 'progress', phase: `Crawled ${totalPages} pages. Detecting site type...`, progress: 20 })

      // Step 2: Site type detection
      const homepage = crawlResult.pages[0]
      const siteTypeResult = detectSiteType(homepage, crawlResult.pages)
      send({ type: 'progress', phase: `Site type: ${siteTypeResult.primaryType}. Analyzing pages with AI...`, progress: 25 })

      // Step 3: Analyze pages in parallel batches of 5 with per-batch progress
      const BATCH_SIZE = 5
      const pageAnalyses: any[] = []
      let completed = 0

      for (let batchStart = 0; batchStart < crawlResult.pages.length; batchStart += BATCH_SIZE) {
        const batch = crawlResult.pages.slice(batchStart, batchStart + BATCH_SIZE)
        const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1
        const totalBatches = Math.ceil(crawlResult.pages.length / BATCH_SIZE)
        send({ type: 'progress', phase: `Analyzing batch ${batchNum} of ${totalBatches} (${completed} of ${totalPages} pages done)...`, progress: Math.round(25 + (completed / totalPages) * 60) })

        const batchResults = await Promise.all(
          batch.map(async (page) => {
            try {
              const aiAnalysis = await analyzeWithGemini({
                title: page.title, description: page.description,
                thinnedText: page.thinnedText, schemas: page.schemas,
                structuralData: {
                  url: page.url, hasH1: page.hasH1, h2Count: page.h2Count, h3Count: page.h3Count,
                  wordCount: page.wordCount, imgTotal: page.imgTotal, imgWithAlt: page.imgWithAlt,
                  internalLinks: page.internalLinks, externalLinks: page.externalLinks, isHttps: page.isHttps
                }
              })

              const scanResultForGrader = {
                url: page.url, title: page.title, description: page.description, schemas: page.schemas,
                structuralData: {
                  url: page.url, title: page.title, description: page.description,
                  hasH1: page.hasH1, h2Count: page.h2Count, h3Count: page.h3Count,
                  wordCount: page.wordCount, imgTotal: page.imgTotal, imgWithAlt: page.imgWithAlt,
                  internalLinks: page.internalLinks, externalLinks: page.externalLinks, isHttps: page.isHttps
                },
                semanticFlags: aiAnalysis?.semanticFlags || {},
                schemaQuality: aiAnalysis?.schemaQuality,
                technical: { responseTimeMs: page.responseTimeMs },
                siteType: siteTypeResult.primaryType
              }
              const graderResult = calculateScoresFromScanResult(scanResultForGrader)
              const enhancedPenalties = convertBreakdownToEnhancedPenalties(
                graderResult.breakdown.seo, graderResult.breakdown.aeo, graderResult.breakdown.geo
              )
              return {
                url: page.url, title: page.title,
                scores: { seo: { score: graderResult.seoScore }, aeo: { score: graderResult.aeoScore }, geo: { score: graderResult.geoScore } },
                graderResult, enhancedPenalties, wordCount: page.wordCount
              }
            } catch (error) {
              console.error(`[V3 Deep Scan] Error analyzing ${page.url}:`, error)
              return null
            }
          })
        )

        const validResults = batchResults.filter((r): r is NonNullable<typeof r> => r !== null)
        pageAnalyses.push(...validResults)
        completed += batch.length
        send({ type: 'progress', phase: `${completed} of ${totalPages} pages analyzed...`, progress: Math.round(25 + (completed / totalPages) * 60) })
      }

      if (pageAnalyses.length === 0) {
        send({ type: 'error', success: false, error: 'Failed to analyze any pages' })
        return
      }

      send({ type: 'progress', phase: 'Calculating aggregate scores...', progress: 88 })

      const avgScores = {
        seo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.seo.score, 0) / pageAnalyses.length),
        aeo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.aeo.score, 0) / pageAnalyses.length),
        geo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.geo.score, 0) / pageAnalyses.length)
      }
      const schemaCoverage = {
        totalPages: pageAnalyses.length,
        pagesWithSchema: pageAnalyses.filter((a: any) => a.graderResult.breakdown.seo.some((cat: any) => cat.name.toLowerCase().includes('schema') && cat.score > 0)).length
      }

      send({ type: 'progress', phase: 'Saving snapshot...', progress: 95 })
      saveScanSnapshot({
        id: `deep-v3-${Date.now()}`, url, timestamp: new Date().toISOString(),
        apiRoute: '/api/analyze-deep-v3', scores: avgScores,
        siteType: siteTypeResult.primaryType,
        rawAiScores: pageAnalyses[0]?.graderResult, graderBreakdown: pageAnalyses[0]?.graderResult?.breakdown,
        enhancedPenalties: pageAnalyses[0]?.enhancedPenalties,
        fullResult: { pagesCrawled: pageAnalyses.length, perPageScores: pageAnalyses.map((a: any) => ({ url: a.url, seo: a.scores.seo.score, aeo: a.scores.aeo.score, geo: a.scores.geo.score })) }
      })

      send({ type: 'progress', phase: 'Deep scan complete!', progress: 100 })
      send({ type: 'result', success: true, data: {
        url, analyzedAt: new Date().toISOString(), siteTypeResult,
        pagesCrawled: pageAnalyses.length, scores: avgScores, pages: pageAnalyses,
        schemaCoverage, siteWideIssues: crawlResult.siteWideIssues,
        orphanPages: crawlResult.orphanPages, duplicateGroups: crawlResult.duplicateGroups,
        crawlStats: { totalFound: crawlResult.pages.length, analyzed: pageAnalyses.length, failed: crawlResult.pages.length - pageAnalyses.length }
      }})
    } catch (error: any) {
      console.error('[V3 Deep Scan] Error:', error)
      send({ type: 'error', success: false, error: error.message || 'Analysis failed' })
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
