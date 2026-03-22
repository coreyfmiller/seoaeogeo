import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type UserPlan = 'free' | 'pro' | 'pro_plus' | 'agency'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  plan: UserPlan
  is_admin: boolean
  credits_pro_audits: number
  credits_deep_scans: number
  credits_competitive_intel: number
}

// Credits granted per purchase
export const PLAN_CREDITS: Record<Exclude<UserPlan, 'free'>, {
  proAudits: number
  deepScans: number
  competitiveIntel: number
}> = {
  pro:         { proAudits: 20,  deepScans: 10,  competitiveIntel: 10 },
  pro_plus:    { proAudits: 60,  deepScans: 60,  competitiveIntel: 25 },
  agency:      { proAudits: 150, deepScans: 150, competitiveIntel: 50 },
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
    credits_pro_audits: profile.credits_pro_audits ?? 0,
    credits_deep_scans: profile.credits_deep_scans ?? 0,
    credits_competitive_intel: profile.credits_competitive_intel ?? 0,
  }
}

// Use a credit (decrement balance). Returns true if successful.
export async function useCredit(
  userId: string,
  type: 'credits_pro_audits' | 'credits_deep_scans' | 'credits_competitive_intel',
  isAdmin: boolean = false
): Promise<{ allowed: boolean; remaining: number }> {
  // Admin safety cap: check total usage across all time
  if (isAdmin) {
    // Admins don't consume credits, but we cap at 500 uses per type
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('admin_usage_' + type.replace('credits_', ''))
      .eq('id', userId)
      .single()
    // For admin, just allow — the 500 cap is a future enhancement
    return { allowed: true, remaining: 999 }
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select(type)
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0 }

  const current = (profile as any)[type] || 0
  if (current <= 0) return { allowed: false, remaining: 0 }

  // Decrement
  await supabaseAdmin
    .from('profiles')
    .update({ [type]: current - 1 })
    .eq('id', userId)

  return { allowed: true, remaining: current - 1 }
}

// Add credits to a user (called from Stripe webhook after purchase)
export async function addCredits(
  userId: string,
  plan: Exclude<UserPlan, 'free'>
) {
  const credits = PLAN_CREDITS[plan]

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits_pro_audits, credits_deep_scans, credits_competitive_intel')
    .eq('id', userId)
    .single()

  if (!profile) return

  await supabaseAdmin
    .from('profiles')
    .update({
      credits_pro_audits: (profile.credits_pro_audits || 0) + credits.proAudits,
      credits_deep_scans: (profile.credits_deep_scans || 0) + credits.deepScans,
      credits_competitive_intel: (profile.credits_competitive_intel || 0) + credits.competitiveIntel,
    })
    .eq('id', userId)
}

// Get user's remaining credits
export async function getCredits(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits_pro_audits, credits_deep_scans, credits_competitive_intel')
    .eq('id', userId)
    .single()

  if (!profile) return { pro_audits: 0, deep_scans: 0, competitive_intel: 0 }

  return {
    pro_audits: profile.credits_pro_audits || 0,
    deep_scans: profile.credits_deep_scans || 0,
    competitive_intel: profile.credits_competitive_intel || 0,
  }
}
