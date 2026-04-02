/**
 * Server-side scan history stored in Supabase.
 * Keeps the last 10 full results per user.
 * Used by API routes after scan completion.
 */

import { supabaseAdmin } from '@/lib/supabase/admin'

const MAX_HISTORY = 10

export type ScanType = 'free-v3' | 'free-v4' | 'pro' | 'deep' | 'competitive' | 'keyword-arena'

export interface ScanHistoryRow {
  id: string
  user_id: string
  scan_type: ScanType
  url: string
  scores: { seo: number; aeo: number; geo: number } | null
  full_result: any
  created_at: string
}

/**
 * Save a scan result to Supabase history.
 * Enforces the 10-scan limit by deleting the oldest entry if needed.
 */
export async function saveScanToDb(
  userId: string,
  scanType: ScanType,
  url: string,
  scores: { seo: number; aeo: number; geo: number } | null,
  fullResult: any
): Promise<void> {
  try {
    // Insert the new scan
    await supabaseAdmin.from('scan_history').insert({
      user_id: userId,
      scan_type: scanType,
      url,
      scores,
      full_result: fullResult,
    })

    // Enforce limit: get all entries for this user ordered by newest first
    const { data: rows } = await supabaseAdmin
      .from('scan_history')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (rows && rows.length > MAX_HISTORY) {
      const idsToDelete = rows.slice(MAX_HISTORY).map(r => r.id)
      await supabaseAdmin
        .from('scan_history')
        .delete()
        .in('id', idsToDelete)
    }
  } catch (err: any) {
    console.error('[ScanHistoryDB] Save failed:', err.message)
  }
}
