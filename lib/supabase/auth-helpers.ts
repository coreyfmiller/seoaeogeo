import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type UserPlan = 'free' | 'launch' | 'growth' | 'authority' | 'test'

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
  launch:    180,   // $79.99
  growth:    550,   // $149.99 (490 base + 60 bonus)
  authority: 1450,  // $299.99 (1300 base + 150 bonus)
  test:      50,    // $5.00 (payment test)
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
// Admin accounts are treated the same as regular users.
export async function useCredits(
  userId: string,
  amount: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits, credits_used')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0 }

  const current = profile.credits || 0
  if (current < amount) return { allowed: false, remaining: current }

  // Deduct credits and track usage
  const { data: updated } = await supabaseAdmin
    .from('profiles')
    .update({
      credits: current - amount,
      credits_used: ((profile as any).credits_used || 0) + amount,
    })
    .eq('id', userId)
    .select('credits')
    .single()

  return { allowed: true, remaining: updated?.credits ?? (current - amount) }
}

// Increment lifetime scan counter on profile after a successful scan
export async function incrementScanCount(
  userId: string,
  type: 'pro' | 'deep' | 'competitive'
): Promise<void> {
  const col = type === 'pro' ? 'total_pro_audits'
    : type === 'deep' ? 'total_deep_scans'
    : 'total_competitive_intel'

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select(col)
    .eq('id', userId)
    .single()

  if (!profile) return

  await supabaseAdmin
    .from('profiles')
    .update({ [col]: ((profile as any)[col] || 0) + 1 })
    .eq('id', userId)
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
    .select('credits, credits_used')
    .eq('id', userId)
    .single()

  if (!profile) return

  await supabaseAdmin
    .from('profiles')
    .update({
      credits: (profile.credits || 0) + amount,
      credits_used: Math.max(0, ((profile as any).credits_used || 0) - amount),
    })
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
