'use client'

import Link from 'next/link'
import { Search, Layers, Globe, Zap, ArrowRight, Clock, Activity, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DemoShell } from '@/components/demo/demo-shell'
import { cn } from '@/lib/utils'

// ─── Hardcoded Demo Data ───────────────────────────────────────────────────────

const DEMO_CREDITS = 120

const quickActions = [
  { label: "Pro Audit", desc: "AI-powered fix instructions", icon: Zap, href: "/demo/pro-audit", color: "text-seo", bg: "bg-seo/10" },
  { label: "Deep Scan", desc: "Multi-page site analysis", icon: Layers, href: "/demo/deep-scan", color: "text-[#BC13FE]", bg: "bg-[#BC13FE]/10" },
  { label: "Competitor Duel", desc: "Compare against competitors", icon: Globe, href: "/demo/battle-mode", color: "text-[#fe3f8c]", bg: "bg-[#fe3f8c]/10" },
  { label: "AI Visibility", desc: "Battle top-ranking sites", icon: Trophy, href: "/demo/ai-test", color: "text-[#00e5ff]", bg: "bg-[#00e5ff]/10" },
]

const stats = { proAudits: 4, deepCrawls: 2, compIntel: 1 }

const recentScans = [
  {
    type: 'pro',
    url: 'www.sunrise-bakery.com',
    scores: { seo: 52, aeo: 38, geo: 27 },
    timeAgo: '2 hours ago',
    href: '/demo/pro-audit',
  },
  {
    type: 'deep',
    url: 'www.sunrise-bakery.com',
    scores: { seo: 48, aeo: 35, geo: 31 },
    timeAgo: '1 day ago',
    href: '/demo/deep-scan',
  },
  {
    type: 'competitive',
    url: 'sunrise-bakery.com vs portland-artisan-bread.com',
    scores: null,
    timeAgo: '3 days ago',
    href: '/demo/battle-mode',
  },
  {
    type: 'keyword-arena',
    url: '"best bakery portland"',
    scores: null,
    timeAgo: '5 days ago',
    href: '/demo/ai-test',
  },
]

function getTypeLabel(type: string) {
  switch (type) {
    case 'pro': return { label: 'Pro Audit', color: 'bg-seo/10 text-seo border-seo/20' }
    case 'deep': return { label: 'Deep Scan', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' }
    case 'competitive': return { label: 'Competitor Duel', color: 'bg-aeo/10 text-aeo border-aeo/20' }
    case 'keyword-arena': return { label: 'AI Visibility', color: 'bg-[#fe3f8c]/10 text-[#fe3f8c] border-[#fe3f8c]/20' }
    default: return { label: 'Scan', color: 'bg-muted text-muted-foreground' }
  }
}

export default function DemoDashboardPage() {
  return (
    <DemoShell>
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-6">

          {/* ═══ DEMO BANNER ═══ */}
          <div className="rounded-lg border-2 border-[#BC13FE]/40 bg-[#BC13FE]/5 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#BC13FE] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5">Interactive Demo</Badge>
              <p className="text-sm text-muted-foreground">Explore the dashboard with sample data &mdash; <span className="font-bold text-foreground">{DEMO_CREDITS} credits</span> remaining</p>
            </div>
            <Link href="/signup" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-xs transition-colors">
              Get Real Results <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-seo" />
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Your audit overview and quick actions</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Pro Audits", value: stats.proAudits, icon: Zap, color: "text-seo" },
              { label: "Deep Scans", value: stats.deepCrawls, icon: Layers, color: "text-[#BC13FE]" },
              { label: "Duels", value: stats.compIntel, icon: Globe, color: "text-[#fe3f8c]" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map(a => (
                <Link key={a.label} href={a.href} className="text-left rounded-xl border border-border/50 bg-card hover:border-seo/30 hover:shadow-md transition-all p-4 space-y-3">
                  <div className={`inline-flex p-2 rounded-lg ${a.bg}`}>
                    <a.icon className={`h-5 w-5 ${a.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold flex items-center gap-1">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Scans */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Recent Scans
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Your recent audit history</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentScans.map((scan, i) => {
                  const t = getTypeLabel(scan.type)
                  return (
                    <Link
                      key={i}
                      href={scan.href}
                      className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2 w-full text-left transition-colors hover:bg-muted/30"
                    >
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${t.color}`}>{t.label}</span>
                      <span className="text-sm font-medium truncate flex-1">{scan.url}</span>
                      {scan.scores && (
                        <div className="flex items-center gap-2 text-xs shrink-0">
                          <span className="text-seo font-bold">{scan.scores.seo}</span>
                          <span className="text-aeo font-bold">{scan.scores.aeo}</span>
                          <span className="text-geo font-bold">{scan.scores.geo}</span>
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground shrink-0">{scan.timeAgo}</span>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </DemoShell>
  )
}
