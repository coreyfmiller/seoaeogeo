import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-helpers'
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide'
import { buildSingleSiteBacklinkContext } from '@/lib/backlink-fetcher'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { domain, pages, siteType, platform, currentScores, backlinkData, url } = body

    if (!domain || !pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: domain, pages' }, { status: 400 })
    }

    const backlinkContext = backlinkData ? buildSingleSiteBacklinkContext(backlinkData, url || `https://${domain}`) : undefined

    const result = await analyzeSitewideIntelligence({
      domain,
      pages,
      siteType,
      platform,
      currentScores,
      backlinkContext,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('[Sitewide Intelligence API] Error:', err)
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 })
  }
}
