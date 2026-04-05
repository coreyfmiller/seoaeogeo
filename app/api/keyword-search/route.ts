import { NextResponse } from 'next/server'
import { searchGoogle } from '@/lib/google-search'
import { getAuthUser } from '@/lib/supabase/auth-helpers'
import { filterAggregators } from '@/lib/aggregator-domains'

/**
 * Keyword Search API: Returns top Google results for a keyword.
 * No credits charged — this is just the discovery step.
 * Aggregator/directory domains (TripAdvisor, Yelp, etc.) are filtered out
 * so users only see real business competitors.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { keyword, count = 10, location } = await req.json()

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const validCount = count === 5 ? 5 : 10

    // Request extra results from Google to compensate for aggregators we'll filter out
    const fetchCount = Math.min(validCount + 10, 30)
    const rawResults = await searchGoogle(keyword.trim(), fetchCount, location?.trim() || undefined)

    // Filter out aggregator/directory domains and take the requested count
    const filtered = filterAggregators(rawResults).slice(0, validCount)

    // Re-number ranks after filtering
    const results = filtered.map((r, i) => ({ ...r, rank: i + 1 }))

    const removedCount = rawResults.length - filterAggregators(rawResults).length
    if (removedCount > 0) {
      console.log(`[Keyword Search] Filtered ${removedCount} aggregator domains from results for "${keyword.trim()}"`)
    }

    return NextResponse.json({ success: true, results, keyword: keyword.trim() })
  } catch (error: any) {
    console.error('[Keyword Search] Error:', error)
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 })
  }
}
