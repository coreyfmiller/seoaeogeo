import { NextRequest } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { detectSiteType } from '@/lib/site-type-detector'
import { analyzeLiteIntelligence } from '@/lib/gemini-lite'
import { createSSEStream, SSE_HEADERS } from '@/lib/sse-helpers'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const { url: rawUrl } = await request.json()

  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  const stream = createSSEStream(async (send) => {
    try {
      // Step 1: Crawl
      send({ type: 'progress', phase: 'Crawling page and extracting content...', progress: 10 })
      const pageData = await performScan(url)
      send({ type: 'progress', phase: 'Detecting site type...', progress: 30 })

      // Step 2: Site type detection
      const siteTypeResult = detectSiteType(pageData, [])
      pageData.siteType = siteTypeResult.primaryType
      send({ type: 'progress', phase: `Detected: ${siteTypeResult.primaryType}. Scoring...`, progress: 40 })

      // Step 3: Content quality heuristics
      const wordCount = pageData.structuralData?.wordCount || 0
      let schemaQuality = null
      if (pageData.schemas?.length > 0) {
        const hasRequiredProps = pageData.schemas.some((s: any) => s.name || s.headline || s['@type'])
        schemaQuality = { hasSchema: true, score: hasRequiredProps ? 70 : 40, issues: hasRequiredProps ? [] : ['Missing required properties'] }
      } else {
        schemaQuality = { hasSchema: false, score: 0, issues: ['No structured data found'] }
      }
      pageData.schemaQuality = schemaQuality

      if (wordCount < 500) {
        pageData.semanticFlags = {
          noDirectQnAMatching: true, lowEntityDensity: true, poorFormattingConciseness: wordCount < 300,
          lackOfDefinitionStatements: true, promotionalTone: false, lackOfExpertiseSignals: true,
          lackOfHardData: true, heavyFirstPersonUsage: false, unsubstantiatedClaims: false,
        }
      } else {
        pageData.semanticFlags = {
          noDirectQnAMatching: false, lowEntityDensity: false, poorFormattingConciseness: false,
          lackOfDefinitionStatements: false, promotionalTone: false, lackOfExpertiseSignals: false,
          lackOfHardData: false, heavyFirstPersonUsage: false, unsubstantiatedClaims: false,
        }
      }

      // Step 4: Grade
      send({ type: 'progress', phase: 'Calculating scores...', progress: 55 })
      const graderResult = calculateScoresFromScanResult(pageData)

      // Step 5: Robots.txt & Sitemap
      send({ type: 'progress', phase: 'Checking robots.txt and sitemap...', progress: 65 })
      let robotsTxt = false
      let sitemapFound = false
      try {
        const parsedUrl = new URL(url)
        const robotsRes = await fetch(`${parsedUrl.origin}/robots.txt`, { signal: AbortSignal.timeout(8000) })
        robotsTxt = robotsRes.ok
      } catch {}
      try {
        const parsedUrl = new URL(url)
        const sitemapRes = await fetch(`${parsedUrl.origin}/sitemap.xml`, { signal: AbortSignal.timeout(8000) })
        if (sitemapRes.ok) {
          const text = await sitemapRes.text()
          sitemapFound = text.includes('<urlset') || text.includes('<sitemapindex')
        }
      } catch {}

      // Step 6: Lite AI — Domain Health + Brand (minimal tokens)
      send({ type: 'progress', phase: 'Running lite AI analysis...', progress: 75 })
      const sd = pageData.structuralData || {}
      let liteAI = null
      try {
        const parsedUrl = new URL(url)
        liteAI = await analyzeLiteIntelligence({
          domain: parsedUrl.hostname,
          title: pageData.title || '',
          description: pageData.description || '',
          wordCount: sd.wordCount || 0,
          hasH1: (sd.semanticTags?.h1Count || 0) > 0,
          isHttps: pageData.technical?.isHttps === true,
          responseTimeMs: pageData.technical?.responseTimeMs || 0,
          schemaCount: (pageData.schemas || []).length,
          imgTotal: sd.media?.totalImages || 0,
          imgWithAlt: sd.media?.imagesWithAlt || 0,
          internalLinks: sd.links?.internal || 0,
          siteType: siteTypeResult.primaryType as any,
        })
      } catch (err) {
        console.error('[V4 API] Lite AI failed:', err instanceof Error ? err.message : err)
      }

      const scores = {
        seo: { score: graderResult.seoScore },
        aeo: { score: graderResult.aeoScore },
        geo: { score: graderResult.geoScore },
      }

      // Count issues from grader breakdown
      const issueCount = (graderResult.criticalIssues?.length || 0) + 
        [...(graderResult.breakdown?.seo || []), ...(graderResult.breakdown?.aeo || []), ...(graderResult.breakdown?.geo || [])]
          .flatMap((cat: any) => cat.components || [])
          .filter((c: any) => c.status === 'critical' || c.status === 'warning').length

      send({ type: 'progress', phase: 'Audit complete!', progress: 100 })
      send({
        type: 'result', success: true, data: {
          url, pageData, scores, graderResult, siteTypeResult,
          robotsTxt, sitemapFound, liteAI, issueCount,
          analyzedAt: new Date().toISOString(),
        }
      })
    } catch (error: any) {
      console.error('[V4 API] Error:', error)
      send({ type: 'error', success: false, error: error.message || 'Analysis failed' })
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
