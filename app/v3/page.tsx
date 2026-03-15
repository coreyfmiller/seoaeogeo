'use client'

import { useState } from 'react'
import { Activity, Search, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/dashboard/search-input'
import { Progress } from '@/components/ui/progress'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { SiteTypeBadge } from '@/components/dashboard/site-type-badge'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { useSSEAnalysis } from '@/hooks/use-sse-analysis'

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
  const sse = useSSEAnalysis<AnalysisResult>('/api/analyze-v3')

  const handleAnalyze = async (submittedUrl: string) => {
    setCurrentUrl(submittedUrl)
    await sse.startAnalysis(submittedUrl)
  }

  const result = sse.data
  const isAnalyzing = sse.isAnalyzing
  const error = sse.error

  const getCategoryColor = (category: string) => {
    if (category === 'FAST') return 'text-green-600'
    if (category === 'SLOW') return 'text-red-600'
    return 'text-yellow-600'
  }

  const getCategoryIcon = (category: string) => {
    if (category === 'FAST') return TrendingUp
    if (category === 'SLOW') return TrendingDown
    return Minus
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
        title="V3.0 - AI-Powered Context-Aware Audit"
        description="AI-powered scoring with site-type-specific analysis for 95% accuracy."
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
        pageCount={1}
        siteType={result?.siteTypeResult ? {
          primaryType: result.siteTypeResult.primaryType,
          confidence: result.siteTypeResult.confidence
        } : undefined}
      />

      {/* Loading Overlay */}
      {isAnalyzing && (
        <Card className="border-seo/30">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
              <div className="text-center min-h-[48px]">
                <h3 className="text-lg font-bold text-foreground">V3 AI Audit in Progress</h3>
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
              V3.0 combines AI content analysis with site-type-specific scoring for the most accurate audits.
              Built for the 2026 search landscape.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="max-w-2xl mx-auto">
          <SearchInput
            onSubmit={handleAnalyze}
            isAnalyzing={isAnalyzing}
            placeholder="Enter website URL to audit..."
            variant="large"
          />
          
          {/* Beta Badge */}
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Zap className="h-3 w-3" />
              BETA - AI-Powered
            </span>
          </div>
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
              <CardTitle className="text-lg">Context-Aware Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Site-type detection applies restaurant, blog, or e-commerce specific scoring weights.
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
          {/* Score Cards with Circular Progress */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex items-center justify-center p-6">
              <CircularProgress
                value={result.scores.seo.score}
                variant="seo"
                label="SEO Score"
                size={140}
                strokeWidth={10}
              />
            </Card>

            <Card className="flex items-center justify-center p-6">
              <CircularProgress
                value={result.scores.aeo.score}
                variant="aeo"
                label="AEO Score"
                size={140}
                strokeWidth={10}
              />
            </Card>

            <Card className="flex items-center justify-center p-6">
              <CircularProgress
                value={result.scores.geo.score}
                variant="geo"
                label="GEO Score"
                size={140}
                strokeWidth={10}
              />
            </Card>
          </div>

          {/* Actionable Fixes Section */}
          {result.enhancedPenalties && result.enhancedPenalties.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Actionable Fixes</h2>
                <p className="text-muted-foreground">
                  Prioritized list of issues with step-by-step instructions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.enhancedPenalties.map((penalty, idx) => {
                  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM'
                  let category: 'Quick Win' | 'High Priority' | 'Medium Priority' | 'Long-term Investment' | 'Low Priority' = 'Medium Priority'
                  
                  if (penalty.severity === 'critical') {
                    priority = 'CRITICAL'
                    category = 'High Priority'
                  } else if (penalty.severity === 'warning') {
                    priority = 'HIGH'
                    category = 'Medium Priority'
                  } else {
                    priority = 'MEDIUM'
                    category = 'Quick Win'
                  }
                  
                  const difficulty = penalty.component.includes('Content') || penalty.component.includes('Schema') ? 'moderate' : 'easy'
                  
                  const fixLines = penalty.fix.split(/\d+\.\s+/).filter(line => line.trim())
                  const steps = fixLines.length > 1 
                    ? fixLines.map((line, i) => ({
                        step: i + 1,
                        title: line.split(':')[0] || `Step ${i + 1}`,
                        description: line.split(':').slice(1).join(':').trim() || line
                      }))
                    : [{
                        step: 1,
                        title: 'Implementation',
                        description: penalty.fix
                      }]
                  
                  return (
                    <FixInstructionCard
                      key={idx}
                      title={penalty.component.replace(/^(SEO|AEO|GEO)\s+/, '')}
                      category={category}
                      priority={priority}
                      steps={steps}
                      platform="All Platforms"
                      estimatedTime={penalty.severity === 'critical' ? '2-4 hours' : penalty.severity === 'warning' ? '1-2 hours' : '30-60 min'}
                      difficulty={difficulty}
                      impact={penalty.severity === 'critical' ? 'high' : penalty.severity === 'warning' ? 'medium' : 'low'}
                      affectedPages={1}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-seo" />
                Core Web Vitals
              </CardTitle>
              <CardDescription>
                Performance Score: {result.cwv.performanceScore}/100 • Overall: {result.cwv.overallCategory}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* LCP */}
                {result.cwv.lcp && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">LCP</span>
                      <span className={`text-sm font-medium ${getCategoryColor(result.cwv.lcp.category)}`}>
                        {result.cwv.lcp.category}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{result.cwv.lcp.displayValue}</div>
                    <Progress value={result.cwv.lcp.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">Largest Contentful Paint</p>
                  </div>
                )}

                {/* INP */}
                {result.cwv.inp && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">INP</span>
                      <span className={`text-sm font-medium ${getCategoryColor(result.cwv.inp.category)}`}>
                        {result.cwv.inp.category}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{result.cwv.inp.displayValue}</div>
                    <Progress value={result.cwv.inp.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">Interaction to Next Paint</p>
                  </div>
                )}

                {/* CLS */}
                {result.cwv.cls && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CLS</span>
                      <span className={`text-sm font-medium ${getCategoryColor(result.cwv.cls.category)}`}>
                        {result.cwv.cls.category}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{result.cwv.cls.displayValue}</div>
                    <Progress value={result.cwv.cls.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">Cumulative Layout Shift</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>{result.graderResult.overallFeedback}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SEO Breakdown */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-seo">SEO Breakdown</h3>
                {result.graderResult.breakdown.seo.map((category, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.score}/{category.maxScore} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="space-y-2 pl-4">
                      {category.components.map((comp, compIdx) => (
                        <div key={compIdx} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className={
                              comp.status === 'good' || comp.status === 'excellent' ? 'text-green-600' :
                              comp.status === 'warning' ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {comp.status === 'good' || comp.status === 'excellent' ? '✓' : comp.status === 'warning' ? '⚠' : '✗'} {comp.feedback}
                            </span>
                            <span className="text-muted-foreground">
                              {comp.score}/{comp.maxScore}
                            </span>
                          </div>
                          {comp.issues && comp.issues.length > 0 && (
                            <ul className="list-disc list-inside text-muted-foreground pl-4 mt-1">
                              {comp.issues.map((issue, issueIdx) => (
                                <li key={issueIdx}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* AEO Breakdown */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-aeo">AEO Breakdown</h3>
                {result.graderResult.breakdown.aeo.map((category, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.score}/{category.maxScore} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="space-y-2 pl-4">
                      {category.components.map((comp, compIdx) => (
                        <div key={compIdx} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className={
                              comp.status === 'good' || comp.status === 'excellent' ? 'text-green-600' :
                              comp.status === 'warning' ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {comp.status === 'good' || comp.status === 'excellent' ? '✓' : comp.status === 'warning' ? '⚠' : '✗'} {comp.feedback}
                            </span>
                            <span className="text-muted-foreground">
                              {comp.score}/{comp.maxScore}
                            </span>
                          </div>
                          {comp.issues && comp.issues.length > 0 && (
                            <ul className="list-disc list-inside text-muted-foreground pl-4 mt-1">
                              {comp.issues.map((issue, issueIdx) => (
                                <li key={issueIdx}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* GEO Breakdown */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-geo">GEO Breakdown</h3>
                {result.graderResult.breakdown.geo.map((category, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.score}/{category.maxScore} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="space-y-2 pl-4">
                      {category.components.map((comp, compIdx) => (
                        <div key={compIdx} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className={
                              comp.status === 'good' || comp.status === 'excellent' ? 'text-green-600' :
                              comp.status === 'warning' ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {comp.status === 'good' || comp.status === 'excellent' ? '✓' : comp.status === 'warning' ? '⚠' : '✗'} {comp.feedback}
                            </span>
                            <span className="text-muted-foreground">
                              {comp.score}/{comp.maxScore}
                            </span>
                          </div>
                          {comp.issues && comp.issues.length > 0 && (
                            <ul className="list-disc list-inside text-muted-foreground pl-4 mt-1">
                              {comp.issues.map((issue, issueIdx) => (
                                <li key={issueIdx}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
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
