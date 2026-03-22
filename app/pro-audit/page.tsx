'use client'

import { useState, useEffect } from 'react'
import { Zap, Search, Sparkles, Bot, CheckCircle2, Clock } from 'lucide-react'
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan } from '@/lib/scan-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/dashboard/search-input'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { SEOTabEnhanced } from '@/components/dashboard/seo-tab-enhanced'
import { AEOTab } from '@/components/dashboard/aeo-tab'
import { GEOTab } from '@/components/dashboard/geo-tab'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { useSSEAnalysis } from '@/hooks/use-sse-analysis'
import { CreditConfirmDialog } from '@/components/dashboard/credit-confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  // AI analysis from Gemini (same shape as Pro Audit)
  aiAnalysis?: {
    seoAnalysis?: any
    aeoAnalysis?: any
    geoAnalysis?: any
    schemaQuality?: any
    recommendations?: any[]
  }
  // Page data from crawler
  pageData?: {
    structuralData?: any
    technical?: any
    url?: string
    title?: string
  }
  cwv: {
    lcp: { value: number; category: string; displayValue: string; score: number } | null
    inp: { value: number; category: string; displayValue: string; score: number } | null
    cls: { value: number; category: string; displayValue: string; score: number } | null
    overallCategory: string
    performanceScore: number
  }
  analyzedAt: string
}

