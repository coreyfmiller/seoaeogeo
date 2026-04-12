import { supabaseAdmin } from '@/lib/supabase/admin'

const CHAT_MESSAGE_POOL = 100
const REFILL_CREDIT_COST = 10

/**
 * Check whether a user has chat messages remaining in their pool.
 */
export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; total: number }> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('chat_messages_remaining')
    .eq('id', userId)
    .single()

  const remaining = data?.chat_messages_remaining ?? 0

  return {
    allowed: remaining > 0,
    remaining,
    total: CHAT_MESSAGE_POOL,
  }
}

/**
 * Decrement the user's chat message pool by 1.
 * Returns the new remaining count.
 */
export async function incrementUsage(userId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('chat_messages_remaining')
    .eq('id', userId)
    .single()

  const current = data?.chat_messages_remaining ?? 0
  const newRemaining = Math.max(0, current - 1)

  await supabaseAdmin
    .from('profiles')
    .update({ chat_messages_remaining: newRemaining })
    .eq('id', userId)

  return newRemaining
}

/**
 * Refill chat messages by spending credits.
 * Returns { success, remaining, creditsDeducted } or throws.
 */
export async function refillChatMessages(
  userId: string
): Promise<{ success: boolean; remaining: number; creditsDeducted: number }> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits, chat_messages_remaining')
    .eq('id', userId)
    .single()

  if (!profile || (profile.credits ?? 0) < REFILL_CREDIT_COST) {
    return { success: false, remaining: profile?.chat_messages_remaining ?? 0, creditsDeducted: 0 }
  }

  const newCredits = profile.credits - REFILL_CREDIT_COST
  const newRemaining = (profile.chat_messages_remaining ?? 0) + CHAT_MESSAGE_POOL

  await supabaseAdmin
    .from('profiles')
    .update({ credits: newCredits, chat_messages_remaining: newRemaining })
    .eq('id', userId)

  return { success: true, remaining: newRemaining, creditsDeducted: REFILL_CREDIT_COST }
}
