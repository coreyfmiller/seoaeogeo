"use client"

import { useState } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("seo")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("https://searchiq.example.com")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
        console.log('Scan Successful:', result.data)
      } else {
        setError(result.error || 'Analysis failed. Please try again.')
        console.error('Scan Error:', result.error)
      }
    } catch (err: any) {
      setError('Connection failed. Ensure the server is running.')
      console.error('Crawler failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Use real data scores or default mock scores
  const scores = analysisData?.ai?.scores || {
    seo: 78,
    aeo: 85,
    geo: 62
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
                      {currentUrl}
                    </span>
                    <Badge variant="outline" className="border-geo/50 text-geo">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated 5 min ago
                    </Badge>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-seo/50 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </button>
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

            <div className="flex flex-col xl:flex-row gap-6">
              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {/* Score Cards */}
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <ScoreCard
                    title="SEO Visibility"
                    score={scores.seo}
                    change={analysisData ? 0 : 5}
                    variant="seo"
                    description="Crawlability & Authority"
                  />
                  <ScoreCard
                    title="AEO Readiness"
                    score={scores.aeo}
                    change={analysisData ? 0 : 12}
                    variant="aeo"
                    description="Snippets & Knowledge Graph"
                  />
                  <ScoreCard
                    title="GEO Presence"
                    score={scores.geo}
                    change={analysisData ? 0 : -3}
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
                        "gap-2 data-[state=active]:bg-seo/20 data-[state=active]:text-seo",
                        "data-[state=active]:shadow-none"
                      )}
                    >
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">SEO Analysis</span>
                      <span className="sm:hidden">SEO</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="aeo"
                      className={cn(
                        "gap-2 data-[state=active]:bg-aeo/20 data-[state=active]:text-aeo",
                        "data-[state=active]:shadow-none"
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">AEO Analysis</span>
                      <span className="sm:hidden">AEO</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="geo"
                      className={cn(
                        "gap-2 data-[state=active]:bg-geo/20 data-[state=active]:text-geo",
                        "data-[state=active]:shadow-none"
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
                      <AEOTab data={analysisData?.ai?.aeoAnalysis} />
                    </TabsContent>
                    <TabsContent value="geo" className="mt-0">
                      <GEOTab data={analysisData?.ai?.geoAnalysis} />
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
        </main>
      </div>
    </div>
  )
}
