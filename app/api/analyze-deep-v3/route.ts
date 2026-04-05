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
  const { url: rawUrl } = await request.json()
  const maxPages = 5

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

  const cost = 30
  const { allowed } = await useCredits(user.id, cost)
  if (!allowed) {
    return new Response(JSON.stringify({ error: `Insufficient credits. Deep Scan costs 30 credits.` }), {
      status: 402, headers: { 'Content-Type': 'application/json' },
    })
  }

  const creditCost = cost
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  // Create persistent scan job
  try { await createScanJob(user.id, 'deep', url, creditCost) } catch (e) { console.error('[Deep Scan] Scan job create failed:', e) }

  const stream = createSSEStream(async (send) => {
    let browser: Browser | null = null
    const tStart = Date.now()
    try {
      // Step 1: Discover internal URLs via lightweight HTTP fetch (no browser needed)
      send({ type: 'progress', phase: 'Discovering site pages...', progress: 5 })
      updateScanProgress(user.id, 'deep', 5, 'Discovering site pages...').catch(() => {})

      // Fetch backlinks in parallel with page discovery
      const backlinkPromise = fetchBacklinksWithCache(url, true)

      const domain = new URL(url).hostname
      let rawLinks: string[] = []
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DuellyBot/1.0)' },
          signal: AbortSignal.timeout(15000),
          redirect: 'follow',
        })
        if (res.ok) {
          const html = await res.text()
          const anchorHrefRegex = /<a\s[^>]*href=["']([^"']+)["']/gi
          let match
          while ((match = anchorHrefRegex.exec(html)) !== null) {
            rawLinks.push(match[1])
          }
        }
      } catch (e) {
        console.error('[Deep Scan] Lightweight discovery failed, falling back to browser:', e)
        const isLocal = process.env.NODE_ENV === 'development'
        browser = await playwright.launch({
          args: isLocal ? [] : chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: isLocal ? undefined : await chromium.executablePath(),
          headless: isLocal ? true : chromium.headless,
          channel: isLocal ? 'chrome' : undefined,
        })
        const discoveryPage = await browser.newPage()
        await discoveryPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        rawLinks = await discoveryPage.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href]'))
            .map(a => (a as HTMLAnchorElement).href)
            .filter(href => href.startsWith(window.location.origin) || href.startsWith('/'))
        })
        await discoveryPage.close()
        await browser.close()
        browser = null
      }

      // Deduplicate and clean links
      const seen = new Set<string>()
      /** Normalize URL for dedup: strip www, trailing slash, lowercase */
      const normalizeForDedup = (u: string) => u.replace(/\/$/, '').toLowerCase().replace(/^(https?:\/\/)www\./, '$1')
      seen.add(normalizeForDedup(url))
      const targetUrls: string[] = [url]

      for (const link of rawLinks) {
        try {
          const fullLink = new URL(link, url).href.split('#')[0].split('?')[0].replace(/\/$/, '')
          const normalized = normalizeForDedup(fullLink)
          const pathLower = fullLink.toLowerCase()

          // Skip if already seen or different domain
          if (seen.has(normalized)) continue
          if (!fullLink.includes(domain.replace(/^www\./, ''))) continue

          // Block asset file extensions (query strings already stripped)
          if (/\.(css|js|json|xml|rss|atom|txt|map|woff|woff2|ttf|eot|otf|svg|ico|png|jpg|jpeg|gif|webp|avif|bmp|tiff|mp3|mp4|avi|mov|wmv|flv|webm|ogg|wav|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|gz|tar|7z|dmg|exe|msi|deb|rpm)$/i.test(fullLink)) continue

          // Block CDN / asset / build paths
          if (/\/(cdn|assets|static|_next|__next|wp-content\/(uploads|plugins|themes)|wp-includes|wp-json|wp-admin|node_modules|vendor|dist|build|bundles|chunks|fonts|images|img|media|uploads|downloads|files)\//i.test(pathLower)) continue

          // Block Shopify CDN patterns
          if (/\/cdn\/shop\//i.test(pathLower)) continue

          // Block common non-page paths
          if (/\/(feed|rss|sitemap|robots\.txt|favicon|apple-touch-icon|manifest\.json|sw\.js|service-worker)/i.test(pathLower)) continue

          // Block mailto, tel, javascript links
          if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(link)) continue

          // Block login/auth/admin/cart paths
          if (/\/(wp-login|wp-admin|admin|login|logout|signin|signout|register|cart|checkout|account|my-account)\b/i.test(pathLower)) continue

          seen.add(normalized)
          targetUrls.push(fullLink)
        } catch (e) { }
      }

      const pagesToScan = targetUrls.slice(0, maxPages)
      const totalPages = pagesToScan.length
      send({ type: 'progress', phase: `Found ${totalPages} pages. Starting scans...`, progress: 12 })

      // Steps 2-4: Pipeline crawl + AI analysis — crawl and analyze pages concurrently
      // As each page finishes crawling, its AI analysis starts immediately
      const BATCH_SIZE = 5
      const scanResults: { url: string; scanResult: ScanResult }[] = []
      const pageAnalyses: any[] = []

      // First, detect site type from the first page (need it before AI analysis)
      send({ type: 'progress', phase: 'Crawling first page for site detection...', progress: 14 })
      let siteTypeResult: any = null
      try {
        const firstScan = await performScan(pagesToScan[0])
        scanResults.push({ url: pagesToScan[0], scanResult: firstScan })
        siteTypeResult = detectSiteType(firstScan as any, [])
        send({ type: 'progress', phase: `Site type: ${siteTypeResult.primaryType}. Scanning remaining pages...`, progress: 18 })
      } catch (error) {
        console.error(`[Deep Scan] Failed to scan first page ${pagesToScan[0]}:`, error)
        send({ type: 'error', success: false, error: 'Failed to crawl the primary page' })
        return
      }

      // Start a slow ticker during the pipeline phase
      const tickerInterval = maxPages > 5 ? 5000 : 3000
      const aiTicker = createProgressTicker(send, 'Crawling and analyzing pages...', 20, 50, 1, tickerInterval)

      // Pipeline: crawl remaining pages and AI-analyze all pages concurrently
      // Start AI on the first page immediately while crawling the rest
      const analyzeOnePage = async (pageUrl: string, scanResult: ScanResult) => {
        try {
          ;(scanResult as any).siteType = siteTypeResult.primaryType
          const isHomepage = pageUrl === url
          const aiAnalysis = await analyzeWithGemini({
            title: scanResult.title,
            description: scanResult.description,
            thinnedText: scanResult.thinnedText,
            summarizedContent: scanResult.summarizedContent,
            schemas: scanResult.schemas,
            structuralData: scanResult.structuralData,
          }, { singleCall: !isHomepage, skipRecommendations: true })

          ;(scanResult as any).semanticFlags = aiAnalysis.semanticFlags
          ;(scanResult as any).schemaQuality = aiAnalysis.schemaQuality

          const graderResult = calculateScoresFromScanResult(scanResult)
          const enhancedPenalties = convertBreakdownToEnhancedPenalties(
            graderResult.breakdown.seo, graderResult.breakdown.aeo, graderResult.breakdown.geo,
            scanResult.platformDetection?.platform
          )

          return {
            url: pageUrl, title: scanResult.title,
            scores: { seo: { score: graderResult.seoScore }, aeo: { score: graderResult.aeoScore }, geo: { score: graderResult.geoScore } },
            graderResult, enhancedPenalties,
            wordCount: scanResult.structuralData.wordCount,
            hasH1: scanResult.structuralData.semanticTags.h1Count > 0,
            isHttps: scanResult.technical.isHttps,
            hasDescription: !!scanResult.description,
            schemaCount: (scanResult.schemas || []).length,
            responseTimeMs: scanResult.technical.responseTimeMs,
            scanData: {
              structuralData: scanResult.structuralData, schemas: scanResult.schemas,
              semanticFlags: (scanResult as any).semanticFlags, schemaQuality: (scanResult as any).schemaQuality,
              title: scanResult.title, description: scanResult.description,
              url: scanResult.url, technical: scanResult.technical,
            },
          }
        } catch (error) {
          console.error(`[Deep Scan] AI analysis failed for ${pageUrl}:`, error)
          return null
        }
      }

      // Start AI for first page + crawl remaining pages in parallel
      const aiPromises: Promise<any>[] = [analyzeOnePage(pagesToScan[0], scanResults[0].scanResult)]
      const remainingPages = pagesToScan.slice(1)

      if (remainingPages.length > 0) {
        // Crawl remaining pages in batches, start AI as each finishes
        for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
          const batch = remainingPages.slice(i, i + BATCH_SIZE)
          const crawlResults = await Promise.all(
            batch.map(async (pageUrl) => {
              try {
                const scanResult = await performScan(pageUrl)
                return { url: pageUrl, scanResult }
              } catch (error) {
                console.error(`[Deep Scan] Failed to scan ${pageUrl}:`, error)
                return null
              }
            })
          )
          // Start AI analysis for each crawled page immediately
          crawlResults.forEach(r => {
            if (r) {
              scanResults.push(r)
              aiPromises.push(analyzeOnePage(r.url, r.scanResult))
            }
          })
        }
      }

      // Wait for all AI analyses to complete
      const aiResults = await Promise.all(aiPromises)
      aiResults.forEach(r => { if (r) pageAnalyses.push(r) })

      aiTicker.stop()

      if (pageAnalyses.length === 0) {
        send({ type: 'error', success: false, error: 'Failed to analyze any pages' })
        return
      }

      updateScanProgress(user.id, 'deep', 50, `Analyzed ${pageAnalyses.length} pages`).catch(() => {})

      // Step 5: Robots.txt, Sitemap, Backlinks — all in parallel
      const t5 = Date.now()
      console.log(`[Deep Scan] Step 5: Robots/sitemap/backlinks (${Math.round((t5 - tStart) / 1000)}s elapsed)`)
      send({ type: 'progress', phase: 'Checking robots.txt, sitemap, and backlinks...', progress: 52 })

      let robotsTxt: string | null = null
      let sitemapFound = false
      const parsedUrl = new URL(url)

      const [robotsResult, sitemapResult, backlinkData] = await Promise.all([
        fetch(`${parsedUrl.origin}/robots.txt`, { signal: AbortSignal.timeout(5000) })
          .then(r => r.ok ? r.text() : null).catch(() => null),
        fetch(`${parsedUrl.origin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) })
          .then(r => r.ok ? r.text() : null).catch(() => null),
        backlinkPromise,
      ])
      robotsTxt = robotsResult
      sitemapFound = sitemapResult ? (sitemapResult.includes('<urlset') || sitemapResult.includes('<sitemapindex')) : false
      console.log(`[Deep Scan] Step 5 done (${Math.round((Date.now() - t5) / 1000)}s)`)

      // Pre-calculate scores and aggregates (fast, no I/O)
      send({ type: 'progress', phase: 'Calculating scores...', progress: 55 })
      const avgScores = {
        seo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.seo.score, 0) / pageAnalyses.length),
        aeo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.aeo.score, 0) / pageAnalyses.length),
        geo: Math.round(pageAnalyses.reduce((s: number, a: any) => s + a.scores.geo.score, 0) / pageAnalyses.length),
      }
      const schemaCoverage = {
        totalPages: pageAnalyses.length,
        pagesWithSchema: pageAnalyses.filter((a: any) => a.schemaCount > 0).length,
      }
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
        if (sr.title) { const t = sr.title.trim().toLowerCase(); if (!titleMap.has(t)) titleMap.set(t, []); titleMap.get(t)!.push(sr.url) }
        if (sr.description) { const d = sr.description.trim().toLowerCase(); if (!descMap.has(d)) descMap.set(d, []); descMap.get(d)!.push(sr.url) }
      })
      const duplicateTitles = Array.from(titleMap.entries()).filter(([, urls]) => urls.length > 1).map(([title, urls]) => ({ title, urls }))
      const duplicateDescriptions = Array.from(descMap.entries()).filter(([, urls]) => urls.length > 1).map(([description, urls]) => ({ description, urls }))

      const siteWideIssues: any[] = []
      const missingH1 = pageAnalyses.filter((a: any) => !a.hasH1)
      if (missingH1.length > 0) siteWideIssues.push({ type: 'missing-h1', affectedPages: missingH1.map((a: any) => a.url), count: missingH1.length, severity: missingH1.length > pageAnalyses.length * 0.5 ? 'critical' : 'high', description: `${missingH1.length} page(s) missing H1 tags` })
      const thinContent = pageAnalyses.filter((a: any) => a.wordCount < 300)
      if (thinContent.length > 0) siteWideIssues.push({ type: 'thin-content', affectedPages: thinContent.map((a: any) => a.url), count: thinContent.length, severity: thinContent.length > pageAnalyses.length * 0.3 ? 'high' : 'medium', description: `${thinContent.length} page(s) with thin content (<300 words)` })
      const missingMeta = pageAnalyses.filter((a: any) => !a.hasDescription)
      if (missingMeta.length > 0) siteWideIssues.push({ type: 'missing-meta', affectedPages: missingMeta.map((a: any) => a.url), count: missingMeta.length, severity: missingMeta.length > pageAnalyses.length * 0.5 ? 'critical' : 'high', description: `${missingMeta.length} page(s) missing meta descriptions` })

      // Step 6: Sitewide intelligence + Expert analysis — IN PARALLEL (both are Gemini calls)
      const t6 = Date.now()
      console.log(`[Deep Scan] Step 6: Sitewide intel + expert analysis in parallel (${Math.round((t6 - tStart) / 1000)}s elapsed)`)
      send({ type: 'progress', phase: 'Generating sitewide intelligence and expert analysis...', progress: 58 })
      updateScanProgress(user.id, 'deep', 58, 'Generating sitewide intelligence...').catch(() => {})

      const [sitewideIntelligence, expertAnalysis] = await Promise.all([
        analyzeSitewideIntelligence({
          domain: parsedUrl.hostname,
          pages: scanResults.map(({ scanResult: sr }) => ({
            url: sr.url, title: sr.title || '', description: sr.description || '',
            schemas: sr.schemas || [], wordCount: sr.structuralData.wordCount,
            internalLinks: sr.structuralData.links.internal,
            hasH1: sr.structuralData.semanticTags.h1Count > 0,
            isHttps: sr.technical.isHttps, responseTimeMs: sr.technical.responseTimeMs,
            h2Count: sr.structuralData.semanticTags.h2Count, h3Count: sr.structuralData.semanticTags.h3Count,
            imgTotal: sr.structuralData.media.totalImages, imgWithAlt: sr.structuralData.media.imagesWithAlt,
          })),
          siteType: siteTypeResult.primaryType as any,
          platform: scanResults[0]?.scanResult?.platformDetection?.label,
          currentScores: avgScores,
          backlinkContext: buildSingleSiteBacklinkContext(backlinkData, url),
        }).catch((err) => { console.error('[Deep Scan] Sitewide intelligence failed:', err instanceof Error ? err.message : err); return null }),

        Promise.race([
          generateAIExpertAnalysis({
            context: 'deep-scan', url, scores: avgScores,
            siteType: siteTypeResult.primaryType, pagesCrawled: pageAnalyses.length,
            domainAuthority: backlinkData?.metrics?.domainAuthority,
            totalBacklinks: backlinkData?.metrics?.totalBacklinks,
            avgResponseTime, totalWords,
            schemaCoverage: `${schemaCoverage.pagesWithSchema}/${schemaCoverage.totalPages}`,
            duplicateTitles: duplicateTitles.length,
            missingH1Count: missingH1.length, thinContentCount: thinContent.length,
          }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)),
        ]).catch(() => null),
      ])
      console.log(`[Deep Scan] Step 6 done (${Math.round((Date.now() - t6) / 1000)}s). Sitewide: ${sitewideIntelligence ? 'yes' : 'null'}, Expert: ${expertAnalysis ? 'yes' : 'null'}`)

      // Step 7: Save and return
      send({ type: 'progress', phase: 'Saving results...', progress: 92 })
      saveScanSnapshot({
        id: `deep-v3-${Date.now()}`, url, timestamp: new Date().toISOString(),
        apiRoute: '/api/analyze-deep-v3', scores: avgScores,
        siteType: siteTypeResult.primaryType,
        rawAiScores: pageAnalyses[0]?.graderResult, graderBreakdown: pageAnalyses[0]?.graderResult?.breakdown,
        enhancedPenalties: pageAnalyses[0]?.enhancedPenalties,
        fullResult: { pagesCrawled: pageAnalyses.length, perPageScores: pageAnalyses.map((a: any) => ({ url: a.url, seo: a.scores.seo.score, aeo: a.scores.aeo.score, geo: a.scores.geo.score })) }
      })

      send({ type: 'progress', phase: 'Deep scan complete!', progress: 100 })
      console.log(`[Deep Scan] Complete! Total time: ${Math.round((Date.now() - tStart) / 1000)}s`)
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
      try { await completeScanJob(user.id, 'deep', resultData) } catch (e) { console.error('[Deep Scan] Scan job complete failed:', e) }
      saveScanToDb(user.id, 'deep', url, avgScores ? { seo: avgScores.seo, aeo: avgScores.aeo, geo: avgScores.geo } : null, resultData).catch(() => {})
      send({ type: 'result', success: true, data: resultData })
    } catch (error: any) {
      console.error('[Deep Scan] Error:', error)
      // Refund credits on failure
      try { await refundCredits(user.id, creditCost) } catch (e) { console.error('[Deep Scan] Refund failed:', e) }
      try { await failScanJob(user.id, 'deep') } catch (e) { console.error('[Deep Scan] Scan job fail update failed:', e) }
      send({ type: 'error', success: false, error: error.message || 'Analysis failed', creditsRefunded: creditCost })
    } finally {
      if (browser) await (browser as Browser).close()
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
