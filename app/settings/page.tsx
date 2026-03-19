'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, User, Lock, Trash2, CreditCard, BarChart3, CheckCircle2, AlertTriangle, Crown, Gift, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const PLAN_CREDITS: Record<string, { proAudits: number; deepScans: number; competitiveIntel: number }> = {
  pro:         { proAudits: 20,  deepScans: 10,  competitiveIntel: 10 },
  pro_plus:    { proAudits: 60,  deepScans: 60,  competitiveIntel: 25 },
  agency:      { proAudits: 150, deepScans: 150, competitiveIntel: 50 },
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Password states
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Delete states
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Referral states
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralCopied, setReferralCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: prof } = await supabase.from('profiles').select('id, email, full_name, plan, is_admin, credits_pro_audits, credits_deep_scans, credits_competitive_intel, referral_code').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setFullName(prof.full_name || '')
        setReferralCode(prof.referral_code || null)
      }

      const period = new Date().toISOString().slice(0, 7)
      if (prof?.is_admin) {
        // Admin uses monthly usage tracking (500/month cap)
        const { data: usg } = await supabase.from('usage').select('*').eq('user_id', user.id).eq('period', period).single()
        setUsage(usg || { pro_audits: 0, deep_scans: 0, competitive_intel: 0 })
      } else {
        // Regular users show remaining credits
        setUsage({
          pro_audits: prof?.credits_pro_audits || 0,
          deep_scans: prof?.credits_deep_scans || 0,
          competitive_intel: prof?.credits_competitive_intel || 0,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveName = async () => {
    if (!user) return
    setSaving(true)
    setSaveSuccess(false)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPasswordError(error.message); setChangingPassword(false); return }
    setPasswordSuccess(true)
    setNewPassword('')
    setConfirmPassword('')
    setChangingPassword(false)
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE' || !user) return
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete account. Please contact support.')
        setDeleting(false)
        return
      }
      // Account deleted server-side, now sign out locally
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      alert('Failed to delete account. Please contact support.')
      setDeleting(false)
    }
  }

  const planLabel = profile?.is_admin ? 'Admin'
    : profile?.plan === 'pro_plus' ? 'Pro Plus'
    : profile?.plan === 'agency' ? 'Agency'
    : profile?.plan === 'pro' ? 'Pro'
    : 'Free'

  const isAdmin = profile?.is_admin
  const credits = isAdmin
    ? null // admin uses usage/limit display instead
    : (usage || { pro_audits: 0, deep_scans: 0, competitive_intel: 0 })

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8 space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-seo/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-seo" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account and plan</p>
              </div>
            </div>

            {/* Plan & Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-geo" />
                  Plan & Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-geo/5 border border-geo/20">
                  <div>
                    <p className="font-bold text-lg">{planLabel} Plan</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  {!profile?.is_admin && profile?.plan === 'free' && (
                    <Link
                      href="/pro"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-geo hover:bg-geo/90 text-white font-medium text-sm transition-colors"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Pro Audits', value: usage?.pro_audits || 0, color: 'text-seo' },
                    { label: 'Deep Scans', value: usage?.deep_scans || 0, color: 'text-aeo' },
                    { label: 'Competitive Intel', value: usage?.competitive_intel || 0, color: 'text-geo' },
                  ].map(item => {
                    if (isAdmin) {
                      const pct = Math.min((item.value / 500) * 100, 100)
                      return (
                        <div key={item.label} className="p-3 rounded-lg border border-border/50">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                          <p className={cn("text-xl font-black", item.color)}>{item.value} <span className="text-sm font-normal text-muted-foreground">/ 500</span></p>
                          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", pct > 80 ? 'bg-destructive' : 'bg-geo')} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div key={item.label} className="p-3 rounded-lg border border-border/50">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                        <p className={cn("text-xl font-black", item.color)}>
                          {item.value} <span className="text-sm font-normal text-muted-foreground">remaining</span>
                        </p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin
                    ? `Admin safety cap: 500/month per type. Resets monthly. Current period: ${new Date().toISOString().slice(0, 7)}`
                    : <>Credits never expire. <a href="/pro" className="text-seo hover:underline">Buy more credits</a></>
                  }
                </p>
              </CardContent>
            </Card>

            {/* Referral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="h-5 w-5 text-geo" />
                  Refer &amp; Earn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share your referral link. When someone signs up and makes their first purchase, you get a free Pro credit pack — 20 Pro Audits, 10 Deep Scans, and 10 Competitive Intel scans. No limits on how many times you can earn.
                </p>
                {referralCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground truncate font-mono">
                      https://sitepulse.ai/signup?ref={referralCode}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://sitepulse.ai/signup?ref=${referralCode}`)
                        setReferralCopied(true)
                        setTimeout(() => setReferralCopied(false), 2000)
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-geo hover:bg-geo/90 text-white text-sm font-medium transition-colors"
                    >
                      {referralCopied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy Link</>}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Referral code not available yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-aeo" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="settings-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <div className="flex gap-3">
                    <input
                      id="settings-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-seo hover:bg-seo/90 text-white font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {saveSuccess && (
                    <p className="text-xs text-geo flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Name updated</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                  <p className="text-sm text-muted-foreground px-3 py-2 rounded-lg bg-muted/30 border border-border/30">{user?.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-purple-600" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-geo/10 border border-geo/20 text-sm text-geo flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Password updated successfully
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-600/90 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delete Account</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This will permanently delete your account, scan history, and all associated data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="delete-confirm" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Type DELETE to confirm
                    </label>
                    <input
                      id="delete-confirm"
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="w-full rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive/50 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || deleting}
                    className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                  </button>
                </div>
              </CardContent>
            </Card>

            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  )
}
