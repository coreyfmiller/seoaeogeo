import { NextResponse } from 'next/server'
import { searchGoogle } from '@/lib/google-search'
import { getAuthUser } from '@/lib/supabase/auth-helpers'

/**
 * Keyword Search API: Returns top Google results for a keyword.
 * No credits charged — this is just the discovery step.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { keyword, count = 10 } = await req.json()

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const validCount = count === 5 ? 5 : 10
    const results = await searchGoogle(keyword.trim(), validCount)

    return NextResponse.json({ success: true, results, keyword: keyword.trim() })
  } catch (error: any) {
    console.error('[Keyword Search] Error:', error)
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 })
  }
}
