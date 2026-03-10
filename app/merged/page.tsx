"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { ScoreCard } from "@/components/dashboard/score-card"
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
  AlertTriangle,
  Zap,
} from "lucide-react"
import { SemanticMap } from "@/components/dashboard/semantic-map"
import { CompetitorGapView } from "@/components/dashboard/competitor-gap-view"
import { FixInstructionCard } from "@/components/dashboard/fix-instruction-card"
import { PageComparisonTable } from "@/components/dashboard/page-comparison-table"
import { MultiPageDashboard } from "@/components/dashboard/multi-page-dashboard"
import { SiteTypeBadge } from "@/components/dashboard/site-type-badge"
import { CrawlConfig } from "@/components/dashboard/crawl-config"
import { CrawlProgress } from "@/components/dashboard/crawl-progress"
import { cn } from "@/lib/utils"

// Force dynamic rendering
export const dynamic = 'force-dynamic'


// Enhanced tooltip component with better visibility
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

// Simple tooltip component (kept for backward compatibility)
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

// Schema Issue Component
function SchemaIssueCard({ issue, index }: { issue: any; index: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const severityConfig = {
        critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", label: "CRITICAL" },
        high: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/30", label: "HIGH" },
        medium: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30", label: "MEDIUM" }
    };
    const config = severityConfig[issue.severity as keyof typeof severityConfig] || severityConfig.medium;

    const impactConfig = {
        high: { bg: "bg-destructive/10", text: "text-destructive", label: "High Impact" },
        medium: { bg: "bg-yellow-500/10", text: "text-yellow-600", label: "Medium Impact" },
        low: { bg: "bg-blue-500/10", text: "text-blue-600", label: "Low Impact" }
    };
    const impact = impactConfig[issue.modernCrawlerImpact as keyof typeof impactConfig] || impactConfig.medium;

    // Safety check - if config is invalid, skip rendering
    if (!config || !config.bg || !impact || !impact.bg) {
        console.warn('[SchemaIssueCard] Invalid config for issue:', issue);
        return null;
    }

    return (
        <div className={cn("p-4 rounded-xl border bg-background/60 transition-all", config.border)}>
            <div className="flex items-start gap-3">
                <div className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider shrink-0", config.bg, config.text)}>
                    {config.label}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                            <h5 className="font-bold text-sm mb-1">{issue.issue}</h5>
                            {issue.modernCrawlerImpact && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn("text-[9px] font-bold", impact.bg, impact.text)}>
                                        {impact.label}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px] font-mono">
                            -{issue.pointsDeducted ?? 0} pts
                        </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{issue.explanation}</p>
                    
                    {/* Affected Pages */}
                    <div className="mb-3">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5">
                            Affected Pages ({issue.affectedCount ?? issue.affectedPages?.length ?? 0})
                        </p>
                        <div className="space-y-1">
                            {issue.affectedPages?.slice(0, isExpanded ? undefined : 3).map((url: string, idx: number) => (
                                <div key={idx} className="text-xs font-mono text-muted-foreground/80 truncate bg-muted/30 px-2 py-1 rounded">
                                    {url}
                                </div>
                            ))}
                            {issue.affectedPages?.length > 3 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-[10px] font-bold text-seo hover:underline uppercase tracking-wider"
                                >
                                    {isExpanded ? "Show Less" : `Show ${issue.affectedPages.length - 3} More`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* How to Fix */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">How to Fix</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(issue.howToFix);
                                    alert("Fix instructions copied!");
                                }}
                                className="text-[9px] font-bold text-seo hover:underline uppercase tracking-wider"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed">{issue.howToFix}</p>
                    </div>
                </div>
            </div>
        </div>
    );
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
        // Clean up the URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUrl) sessionStorage.setItem("merged_url", currentUrl)
      if (analysisData) sessionStorage.setItem("merged_data", JSON.stringify(analysisData))
    }
  }, [currentUrl, analysisData, scanMode])
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("merged_scan_mode", scanMode)
    }
  }, [scanMode])

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentUrl(url)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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

  // Use real data scores or default to 0 for a clean start
  const scores = analysisData?.ai?.scores || {
    seo: 0,
    aeo: 0,
    geo: 0
  }

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
          apiStatus={apiStatus}
        />

        {/* Dashboard Content */}
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
                          1 Page Scanned
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                {!analysisData && !isAnalyzing && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground italic">Ready to optimize?</span>
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
                <p className="text-muted-foreground text-center max-w-lg mb-8 text-lg">
                  Enter any website URL to perform a comprehensive SEO, AEO, and GEO audit powered by Gemini 2.5 Flash.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const url = formData.get('url') as string;
                    if (url) handleAnalyze(url);
                  }}
                  className="w-full max-w-lg relative group"
                >
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-seo transition-colors" />
                  <input
                    name="url"
                    type="text"
                    placeholder="https://your-website.com"
                    className="w-full pl-12 pr-32 py-4 bg-muted/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50 transition-all text-lg"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-seo text-seo-foreground px-6 py-2 rounded-xl font-bold hover:bg-seo/90 transition-all"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scanning
                      </div>
                    ) : (
                      "Analyze"
                    )}
                  </button>
                </form>
                {isAnalyzing && (
                  <p className="mt-4 text-sm text-seo animate-pulse font-medium">
                    Our AI is currently crawling and analyzing {currentUrl}...
                  </p>
                )}
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
                        <h3 className="text-lg font-bold text-foreground">Deep Audit in Progress</h3>
                        <p className="text-sm text-muted-foreground">Analyzing content, schemas, and AI visibility...</p>
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
                    <div className="grid gap-4 sm:grid-cols-3 mb-6">
                      <ScoreCard
                        title="SEO Score"
                        score={scores.seo}
                        change={analysisData ? 0 : 0}
                        variant="seo"
                        description="Global Connectivity"
                      />
                      <ScoreCard
                        title="AEO Score"
                        score={scores.aeo}
                        change={analysisData ? 0 : 0}
                        variant="aeo"
                        description="Snippet Coverage"
                      />
                      <ScoreCard
                        title="GEO Score"
                        score={scores.geo}
                        change={analysisData ? 0 : 0}
                        variant="geo"
                        description="Citation Visibility"
                      />
                    </div>

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
                  </div>

                  {/* Deep Crawler Sections - Only show for multi-page crawls */}
                  {analysisData && analysisData.pagesCrawled > 1 && (() => {
                    // Computed variables for Deep Crawler sections
                    const pages = analysisData.pages || []
                    
                    const avgResponseTime = pages.length > 0
                        ? Math.round(pages.reduce((s: number, p: any) => s + (p.responseTimeMs || 0), 0) / pages.length)
                        : 0
                    const slowPages = pages.filter((p: any) => p.responseTimeMs > 2000)
                    const thinPages = pages.filter((p: any) => p.wordCount < 300)
                    const missingH1 = pages.filter((p: any) => !p.hasH1)
                    const pagesWithSchema = pages.filter((p: any) => p.schemas?.length > 0)

                    // Duplicate title / meta detection
                    const titleGroups = pages.reduce((acc: Record<string, string[]>, p: any) => {
                        if (p.title) { acc[p.title] = [...(acc[p.title] || []), p.url] }
                        return acc
                    }, {})
                    const duplicateTitles: [string, string[]][] = (Object.entries(titleGroups) as [string, string[]][]).filter(([, urls]) => urls.length > 1)

                    const metaGroups = pages.reduce((acc: Record<string, string[]>, p: any) => {
                        if (p.description) { acc[p.description] = [...(acc[p.description] || []), p.url] }
                        return acc
                    }, {})
                    const duplicateMetas: [string, string[]][] = (Object.entries(metaGroups) as [string, string[]][]).filter(([, urls]) => urls.length > 1)

                    // Image alt coverage
                    const totalImgs = pages.reduce((s: number, p: any) => s + (p.imgTotal || 0), 0)
                    const imgsWithAlt = pages.reduce((s: number, p: any) => s + (p.imgWithAlt || 0), 0)
                    const imgAltPct = totalImgs > 0 ? Math.round((imgsWithAlt / totalImgs) * 100) : 100

                    // Heading depth
                    const pagesWithH2 = pages.filter((p: any) => (p.h2Count || 0) > 0).length
                    const pagesWithH3 = pages.filter((p: any) => (p.h3Count || 0) > 0).length
                    const flatPages = pages.filter((p: any) => (p.h2Count || 0) === 0 && p.hasH1)

                    return (
                  <div className="space-y-6 mt-6">
{/* ── Prioritized Site Improvements ── */}
                                        {analysisData?.ai?.recommendations?.length > 0 && (
                                            <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5 relative z-10">
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Zap className="h-5 w-5 text-geo" />
                                                            Prioritized Site Improvements
                                                        </CardTitle>
                                                        <CardDescription>Sitewide actions to unify authority, prune crawl issues, and expand semantic reach</CardDescription>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="border-geo/30 text-geo font-black text-[10px] tracking-widest uppercase px-3 py-1 bg-geo/5">
                                                            Strategic Roadmap
                                                        </Badge>
                                                        <button
                                                            onClick={() => {
                                                                const text = analysisData.ai.recommendations.map((f: any) => `[RANK ${f.rank}] ${f.title}\nACTION: ${f.description}\nIMPACT: ${f.impact}`).join('\n\n');
                                                                navigator.clipboard.writeText(text);
                                                                alert("Roadmap copied to clipboard!");
                                                            }}
                                                            className="bg-background/50 hover:bg-background/80 border border-border/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            Copy Plan
                                                        </button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {analysisData.ai.recommendations.map((fix: any, i: number) => (
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
                                                                onMarkComplete={() => {
                                                                    const updated = { ...analysisData }
                                                                    updated.analysisData.ai.recommendations[i].completed = true
                                                                    setAnalysisData(updated)
                                                                }}
                                                                isCompleted={fix.completed || false}
                                                            />
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── Multi-Page Dashboard (when crawl depth > 1) ── */}
                                        {(() => {
                                            if (!analysisData.pagesCrawled || analysisData.pagesCrawled <= 1 || !analysisData.siteWideIssues || analysisData.pages.length === 0) return null
                                            
                                            // Use AI domain-level scores instead of per-page averages
                                            const seoScore = analysisData?.ai?.domainHealthScore || 0
                                            const aeoScore = analysisData?.ai?.aeoReadiness?.overallScore || 0
                                            const geoScore = analysisData?.ai?.consistencyScore || 0
                                            
                                            return (
                                                <MultiPageDashboard
                                                    pagesCrawled={analysisData.pagesCrawled}
                                                    aggregateScores={{
                                                        seo: Math.round(seoScore),
                                                        aeo: Math.round(aeoScore),
                                                        geo: Math.round(geoScore)
                                                    }}
                                                    siteWideIssues={analysisData.siteWideIssues}
                                                    totalWords={analysisData.totalWords || 0}
                                                    schemaCount={analysisData.schemaCount || 0}
                                                    orphanCount={analysisData?.ai?.orphanPageRisks?.length || 0}
                                                    duplicateCount={0}
                                                />
                                            )
                                        })()}

                                        {/* ── Page Comparison Table (when crawl depth > 1) ── */}
                                        {(() => {
                                            if (!analysisData.pagesCrawled || analysisData.pagesCrawled <= 1 || analysisData.pages.length === 0) return null
                                            
                                            // Calculate per-page scores based on technical metrics
                                            // Since we don't have individual AI scores, use deterministic metrics
                                            const pagesWithScores = analysisData.pages.map((p: any) => {
                                                const techScore = (p.hasH1 ? 30 : 0) + (p.isHttps ? 30 : 0) + (p.responseTimeMs < 1500 ? 40 : 20)
                                                const contentScore = Math.min(100, (p.wordCount || 0) / 10)
                                                const schemaScore = (p.schemas?.length || 0) > 0 ? 80 : 20
                                                
                                                // Generate per-page issues based on technical metrics
                                                const pageIssues = []
                                                if (!p.hasH1) pageIssues.push({ type: 'Missing H1', severity: 'high', fix: 'Add a descriptive H1 heading to this page' })
                                                if (!p.description) pageIssues.push({ type: 'Missing Meta Description', severity: 'high', fix: 'Add a meta description (120-160 characters)' })
                                                if (p.wordCount < 300) pageIssues.push({ type: 'Thin Content', severity: 'medium', fix: `Expand content to at least 800 words (currently ${p.wordCount} words)` })
                                                if (!p.schemas || p.schemas.length === 0) pageIssues.push({ type: 'No Schema Markup', severity: 'medium', fix: 'Add relevant schema.org structured data (Organization, Article, etc.)' })
                                                if (p.responseTimeMs > 2000) pageIssues.push({ type: 'Slow Response Time', severity: 'medium', fix: `Optimize page speed (currently ${p.responseTimeMs}ms, target <1500ms)` })
                                                if (p.imgTotal > 0 && p.imgWithAlt < p.imgTotal * 0.5) pageIssues.push({ type: 'Poor Image Alt Coverage', severity: 'low', fix: `Add alt text to ${p.imgTotal - p.imgWithAlt} images` })
                                                
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

                                        {/* ── Domain Health Breakdown ── */}
                                        <Card className="border-geo/20 bg-geo/5">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-geo">
                                                    <ShieldCheck className="h-5 w-5" />
                                                    Domain Health Breakdown
                                                    <InfoTooltip 
                                                        title="What is Domain Health?"
                                                        text="Aggregate score measuring overall site quality across 5 key areas: content depth, schema implementation, metadata optimization, technical performance, and site architecture. This is the foundation of your SEO authority."
                                                    />
                                                    <Badge className="ml-auto bg-geo/10 text-geo border-geo/30 text-xs font-black">{analysisData?.ai?.domainHealthScore ?? "–"} / 100</Badge>
                                                </CardTitle>
                                                <CardDescription>Detailed breakdown of what's affecting your domain authority score</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Individual Scores at Top */}
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pb-4 border-b border-border/50">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-black text-geo">{analysisData?.ai?.domainHealthBreakdown?.contentQuality ?? 0}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Content</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-black text-seo">{analysisData?.ai?.domainHealthBreakdown?.schemaQuality ?? 0}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Schema</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-black text-aeo">{analysisData?.ai?.domainHealthBreakdown?.metadataQuality ?? 0}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Metadata</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-black text-purple-500">{analysisData?.ai?.domainHealthBreakdown?.technicalHealth ?? 0}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Technical</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-black text-blue-500">{analysisData?.ai?.domainHealthBreakdown?.architectureHealth ?? 0}</p>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Architecture</p>
                                                    </div>
                                                </div>
                                                
                                                {[
                                                    {
                                                        label: "Content Quality",
                                                        desc: "Depth, substance, and value of page content",
                                                        pct: analysisData?.ai?.domainHealthBreakdown?.contentQuality ?? 0,
                                                        color: "text-geo",
                                                        bar: "bg-geo",
                                                        key: "contentQuality"
                                                    },
                                                    {
                                                        label: "Schema Quality",
                                                        desc: "Completeness and correctness of structured data",
                                                        pct: analysisData?.ai?.domainHealthBreakdown?.schemaQuality ?? 0,
                                                        color: "text-seo",
                                                        bar: "bg-seo",
                                                        key: "schemaQuality"
                                                    },
                                                    {
                                                        label: "Metadata Quality",
                                                        desc: "Optimization of titles and meta descriptions",
                                                        pct: analysisData?.ai?.domainHealthBreakdown?.metadataQuality ?? 0,
                                                        color: "text-aeo",
                                                        bar: "bg-aeo",
                                                        key: "metadataQuality"
                                                    },
                                                    {
                                                        label: "Technical Health",
                                                        desc: "H1 tags, HTTPS, and response performance",
                                                        pct: analysisData?.ai?.domainHealthBreakdown?.technicalHealth ?? 0,
                                                        color: "text-geo",
                                                        bar: "bg-geo",
                                                        key: "technicalHealth"
                                                    },
                                                    {
                                                        label: "Architecture",
                                                        desc: "Internal linking and navigation structure",
                                                        pct: analysisData?.ai?.domainHealthBreakdown?.architectureHealth ?? 0,
                                                        color: "text-geo",
                                                        bar: "bg-geo",
                                                        key: "architectureHealth"
                                                    },
                                                ].map(factor => {
                                                    const explanation = analysisData?.ai?.domainHealthExplanations?.[factor.key as keyof typeof analysisData.ai.domainHealthExplanations];
                                                    const hasIssues = explanation?.issues && explanation.issues.length > 0;
                                                    
                                                    return (
                                                        <div key={factor.label} className="p-4 rounded-xl border border-border/40 bg-background/60 space-y-3">
                                                            {/* Header with score */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="text-sm font-bold">{factor.label}</p>
                                                                        <span className={cn("text-lg font-black", factor.color)}>{factor.pct}%</span>
                                                                    </div>
                                                                    <p className="text-[10px] text-muted-foreground leading-snug">{factor.desc}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Progress bar */}
                                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                                <div className={cn("h-full rounded-full transition-all", factor.bar)} style={{ width: `${factor.pct}%` }} />
                                                            </div>
                                                            
                                                            {/* Detailed explanation */}
                                                            {explanation && (
                                                                <div className="space-y-2 pt-2 border-t border-border/30">
                                                                    {/* Issues */}
                                                                    {hasIssues && (
                                                                        <div className="space-y-1.5">
                                                                            <p className="text-[10px] font-black uppercase tracking-wider text-destructive flex items-center gap-1">
                                                                                <AlertTriangle className="h-3 w-3" />
                                                                                Issues Found ({explanation.issues.length})
                                                                            </p>
                                                                            {explanation.issues.map((issue: string, idx: number) => (
                                                                                <p key={idx} className="text-xs text-muted-foreground leading-relaxed pl-4 border-l-2 border-destructive/30">
                                                                                    • {issue}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Recommendations */}
                                                                    {explanation.recommendations && explanation.recommendations.length > 0 && (
                                                                        <div className="space-y-1.5">
                                                                            <p className="text-[10px] font-black uppercase tracking-wider text-geo flex items-center gap-1">
                                                                                <Target className="h-3 w-3" />
                                                                                How to Fix
                                                                            </p>
                                                                            {explanation.recommendations.map((rec: string, idx: number) => (
                                                                                <p key={idx} className="text-xs text-foreground/90 leading-relaxed pl-4 border-l-2 border-geo/30 bg-geo/5 py-1 rounded-r">
                                                                                    {rec}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Impact */}
                                                                    {explanation.impact && (
                                                                        <div className="p-2 rounded-lg bg-muted/50 border border-border/30">
                                                                            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Why This Matters</p>
                                                                            <p className="text-xs text-foreground/80 leading-relaxed italic">
                                                                                {explanation.impact}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>

                                        {/* ── Schema Health Audit ── */}
                                        {analysisData?.ai?.schemaHealthAudit && (
                                            <Card className="border-seo/20 bg-seo/5">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Code2 className="h-5 w-5 text-seo" />
                                                            <CardTitle className="text-seo">Schema Health Audit</CardTitle>
                                                            <InfoTooltip 
                                                                title="What is Schema Health?"
                                                                text="Schema markup (JSON-LD) helps search engines understand your content. This score measures completeness, correctness, and quality of your structured data implementation. Higher scores improve rich result eligibility and AI citation likelihood."
                                                            />
                                                            <Badge className="bg-seo/10 text-seo border-seo/30 text-xs font-black">
                                                                {analysisData.ai.schemaHealthAudit.overallScore ?? analysisData.ai.authorityMetrics?.schemaCoverage ?? 0} / 100
                                                            </Badge>
                                                        </div>
                                                        {analysisData.ai.schemaHealthAudit.issues && analysisData.ai.schemaHealthAudit.issues.length > 0 && (
                                                            <button
                                                                onClick={() => {
                                                                    const text = analysisData.ai.schemaHealthAudit.issues.map((issue: any) => {
                                                                        const pages = issue.affectedPages?.slice(0, 5).join('\n  - ') || 'N/A';
                                                                        const morePages = issue.affectedPages?.length > 5 ? `\n  - ...and ${issue.affectedPages.length - 5} more` : '';
                                                                        return `[${issue.severity.toUpperCase()}] ${issue.issue} (-${issue.pointsDeducted ?? 0} pts)\n\nExplanation:\n${issue.explanation}\n\nAffected Pages (${issue.affectedCount ?? issue.affectedPages?.length ?? 0}):\n  - ${pages}${morePages}\n\nHow to Fix:\n${issue.howToFix}`;
                                                                    }).join('\n\n' + '='.repeat(80) + '\n\n');
                                                                    navigator.clipboard.writeText(text);
                                                                    alert("All schema issues copied to clipboard!");
                                                                }}
                                                                className="bg-muted/50 hover:bg-muted border border-border/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors"
                                                            >
                                                                Copy All Issues
                                                            </button>
                                                        )}
                                                    </div>
                                                    <CardDescription>Detailed analysis of structured data issues and fixes</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* Schema Type Distribution */}
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-seo/10 to-seo/5 border border-seo/30">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <Code2 className="h-4 w-4 text-seo" />
                                                                <h4 className="text-sm font-black uppercase tracking-wider text-seo">Schema Type Distribution</h4>
                                                            </div>
                                                            <Badge className="bg-seo/20 text-seo border-seo/40 text-xs font-black">
                                                                {pagesWithSchema.length} / {pages.length} Pages
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-3">Structured data fingerprints detected across your site architecture</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {[...new Set(pages.flatMap((p: any) => p.schemaTypes || []))].map((type: any) => (
                                                                <Badge key={type} variant="outline" className="border-seo/30 text-seo bg-background font-bold text-xs px-3 py-1 shadow-sm">
                                                                    {type}
                                                                </Badge>
                                                            ))}
                                                            {pages.flatMap((p: any) => p.schemaTypes || []).length === 0 && (
                                                                <div className="flex flex-col items-center py-4 w-full text-center">
                                                                    <AlertCircle className="h-6 w-6 text-muted-foreground/30 mb-2" />
                                                                    <p className="text-xs text-muted-foreground italic">No structured data found. You are missing out on rich results and AI-engine knowledge graph inclusion.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Schema Breakdown Mini Stats */}
                                                    <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-background/60 border border-border/40">
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Coverage</p>
                                                                <InfoTooltip text="Percentage of pages with schema markup present. Higher coverage = more pages eligible for rich results." />
                                                            </div>
                                                            <p className="text-lg font-black text-seo">{analysisData.ai.schemaHealthAudit.breakdown?.coverage ?? 0}%</p>
                                                        </div>
                                                        <div className="text-center border-l border-border/40">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Quality</p>
                                                                <InfoTooltip text="Completeness and correctness of schema implementation. Checks for required properties, placeholder data, and validation errors." />
                                                            </div>
                                                            <p className="text-lg font-black text-seo">{analysisData.ai.schemaHealthAudit.breakdown?.quality ?? 0}%</p>
                                                        </div>
                                                        <div className="text-center border-l border-border/40">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Diversity</p>
                                                                <InfoTooltip text="Variety of schema types used (Organization, FAQPage, HowTo, etc.). More types = better coverage of different content types." />
                                                            </div>
                                                            <p className="text-lg font-black text-seo">{analysisData.ai.schemaHealthAudit.breakdown?.diversity ?? 0}%</p>
                                                        </div>
                                                    </div>

                                                    {/* Priority Fixes Section */}
                                                    {analysisData.ai.schemaHealthAudit.issues && analysisData.ai.schemaHealthAudit.issues.length > 0 && (() => {
                                                        const topIssues = [...analysisData.ai.schemaHealthAudit.issues]
                                                            .sort((a, b) => (b.pointsDeducted ?? 0) - (a.pointsDeducted ?? 0))
                                                            .slice(0, 3);
                                                        const totalPointsRecoverable = topIssues.reduce((sum, issue) => sum + (issue.pointsDeducted ?? 0), 0);
                                                        
                                                        return (
                                                            <div className="p-4 rounded-xl bg-gradient-to-br from-seo/10 to-geo/5 border border-seo/30">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="text-sm font-black uppercase tracking-wider text-seo flex items-center gap-2">
                                                                            <Zap className="h-4 w-4" />
                                                                            Priority Fixes
                                                                        </h4>
                                                                        <Badge className="bg-geo/20 text-geo border-geo/40 text-xs font-black">
                                                                            +{totalPointsRecoverable} pts available
                                                                        </Badge>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const text = topIssues.map((issue, idx) => {
                                                                                const pages = issue.affectedPages?.slice(0, 3).join('\n  - ') || 'N/A';
                                                                                const morePages = issue.affectedPages?.length > 3 ? `\n  - ...and ${issue.affectedPages.length - 3} more` : '';
                                                                                return `Priority ${idx + 1}: ${issue.issue} (-${issue.pointsDeducted ?? 0} pts)\n\nSeverity: ${issue.severity.toUpperCase()}\nAffected Pages: ${issue.affectedCount ?? issue.affectedPages?.length ?? 0}\n\nExplanation:\n${issue.explanation}\n\nAffected Pages:\n  - ${pages}${morePages}\n\nHow to Fix:\n${issue.howToFix}`;
                                                                            }).join('\n\n' + '='.repeat(80) + '\n\n');
                                                                            navigator.clipboard.writeText(`PRIORITY FIXES - Top ${topIssues.length} Issues\nPotential Score Recovery: +${totalPointsRecoverable} points\n\n${'='.repeat(80)}\n\n${text}`);
                                                                            alert("Priority fixes copied to clipboard!");
                                                                        }}
                                                                        className="bg-muted/50 hover:bg-muted border border-border/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors"
                                                                    >
                                                                        Copy All
                                                                    </button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mb-4">Fix these top issues to maximize your schema quality score</p>
                                                                <div className="space-y-3">
                                                                    {topIssues.map((issue, idx) => {
                                                                        const severityColors = {
                                                                            critical: "text-destructive",
                                                                            high: "text-yellow-600",
                                                                            medium: "text-blue-600"
                                                                        };
                                                                        const color = severityColors[issue.severity as keyof typeof severityColors] || "text-muted-foreground";
                                                                        
                                                                        return (
                                                                            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-background/80 border border-border/50">
                                                                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-seo/20 text-seo text-xs font-black shrink-0">
                                                                                    {idx + 1}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                                                        <h5 className={cn("text-sm font-bold", color)}>{issue.issue}</h5>
                                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                                            <Badge variant="outline" className="text-[10px] font-mono">
                                                                                                -{issue.pointsDeducted ?? 0} pts
                                                                                            </Badge>
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const pages = issue.affectedPages?.slice(0, 5).join('\n  - ') || 'N/A';
                                                                                                    const morePages = issue.affectedPages?.length > 5 ? `\n  - ...and ${issue.affectedPages.length - 5} more` : '';
                                                                                                    const text = `Priority ${idx + 1}: ${issue.issue}\n\nSeverity: ${issue.severity.toUpperCase()}\nPoints Deducted: -${issue.pointsDeducted ?? 0}\nAffected Pages: ${issue.affectedCount ?? issue.affectedPages?.length ?? 0}\n\nExplanation:\n${issue.explanation}\n\nAffected Pages:\n  - ${pages}${morePages}\n\nHow to Fix:\n${issue.howToFix}`;
                                                                                                    navigator.clipboard.writeText(text);
                                                                                                    alert(`Priority ${idx + 1} copied!`);
                                                                                                }}
                                                                                                className="text-[9px] font-bold text-seo hover:underline uppercase tracking-wider"
                                                                                            >
                                                                                                Copy
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <p className="text-xs text-muted-foreground mb-2">
                                                                                        {issue.affectedCount ?? issue.affectedPages?.length ?? 0} pages affected
                                                                                    </p>
                                                                                    <div className="flex items-start gap-2 p-2 rounded bg-muted/50 border border-border/30">
                                                                                        <Target className="h-3 w-3 text-geo shrink-0 mt-0.5" />
                                                                                        <p className="text-xs text-foreground/90 leading-relaxed">
                                                                                            <span className="font-semibold text-geo">Quick Fix:</span> {issue.howToFix.split('.')[0]}.
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Divider */}
                                                    {analysisData.ai.schemaHealthAudit.issues && analysisData.ai.schemaHealthAudit.issues.length > 0 && (
                                                        <div className="flex items-center gap-3 py-2">
                                                            <div className="flex-1 h-px bg-border/50"></div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">All Issues</p>
                                                            <div className="flex-1 h-px bg-border/50"></div>
                                                        </div>
                                                    )}

                                                    {/* Issues List */}
                                                    {analysisData.ai.schemaHealthAudit.issues && analysisData.ai.schemaHealthAudit.issues.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {analysisData.ai.schemaHealthAudit.issues.map((issue: any, i: number) => (
                                                                <SchemaIssueCard key={i} issue={issue} index={i} />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-muted-foreground">
                                                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-geo" />
                                                            <p className="text-sm font-semibold">No schema issues detected</p>
                                                            <p className="text-xs mt-1">Your structured data implementation looks solid!</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── Brand Health Audit ── */}
                                        {analysisData?.ai?.brandConsistencyBreakdown && (
                                            <Card className="border-aeo/20 bg-aeo/5">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="h-5 w-5 text-aeo" />
                                                            <CardTitle className="text-aeo">Brand Consistency Audit</CardTitle>
                                                            <InfoTooltip 
                                                                title="What is Brand Consistency?"
                                                                text="Measures how consistently your brand identity appears across all analysisData.pages. Includes schema names (40%), title terms (30%), and description consistency (30%). Higher scores improve brand recognition and search engine trust."
                                                            />
                                                            <Badge className="bg-aeo/10 text-aeo border-aeo/30 text-xs font-black">
                                                                {analysisData.ai.consistencyScore ?? 0} / 100
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CardDescription>Brand identity consistency across all crawled pages</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* AI Verdict Summary */}
                                                    {analysisData?.ai?.brandClarityVerdict && (
                                                        <div className="p-4 rounded-xl bg-gradient-to-br from-aeo/10 to-aeo/5 border border-aeo/30">
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <Sparkles className="h-5 w-5 text-aeo shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <h4 className="text-sm font-black uppercase tracking-wider text-aeo mb-2">AI Brand Cohesion Verdict</h4>
                                                                    <p className="text-sm font-medium leading-relaxed italic text-foreground/90">
                                                                        &ldquo;{analysisData.ai.brandClarityVerdict}&rdquo;
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Topical Clusters */}
                                                            {analysisData?.ai?.topicalClusters && analysisData.ai.topicalClusters.length > 0 && (
                                                                <div className="pt-3 border-t border-aeo/20">
                                                                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Detected Topic Clusters</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {analysisData.ai.topicalClusters.map((topic: string) => (
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
                                                                <InfoTooltip text="Consistency of brand names in Organization/LocalBusiness schema across all analysisData.pages. 100% = same name everywhere." />
                                                            </div>
                                                            <p className="text-lg font-black text-aeo">{analysisData.ai.brandConsistencyBreakdown.schemaNameConsistency.score}%</p>
                                                        </div>
                                                        <div className="text-center border-l border-border/40">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Title Terms</p>
                                                                <InfoTooltip text="Common brand terms appearing in 50%+ of page titles. More consistent terms = stronger brand recognition." />
                                                            </div>
                                                            <p className="text-lg font-black text-aeo">{analysisData.ai.brandConsistencyBreakdown.titleConsistency.score}%</p>
                                                        </div>
                                                        <div className="text-center border-l border-border/40">
                                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Descriptions</p>
                                                                <InfoTooltip text="Consistency of meta description lengths across analysisData.pages. Lower variance = more professional appearance in search results." />
                                                            </div>
                                                            <p className="text-lg font-black text-aeo">{analysisData.ai.brandConsistencyBreakdown.descriptionConsistency.score}%</p>
                                                        </div>
                                                    </div>

                                                    {/* Issues and Strengths */}
                                                    {(() => {
                                                        const allIssues = [
                                                            ...analysisData.ai.brandConsistencyBreakdown.schemaNameConsistency.issues.map((i: string) => ({ category: 'Schema Names', issue: i })),
                                                            ...analysisData.ai.brandConsistencyBreakdown.titleConsistency.issues.map((i: string) => ({ category: 'Page Titles', issue: i })),
                                                            ...analysisData.ai.brandConsistencyBreakdown.descriptionConsistency.issues.map((i: string) => ({ category: 'Meta Descriptions', issue: i }))
                                                        ];
                                                        
                                                        const allStrengths = [
                                                            ...analysisData.ai.brandConsistencyBreakdown.schemaNameConsistency.strengths.map((s: string) => ({ category: 'Schema Names', strength: s })),
                                                            ...analysisData.ai.brandConsistencyBreakdown.titleConsistency.strengths.map((s: string) => ({ category: 'Page Titles', strength: s })),
                                                            ...analysisData.ai.brandConsistencyBreakdown.descriptionConsistency.strengths.map((s: string) => ({ category: 'Meta Descriptions', strength: s }))
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
                                                            const text = analysisData.ai.sitewideInsights.map((i: any) => `[${i.impact.toUpperCase()}] ${i.title}\n${i.description}`).join('\n\n');
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
                                                        {analysisData?.ai?.sitewideInsights?.filter((insight: any) => insight && insight.impact && insight.title && insight.description).map((insight: any, i: number) => {
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
                                                    {analysisData?.ai?.contentGapAnalysis?.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {analysisData.ai.contentGapAnalysis.map((gap: any, i: number) => (
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
                                        {(() => {
                                            if (!analysisData.competitorAnalysis) return null
                                            
                                            return (
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
                                            )
                                        })()}

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
                                                    {analysisData?.ai?.cannibalizationRisks && analysisData.ai.cannibalizationRisks.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {analysisData.ai.cannibalizationRisks.map((risk: any, i: number) => (
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
                                                            {analysisData?.ai?.internalLinkLeaders?.map((link: string, i: number) => (
                                                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-seo/20 bg-seo/5 min-w-0 overflow-hidden">
                                                                    <span className="text-xs font-black text-seo w-5 shrink-0">#{i + 1}</span>
                                                                    <span className="text-xs font-mono text-muted-foreground truncate flex-1">{link}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {analysisData?.ai?.orphanPageRisks?.length > 0 && (
                                                    <Card className="border-border/50 bg-muted/20 min-w-0">
                                                        <CardHeader className="py-3 px-4">
                                                            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                                                <AlertCircle className="h-4 w-4" />
                                                                Potential Orphan Pages
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-0 px-4 pb-4">
                                                            <div className="space-y-1">
                                                                {analysisData.ai.orphanPageRisks.map((url: string, i: number) => (
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
                                        <SemanticMap pages={pages} clusters={analysisData?.ai?.topicalClusters || []} />

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
                                                        &ldquo;{analysisData?.ai?.navigationAnalysis || "Architecture audit underway."}&rdquo;
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
                                        {analysisData?.ai?.aeoReadiness && (
                                            <Card className="border-aeo/20 bg-aeo/5">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-aeo">
                                                        <Sparkles className="h-5 w-5" />
                                                        AEO Citation Readiness Score
                                                        <InfoTooltip 
                                                            title="What is AEO?"
                                                            text="Answer Engine Optimization - how ready your site is to be cited by AI assistants like ChatGPT, Perplexity, and Gemini. Measures presence of FAQ content, structured Q&A, expert signals, and clear topic focus."
                                                        />
                                                        <Badge className="ml-auto bg-aeo/10 text-aeo border-aeo/30 text-xs font-black">{analysisData.ai.aeoReadiness.score} / 100</Badge>
                                                    </CardTitle>
                                                    <CardDescription>How ready this domain is to be cited by ChatGPT, Perplexity, and Gemini</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
                                                        {analysisData.ai.aeoReadiness.signals && Object.entries(analysisData.ai.aeoReadiness.signals).map(([key, val]: [string, any]) => {
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
                                                    <p className="text-sm text-foreground/80 leading-relaxed italic border-t border-border/50 pt-4">&ldquo;{analysisData.ai.aeoReadiness.verdict}&rdquo;</p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── E-E-A-T & Trust Audit ── */}
                                        {analysisData?.ai?.socialProofSignals && (
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
                                                        {analysisData.ai.socialProofSignals.found?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {analysisData.ai.socialProofSignals.found.map((s: string, i: number) => (
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
                                                        {analysisData.ai.socialProofSignals.missing?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {analysisData.ai.socialProofSignals.missing.map((s: string, i: number) => (
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
                  </div>
                  )
                  })()}

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