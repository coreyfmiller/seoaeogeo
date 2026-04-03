import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-helpers'
import { generateAIExpertAnalysis, type ExpertAnalysisData } from '@/lib/gemini-expert-analysis'

export const maxDuration = 60

/**
 * POST /api/expert-analysis
 * Generates expert analysis on-demand (no credits charged).
 * Used when the initial analysis failed or for cached results that don't have it.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json()
  if (!body || !body.context) {
    return NextResponse.json({ error: 'Missing analysis context' }, { status: 400 })
  }

  try {
    const result = await generateAIExpertAnalysis(body as ExpertAnalysisData)
    return NextResponse.json({ success: true, analysis: result })
  } catch (err: any) {
    console.error('[Expert Analysis API] Error:', err.message)
    return NextResponse.json({ success: false, error: 'Analysis generation failed' }, { status: 500 })
  }
}
