import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, useCredits, refundCredits } from '@/lib/supabase/auth-helpers'
import { runAITest } from '@/lib/ai-test-engines'

const CREDIT_COST = 5

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json()
    if (!keyword?.trim()) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    // Auth + credits
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const creditResult = await useCredits(user.id, CREDIT_COST)
    if (!creditResult.allowed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    let creditsDeducted = true
    console.log(`[AI Test] Running for keyword: "${keyword.trim()}"`)

    try {
      const results = await runAITest(keyword.trim())

      // Check if all engines failed
      const allFailed = results.every(r => r.error && r.recommendations.length === 0)
      if (allFailed) {
        await refundCredits(user.id, CREDIT_COST)
        creditsDeducted = false
        if (typeof globalThis.window !== 'undefined') globalThis.window.dispatchEvent(new Event('credits-changed'))
        return NextResponse.json({
          success: false,
          error: 'All AI engines failed to respond. Your 5 credits have been refunded.',
          creditsRefunded: CREDIT_COST,
          results,
        })
      }

      // Build consensus — sites mentioned by 2+ engines
      const mentionCounts = new Map<string, { name: string; url: string; engines: string[]; reasons: string[] }>()
      for (const r of results) {
        if (r.error) continue
        for (const rec of r.recommendations) {
          const key = rec.name.toLowerCase().replace(/[^a-z0-9]/g, '')
          const existing = mentionCounts.get(key)
          if (existing) {
            existing.engines.push(r.engine)
            existing.reasons.push(rec.reason)
          } else {
            mentionCounts.set(key, { name: rec.name, url: rec.url || '', engines: [r.engine], reasons: [rec.reason] })
          }
        }
      }
      const consensus = Array.from(mentionCounts.values())
        .filter(c => c.engines.length >= 2)
        .sort((a, b) => b.engines.length - a.engines.length)

      return NextResponse.json({
        success: true,
        data: { keyword: keyword.trim(), results, consensus, creditCost: CREDIT_COST },
      })
    } catch (innerErr: any) {
      // AI test itself threw — refund credits
      if (creditsDeducted) {
        await refundCredits(user.id, CREDIT_COST)
      }
      console.error('[AI Test] Inner error:', innerErr)
      return NextResponse.json({
        success: false,
        error: `AI Test failed: ${innerErr.message || 'Unknown error'}. Your 5 credits have been refunded.`,
        creditsRefunded: CREDIT_COST,
      }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[AI Test] Error:', err)
    return NextResponse.json({ error: err.message || 'AI Test failed' }, { status: 500 })
  }
}
