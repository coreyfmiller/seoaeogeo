import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Marks a promo code as copied by admin (hides from admin list, code still works for users)
export async function POST(req: NextRequest) {
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

    const { codes } = await req.json()
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: 'No codes provided' }, { status: 400 })
    }

    await supabaseAdmin
      .from('promo_codes')
      .update({ copied_by_admin: true })
      .in('code', codes)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Promo Mark Copied]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
