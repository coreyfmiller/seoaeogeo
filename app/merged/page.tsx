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
