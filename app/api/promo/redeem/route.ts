import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

    const normalizedCode = code.trim().toUpperCase()

    // Find the promo code
    const { data: promo } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single()

    if (!promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 })
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This code has expired' }, { status: 400 })
    }

    // Check max uses
    if (promo.times_used >= promo.max_uses) {
      return NextResponse.json({ error: 'This code has been fully redeemed' }, { status: 400 })
    }

    // Check if user already redeemed this code
    const { data: existing } = await supabaseAdmin
      .from('promo_redemptions')
      .select('id')
      .eq('code_id', promo.id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You already redeemed this code' }, { status: 400 })
    }

    // Get user's current credits
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Add credits — use new `credits` column, fallback to sum of legacy columns
    const promoCredits = promo.credits
      || ((promo.credits_pro_audits || 0) + (promo.credits_deep_scans || 0) + (promo.credits_competitive_intel || 0))

    await supabaseAdmin.from('profiles').update({
      credits: (profile.credits || 0) + promoCredits,
    }).eq('id', user.id)

    // Record redemption
    await supabaseAdmin.from('promo_redemptions').insert({
      code_id: promo.id,
      user_id: user.id,
    })

    // Increment times_used
    await supabaseAdmin.from('promo_codes').update({
      times_used: promo.times_used + 1,
    }).eq('id', promo.id)

    console.log(`[Promo] User ${user.id} redeemed code ${normalizedCode} (+${promoCredits} credits)`)

    return NextResponse.json({
      success: true,
      credits: promoCredits,
    })
  } catch (err: any) {
    console.error('[Promo Redeem]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
