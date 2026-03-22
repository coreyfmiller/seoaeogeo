import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { data: codes } = await supabaseAdmin
      .from('promo_codes')
      .select('code, credits, credits_pro_audits, credits_deep_scans, credits_competitive_intel, max_uses, times_used, expires_at, created_at')
      .eq('copied_by_admin', false)
      .order('created_at', { ascending: false })
      .limit(200)

    return NextResponse.json({ codes: codes || [] })
  } catch (err: any) {
    console.error('[Promo List]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
