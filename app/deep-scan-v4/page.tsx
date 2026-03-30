'use client'

import { useState, useEffect } from 'react'
import { Layers, Sparkles, Zap, ShieldCheck, AlertTriangle, FileText, Search, CheckCircle2, Clock, Copy, Filter } from 'lucide-react'
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan } from '@/lib/scan-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageShell } from '@/components/dashboard/page-shell'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { LinkBuildingIntelligence } from '@/components/dashboard/link-building-intelligence'
import { CrawlConfig } from '@/components/dashboard/crawl-config'
import { PageComparisonTable } from '@/components/dashboard/page-comparison-table'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { Badge } from '@/components/ui/badge'
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { useSSEAnalysis } from '@/hooks/use-sse-analysis'
import { CreditConfirmDialog } from '@/components/dashboard/credit-confirm-dialog'
import { cn } from '@/lib/utils'

interface DeepScanResult {
  url: string
  analyzedAt: string
  siteTypeResult: {
    primaryType: string
    secondaryTypes: string[]
    confidence: number
  }
  platformDetection?: {
    platform: string
    confidence: string
    label: string
    signals: string[]
  }
  pagesCrawled: number
  scores: {
    seo: number
    aeo: number
    geo: number
  }
  pages: Array<any>
  priorityMatrix: any
  contentGaps: any
  schemaCoverage: any
  crawlStats: {
    totalFound: number
    analyzed: number
    failed: number
  }
  // New sitewide data
  sitewideIntelligence: any
  robotsTxt: boolean
  sitemapFound: boolean
  aggregateMetrics: {
    totalWords: number
    totalSchemas: number
    avgResponseTime: number
    totalImages: number
    totalImagesWithAlt: number
  }
  duplicateTitles: Array<{ title: string; urls: string[] }>
  duplicateDescriptions: Array<{ description: string; urls: string[] }>
  siteWideIssues: any
  orphanPages: any
  duplicateGroups: any
  cwv?: {
    performanceScore: number
    lcp: { value: number; category: string; displayValue: string; score: number } | null
    inp: { value: number; category: string; displayValue: string; score: number } | null
    cls: { value: number; category: string; displayValue: string; score: number } | null
  }
  backlinkData?: {
    metrics: {
      domain: string
      domainAuthority: number
      pageAuthority: number
      linkingDomains: number
      totalBacklinks: number
      spamScore: number
    }
    backlinks: Array<{
      sourceDomain: string
      sourceUrl: string
      anchorText: string
      domainAuthority: number
      isDofollow: boolean
    }>
  } | null
}

