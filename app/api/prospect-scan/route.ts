import { NextRequest, NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { getMozBacklinkData } from '@/lib/moz'
import { fetchPageSpeedInsights } from '@/lib/pagespeed'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  // 1. API key auth
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.PROSPECT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let url: string
  try {
    const body = await request.json()
    url = body.url
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  // Normalize URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  try {
    // 3. Crawl the page
    const scanResult = await performScan(url)

    if (scanResult.botProtection?.detected) {
      return NextResponse.json({
        error: 'Bot protection detected',
        type: scanResult.botProtection.type,
      }, { status: 422 })
    }

    // 4. Run grader + Moz + PageSpeed in parallel
    const [graderResult, mozData, pageSpeedMobile, pageSpeedDesktop] = await Promise.allSettled([
      Promise.resolve(calculateScoresFromScanResult(scanResult)),
      getMozBacklinkData(url, 5),
      fetchPageSpeedInsights(url, 'mobile'),
      fetchPageSpeedInsights(url, 'desktop'),
    ])

    // Extract grader scores (SEO + GEO only)
    const scores = graderResult.status === 'fulfilled' ? graderResult.value : null
    const seoScore = scores?.seoScore ?? 0
    const geoScore = scores?.geoScore ?? 0

    // Extract critical issues from grader breakdown
    const criticalIssues: string[] = []
    if (scores?.breakdown) {
      const seoBreakdown = scores.breakdown.seo || []
      const geoBreakdown = scores.breakdown.geo || []
      for (const category of [...seoBreakdown, ...geoBreakdown]) {
        for (const component of category.components || []) {
          if (component.status === 'critical' && component.feedback) {
            criticalIssues.push(component.feedback)
          }
        }
      }
    }

    // Extract Moz data
    const moz = mozData.status === 'fulfilled' ? mozData.value : null
    const topBacklinks = (moz?.backlinks || []).slice(0, 5).map(b => ({
      sourceDomain: b.sourceDomain,
      sourceUrl: b.sourceUrl,
      anchorText: b.anchorText,
      domainAuthority: b.domainAuthority,
      isDofollow: b.isDofollow,
    }))

    // Extract PageSpeed scores
    const psMobile = pageSpeedMobile.status === 'fulfilled' ? pageSpeedMobile.value : null
    const psDesktop = pageSpeedDesktop.status === 'fulfilled' ? pageSpeedDesktop.value : null

    // 5. Return flat response
    return NextResponse.json({
      url: scanResult.url,
      seoScore,
      geoScore,
      domainAuthority: moz?.metrics?.domainAuthority ?? 0,
      pageAuthority: moz?.metrics?.pageAuthority ?? 0,
      totalBacklinks: moz?.metrics?.totalBacklinks ?? 0,
      linkingDomains: moz?.metrics?.linkingDomains ?? 0,
      spamScore: moz?.metrics?.spamScore ?? 0,
      topBacklinks,
      pageSpeedMobile: psMobile?.performanceScore ?? 0,
      pageSpeedDesktop: psDesktop?.performanceScore ?? 0,
      platform: scanResult.platformDetection?.platform || 'Unknown',
      criticalIssues,
      scannedAt: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed'
    console.error('[Prospect Scan] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
