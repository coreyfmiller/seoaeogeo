'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Layers, Globe, Zap, ArrowRight, Clock, BarChart3, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { getScanHistory, ScanHistoryEntry, setLoadFromHistory, getRouteForType, exportScanHistory, importScanHistory } from '@/lib/scan-history'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'

const quickActions = [
  { label: "Pro Audit", desc: "AI-powered fix instructions", icon: Zap, href: "/v3", color: "text-geo", bg: "bg-geo/10", tip: "Run a full AI-powered audit with Gemini analysis, context-aware scoring, and detailed fix instructions for every issue found." },
  { label: "Deep Crawl", desc: "Multi-page site analysis", icon: Layers, href: "/deep-v3", color: "text-purple-600", bg: "bg-purple-500/10", tip: "Crawl up to 20 pages of your site to find sitewide issues like duplicate titles, missing schemas, orphan pages, and content gaps." },
  { label: "Competitive Intel", desc: "Compare against competitors", icon: Globe, href: "/intelligence", color: "text-aeo", bg: "bg-aeo/10", tip: "Benchmark your site against a competitor across SEO, AEO, and GEO. Get AI-generated counter-strategies to outperform them." },
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

  const handleExport = () => {
    const json = exportScanHistory()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vantege-scans-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const { imported } = importScanHistory(reader.result as string)
          // Refresh the page data
          const scans = getScanHistory()
          setRecentScans(scans.slice(0, 10))
          setStats({
            totalScans: scans.length,
            proAudits: scans.filter(s => s.type === 'pro').length,
            deepCrawls: scans.filter(s => s.type === 'deep').length,
            compIntel: scans.filter(s => s.type === 'competitive').length,
          })
          alert(`Imported ${imported} scan(s)`)
        } catch {
          alert('Invalid file format')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

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
        <main className="flex-1 overflow-y-auto px-6 pt-6">
          <div className="max-w-7xl mx-auto space-y-6 pb-6">

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
                { label: "Total Scans", value: stats.totalScans, icon: BarChart3, color: "text-seo", tip: "Total number of audits you've run across all scan types. Each scan counts individually, even repeat scans of the same URL." },
                { label: "Pro Audits", value: stats.proAudits, icon: Zap, color: "text-geo", tip: "Number of AI-powered Pro Audits completed. Pro Audits use Gemini AI for deep content analysis, context-aware scoring, and step-by-step fix instructions." },
                { label: "Deep Crawls", value: stats.deepCrawls, icon: Layers, color: "text-purple-600", tip: "Number of multi-page Deep Scans completed. Deep Scans crawl up to 20 pages per site, analyzing schema coverage, content gaps, and sitewide health." },
                { label: "Competitive Intel", value: stats.compIntel, icon: Globe, color: "text-aeo", tip: "Number of competitive intelligence battles run. Each battle compares your site against a competitor across SEO, AEO, and GEO metrics with AI-generated counter-strategies." },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted/50`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">{s.label} <InfoTooltip content={s.tip} className="[&_svg]:h-3 [&_svg]:w-3" /></p>
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
                      <p className="text-sm font-bold flex items-center gap-1">{a.label} <InfoTooltip content={a.tip} className="[&_svg]:h-3 [&_svg]:w-3" /></p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
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
                      <InfoTooltip content="Your scan history stored locally in your browser's localStorage. Click any row to reload that scan result. Export to back up your data, or import to restore from another device." />
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Stored locally in your browser</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleExport} className="text-xs text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleImport} className="text-xs text-muted-foreground hover:text-foreground">
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Import
                    </Button>
                  </div>
                </div>
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
                          <button
                            key={i}
                            onClick={() => {
                              if (scan.hasFullResult) {
                                setLoadFromHistory(scan)
                                router.push(getRouteForType(scan.type))
                              }
                            }}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2 w-full text-left transition-colors",
                              scan.hasFullResult ? "hover:bg-muted/30 cursor-pointer" : "opacity-60 cursor-default"
                            )}
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
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(scan.timestamp).toLocaleDateString()}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
