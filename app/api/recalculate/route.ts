import { NextRequest } from 'next/server'
import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '@/lib/grader-v2'

/**
 * Recalculate scores with a different site type.
 * No AI calls — just re-runs the deterministic grader with the new type.
 */
export async function POST(request: NextRequest) {
  try {
    const { scanData, siteType, platformOverride } = await request.json()

    if (!scanData) {
      return new Response(JSON.stringify({ error: 'scanData is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Override the site type and recalculate
    const recalcData = { ...scanData, siteType }
    const graderResult = calculateScoresFromScanResult(recalcData)

    let enhancedPenalties: any[] = []
    try {
      enhancedPenalties = convertBreakdownToEnhancedPenalties(
        graderResult.breakdown.seo,
        graderResult.breakdown.aeo,
        graderResult.breakdown.geo,
        platformOverride || scanData?.platformDetection?.platform
      )
    } catch (e: any) {
      console.error('[Recalculate] Penalty error:', e.message)
    }

    return new Response(JSON.stringify({
      scores: {
        seo: { score: graderResult.seoScore },
        aeo: { score: graderResult.aeoScore },
        geo: { score: graderResult.geoScore },
      },
      graderResult,
      enhancedPenalties,
      siteType,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[Recalculate] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Recalculation failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
