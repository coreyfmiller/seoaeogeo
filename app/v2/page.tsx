'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Search, Zap, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
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
  graderResult: {
    seoScore: number
    aeoScore: number
    geoScore: number
    breakdown: {
      seo: Array<{
        name: string
        score: number
        maxScore: number
        percentage: number
        components: Array<{
          score: number
          maxScore: number
          status: 'good' | 'warning' | 'critical'
          feedback: string
          issues?: string[]
        }>
      }>
      aeo: Array<{
        name: string
        score: number
        maxScore: number
        percentage: number
        components: Array<{
          score: number
          maxScore: number
          status: 'good' | 'warning' | 'critical'
          feedback: string
          issues?: string[]
        }>
      }>
      geo: Array<{
        name: string
        score: number
        maxScore: number
        percentage: number
        components: Array<{
          score: number
          maxScore: number
          status: 'good' | 'warning' | 'critical'
          feedback: string
          issues?: string[]
        }>
      }>
    }
    overallFeedback: string
    criticalIssues: string[]
  }
  enhancedPenalties: Array<{
    category: 'SEO' | 'AEO' | 'GEO'
    component: string
    penalty: string
    explanation: string
    fix: string
    pointsDeducted: number
    severity: 'critical' | 'warning' | 'info'
  }>
  cwv: {
    lcp: { value: number; category: string; displayValue: string; score: number } | null
    inp: { value: number; category: string; displayValue: string; score: number } | null
    cls: { value: number; category: string; displayValue: string; score: number } | null
    overallCategory: string
    performanceScore: number
  }
  analyzedAt: string
  robotsTxt: boolean
  sitemapFound: boolean
}

