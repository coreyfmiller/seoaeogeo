import { NextRequest, NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { analyzeWithGemini } from '@/lib/gemini'
import { detectSiteType } from '@/lib/site-type-detector'
import { getMozUrlMetrics } from '@/lib/moz'

export const maxDuration = 120

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

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  try {
    // 3. Crawl the page
    const pageData = await performScan(url)

    if (pageData.botProtection?.detected) {
      return NextResponse.json({
        error: 'Bot protection detected',
        type: pageData.botProtection.type,
      }, { status: 422 })
    }

    // 4. Site type detection (affects scoring weights)
    const siteTypeResult = detectSiteType(pageData, [])
    ;(pageData as any).siteType = siteTypeResult.primaryType

    // 5. Run Gemini AI + Moz DA in parallel
    const [aiResult, mozResult] = await Promise.allSettled([
      analyzeWithGemini({
        title: pageData.title,
        description: pageData.description,
        thinnedText: pageData.thinnedText,
        summarizedContent: pageData.summarizedContent,
        schemas: pageData.schemas,
        structuralData: pageData.structuralData,
        platform: pageData.platformDetection?.label,
      }),
      getMozUrlMetrics(url),
    ])

    // 6. Inject AI results into pageData (same as Pro Audit)
    if (aiResult.status === 'fulfilled') {
      const ai = aiResult.value
      ;(pageData as any).semanticFlags = ai.semanticFlags
      ;(pageData as any).schemaQuality = ai.schemaQuality
      ;(pageData as any).aiAnalysis = ai

      if (ai.detectedSiteType && ai.detectedSiteType !== 'general') {
        ;(pageData as any).siteType = ai.detectedSiteType
      }
    }

    // 7. Grade with AI-enriched data
    const graderResult = calculateScoresFromScanResult(pageData)

    // 8. Extract critical issues from grader breakdown (free — already computed)
    const criticalIssues: string[] = []
    if (graderResult.breakdown) {
      for (const category of [...(graderResult.breakdown.seo || []), ...(graderResult.breakdown.geo || [])]) {
        for (const component of category.components || []) {
          if (component.status === 'critical' && component.feedback) {
            criticalIssues.push(component.feedback)
          }
        }
      }
    }

    // 9. Extract Moz DA
    const moz = mozResult.status === 'fulfilled' ? mozResult.value : null

    // 10. Return lean response
    return NextResponse.json({
      url: pageData.url,
      seoScore: graderResult.seoScore,
      geoScore: graderResult.geoScore,
      domainAuthority: moz?.domainAuthority ?? 0,
      criticalIssues,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed'
    console.error('[Prospect Scan] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
