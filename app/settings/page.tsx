'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageShell } from '@/components/dashboard/page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, User, Lock, Trash2, CreditCard, CheckCircle2, AlertTriangle, Crown, Gift, Copy, Check, Ticket, Loader2, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const CREDIT_TIERS = [100, 200, 500] as const

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Credits
  const [creditsAvailable, setCreditsAvailable] = useState(0)
  const [creditsUsed, setCreditsUsed] = useState(0)

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

  // Promo code states (user)
  const [promoCode, setPromoCode] = useState('')
  const [promoRedeeming, setPromoRedeeming] = useState(false)
  const [promoResult, setPromoResult] = useState<{ success?: boolean; error?: string; credits?: number } | null>(null)

  // Promo code states (admin)
  const [promoGenerating, setPromoGenerating] = useState<number | null>(null)
  const [generatedCodes, setGeneratedCodes] = useState<{ code: string; credits: number; copied: boolean; timesUsed: number; maxUses: number; expiresAt: string | null; createdAt: string }[]>([])
  const [codesLoading, setCodesLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: prof } = await supabase.from('profiles').select('id, email, full_name, plan, is_admin, credits, credits_used, referral_code').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setFullName(prof.full_name || '')
        setReferralCode(prof.referral_code || null)
        setCreditsAvailable(prof.credits || 0)
        setCreditsUsed(prof.credits_used || 0)
      }

      // Load existing promo codes for admin
      if (prof?.is_admin) {
        try {
          const res = await fetch('/api/promo/list')
          const data = await res.json()
          if (data.codes) {
            setGeneratedCodes(data.codes.map((c: any) => ({
              code: c.code,
              credits: c.credits || ((c.credits_pro_audits || 0) + (c.credits_deep_scans || 0) + (c.credits_competitive_intel || 0)),
              copied: false,
              timesUsed: c.times_used || 0,
              maxUses: c.max_uses || 1,
              expiresAt: c.expires_at,
              createdAt: c.created_at,
            })))
          }
        } catch {}
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
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      alert('Failed to delete account. Please contact support.')
      setDeleting(false)
    }
  }

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) return
    setPromoRedeeming(true)
    setPromoResult(null)
    try {
      const res = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setPromoResult({ success: true, credits: data.credits })
        setPromoCode('')
        // Refresh credits display
        if (user) {
          const { data: prof } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
          if (prof) setCreditsAvailable(prof.credits || 0)
        }
        window.dispatchEvent(new Event('credits-changed'))
      } else {
        setPromoResult({ error: data.error || 'Failed to redeem code' })
      }
    } catch {
      setPromoResult({ error: 'Network error. Try again.' })
    }
    setPromoRedeeming(false)
  }

  const handleGenerateCodes = async (creditAmount: number) => {
    setPromoGenerating(creditAmount)
    try {
      const res = await fetch('/api/promo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: 1,
          credits: creditAmount,
          maxUses: 1,
          expiresInDays: 90,
        }),
      })
      const data = await res.json()
      if (data.codes) {
        const newCodes = data.codes.map((c: string) => ({
          code: c,
          credits: creditAmount,
          copied: false,
          timesUsed: 0,
          maxUses: 1,
          expiresAt: null,
          createdAt: new Date().toISOString(),
        }))
        setGeneratedCodes(prev => [...newCodes, ...prev])
      }
    } catch {
      alert('Failed to generate codes')
    }
    setPromoGenerating(null)
  }

  const planLabel = profile?.is_admin ? 'Admin'
    : profile?.plan === 'pro_plus' ? 'Pro Plus'
    : profile?.plan === 'agency' ? 'Agency'
    : profile?.plan === 'pro' ? 'Pro'
    : 'Free'

  const isAdmin = profile?.is_admin

  if (loading) {
    return (
      <PageShell hideSearch apiStatus="idle">
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell hideSearch apiStatus="idle">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">

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

            {/* Plan & Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-geo" />
                  Plan & Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-geo/5 border border-geo/20">
                  <div>
                    <p className="font-bold text-lg">{planLabel} Plan</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  {!isAdmin && (
                    <Link
                      href="/pro"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#118fff] hover:bg-[#118fff]/90 text-white font-medium text-sm transition-colors"
                    >
                      <Crown className="h-4 w-4" />
                      Buy Credits
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Credits Available</p>
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-[#842ce0]" />
                      <p className="text-2xl font-black text-[#842ce0]">
                        {creditsAvailable}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Credits Used</p>
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-seo" />
                      <p className="text-2xl font-black text-seo">
                        {creditsUsed}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Credits never expire. <a href="/pro" className="text-seo hover:underline">Buy more credits</a>
                </p>
              </CardContent>
            </Card>

            {/* Referral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="h-5 w-5 text-[#fe3f8c]" />
                  Refer &amp; Earn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share your referral link. When someone signs up and makes their first purchase, you both get 20 bonus credits. No limits on how many times you can earn.
                </p>
                {referralCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground truncate font-mono">
                      https://duelly.ai/signup?ref={referralCode}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://duelly.ai/signup?ref=${referralCode}`)
                        setReferralCopied(true)
                        setTimeout(() => setReferralCopied(false), 2000)
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#fe3f8c] hover:bg-[#fe3f8c]/90 text-white text-sm font-medium transition-colors"
                    >
                      {referralCopied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy Link</>}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Referral code not available yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Redeem Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ticket className="h-5 w-5 text-seo" />
                  Redeem Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Have a promo code? Enter it below to add credits to your account.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX"
                    className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors"
                  />
                  <button
                    onClick={handleRedeemPromo}
                    disabled={promoRedeeming || !promoCode.trim()}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-seo hover:bg-seo/90 text-white font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {promoRedeeming ? <><Loader2 className="h-4 w-4 animate-spin" /> Redeeming...</> : 'Redeem'}
                  </button>
                </div>
                {promoResult?.success && (
                  <div className="p-3 rounded-lg bg-geo/10 border border-geo/20 text-sm text-geo flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {promoResult.credits} credits added to your account
                  </div>
                )}
                {promoResult?.error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {promoResult.error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin: Generate Promo Codes */}
            {isAdmin && (
              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Generate Promo Codes
                    <span className="text-xs font-normal text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Admin</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Generate single-use credit codes. Each code expires in 90 days.</p>
                  <div className="space-y-2">
                    {CREDIT_TIERS.map((tier) => (
                      <div key={tier} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#842ce0]/10 border border-[#842ce0]/20">
                            <Coins className="h-3.5 w-3.5 text-[#842ce0]" />
                            <span className="text-sm font-bold text-[#842ce0]">{tier}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">credits</span>
                        </div>
                        <button
                          onClick={() => handleGenerateCodes(tier)}
                          disabled={promoGenerating !== null}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
                        >
                          {promoGenerating === tier ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : 'Generate Code'}
                        </button>
                      </div>
                    ))}
                  </div>
                  {generatedCodes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-geo">{generatedCodes.length} codes total</p>
                      <div className="max-h-72 overflow-y-auto space-y-1.5 rounded-lg border border-border/50 bg-muted/20 p-2">
                        {generatedCodes.map((item, i) => {
                          const fullyUsed = item.timesUsed >= item.maxUses
                          return (
                            <div key={i} className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm font-mono", item.copied ? "bg-muted/30 text-muted-foreground line-through" : fullyUsed ? "bg-muted/30 text-muted-foreground" : "bg-background border border-border/40")}>
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="truncate">{item.code}</span>
                                <span className="text-[10px] font-sans font-medium text-[#842ce0] bg-[#842ce0]/10 px-1.5 py-0.5 rounded shrink-0">{item.credits}cr</span>
                                {fullyUsed && <span className="text-[10px] font-sans font-medium text-destructive/70 bg-destructive/10 px-1.5 py-0.5 rounded shrink-0">used</span>}
                                {item.timesUsed > 0 && !fullyUsed && <span className="text-[10px] font-sans text-muted-foreground shrink-0">{item.timesUsed}/{item.maxUses}</span>}
                              </div>
                              <button
                                onClick={() => {
                                  if (item.copied) return
                                  navigator.clipboard.writeText(item.code)
                                  fetch('/api/promo/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ codes: [item.code] }) })
                                  setGeneratedCodes(prev => prev.map((c, j) => j === i ? { ...c, copied: true } : c))
                                }}
                                disabled={item.copied}
                                className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs font-sans font-medium transition-colors shrink-0", item.copied ? "text-muted-foreground cursor-not-allowed" : "bg-geo/10 text-geo hover:bg-geo/20")}
                              >
                                {item.copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                  <Lock className="h-5 w-5 text-[#842ce0]" />
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
                  className="px-4 py-2 rounded-lg bg-[#842ce0] hover:bg-[#842ce0]/90 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </CardContent>
            </Card>

            {/* Danger Zone - hidden for admin accounts */}
            {!isAdmin && <Card className="border-destructive/20">
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
            </Card>}

            <div className="h-8" />
          </div>
        </main>
    </PageShell>
  )
}
