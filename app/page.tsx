"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { ScoreCard } from "@/components/dashboard/score-card"
import { SearchInput } from "@/components/dashboard/search-input"
import { SEOTabEnhanced } from "@/components/dashboard/seo-tab-enhanced"
import { AEOTab } from "@/components/dashboard/aeo-tab"
import { GEOTab } from "@/components/dashboard/geo-tab"
import { AuditPageHeader } from "@/components/dashboard/audit-page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { downloadReport, copyReportToClipboard } from "@/lib/report-exporter"
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
  Download,
  Copy,
  Check,
  Lock,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("seo")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisPhase, setAnalysisPhase] = useState<string>("")
  const [analysisProgress, setAnalysisProgress] = useState<number>(0)
  const [currentUrl, setCurrentUrl] = useState("")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
  const [reportCopied, setReportCopied] = useState(false)
  const [isProUnlocked, setIsProUnlocked] = useState(true) // Temporarily unlocked for everyone

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsProUnlocked(localStorage.getItem("isProUnlocked") === "true")
      const savedUrl = sessionStorage.getItem("dashboard_url")
      const savedData = sessionStorage.getItem("dashboard_data")
      if (savedUrl) setCurrentUrl(savedUrl)
      if (savedData) setAnalysisData(JSON.parse(savedData))

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
      if (currentUrl) sessionStorage.setItem("dashboard_url", currentUrl)
      if (analysisData) sessionStorage.setItem("dashboard_data", JSON.stringify(analysisData))
    }
  }, [currentUrl, analysisData])

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentUrl(url)
    setAnalysisPhase("Initializing analysis...")
    setAnalysisProgress(0)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.body) {
        throw new Error('No response stream')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, '').trim()
          if (!dataLine) continue

          try {
            const event = JSON.parse(dataLine)

            if (event.type === 'progress') {
              setAnalysisPhase(event.phase)
              setAnalysisProgress(event.progress)
            } else if (event.type === 'result' && event.success) {
              setAnalysisData(event.data)
              setApiStatus("healthy")
              console.log('Scan Successful:', event.data)
            } else if (event.type === 'error') {
              setError(event.error || 'Analysis failed. Please try again.')
              setApiStatus("error")
              console.error('Scan Error:', event.error)
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      setError('Connection failed. Ensure the server is running.')
      setApiStatus("error")
      console.error('Crawler failed:', err)
    } finally {
      setIsAnalyzing(false)
      setAnalysisPhase("")
      setAnalysisProgress(0)
    }
  }

  // Use real data scores or default to 0 for a clean start
  const scores = analysisData?.ai?.scores || {
    seo: 0,
    aeo: 0,
    geo: 0
  }

  const handleExportReport = () => {
    if (!analysisData) return;
    
    try {
      const exportData = {
        url: currentUrl,
        timestamp: new Date().toLocaleString(),
        scores: analysisData.ai?.scores || { seo: 0, aeo: 0, geo: 0 },
        penalties: analysisData.ai?.enhancedPenalties || [],
        technical: analysisData.technical,
        structuralData: analysisData.structuralData
      };
      
      downloadReport(exportData);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleCopyReport = async () => {
    if (!analysisData) return;
    
    const exportData = {
      url: currentUrl,
      timestamp: new Date().toLocaleString(),
      scores: analysisData.ai?.scores || { seo: 0, aeo: 0, geo: 0 },
      penalties: analysisData.ai?.enhancedPenalties || [],
      technical: analysisData.technical,
      structuralData: analysisData.structuralData
    };
    
    const success = await copyReportToClipboard(exportData);
    if (success) {
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    }
  };

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
        <main className="flex-1 overflow-y-auto p-6">
          {!isProUnlocked ? (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-card/50 border border-border/50 rounded-3xl animate-in zoom-in-95 mt-4 max-w-2xl mx-auto shadow-lg">
              <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-center">Pro Feature Locked</h2>
              <p className="text-muted-foreground text-center text-lg mb-8 max-w-lg">
                Pro Audit provides detailed fix instructions, priority scoring, and comprehensive single-page analysis with AI-powered recommendations.
              </p>
              <p className="text-sm font-semibold text-green-500 animate-pulse tracking-wider uppercase border border-green-500/30 bg-green-500/10 px-6 py-3 rounded-full">
                ↑ Click &ldquo;Go Pro&rdquo; in the top right to unlock
              </p>
            </div>
          ) : (
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <AuditPageHeader
              title="Pro Audit"
              description="Comprehensive single-page analysis with AI-powered recommendations and priority scoring."
              badge="PRO"
              badgeVariant="pro"
              currentUrl={currentUrl}
              hasResults={!!analysisData}
              isAnalyzing={isAnalyzing}
              onNewAudit={() => {
                setAnalysisData(null)
                setCurrentUrl("")
                setError(null)
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("dashboard_url")
                  sessionStorage.removeItem("dashboard_data")
                }
              }}
              onRefreshAnalysis={() => handleAnalyze(currentUrl)}
              analysisData={analysisData}
              pageCount={1}
            />

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
              <Card className="border-seo/20 bg-gradient-to-br from-seo/5 to-aeo/5">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto h-16 w-16 bg-seo/10 rounded-2xl flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-seo" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">
                    Generate Intelligence Report
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    Enter any website URL to perform a comprehensive SEO, AEO, and GEO audit powered by Gemini 2.5 Flash.
                  </p>
                  <SearchInput
                    onSubmit={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    variant="large"
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                {isAnalyzing && (
                  <div className="absolute inset-0 z-50 bg-background/20 backdrop-blur-[1px] flex items-start justify-center pt-20">
                    <div className="bg-card/90 border border-seo/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 min-w-[400px]">
                      <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                      <div className="text-center min-h-[48px]">
                        <h3 className="text-lg font-bold text-foreground">Pro Audit in Progress</h3>
                        <p className="text-sm text-muted-foreground mt-1 transition-opacity duration-500">{analysisPhase || "Initializing analysis..."}</p>
                      </div>
                      <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-seo via-aeo to-geo transition-all duration-[1500ms] ease-in-out"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{analysisProgress}%</p>
                    </div>
                  </div>
                )}
                <div className={cn("flex flex-col gap-6", isAnalyzing && "opacity-40 grayscale-[0.5] transition-all duration-700")}>
                  {/* Score Cards */}
                  <div className="grid gap-4 sm:grid-cols-3">
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
                    defaultValue="seo"
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
                          "data-[state=active]:!border-seo/50 data-[state=active]:!bg-seo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold"
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
                          "data-[state=active]:!border-aeo/50 data-[state=active]:!bg-aeo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold"
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
                          "data-[state=active]:!border-geo/50 data-[state=active]:!bg-geo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold"
                        )}
                      >
                        <Bot className="h-4 w-4" />
                        <span className="hidden sm:inline">GEO Analysis</span>
                        <span className="sm:hidden">GEO</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                      <TabsContent value="seo" className="mt-0">
                        <SEOTabEnhanced data={analysisData} />
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
              </div>
            )}
          </div>
          )}
        </main>
      </div>
    </div>
  )
}
