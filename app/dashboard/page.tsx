'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Layers, Globe, Zap, ArrowRight, Clock, BarChart3, Activity, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { getScanHistory, ScanHistoryEntry } from '@/lib/scan-history'

const quickActions = [
  { label: "Free Audit", desc: "Quick SEO/AEO/GEO scores", icon: Search, href: "/v2", color: "text-seo", bg: "bg-seo/10" },
  { label: "Pro Audit", desc: "AI-powered fix instructions", icon: Zap, href: "/v3", color: "text-geo", bg: "bg-geo/10" },
  { label: "Deep Crawl", desc: "Multi-page site analysis", icon: Layers, href: "/deep-v3", color: "text-purple-600", bg: "bg-purple-500/10" },
  { label: "Competitive Intel", desc: "Compare against competitors", icon: Globe, href: "/intelligence", color: "text-aeo", bg: "bg-aeo/10" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [recentScans, setRecentScans] = useState<ScanHistoryEntry[]>([])
  const [stats, setStats] = useState({ totalScans: 0, proAudits: 0, deepCrawls: 0, compIntel: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const scans = getScanHistory()
    setRecentScans(scans.slice(0, 10))
    setStats({
      totalScans: scans.length,
      proAudits: scans.filter(s => s.type === 'pro').length,
      deepCrawls: scans.filter(s => s.type === 'deep').length,
      compIntel: scans.filter(s => s.type === 'competitive').length,
    })
  }, [])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'free-v3': return { label: 'V3 Free', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' }
      case 'free-v4': return { label: 'V4 Free', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' }
      case 'pro': return { label: 'Pro Audit', color: 'bg-green-500/10 text-green-600 border-green-500/20' }
      case 'deep': return { label: 'Deep Scan', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' }
      case 'competitive': return { label: 'Competitive', color: 'bg-aeo/10 text-aeo border-aeo/20' }
      default: return { label: 'Scan', color: 'bg-muted text-muted-foreground' }
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header apiStatus="idle" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-seo" />
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Your audit overview and quick actions</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Scans", value: stats.totalScans, icon: BarChart3, color: "text-seo" },
                { label: "Pro Audits", value: stats.proAudits, icon: Zap, color: "text-geo" },
                { label: "Deep Crawls", value: stats.deepCrawls, icon: Layers, color: "text-purple-600" },
                { label: "Competitive Intel", value: stats.compIntel, icon: Globe, color: "text-aeo" },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted/50`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
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
                  <button key={a.label} onClick={() => router.push(a.href)} className="text-left rounded-xl border border-border/50 bg-card hover:border-seo/30 hover:shadow-md transition-all p-4 space-y-3">
                    <div className={`inline-flex p-2 rounded-lg ${a.bg}`}>
                      <a.icon className={`h-5 w-5 ${a.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Scans + Upgrade CTA side by side */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Recent Scans */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Recent Scans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentScans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">No scans yet</p>
                      <p className="text-xs mt-1">Run your first audit to see results here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentScans.map((scan, i) => {
                        const t = getTypeLabel(scan.type)
                        return (
                          <div key={i} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2 hover:bg-muted/30 transition-colors">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${t.color}`}>{t.label}</span>
                            <span className="text-sm font-medium truncate flex-1">{scan.url}</span>
                            {scan.scores && (
                              <div className="flex items-center gap-2 text-xs shrink-0">
                                <span className="text-seo font-bold">{scan.scores.seo}</span>
                                <span className="text-aeo font-bold">{scan.scores.aeo}</span>
                                <span className="text-geo font-bold">{scan.scores.geo}</span>
                              </div>
                            )}
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(scan.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgrade CTA */}
              <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-geo/10 text-geo text-[10px] font-bold mb-3">
                      <Crown className="h-3 w-3" />
                      PRO
                    </div>
                    <h3 className="text-lg font-bold mb-1">Unlock Full Power</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Get AI fix instructions, deep crawls, competitive intelligence, and copy-paste code for every issue.
                    </p>
                    <ul className="space-y-1.5 text-xs mb-4">
                      <li className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-geo" />AI-powered fix instructions</li>
                      <li className="flex items-center gap-1.5"><Layers className="h-3 w-3 text-geo" />Deep crawl up to 50 pages</li>
                      <li className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-geo" />Competitive intelligence</li>
                    </ul>
                  </div>
                  <button onClick={() => router.push('/pro')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-geo hover:bg-geo/90 text-white text-sm font-medium transition-colors">
                    View Plans
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