export default function DeepV3Page() {
  const [currentUrl, setCurrentUrl] = useState('')
  const sse = useSSEAnalysis<DeepScanResult>('/api/analyze-deep-v3')
  const [crawlConfig, setCrawlConfig] = useState({
    maxPages: 5,
    respectRobotsTxt: true
  })
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [pendingUrl, setPendingUrl] = useState('')
  const [pendingMaxPages, setPendingMaxPages] = useState(5)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL')

  const handleAnalyze = async (submittedUrl: string, maxPages?: number) => {
    setPendingUrl(submittedUrl)
    if (maxPages) setPendingMaxPages(maxPages)
    setCreditDialogOpen(true)
  }

  const handleConfirmAnalyze = async (pageCount?: number) => {
    setCreditDialogOpen(false)
    const pages = pageCount || pendingMaxPages
    setCrawlConfig(prev => ({ ...prev, maxPages: pages }))
    setCurrentUrl(pendingUrl)
    await sse.startAnalysis(pendingUrl, { maxPages: pages })
  }

  const result = sse.data
  const isAnalyzing = sse.isAnalyzing
  const error = sse.error

  // Elapsed time counter while analyzing
  useEffect(() => {
    if (!isAnalyzing) { setElapsedSeconds(0); return }
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  const handleSiteTypeChange = async (newType: string) => {
    if (!result) return

    // Recalculate every page's scores with the new site type (no AI calls, just re-grading)
    try {
      const recalculated = await Promise.all(
        result.pages.map(async (page: any) => {
          if (!page.scanData) return page // fallback if no scanData stashed
          const res = await fetch('/api/recalculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scanData: page.scanData, siteType: newType }),
          })
          if (!res.ok) return page
          const data = await res.json()
          return {
            ...page,
            scores: data.scores,
            graderResult: data.graderResult,
            enhancedPenalties: data.enhancedPenalties,
          }
        })
      )

      // Recompute averages from recalculated per-page scores
      const avgScores = {
        seo: Math.round(recalculated.reduce((s: number, p: any) => s + p.scores.seo.score, 0) / recalculated.length),
        aeo: Math.round(recalculated.reduce((s: number, p: any) => s + p.scores.aeo.score, 0) / recalculated.length),
        geo: Math.round(recalculated.reduce((s: number, p: any) => s + p.scores.geo.score, 0) / recalculated.length),
      }

      sse.setData({
        ...result,
        pages: recalculated,
        scores: avgScores,
        siteTypeResult: { ...result.siteTypeResult, primaryType: newType },
      })
    } catch (err) {
      console.error('[Deep Scan] Recalculation failed:', err)
    }
  }

  // Recalculate penalties when user overrides the detected platform
  const handlePlatformChange = async (newPlatform: string) => {
    if (!result?.pages) return
    try {
      const recalculated = await Promise.all(
        result.pages.map(async (page: any) => {
          const res = await fetch('/api/recalculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scanData: {
                ...page.scanResult,
                siteType: result.siteTypeResult?.primaryType,
              },
              siteType: result.siteTypeResult?.primaryType,
              platformOverride: newPlatform,
            }),
          })
          if (!res.ok) return page
          const data = await res.json()
          return { ...page, enhancedPenalties: data.enhancedPenalties }
        })
      )
      sse.setData({
        ...result,
        pages: recalculated,
        platformDetection: {
          platform: newPlatform,
          confidence: result.platformDetection?.confidence || 'high',
          label: newPlatform.charAt(0).toUpperCase() + newPlatform.slice(1),
          signals: result.platformDetection?.signals || [],
        },
      })
    } catch (err) {
      console.error('[Deep Scan] Platform recalculation failed:', err)
    }
  }

  useEffect(() => {
    if (result && currentUrl) {
      saveScanToHistory({
        url: currentUrl,
        type: 'deep',
        scores: { seo: result.scores.seo, aeo: result.scores.aeo, geo: result.scores.geo },
        timestamp: new Date().toISOString(),
      }, result)
    }
  }, [result, currentUrl])

  useEffect(() => {
    const entry = consumeLoadFromHistory()
    if (entry && entry.type === 'deep') {
      const full = getFullScanResult(entry)
      if (full) {
        setCurrentUrl(entry.url)
        sse.setData(full)
        return
      }
    }
    // Check for a pending/completed scan job server-side (navigation-away recovery)
    sse.checkPendingScan().then(({ found, url: jobUrl }) => {
      if (found && jobUrl) {
        setCurrentUrl(jobUrl)
        return
      }
      // Fall back to localStorage history
      const latest = getLatestFullScan('deep')
      if (latest) {
        setCurrentUrl(latest.entry.url)
        sse.setData(latest.result)
      }
    })
  }, [])

  return (
    <PageShell
      onAnalyze={handleAnalyze}
      isAnalyzing={isAnalyzing}
      currentUrl={currentUrl}
      apiStatus="idle"
      placeholder="Enter URL for Deep Scan..."
      buttonLabel="Deep Scan"
    >
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 sm:pt-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-6">
      
            {/* Page Header with Actions */}
            <AuditPageHeader
              title="Deep Scan"
              description="AI-powered multi-page analysis with site intelligence and comprehensive site audit."
              currentUrl={currentUrl}
              hasResults={!!result}
              isAnalyzing={isAnalyzing}
              onNewAudit={() => {
                sse.reset()
                setCurrentUrl("")
              }}
              onRefreshAnalysis={() => handleAnalyze(currentUrl)}
              analysisData={result}
              pageCount={result?.pagesCrawled || 0}
              siteType={result?.siteTypeResult ? {
                primaryType: result.siteTypeResult.primaryType,
                confidence: result.siteTypeResult.confidence
              } : undefined}
              platformDetection={result?.platformDetection}
              onSiteTypeConfirm={handleSiteTypeChange}
              onSiteTypeChange={handleSiteTypeChange}
              onPlatformChange={handlePlatformChange}
              cwv={result?.cwv}
            />

            {/* Hero Section - Only show when no results */}
            {!result && !isAnalyzing && (
              <Card className="border-2 border-[#BC13FE]/20 bg-gradient-to-br from-[#BC13FE]/5 to-transparent">
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#BC13FE]/10 flex items-center justify-center">
                    <Layers className="h-8 w-8 text-[#BC13FE]" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      The Ultimate SEO Audit
                    </CardTitle>
                    <CardDescription className="text-base max-w-2xl mx-auto">
                      Combines AI-powered intelligence with multi-page deep crawling. 
                      Get site intelligence, actionable fixes, and comprehensive site analysis.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="max-w-4xl mx-auto space-y-6">
                  <CrawlConfig
                    onStartCrawl={(config) => handleAnalyze(config.url, config.pageCount)}
                    isAnalyzing={isAnalyzing}
                  />
                </CardContent>
              </Card>
            )}

            {/* What's Included Section */}
            {!result && !isAnalyzing && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#BC13FE]" />
                      AI Content Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gemini AI analyzes every page for tone, expertise, and content quality with site intelligence.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="h-5 w-5 text-[#BC13FE]" />
                      Multi-Page Crawling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Crawl up to 20 pages with schema coverage, content gaps, and internal link analysis.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#BC13FE]" />
                      Priority Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      See which pages need the most work with actionable fixes prioritized by impact.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Crawl Progress */}
            {isAnalyzing && (
              <div className="space-y-8 animate-in fade-in zoom-in-95">
                <Card className="border-2 border-[#BC13FE]/20 bg-gradient-to-br from-seo/5 via-[#BC13FE]/5 to-geo/5 overflow-hidden relative">
                  {/* Animated gradient bar at top */}
                  <div className="h-1 w-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-seo via-[#BC13FE] to-geo transition-all duration-700 ease-out"
                      style={{ width: `${sse.progress}%` }}
                    />
                  </div>

                  <CardContent className="pt-10 pb-10">
                    <div className="flex flex-col items-center gap-6">
                      {/* Spinner with percentage */}
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 rounded-full border-4 border-t-seo border-r-[#BC13FE] border-b-geo border-l-transparent animate-spin" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                          <span className="text-xl font-black text-foreground tabular-nums">{sse.progress}%</span>
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Deep Scan in Progress</h2>
                        <p className="text-sm text-muted-foreground max-w-md min-h-[20px] transition-opacity duration-500">
                          {sse.phase || 'Initializing...'}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full max-w-md">
                        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-seo via-[#BC13FE] to-geo rounded-full transition-all duration-700 ease-out"
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
                    { icon: <Search className="h-5 w-5" />, label: "Crawling Pages", desc: "Discovering and extracting content from multiple pages", threshold: 10 },
                    { icon: <Sparkles className="h-5 w-5" />, label: "AI Deep Analysis", desc: "Gemini analyzing each page for quality, schema, and structure", threshold: 40 },
                    { icon: <Layers className="h-5 w-5" />, label: "Scoring & Report", desc: "Aggregating scores across all pages with site intelligence", threshold: 70 },
                  ].map((phase, i) => {
                    const isActive = sse.progress >= phase.threshold
                    const isDone = i < 2 && sse.progress >= [40, 70, 100][i]
                    return (
                      <Card key={i} className={cn(
                        "border-border/30 transition-all duration-500",
                        isActive ? "bg-card/80" : "bg-card/30 opacity-50"
                      )}>
                        <CardContent className="pt-5 pb-5">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500",
                              i === 0 ? "bg-seo/10 text-seo" : i === 1 ? "bg-[#BC13FE]/10 text-[#BC13FE]" : "bg-[#fe3f8c]/10 text-[#fe3f8c]",
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

            {/* Credit Confirmation Dialog */}
            <CreditConfirmDialog
              open={creditDialogOpen}
              onConfirm={handleConfirmAnalyze}
              onCancel={() => setCreditDialogOpen(false)}
              creditCost={10 + pendingMaxPages}
              scanType="Deep Scan"
              costBreakdown={`10 base + ${pendingMaxPages} pages × 1 credit = ${10 + pendingMaxPages} credits`}
              showPageSelector
              defaultPageCount={pendingMaxPages}
            />

            <ScanErrorDialog error={error} onClose={() => sse.reset()} onRetry={() => handleAnalyze(currentUrl)} creditsRefunded={sse.creditsRefunded} />

            {/* Results Display */}
            {result && (
              <div className="space-y-6">
                {/* Aggregate Score Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-1">
                      <CircularProgress value={result.scores.seo} variant="seo" label="Avg SEO Score" size={140} strokeWidth={10} />
                      <InfoTooltip content="Average SEO score across all crawled pages, using site-intelligence scoring weights." />
                    </div>
                  </Card>
                  <Card className="flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-1">
                      <CircularProgress value={result.scores.aeo} variant="aeo" label="Avg AEO Score" size={140} strokeWidth={10} />
                      <InfoTooltip content="Average Answer Engine Optimization score — how likely AI assistants will cite your pages." />
                    </div>
                  </Card>
                  <Card className="flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-1">
                      <CircularProgress value={result.scores.geo} variant="geo" label="Avg GEO Score" size={140} strokeWidth={10} />
                      <InfoTooltip content="Average Generative Engine Optimization score — readiness for AI-generated search results." />
                    </div>
                  </Card>
                </div>

                {/* Key Metrics — unified strip */}
                {(() => {
                  const ai = result.sitewideIntelligence
                  const pages = result.pages || []
                  const imgAltPct = result.aggregateMetrics.totalImages > 0
                    ? Math.round((result.aggregateMetrics.totalImagesWithAlt / result.aggregateMetrics.totalImages) * 100)
                    : 100
                  const h1Pct = pages.length > 0 ? Math.round((pages.filter((p: any) => p.hasH1 === true).length / pages.length) * 100) : 0
                  const httpsPct = pages.length > 0 ? Math.round((pages.filter((p: any) => p.isHttps === true).length / pages.length) * 100) : 0
                  const metaPct = pages.length > 0 ? Math.round((pages.filter((p: any) => p.hasDescription === true).length / pages.length) * 100) : 0
                  const pctColor = (v: number) => v >= 75 ? "text-green-500" : v >= 50 ? "text-yellow-500" : "text-red-500"
                  const respColor = (ms: number) => ms <= 300 ? "text-green-500" : ms <= 600 ? "text-yellow-500" : "text-red-500"
                  const metrics = [
                    { label: "Domain Health", value: `${ai?.domainHealthScore ?? '–'}%`, color: pctColor(ai?.domainHealthScore ?? 0), tip: "AI-powered aggregate domain quality score combining content quality, schema implementation, metadata completeness, technical performance, and site architecture across all crawled pages. This is the single most important metric for understanding your site's overall health." },
                    { label: "Brand", value: `${ai?.consistencyScore ?? '–'}%`, color: pctColor(ai?.consistencyScore ?? 0), tip: "Brand consistency across all crawled pages — measures uniform tone, messaging, visual identity signals, and content voice. Inconsistent branding confuses both users and AI engines, reducing citation likelihood and trust." },
                    { label: "Schema", value: `${ai?.authorityMetrics?.schemaCoverage ?? '–'}%`, color: pctColor(ai?.authorityMetrics?.schemaCoverage ?? 0), tip: "Percentage of crawled pages with valid structured data (JSON-LD). Schema markup enables rich snippets in search results and helps AI engines understand your content. Low coverage means missed opportunities for enhanced search visibility." },
                    { label: "Metadata", value: `${metaPct}%`, color: pctColor(metaPct), tip: "Percentage of crawled pages with both a title tag and meta description. These control how your pages appear in search results. Pages without metadata get auto-generated snippets that rarely perform well." },
                    { label: "H1 Tags", value: `${h1Pct}%`, color: pctColor(h1Pct), tip: "Percentage of crawled pages with an H1 heading tag. The H1 is the primary heading that tells search engines what each page is about. Every page should have exactly one — missing H1s confuse crawlers and hurt rankings." },
                    { label: "HTTPS", value: `${httpsPct}%`, color: pctColor(httpsPct), tip: "Percentage of crawled pages served over HTTPS. Google uses HTTPS as a ranking signal and browsers show 'Not Secure' warnings for HTTP pages. Anything less than 100% is a critical security and SEO issue." },
                    { label: "Response", value: `${result.aggregateMetrics.avgResponseTime}ms`, color: respColor(result.aggregateMetrics.avgResponseTime), tip: "Average server response time (TTFB) across all crawled pages. Under 300ms is good, under 600ms is acceptable, over 600ms needs attention. Slow response times compound across a site and hurt Core Web Vitals." },
                    { label: "Robots.txt", value: result.robotsTxt ? "Found" : "Missing", color: result.robotsTxt ? "text-green-500" : "text-red-500", tip: "Whether a robots.txt file exists at the domain root. This file controls how search engine crawlers navigate your site — which pages to index and which to skip. Without it, crawlers may waste budget on unimportant pages." },
                    { label: "Sitemap", value: result.sitemapFound ? "Found" : "Missing", color: result.sitemapFound ? "text-green-500" : "text-red-500", tip: "Whether an XML sitemap was found at the domain root. Sitemaps help search engines discover all your pages efficiently, especially new content or deeply nested pages that might not be found through internal links alone." },
                    { label: "Alt Text", value: `${imgAltPct}%`, color: pctColor(imgAltPct), tip: "Percentage of images across all crawled pages with descriptive alt text. Alt text is critical for accessibility (screen readers rely on it) and image search rankings. Google Images drives significant traffic — missing alt text means lost opportunities." },
                  ]
                  return (
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
                      {metrics.map(m => (
                        <div key={m.label} className="rounded-lg border border-border/50 bg-card/50 px-2.5 py-2">
                          <div className="flex items-center gap-0.5 mb-0.5">
                            <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-tight truncate">{m.label}</p>
                            <InfoTooltip content={m.tip} className="shrink-0 [&_svg]:h-2.5 [&_svg]:w-2.5" />
                          </div>
                          <p className={`text-sm font-black ${m.color} truncate`}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Roadmap to 100 - Prioritized Site Improvements */}
                {result.sitewideIntelligence?.recommendations?.length > 0 && (() => {
                  const recs = result.sitewideIntelligence.recommendations
                  const normPriority = (r: any) => r.priority === 'STEADY' ? 'MEDIUM' : (r.priority || 'MEDIUM')
                  const normDomain = (r: any) => (r.domain || 'SEO').toLowerCase()
                  const criticalCount = recs.filter((r: any) => normPriority(r) === 'CRITICAL').length
                  const highCount = recs.filter((r: any) => normPriority(r) === 'HIGH').length
                  const mediumCount = recs.filter((r: any) => normPriority(r) === 'MEDIUM').length
                  const filtered = priorityFilter === 'ALL' ? recs : recs.filter((r: any) => normPriority(r) === priorityFilter)

                  return (
                    <Card className="border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5">
                      <CardHeader>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Zap className="h-5 w-5 text-[#00e5ff]" />
                          <CardTitle>Roadmap to 100 - Prioritized Site Improvements</CardTitle>
                          <InfoTooltip content="AI-generated strategic roadmap ranked by impact. Each recommendation includes why it matters, estimated point impact, step-by-step fix instructions, and code snippets tailored to your platform." />
                          <button onClick={() => {
                            const sep = '\u2500'.repeat(60)
                            const text = `ROADMAP TO 100 - PRIORITIZED SITE IMPROVEMENTS (${recs.length})\n${'='.repeat(60)}\n\n` + recs.map((r: any, i: number) => {
                              const p = normPriority(r); const domain = r.domain || 'SEO'
                              let t = `${sep}\n${i + 1}. [${p}] [${domain.toUpperCase()}] ${r.title}\n${sep}`
                              if (r.description) t += `\n\nWhy This Matters:\n${r.description}`
                              if (r.platform) t += `\n\nPlatform: ${r.platform}`
                              if (r.steps?.length) { t += '\n\nSteps:'; r.steps.forEach((s: any) => { t += `\n  ${s.step}. ${s.title}: ${s.description}`; if (s.code) t += `\n  Code: ${s.code}` }) }
                              if (r.code || r.codeSnippet) t += `\n\nCode:\n${r.code || r.codeSnippet}`
                              return t
                            }).join('\n\n')
                            navigator.clipboard.writeText(text)
                          }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-[#00e5ff]/50 transition-colors">
                            <Copy className="h-3.5 w-3.5" /> Copy All
                          </button>
                        </div>
                        {/* Priority Filter */}
                        <div className="flex items-center gap-2 mt-3">
                          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                          {[
                            { key: 'ALL' as const, label: 'All', count: recs.length, activeColor: 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40', inactiveColor: 'bg-muted/30 text-muted-foreground border-border/30 hover:border-border/50' },
                            { key: 'CRITICAL' as const, label: 'Critical', count: criticalCount, activeColor: 'bg-destructive/20 text-destructive border-destructive/40', inactiveColor: 'bg-destructive/5 text-destructive/60 border-destructive/20 hover:bg-destructive/10' },
                            { key: 'HIGH' as const, label: 'High', count: highCount, activeColor: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40', inactiveColor: 'bg-[#f59e0b]/5 text-[#f59e0b]/60 border-[#f59e0b]/20 hover:bg-[#f59e0b]/10' },
                            { key: 'MEDIUM' as const, label: 'Medium', count: mediumCount, activeColor: 'bg-[#BC13FE]/20 text-[#BC13FE] border-[#BC13FE]/40', inactiveColor: 'bg-[#BC13FE]/5 text-[#BC13FE]/60 border-[#BC13FE]/20 hover:bg-[#BC13FE]/10' },
                          ].filter(f => f.key === 'ALL' || f.count > 0).map(f => (
                            <button key={f.key} onClick={() => setPriorityFilter(f.key)}
                              className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all border",
                                priorityFilter === f.key ? f.activeColor : f.inactiveColor
                              )}>
                              {f.label} ({f.count})
                            </button>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filtered.map((rec: any, i: number) => (
                              <FixInstructionCard
                                key={i}
                                title={rec.title}
                                domain={normDomain(rec) as any}
                                priority={normPriority(rec)}
                                steps={rec.steps || [{ step: 1, title: 'Implementation', description: rec.description }]}
                                code={rec.code || rec.codeSnippet}
                                platform={rec.platform || 'Any'}
                                estimatedTime={rec.estimatedTime || `${rec.effort || 1}h`}
                                difficulty={rec.effort >= 3 ? 'difficult' : rec.effort >= 2 ? 'moderate' : 'easy'}
                                impact={rec.priority === 'CRITICAL' ? 'high' : rec.priority === 'HIGH' ? 'medium' : 'low'}
                                affectedPages={result.pagesCrawled}
                                validationLinks={rec.validationLinks}
                                impactedScores={rec.impactedScores}
                                whyItMatters={rec.description}
                              />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })()}

                {/* Link Building Intelligence */}
                {result.backlinkData && (
                  <LinkBuildingIntelligence
                    metrics={result.backlinkData.metrics}
                    backlinks={result.backlinkData.backlinks}
                  />
                )}

                {/* Page Comparison Table */}
                {result.pages.length > 1 && (
                  <PageComparisonTable
                    pages={result.pages.map((p: any) => ({
                      url: p.url,
                      title: p.title || 'Untitled',
                      seoScore: p.scores.seo.score,
                      aeoScore: p.scores.aeo.score,
                      geoScore: p.scores.geo.score,
                      wordCount: p.wordCount || 0,
                      issueCount: p.enhancedPenalties?.length || 0,
                      issues: (p.enhancedPenalties || []).slice(0, 3).map((pen: any) => ({
                        type: pen.component,
                        severity: pen.severity === 'critical' ? 'high' : pen.severity === 'warning' ? 'medium' : 'low',
                        fix: pen.fix
                      })),
                      hasH1: p.hasH1 === true,
                      hasMetaDescription: p.hasDescription === true,
                      schemaCount: p.schemaCount || 0,
                      responseTimeMs: p.responseTimeMs || 0,
                    }))}
                  />
                )}

                {/* Domain Health Breakdown */}
                {result.sitewideIntelligence?.domainHealthBreakdown && (
                  <Card className="border-[#00e5ff]/20 bg-[#00e5ff]/5">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-[#00e5ff]" />
                        <CardTitle className="text-foreground">Domain Health Breakdown</CardTitle>
                        <InfoTooltip content="Aggregate domain quality across 5 key areas: content, schema, metadata, technical performance, and architecture." />
                        <Badge className="ml-auto bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 text-xs font-black">{result.sitewideIntelligence.domainHealthScore ?? '–'} / 100</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pb-4 border-b border-border/50 mb-4">
                        {[
                          { label: "Content", value: result.sitewideIntelligence.domainHealthBreakdown.contentQuality },
                          { label: "Schema", value: result.sitewideIntelligence.domainHealthBreakdown.schemaQuality },
                          { label: "Metadata", value: result.sitewideIntelligence.domainHealthBreakdown.metadataQuality },
                          { label: "Technical", value: result.sitewideIntelligence.domainHealthBreakdown.technicalHealth },
                          { label: "Architecture", value: result.sitewideIntelligence.domainHealthBreakdown.architectureHealth },
                        ].map(item => {
                          const v = item.value ?? 0
                          const scoreColor = v >= 75 ? "text-green-500" : v >= 50 ? "text-yellow-500" : "text-red-500"
                          return (
                            <div key={item.label} className="text-center">
                              <p className={`text-2xl font-black ${scoreColor}`}>{v}</p>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                            </div>
                          )
                        })}
                      </div>
                      {/* Health explanations */}
                      {result.sitewideIntelligence.domainHealthExplanations && (
                        <div className="space-y-3">
                          {Object.entries(result.sitewideIntelligence.domainHealthExplanations).map(([key, data]: [string, any]) => (
                            <div key={key} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-xs text-muted-foreground">{data.score}/100</span>
                              </div>
                              {data.issues?.length > 0 && (
                                <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                                  {data.issues.slice(0, 3).map((issue: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-yellow-600 mt-0.5">⚠</span> {issue}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {data.recommendations?.length > 0 && (
                                <ul className="text-xs space-y-0.5 mt-2">
                                  {data.recommendations.slice(0, 3).map((rec: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1 text-[#00e5ff]">
                                      <Zap className="h-3 w-3 shrink-0 mt-0.5" /> <span className="text-foreground/80">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Schema Health Audit */}
                {result.sitewideIntelligence?.schemaHealthAudit && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-seo" />
                        <CardTitle>Schema Health Audit</CardTitle>
                        <InfoTooltip content="Deterministic validation of structured data quality, coverage, and diversity across all crawled pages." />
                        <Badge className="ml-auto bg-seo/10 text-seo border-seo/30 text-xs font-black">
                          {result.sitewideIntelligence.schemaHealthAudit.overallScore}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border/50">
                        {[
                          { label: "Coverage", value: result.sitewideIntelligence.schemaHealthAudit.breakdown?.coverage ?? 0 },
                          { label: "Quality", value: result.sitewideIntelligence.schemaHealthAudit.breakdown?.quality ?? 0 },
                          { label: "Diversity", value: result.sitewideIntelligence.schemaHealthAudit.breakdown?.diversity ?? 0 },
                        ].map(item => {
                          const v = typeof item.value === 'number' ? item.value : 0
                          const color = v >= 75 ? "text-green-500" : v >= 50 ? "text-yellow-500" : "text-red-500"
                          return (
                            <div key={item.label} className="text-center">
                              <p className={`text-xl font-black ${color}`}>{v}%</p>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                            </div>
                          )
                        })}
                      </div>
                      {result.sitewideIntelligence.schemaHealthAudit.issues?.length > 0 && (
                        <div className="space-y-2">
                          {result.sitewideIntelligence.schemaHealthAudit.issues.slice(0, 5).map((issue: any, i: number) => (
                            <div key={i} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                                  issue.severity === 'critical' ? 'bg-red-500/10 text-red-600' :
                                  issue.severity === 'high' ? 'bg-yellow-500/10 text-yellow-600' :
                                  'bg-blue-500/10 text-blue-600'
                                }`}>{issue.severity}</span>
                                <span className="text-sm font-medium">{issue.issue}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{issue.affectedCount} page(s) affected • -{issue.pointsDeducted} pts</p>
                              {issue.howToFix && (
                                <div className="flex items-start gap-1.5 mt-1.5 p-1.5 rounded bg-[#00e5ff]/5 border border-[#00e5ff]/20">
                                  <Zap className="h-3 w-3 text-[#00e5ff] shrink-0 mt-0.5" />
                                  <p className="text-xs text-foreground/80"><span className="font-semibold text-[#00e5ff]">Fix:</span> {issue.howToFix}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Duplicate Titles / Descriptions */}
                {(result.duplicateTitles?.length > 0 || result.duplicateDescriptions?.length > 0) && (
                  <Card className="border-yellow-500/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <CardTitle>Duplicate Content Detection</CardTitle>
                        <InfoTooltip content="Pages sharing identical titles or meta descriptions can cause keyword cannibalization and confuse search engines." />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.duplicateTitles?.map((dup, i) => (
                        <div key={`t-${i}`} className="p-3 border rounded-lg">
                          <p className="text-xs font-bold text-yellow-600 mb-1">Duplicate Title ({dup.urls.length} pages)</p>
                          <p className="text-sm font-medium mb-1 truncate">{dup.title}</p>
                          <div className="space-y-0.5">
                            {dup.urls.map((u, j) => <p key={j} className="text-xs text-muted-foreground truncate">{u}</p>)}
                          </div>
                          <div className="flex items-start gap-1.5 mt-2 p-1.5 rounded bg-[#00e5ff]/5 border border-[#00e5ff]/20">
                            <Zap className="h-3 w-3 text-[#00e5ff] shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground/80"><span className="font-semibold text-[#00e5ff]">Fix:</span> Write a unique, descriptive title for each page that reflects its specific content. Duplicate titles cause keyword cannibalization.</p>
                          </div>
                        </div>
                      ))}
                      {result.duplicateDescriptions?.map((dup, i) => (
                        <div key={`d-${i}`} className="p-3 border rounded-lg">
                          <p className="text-xs font-bold text-yellow-600 mb-1">Duplicate Description ({dup.urls.length} pages)</p>
                          <p className="text-sm font-medium mb-1 truncate">{dup.description}</p>
                          <div className="space-y-0.5">
                            {dup.urls.map((u, j) => <p key={j} className="text-xs text-muted-foreground truncate">{u}</p>)}
                          </div>
                          <div className="flex items-start gap-1.5 mt-2 p-1.5 rounded bg-[#00e5ff]/5 border border-[#00e5ff]/20">
                            <Zap className="h-3 w-3 text-[#00e5ff] shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground/80"><span className="font-semibold text-[#00e5ff]">Fix:</span> Write a unique meta description (120-160 chars) for each page summarizing its specific value proposition.</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* AEO Readiness */}
                {result.sitewideIntelligence?.aeoReadiness && (
                  <Card className="border-[#BC13FE]/20 bg-[#BC13FE]/5">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#BC13FE]" />
                        <CardTitle>AEO Readiness</CardTitle>
                        <InfoTooltip content="How ready your domain is to be cited by AI assistants like ChatGPT, Perplexity, and Gemini." />
                        <Badge className="ml-auto bg-[#BC13FE]/10 text-[#BC13FE] border-[#BC13FE]/30 text-xs font-black">
                          {result.sitewideIntelligence.aeoReadiness.score}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{result.sitewideIntelligence.aeoReadiness.verdict}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(result.sitewideIntelligence.aeoReadiness.signals || {}).map(([key, val]) => {
                          const label = key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()
                          const fixes: Record<string, string> = {
                            'AboutPage': 'Create a detailed About page with team bios, company history, and expertise signals.',
                            'FaqContent': 'Add an FAQ section with structured Q&A using FAQPage schema markup.',
                            'StructuredQa': 'Implement FAQPage or QAPage schema to help AI engines parse your Q&A content.',
                            'AuthorOrExpertSignals': 'Add author bios with credentials, certifications, or experience to establish E-E-A-T.',
                            'ClearTopicFocus': 'Tighten your content around core topics. Avoid covering too many unrelated subjects.',
                            'SchemaForAi': 'Add JSON-LD schema (Organization, LocalBusiness, FAQPage) to help AI engines understand your site.',
                            'LongformContent': 'Create in-depth content (1000+ words) on key topics to demonstrate expertise.',
                          }
                          const fixKey = key.replace(/^has/, '')
                          return (
                            <div key={key} className={`p-2 rounded border text-xs ${val ? 'border-green-500/30 bg-green-500/5 text-green-600' : 'border-red-500/30 bg-red-500/5 text-red-600'}`}>
                              <p>{val ? '✓' : '✗'} {label}</p>
                              {!val && fixes[fixKey] && (
                                <p className="text-[10px] text-foreground/60 mt-1">💡 {fixes[fixKey]}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>
            )}
          </div>
        </main>
    </PageShell>
  )
}
