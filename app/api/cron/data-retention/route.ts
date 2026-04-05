/**
 * Data Retention Sweep — runs daily via Vercel Cron.
 * Deletes scan data older than 1 year from:
 *   - scan_history (full scan results)
 *   - scan_jobs (job tracking records)
 *   - backlink_cache (already has its own TTL, but sweep stale entries)
 *
 * Schedule: daily at 3:00 AM UTC
 * Configure in vercel.json: { "crons": [{ "path": "/api/cron/data-retention", "schedule": "0 3 * * *" }] }
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const ONE_YEAR_AGO = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return d.toISOString()
}

// 11 months = "expiring soon" threshold (30 days before deletion)
const ELEVEN_MONTHS_AGO = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  d.setMonth(d.getMonth() + 1) // 1 year minus 1 month = 11 months
  return d.toISOString()
}

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = ONE_YEAR_AGO()
  const results: Record<string, number> = {}

  try {
    // 1. Delete old scan_history entries
    const { data: historyDeleted, error: historyErr } = await supabaseAdmin
      .from('scan_history')
      .delete()
      .lt('created_at', cutoff)
      .select('id')

    results.scan_history = historyDeleted?.length ?? 0
    if (historyErr) console.error('[Retention] scan_history error:', historyErr.message)

    // 2. Delete old scan_jobs entries
    const { data: jobsDeleted, error: jobsErr } = await supabaseAdmin
      .from('scan_jobs')
      .delete()
      .lt('started_at', cutoff)
      .select('id')

    results.scan_jobs = jobsDeleted?.length ?? 0
    if (jobsErr) console.error('[Retention] scan_jobs error:', jobsErr.message)

    // 3. Delete old backlink_cache entries
    const { data: cacheDeleted, error: cacheErr } = await supabaseAdmin
      .from('backlink_cache')
      .delete()
      .lt('cached_at', cutoff)
      .select('id')

    results.backlink_cache = cacheDeleted?.length ?? 0
    if (cacheErr) console.error('[Retention] backlink_cache error:', cacheErr.message)

    console.log(`[Retention] Sweep complete:`, results)

    return NextResponse.json({
      success: true,
      cutoff,
      deleted: results,
    })
  } catch (err: any) {
    console.error('[Retention] Sweep failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
