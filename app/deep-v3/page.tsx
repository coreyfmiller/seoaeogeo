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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DeepScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [crawlConfig, setCrawlConfig] = useState({
    maxPages: 10,
    respectRobotsTxt: true
  })
  const [crawlProgress, setCrawlProgress] = useState({
    current: 0,
    total: 0,
    stage: 'idle' as 'idle' | 'crawling' | 'analyzing' | 'complete'
  })

  const handleAnalyze = async (submittedUrl: string) => {
    setCurrentUrl(submittedUrl)
    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    setCrawlProgress({ current: 0, total: crawlConfig.maxPages, stage: 'crawling' })
    
    try {
      const response = await fetch('/api/analyze-deep-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: submittedUrl,
          maxPages: crawlConfig.maxPages
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        setCrawlProgress({ 
          current: data.data.pagesCrawled, 
          total: data.data.pagesCrawled, 
          stage: 'complete' 
        })
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error: any) {
      console.error('Deep scan failed:', error)
      setError(error.message)
      setCrawlProgress({ current: 0, total: 0, stage: 'idle' })
    } finally {
      setIsAnalyzing(false)
    }
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
                setResult(null)
                setCurrentUrl("")
                setError(null)
                setCrawlProgress({ current: 0, total: 0, stage: 'idle' })
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
            {isAnalyzing && crawlProgress.stage !== 'idle' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {crawlProgress.stage === 'crawling' && 'Crawling pages...'}
                        {crawlProgress.stage === 'analyzing' && 'Analyzing with AI...'}
                        {crawlProgress.stage === 'complete' && 'Analysis complete!'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {crawlProgress.current} / {crawlProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(crawlProgress.current / crawlProgress.total) * 100}%` }}
                      />
                    </div>
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
