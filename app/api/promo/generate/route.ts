import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Check admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { count, credits, maxUses, expiresInDays } = await req.json()

    const numCodes = Math.min(count || 1, 100)
    const creditAmount = credits || 100
    const codes: string[] = []

    for (let i = 0; i < numCodes; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
        : null

      const { error } = await supabaseAdmin.from('promo_codes').insert({
        code,
        credits: creditAmount,
        credits_pro_audits: 0,
        credits_deep_scans: 0,
        credits_competitive_intel: 0,
        max_uses: maxUses || 1,
        expires_at: expiresAt,
        created_by: user.id,
      })

      if (error) {
        console.error('[Promo Generate] Insert error:', error.message)
      } else {
        codes.push(code)
      }
    }

    return NextResponse.json({ success: true, codes, generated: codes.length, requested: numCodes })
  } catch (err: any) {
    console.error('[Promo Generate]', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
