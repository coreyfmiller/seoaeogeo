import { supabaseAdmin } from '@/lib/supabase/admin'

const DAILY_MESSAGE_LIMIT = 50

/**
 * Compute next midnight UTC as an ISO string.
 */
function getNextMidnightUTC(): string {
  const now = new Date()
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ))
  return next.toISOString()
}

/**
 * Check whether a user is within the daily rate limit.
 * Returns the current count, whether the next message is allowed,
 * and when the limit resets (next midnight UTC).
 */
export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; count: number; resetsAt: string }> {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabaseAdmin
    .from('chat_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const count = data?.message_count ?? 0

  return {
    allowed: count < DAILY_MESSAGE_LIMIT,
    count,
    resetsAt: getNextMidnightUTC(),
  }
}

/**
 * Increment the user's daily message count via upsert.
 * Creates a new row for today if none exists, otherwise increments
 * the existing count using ON CONFLICT (user_id, date).
 * Returns the new message count.
 */
export async function incrementUsage(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  // First, try to read the current count
  const { data: existing } = await supabaseAdmin
    .from('chat_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existing) {
    // Row exists — increment
    const newCount = existing.message_count + 1
    await supabaseAdmin
      .from('chat_usage')
      .update({ message_count: newCount })
      .eq('user_id', userId)
      .eq('date', today)

    return newCount
  }

  // No row yet — insert with count = 1
  await supabaseAdmin
    .from('chat_usage')
    .insert({ user_id: userId, date: today, message_count: 1 })

  return 1
}
