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
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("seo")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = sessionStorage.getItem("dashboard_url")
      const savedData = sessionStorage.getItem("dashboard_data")
      if (savedUrl) setCurrentUrl(savedUrl)
      if (savedData) setAnalysisData(JSON.parse(savedData))
    }
  }, [])

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUrl) sessionStorage.setItem("dashboard_url", currentUrl)
      if (analysisData) sessionStorage.setItem("dashboard_data", JSON.stringify(analysisData))
    }
  }, [currentUrl, analysisData])

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
                  <h1 className="text-2xl font-bold text-foreground">
                    Search Intelligence Dashboard
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
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 bg-seo text-seo-foreground px-6 py-2 rounded-xl font-bold hover:bg-seo/90 transition-all",
                      isAnalyzing && "animate-scan-glow opacity-70"
                    )}
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
                    {/* Score Cards */}
                    <div className="grid gap-4 sm:grid-cols-3 mb-6">
                      <ScoreCard
                        title="SEO Visibility"
                        score={scores.seo}
                        change={analysisData ? 0 : 0}
                        variant="seo"
                        description="Crawlability & Authority"
                      />
                      <ScoreCard
                        title="AEO Readiness"
                        score={scores.aeo}
                        change={analysisData ? 0 : 0}
                        variant="aeo"
                        description="Snippets & Knowledge Graph"
                      />
                      <ScoreCard
                        title="GEO Presence"
                        score={scores.geo}
                        change={analysisData ? 0 : 0}
                        variant="geo"
                        description="Citations & LLM Context"
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
