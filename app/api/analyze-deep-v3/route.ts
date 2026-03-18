import { NextRequest } from 'next/server'
import { crawlMultiplePages } from '@/lib/multi-page-crawler'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGemini } from '@/lib/gemini'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide'
import { saveScanSnapshot } from '@/lib/scan-snapshots'
import { createSSEStream, createProgressTicker, SSE_HEADERS } from '@/lib/sse-helpers'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const { url: rawUrl, maxPages = 10 } = await request.json()

  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Normalize URL — ensure protocol so new URL() won't throw
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

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
        send({ type: 'progress', phase: `Analyzing batch ${batchNum} of ${totalBatches} (${completed} of ${totalPages} pages done)...`, progress: Math.round(25 + (completed / totalPages) * 40) })

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
                thinnedText: page.thinnedText,
                structuralData: {
                  semanticTags: page.semanticTags,
                  links: {
                    internal: page.internalLinks,
                    external: page.externalLinks,
                    socialLinksCount: page.socialLinksCount,
                  },
                  media: {
                    totalImages: page.imgTotal,
                    imagesWithAlt: page.imgWithAlt,
                  },
                  wordCount: page.wordCount,
                  hasViewport: page.metaChecks.hasViewport,
                },
                semanticFlags: aiAnalysis?.semanticFlags || {},
                schemaQuality: aiAnalysis?.schemaQuality,
                technical: { responseTimeMs: page.responseTimeMs, isHttps: page.isHttps },
                metaChecks: page.metaChecks,
                siteType: siteTypeResult.primaryType
              }
              const graderResult = calculateScoresFromScanResult(scanResultForGrader)
              const enhancedPenalties = convertBreakdownToEnhancedPenalties(
                graderResult.breakdown.seo, graderResult.breakdown.aeo, graderResult.breakdown.geo
              )
              return {
                url: page.url, title: page.title,
                scores: { seo: { score: graderResult.seoScore }, aeo: { score: graderResult.aeoScore }, geo: { score: graderResult.geoScore } },
                graderResult, enhancedPenalties, wordCount: page.wordCount,
                hasH1: page.hasH1, isHttps: page.isHttps,
                hasDescription: !!page.description, schemaCount: (page.schemas || []).length,
                responseTimeMs: page.responseTimeMs,
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
        send({ type: 'progress', phase: `${completed} of ${totalPages} pages analyzed...`, progress: Math.round(25 + (completed / totalPages) * 40) })
      }

      if (pageAnalyses.length === 0) {
        send({ type: 'error', success: false, error: 'Failed to analyze any pages' })
        return
      }

      // Step 4: Robots.txt & Sitemap check
      send({ type: 'progress', phase: 'Checking robots.txt and sitemap...', progress: 68 })
      let robotsTxt: string | null = null
      let sitemapFound = false
      try {
        const parsedUrl = new URL(url)
        const robotsRes = await fetch(`${parsedUrl.origin}/robots.txt`, { signal: AbortSignal.timeout(8000) })
        if (robotsRes.ok) robotsTxt = await robotsRes.text()
        console.log('[V3 Deep Scan] robots.txt:', robotsRes.ok ? 'Found' : 'Not found', robotsRes.status)
      } catch (e) {
        console.error('[V3 Deep Scan] robots.txt check failed:', e instanceof Error ? e.message : e)
      }
      try {
        const parsedUrl = new URL(url)
        const sitemapRes = await fetch(`${parsedUrl.origin}/sitemap.xml`, { signal: AbortSignal.timeout(8000) })
        if (sitemapRes.ok) {
          const sitemapText = await sitemapRes.text()
          sitemapFound = sitemapText.includes('<urlset') || sitemapText.includes('<sitemapindex')
        }
        console.log('[V3 Deep Scan] sitemap.xml:', sitemapRes.ok ? 'Found' : 'Not found', sitemapRes.status)
      } catch (e) {
        console.error('[V3 Deep Scan] sitemap check failed:', e instanceof Error ? e.message : e)
      }

      // Step 5: Sitewide AI Intelligence
      send({ type: 'progress', phase: 'Running sitewide AI intelligence analysis...', progress: 72 })
      let sitewideIntelligence: any = null
      try {
        const parsedUrl = new URL(url)
        sitewideIntelligence = await analyzeSitewideIntelligence({
          domain: parsedUrl.hostname,
          pages: crawlResult.pages.map(p => ({
            url: p.url,
            title: p.title || '',
            description: p.description || '',
            schemas: p.schemas || [],
            wordCount: p.wordCount,
            internalLinks: p.internalLinks,
            hasH1: p.hasH1,
            isHttps: p.isHttps,
            responseTimeMs: p.responseTimeMs,
            h2Count: p.h2Count,
            h3Count: p.h3Count,
            imgTotal: p.imgTotal,
            imgWithAlt: p.imgWithAlt,
          })),
          siteType: siteTypeResult.primaryType as any,
        })
      } catch (err) {
        console.error('[V3 Deep Scan] Sitewide intelligence failed:', err instanceof Error ? err.message : err)
        console.error('[V3 Deep Scan] Sitewide intelligence stack:', err instanceof Error ? err.stack : 'no stack')
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

      // Calculate aggregate metrics
      const totalWords = crawlResult.pages.reduce((s, p) => s + (p.wordCount || 0), 0)
      const totalSchemas = crawlResult.pages.reduce((s, p) => s + (p.schemas?.length || 0), 0)
      const avgResponseTime = crawlResult.pages.length > 0
        ? Math.round(crawlResult.pages.reduce((s, p) => s + (p.responseTimeMs || 0), 0) / crawlResult.pages.length)
        : 0
      const totalImages = crawlResult.pages.reduce((s, p) => s + (p.imgTotal || 0), 0)
      const totalImagesWithAlt = crawlResult.pages.reduce((s, p) => s + (p.imgWithAlt || 0), 0)

      // Duplicate title/meta detection
      const titleMap = new Map<string, string[]>()
      const descMap = new Map<string, string[]>()
      crawlResult.pages.forEach(p => {
        if (p.title) {
          const t = p.title.trim().toLowerCase()
          if (!titleMap.has(t)) titleMap.set(t, [])
          titleMap.get(t)!.push(p.url)
        }
        if (p.description) {
          const d = p.description.trim().toLowerCase()
          if (!descMap.has(d)) descMap.set(d, [])
          descMap.get(d)!.push(p.url)
        }
      })
      const duplicateTitles = Array.from(titleMap.entries()).filter(([, urls]) => urls.length > 1).map(([title, urls]) => ({ title, urls }))
      const duplicateDescriptions = Array.from(descMap.entries()).filter(([, urls]) => urls.length > 1).map(([description, urls]) => ({ description, urls }))

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
        crawlStats: { totalFound: crawlResult.pages.length, analyzed: pageAnalyses.length, failed: crawlResult.pages.length - pageAnalyses.length },
        // New sitewide data
        sitewideIntelligence,
        robotsTxt: robotsTxt ? true : false,
        sitemapFound,
        aggregateMetrics: { totalWords, totalSchemas, avgResponseTime, totalImages, totalImagesWithAlt },
        duplicateTitles,
        duplicateDescriptions,
      }})
    } catch (error: any) {
      console.error('[V3 Deep Scan] Error:', error)
      send({ type: 'error', success: false, error: error.message || 'Analysis failed' })
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
