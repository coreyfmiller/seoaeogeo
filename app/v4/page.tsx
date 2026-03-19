'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan } from '@/lib/scan-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/dashboard/search-input'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { useSSEAnalysis } from '@/hooks/use-sse-analysis'

interface AnalysisResult {
  url: string
  scores: {
    seo: { score: number }
    aeo: { score: number }
    geo: { score: number }
  }
  siteTypeResult?: {
    primaryType: string
    secondaryTypes: string[]
    confidence: number
  }
  graderResult: any
  robotsTxt: boolean
  sitemapFound: boolean
  issueCount: number
  liteAI?: {
    domainHealthScore: number
    domainHealthBreakdown: {
      contentQuality: number
      schemaQuality: number
      metadataQuality: number
      technicalHealth: number
      architectureHealth: number
    }
    brandConsistency: number
  }
  pageData?: any
  analyzedAt: string
  cwv?: {
    performanceScore: number
    lcp: { value: number; category: string; displayValue: string; score: number } | null
    inp: { value: number; category: string; displayValue: string; score: number } | null
    cls: { value: number; category: string; displayValue: string; score: number } | null
  }
}

export default function V4Page() {
  const [currentUrl, setCurrentUrl] = useState('')
  const sse = useSSEAnalysis<AnalysisResult>('/api/analyze-v4')
  const router = useRouter()

  const handleAnalyze = async (submittedUrl: string) => {
    setCurrentUrl(submittedUrl)
    await sse.startAnalysis(submittedUrl)
  }

  const result = sse.data
  const isAnalyzing = sse.isAnalyzing
  const error = sse.error

  const handleSiteTypeChange = async (newType: string) => {
    if (!result?.pageData) return
    try {
      const res = await fetch('/api/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanData: {
            ...result.pageData,
            semanticFlags: result.pageData.semanticFlags || {},
            schemaQuality: result.pageData.schemaQuality,
            siteType: newType,
          },
          siteType: newType,
        }),
      })
      if (!res.ok) return
      const recalc = await res.json()
      sse.setData({
        ...result,
        scores: recalc.scores,
        graderResult: recalc.graderResult,
        siteTypeResult: { ...result.siteTypeResult!, primaryType: newType },
      })
    } catch (e) {
      console.error('[V4] Recalculate failed:', e)
    }
  }

  useEffect(() => {
    if (result && currentUrl) {
      saveScanToHistory({
        url: currentUrl,
        type: 'free-v4',
        scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score },
        timestamp: new Date().toISOString(),
      }, result)
    }
  }, [result, currentUrl])

  useEffect(() => {
    const entry = consumeLoadFromHistory()
    if (entry && entry.type === 'free-v4') {
      const full = getFullScanResult(entry)
      if (full) {
        setCurrentUrl(entry.url)
        sse.setData(full)
        return
      }
    }
    const latest = getLatestFullScan('free-v4')
    if (latest) {
      setCurrentUrl(latest.entry.url)
      sse.setData(latest.result)
    }
  }, [])

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

        <main className="flex-1 overflow-y-auto px-6 pt-6">
          <div className="max-w-7xl mx-auto space-y-6 pb-6">
      
            <AuditPageHeader
              title="V4 Free Audit"
              description="Lite AI-powered scoring with Domain Health and Brand analysis."
              badge="BETA AI"
              badgeVariant="beta"
              currentUrl={currentUrl}
              hasResults={!!result}
              isAnalyzing={isAnalyzing}
              onNewAudit={() => {
                sse.reset()
                setCurrentUrl("")
              }}
              onRefreshAnalysis={() => handleAnalyze(currentUrl)}
              analysisData={result}
              pageCount={1}
              siteType={result?.siteTypeResult ? {
                primaryType: result.siteTypeResult.primaryType,
                confidence: result.siteTypeResult.confidence
              } : undefined}
              onSiteTypeConfirm={handleSiteTypeChange}
              onSiteTypeChange={handleSiteTypeChange}
              cwv={result?.cwv}
            />

            {isAnalyzing && (
              <Card className="border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                    <div className="text-center min-h-[48px]">
                      <h3 className="text-lg font-bold text-foreground">V4 Free Audit in Progress</h3>
                      <p className="text-sm text-muted-foreground mt-1">{sse.phase || 'Initializing...'}</p>
                    </div>
                    <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-seo via-aeo to-geo transition-all duration-[1500ms] ease-in-out" style={{ width: `${sse.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{sse.progress}%</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!result && !isAnalyzing && (
              <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2">V4 Free Audit</CardTitle>
                    <CardDescription className="text-base max-w-2xl mx-auto">
                      Lite AI analysis with Domain Health and Brand scoring. Minimal token usage for free tier.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="max-w-2xl mx-auto">
                  <SearchInput
                    onSubmit={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    placeholder="Enter website URL to audit..."
                    variant="large"
                  />
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      <Sparkles className="h-3 w-3" />
                      BETA AI - Lite Analysis
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {!result && !isAnalyzing && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Domain Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      AI-powered domain quality score with content, schema, and technical breakdown.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Brand Consistency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Measures brand cohesion and messaging clarity across your page.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Minimal Token Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      ~2,000 tokens vs ~6,000+ for full Pro Audit. Sustainable for free tier.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <ScanErrorDialog error={error} onClose={() => sse.reset()} onRetry={() => handleAnalyze(currentUrl)} />

            {result && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-1">
                    <CircularProgress value={result.scores.seo.score} variant="seo" label="SEO Score" size={140} strokeWidth={10} />
                    <InfoTooltip content="Search Engine Optimization — measures technical health, metadata, crawlability, content structure, and on-page factors. A high SEO score means search engines can easily find, crawl, and understand your page." />
                    </div>
                  </Card>
                  <Card className="flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-1">
                    <CircularProgress value={result.scores.aeo.score} variant="aeo" label="AEO Score" size={140} strokeWidth={10} />
                    <InfoTooltip content="Answer Engine Optimization — measures how likely AI assistants like ChatGPT, Perplexity, and Gemini are to cite your content. Factors include structured data, FAQ coverage, direct answer formatting, and schema markup." />
                    </div>
                  </Card>
                  <Card className="flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-1">
                    <CircularProgress value={result.scores.geo.score} variant="geo" label="GEO Score" size={140} strokeWidth={10} />
                    <InfoTooltip content="Generative Engine Optimization — measures how well your content is structured for AI-generated search results and summaries. Evaluates brand clarity, topical authority, citation-worthiness, and content uniqueness." />
                    </div>
                  </Card>
                </div>

                {/* Key Metrics Strip — 10 metrics including AI-powered Domain Health & Brand */}
                {(() => {
                  const sd = result.pageData?.structuralData || {}
                  const tech = result.pageData?.technical || {}
                  const schemas = result.pageData?.schemas || []
                  const hasSchema = schemas.length > 0
                  const hasH1 = (sd.semanticTags?.h1Count || 0) > 0
                  const isHttps = tech.isHttps === true
                  const hasMeta = !!(result.pageData?.description && result.pageData?.title)
                  const responseTime = tech.responseTimeMs || 0
                  const imgTotal = sd.media?.totalImages || 0
                  const imgWithAlt = sd.media?.imagesWithAlt || 0
                  const altPct = imgTotal > 0 ? Math.round((imgWithAlt / imgTotal) * 100) : 100
                  const wordCount = sd.wordCount || 0
                  const domainHealth = result.liteAI?.domainHealthScore ?? '–'
                  const brand = result.liteAI?.brandConsistency ?? '–'
                  const metrics = [
                    { label: "Domain Health", value: `${domainHealth}%`, color: "text-geo", tip: "AI-powered domain quality score combining content quality, schema implementation, metadata completeness, technical performance, and site architecture. This is a holistic measure of how well your domain is optimized across all ranking factors." },
                    { label: "Brand", value: `${brand}%`, color: "text-aeo", tip: "Measures brand consistency and messaging clarity across your page. Strong brand signals help AI engines identify and recommend your content. Single-page analysis defaults to 100% — multi-page deep scans measure cross-page consistency." },
                    { label: "Schema", value: hasSchema ? `${schemas.length} found` : "0%", color: hasSchema ? "text-seo" : "text-red-600", tip: "Structured data (JSON-LD) schemas found on the page. Schema markup helps search engines understand your content and enables rich snippets — like star ratings, FAQs, and product prices. Missing schema means you're invisible to rich result features." },
                    { label: "Metadata", value: hasMeta ? "100%" : "0%", color: hasMeta ? "text-geo" : "text-yellow-600", tip: "Whether the page has both a title tag and meta description. These are the first things users see in search results. Missing metadata means Google will auto-generate your snippet, which is almost always worse than a crafted one." },
                    { label: "H1 Tag", value: hasH1 ? "100%" : "0%", color: hasH1 ? "text-geo" : "text-red-600", tip: "Whether the page has an H1 heading tag. The H1 is the primary heading that tells search engines and users what the page is about. Every page should have exactly one H1." },
                    { label: "HTTPS", value: isHttps ? "100%" : "0%", color: isHttps ? "text-geo" : "text-red-600", tip: "Whether the page is served over HTTPS. Google uses HTTPS as a ranking signal. Non-HTTPS sites show 'Not Secure' warnings in browsers, destroying user trust." },
                    { label: "Response", value: `${responseTime}ms`, color: responseTime < 500 ? "text-geo" : "text-yellow-600", tip: "Server response time (Time to First Byte). Under 200ms is excellent, under 500ms is acceptable. Slow response times directly impact Core Web Vitals and user experience." },
                    { label: "Robots.txt", value: result.robotsTxt ? "Found" : "Missing", color: result.robotsTxt ? "text-green-600" : "text-red-600", tip: "Whether a robots.txt file exists at the domain root. This file tells search engine crawlers which pages to index and which to skip. Without it, crawlers may waste budget on unimportant pages." },
                    { label: "Sitemap", value: result.sitemapFound ? "Found" : "Missing", color: result.sitemapFound ? "text-green-600" : "text-red-600", tip: "Whether an XML sitemap was found. Sitemaps help search engines discover all your pages efficiently, especially new or deeply nested content." },
                    { label: "Alt Text", value: `${altPct}%`, color: altPct >= 80 ? "text-green-600" : "text-yellow-600", tip: "Percentage of images with descriptive alt text. Alt text is critical for accessibility (screen readers) and image search rankings. Google Images drives significant traffic — missing alt text means lost opportunities." },
                    { label: "Word Count", value: `${wordCount.toLocaleString()}`, color: wordCount < 300 ? "text-red-600" : wordCount < 800 ? "text-yellow-600" : "text-green-600", tip: wordCount < 300 ? "Thin content — under 300 words. Pages with very little content struggle to rank because search engines can't determine topical relevance." : wordCount < 800 ? "Moderate content depth. Pages with 800+ words tend to rank better for competitive queries." : "Good content depth. Comprehensive content tends to rank better and earn more backlinks." },
                  ]
                  return (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
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

                {/* Issues Found Summary */}
                {(() => {
                  const total = result.issueCount || 0
                  const critical = result.graderResult?.criticalIssues?.length || 0
                  const warnings = total - critical
                  const color = total === 0 ? 'border-green-500/20 bg-green-500/5' : total <= 5 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-red-500/20 bg-red-500/5'
                  const textColor = total === 0 ? 'text-green-600' : total <= 5 ? 'text-yellow-600' : 'text-red-600'
                  return (
                    <div className={`flex items-center justify-between rounded-lg border px-4 py-2 ${color}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${textColor}`}>{total}</span>
                        <span className="text-sm font-medium">issues found</span>
                        <InfoTooltip content="Total number of SEO, AEO, and GEO issues detected. Critical issues have the highest impact on your scores. Upgrade to Pro for detailed fix instructions with copy-paste code." />
                        <span className="text-xs text-muted-foreground">
                          {critical > 0 && <span className="text-red-600 font-medium">({critical} critical)</span>}
                        </span>
                      </div>
                      <button
                        onClick={() => document.getElementById('upgrade-cta')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-xs px-3 py-1 rounded-md bg-geo/10 text-geo hover:bg-geo/20 font-medium transition-colors"
                      >
                        See fixes →
                      </button>
                    </div>
                  )
                })()}

                {/* Upgrade CTA */}
                <Card id="upgrade-cta" className="border-geo/30 bg-gradient-to-br from-geo/10 to-aeo/10 relative overflow-hidden">
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
                        <p className="text-muted-foreground mb-4">
                          Stop guessing. Get exact implementation guides with copy-paste code for every issue.
                        </p>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span>Detailed explanations of why each fix matters</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span>Copy-paste code examples ready to implement</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span>Platform-specific guides (WordPress, Shopify, custom)</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span>ROI estimates and priority scoring</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span>Deep crawl up to 50 pages for comprehensive site analysis</span>
                          </li>
                        </ul>
                      </div>
                      <div className="shrink-0 text-center">
                        <button
                          onClick={() => router.push('/v3')}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-geo hover:bg-geo/90 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                          View Pro Audit
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-muted-foreground mt-3">See detailed fixes for this URL</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
