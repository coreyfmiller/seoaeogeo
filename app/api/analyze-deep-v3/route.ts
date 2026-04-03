import { NextRequest } from 'next/server'
import { performScan, type ScanResult } from '@/lib/crawler'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeWithGemini } from '@/lib/gemini'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide'
import { saveScanSnapshot } from '@/lib/scan-snapshots'
import { createSSEStream, createProgressTicker, SSE_HEADERS } from '@/lib/sse-helpers'
import { chromium as playwright, type Browser } from 'playwright-core'
import chromium from '@sparticuz/chromium'
import { getAuthUser, useCredits, refundCredits, incrementScanCount } from '@/lib/supabase/auth-helpers'
import { createScanJob, completeScanJob, failScanJob, updateScanProgress } from '@/lib/scan-jobs'
import { fetchBacklinksWithCache, buildSingleSiteBacklinkContext } from '@/lib/backlink-fetcher'
import { saveScanToDb } from '@/lib/scan-history-db'
import { generateAIExpertAnalysis } from '@/lib/gemini-expert-analysis'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const { url: rawUrl, maxPages: requestedPages = 10 } = await request.json()
  const maxPages = Math.min(requestedPages, 20)

  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Auth + credit check (Deep Scan = 10 base + 1 per page)
  const user = await getAuthUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const cost = 10 + maxPages
  const { allowed } = await useCredits(user.id, cost)
  if (!allowed) {
    return new Response(JSON.stringify({ error: `Insufficient credits. Deep Scan costs ${cost} credits (10 base + ${maxPages} pages).` }), {
      status: 402, headers: { 'Content-Type': 'application/json' },
    })
  }

  const creditCost = cost
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  // Create persistent scan job
  try { await createScanJob(user.id, 'deep', url, creditCost) } catch (e) { console.error('[Deep Scan] Scan job create failed:', e) }

  const stream = createSSEStream(async (send) => {
    let browser: Browser | null = null
    try {
      // Step 1: Launch browser and discover internal URLs
      send({ type: 'progress', phase: 'Launching browser...', progress: 5 })
      updateScanProgress(user.id, 'deep', 5, 'Launching browser...').catch(() => {})

      const isLocal = process.env.NODE_ENV === 'development'
      browser = await playwright.launch({
        args: isLocal ? [] : chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: isLocal ? undefined : await chromium.executablePath(),
        headless: isLocal ? true : chromium.headless,
        channel: isLocal ? 'chrome' : undefined,
      })

      send({ type: 'progress', phase: 'Discovering site pages...', progress: 8 })
      const discoveryPage = await browser.newPage()
      await discoveryPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

      // Fetch backlinks in parallel with page discovery (uses cache, zero extra time if cached)
      const backlinkPromise = fetchBacklinksWithCache(url, true)

      // Extract internal links for crawling
      const domain = new URL(url).hostname
      const rawLinks = await discoveryPage.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => href.startsWith(window.location.origin) || href.startsWith('/'))
      })
      await discoveryPage.close()
      await browser.close()
      browser = null

      // Deduplicate and clean links
      const seen = new Set<string>()
      /** Normalize URL for dedup: strip www, trailing slash, lowercase */
      const normalizeForDedup = (u: string) => u.replace(/\/$/, '').toLowerCase().replace(/^(https?:\/\/)www\./, '$1')
      seen.add(normalizeForDedup(url))
      const targetUrls: string[] = [url]

      for (const link of rawLinks) {
        try {
          const fullLink = new URL(link, url).href.split('#')[0].replace(/\/$/, '')
          const normalized = normalizeForDedup(fullLink)
          if (
            fullLink.includes(domain.replace(/^www\./, '')) &&
            !seen.has(normalized) &&
            !fullLink.match(/\.(jpg|jpeg|png|gif|pdf|zip|css|js)$/i)
          ) {
            seen.add(normalized)
            targetUrls.push(fullLink)
          }
        } catch (e) { }
      }

      const pagesToScan = targetUrls.slice(0, maxPages)
      const totalPages = pagesToScan.length
      send({ type: 'progress', phase: `Found ${totalPages} pages. Starting scans...`, progress: 12 })

      // Step 2: Scan each page using the EXACT same performScan as Pro Audit
      // Process in batches of 3 (each launches its own browser, same as Pro Audit)
      const BATCH_SIZE = 3
      const scanResults: { url: string; scanResult: ScanResult }[] = []
      let completed = 0

      for (let i = 0; i < pagesToScan.length; i += BATCH_SIZE) {
        const batch = pagesToScan.slice(i, i + BATCH_SIZE)
        const batchNum = Math.floor(i / BATCH_SIZE) + 1
        const totalBatches = Math.ceil(pagesToScan.length / BATCH_SIZE)
        send({ type: 'progress', phase: `Crawling batch ${batchNum}/${totalBatches} (${completed}/${totalPages} pages done)...`, progress: Math.round(12 + (completed / totalPages) * 18) })

        const batchResults = await Promise.all(
          batch.map(async (pageUrl) => {
            try {
              // Identical to Pro Audit — same function, same browser launch, same extraction
              const scanResult = await performScan(pageUrl)
              return { url: pageUrl, scanResult }
            } catch (error) {
              console.error(`[Deep Scan] Failed to scan ${pageUrl}:`, error)
              return null
            }
          })
        )

        batchResults.forEach(r => { if (r) scanResults.push(r) })
        completed += batch.length
        // Update DB progress during crawl so polling clients see movement
        const crawlProgress = Math.round(12 + (completed / totalPages) * 18)
        updateScanProgress(user.id, 'deep', crawlProgress, `Crawling ${completed}/${totalPages} pages...`).catch(() => {})
      }

      if (scanResults.length === 0) {
        send({ type: 'error', success: false, error: 'Failed to crawl any pages' })
        return
      }

      send({ type: 'progress', phase: `Crawled ${scanResults.length} pages. Detecting site type...`, progress: 32 })
      updateScanProgress(user.id, 'deep', 32, `Crawled ${scanResults.length} pages`).catch(() => {})

      // Step 3: Site type detection (using first page, same as before)
      const siteTypeResult = detectSiteType(scanResults[0].scanResult as any, [])
      send({ type: 'progress', phase: `Site type: ${siteTypeResult.primaryType}. Starting AI analysis...`, progress: 35 })
      updateScanProgress(user.id, 'deep', 35, `Site type: ${siteTypeResult.primaryType}. Starting AI...`).catch(() => {})

      // Step 4: AI analysis + grading for each page — identical pipeline to Pro Audit
      const pageAnalyses: any[] = []
      let aiCompleted = 0

      // Start a slow ticker that creeps from 35 to 90 during AI analysis
      const aiTicker = createProgressTicker(send, 'Running AI analysis on all pages...', 35, 90, 2, 4000)

      for (let i = 0; i < scanResults.length; i += BATCH_SIZE) {
        const batch = scanResults.slice(i, i + BATCH_SIZE)

        const batchResults = await Promise.all(
          batch.map(async ({ url: pageUrl, scanResult }) => {
            try {
              ;(scanResult as any).siteType = siteTypeResult.primaryType

              // Same AI call as Pro Audit
              const aiAnalysis = await analyzeWithGemini({
                title: scanResult.title,
                description: scanResult.description,
                thinnedText: scanResult.thinnedText,
                summarizedContent: scanResult.summarizedContent,
                schemas: scanResult.schemas,
                structuralData: scanResult.structuralData,
              })

              ;(scanResult as any).semanticFlags = aiAnalysis.semanticFlags
              ;(scanResult as any).schemaQuality = aiAnalysis.schemaQuality

              // Same grader call as Pro Audit
              const graderResult = calculateScoresFromScanResult(scanResult)
              const enhancedPenalties = convertBreakdownToEnhancedPenalties(
                graderResult.breakdown.seo, graderResult.breakdown.aeo, graderResult.breakdown.geo,
                scanResult.platformDetection?.platform
              )

              return {
                url: pageUrl,
                title: scanResult.title,
                scores: {
                  seo: { score: graderResult.seoScore },
                  aeo: { score: graderResult.aeoScore },
                  geo: { score: graderResult.geoScore },
                },
                graderResult,
                enhancedPenalties,
                wordCount: scanResult.structuralData.wordCount,
                hasH1: scanResult.structuralData.semanticTags.h1Count > 0,
                isHttps: scanResult.technical.isHttps,
                hasDescription: !!scanResult.description,
                schemaCount: (scanResult.schemas || []).length,
                responseTimeMs: scanResult.technical.responseTimeMs,
                // Stash scan data for client-side recalculation on site type change
                scanData: {
                  structuralData: scanResult.structuralData,
                  schemas: scanResult.schemas,
                  semanticFlags: (scanResult as any).semanticFlags,
                  schemaQuality: (scanResult as any).schemaQuality,
                  title: scanResult.title,
                  description: scanResult.description,
                  url: scanResult.url,
                  technical: scanResult.technical,
                },
              }
            } catch (error) {
              console.error(`[Deep Scan] AI analysis failed for ${pageUrl}:`, error)
              return null
            }
          })
        )

        batchResults.forEach(r => { if (r) pageAnalyses.push(r) })
        aiCompleted += batch.length
        // Update DB progress during AI analysis so polling clients see movement
        const aiProgress = Math.round(35 + (aiCompleted / scanResults.length) * 55)
        updateScanProgress(user.id, 'deep', aiProgress, `AI analyzed ${aiCompleted}/${scanResults.length} pages...`).catch(() => {})
      }

      aiTicker.stop()

      if (pageAnalyses.length === 0) {
        send({ type: 'error', success: false, error: 'Failed to analyze any pages' })
        return
      }

      // Step 5: Robots.txt & Sitemap check
      send({ type: 'progress', phase: 'Checking robots.txt and sitemap...', progress: 91 })
      let robotsTxt: string | null = null
      let sitemapFound = false
      try {
        const parsedUrl = new URL(url)
        const robotsRes = await fetch(`${parsedUrl.origin}/robots.txt`, { signal: AbortSignal.timeout(8000) })
        if (robotsRes.ok) robotsTxt = await robotsRes.text()
      } catch (e) { }
      try {
        const parsedUrl = new URL(url)
        const sitemapRes = await fetch(`${parsedUrl.origin}/sitemap.xml`, { signal: AbortSignal.timeout(8000) })
        if (sitemapRes.ok) {
          const sitemapText = await sitemapRes.text()
          sitemapFound = sitemapText.includes('<urlset') || sitemapText.includes('<sitemapindex')
        }
      } catch (e) { }

      // Step 6: Sitewide AI Intelligence + resolve backlinks
      send({ type: 'progress', phase: 'Running sitewide intelligence analysis...', progress: 93 })
      updateScanProgress(user.id, 'deep', 93, 'Running sitewide intelligence...').catch(() => {})
      let sitewideIntelligence: any = null
      const backlinkData = await backlinkPromise

      // Pre-calculate avg scores so we can pass them to the AI for score-gap-aware recommendations
      const preAvgScores = {
        seo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.seo.score, 0) / pageAnalyses.length),
        aeo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.aeo.score, 0) / pageAnalyses.length),
        geo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.geo.score, 0) / pageAnalyses.length),
      }

      try {
        const parsedUrl = new URL(url)
        sitewideIntelligence = await analyzeSitewideIntelligence({
          domain: parsedUrl.hostname,
          pages: scanResults.map(({ scanResult: sr }) => ({
            url: sr.url,
            title: sr.title || '',
            description: sr.description || '',
            schemas: sr.schemas || [],
            wordCount: sr.structuralData.wordCount,
            internalLinks: sr.structuralData.links.internal,
            hasH1: sr.structuralData.semanticTags.h1Count > 0,
            isHttps: sr.technical.isHttps,
            responseTimeMs: sr.technical.responseTimeMs,
            h2Count: sr.structuralData.semanticTags.h2Count,
            h3Count: sr.structuralData.semanticTags.h3Count,
            imgTotal: sr.structuralData.media.totalImages,
            imgWithAlt: sr.structuralData.media.imagesWithAlt,
          })),
          siteType: siteTypeResult.primaryType as any,
          platform: scanResults[0]?.scanResult?.platformDetection?.label,
          currentScores: preAvgScores,
          backlinkContext: buildSingleSiteBacklinkContext(backlinkData, url),
        })
      } catch (err) {
        console.error('[Deep Scan] Sitewide intelligence failed:', err instanceof Error ? err.message : err)
      }

      send({ type: 'progress', phase: 'Calculating aggregate scores...', progress: 95 })
      updateScanProgress(user.id, 'deep', 95, 'Calculating aggregate scores...').catch(() => {})

      // Aggregate scores
      const avgScores = {
        seo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.seo.score, 0) / pageAnalyses.length),
        aeo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.aeo.score, 0) / pageAnalyses.length),
        geo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.geo.score, 0) / pageAnalyses.length),
      }
      const schemaCoverage = {
        totalPages: pageAnalyses.length,
        pagesWithSchema: pageAnalyses.filter((a: any) => a.schemaCount > 0).length,
      }

      // Aggregate metrics from scan results
      const totalWords = scanResults.reduce((s, { scanResult: sr }) => s + (sr.structuralData.wordCount || 0), 0)
      const totalSchemas = scanResults.reduce((s, { scanResult: sr }) => s + (sr.schemas?.length || 0), 0)
      const avgResponseTime = scanResults.length > 0
        ? Math.round(scanResults.reduce((s, { scanResult: sr }) => s + (sr.technical.responseTimeMs || 0), 0) / scanResults.length)
        : 0
      const totalImages = scanResults.reduce((s, { scanResult: sr }) => s + (sr.structuralData.media.totalImages || 0), 0)
      const totalImagesWithAlt = scanResults.reduce((s, { scanResult: sr }) => s + (sr.structuralData.media.imagesWithAlt || 0), 0)

      // Duplicate title/meta detection
      const titleMap = new Map<string, string[]>()
      const descMap = new Map<string, string[]>()
      scanResults.forEach(({ scanResult: sr }) => {
        if (sr.title) {
          const t = sr.title.trim().toLowerCase()
          if (!titleMap.has(t)) titleMap.set(t, [])
          titleMap.get(t)!.push(sr.url)
        }
        if (sr.description) {
          const d = sr.description.trim().toLowerCase()
          if (!descMap.has(d)) descMap.set(d, [])
          descMap.get(d)!.push(sr.url)
        }
      })
      const duplicateTitles = Array.from(titleMap.entries()).filter(([, urls]) => urls.length > 1).map(([title, urls]) => ({ title, urls }))
      const duplicateDescriptions = Array.from(descMap.entries()).filter(([, urls]) => urls.length > 1).map(([description, urls]) => ({ description, urls }))

      // Orphan / duplicate / site-wide issues (simplified since we don't have outboundLinks from performScan)
      const siteWideIssues: any[] = []
      const missingH1 = pageAnalyses.filter((a: any) => !a.hasH1)
      if (missingH1.length > 0) siteWideIssues.push({ type: 'missing-h1', affectedPages: missingH1.map((a: any) => a.url), count: missingH1.length, severity: missingH1.length > pageAnalyses.length * 0.5 ? 'critical' : 'high', description: `${missingH1.length} page(s) missing H1 tags` })
      const thinContent = pageAnalyses.filter((a: any) => a.wordCount < 300)
      if (thinContent.length > 0) siteWideIssues.push({ type: 'thin-content', affectedPages: thinContent.map((a: any) => a.url), count: thinContent.length, severity: thinContent.length > pageAnalyses.length * 0.3 ? 'high' : 'medium', description: `${thinContent.length} page(s) with thin content (<300 words)` })
      const missingMeta = pageAnalyses.filter((a: any) => !a.hasDescription)
      if (missingMeta.length > 0) siteWideIssues.push({ type: 'missing-meta', affectedPages: missingMeta.map((a: any) => a.url), count: missingMeta.length, severity: missingMeta.length > pageAnalyses.length * 0.5 ? 'critical' : 'high', description: `${missingMeta.length} page(s) missing meta descriptions` })

      send({ type: 'progress', phase: 'Generating expert analysis...', progress: 97 })

      // Generate AI expert analysis
      const expertAnalysis = await generateAIExpertAnalysis({
        context: 'deep-scan', url,
        scores: avgScores,
        siteType: siteTypeResult.primaryType,
        pagesCrawled: pageAnalyses.length,
        domainAuthority: backlinkData?.metrics?.domainAuthority,
        totalBacklinks: backlinkData?.metrics?.totalBacklinks,
        avgResponseTime,
        totalWords,
        schemaCoverage: `${schemaCoverage.pagesWithSchema}/${schemaCoverage.totalPages}`,
        duplicateTitles: duplicateTitles.length,
        missingH1Count: missingH1.length,
        thinContentCount: thinContent.length,
      }).catch(() => null)

      send({ type: 'progress', phase: 'Saving snapshot...', progress: 98 })
      saveScanSnapshot({
        id: `deep-v3-${Date.now()}`, url, timestamp: new Date().toISOString(),
        apiRoute: '/api/analyze-deep-v3', scores: avgScores,
        siteType: siteTypeResult.primaryType,
        rawAiScores: pageAnalyses[0]?.graderResult, graderBreakdown: pageAnalyses[0]?.graderResult?.breakdown,
        enhancedPenalties: pageAnalyses[0]?.enhancedPenalties,
        fullResult: { pagesCrawled: pageAnalyses.length, perPageScores: pageAnalyses.map((a: any) => ({ url: a.url, seo: a.scores.seo.score, aeo: a.scores.aeo.score, geo: a.scores.geo.score })) }
      })

      send({ type: 'progress', phase: 'Deep scan complete!', progress: 100 })
      await incrementScanCount(user.id, 'deep')
      const resultData = {
        url, analyzedAt: new Date().toISOString(), siteTypeResult,
        platformDetection: scanResults[0]?.scanResult?.platformDetection,
        pagesCrawled: pageAnalyses.length, scores: avgScores, pages: pageAnalyses,
        schemaCoverage, siteWideIssues,
        orphanPages: [], duplicateGroups: [],
        crawlStats: { totalFound: pagesToScan.length, analyzed: pageAnalyses.length, failed: pagesToScan.length - pageAnalyses.length },
        sitewideIntelligence,
        robotsTxt: robotsTxt ? true : false,
        sitemapFound,
        aggregateMetrics: { totalWords, totalSchemas, avgResponseTime, totalImages, totalImagesWithAlt },
        duplicateTitles,
        duplicateDescriptions,
        backlinkData,
        expertAnalysis,
      }
      // Persist result to scan_jobs so user can retrieve it if they navigated away
      try { await completeScanJob(user.id, 'deep', resultData) } catch (e) { console.error('[Deep Scan] Scan job complete failed:', e) }
      // Save to persistent scan history
      saveScanToDb(user.id, 'deep', url, avgScores ? { seo: avgScores.seo, aeo: avgScores.aeo, geo: avgScores.geo } : null, resultData).catch(() => {})
      send({ type: 'result', success: true, data: resultData })
    } catch (error: any) {
      console.error('[Deep Scan] Error:', error)
      // Refund credits on failure
      try { await refundCredits(user.id, creditCost) } catch (e) { console.error('[Deep Scan] Refund failed:', e) }
      try { await failScanJob(user.id, 'deep') } catch (e) { console.error('[Deep Scan] Scan job fail update failed:', e) }
      send({ type: 'error', success: false, error: error.message || 'Analysis failed', creditsRefunded: creditCost })
    } finally {
      if (browser) await browser.close()
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
