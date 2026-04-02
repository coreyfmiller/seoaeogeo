import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * GET /api/scan-history
 * Returns the user's scan history (without full_result to keep payload small).
 *
 * GET /api/scan-history?id=<uuid>
 * Returns a single scan with full_result for the "View" feature.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const scanId = request.nextUrl.searchParams.get('id')

  if (scanId) {
    // Fetch single full result
    const { data, error } = await supabaseAdmin
      .from('scan_history')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }
    return NextResponse.json({ scan: data })
  }

  // Fetch list (no full_result — just metadata + scores)
  const { data, error } = await supabaseAdmin
    .from('scan_history')
    .select('id, scan_type, url, scores, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }

  return NextResponse.json({ scans: data || [] })
}

/**
 * DELETE /api/scan-history
 * Clears all scan history for the authenticated user.
 */
export async function DELETE() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  await supabaseAdmin
    .from('scan_history')
    .delete()
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
