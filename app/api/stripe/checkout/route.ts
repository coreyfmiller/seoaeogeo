import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_TO_PRICE } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()

    if (!plan || !PLAN_TO_PRICE[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get origin for redirect URLs
    const origin = req.headers.get('origin') || 'http://localhost:3005'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLAN_TO_PRICE[plan],
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      success_url: plan === 'test'
        ? `${origin}/pay-test?checkout=success`
        : `${origin}/settings?checkout=success`,
      cancel_url: plan === 'test'
        ? `${origin}/pay-test?checkout=cancelled`
        : `${origin}/pricing?checkout=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
