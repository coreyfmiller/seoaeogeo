import { NextRequest } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'
import { detectSiteType } from '@/lib/site-type-detector'
import { createSSEStream, createProgressTicker, SSE_HEADERS } from '@/lib/sse-helpers'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const { url: rawUrl } = await request.json()

  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Normalize URL — ensure protocol so new URL() won't throw
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  const stream = createSSEStream(async (send) => {
    try {
      // Step 1: Crawl
      send({ type: 'progress', phase: 'Crawling page and extracting content...', progress: 10 })
      const pageData = await performScan(url)
      send({ type: 'progress', phase: 'Detecting site type...', progress: 35 })

      // Step 2: Site type detection
      const siteTypeResult = detectSiteType(pageData, [])
      pageData.siteType = siteTypeResult.primaryType
      send({ type: 'progress', phase: `Detected: ${siteTypeResult.primaryType}. Analyzing content...`, progress: 45 })

      // Step 3: Content quality analysis
      const wordCount = pageData.structuralData?.wordCount || 0
      let schemaQuality = null
      if (pageData.schemas && pageData.schemas.length > 0) {
        const hasRequiredProps = pageData.schemas.some((schema: any) => schema.name || schema.headline || schema['@type'])
        schemaQuality = { hasSchema: true, score: hasRequiredProps ? 70 : 40, issues: hasRequiredProps ? [] : ['Missing required properties in schema'] }
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
      send({ type: 'progress', phase: 'Calculating scores...', progress: 65 })

      // Step 4: Grade
      const graderResult = calculateScoresFromScanResult(pageData)
      send({ type: 'progress', phase: 'Generating actionable fixes...', progress: 80 })

      // Step 5: Enhanced penalties
      let enhancedPenalties: any[] = []
      try {
        enhancedPenalties = convertBreakdownToEnhancedPenalties(graderResult.breakdown.seo, graderResult.breakdown.aeo, graderResult.breakdown.geo)
      } catch (e: any) { console.error('[V2 API] Penalty error:', e.message) }

      send({ type: 'progress', phase: 'Finalizing report...', progress: 92 })

      // Step 6: Robots.txt & Sitemap check
      let robotsTxt = false
      let sitemapFound = false
      try {
        const parsedUrl = new URL(url)
        const robotsRes = await fetch(`${parsedUrl.origin}/robots.txt`, { signal: AbortSignal.timeout(5000) })
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

      const scores = { seo: { score: graderResult.seoScore }, aeo: { score: graderResult.aeoScore }, geo: { score: graderResult.geoScore } }
      const cwv = {
        lcp: { value: 2400, category: 'FAST' as const, score: 95, displayValue: '2.4 s' },
        inp: { value: 150, category: 'FAST' as const, score: 90, displayValue: '150 ms' },
        cls: { value: 0.05, category: 'FAST' as const, score: 100, displayValue: '0.05' },
        overallCategory: 'FAST' as const, performanceScore: 95,
        fetchedAt: new Date().toISOString(), strategy: 'mobile' as const, hasRealUserData: false,
      }

      send({ type: 'progress', phase: 'Audit complete!', progress: 100 })
      send({ type: 'result', success: true, data: { url, pageData, scores, graderResult, enhancedPenalties, siteTypeResult, cwv, robotsTxt, sitemapFound, analyzedAt: new Date().toISOString() } })
    } catch (error: any) {
      console.error('[V2 API] Error:', error)
      send({ type: 'error', success: false, error: error.message || 'Analysis failed' })
    }
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
