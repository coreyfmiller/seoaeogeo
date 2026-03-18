'use client'

import { useState, useEffect } from 'react'
import { Layers, Sparkles, Zap, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan } from '@/lib/scan-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { CrawlConfig } from '@/components/dashboard/crawl-config'
import { PageComparisonTable } from '@/components/dashboard/page-comparison-table'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { Badge } from '@/components/ui/badge'
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { useSSEAnalysis } from '@/hooks/use-sse-analysis'

interface DeepScanResult {
  url: string
  analyzedAt: string
  siteTypeResult: {
    primaryType: string
    secondaryTypes: string[]
    confidence: number
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
}

export default function DeepV3Page() {
  const [currentUrl, setCurrentUrl] = useState('')
  const sse = useSSEAnalysis<DeepScanResult>('/api/analyze-deep-v3')
  const [crawlConfig, setCrawlConfig] = useState({
    maxPages: 10,
    respectRobotsTxt: true
  })
  const handleAnalyze = async (submittedUrl: string) => {
    setCurrentUrl(submittedUrl)
    await sse.startAnalysis(submittedUrl, { maxPages: crawlConfig.maxPages })
  }

  const result = sse.data
  const isAnalyzing = sse.isAnalyzing
  const error = sse.error

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
    const latest = getLatestFullScan('deep')
    if (latest) {
      setCurrentUrl(latest.entry.url)
      sse.setData(latest.result)
    }
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search */}
        <Header
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          currentUrl={currentUrl}
          apiStatus="idle"
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto px-6 pt-6">
          <div className="max-w-7xl mx-auto space-y-6 pb-6">
      
            {/* Page Header with Actions */}
            <AuditPageHeader
              title="V3 Deep Scan"
              description="AI-powered multi-page analysis with context-aware scoring and comprehensive site audit."
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
              onSiteTypeConfirm={handleSiteTypeChange}
              onSiteTypeChange={handleSiteTypeChange}
              cwv={result?.cwv}
            />

