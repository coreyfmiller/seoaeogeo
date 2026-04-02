import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/auth-helpers'
import { getLatestScanJob, ScanType } from '@/lib/scan-jobs'

/**
 * GET /api/scan-status?type=pro|deep|competitive
 * Returns the latest scan job for the authenticated user.
 * Used by the client to check for in-progress or completed scans on page mount.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const scanType = request.nextUrl.searchParams.get('type') as ScanType
  if (!scanType || !['pro', 'deep', 'competitive'].includes(scanType)) {
    return NextResponse.json({ error: 'Invalid scan type' }, { status: 400 })
  }

  const job = await getLatestScanJob(user.id, scanType)

  if (!job) {
    return NextResponse.json({ job: null })
  }

  // Only send the result if the scan is completed
  return NextResponse.json({
    job: {
      id: job.id,
      url: job.url,
      status: job.status,
      progress: job.progress,
      phase: job.phase,
      result: job.status === 'completed' ? job.result : null,
      started_at: job.started_at,
      completed_at: job.completed_at,
    }
  })
}

/**
 * DELETE /api/scan-status
 * Clears all scan jobs for the authenticated user.
 */
export async function DELETE() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')
  await supabaseAdmin
    .from('scan_jobs')
    .delete()
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
