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
    console.log('[Prospect Scan] Starting Gemini + Moz for:', url)
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

    // 6. Diagnostic logging
    const aiSucceeded = aiResult.status === 'fulfilled'
    const mozSucceeded = mozResult.status === 'fulfilled'
    console.log(`[Prospect Scan] Gemini: ${aiSucceeded ? 'SUCCESS' : 'FAILED'}`)
    if (!aiSucceeded) {
      console.error('[Prospect Scan] Gemini error:', (aiResult as PromiseRejectedResult).reason)
    }
    if (aiSucceeded) {
      const ai = (aiResult as PromiseFulfilledResult<any>).value
      console.log('[Prospect Scan] semanticFlags present:', !!ai?.semanticFlags)
      console.log('[Prospect Scan] schemaQuality present:', !!ai?.schemaQuality)
      console.log('[Prospect Scan] detectedSiteType:', ai?.detectedSiteType)
      if (ai?.semanticFlags) {
        console.log('[Prospect Scan] semanticFlags:', JSON.stringify(ai.semanticFlags))
      }
    }

    // 7. Inject AI results into pageData (same as Pro Audit)
    let aiInjected = false
    if (aiResult.status === 'fulfilled') {
      const ai = aiResult.value
      ;(pageData as any).semanticFlags = ai.semanticFlags
      ;(pageData as any).schemaQuality = ai.schemaQuality
      ;(pageData as any).aiAnalysis = ai
      aiInjected = true

      if (ai.detectedSiteType && ai.detectedSiteType !== 'general') {
        ;(pageData as any).siteType = ai.detectedSiteType
      }
    }

    // 8. Grade with AI-enriched data
    const graderResult = calculateScoresFromScanResult(pageData)
    console.log(`[Prospect Scan] Final scores — SEO: ${graderResult.seoScore}, GEO: ${graderResult.geoScore}, AI injected: ${aiInjected}, siteType: ${(pageData as any).siteType}`)

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

    // 11. Return lean response with debug info
    return NextResponse.json({
      url: pageData.url,
      seoScore: graderResult.seoScore,
      geoScore: graderResult.geoScore,
      domainAuthority: moz?.domainAuthority ?? 0,
      criticalIssues,
      _debug: {
        geminiSucceeded: aiSucceeded,
        geminiError: !aiSucceeded ? String((aiResult as PromiseRejectedResult).reason) : null,
        aiInjected,
        siteType: (pageData as any).siteType,
        mozSucceeded,
        crawledTitle: pageData.title?.slice(0, 80),
        contentLength: pageData.thinnedText?.length ?? 0,
        semanticFlags: aiSucceeded ? (aiResult as PromiseFulfilledResult<any>).value?.semanticFlags : null,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed'
    console.error('[Prospect Scan] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