export default function V3Page() {
  const [url, setUrl] = useState('')
  const [currentUrl, setCurrentUrl] = useState('')
  const [activeTab, setActiveTab] = useState('seo')
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [pendingUrl, setPendingUrl] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const sse = useSSEAnalysis<AnalysisResult>('/api/analyze-v3')

  const handleAnalyze = async (submittedUrl: string) => {
    setPendingUrl(submittedUrl)
    setCreditDialogOpen(true)
  }

  const handleConfirmAnalyze = async () => {
    setCreditDialogOpen(false)
    setCurrentUrl(pendingUrl)
    await sse.startAnalysis(pendingUrl)
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

  // Recalculate scores when user confirms or changes site type
  const handleSiteTypeChange = async (newType: string) => {
    if (!result?.pageData) return
    try {
      const res = await fetch('/api/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanData: {
            ...result.pageData,
            schemas: result.pageData.structuralData?.schemas || result.aiAnalysis?.schemaQuality ? result.pageData.schemas : [],
            semanticFlags: result.aiAnalysis?.semanticFlags || {},
            schemaQuality: result.aiAnalysis?.schemaQuality,
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
        enhancedPenalties: recalc.enhancedPenalties,
        siteTypeResult: { ...result.siteTypeResult!, primaryType: newType },
      })
    } catch (e) {
      console.error('[V3] Recalculate failed:', e)
    }
  }

  // Recalculate penalties when user overrides the detected platform
  const handlePlatformChange = async (newPlatform: string) => {
    if (!result?.pageData) return
    try {
      const res = await fetch('/api/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanData: {
            ...result.pageData,
            schemas: result.pageData.structuralData?.schemas || result.aiAnalysis?.schemaQuality ? result.pageData.schemas : [],
            semanticFlags: result.aiAnalysis?.semanticFlags || {},
            schemaQuality: result.aiAnalysis?.schemaQuality,
            siteType: result.siteTypeResult?.primaryType,
          },
          siteType: result.siteTypeResult?.primaryType,
          platformOverride: newPlatform,
        }),
      })
      if (!res.ok) return
      const recalc = await res.json()
      sse.setData({
        ...result,
        enhancedPenalties: recalc.enhancedPenalties,
        platformDetection: {
          ...result.platformDetection,
          platform: newPlatform,
          label: newPlatform.charAt(0).toUpperCase() + newPlatform.slice(1),
        },
      })
    } catch (e) {
      console.error('[V3] Platform recalculate failed:', e)
    }
  }

  useEffect(() => {
    if (result && currentUrl) {
      saveScanToHistory({
        url: currentUrl,
        type: 'pro',
        scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score },
        timestamp: new Date().toISOString(),
      }, result)
    }
  }, [result, currentUrl])

  useEffect(() => {
    const entry = consumeLoadFromHistory()
    if (entry && entry.type === 'pro') {
      const full = getFullScanResult(entry)
      if (full) {
        setCurrentUrl(entry.url)
        sse.setData(full)
        return
      }
    }
    const latest = getLatestFullScan('pro')
    if (latest) {
      setCurrentUrl(latest.entry.url)
      sse.setData(latest.result)
    }
  }, [])

  // Map V3 result data into the shape the Pro Audit tab components expect
  const tabData = result ? {
    technical: result.pageData?.technical || {
      isHttps: true,
      status: 200,
      responseTimeMs: 0
    },
    structuralData: result.pageData?.structuralData || {
      semanticTags: { article: 0, main: 0, nav: 0, aside: 0, headers: 0 },
      links: { internal: 0, external: 0 },
      media: { totalImages: 0, imagesWithAlt: 0 },
      wordCount: 0
    },
    ai: {
      scores: {
        seo: result.scores.seo.score,
        aeo: result.scores.aeo.score,
        geo: result.scores.geo.score
      },
      enhancedPenalties: result.enhancedPenalties || [],
      seoAnalysis: result.aiAnalysis?.seoAnalysis || {
        onPageIssues: [],
        keywordOpportunities: [],
        contentQuality: 'fair',
        metaAnalysis: ''
      },
      aeoAnalysis: result.aiAnalysis?.aeoAnalysis || {
        questionsAnswered: { who: 0, what: 0, where: 0, why: 0, how: 0 },
        missingSchemas: [],
        snippetEligibilityScore: 0,
        topOpportunities: []
      },
      geoAnalysis: result.aiAnalysis?.geoAnalysis || {
        sentimentScore: 0,
        brandPerception: 'neutral' as const,
        citationLikelihood: 0,
        llmContextClarity: 0,
        visibilityGaps: []
      }
    }
  } : undefined

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
          placeholder="Enter URL for Pro Audit..."
          buttonLabel="Pro Audit"
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto px-6 pt-6">
          <div className="max-w-7xl mx-auto space-y-6 pb-6 overflow-hidden">
      
      {/* Page Header with Actions */}
      <AuditPageHeader
        title="Pro Audit"
        description="AI-powered scoring with site-type-specific analysis for 95% accuracy."
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
        platformDetection={result?.platformDetection}
        onSiteTypeConfirm={handleSiteTypeChange}
        onSiteTypeChange={handleSiteTypeChange}
        onPlatformChange={handlePlatformChange}
      />

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="space-y-8 animate-in fade-in zoom-in-95">
          <Card className="border-2 border-seo/20 bg-gradient-to-br from-seo/5 via-aeo/5 to-geo/5 overflow-hidden relative">
            {/* Animated gradient bar at top */}
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
                  <h2 className="text-2xl font-bold text-foreground">Pro Audit in Progress</h2>
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
              { icon: <Search className="h-5 w-5" />, label: "Crawling Site", desc: "Extracting content, metadata, and technical signals", threshold: 10 },
              { icon: <Sparkles className="h-5 w-5" />, label: "AI Analysis", desc: "Gemini analyzing content quality, schema, and structure", threshold: 40 },
              { icon: <Bot className="h-5 w-5" />, label: "Scoring & Grading", desc: "Calculating SEO, AEO, and GEO scores with penalties", threshold: 70 },
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

      {/* Hero Section - Only show when no results */}
      {!result && !isAnalyzing && (
      <Card className="border-2 border-seo/20 bg-gradient-to-br from-seo/5 to-transparent">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-seo/10 flex items-center justify-center">
            <Zap className="h-8 w-8 text-seo" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">
              Best-in-Class SEO/AEO/GEO Scoring
            </CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              AI-powered scoring with site-type-specific analysis for the most accurate audits.
              Built for the 2026 search landscape.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="max-w-4xl mx-auto">
          <SearchInput
            onSubmit={handleAnalyze}
            isAnalyzing={isAnalyzing}
            placeholder="Enter website URL to audit..."
            variant="large"
          />
        </CardContent>
      </Card>
      )}

      {/* What's New Section */}
      {!result && !isAnalyzing && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gemini AI analyzes tone, expertise, claims, and content quality for accurate AEO/GEO scoring.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Site Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Auto-detects your site type and platform (WordPress, Shopify, etc.) to deliver tailored scoring and platform-specific fix instructions.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actionable Fixes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Step-by-step instructions with explanations for every issue found.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Confirmation Dialog */}
      <CreditConfirmDialog
        open={creditDialogOpen}
        onConfirm={handleConfirmAnalyze}
        onCancel={() => setCreditDialogOpen(false)}
        creditCost={10}
        scanType="Pro Audit"
        costBreakdown="10 credits per Pro Audit scan"
      />

      {/* Error Popup */}
      <ScanErrorDialog error={error} onClose={() => sse.reset()} onRetry={() => handleAnalyze(currentUrl)} />

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Score Cards with Circular Progress */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex items-center justify-center p-6">
              <div className="flex flex-col items-center gap-1">
                <CircularProgress
                  value={result.scores.seo.score}
                  variant="seo"
                  label="SEO Score"
                  size={140}
                  strokeWidth={10}
                />
                <InfoTooltip content="Search Engine Optimization score measuring technical SEO, content quality, metadata, and crawlability against 2026 standards." />
              </div>
            </Card>

            <Card className="flex items-center justify-center p-6">
              <div className="flex flex-col items-center gap-1">
                <CircularProgress
                  value={result.scores.aeo.score}
                  variant="aeo"
                  label="AEO Score"
                  size={140}
                  strokeWidth={10}
                />
                <InfoTooltip content="Answer Engine Optimization score measuring how likely AI assistants (ChatGPT, Perplexity, Gemini) are to cite your content as a source." />
              </div>
            </Card>

            <Card className="flex items-center justify-center p-6">
              <div className="flex flex-col items-center gap-1">
                <CircularProgress
                  value={result.scores.geo.score}
                  variant="geo"
                  label="GEO Score"
                  size={140}
                  strokeWidth={10}
                />
                <InfoTooltip content="Generative Engine Optimization score measuring how well your content is structured for AI-generated search results and summaries." />
              </div>
            </Card>
          </div>

          {/* Tabbed SEO / AEO / GEO Analysis */}
          <Tabs
            defaultValue="seo"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full sm:w-auto bg-muted/50 p-1">
              <TabsTrigger
                value="seo"
                className={cn(
                  "gap-2 border transition-all duration-200",
                  "border-seo/10 bg-seo/5 text-seo/40 cursor-pointer",
                  "hover:border-seo/30 hover:bg-seo/10 hover:text-seo/60",
                  "data-[state=active]:!border-seo/50 data-[state=active]:!bg-seo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100"
                )}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">SEO Analysis</span>
                <span className="sm:hidden">SEO</span>
              </TabsTrigger>
              <TabsTrigger
                value="aeo"
                className={cn(
                  "gap-2 border transition-all duration-200",
                  "border-aeo/10 bg-aeo/5 text-aeo/40 cursor-pointer",
                  "hover:border-aeo/30 hover:bg-aeo/10 hover:text-aeo/60",
                  "data-[state=active]:!border-aeo/50 data-[state=active]:!bg-aeo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100"
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AEO Analysis</span>
                <span className="sm:hidden">AEO</span>
              </TabsTrigger>
              <TabsTrigger
                value="geo"
                className={cn(
                  "gap-2 border transition-all duration-200",
                  "border-[#fe3f8c]/10 bg-[#fe3f8c]/5 text-[#fe3f8c]/40 cursor-pointer",
                  "hover:border-[#fe3f8c]/30 hover:bg-[#fe3f8c]/10 hover:text-[#fe3f8c]/60",
                  "data-[state=active]:!border-[#fe3f8c]/50 data-[state=active]:!bg-[#fe3f8c] data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100"
                )}
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">GEO Analysis</span>
                <span className="sm:hidden">GEO</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="seo" className="mt-0">
                <SEOTabEnhanced data={tabData} />
              </TabsContent>
              <TabsContent value="aeo" className="mt-0">
                <AEOTab data={tabData} />
              </TabsContent>
              <TabsContent value="geo" className="mt-0">
                <GEOTab data={tabData} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Core Web Vitals */}
          {result.cwv && (
            <Card className="border-[#842ce0]/20 bg-[#842ce0]/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5 text-[#842ce0]" />
                  Core Web Vitals
                  <InfoTooltip content="Google's Core Web Vitals measure real-world user experience — loading speed (LCP), interactivity (INP), and visual stability (CLS). These are direct ranking signals that affect your position in search results." />
                  <span className="ml-auto text-sm font-black text-[#842ce0]">{result.cwv.performanceScore}/100</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {result.cwv.lcp && (
                    <div className={`rounded-lg border p-4 text-center ${
                      result.cwv.lcp.category === 'FAST' ? 'border-green-500/30 bg-green-500/5' :
                      result.cwv.lcp.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5' :
                      'border-yellow-500/30 bg-yellow-500/5'
                    }`}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
                        LCP
                        <InfoTooltip content="Largest Contentful Paint — measures loading performance. How long until the largest visible element (image, heading, or text block) renders on screen. Under 2.5s is good, over 4s is poor. This is the most impactful Core Web Vital for perceived speed." className="[&_svg]:h-3 [&_svg]:w-3" />
                      </p>
                      <p className={`text-2xl font-black ${
                        result.cwv.lcp.category === 'FAST' ? 'text-green-600' :
                        result.cwv.lcp.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'
                      }`}>{result.cwv.lcp.displayValue}</p>
                      <p className={`text-[10px] font-bold uppercase mt-1 ${
                        result.cwv.lcp.category === 'FAST' ? 'text-green-600' :
                        result.cwv.lcp.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'
                      }`}>{result.cwv.lcp.category}</p>
                    </div>
                  )}
                  {result.cwv.inp && (
                    <div className={`rounded-lg border p-4 text-center ${
                      result.cwv.inp.category === 'FAST' ? 'border-green-500/30 bg-green-500/5' :
                      result.cwv.inp.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5' :
                      'border-yellow-500/30 bg-yellow-500/5'
                    }`}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
                        INP
                        <InfoTooltip content="Interaction to Next Paint — measures responsiveness. How long until the page visually responds after a user clicks, taps, or presses a key. Under 200ms is good, over 500ms is poor. Slow INP makes your site feel sluggish and unresponsive." className="[&_svg]:h-3 [&_svg]:w-3" />
                      </p>
                      <p className={`text-2xl font-black ${
                        result.cwv.inp.category === 'FAST' ? 'text-green-600' :
                        result.cwv.inp.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'
                      }`}>{result.cwv.inp.displayValue}</p>
                      <p className={`text-[10px] font-bold uppercase mt-1 ${
                        result.cwv.inp.category === 'FAST' ? 'text-green-600' :
                        result.cwv.inp.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'
                      }`}>{result.cwv.inp.category}</p>
                    </div>
                  )}
                  {result.cwv.cls && (
                    <div className={`rounded-lg border p-4 text-center ${
                      result.cwv.cls.category === 'FAST' ? 'border-green-500/30 bg-green-500/5' :
                      result.cwv.cls.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5' :
                      'border-yellow-500/30 bg-yellow-500/5'
                    }`}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
                        CLS
                        <InfoTooltip content="Cumulative Layout Shift — measures visual stability. How much the page layout unexpectedly shifts during loading (buttons moving, text jumping, images pushing content down). Under 0.1 is good, over 0.25 is poor. High CLS causes accidental clicks and frustrates users." className="[&_svg]:h-3 [&_svg]:w-3" />
                      </p>
                      <p className={`text-2xl font-black ${
                        result.cwv.cls.category === 'FAST' ? 'text-green-600' :
                        result.cwv.cls.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'
                      }`}>{result.cwv.cls.displayValue}</p>
                      <p className={`text-[10px] font-bold uppercase mt-1 ${
                        result.cwv.cls.category === 'FAST' ? 'text-green-600' :
                        result.cwv.cls.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'
                      }`}>{result.cwv.cls.category}</p>
                    </div>
                  )}
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
