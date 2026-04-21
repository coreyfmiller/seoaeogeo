import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_TO_PLAN } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { addCredits } from '@/lib/supabase/auth-helpers'
import type { UserPlan } from '@/lib/supabase/auth-helpers'
import Stripe from 'stripe'

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan as Exclude<UserPlan, 'free'> | undefined

        if (userId && plan) {
          // Idempotency check: skip if this session was already processed
          const { data: existing } = await supabaseAdmin
            .from('processed_payments')
            .select('id')
            .eq('stripe_session_id', session.id)
            .single()

          if (existing) {
            console.log(`[Stripe] Session ${session.id} already processed, skipping`)
            break
          }

          // Record this session as processed BEFORE adding credits
          await supabaseAdmin
            .from('processed_payments')
            .insert({ stripe_session_id: session.id, user_id: userId, plan, amount_cents: session.amount_total || 0 })

          // Update user's plan tier and store Stripe customer ID
          await supabaseAdmin
            .from('profiles')
            .update({
              plan,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId)

          // Add credits for the purchased pack
          await addCredits(userId, plan)

          console.log(`[Stripe] User ${userId} purchased ${plan} credit pack (session ${session.id})`)

          // Referral bonus: check if this user was referred and referral hasn't been credited yet
          const { data: referral } = await supabaseAdmin
            .from('referrals')
            .select('id, referrer_id, status')
            .eq('referred_id', userId)
            .eq('status', 'pending')
            .single()

          if (referral) {
            // Credit the referrer with Launch-equivalent credits
            await addCredits(referral.referrer_id, 'launch')

            // Mark referral as credited
            await supabaseAdmin
              .from('referrals')
              .update({ status: 'credited', credited_at: new Date().toISOString() })
              .eq('id', referral.id)

            console.log(`[Stripe] Referral bonus credited to ${referral.referrer_id} for referring ${userId}`)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Look up user by stripe_customer_id
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          console.log(`[Stripe] Payment succeeded for user ${profile.id} (${profile.plan})`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade to free
        await supabaseAdmin
          .from('profiles')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)

        console.log(`[Stripe] Subscription cancelled for customer ${customerId}, downgraded to free`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Check if plan changed (upgrade/downgrade)
        const priceId = subscription.items.data[0]?.price.id
        const newPlan = priceId ? PRICE_TO_PLAN[priceId] : null

        if (newPlan) {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: newPlan })
            .eq('stripe_customer_id', customerId)

          console.log(`[Stripe] Subscription updated for customer ${customerId} to ${newPlan}`)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