export default function V2Page() {
  const [url, setUrl] = useState('')
  const [currentUrl, setCurrentUrl] = useState('')
  const sse = useSSEAnalysis<AnalysisResult>('/api/analyze-v2')
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
        type: 'free-v3',
        scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score },
        timestamp: new Date().toISOString(),
      })
    }
  }, [result, currentUrl])

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
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header with Actions */}
      <AuditPageHeader
        title="V3 Free Audit"
        description="Fast heuristic scoring with Core Web Vitals and site-type detection."
        badge="FREE"
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
        proLocked={true}
        siteType={result?.siteTypeResult ? {
          primaryType: result.siteTypeResult.primaryType,
          confidence: result.siteTypeResult.confidence
        } : undefined}
      />

      {/* Loading Overlay */}
      {isAnalyzing && (
        <Card className="border-seo/30">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
              <div className="text-center min-h-[48px]">
                <h3 className="text-lg font-bold text-foreground">V3 Free Audit in Progress</h3>
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

      {/* Hero Section - Only show when no results */}
      {!result && !isAnalyzing && (
      <Card className="border-2 border-seo/20 bg-gradient-to-br from-seo/5 to-transparent">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-seo/10 flex items-center justify-center">
            <Zap className="h-8 w-8 text-seo" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">
              The Future of SEO Auditing
            </CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              V3 Free Audit includes Core Web Vitals, mobile-first scoring, and AI-powered insights.
              Built for the 2026 search landscape.
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
          
          {/* Beta Badge */}
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Zap className="h-3 w-3" />
              BETA - Testing Phase
            </span>
          </div>
        </CardContent>
      </Card>
      )}

      {/* What's New Section */}
      {!result && !isAnalyzing && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real performance metrics: LCP, INP, and CLS measured with Lighthouse.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobile-First Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Optimized for mobile performance and user experience.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Better Differentiation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Quality sites score higher with improved content quality detection.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Score Cards with Circular Progress */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex items-center justify-center p-6">
              <CircularProgress
                value={result.scores.seo.score}
                variant="seo"
                label="SEO Score"
                size={140}
                strokeWidth={10}
              />
            </Card>

            <Card className="flex items-center justify-center p-6">
              <CircularProgress
                value={result.scores.aeo.score}
                variant="aeo"
                label="AEO Score"
                size={140}
                strokeWidth={10}
              />
            </Card>

            <Card className="flex items-center justify-center p-6">
              <CircularProgress
                value={result.scores.geo.score}
                variant="geo"
                label="GEO Score"
                size={140}
                strokeWidth={10}
              />
            </Card>
          </div>

          {/* Key Metrics Strip */}
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
            const metrics = [
              { label: "Schema", value: hasSchema ? `${schemas.length} found` : "0%", color: hasSchema ? "text-seo" : "text-red-600", tip: "Number of structured data schemas found. Improves rich snippet eligibility." },
              { label: "Metadata", value: hasMeta ? "100%" : "0%", color: hasMeta ? "text-geo" : "text-yellow-600", tip: "Whether the page has both a title tag and meta description." },
              { label: "H1 Tag", value: hasH1 ? "100%" : "0%", color: hasH1 ? "text-geo" : "text-red-600", tip: "Whether the page has an H1 heading tag." },
              { label: "HTTPS", value: isHttps ? "100%" : "0%", color: isHttps ? "text-geo" : "text-red-600", tip: "Whether the page is served over HTTPS." },
              { label: "Response", value: `${responseTime}ms`, color: responseTime < 500 ? "text-geo" : "text-yellow-600", tip: "Server response time. Under 200ms is good, over 500ms needs attention." },
              { label: "Robots.txt", value: result.robotsTxt ? "Found" : "Missing", color: result.robotsTxt ? "text-green-600" : "text-red-600", tip: "Whether a robots.txt file exists at the domain root." },
              { label: "Sitemap", value: result.sitemapFound ? "Found" : "Missing", color: result.sitemapFound ? "text-green-600" : "text-red-600", tip: "Whether an XML sitemap was found at the domain root." },
              { label: "Alt Text", value: `${altPct}%`, color: altPct >= 80 ? "text-green-600" : "text-yellow-600", tip: "Percentage of images with descriptive alt text. Critical for accessibility and image search." },
            ]
            return (
              <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2">
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

          {/* Pass/Fail Checklist */}
          {(() => {
            const mc = result.pageData?.metaChecks || {}
            const sd = result.pageData?.structuralData || {}
            const titleLen = mc.titleLength || 0
            const descLen = mc.descriptionLength || 0
            const wordCount = sd.wordCount || 0
            const h2Count = sd.semanticTags?.h2Count || 0
            const internalLinks = sd.links?.internal || 0

            const checks = [
              { label: "Title Length", value: `${titleLen} chars`, pass: titleLen >= 30 && titleLen <= 60, tip: titleLen === 0 ? "Missing" : titleLen < 30 ? "Too short (min 30)" : titleLen > 60 ? "Too long (max 60)" : "Optimal" },
              { label: "Description Length", value: `${descLen} chars`, pass: descLen >= 70 && descLen <= 160, tip: descLen === 0 ? "Missing" : descLen < 70 ? "Too short (min 70)" : descLen > 160 ? "Too long (max 160)" : "Optimal" },
              { label: "Canonical URL", value: mc.hasCanonical ? "Present" : "Missing", pass: !!mc.hasCanonical, tip: mc.hasCanonical ? "Canonical tag found" : "No canonical tag — risk of duplicate content" },
              { label: "Open Graph", value: mc.hasOgTitle && mc.hasOgImage ? "Complete" : mc.hasOgTitle ? "Partial" : "Missing", pass: !!mc.hasOgTitle && !!mc.hasOgImage, tip: !mc.hasOgTitle ? "No OG tags — poor social sharing preview" : !mc.hasOgImage ? "Missing og:image" : "Social sharing ready" },
              { label: "Viewport Tag", value: mc.hasViewport ? "Present" : "Missing", pass: !!mc.hasViewport, tip: mc.hasViewport ? "Mobile-friendly viewport set" : "No viewport tag — not mobile-friendly" },
              { label: "Content Depth", value: `${wordCount.toLocaleString()} words`, pass: wordCount >= 300, tip: wordCount < 300 ? "Thin content (under 300 words)" : "Sufficient content depth" },
              { label: "H2 Structure", value: `${h2Count} found`, pass: h2Count > 0, tip: h2Count === 0 ? "No H2 headings — poor content structure" : "Content has heading structure" },
              { label: "Internal Links", value: `${internalLinks} found`, pass: internalLinks > 0, tip: internalLinks === 0 ? "No internal links — orphan page" : "Page links to other pages on the site" },
            ]

            const passCount = checks.filter(c => c.pass).length
            const failCount = checks.length - passCount

            return (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4 text-seo" />
                      Quick Health Check
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" />{passCount} passed</span>
                      <span className="flex items-center gap-1 text-red-600"><XCircle className="h-3 w-3" />{failCount} failed</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {checks.map(c => (
                      <div key={c.label} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${c.pass ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                        {c.pass ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{c.label}</p>
                          <p className={`text-xs font-medium ${c.pass ? 'text-green-600' : 'text-red-600'}`}>{c.value}</p>
                          <p className="text-[10px] text-muted-foreground">{c.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Upgrade CTA */}
          {(() => {
            // Count issues from grader breakdown
            const critical = result.graderResult?.criticalIssues?.length || 0
            const warningCount = [...(result.graderResult?.breakdown?.seo || []), ...(result.graderResult?.breakdown?.aeo || []), ...(result.graderResult?.breakdown?.geo || [])]
              .flatMap((cat: any) => cat.components || [])
              .filter((c: any) => c.status === 'critical' || c.status === 'warning').length
            const total = critical + warningCount
            const color = total === 0 ? 'border-green-500/20 bg-green-500/5' : total <= 5 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-red-500/20 bg-red-500/5'
            const textColor = total === 0 ? 'text-green-600' : total <= 5 ? 'text-yellow-600' : 'text-red-600'
            return (
              <div className={`flex items-center justify-between rounded-lg border px-4 py-2 ${color}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black ${textColor}`}>{total}</span>
                  <span className="text-sm font-medium">issues found</span>
                  {critical > 0 && <span className="text-xs text-red-600 font-medium">({critical} critical)</span>}
                </div>
                <button
                  onClick={() => document.getElementById('upgrade-cta-v3')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs px-3 py-1 rounded-md bg-geo/10 text-geo hover:bg-geo/20 font-medium transition-colors"
                >
                  See fixes →
                </button>
              </div>
            )
          })()}

          <Card id="upgrade-cta-v3" className="border-geo/30 bg-gradient-to-br from-geo/10 to-aeo/10 relative overflow-hidden">
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
                  <p className="text-xs text-muted-foreground mt-3">
                    See detailed fixes for this URL
                  </p>
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
