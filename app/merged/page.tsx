"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { ScoreCard } from "@/components/dashboard/score-card"
import { SearchInput } from "@/components/dashboard/search-input"
import { SEOTab } from "@/components/dashboard/seo-tab"
import { AEOTab } from "@/components/dashboard/aeo-tab"
import { GEOTab } from "@/components/dashboard/geo-tab"
import { Recommendations } from "@/components/dashboard/recommendations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Search,
  Sparkles,
  Bot,
  Clock,
  RefreshCw,
  XCircle,
  Globe,
  CheckCircle2,
  Loader2,
  Activity,
  ShieldCheck,
  TrendingUp,
  Target,
  Link2,
  AlarmClock,
  LayoutDashboard,
  FileText,
  Code2,
  Info,
  Map,
  AlertCircle,
  Zap,
  AlertTriangle,
} from "lucide-react"
import { CrawlConfig } from "@/components/dashboard/crawl-config"
import { MultiPageDashboard } from "@/components/dashboard/multi-page-dashboard"
import { PageComparisonTable } from "@/components/dashboard/page-comparison-table"
import { FixInstructionCard } from "@/components/dashboard/fix-instruction-card"
import { SiteTypeBadge } from "@/components/dashboard/site-type-badge"
import { cn } from "@/lib/utils"

