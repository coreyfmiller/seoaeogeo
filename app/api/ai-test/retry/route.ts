import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-helpers'
import { retrySingleEngine } from '@/lib/ai-test-engines'

/**
 * Retry a single AI engine — no credits charged.
 * Used when one engine fails but others succeed.
 */
export async function POST(req: NextRequest) {
  try {
    const { engine, keyword } = await req.json()
    if (!keyword?.trim() || !engine) {
      return NextResponse.json({ error: 'Keyword and engine are required' }, { status: 400 })
    }

    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    console.log(`[AI Test Retry] Retrying ${engine} for "${keyword.trim()}"`)
    const result = await retrySingleEngine(engine, keyword.trim())

    return NextResponse.json({ success: true, result })
  } catch (err: any) {
    console.error('[AI Test Retry] Error:', err)
    return NextResponse.json({ error: err.message || 'Retry failed' }, { status: 500 })
  }
}
