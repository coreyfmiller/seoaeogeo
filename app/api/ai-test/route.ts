import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, getAIVisibilityCount, incrementScanCount } from '@/lib/supabase/auth-helpers'
import { runAITest } from '@/lib/ai-test-engines'
import { generateAITestInsights } from '@/lib/ai-test-insights'

const FREE_AI_VISIBILITY_LIMIT = 10

export async function POST(req: NextRequest) {
  try {
    const { keyword, userUrl, location } = await req.json()
    if (!keyword?.trim()) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    // Auth only — AI Visibility is free (up to 10 lifetime checks)
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Check lifetime usage
    const usageCount = await getAIVisibilityCount(user.id)
    if (usageCount >= FREE_AI_VISIBILITY_LIMIT) {
      return NextResponse.json({
        error: `You've used all ${FREE_AI_VISIBILITY_LIMIT} free AI Visibility checks. Purchase credits to unlock unlimited access.`,
        limitReached: true,
        used: usageCount,
        limit: FREE_AI_VISIBILITY_LIMIT,
      }, { status: 402 })
    }

    // Build the search query: append location if provided
    const searchKeyword = location?.trim()
      ? `${keyword.trim()} in ${location.trim()}`
      : keyword.trim()

    console.log(`[AI Test] Running for keyword: "${searchKeyword}"${location ? ` (location: ${location.trim()})` : ''}`)

    try {
      const results = await runAITest(searchKeyword)

      // Check if all engines failed
      const allFailed = results.every(r => r.error && r.recommendations.length === 0)
      if (allFailed) {
        return NextResponse.json({
          success: false,
          error: 'All AI engines failed to respond. Please try again.',
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

      // Generate AI insights — always, but framing differs based on whether user URL was provided
      let insights = null
      const normalizeUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()

      let googleFound = false
      let googleRank: number | null = null
      let aiEngineNames: string[] = []

      if (userUrl?.trim()) {
        const userDomain = normalizeUrl(userUrl.trim())
        const userDomainBase = userDomain.split('/')[0].split('.')[0]
        const isUserSite = (rec: any) => {
          const recDomain = rec.url ? normalizeUrl(rec.url) : ''
          const recDomainBase = recDomain ? recDomain.split('/')[0].split('.')[0] : ''
          const recName = (rec.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
          return (recDomain && recDomain.includes(userDomain)) ||
            (recDomainBase && userDomainBase && recDomainBase === userDomainBase) ||
            (userDomainBase && recName.includes(userDomainBase))
        }
        const googleResult = results.find(r => r.engine === 'google')
        googleFound = googleResult?.recommendations.some(isUserSite) || false
        googleRank = googleFound ? (googleResult?.recommendations.findIndex(isUserSite) ?? -1) + 1 : null
        const aiResults = results.filter(r => r.engine !== 'google' && !r.error)
        aiEngineNames = aiResults.filter(r => r.recommendations.some(isUserSite)).map(r => r.engine)
      }

      try {
        insights = await generateAITestInsights({
          keyword: keyword.trim(),
          userUrl: userUrl?.trim() || '',
          googleFound,
          googleRank,
          aiEnginesFound: aiEngineNames.length,
          aiEngineNames,
          topCompetitors: consensus.map(c => c.name),
          consensus: consensus.map(c => ({ name: c.name, engines: c.engines })),
        })
      } catch (err) {
        console.error('[AI Test] Insights generation failed:', err)
      }

      // Increment usage counter after successful scan
      await incrementScanCount(user.id, 'ai-visibility')

      return NextResponse.json({
        success: true,
        data: { keyword: keyword.trim(), results, consensus, insights, usageCount: usageCount + 1, usageLimit: FREE_AI_VISIBILITY_LIMIT },
      })
    } catch (innerErr: any) {
      console.error('[AI Test] Inner error:', innerErr)
      return NextResponse.json({
        success: false,
        error: `AI Test failed: ${innerErr.message || 'Unknown error'}. Please try again.`,
      }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[AI Test] Error:', err)
    return NextResponse.json({ error: err.message || 'AI Test failed' }, { status: 500 })
  }
}