            {/* Hero Section - Only show when no results */}
            {!result && !isAnalyzing && (
              <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Layers className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      The Ultimate SEO Audit
                    </CardTitle>
                    <CardDescription className="text-base max-w-2xl mx-auto">
                      Combines V3's AI-powered intelligence with multi-page deep crawling. 
                      Get context-aware scoring, actionable fixes, and comprehensive site analysis.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="max-w-2xl mx-auto space-y-6">
                  <CrawlConfig
                    onStartCrawl={(config) => handleAnalyze(config.url)}
                    isAnalyzing={isAnalyzing}
                  />
                  
                  {/* Beta Badge */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      <Sparkles className="h-3 w-3" />
                      BETA - AI-Powered Multi-Page Analysis
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What's Included Section */}
            {!result && !isAnalyzing && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Content Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gemini AI analyzes every page for tone, expertise, and content quality with context-aware scoring.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="h-5 w-5 text-purple-600" />
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
                      <Zap className="h-5 w-5 text-purple-600" />
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
              <Card className="border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                    <div className="text-center min-h-[48px]">
                      <h3 className="text-lg font-bold text-foreground">V3 Deep Scan in Progress</h3>
                      <p className="text-sm text-muted-foreground mt-1 transition-opacity duration-500">{sse.phase || 'Initializing...'}</p>
                    </div>
                    <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-seo via-aeo to-geo transition-all duration-[1500ms] ease-in-out" style={{ width: `${sse.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{sse.progress}%</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScanErrorDialog error={error} onClose={() => sse.reset()} onRetry={() => handleAnalyze(currentUrl)} />

            {/* Results Display */}
            {result && (
              <div className="space-y-6">
                {/* Aggregate Score Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-1">
                      <CircularProgress value={result.scores.seo} variant="seo" label="Avg SEO Score" size={140} strokeWidth={10} />
                      <InfoTooltip content="Average SEO score across all crawled pages, using context-aware scoring weights." />
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
                  const metrics = [
                    { label: "Domain Health", value: `${ai?.domainHealthScore ?? '–'}%`, color: "text-geo", tip: "AI-powered aggregate domain quality score combining content quality, schema implementation, metadata completeness, technical performance, and site architecture across all crawled pages. This is the single most important metric for understanding your site's overall health." },
                    { label: "Brand", value: `${ai?.consistencyScore ?? '–'}%`, color: "text-aeo", tip: "Brand consistency across all crawled pages — measures uniform tone, messaging, visual identity signals, and content voice. Inconsistent branding confuses both users and AI engines, reducing citation likelihood and trust." },
                    { label: "Schema", value: `${ai?.authorityMetrics?.schemaCoverage ?? '–'}%`, color: "text-seo", tip: "Percentage of crawled pages with valid structured data (JSON-LD). Schema markup enables rich snippets in search results and helps AI engines understand your content. Low coverage means missed opportunities for enhanced search visibility." },
                    { label: "Metadata", value: `${metaPct}%`, color: metaPct >= 90 ? "text-geo" : "text-yellow-600", tip: "Percentage of crawled pages with both a title tag and meta description. These control how your pages appear in search results. Pages without metadata get auto-generated snippets that rarely perform well." },
                    { label: "H1 Tags", value: `${h1Pct}%`, color: h1Pct >= 90 ? "text-geo" : "text-red-600", tip: "Percentage of crawled pages with an H1 heading tag. The H1 is the primary heading that tells search engines what each page is about. Every page should have exactly one — missing H1s confuse crawlers and hurt rankings." },
                    { label: "HTTPS", value: `${httpsPct}%`, color: httpsPct === 100 ? "text-geo" : "text-red-600", tip: "Percentage of crawled pages served over HTTPS. Google uses HTTPS as a ranking signal and browsers show 'Not Secure' warnings for HTTP pages. Anything less than 100% is a critical security and SEO issue." },
                    { label: "Response", value: `${result.aggregateMetrics.avgResponseTime}ms`, color: "text-geo", tip: "Average server response time (TTFB) across all crawled pages. Under 200ms is excellent, under 500ms is acceptable, over 500ms needs attention. Slow response times compound across a site and hurt Core Web Vitals." },
                    { label: "Robots.txt", value: result.robotsTxt ? "Found" : "Missing", color: result.robotsTxt ? "text-green-600" : "text-red-600", tip: "Whether a robots.txt file exists at the domain root. This file controls how search engine crawlers navigate your site — which pages to index and which to skip. Without it, crawlers may waste budget on unimportant pages." },
                    { label: "Sitemap", value: result.sitemapFound ? "Found" : "Missing", color: result.sitemapFound ? "text-green-600" : "text-red-600", tip: "Whether an XML sitemap was found at the domain root. Sitemaps help search engines discover all your pages efficiently, especially new content or deeply nested pages that might not be found through internal links alone." },
                    { label: "Alt Text", value: `${imgAltPct}%`, color: imgAltPct >= 80 ? "text-green-600" : "text-yellow-600", tip: "Percentage of images across all crawled pages with descriptive alt text. Alt text is critical for accessibility (screen readers rely on it) and image search rankings. Google Images drives significant traffic — missing alt text means lost opportunities." },
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

                {/* Prioritized Site Improvements */}
                {result.sitewideIntelligence?.recommendations?.length > 0 && (
                  <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-geo" />
                        <CardTitle>Prioritized Site Improvements</CardTitle>
                        <InfoTooltip content="AI-generated strategic roadmap ranked by impact. Each recommendation includes step-by-step fix instructions, code snippets, and validation links tailored to your site type." />
                      </div>
                      <CardDescription>Sitewide actions ranked by impact</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.sitewideIntelligence.recommendations.map((rec: any, i: number) => (
                          <FixInstructionCard
                            key={i}
                            title={rec.title}
                            category={rec.category === 'Quick Win' ? 'Quick Win' : rec.priority === 'CRITICAL' ? 'High Priority' : rec.priority === 'HIGH' ? 'Medium Priority' : 'Long-term Investment'}
                            priority={rec.priority || 'MEDIUM'}
                            steps={rec.steps || [{ step: 1, title: 'Implementation', description: rec.description }]}
                            code={rec.code}
                            platform={rec.platform || 'Any'}
                            estimatedTime={rec.estimatedTime || `${rec.effort || 1}h`}
                            difficulty={rec.effort >= 3 ? 'difficult' : rec.effort >= 2 ? 'moderate' : 'easy'}
                            impact={rec.priority === 'CRITICAL' ? 'high' : rec.priority === 'HIGH' ? 'medium' : 'low'}
                            affectedPages={result.pagesCrawled}
                            validationLinks={rec.validationLinks}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card className="border-geo/20 bg-geo/5">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-geo" />
                        <CardTitle className="text-geo">Domain Health Breakdown</CardTitle>
                        <InfoTooltip content="Aggregate domain quality across 5 key areas: content, schema, metadata, technical performance, and architecture." />
                        <Badge className="ml-auto bg-geo/10 text-geo border-geo/30 text-xs font-black">{result.sitewideIntelligence.domainHealthScore ?? '–'} / 100</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pb-4 border-b border-border/50 mb-4">
                        {[
                          { label: "Content", value: result.sitewideIntelligence.domainHealthBreakdown.contentQuality, color: "text-geo" },
                          { label: "Schema", value: result.sitewideIntelligence.domainHealthBreakdown.schemaQuality, color: "text-seo" },
                          { label: "Metadata", value: result.sitewideIntelligence.domainHealthBreakdown.metadataQuality, color: "text-aeo" },
                          { label: "Technical", value: result.sitewideIntelligence.domainHealthBreakdown.technicalHealth, color: "text-purple-500" },
                          { label: "Architecture", value: result.sitewideIntelligence.domainHealthBreakdown.architectureHealth, color: "text-blue-500" },
                        ].map(item => (
                          <div key={item.label} className="text-center">
                            <p className={`text-2xl font-black ${item.color}`}>{item.value ?? 0}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                          </div>
                        ))}
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
                                    <li key={i} className="flex items-start gap-1 text-geo">
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
                        <div className="text-center">
                          <p className="text-xl font-black text-seo">{result.sitewideIntelligence.schemaHealthAudit.breakdown?.coverage ?? 0}%</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Coverage</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-black text-aeo">{result.sitewideIntelligence.schemaHealthAudit.breakdown?.quality ?? 0}%</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Quality</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-black text-geo">{result.sitewideIntelligence.schemaHealthAudit.breakdown?.diversity ?? 0}%</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Diversity</p>
                        </div>
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
                                <div className="flex items-start gap-1.5 mt-1.5 p-1.5 rounded bg-geo/5 border border-geo/20">
                                  <Zap className="h-3 w-3 text-geo shrink-0 mt-0.5" />
                                  <p className="text-xs text-foreground/80"><span className="font-semibold text-geo">Fix:</span> {issue.howToFix}</p>
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
                          <div className="flex items-start gap-1.5 mt-2 p-1.5 rounded bg-geo/5 border border-geo/20">
                            <Zap className="h-3 w-3 text-geo shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground/80"><span className="font-semibold text-geo">Fix:</span> Write a unique, descriptive title for each page that reflects its specific content. Duplicate titles cause keyword cannibalization.</p>
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
                          <div className="flex items-start gap-1.5 mt-2 p-1.5 rounded bg-geo/5 border border-geo/20">
                            <Zap className="h-3 w-3 text-geo shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground/80"><span className="font-semibold text-geo">Fix:</span> Write a unique meta description (120-160 chars) for each page summarizing its specific value proposition.</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* AEO Readiness */}
                {result.sitewideIntelligence?.aeoReadiness && (
                  <Card className="border-purple-500/20 bg-purple-500/5">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <CardTitle>AEO Readiness</CardTitle>
                        <InfoTooltip content="How ready your domain is to be cited by AI assistants like ChatGPT, Perplexity, and Gemini." />
                        <Badge className="ml-auto bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs font-black">
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
      </div>
    </div>
  )
}
