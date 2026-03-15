'use client'

import { useState } from 'react'
import { Activity, Layers, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { CrawlConfig } from '@/components/dashboard/crawl-config'
import { CrawlProgress } from '@/components/dashboard/crawl-progress'
import { MultiPageDashboard } from '@/components/dashboard/multi-page-dashboard'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { useSSEAnalysis } from '@/hooks/use-sse-analysis'

interface DeepScanResult {
  url: string
  analyzedAt: string
  siteTypeResult: {
    primaryType: string
    secondaryTypes: string[]
    confidence: number
  }
  pagesCrawled: number
  scores: {
    seo: number
    aeo: number
    geo: number
  }
  pages: Array<any>
  priorityMatrix: any
  contentGaps: any
  schemaCoverage: any
  crawlStats: {
    totalFound: number
    analyzed: number
    failed: number
  }
}

export default function DeepV3Page() {
  const [currentUrl, setCurrentUrl] = useState('')
  const sse = useSSEAnalysis<DeepScanResult>('/api/analyze-deep-v3')
  const [crawlConfig, setCrawlConfig] = useState({
    maxPages: 10,
    respectRobotsTxt: true
  })

  const handleAnalyze = async (submittedUrl: string) => {
    setCurrentUrl(submittedUrl)
    await sse.startAnalysis(submittedUrl, { maxPages: crawlConfig.maxPages })
  }

  const result = sse.data
  const isAnalyzing = sse.isAnalyzing
  const error = sse.error

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
              title="V3 Deep Scan"
              description="AI-powered multi-page analysis with context-aware scoring and comprehensive site audit."
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
              pageCount={result?.pagesCrawled || 0}
              siteType={result?.siteTypeResult ? {
                primaryType: result.siteTypeResult.primaryType,
                confidence: result.siteTypeResult.confidence
              } : undefined}
            />

            {/* Hero Section - Only show when no results */}
            {!result && !isAnalyzing && (
              <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Layers className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      The Ultimate SEO Audit
                    </CardTitle>
                    <CardDescription className="text-base max-w-2xl mx-auto">
                      Combines V3's AI-powered intelligence with multi-page deep crawling. 
                      Get context-aware scoring, actionable fixes, and comprehensive site analysis.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="max-w-2xl mx-auto space-y-6">
                  <CrawlConfig
                    onStartCrawl={(config) => handleAnalyze(config.url)}
                    isAnalyzing={isAnalyzing}
                  />
                  
                  {/* Beta Badge */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      <Sparkles className="h-3 w-3" />
                      BETA - AI-Powered Multi-Page Analysis
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What's Included Section */}
            {!result && !isAnalyzing && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Content Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gemini AI analyzes every page for tone, expertise, and content quality with context-aware scoring.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="h-5 w-5 text-purple-600" />
                      Multi-Page Crawling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Crawl up to 20 pages with schema coverage, content gaps, and internal link analysis.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Priority Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      See which pages need the most work with actionable fixes prioritized by impact.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Crawl Progress */}
            {isAnalyzing && (
              <Card className="border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                    <div className="text-center min-h-[48px]">
                      <h3 className="text-lg font-bold text-foreground">V3 Deep Scan in Progress</h3>
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
                {/* Aggregate Score Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="flex items-center justify-center p-6">
                    <CircularProgress
                      value={result.scores.seo}
                      variant="seo"
                      label="Avg SEO Score"
                      size={140}
                      strokeWidth={10}
                    />
                  </Card>

                  <Card className="flex items-center justify-center p-6">
                    <CircularProgress
                      value={result.scores.aeo}
                      variant="aeo"
                      label="Avg AEO Score"
                      size={140}
                      strokeWidth={10}
                    />
                  </Card>

                  <Card className="flex items-center justify-center p-6">
                    <CircularProgress
                      value={result.scores.geo}
                      variant="geo"
                      label="Avg GEO Score"
                      size={140}
                      strokeWidth={10}
                    />
                  </Card>
                </div>

                {/* Multi-Page Dashboard - Simplified for now */}
                <Card>
                  <CardHeader>
                    <CardTitle>Page Analysis Results</CardTitle>
                    <CardDescription>
                      Analyzed {result.pages.length} pages • {result.crawlStats.failed} failed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.pages.map((page, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium truncate">{page.title || page.url}</h4>
                            <div className="flex gap-2">
                              <span className="text-xs px-2 py-1 rounded bg-seo/10 text-seo">
                                SEO: {page.scores.seo.score}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-aeo/10 text-aeo">
                                AEO: {page.scores.aeo.score}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-geo/10 text-geo">
                                GEO: {page.scores.geo.score}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{page.url}</p>
                        </div>
                      ))}
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
