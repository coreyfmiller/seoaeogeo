'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { saveScanToHistory } from '@/lib/scan-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/dashboard/search-input'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { InfoTooltip } from '@/components/ui/info-tooltip'
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

  useEffect(() => {
    if (result && currentUrl) {
      saveScanToHistory({
        url: currentUrl,
        type: 'free-v4',
        scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score },
        timestamp: new Date().toISOString(),
      })
    }
  }, [result, currentUrl])

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

            {error && (
              <Card className="border-red-500/50 bg-red-500/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="flex items-center justify-center p-6">
                    <CircularProgress value={result.scores.seo.score} variant="seo" label="SEO Score" size={140} strokeWidth={10} />
                  </Card>
                  <Card className="flex items-center justify-center p-6">
                    <CircularProgress value={result.scores.aeo.score} variant="aeo" label="AEO Score" size={140} strokeWidth={10} />
                  </Card>
                  <Card className="flex items-center justify-center p-6">
                    <CircularProgress value={result.scores.geo.score} variant="geo" label="GEO Score" size={140} strokeWidth={10} />
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
                  const domainHealth = result.liteAI?.domainHealthScore ?? '–'
                  const brand = result.liteAI?.brandConsistency ?? '–'
                  const metrics = [
                    { label: "Domain Health", value: `${domainHealth}%`, color: "text-geo", tip: "AI-powered domain quality score combining content, schema, metadata, technical, and architecture health." },
                    { label: "Brand", value: `${brand}%`, color: "text-aeo", tip: "Brand consistency and messaging clarity. Single-page analysis defaults to 100%." },
                    { label: "Schema", value: hasSchema ? `${schemas.length} found` : "0%", color: hasSchema ? "text-seo" : "text-red-600", tip: "Number of structured data schemas found on the page. Improves rich snippet eligibility." },
                    { label: "Metadata", value: hasMeta ? "100%" : "0%", color: hasMeta ? "text-geo" : "text-yellow-600", tip: "Whether the page has both a title tag and meta description." },
                    { label: "H1 Tag", value: hasH1 ? "100%" : "0%", color: hasH1 ? "text-geo" : "text-red-600", tip: "Whether the page has an H1 heading tag." },
                    { label: "HTTPS", value: isHttps ? "100%" : "0%", color: isHttps ? "text-geo" : "text-red-600", tip: "Whether the page is served over HTTPS." },
                    { label: "Response", value: `${responseTime}ms`, color: responseTime < 500 ? "text-geo" : "text-yellow-600", tip: "Server response time. Under 200ms is good." },
                    { label: "Robots.txt", value: result.robotsTxt ? "Found" : "Missing", color: result.robotsTxt ? "text-green-600" : "text-red-600", tip: "Whether a robots.txt file exists at the domain root." },
                    { label: "Sitemap", value: result.sitemapFound ? "Found" : "Missing", color: result.sitemapFound ? "text-green-600" : "text-red-600", tip: "Whether an XML sitemap was found." },
                    { label: "Alt Text", value: `${altPct}%`, color: altPct >= 80 ? "text-green-600" : "text-yellow-600", tip: "Percentage of images with descriptive alt text." },
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

                {/* Content Analysis — Tier 1 (zero AI cost) */}
                {(() => {
                  const sd = result.pageData?.structuralData || {}
                  const schemas = result.pageData?.schemas || []
                  const wordCount = sd.wordCount || 0
                  const internalLinks = sd.links?.internal || 0
                  const externalLinks = sd.links?.external || 0
                  const h1 = sd.semanticTags?.h1Count || 0
                  const h2 = sd.semanticTags?.h2Count || 0
                  const h3 = sd.semanticTags?.h3Count || 0
                  const schemaTypes = schemas.map((s: any) => s['@type']).filter(Boolean)
                  const uniqueSchemas = [...new Set(schemaTypes)] as string[]

                  const items = [
                    { label: "Word Count", value: wordCount.toLocaleString(), sub: wordCount < 300 ? "Thin content" : wordCount < 800 ? "Moderate" : "Good depth", color: wordCount < 300 ? "text-red-600" : wordCount < 800 ? "text-yellow-600" : "text-green-600" },
                    { label: "Internal Links", value: internalLinks, sub: internalLinks === 0 ? "None found" : `${internalLinks} link${internalLinks !== 1 ? 's' : ''}`, color: internalLinks === 0 ? "text-red-600" : "text-green-600" },
                    { label: "External Links", value: externalLinks, sub: externalLinks === 0 ? "None found" : `${externalLinks} link${externalLinks !== 1 ? 's' : ''}`, color: externalLinks === 0 ? "text-yellow-600" : "text-green-600" },
                    { label: "Headings", value: `H1:${h1} H2:${h2} H3:${h3}`, sub: h1 === 0 ? "Missing H1" : h2 === 0 ? "No H2 structure" : "Good hierarchy", color: h1 === 0 ? "text-red-600" : h2 === 0 ? "text-yellow-600" : "text-green-600" },
                    { label: "Schema Types", value: uniqueSchemas.length > 0 ? uniqueSchemas.join(', ') : "None", sub: uniqueSchemas.length === 0 ? "No structured data" : `${uniqueSchemas.length} type${uniqueSchemas.length !== 1 ? 's' : ''}`, color: uniqueSchemas.length === 0 ? "text-red-600" : "text-green-600" },
                  ]

                  return (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-seo" />
                          Content Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {items.map(item => (
                            <div key={item.label} className="space-y-0.5">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                              <p className={`text-sm font-bold ${item.color} truncate`}>{item.value}</p>
                              <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
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
                        <p className="text-lg text-geo font-bold mb-2">Plans starting at $5/month</p>
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