// Enhanced tooltip component
function InfoTooltip({ text, title }: { text: string; title?: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-aeo cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-popover border border-border rounded-lg text-xs shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 ring-1 ring-border/50">
        {title && <p className="font-bold text-foreground mb-1">{title}</p>}
        <p className="text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

export default function MergedDashboard() {
  const [activeTab, setActiveTab] = useState("seo")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
  const [scanMode, setScanMode] = useState<"quick" | "deep">("quick")

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = sessionStorage.getItem("merged_url")
      const savedData = sessionStorage.getItem("merged_data")
      const savedMode = sessionStorage.getItem("merged_scan_mode")
      if (savedUrl) setCurrentUrl(savedUrl)
      if (savedData) setAnalysisData(JSON.parse(savedData))
      if (savedMode) setScanMode(savedMode as "quick" | "deep")

      // Check for URL parameter in query string
      const params = new URLSearchParams(window.location.search)
      const urlParam = params.get('url')
      if (urlParam && urlParam !== savedUrl) {
        handleAnalyze(urlParam)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUrl) sessionStorage.setItem("merged_url", currentUrl)
      if (analysisData) sessionStorage.setItem("merged_data", JSON.stringify(analysisData))
      sessionStorage.setItem("merged_scan_mode", scanMode)
    }
  }, [currentUrl, analysisData, scanMode])

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentUrl(url)

    try {
      // Use different API based on scan mode
      const endpoint = scanMode === "deep" ? "/api/analyze-site" : "/api/analyze"
      const body = scanMode === "deep" 
        ? JSON.stringify({ url, maxPages: 10 })
        : JSON.stringify({ url })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisData(result.data)
        setApiStatus("healthy")
        console.log('Scan Successful:', result.data)
      } else {
        setError(result.error || 'Analysis failed. Please try again.')
        setApiStatus("error")
        console.error('Scan Error:', result.error)
      }
    } catch (err: any) {
      setError('Connection failed. Ensure the server is running.')
      setApiStatus("error")
      console.error('Crawler failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Use real data scores or default to 0
  const scores = analysisData?.ai?.scores || {
    seo: 0,
    aeo: 0,
    geo: 0
  }

  // Extract data for deep crawler sections
  const ai = analysisData?.ai
  const pages = analysisData?.pages || []
  const isDeepScan = analysisData?.pagesCrawled > 1

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
                    Merged Dashboard
                    <Badge variant="secondary" className="bg-geo/10 text-geo border-geo/20 px-3 py-1">
                      BETA
                    </Badge>
                    <Badge variant="secondary" className="bg-geo/10 text-geo border-geo/20 px-3 py-1">
                      PRO
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
                          <Clock className="h-3 w-3 mr-1" />
                          Analysis Live
                        </Badge>
                        <Badge variant="outline" className="border-geo/50 text-geo bg-geo/5">
                          <Activity className="h-3 w-3 mr-1.5" />
                          {analysisData.pagesCrawled || 1} Page{analysisData.pagesCrawled > 1 ? 's' : ''} Scanned
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Scan Mode Toggle */}
                {!isAnalyzing && (
                  <div className="flex items-center gap-3">
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
                  </div>
                )}

                {analysisData && (
                  <button
                    onClick={() => handleAnalyze(currentUrl)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-seo/50 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Analysis
                  </button>
                )}
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
                <div className="h-20 w-20 bg-seo/10 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-seo animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3 text-center">
                  Generate Intelligence Report
                </h2>
                <p className="text-muted-foreground text-center max-w-lg mb-4 text-lg">
                  Choose {scanMode === "quick" ? "Quick Scan (1 page)" : "Deep Scan (up to 10 pages)"} and enter any website URL to perform a comprehensive SEO, AEO, and GEO audit.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  {scanMode === "quick" 
                    ? "Quick scan analyzes a single page for immediate insights"
                    : "Deep scan crawls multiple pages for comprehensive site-wide analysis"}
                </p>
                <SearchInput
                  onSubmit={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  variant="large"
                  className="mx-auto"
                />
                {!isAnalyzing && (
                  <div className="mt-8 flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-geo" />
                      Real-time Crawling
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-aeo" />
                      Gemini 2.5 Analysis
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-geo" />
                      GEO/AEO Audits
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                {isAnalyzing && (
                  <div className="absolute inset-0 z-50 bg-background/20 backdrop-blur-[1px] flex items-start justify-center pt-20">
                    <div className="bg-card/90 border border-seo/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
                      <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-foreground">
                          {scanMode === "deep" ? "Deep Audit in Progress" : "Quick Scan in Progress"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {scanMode === "deep" 
                            ? "Crawling multiple pages and analyzing site-wide patterns..."
                            : "Analyzing content, schemas, and AI visibility..."}
                        </p>
                      </div>
                      <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-seo animate-progress-fast" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div className={cn("flex flex-col xl:flex-row gap-6", isAnalyzing && "opacity-40 grayscale-[0.5] transition-all duration-700")}>
                  {/* Main Content Area */}
                  <div className="flex-1 min-w-0">
                    {/* Score Cards - Always visible */}
                    <div className="grid gap-4 sm:grid-cols-3 mb-6">
                      <ScoreCard
                        title="SEO Score"
                        score={scores.seo}
                        change={0}
                        variant="seo"
                        description="Global Connectivity"
                      />
                      <ScoreCard
                        title="AEO Score"
                        score={scores.aeo}
                        change={0}
                        variant="aeo"
                        description="Snippet Coverage"
                      />
                      <ScoreCard
                        title="GEO Score"
                        score={scores.geo}
                        change={0}
                        variant="geo"
                        description="Citation Visibility"
                      />
                    </div>

                    {/* Tabbed Interface - Always visible */}
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

                    {/* Deep Crawler Sections - Only show for multi-page scans */}
                    {isDeepScan && (
                      <div className="mt-8 space-y-6">
                        {/* Multi-Page Dashboard */}
                        {analysisData.siteWideIssues && (
                          <MultiPageDashboard
                            pagesCrawled={analysisData.pagesCrawled}
                            aggregateScores={{
                              seo: Math.round(ai?.domainHealthScore || 0),
                              aeo: Math.round(ai?.aeoReadiness?.overallScore || 0),
                              geo: Math.round(ai?.consistencyScore || 0)
                            }}
                            siteWideIssues={analysisData.siteWideIssues}
                            totalWords={analysisData.totalWords || 0}
                            schemaCount={analysisData.schemaCount || 0}
                            orphanCount={ai?.orphanPageRisks?.length || 0}
                            duplicateCount={0}
                          />
                        )}

                        {/* Page Comparison Table */}
                        {pages.length > 0 && (() => {
                          const pagesWithScores = pages.map((p: any) => {
                            const techScore = (p.hasH1 ? 30 : 0) + (p.isHttps ? 30 : 0) + (p.responseTimeMs < 1500 ? 40 : 20)
                            const contentScore = Math.min(100, (p.wordCount || 0) / 10)
                            const schemaScore = (p.schemas?.length || 0) > 0 ? 80 : 20
                            
                            const pageIssues = []
                            if (!p.hasH1) pageIssues.push({ type: 'Missing H1', severity: 'high', fix: 'Add a descriptive H1 heading' })
                            if (!p.description) pageIssues.push({ type: 'Missing Meta Description', severity: 'high', fix: 'Add meta description' })
                            if (p.wordCount < 300) pageIssues.push({ type: 'Thin Content', severity: 'medium', fix: `Expand to 800+ words` })
                            
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

                        {/* Prioritized Fixes */}
                        {ai?.recommendations?.length > 0 && (
                          <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-geo" />
                                Prioritized Site Improvements
                              </CardTitle>
                              <CardDescription>
                                Sitewide actions to improve authority and visibility
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ai.recommendations.map((fix: any, i: number) => (
                                  <FixInstructionCard
                                    key={i}
                                    title={fix.title}
                                    category={fix.category || 'Medium Priority'}
                                    priority={fix.priority || 'MEDIUM'}
                                    steps={fix.steps || [{ step: 1, title: fix.title, description: fix.description }]}
                                    code={fix.code}
                                    platform={fix.platform || 'general'}
                                    estimatedTime={fix.estimatedTime || '30 minutes'}
                                    difficulty={fix.effort === 1 ? 'easy' : fix.effort === 3 ? 'difficult' : 'moderate'}
                                    impact={fix.impact || 'medium'}
                                    affectedPages={fix.affectedPages || 1}
                                    validationLinks={fix.validationLinks || []}
                                    onMarkComplete={() => {
                                      const updated = { ...analysisData }
                                      updated.ai.recommendations[i].completed = true
                                      setAnalysisData(updated)
                                    }}
                                    isCompleted={fix.completed || false}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recommendations Sidebar - Always visible */}
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
