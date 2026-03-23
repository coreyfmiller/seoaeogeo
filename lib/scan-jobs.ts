/**
 * Persistent scan job tracking.
 * Stores scan status + results in Supabase so users can navigate away
 * and come back to find their completed scan.
 *
 * Table: scan_jobs (one row per user per scan_type, overwritten each scan)
 * Auto-cleaned after 24 hours via check-on-read.
 */

import { supabaseAdmin } from '@/lib/supabase/admin'

export type ScanType = 'pro' | 'deep' | 'competitive'
export type ScanStatus = 'running' | 'completed' | 'failed'

export interface ScanJob {
  id: string
  user_id: string
  scan_type: ScanType
  url: string
  status: ScanStatus
  progress: number
  phase: string | null
  result: any | null
  credits_charged: number
  started_at: string
  completed_at: string | null
}

/**
 * Create or overwrite a scan job when a scan starts.
 * Uses upsert on (user_id, scan_type) so only the latest scan per type is kept.
 */
export async function createScanJob(
  userId: string,
  scanType: ScanType,
  url: string,
  creditsCharged: number
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('scan_jobs')
    .upsert(
      {
        user_id: userId,
        scan_type: scanType,
        url,
        status: 'running' as ScanStatus,
        progress: 0,
        phase: 'Initializing...',
        result: null,
        credits_charged: creditsCharged,
        started_at: new Date().toISOString(),
        completed_at: null,
      },
      { onConflict: 'user_id,scan_type' }
    )
    .select('id')
    .single()

  if (error) {
    console.error('[ScanJobs] Create failed:', error.message)
    throw error
  }
  return data!.id
}

/**
 * Update progress/phase for a running scan job.
 * Called periodically from the API route during SSE streaming.
 */
export async function updateScanProgress(
  userId: string,
  scanType: ScanType,
  progress: number,
  phase: string
): Promise<void> {
  await supabaseAdmin
    .from('scan_jobs')
    .update({ progress, phase })
    .eq('user_id', userId)
    .eq('scan_type', scanType)
    .eq('status', 'running')
}

/**
 * Mark a scan job as completed and store the full result.
 */
export async function completeScanJob(
  userId: string,
  scanType: ScanType,
  result: any
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('scan_jobs')
    .update({
      status: 'completed' as ScanStatus,
      progress: 100,
      phase: 'Complete',
      result,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('scan_type', scanType)

  if (error) console.error('[ScanJobs] Complete failed:', error.message)
}

/**
 * Mark a scan job as failed (no result stored).
 */
export async function failScanJob(
  userId: string,
  scanType: ScanType
): Promise<void> {
  await supabaseAdmin
    .from('scan_jobs')
    .update({
      status: 'failed' as ScanStatus,
      phase: 'Failed',
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('scan_type', scanType)
}

/**
 * Get the latest scan job for a user + type.
 * Returns null if no job exists or if it's expired (>24h old).
 */
export async function getLatestScanJob(
  userId: string,
  scanType: ScanType
): Promise<ScanJob | null> {
  const { data, error } = await supabaseAdmin
    .from('scan_jobs')
    .select('*')
    .eq('user_id', userId)
    .eq('scan_type', scanType)
    .single()

  if (error || !data) return null

  // 24-hour TTL check
  const startedAt = new Date(data.started_at).getTime()
  const now = Date.now()
  if (now - startedAt > 24 * 60 * 60 * 1000) {
    // Expired — clean it up
    await supabaseAdmin
      .from('scan_jobs')
      .delete()
      .eq('id', data.id)
    return null
  }

  // If it's been "running" for more than 10 minutes, it's dead
  if (data.status === 'running' && now - startedAt > 10 * 60 * 1000) {
    await supabaseAdmin
      .from('scan_jobs')
      .update({ status: 'failed', phase: 'Timed out', completed_at: new Date().toISOString() })
      .eq('id', data.id)
    return { ...data, status: 'failed', phase: 'Timed out' }
  }

  return data as ScanJob
}
