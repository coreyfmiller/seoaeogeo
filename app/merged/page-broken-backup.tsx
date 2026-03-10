"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { ScoreCard } from "@/components/dashboard/score-card"
import { SEOTab } from "@/components/dashboard/seo-tab"
import { AEOTab } from "@/components/dashboard/aeo-tab"
import { GEOTab } from "@/components/dashboard/geo-tab"
import { Recommendations } from "@/components/dashboard/recommendations"
import { FixInstructionCard } from "@/components/dashboard/fix-instruction-card"
import { PageComparisonTable } from "@/components/dashboard/page-comparison-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Sparkles,
  Bot,
  RefreshCw,
  XCircle,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function MergedDashboard() {
  const [activeTab, setActiveTab] = useState("seo")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
  const [scanMode, setScanMode] = useState<"quick" | "deep">("quick")

  // Restore state from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = sessionStorage.getItem("merged_dashboard_url")
      const savedData = sessionStorage.getItem("merged_dashboard_data")
      const savedMode = sessionStorage.getItem("merged_dashboard_mode")
      if (savedUrl) setCurrentUrl(savedUrl)
      if (savedData) setAnalysisData(JSON.parse(savedData))
      if (savedMode) setScanMode(savedMode as "quick" | "deep")
    }
  }, [])

  // Save state to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUrl) sessionStorage.setItem("merged_dashboard_url", currentUrl)
      if (analysisData) sessionStorage.setItem("merged_dashboard_data", JSON.stringify(analysisData))
      sessionStorage.setItem("merged_dashboard_mode", scanMode)
    }
  }, [currentUrl, analysisData, scanMode])

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentUrl(url)

    try {
      // Use analyze-site API with maxPages based on mode
      const maxPages = scanMode === "quick" ? 1 : 10
      
      const response = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxPages }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisData(result.data)
        setApiStatus("healthy")
        console.log('Merged Scan Successful:', result.data)
      } else {
        setError(result.error || 'Analysis failed. Please try again.')
        setApiStatus("error")
        console.error('Merged Scan Error:', result.error)
      }
    } catch (err: any) {
      setError('Connection failed. Ensure the server is running.')
      setApiStatus("error")
      console.error('Merged Crawler failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Extract scores from deep crawler data structure
  const scores = {
    seo: analysisData?.ai?.domainHealthScore ?? 0,
    aeo: analysisData?.ai?.aeoReadiness?.overallScore ?? 0,
    geo: analysisData?.ai?.consistencyScore ?? 0
  }

  const pagesCrawled = analysisData?.pagesCrawled ?? 0

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          currentUrl={currentUrl}
          apiStatus={apiStatus}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-geo" />
                    Merged Dashboard
                    <Badge variant="secondary" className="bg-geo/10 text-geo border-geo/20 px-3 py-1">
                      BETA
                    </Badge>
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Search className="h-4 w-4" />
                      {currentUrl || "No analysis active"}
                    </span>
                    {analysisData && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-geo/50 text-geo">
                          <Activity className="h-3 w-3 mr-1" />
                          Analysis Live
                        </Badge>
                        <Badge variant="outline" className="border-geo/50 text-geo bg-geo/5">
                          <CheckCircle2 className="h-3 w-3 mr-1.5" />
                          {pagesCrawled} {pagesCrawled === 1 ? 'Page' : 'Pages'} Scanned
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Scan Mode Toggle */}
                  <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                    <button
                      onClick={() => setScanMode("quick")}
                      disabled={isAnalyzing}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-all",
                        scanMode === "quick"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Quick Scan
                    </button>
                    <button
                      onClick={() => setScanMode("deep")}
                      disabled={isAnalyzing}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-all",
                        scanMode === "deep"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Deep Scan
                    </button>
                  </div>
                  {analysisData && (
                    <button
                      onClick={() => handleAnalyze(currentUrl)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-seo/50 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <XCircle className="h-5 w-5" />
                <div className="flex-1 text-sm font-medium">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs uppercase tracking-wider font-bold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {!analysisData && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
                <div className="h-20 w-20 bg-geo/10 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-geo animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3 text-center">
                  Unified Intelligence Analysis
                </h2>
                <p className="text-muted-foreground text-center max-w-lg mb-4 text-lg">
                  Choose Quick Scan (1 page) or Deep Scan (10-20 pages) for comprehensive analysis
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <Badge variant="outline" className="border-geo/30 text-geo">
                    <Zap className="h-3 w-3 mr-1" />
                    {scanMode === "quick" ? "Quick Mode: 1 Page" : "Deep Mode: 10-20 Pages"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="relative">
                {isAnalyzing && (
                  <div className="absolute inset-0 z-50 bg-background/20 backdrop-blur-[1px] flex items-start justify-center pt-20">
                    <div className="bg-card/90 border border-geo/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
                      <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-foreground">
                          {scanMode === "quick" ? "Quick Analysis" : "Deep Crawl"} in Progress
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {scanMode === "quick" 
                            ? "Analyzing single page..." 
                            : "Crawling multiple pages and analyzing patterns..."}
                        </p>
                      </div>
                      <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-geo animate-progress-fast" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div className={cn("flex flex-col xl:flex-row gap-6", isAnalyzing && "opacity-40 grayscale-[0.5] transition-all duration-700")}>
                  {/* Main Content Area */}
                  <div className="flex-1 min-w-0">
                    {/* Score Cards */}
                    <div className="grid gap-4 sm:grid-cols-3 mb-6">
                      <ScoreCard
                        title="SEO Score"
                        score={scores.seo}
                        variant="seo"
                        description="Global Connectivity"
                      />
                      <ScoreCard
                        title="AEO Score"
                        score={scores.aeo}
                        variant="aeo"
                        description="Snippet Coverage"
                      />
                      <ScoreCard
                        title="GEO Score"
                        score={scores.geo}
                        variant="geo"
                        description="Citation Visibility"
                      />
                    </div>

                    {/* 8 Stat Cards - Always visible */}
                    {analysisData && (() => {
                      const ai = analysisData.ai
                      const pages = analysisData.pages || []
                      
                      const h1Pct = pages.length > 0 ? Math.round((pages.filter((p: any) => p.hasH1).length / pages.length) * 100) : 0
                      const httpsPct = pages.length > 0 ? Math.round((pages.filter((p: any) => p.isHttps).length / pages.length) * 100) : 0
                      const schemaScore = ai?.schemaHealthAudit?.overallScore ?? 0
                      
                      const statCards = [
                        { label: "Pages Scanned", value: analysisData.pagesCrawled, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30", tip: "Unique pages crawled during session." },
                        { label: "Domain Health", value: `${ai?.domainHealthScore ?? 0}%`, color: "text-geo", border: "border-geo/30", bg: "bg-geo/5", tip: "Aggregate domain authority score." },
                        { label: "Brand Consistency", value: `${ai?.consistencyScore ?? 0}%`, color: "text-aeo", border: "border-aeo/30", bg: "bg-aeo/5", tip: "Brand cohesion across all crawled pages." },
                        { label: "Schema Coverage", value: `${ai?.authorityMetrics?.schemaCoverage ?? 0}%`, color: "text-seo", border: "border-seo/30", bg: "bg-seo/5", tip: "Percentage of pages with structured data present." },
                        { label: "Schema Quality", value: `${schemaScore}%`, color: schemaScore >= 70 ? "text-geo" : schemaScore >= 40 ? "text-yellow-600" : "text-destructive", border: schemaScore >= 70 ? "border-geo/30" : schemaScore >= 40 ? "border-yellow-500/30" : "border-destructive/30", bg: schemaScore >= 70 ? "bg-geo/5" : schemaScore >= 40 ? "bg-yellow-500/5" : "bg-destructive/5", tip: "Quality and completeness of structured data implementation." },
                        { label: "Metadata Health", value: `${ai?.authorityMetrics?.metadataOptimization ?? 0}%`, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30", tip: "Description and Title tag completeness." },
                        { label: "H1 Coverage", value: `${h1Pct}%`, color: h1Pct >= 90 ? "text-geo" : "text-destructive", border: h1Pct >= 90 ? "border-geo/20" : "border-destructive/20", bg: h1Pct >= 90 ? "bg-geo/5" : "bg-destructive/5", tip: "Percentage of pages with a valid H1 tag." },
                        { label: "HTTPS", value: `${httpsPct}%`, color: httpsPct === 100 ? "text-geo" : "text-destructive", border: httpsPct === 100 ? "border-geo/20" : "border-destructive/20", bg: httpsPct === 100 ? "bg-geo/5" : "bg-destructive/5", tip: "Security coverage across domain." },
                        { label: "Avg Response", value: `${Math.round(analysisData.avgResponseTime ?? 0)}ms`, color: "text-geo", border: "border-geo/30", bg: "bg-geo/5", tip: "Avg response time across all pages." },
                      ]
                      
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 mb-6 relative z-50">
                          {statCards.map(stat => (
                            <Card key={stat.label} className={cn("col-span-1 flex flex-col", stat.border, stat.bg)}>
                              <CardHeader className="pb-3 pt-4 px-4 flex-1 flex flex-col justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter leading-tight flex items-center gap-1 h-8 mb-1">
                                  <span className="line-clamp-2">{stat.label}</span>
                                  <div className="group relative inline-flex">
                                    <Activity className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-popover border border-border rounded-lg text-xs text-muted-foreground shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 leading-relaxed ring-1 ring-border/50">
                                      {stat.tip}
                                    </div>
                                  </div>
                                </CardDescription>
                                <CardTitle className={cn("text-2xl font-black leading-none", stat.color)}>{stat.value}</CardTitle>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      )
                    })()}

                    {/* Tabbed Interface */}
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="w-full sm:w-auto bg-muted/50 p-1">
                        <TabsTrigger
                          value="seo"
                          className={cn(
                            "gap-2 border border-transparent transition-all duration-200",
                            "hover:border-seo/30 hover:bg-seo/10 hover:text-seo cursor-pointer",
                            "data-[state=active]:border-seo/50 data-[state=active]:bg-seo/20 data-[state=active]:text-seo data-[state=active]:shadow-sm"
                          )}
                        >
                          <Search className="h-4 w-4" />
                          <span className="hidden sm:inline">SEO Analysis</span>
                          <span className="sm:hidden">SEO</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="aeo"
                          className={cn(
                            "gap-2 border border-transparent transition-all duration-200",
                            "hover:border-aeo/30 hover:bg-aeo/10 hover:text-aeo cursor-pointer",
                            "data-[state=active]:border-aeo/50 data-[state=active]:bg-aeo/20 data-[state=active]:text-aeo data-[state=active]:shadow-sm"
                          )}
                        >
                          <Sparkles className="h-4 w-4" />
                          <span className="hidden sm:inline">AEO Analysis</span>
                          <span className="sm:hidden">AEO</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="geo"
                          className={cn(
                            "gap-2 border border-transparent transition-all duration-200",
                            "hover:border-geo/30 hover:bg-geo/10 hover:text-geo cursor-pointer",
                            "data-[state=active]:border-geo/50 data-[state=active]:bg-geo/20 data-[state=active]:text-geo data-[state=active]:shadow-sm"
                          )}
                        >
                          <Bot className="h-4 w-4" />
                          <span className="hidden sm:inline">GEO Analysis</span>
                          <span className="sm:hidden">GEO</span>
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6">
                        <TabsContent value="seo" className="mt-0">
                          <SEOTab data={analysisData} />
                        </TabsContent>
                        <TabsContent value="aeo" className="mt-0">
                          <AEOTab data={analysisData} />
                        </TabsContent>
                        <TabsContent value="geo" className="mt-0">
                          <GEOTab data={analysisData} />
                        </TabsContent>
                      </div>
                    </Tabs>

                    {/* Deep Crawler Sections - Only show when data is available */}
                    {analysisData && (() => {
                      const ai = analysisData.ai
                      const pages = analysisData.pages || []
                      
                      return (
                        <div className="space-y-6 mt-6">
                          {/* Prioritized Site Improvements */}
                          {ai?.recommendations?.length > 0 && (
                            <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5">
                              <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-geo" />
                                    Prioritized Site Improvements
                                  </CardTitle>
                                  <CardDescription>Sitewide actions to unify authority and expand semantic reach</CardDescription>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {ai.recommendations.map((fix: any, i: number) => (
                                    <FixInstructionCard
                                      key={i}
                                      title={fix.title}
                                      category={fix.category || 'Medium Priority'}
                                      priority={fix.priority || fix.roi || 'MEDIUM'}
                                      steps={fix.steps || [{ step: 1, title: fix.title, description: fix.description }]}
                                      code={fix.code}
                                      platform={fix.platform || 'general'}
                                      estimatedTime={fix.estimatedTime || '30 minutes'}
                                      difficulty={fix.effort === 1 ? 'easy' : fix.effort === 3 ? 'difficult' : 'moderate'}
                                      impact={fix.impact || 'medium'}
                                      affectedPages={fix.affectedPages || 1}
                                      validationLinks={fix.validationLinks || []}
                                      onMarkComplete={() => {}}
                                      isCompleted={fix.completed || false}
                                    />
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Page Comparison Table - Only when multiple pages */}
                          {pagesCrawled > 1 && pages.length > 0 && (() => {
                            const pagesWithScores = pages.map((p: any) => {
                              const techScore = (p.hasH1 ? 30 : 0) + (p.isHttps ? 30 : 0) + (p.responseTimeMs < 1500 ? 40 : 20)
                              const contentScore = Math.min(100, (p.wordCount || 0) / 10)
                              const schemaScore = (p.schemas?.length || 0) > 0 ? 80 : 20
                              
                              const pageIssues = []
                              if (!p.hasH1) pageIssues.push({ type: 'Missing H1', severity: 'high', fix: 'Add a descriptive H1 heading to this page' })
                              if (!p.description) pageIssues.push({ type: 'Missing Meta Description', severity: 'high', fix: 'Add a meta description (120-160 characters)' })
                              if (p.wordCount < 300) pageIssues.push({ type: 'Thin Content', severity: 'medium', fix: `Expand content to at least 800 words (currently ${p.wordCount} words)` })
                              if (!p.schemas || p.schemas.length === 0) pageIssues.push({ type: 'No Schema Markup', severity: 'medium', fix: 'Add relevant schema.org structured data' })
                              if (p.responseTimeMs > 2000) pageIssues.push({ type: 'Slow Response Time', severity: 'medium', fix: `Optimize page speed (currently ${p.responseTimeMs}ms)` })
                              
                              return {
                                url: p.url,
                                title: p.title || 'Untitled Page',
                                seoScore: Math.round(techScore),
                                aeoScore: Math.round(contentScore),
                                geoScore: Math.round(schemaScore),
                                wordCount: p.wordCount || 0,
                                issueCount: pageIssues.length,
                                issues: pageIssues,
                                hasH1: p.hasH1 || false,
                                hasMetaDescription: !!p.description,
                                schemaCount: (p.schemas || []).length,
                                responseTimeMs: p.responseTimeMs || 0
                              }
                            })
                            
                            return <PageComparisonTable pages={pagesWithScores} />
                          })()}

                          {/* Keyword Cannibalization */}
                          {pagesCrawled > 1 && (
                            <Card className="border-destructive/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                  <AlertTriangle className="h-5 w-5" />
                                  Keyword Cannibalization Risks
                                </CardTitle>
                                <CardDescription>Pages competing against each other for the same topic</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {ai?.cannibalizationRisks && ai.cannibalizationRisks.length > 0 ? (
                                  <div className="space-y-3">
                                    {ai.cannibalizationRisks.map((risk: any, i: number) => (
                                      <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2">
                                        <Badge variant="outline" className="border-destructive/40 text-destructive text-xs">{risk.conflictingTopic || 'Competing Topic'}</Badge>
                                        <div className="flex flex-col gap-1">
                                          <p className="text-xs text-muted-foreground font-mono truncate">{risk.pageA}</p>
                                          <p className="text-xs text-muted-foreground font-mono truncate">{risk.pageB}</p>
                                        </div>
                                        {risk.recommendation && (
                                          <p className="text-xs text-foreground/80 leading-relaxed pt-2 border-t border-destructive/20">
                                            💡 {risk.recommendation}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                                    <CheckCircle2 className="h-8 w-8 text-geo" />
                                    <div>
                                      <p className="text-sm font-semibold text-geo">No Cannibalization Detected</p>
                                      <p className="text-xs text-muted-foreground mt-1">Your pages have distinct topics.</p>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

{/* ── Brand Health Audit ── */}
                                        {ai?.brandConsistencyBreakdown && (
                                            <Card className="border-aeo/20 bg-aeo/5">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="h-5 w-5 text-aeo" />
                                                            <CardTitle className="text-aeo">Brand Consistency Audit</CardTitle>
                                                            <InfoTooltip 
                                                                title="What is Brand Consistency?"
                                                                text="Measures how consistently your brand identity appears across all pages. Includes schema names (40%), title terms (30%), and description consistency (30%). Higher scores improve brand recognition and search engine trust."
                                                            />
                                                            <Badge className="bg-aeo/10 text-aeo border-aeo/30 text-xs font-black">
                                                                {ai.consistencyScore ?? 0} / 100
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CardDescription>Brand identity consistency across all crawled pages</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* AI Verdict Summary */}
                                                    {ai?.brandClarityVerdict && (
                                                        <div className="p-4 rounded-xl bg-gradient-to-br from-aeo/10 to-aeo/5 border border-aeo/30">
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <Sparkles className="h-5 w-5 text-aeo shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <h4 className="text-sm font-black uppercase tracking-wider text-aeo mb-2">AI Brand Cohesion Verdict</h4>
                                                                    <p className="text-sm font-medium leading-relaxed italic text-foreground/90">
                                                                        &ldquo;{ai.brandClarityVerdict}&rdquo;
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Topical Clusters */}
                                                            {ai?.topicalClusters && ai.topicalClusters.length > 0 && (
                                                                <div className="pt-3 border-t border-aeo/20">
                                                                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Detected Topic Clusters</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {ai.topicalClusters.map((topic: string) => (
                                                                            <div key={topic} className="flex items-center gap-1.5 bg-aeo/10 border border-aeo/20 rounded-full px-3 py-1 text-[10px] font-black text-aeo uppercase tracking-widest">
                                                                                <Zap className="h-2.5 w-2.5" />
                                                                                {topic}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Brand Breakdown Mini Stats */}
                                                    <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-background/60 border border-border/40">
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Schema Names</p>
                                                                <InfoTooltip text="Consistency of brand names in Organization/LocalBusiness schema across all pages. 100% = same name everywhere." />
                                                            </div>
                                                            <p className="text-lg font-black text-aeo">{ai.brandConsistencyBreakdown.schemaNameConsistency.score}%</p>
                                                        </div>
                                                        <div className="text-center border-l border-border/40">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Title Terms</p>
                                                                <InfoTooltip text="Common brand terms appearing in 50%+ of page titles. More consistent terms = stronger brand recognition." />
                                                            </div>
                                                            <p className="text-lg font-black text-aeo">{ai.brandConsistencyBreakdown.titleConsistency.score}%</p>
                                                        </div>
                                                        <div className="text-center border-l border-border/40">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Descriptions</p>
                                                                <InfoTooltip text="Consistency of meta description lengths across pages. Lower variance = more professional appearance in search results." />
                                                            </div>
                                                            <p className="text-lg font-black text-aeo">{ai.brandConsistencyBreakdown.descriptionConsistency.score}%</p>
                                                        </div>
                                                    </div>

                                                    {/* Issues and Strengths */}
                                                    {(() => {
                                                        const allIssues = [
                                                            ...ai.brandConsistencyBreakdown.schemaNameConsistency.issues.map((i: string) => ({ category: 'Schema Names', issue: i })),
                                                            ...ai.brandConsistencyBreakdown.titleConsistency.issues.map((i: string) => ({ category: 'Page Titles', issue: i })),
                                                            ...ai.brandConsistencyBreakdown.descriptionConsistency.issues.map((i: string) => ({ category: 'Meta Descriptions', issue: i }))
                                                        ];
                                                        
                                                        const allStrengths = [
                                                            ...ai.brandConsistencyBreakdown.schemaNameConsistency.strengths.map((s: string) => ({ category: 'Schema Names', strength: s })),
                                                            ...ai.brandConsistencyBreakdown.titleConsistency.strengths.map((s: string) => ({ category: 'Page Titles', strength: s })),
                                                            ...ai.brandConsistencyBreakdown.descriptionConsistency.strengths.map((s: string) => ({ category: 'Meta Descriptions', strength: s }))
                                                        ];

                                                        return (
                                                            <>
                                                                {allIssues.length > 0 && (
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                                            Issues Found
                                                                        </h4>
                                                                        {allIssues.map((item, idx) => (
                                                                            <div key={idx} className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                                                                                <div className="flex items-start gap-2">
                                                                                    <Badge variant="outline" className="text-[9px] font-bold bg-yellow-500/10 text-yellow-600 border-yellow-500/30 shrink-0">
                                                                                        {item.category}
                                                                                    </Badge>
                                                                                    <p className="text-xs text-foreground/90 leading-relaxed">{item.issue}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {allStrengths.length > 0 && (
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                                            <CheckCircle2 className="h-4 w-4 text-geo" />
                                                                            What's Working Well
                                                                        </h4>
                                                                        {allStrengths.map((item, idx) => (
                                                                            <div key={idx} className="p-3 rounded-lg border border-geo/30 bg-geo/5">
                                                                                <div className="flex items-start gap-2">
                                                                                    <Badge variant="outline" className="text-[9px] font-bold bg-geo/10 text-geo border-geo/30 shrink-0">
                                                                                        {item.category}
                                                                                    </Badge>
                                                                                    <p className="text-xs text-foreground/90 leading-relaxed">{item.strength}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {allIssues.length === 0 && allStrengths.length === 0 && (
                                                                    <div className="text-center py-8 text-muted-foreground">
                                                                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-geo" />
                                                                        <p className="text-sm font-semibold">Perfect Brand Consistency</p>
                                                                        <p className="text-xs mt-1">Your brand identity is consistent across all pages!</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── Row 2: Sitewide Insights + Content Gap ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-40">
                                            <Card className="border-border/50 bg-background/50">
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <TrendingUp className="h-5 w-5 text-geo" />
                                                            Sitewide Strategic Insights
                                                        </CardTitle>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const text = ai.sitewideInsights.map((i: any) => `[${i.impact.toUpperCase()}] ${i.title}\n${i.description}`).join('\n\n');
                                                            navigator.clipboard.writeText(text);
                                                            alert("Insights copied to clipboard!");
                                                        }}
                                                        className="bg-muted/50 hover:bg-muted border border-border/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors"
                                                    >
                                                        Copy Insights
                                                    </button>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        {ai?.sitewideInsights?.filter((insight: any) => insight && insight.impact && insight.title && insight.description).map((insight: any, i: number) => {
                                                            const impactConfig = {
                                                                critical: { 
                                                                    label: "CRITICAL", 
                                                                    bg: "bg-destructive/10", 
                                                                    text: "text-destructive", 
                                                                    ring: "ring-destructive/20",
                                                                    tooltip: "Urgent issue that significantly impacts SEO performance"
                                                                },
                                                                high: { 
                                                                    label: "HIGH", 
                                                                    bg: "bg-yellow-500/10", 
                                                                    text: "text-yellow-600", 
                                                                    ring: "ring-yellow-500/20",
                                                                    tooltip: "Important issue that should be addressed soon"
                                                                },
                                                                medium: { 
                                                                    label: "MEDIUM", 
                                                                    bg: "bg-blue-500/10", 
                                                                    text: "text-blue-600", 
                                                                    ring: "ring-blue-500/20",
                                                                    tooltip: "Moderate issue that can be addressed in regular maintenance"
                                                                }
                                                            };
                                                            const config = impactConfig[insight.impact as keyof typeof impactConfig] || impactConfig.medium;
                                                            
                                                            // Safety check - if config is still undefined, skip this insight
                                                            if (!config || !config.bg) {
                                                                console.warn('[SitewideInsights] Invalid impact config for insight:', insight);
                                                                return null;
                                                            }
                                                            
                                                            return (
                                                                <div key={i} className="p-4 rounded-xl border border-border/40 bg-background/50 hover:border-geo/30 transition-colors">
                                                                    <div className="flex items-start gap-3 mb-2">
                                                                        <div className={cn(
                                                                            "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ring-1 ring-inset",
                                                                            config.bg, config.text, config.ring
                                                                        )} title={config.tooltip}>
                                                                            {config.label} PRIORITY
                                                                        </div>
                                                                    </div>
                                                                    <h5 className="font-bold text-sm mb-1">{insight.title}</h5>
                                                                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-border/50">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5 text-aeo" />
                                                        Content Gap Analysis
                                                    </CardTitle>
                                                    <CardDescription>Missing pages that are weakening your domain authority</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    {ai?.contentGapAnalysis?.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {ai.contentGapAnalysis.map((gap: any, i: number) => (
                                                                <div key={i} className="flex gap-3 p-3 rounded-lg border border-aeo/20 bg-aeo/5">
                                                                    <AlertCircle className="h-4 w-4 text-aeo shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="text-sm font-semibold">{gap.missingPage}</p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">{gap.reason}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground italic">No major content gaps detected.</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* ── Competitor Gap Analysis (when competitor data exists) ── */}
                                        {analysisData.competitorAnalysis && (
                                            <CompetitorGapView
                                                gaps={analysisData.competitorAnalysis.gaps?.schemaGaps?.concat(
                                                    analysisData.competitorAnalysis.gaps?.contentGaps || [],
                                                    analysisData.competitorAnalysis.gaps?.structuralGaps || []
                                                ) || []}
                                                strengths={analysisData.competitorAnalysis.strengths || []}
                                                advantageScore={analysisData.competitorAnalysis.advantageScore || 50}
                                                quickWins={analysisData.competitorAnalysis.quickWins || []}
                                                competitorCount={analysisData.competitorAnalysis.competitors?.length || 0}
                                            />
                                        )}

                                        {/* ── Row 3: Cannibalization + Internal Link Leaders ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-30">
                                            <Card className="border-destructive/20 min-w-0">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                                        <AlertTriangle className="h-5 w-5" />
                                                        Keyword Cannibalization Risks
                                                    </CardTitle>
                                                    <CardDescription>Pages competing against each other for the same topic</CardDescription>
                                                </CardHeader>
                                                <CardContent className="min-w-0 overflow-hidden">
                                                    {ai?.cannibalizationRisks && ai.cannibalizationRisks.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {ai.cannibalizationRisks.map((risk: any, i: number) => (
                                                                <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2 min-w-0 overflow-hidden">
                                                                    <Badge variant="outline" className="border-destructive/40 text-destructive text-xs truncate max-w-full">{risk.conflictingTopic || 'Competing Topic'}</Badge>
                                                                    <div className="flex flex-col gap-1 min-w-0">
                                                                        <p className="text-xs text-muted-foreground font-mono truncate hover:text-foreground transition-colors cursor-help" title={risk.pageA}>{risk.pageA}</p>
                                                                        <p className="text-xs text-muted-foreground font-mono truncate hover:text-foreground transition-colors cursor-help" title={risk.pageB}>{risk.pageB}</p>
                                                                    </div>
                                                                    {risk.recommendation && (
                                                                        <p className="text-xs text-foreground/80 leading-relaxed pt-2 border-t border-destructive/20">
                                                                            💡 {risk.recommendation}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                                                            <CheckCircle2 className="h-8 w-8 text-geo" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-geo">No Cannibalization Detected</p>
                                                                <p className="text-xs text-muted-foreground mt-1">Your pages have distinct topics and aren't competing for the same keywords.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            <div className="space-y-6">
                                                <Card className="border-border/50 min-w-0">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Link2 className="h-5 w-5 text-seo" />
                                                            Internal Link Leaders
                                                        </CardTitle>
                                                        <CardDescription>Pages receiving the most internal equity</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-2">
                                                            {ai?.internalLinkLeaders?.map((link: string, i: number) => (
                                                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-seo/20 bg-seo/5 min-w-0 overflow-hidden">
                                                                    <span className="text-xs font-black text-seo w-5 shrink-0">#{i + 1}</span>
                                                                    <span className="text-xs font-mono text-muted-foreground truncate flex-1">{link}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {ai?.orphanPageRisks?.length > 0 && (
                                                    <Card className="border-border/50 bg-muted/20 min-w-0">
                                                        <CardHeader className="py-3 px-4">
                                                            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                                                <AlertCircle className="h-4 w-4" />
                                                                Potential Orphan Pages
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-0 px-4 pb-4">
                                                            <div className="space-y-1">
                                                                {ai.orphanPageRisks.map((url: string, i: number) => (
                                                                    <div key={i} className="text-[10px] font-mono text-muted-foreground truncate py-1 border-b border-border/20 last:border-0 hover:text-foreground transition-colors">
                                                                        {url}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>

                                        {/* ── New: Global Semantic Map (Architecture visualization) ── */}
                                        <SemanticMap pages={pages} clusters={ai?.topicalClusters || []} />

                                        {/* ── Row 4: Page-level Speed + Orphan Risks ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-20">
                                            <Card className="border-border/50">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <AlarmClock className="h-5 w-5 text-aeo" />
                                                        Page Speed Breakdown
                                                    </CardTitle>
                                                    <CardDescription>Response times across all crawled pages</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                                        {pages.map((p: any, i: number) => {
                                                            const ms = p.responseTimeMs || 0
                                                            const pct = Math.min((ms / 4000) * 100, 100)
                                                            const color = ms < 1000 ? "bg-geo" : ms < 2000 ? "bg-aeo" : "bg-destructive"
                                                            return (
                                                                <div key={i} className="space-y-1">
                                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                                        <span className="truncate max-w-[75%] font-mono">{new URL(p.url).pathname || "/"}</span>
                                                                        <span className={cn("font-bold", ms < 1000 ? "text-geo" : ms < 2000 ? "text-aeo" : "text-destructive")}>{ms}ms</span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                                        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <div className="flex gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-geo inline-block" />Fast (&lt;1s)</span>
                                                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-aeo inline-block" />OK (1-2s)</span>
                                                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive inline-block" />Slow (&gt;2s)</span>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-border/50">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <LayoutDashboard className="h-5 w-5 text-seo" />
                                                        Page Health Matrix
                                                    </CardTitle>
                                                    <CardDescription>Per-page structural signals from the crawl</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-border/50">
                                                                    <th className="text-left text-muted-foreground pb-2 font-medium">Page</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">H1</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Meta</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Schema</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">HTTPS</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Words</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Links</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border/30">
                                                                {pages.slice(0, 12).map((p: any, i: number) => (
                                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                                        <td className="py-2 font-mono truncate max-w-[120px]">{new URL(p.url).pathname || "/"}</td>
                                                                        <td className="py-2 text-center">
                                                                            {p.hasH1 ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className="py-2 text-center">
                                                                            {(p.title && p.description) ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className="py-2 text-center">
                                                                            {p.schemas?.length > 0 ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className="py-2 text-center">
                                                                            {p.isHttps ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className={cn("py-2 text-center font-mono text-xs", p.wordCount < 300 ? "text-destructive" : "text-foreground")}>{p.wordCount}</td>
                                                                        <td className="py-2 text-center font-mono text-xs text-muted-foreground">{p.internalLinks}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-destructive font-medium">
                                                        {thinPages.length > 0 && <span>⚠ {thinPages.length} thin page(s) &lt;300 words</span>}
                                                        {slowPages.length > 0 && <span>⚠ {slowPages.length} slow page(s) &gt;2s</span>}
                                                        {missingH1.length > 0 && <span>⚠ {missingH1.length} page(s) missing H1</span>}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* ── HTTPS Violations (conditional) ── */}
                                        {(() => {
                                            const httpViolations = pages.filter((p: any) => !p.isHttps)
                                            if (httpViolations.length === 0) return null
                                            return (
                                                <Card className="border-destructive/30 bg-destructive/5">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2 text-destructive">
                                                            <AlertTriangle className="h-5 w-5" />
                                                            HTTPS Violations Detected
                                                            <Badge variant="outline" className="ml-auto border-destructive/50 text-destructive">{httpViolations.length} insecure page{httpViolations.length > 1 ? 's' : ''}</Badge>
                                                        </CardTitle>
                                                        <CardDescription>These pages are being served over unencrypted HTTP. Google treats mixed-content sites as untrusted and may demote them in rankings.</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-2">
                                                            {httpViolations.map((p: any, i: number) => (
                                                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-destructive/20 bg-background/50">
                                                                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                                                    <span className="text-xs font-mono text-muted-foreground truncate">{p.url}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })()}

                                        {/* ── Row 5: Brand Consistency Analysis + Architecture + Schema ── */}
                                        {/* ── Expert Audits: Brand & Semantic Architecture ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-30">
                                            <Card className="border-geo/20 bg-geo/5 lg:col-span-2">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-geo">
                                                        <Target className="h-5 w-5" />
                                                        Navigation & Semantic Architecture
                                                    </CardTitle>
                                                    <CardDescription>Document hierarchy and internal linking flow audit</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm leading-relaxed text-foreground/80 italic border-l-2 border-geo/30 pl-4 py-1">
                                                        &ldquo;{ai?.navigationAnalysis || "Architecture audit underway."}&rdquo;
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* ── Robots.txt & Sitemap Status ── */}
                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Globe className="h-5 w-5 text-geo" />
                                                    Robots.txt & Sitemap Status
                                                </CardTitle>
                                                <CardDescription>Crawlability infrastructure check</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className={cn("flex items-center gap-3 p-4 rounded-xl border", analysisData?.robotsTxt?.exists ? "border-geo/30 bg-geo/5" : "border-destructive/30 bg-destructive/5")}>
                                                        {analysisData?.robotsTxt?.exists ? <CheckCircle2 className="h-5 w-5 text-geo shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                                                        <div>
                                                            <p className="text-sm font-bold">robots.txt</p>
                                                            <p className="text-xs text-muted-foreground">{analysisData?.robotsTxt?.exists ? "File found — crawler instructions present" : "Missing — all bots have unrestricted access"}</p>
                                                        </div>
                                                    </div>
                                                    <div className={cn("flex items-center gap-3 p-4 rounded-xl border", analysisData?.sitemap?.exists ? "border-geo/30 bg-geo/5" : "border-destructive/30 bg-destructive/5")}>
                                                        {analysisData?.sitemap?.exists ? <CheckCircle2 className="h-5 w-5 text-geo shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                                                        <div>
                                                            <p className="text-sm font-bold">sitemap.xml</p>
                                                            <p className="text-xs text-muted-foreground">{analysisData?.sitemap?.exists ? "Sitemap found — Google can discover all pages" : "Missing — Google must manually crawl to find pages"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* ── Heading Structure + Image Alt ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="border-border/50">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5 text-aeo" />
                                                        Heading Structure Analysis
                                                    </CardTitle>
                                                    <CardDescription>Document hierarchy depth across all crawled pages</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {[
                                                            { label: "H1 Coverage", pct: Math.round((pages.filter((p: any) => p.hasH1).length / Math.max(pages.length, 1)) * 100), count: pages.filter((p: any) => p.hasH1).length, color: "bg-geo", textColor: "text-geo", desc: "pages have an H1 heading" },
                                                            { label: "H2 Coverage", pct: Math.round((pagesWithH2 / Math.max(pages.length, 1)) * 100), count: pagesWithH2, color: "bg-aeo", textColor: "text-aeo", desc: "pages have H2 subheadings" },
                                                            { label: "H3 Coverage", pct: Math.round((pagesWithH3 / Math.max(pages.length, 1)) * 100), count: pagesWithH3, color: "bg-seo", textColor: "text-seo", desc: "pages have H3 subheadings" },
                                                        ].map(h => (
                                                            <div key={h.label} className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="font-bold">{h.label}</span>
                                                                    <span className={cn("font-black", h.textColor)}>{h.count} / {pages.length} pages</span>
                                                                </div>
                                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                                    <div className={cn("h-full rounded-full", h.color)} style={{ width: `${h.pct}%` }} />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground">{h.count} {h.desc}</p>
                                                            </div>
                                                        ))}
                                                        {flatPages.length > 0 && (
                                                            <div className="mt-2 p-3 rounded-lg border border-aeo/20 bg-aeo/5 text-xs text-aeo">
                                                                ⚠ {flatPages.length} page(s) have H1 but no H2 — &ldquo;flat&rdquo; content that AI models find hard to parse.
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className={cn("border-border/50", imgAltPct < 80 && "border-destructive/20")}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Activity className="h-5 w-5 text-seo" />
                                                        Image Alt Text Coverage
                                                        <Badge className={cn("ml-auto text-xs font-black", imgAltPct >= 90 ? "bg-geo/10 text-geo border-geo/30" : imgAltPct >= 70 ? "bg-aeo/10 text-aeo border-aeo/30" : "bg-destructive/10 text-destructive border-destructive/30")}>{imgAltPct}%</Badge>
                                                    </CardTitle>
                                                    <CardDescription>Accessibility & SEO image signal across the domain</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-xs mb-1.5">
                                                            <span className="text-muted-foreground">{imgsWithAlt} of {totalImgs} images have alt text</span>
                                                            <span className={cn("font-black", imgAltPct >= 90 ? "text-geo" : imgAltPct >= 70 ? "text-aeo" : "text-destructive")}>{imgAltPct}%</span>
                                                        </div>
                                                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                            <div className={cn("h-full rounded-full", imgAltPct >= 90 ? "bg-geo" : imgAltPct >= 70 ? "bg-aeo" : "bg-destructive")} style={{ width: `${imgAltPct}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                                        {pages.filter((p: any) => (p.imgTotal || 0) > 0).map((p: any, i: number) => {
                                                            const pct = p.imgTotal > 0 ? Math.round((p.imgWithAlt / p.imgTotal) * 100) : 100
                                                            return (
                                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                                    <span className="font-mono text-muted-foreground truncate flex-1">{new URL(p.url).pathname || "/"}</span>
                                                                    <span className={cn("font-bold shrink-0", pct === 100 ? "text-geo" : pct >= 70 ? "text-aeo" : "text-destructive")}>{p.imgWithAlt}/{p.imgTotal}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* ── Duplicate Title & Meta Detection ── */}
                                        {(duplicateTitles.length > 0 || duplicateMetas.length > 0) && (
                                            <Card className="border-destructive/30 bg-destructive/5">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                                        <AlertTriangle className="h-5 w-5" />
                                                        Duplicate Title & Meta Detection
                                                    </CardTitle>
                                                    <CardDescription>Pages sharing identical title tags or meta descriptions — a direct ranking penalty signal</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-5">
                                                    {duplicateTitles.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">Duplicate Titles ({duplicateTitles.length})</p>
                                                            <div className="space-y-2">
                                                                {duplicateTitles.map(([title, urls], i) => (
                                                                    <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-background/50">
                                                                        <p className="text-xs font-semibold mb-1.5 truncate">&ldquo;{title}&rdquo;</p>
                                                                        {urls.map((u, j) => <p key={j} className="text-[10px] font-mono text-muted-foreground truncate">↳ {u}</p>)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {duplicateMetas.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">Duplicate Meta Descriptions ({duplicateMetas.length})</p>
                                                            <div className="space-y-2">
                                                                {duplicateMetas.map(([meta, urls], i) => (
                                                                    <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-background/50">
                                                                        <p className="text-xs font-semibold mb-1.5 line-clamp-2">&ldquo;{meta}&rdquo;</p>
                                                                        {urls.map((u, j) => <p key={j} className="text-[10px] font-mono text-muted-foreground truncate">↳ {u}</p>)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                        {(duplicateTitles.length === 0 && duplicateMetas.length === 0 && pages.length > 0) && (
                                            <Card className="border-geo/20 bg-geo/5">
                                                <CardContent className="flex items-center gap-3 py-4">
                                                    <CheckCircle2 className="h-5 w-5 text-geo shrink-0" />
                                                    <p className="text-sm font-medium text-geo">No duplicate titles or meta descriptions detected across {pages.length} pages.</p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── AEO Citation Readiness ── */}
                                        {ai?.aeoReadiness && (
                                            <Card className="border-aeo/20 bg-aeo/5">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-aeo">
                                                        <Sparkles className="h-5 w-5" />
                                                        AEO Citation Readiness Score
                                                        <InfoTooltip 
                                                            title="What is AEO?"
                                                            text="Answer Engine Optimization - how ready your site is to be cited by AI assistants like ChatGPT, Perplexity, and Gemini. Measures presence of FAQ content, structured Q&A, expert signals, and clear topic focus."
                                                        />
                                                        <Badge className="ml-auto bg-aeo/10 text-aeo border-aeo/30 text-xs font-black">{ai.aeoReadiness.score} / 100</Badge>
                                                    </CardTitle>
                                                    <CardDescription>How ready this domain is to be cited by ChatGPT, Perplexity, and Gemini</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
                                                        {ai.aeoReadiness.signals && Object.entries(ai.aeoReadiness.signals).map(([key, val]: [string, any]) => {
                                                            const labels: Record<string, string> = {
                                                                hasAboutPage: "About Page", hasFaqContent: "FAQ Content", hasStructuredQa: "Q&A Structure",
                                                                hasAuthorOrExpertSignals: "Expert Signals", hasClearTopicFocus: "Topic Focus",
                                                                hasSchemaForAi: "AI Schema", hasLongformContent: "Long-form"
                                                            }
                                                            return (
                                                                <div key={key} className={cn("flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-center", val ? "border-aeo/30 bg-aeo/10" : "border-border/40 bg-muted/30")}>
                                                                    {val ? <CheckCircle2 className="h-4 w-4 text-aeo" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                                                                    <p className="text-[10px] font-medium leading-tight">{labels[key] || key}</p>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <p className="text-sm text-foreground/80 leading-relaxed italic border-t border-border/50 pt-4">&ldquo;{ai.aeoReadiness.verdict}&rdquo;</p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── E-E-A-T & Trust Audit ── */}
                                        {ai?.socialProofSignals && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-30">
                                                <Card className="border-border/50">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <ShieldCheck className="h-5 w-5 text-geo" />
                                                            E-E-A-T: Trust Signals Found
                                                        </CardTitle>
                                                        <CardDescription>Trust signals Google and AI models use to verify authority</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {ai.socialProofSignals.found?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {ai.socialProofSignals.found.map((s: string, i: number) => (
                                                                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-geo/20 bg-geo/5">
                                                                        <CheckCircle2 className="h-3.5 w-3.5 text-geo shrink-0" />
                                                                        <p className="text-xs">{s}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">No social proof signals detected on this domain.</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                                <Card className="border-border/50">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <AlertCircle className="h-5 w-5 text-aeo" />
                                                            Missing Trust Signals
                                                        </CardTitle>
                                                        <CardDescription>High-impact trust indicators your competitors likely have</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {ai.socialProofSignals.missing?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {ai.socialProofSignals.missing.map((s: string, i: number) => (
                                                                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-aeo/20 bg-aeo/5">
                                                                        <XCircle className="h-3.5 w-3.5 text-aeo shrink-0" />
                                                                        <p className="text-xs">{s}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-geo">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <p className="text-sm font-medium">Strong trust signal presence — no major gaps found.</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}


                                        {/* Start Over + PDF Export */}
                                        <div className="flex justify-between items-center pt-4 border-t border-border/50 no-print">
                                            <button
                                                onClick={() => { setAnalysisData(null); setUrl(""); sessionStorage.removeItem("pro_url"); sessionStorage.removeItem("pro_data"); }}
                                                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                                            >
                                                ← Start New Audit
                                            </button>
                                            <button
                                                onClick={handleExportPdf}
                                                className="flex items-center gap-2 bg-geo text-geo-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-geo/90 transition-all text-sm shadow-md"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Export PDF Report
                                            </button>
                                        </div>
                                        </>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                
                        </div>
                      )
                    })()}
                  </div>

                  {/* Recommendations Sidebar */}
                  <div className="w-full xl:w-80 shrink-0">
                    <Recommendations data={analysisData?.ai?.recommendations} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
