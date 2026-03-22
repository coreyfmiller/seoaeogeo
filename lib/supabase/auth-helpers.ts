import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type UserPlan = 'free' | 'pro' | 'pro_plus' | 'agency'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  plan: UserPlan
  is_admin: boolean
  credits: number
}

// Credits granted per purchase (unified pool)
export const PLAN_CREDITS: Record<Exclude<UserPlan, 'free'>, number> = {
  pro:      200,   // $20
  pro_plus: 600,   // $50
  agency:   1500,  // $100
}

// Max crawl pages (same for all paid plans)
export const MAX_CRAWL_PAGES = 50

// Get current authenticated user + profile (server-side)
export async function getAuthUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    plan: profile.plan as UserPlan,
    is_admin: profile.is_admin ?? false,
    credits: profile.credits ?? 0,
  }
}

// Use credits from unified pool. Returns whether allowed and remaining balance.
export async function useCredits(
  userId: string,
  amount: number,
  isAdmin: boolean = false
): Promise<{ allowed: boolean; remaining: number }> {
  if (isAdmin) {
    return { allowed: true, remaining: 999 }
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0 }

  const current = profile.credits || 0
  if (current < amount) return { allowed: false, remaining: current }

  await supabaseAdmin
    .from('profiles')
    .update({ credits: current - amount })
    .eq('id', userId)

  return { allowed: true, remaining: current - amount }
}

// Add credits to a user (called from Stripe webhook after purchase)
export async function addCredits(
  userId: string,
  plan: Exclude<UserPlan, 'free'>
) {
  const amount = PLAN_CREDITS[plan]

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (!profile) return

  await supabaseAdmin
    .from('profiles')
    .update({ credits: (profile.credits || 0) + amount })
    .eq('id', userId)
}

// Refund credits back to a user (called when a scan fails after deduction)
export async function refundCredits(userId: string, amount: number): Promise<void> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (!profile) return

  await supabaseAdmin
    .from('profiles')
    .update({ credits: (profile.credits || 0) + amount })
    .eq('id', userId)
}

// Get user's remaining credits
export async function getCredits(userId: string): Promise<number> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  return profile?.credits || 0
}
