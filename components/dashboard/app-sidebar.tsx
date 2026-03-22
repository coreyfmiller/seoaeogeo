"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Sparkles,
  Globe,
  Bot,
  Layers,
  Home,
  LogOut,
  LogIn,
  Gift,
  Copy,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface NavItem {
  name: string
  icon: React.ElementType
  href: string
  badge?: string
}

const mainNav: NavItem[] = [
  { name: "Free Audit", icon: Sparkles, href: "/v2" },
  { name: "Pro Audit", icon: Bot, href: "/pro-audit", badge: "PRO AI" },
  { name: "Deep Scan", icon: Layers, href: "/deep-scan", badge: "PRO AI" },
  { name: "Competitive Intel", icon: Globe, href: "/competitive-intel", badge: "PRO AI" },
  { name: "Dashboard", icon: Home, href: "/dashboard", badge: "PRO AI" },
]

const proOnlyPaths = ['/pro-audit', '/deep-scan', '/competitive-intel', '/dashboard']

const comingSoonNav: NavItem[] = []

const bottomNav: NavItem[] = [
  { name: "Our Standards", icon: FileText, href: "/standards" },
  { name: "Help & Support", icon: HelpCircle, href: "/help", badge: "" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Usage & Costs", icon: BarChart3, href: "/usage", badge: "ADMIN" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [referralOpen, setReferralOpen] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ full_name: string | null; plan: string; is_admin?: boolean } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('full_name, plan, is_admin, referral_code').eq('id', user.id).single()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
              setReferralCode(data.referral_code || null)
            }
          })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('full_name, plan, is_admin, referral_code').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
              setReferralCode(data.referral_code || null)
            }
          })
      } else {
        setProfile(null)
        setReferralCode(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??'

  const planLabel = profile?.is_admin
    ? 'Admin'
    : profile?.plan
      ? profile.plan === 'pro_plus' ? 'Pro Plus' : profile.plan === 'agency' ? 'Agency' : profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
      : 'Free'

  const isAdmin = profile?.is_admin === true
  const isFreeUser = !isAdmin && (!profile || profile.plan === 'free')

  const referralUrl = referralCode
    ? `https://duelly.ai/signup?ref=${referralCode}`
    : ''

  const handleCopyReferral = async () => {
    if (!referralUrl) return
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-sidebar">
      {/* Logo */}
      <div className="flex items-center justify-center px-6 py-5 border-b border-border/50">
        <a href="/pro-audit">
          <img src="/logo.png" alt="Duelly" className="h-[66px] w-auto" />
        </a>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </p>
          <ul className="space-y-1">
            {mainNav.map((item) => {
              const isProOnly = proOnlyPaths.includes(item.href)
              const isLocked = isProOnly && isFreeUser
              const href = isLocked ? '/pro' : item.href

              return (
              <li key={item.name}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    pathname === item.href
                      ? "bg-seo/10 text-seo font-medium"
                      : isLocked
                        ? "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isLocked && "opacity-50")} />
                  <span className={cn("flex-1", isLocked && "opacity-50")}>{item.name}</span>
                  {item.badge === "PRO" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.badge === "PRO AI" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-[#118fff]/10 to-[#842ce0]/10 text-[#118fff] border border-[#118fff]/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      PRO AI
                    </span>
                  )}
                  {item.badge === "FREE" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      FREE
                    </span>
                  )}
                  {item.badge === "ADMIN" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-[#842ce0]/10 text-[#842ce0] border border-[#842ce0]/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.badge === "BETA" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.badge === "BETA AI" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500/10 to-[#842ce0]/10 text-[#842ce0] border border-[#842ce0]/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      BETA AI
                    </span>
                  )}
                </Link>
              </li>
              )
            })}
          </ul>
        </div>

      </nav>
      <div className="px-3 py-4 border-t border-border/50 space-y-3">
        {/* Referral Link — only show when logged in */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setReferralOpen(!referralOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full",
                referralOpen
                  ? "bg-[#fe3f8c]/10 text-[#fe3f8c] font-medium"
                  : "text-[#fe3f8c] hover:bg-[#fe3f8c]/5"
              )}
            >
              <Gift className="h-4 w-4" />
              <span className="flex-1 text-left">Refer &amp; Earn Credits</span>
            </button>

            {/* Referral Popup */}
            {referralOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-4 rounded-xl border border-[#fe3f8c]/30 bg-card shadow-xl z-50 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Earn 200 Credits</p>
                  <button onClick={() => setReferralOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Share your link. When someone signs up and makes their first purchase, you get 200 credits added to your account. No limits on how many times you can earn.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground truncate font-mono">
                    {referralCode ? referralUrl : 'Run the DB migration to enable referrals'}
                  </div>
                  <button
                    onClick={handleCopyReferral}
                    disabled={!referralCode}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#fe3f8c] hover:bg-[#fe3f8c]/90 text-white text-xs font-medium transition-colors disabled:opacity-50"
                    title="Copy referral link"
                  >
                    {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy Link</>}
                  </button>
                </div>
                {copied && <p className="text-[10px] text-[#fe3f8c] font-medium">Copied to clipboard</p>}
              </div>
            )}
          </div>
        )}

        <ul className="space-y-1">
          {bottomNav
            .filter(item => item.badge !== 'ADMIN' || isAdmin)
            .map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === item.href
                    ? "bg-seo/10 text-seo font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.name}</span>
                {item.badge === "ADMIN" && (
                  <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-[#842ce0]/10 text-[#842ce0] border border-[#842ce0]/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    {item.badge}
                  </span>
                )}
                {item.badge === "SOON" && (
                  <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

      </div>

      {/* User */}
      <div className="px-3 py-4 border-t border-border/50">
        {user ? (
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-seo to-aeo flex items-center justify-center text-white text-sm font-medium">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{planLabel} Plan</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
