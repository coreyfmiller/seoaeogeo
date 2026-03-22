"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { ScoreCard } from "@/components/dashboard/score-card"
import { SearchInput } from "@/components/dashboard/search-input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScanErrorDialog } from "@/components/dashboard/scan-error-dialog"
import { useSSEAnalysis } from "@/hooks/use-sse-analysis"
import {
  Search,
  Activity,
  Zap,
  ArrowRight,
  CheckCircle2,
  Info,
  RefreshCw,
  Sparkles,
  Layers,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

function StatTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-popover border border-border rounded-lg text-xs text-muted-foreground shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 leading-relaxed ring-1 ring-border/50">
        {text}
      </div>
    </div>
  )
}

export default function FreeDashboard() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const sse = useSSEAnalysis<any>('/api/analyze-site')
  const router = useRouter()

  const result = sse.data
  const isAnalyzing = sse.isAnalyzing
  const error = sse.error

  // Elapsed time counter
  useEffect(() => {
    if (!isAnalyzing) { setElapsedSeconds(0); return }
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  // Restore from session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = sessionStorage.getItem("free_dashboard_url")
      const savedData = sessionStorage.getItem("free_dashboard_data")
      if (savedUrl && savedData) {
        setCurrentUrl(savedUrl)
        sse.setData(JSON.parse(savedData))
      }
    }
  }, [])

  // Save to session
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUrl) sessionStorage.setItem("free_dashboard_url", currentUrl)
      if (result) sessionStorage.setItem("free_dashboard_data", JSON.stringify(result))
    }
  }, [currentUrl, result])

  const handleAnalyze = async (url: string) => {
    setCurrentUrl(url)
    await sse.startAnalysis(url, { maxPages: 5 })
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          currentUrl={currentUrl}
          apiStatus="idle"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="h-6 w-6 text-seo" />
                  Free Audit
                </h1>
                {currentUrl && result ? (
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Search className="h-4 w-4" />
                      {currentUrl}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    Free 5-page site scan with domain-level insights
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {result && !isAnalyzing && (
                  <Button
                    onClick={() => {
                      sse.reset()
                      setCurrentUrl("")
                      if (typeof window !== "undefined") {
                        sessionStorage.removeItem("free_dashboard_url")
                        sessionStorage.removeItem("free_dashboard_data")
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New Scan
                  </Button>
                )}
                <Badge variant="secondary" className="bg-muted text-foreground border-border">
                  FREE TIER
                </Badge>
              </div>
            </div>

            {/* Error Dialog */}
            <ScanErrorDialog error={error} onClose={() => sse.reset()} onRetry={() => handleAnalyze(currentUrl)} />

            {/* Hero — no results, not analyzing */}
            {!result && !isAnalyzing && !error && (
              <Card className="border-seo/20 bg-gradient-to-br from-seo/5 to-aeo/5">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto h-16 w-16 bg-seo/10 rounded-2xl flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-seo" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Analyze Your Website</h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    Get instant SEO, AEO, and GEO scores across 5 pages with domain-level insights
                  </p>
                  <SearchInput
                    onSubmit={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    variant="large"
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
            )}

            {/* SSE Progress — same style as Pro/Deep */}
            {isAnalyzing && (
              <div className="space-y-8 animate-in fade-in zoom-in-95">
                <Card className="border-2 border-seo/20 bg-gradient-to-br from-seo/5 via-aeo/5 to-geo/5 overflow-hidden relative">
                  {/* Animated gradient bar */}
                  <div className="h-1 w-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-seo via-aeo to-geo transition-all duration-700 ease-out"
                      style={{ width: `${sse.progress}%` }}
                    />
                  </div>

                  <CardContent className="pt-10 pb-10">
                    <div className="flex flex-col items-center gap-6">
                      {/* Spinner with percentage */}
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 rounded-full border-4 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                          <span className="text-xl font-black text-foreground tabular-nums">{sse.progress}%</span>
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Free Audit in Progress</h2>
                        <p className="text-sm text-muted-foreground max-w-md min-h-[20px] transition-opacity duration-500">
                          {sse.phase || 'Initializing...'}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full max-w-md">
                        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-seo via-aeo to-geo rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${sse.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[10px] text-muted-foreground tabular-nums">{sse.progress}% complete</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {elapsedSeconds}s elapsed
                          </span>
                        </div>
                      </div>

                      {/* URL badge */}
                      {currentUrl && (
                        <Badge variant="outline" className="border-seo/30 text-seo bg-seo/5 px-4 py-1.5 text-sm font-bold">
                          {currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Phase indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: <Search className="h-5 w-5" />, label: "Crawling Pages", desc: "Discovering and extracting content from up to 5 pages", threshold: 10 },
                    { icon: <Sparkles className="h-5 w-5" />, label: "AI Analysis", desc: "Analyzing domain intelligence and content quality", threshold: 45 },
                    { icon: <Layers className="h-5 w-5" />, label: "Scoring & Report", desc: "Calculating SEO, AEO, and GEO scores", threshold: 85 },
                  ].map((phase, i) => {
                    const isActive = sse.progress >= phase.threshold
                    const isDone = i < 2 && sse.progress >= [45, 85, 100][i]
                    return (
                      <Card key={i} className={cn(
                        "border-border/30 transition-all duration-500",
                        isActive ? "bg-card/80" : "bg-card/30 opacity-50"
                      )}>
                        <CardContent className="pt-5 pb-5">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500",
                              i === 0 ? "bg-seo/10 text-seo" : i === 1 ? "bg-aeo/10 text-aeo" : "bg-[#fe3f8c]/10 text-[#fe3f8c]",
                              isActive && !isDone && "animate-pulse"
                            )}>
                              {isDone ? <CheckCircle2 className="h-5 w-5" /> : phase.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-foreground">{phase.label}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{phase.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
              <>
                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScoreCard
                    title="SEO Score"
                    score={result.ai?.scores?.seo ?? 0}
                    variant="seo"
                    description="Technical optimization"
                  />
                  <ScoreCard
                    title="AEO Score"
                    score={result.ai?.scores?.aeo ?? 0}
                    variant="aeo"
                    description="AI engine readiness"
                  />
                  <ScoreCard
                    title="GEO Score"
                    score={result.ai?.scores?.geo ?? 0}
                    variant="geo"
                    description="Generative engine optimization"
                  />
                </div>

                {/* Technical Metrics */}
                {(() => {
                  const ai = result.ai
                  const pages = result.pages || []
                  const pagesScanned = result.pagesCrawled || pages.length || 0
                  const domainHealth = ai?.domainHealthScore ?? 0
                  const brandConsistency = ai?.consistencyScore ?? 0
                  const schemaCoverage = ai?.authorityMetrics?.schemaCoverage ?? 0
                  const schemaScore = ai?.schemaHealthAudit?.overallScore ?? 0
                  const metadataHealth = ai?.authorityMetrics?.metadataOptimization ?? 0
                  const h1Coverage = pages.length > 0 ? Math.round((pages.filter((p: any) => p.hasH1).length / pages.length) * 100) : 0
                  const httpsCoverage = pages.length > 0 ? Math.round((pages.filter((p: any) => p.isHttps).length / pages.length) * 100) : 0
                  const avgResponse = Math.round(result.avgResponseTime ?? 0)

                  const statCards = [
                    { label: "Pages Scanned", value: `${pagesScanned}`, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30", tip: "Number of pages crawled and analyzed." },
                    { label: "Domain Health", value: `${domainHealth}%`, color: "text-geo", border: "border-geo/30", bg: "bg-geo/5", tip: "Aggregate domain authority score." },
                    { label: "Brand Consistency", value: `${brandConsistency}%`, color: "text-aeo", border: "border-aeo/30", bg: "bg-aeo/5", tip: "Brand cohesion across all crawled pages." },
                    { label: "Schema Coverage", value: `${schemaCoverage}%`, color: "text-seo", border: "border-seo/30", bg: "bg-seo/5", tip: "Percentage of pages with structured data present." },
                    { label: "Schema Quality", value: `${schemaScore}%`, color: schemaScore >= 70 ? "text-geo" : schemaScore >= 40 ? "text-yellow-600" : "text-destructive", border: schemaScore >= 70 ? "border-geo/30" : schemaScore >= 40 ? "border-yellow-500/30" : "border-destructive/30", bg: schemaScore >= 70 ? "bg-geo/5" : schemaScore >= 40 ? "bg-yellow-500/5" : "bg-destructive/5", tip: "Quality and completeness of structured data implementation." },
                    { label: "Metadata Health", value: `${metadataHealth}%`, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30", tip: "Description and Title tag completeness." },
                    { label: "H1 Coverage", value: `${h1Coverage}%`, color: h1Coverage >= 90 ? "text-geo" : "text-destructive", border: h1Coverage >= 90 ? "border-geo/20" : "border-destructive/20", bg: h1Coverage >= 90 ? "bg-geo/5" : "bg-destructive/5", tip: "Percentage of pages with a valid H1 tag." },
                    { label: "HTTPS", value: `${httpsCoverage}%`, color: httpsCoverage === 100 ? "text-geo" : "text-destructive", border: httpsCoverage === 100 ? "border-geo/20" : "border-destructive/20", bg: httpsCoverage === 100 ? "bg-geo/5" : "bg-destructive/5", tip: "Security coverage across domain." },
                    { label: "Avg Response", value: `${avgResponse}ms`, color: "text-geo", border: "border-geo/30", bg: "bg-geo/5", tip: "Avg response time across all pages." },
                  ]

                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-2">
                      {statCards.map(stat => (
                        <Card key={stat.label} className={cn("col-span-1 flex flex-col", stat.border, stat.bg)}>
                          <CardHeader className="pb-2 pt-3 px-3 flex-1 flex flex-col justify-between">
                            <CardDescription className="text-[9px] font-bold uppercase tracking-tighter leading-tight flex items-center gap-1 h-7 mb-1">
                              <span className="line-clamp-2">{stat.label}</span>
                              <StatTooltip text={stat.tip} />
                            </CardDescription>
                            <CardTitle className={cn("text-xl font-black leading-none", stat.color)}>{stat.value}</CardTitle>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )
                })()}

                {/* Upgrade CTA */}
                <Card className="border-geo/30 bg-gradient-to-br from-geo/10 to-aeo/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-geo/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="p-6 relative">
                    <div className="text-center mb-4">
                      <p className="text-lg font-semibold text-foreground">
                        Ready to fix these issues and boost your scores?
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-geo/20 text-geo text-xs font-bold mb-3">
                          <Zap className="h-3 w-3" />
                          UPGRADE TO PRO
                        </div>
                        <h3 className="text-2xl font-bold mb-1">Get Step-by-Step Fix Instructions</h3>
                        <p className="text-lg text-geo font-bold mb-2">Plans starting at $20</p>
                        <p className="text-muted-foreground mb-4">Stop guessing. Get exact implementation guides for every issue.</p>
                        <ul className="space-y-2 mb-6">
                          {[
                            "Detailed explanations of why each fix matters",
                            "Auto-generated schema markup for your site type",
                            "Platform-specific guides (WordPress, Shopify, custom)",
                            "ROI estimates and priority scoring",
                            "Deep crawl up to 50 pages for comprehensive site analysis",
                          ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                              <span><strong>{item.split(' ').slice(0, 2).join(' ')}</strong> {item.split(' ').slice(2).join(' ')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="shrink-0 text-center">
                        <Button
                          size="lg"
                          onClick={() => router.push('/pro')}
                          className="bg-geo hover:bg-geo/90 text-geo-foreground shadow-lg hover:shadow-xl transition-all"
                        >
                          View Pro Audit
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">See detailed fixes for this URL</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
