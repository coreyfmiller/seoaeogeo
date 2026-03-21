import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Prevent admin accounts from being deleted
    const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
    if (profile?.is_admin) {
      return NextResponse.json({ error: 'Admin accounts cannot be deleted' }, { status: 403 })
    }

    // Delete profile data (cascades to usage, referrals via FK)
    await supabaseAdmin.from('referrals').delete().or(`referrer_id.eq.${user.id},referred_id.eq.${user.id}`)
    await supabaseAdmin.from('usage').delete().eq('user_id', user.id)
    await supabaseAdmin.from('profiles').delete().eq('id', user.id)

    // Delete the auth user via admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[Delete Account] Admin delete failed:', deleteError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    console.log(`[Delete Account] User ${user.id} (${user.email}) deleted`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Delete Account] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
