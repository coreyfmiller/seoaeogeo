'use client'

import { useState, useEffect } from 'react'
import { Zap, Search, Sparkles, Bot, CheckCircle2, Clock, Copy, Filter } from 'lucide-react'
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan, wasHistoryCleared } from '@/lib/scan-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/dashboard/search-input'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { PageShell } from '@/components/dashboard/page-shell'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { SEOTabEnhanced } from '@/components/dashboard/seo-tab-enhanced'
import { AEOTab } from '@/components/dashboard/aeo-tab'
import { GEOTab } from '@/components/dashboard/geo-tab'
import { LearnMore } from '@/components/ui/learn-more'
import { useSSEAnalysis } from '@/hooks/use-sse-analysis'
import { CreditConfirmDialog } from '@/components/dashboard/credit-confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { LinkBuildingIntelligence } from '@/components/dashboard/link-building-intelligence'
import { WhatsNextCard, NEXT_STEPS } from '@/components/dashboard/whats-next-card'
import { ExpertAnalysis } from '@/components/dashboard/expert-analysis'
import { cn } from '@/lib/utils'


interface AnalysisResult {
  url: string
  scores: { seo: { score: number }; aeo: { score: number }; geo: { score: number } }
  siteTypeResult?: { primaryType: string; secondaryTypes: string[]; confidence: number }
  graderResult: {
    seoScore: number; aeoScore: number; geoScore: number
    breakdown: {
      seo: Array<{ name: string; score: number; maxScore: number; percentage: number; components: Array<{ score: number; maxScore: number; status: 'good' | 'warning' | 'critical'; feedback: string; issues?: string[] }> }>
      aeo: Array<{ name: string; score: number; maxScore: number; percentage: number; components: Array<{ score: number; maxScore: number; status: 'good' | 'warning' | 'critical'; feedback: string; issues?: string[] }> }>
      geo: Array<{ name: string; score: number; maxScore: number; percentage: number; components: Array<{ score: number; maxScore: number; status: 'good' | 'warning' | 'critical'; feedback: string; issues?: string[] }> }>
    }
    overallFeedback: string; criticalIssues: string[]
  }
  enhancedPenalties: Array<{ category: 'SEO' | 'AEO' | 'GEO'; component: string; penalty: string; explanation: string; fix: string; pointsDeducted: number; severity: 'critical' | 'warning' | 'info' }>
  aiAnalysis?: { seoAnalysis?: any; aeoAnalysis?: any; geoAnalysis?: any; schemaQuality?: any; recommendations?: any[] }
  pageData?: { structuralData?: any; technical?: any; url?: string; title?: string; [key: string]: any }
  cwv: { lcp: any; inp: any; cls: any; overallCategory: string; performanceScore: number }
  backlinkData?: { metrics: any; backlinks: any[] } | null
  platformDetection?: any
  liveInterrogation?: any
  expertAnalysis?: string | { bottomLine: string; keyInsight: string; priorityAction: string } | null
  analyzedAt: string
}

export default function ProAuditV4Page() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [activeTab, setActiveTab] = useState('seo')
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [pendingUrl, setPendingUrl] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL')
  const sse = useSSEAnalysis<AnalysisResult>('/api/analyze-v3')

  const handleAnalyze = async (submittedUrl: string) => { setPendingUrl(submittedUrl); setCreditDialogOpen(true) }
  const handleConfirmAnalyze = async () => { setCreditDialogOpen(false); setCurrentUrl(pendingUrl); await sse.startAnalysis(pendingUrl) }

  const result = sse.data
  const isAnalyzing = sse.isAnalyzing
  const error = sse.error

  // Inject scan context for Duelly chat
  useEffect(() => {
    if (result) {
      // Count critical from AI recommendations (what the page displays)
      const aiRecs = result.aiAnalysis?.recommendations || []
      const aiCriticalCount = aiRecs.filter((r: any) => (r.priority || '').toUpperCase() === 'CRITICAL').length

      window.dispatchEvent(new CustomEvent('duelly-scan-context', { detail: {
        tool: 'pro-audit',
        url: result.url,
        seoScore: result.scores?.seo?.score,
        aeoScore: result.scores?.aeo?.score,
        geoScore: result.scores?.geo?.score,
        siteType: result.siteTypeResult?.primaryType,
        platform: result.platformDetection?.platform,
        criticalIssues: aiRecs.filter((r: any) => (r.priority || '').toUpperCase() === 'CRITICAL').map((r: any) => r.title || r.description || 'Critical issue'),
        penalties: result.enhancedPenalties?.map(p => ({
          component: p.component, penalty: p.penalty, severity: p.severity,
          pointsDeducted: Math.abs(p.pointsDeducted), explanation: p.explanation, fix: p.fix
        })),
        backlinks: result.backlinkData ? {
          domainAuthority: result.backlinkData.metrics?.domainAuthority ?? 0,
          totalBacklinks: result.backlinkData.metrics?.totalBacklinks ?? 0,
          topBacklinks: (result.backlinkData.backlinks || []).slice(0, 5).map((b: any) => ({ source: b.source || b.url, anchor: b.anchor || '' }))
        } : undefined,
      } }))
    } else {
      window.dispatchEvent(new CustomEvent('duelly-scan-context', { detail: null }))
    }
    return () => { window.dispatchEvent(new CustomEvent('duelly-scan-context', { detail: null })) }
  }, [result])

  useEffect(() => {
    if (!isAnalyzing) { setElapsedSeconds(0); return }
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  const handleSiteTypeChange = async (newType: string) => {
    if (!result?.pageData) return
    try {
      const res = await fetch('/api/recalculate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanData: { ...result.pageData, schemas: result.pageData.structuralData?.schemas || [], semanticFlags: (result.pageData as any)?.semanticFlags || {}, schemaQuality: result.aiAnalysis?.schemaQuality, siteType: newType }, siteType: newType }) })
      if (!res.ok) return
      const recalc = await res.json()
      sse.setData({ ...result, scores: recalc.scores, graderResult: recalc.graderResult, enhancedPenalties: recalc.enhancedPenalties, siteTypeResult: { ...result.siteTypeResult!, primaryType: newType } })
    } catch (e) { console.error('[V4] Recalculate failed:', e) }
  }

  const handlePlatformChange = async (newPlatform: string) => {
    if (!result?.pageData) return
    try {
      const res = await fetch('/api/recalculate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanData: { ...result.pageData, schemas: result.pageData.structuralData?.schemas || [], semanticFlags: (result.pageData as any)?.semanticFlags || {}, schemaQuality: result.aiAnalysis?.schemaQuality, siteType: result.siteTypeResult?.primaryType }, siteType: result.siteTypeResult?.primaryType, platformOverride: newPlatform }) })
      if (!res.ok) return
      const recalc = await res.json()
      sse.setData({ ...result, enhancedPenalties: recalc.enhancedPenalties, platformDetection: { ...result.platformDetection, platform: newPlatform, label: newPlatform.charAt(0).toUpperCase() + newPlatform.slice(1) } })
    } catch (e) { console.error('[V4] Platform recalculate failed:', e) }
  }

  useEffect(() => {
    if (result && currentUrl) {
      saveScanToHistory({ url: currentUrl, type: 'pro', scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score }, timestamp: new Date().toISOString() }, result)
    }
  }, [result, currentUrl])

  useEffect(() => {
    if (wasHistoryCleared()) return
    const entry = consumeLoadFromHistory()
    if (entry && entry.type === 'pro') { const full = getFullScanResult(entry); if (full) { setCurrentUrl(entry.url); sse.setData(full); return } }
    sse.checkPendingScan().then(({ found, url: jobUrl }) => {
      if (found && jobUrl) { setCurrentUrl(jobUrl); return }
      const latest = getLatestFullScan('pro')
      if (latest) { setCurrentUrl(latest.entry.url); sse.setData(latest.result) }
    })
  }, [])

  const tabData = result ? {
    technical: result.pageData?.technical || { isHttps: true, status: 200, responseTimeMs: 0 },
    structuralData: result.pageData?.structuralData || { semanticTags: { article: 0, main: 0, nav: 0, aside: 0, headers: 0 }, links: { internal: 0, external: 0 }, media: { totalImages: 0, imagesWithAlt: 0 }, wordCount: 0 },
    ai: {
      scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score },
      enhancedPenalties: result.enhancedPenalties || [],
      seoAnalysis: result.aiAnalysis?.seoAnalysis || { onPageIssues: [], keywordOpportunities: [], contentQuality: 'fair', metaAnalysis: '' },
      aeoAnalysis: result.aiAnalysis?.aeoAnalysis || { questionsAnswered: { who: 0, what: 0, where: 0, why: 0, how: 0 }, missingSchemas: [], snippetEligibilityScore: 0, topOpportunities: [] },
      geoAnalysis: result.aiAnalysis?.geoAnalysis || { sentimentScore: 0, brandPerception: 'neutral' as const, citationLikelihood: 0, llmContextClarity: 0, visibilityGaps: [] }
    }
  } : undefined

  return (
    <PageShell onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} currentUrl={currentUrl} apiStatus="idle" placeholder="Enter URL for Pro Audit..." buttonLabel="Pro Audit">
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-6 overflow-hidden">

          <AuditPageHeader title="Pro Audit" description="AI-powered scoring with site-type-specific analysis for 95% accuracy." currentUrl={currentUrl} hasResults={!!result} isAnalyzing={isAnalyzing}
            onNewAudit={() => { sse.reset(); setCurrentUrl("") }} onRefreshAnalysis={() => handleAnalyze(currentUrl)} analysisData={result} pageCount={1}
            siteType={result?.siteTypeResult ? { primaryType: result.siteTypeResult.primaryType, confidence: result.siteTypeResult.confidence } : undefined}
            platformDetection={result?.platformDetection} onSiteTypeConfirm={handleSiteTypeChange} onSiteTypeChange={handleSiteTypeChange} onPlatformChange={handlePlatformChange}
            onCopyReport={result ? () => {
              const scores = result.scores || {} as any
              const seo = scores.seo?.score ?? 'N/A'
              const aeo = scores.aeo?.score ?? 'N/A'
              const geo = scores.geo?.score ?? 'N/A'
              const penalties = (result.enhancedPenalties || [])
                .map((p: any) => `[${p.severity?.toUpperCase()}] ${p.category} — ${p.component}\n  ${p.explanation}\n  Fix: ${p.fix}`)
                .join('\n\n')
              const text = `DUELLY AUDIT REPORT\n${'='.repeat(50)}\nURL: ${currentUrl}\nDate: ${new Date().toLocaleString()}\nSite Type: ${result.siteTypeResult?.primaryType || 'Unknown'}\n\nSCORES\n  SEO: ${seo}/100\n  AEO: ${aeo}/100\n  GEO: ${geo}/100\n\nISSUES FOUND\n${penalties || '  No issues detected.'}`
              navigator.clipboard.writeText(text)
            } : undefined}
            downloadReport={result ? {
              filename: `duelly-pro-audit-${currentUrl.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`,
              generatePdf: async () => {
                const { generatePdfBlob } = await import('@/lib/pdf/generate')
                const { ProAuditReport } = await import('@/lib/pdf/pro-audit-report')
                const React = (await import('react')).default
                const sd = result.pageData?.structuralData || {} as any
                const tech = result.pageData?.technical || {} as any
                const schemas = (result.pageData as any)?.schemas || []
                return generatePdfBlob(React.createElement(ProAuditReport, {
                  url: currentUrl, date: new Date().toLocaleDateString(),
                  scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score },
                  siteType: result.siteTypeResult?.primaryType, platform: result.platformDetection?.label,
                  overallFeedback: result.graderResult?.overallFeedback,
                  recommendations: result.aiAnalysis?.recommendations,
                  metrics: [
                    { label: 'Schema', value: schemas.length > 0 ? `${schemas.length} found` : 'None' },
                    { label: 'HTTPS', value: tech.isHttps ? 'Secure' : 'Not Secure' },
                    { label: 'Response', value: `${tech.responseTimeMs || 0}ms` },
                    { label: 'Words', value: `${(sd.wordCount || 0).toLocaleString()}` },
                    { label: 'Int. Links', value: `${sd.links?.internal || 0}` },
                    { label: 'Alt Text', value: `${sd.media?.totalImages > 0 ? Math.round((sd.media.imagesWithAlt / sd.media.totalImages) * 100) : 100}%` },
                  ],
                  backlinkData: result.backlinkData, cwv: result.cwv?.performanceScore > 0 ? result.cwv : null,
                }))
              },
            } : undefined}
          />

          {/* Loading Overlay */}
          {isAnalyzing && (
            <div className="space-y-8 animate-in fade-in zoom-in-95">
              <Card className="border-2 border-seo/20 bg-gradient-to-br from-seo/5 via-aeo/5 to-geo/5 overflow-hidden relative">
                <div className="h-1 w-full bg-muted/30 overflow-hidden"><div className="h-full bg-gradient-to-r from-seo via-aeo to-geo transition-all duration-700 ease-out" style={{ width: `${sse.progress}%` }} /></div>
                <CardContent className="pt-10 pb-10">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative h-24 w-24">
                      <div className="absolute inset-0 rounded-full border-4 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"><span className="text-xl font-black text-foreground tabular-nums">{sse.progress}%</span></div>
                    </div>
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">Pro Audit in Progress</h2>
                      <p className="text-sm text-muted-foreground max-w-md min-h-[20px] transition-opacity duration-500">{sse.phase || 'Initializing...'}</p>
                    </div>
                    <div className="w-full max-w-md">
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-seo via-aeo to-geo rounded-full transition-all duration-700 ease-out" style={{ width: `${sse.progress}%` }} /></div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground tabular-nums">{sse.progress}% complete</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-1"><Clock className="h-3 w-3" />{elapsedSeconds}s elapsed</span>
                      </div>
                    </div>
                    {currentUrl && <Badge variant="outline" className="border-seo/30 text-seo bg-seo/5 px-4 py-1.5 text-sm font-bold">{currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</Badge>}
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: <Search className="h-5 w-5" />, label: "Crawling Site", desc: "Extracting content, metadata, and technical signals", threshold: 10 },
                  { icon: <Sparkles className="h-5 w-5" />, label: "AI Analysis", desc: "Gemini analyzing content quality, schema, and structure", threshold: 40 },
                  { icon: <Bot className="h-5 w-5" />, label: "Scoring & Grading", desc: "Calculating SEO, AEO, and GEO scores with penalties", threshold: 70 },
                ].map((phase, i) => {
                  const isActive = sse.progress >= phase.threshold
                  const isDone = i < 2 && sse.progress >= [40, 70, 100][i]
                  return (
                    <Card key={i} className={cn("border-border/30 transition-all duration-500", isActive ? "bg-card/80" : "bg-card/30 opacity-50")}>
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start gap-3">
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500", i === 0 ? "bg-seo/10 text-seo" : i === 1 ? "bg-aeo/10 text-aeo" : "bg-[#fe3f8c]/10 text-[#fe3f8c]", isActive && !isDone && "animate-pulse")}>
                            {isDone ? <CheckCircle2 className="h-5 w-5" /> : phase.icon}
                          </div>
                          <div><h3 className="font-bold text-sm text-foreground">{phase.label}</h3><p className="text-xs text-muted-foreground mt-0.5">{phase.desc}</p></div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Hero Section */}
          {!result && !isAnalyzing && (
            <Card className="border-2 border-seo/20 bg-gradient-to-br from-seo/5 to-transparent">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-seo/10 flex items-center justify-center"><Zap className="h-8 w-8 text-seo" /></div>
                <div>
                  <CardTitle className="text-3xl mb-2">Best-in-Class SEO/AEO/GEO Scoring</CardTitle>
                  <CardDescription className="text-base max-w-2xl mx-auto">AI-powered scoring with site-type-specific analysis for the most accurate audits. Built for the 2026 search landscape.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="max-w-4xl mx-auto"><SearchInput onSubmit={handleAnalyze} isAnalyzing={isAnalyzing} placeholder="Enter website URL to audit..." variant="large" /></CardContent>
            </Card>
          )}

          {!result && !isAnalyzing && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader><CardTitle className="text-lg">AI Content Analysis</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Gemini AI analyzes tone, expertise, claims, and content quality for accurate AEO/GEO scoring.</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg">Site Intelligence</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Auto-detects your site type and platform (WordPress, Shopify, etc.) to deliver tailored scoring and platform-specific fix instructions.</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg">Actionable Fixes</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Step-by-step instructions with explanations for every issue found.</p></CardContent></Card>
            </div>
          )}

          <CreditConfirmDialog open={creditDialogOpen} onConfirm={handleConfirmAnalyze} onCancel={() => setCreditDialogOpen(false)} creditCost={10} scanType="Pro Audit" costBreakdown="10 credits per Pro Audit scan" />
          <ScanErrorDialog error={error} onClose={() => sse.reset()} onRetry={() => handleAnalyze(currentUrl)} creditsRefunded={sse.creditsRefunded} />

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Score Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="flex items-center justify-center p-6">
                  <div className="flex flex-col items-center gap-1">
              <CircularProgress value={result.scores.seo.score} variant="seo" label="SEO Score" size={140} strokeWidth={10} />
              <LearnMore term="seo-score" />
                    </div>
                </Card>
                <Card className="flex items-center justify-center p-6">
                  <div className="flex flex-col items-center gap-1">
                    <CircularProgress value={result.scores.aeo.score} variant="aeo" label="AEO Score" size={140} strokeWidth={10} />
                    <LearnMore term="aeo-score" />
                  </div>
                </Card>
                <Card className="flex items-center justify-center p-6">
                  <div className="flex flex-col items-center gap-1">
                    <CircularProgress value={result.scores.geo.score} variant="geo" label="GEO Score" size={140} strokeWidth={10} />
                    <LearnMore term="geo-score" />
                  </div>
                </Card>
              </div>

              {/* Key Metrics Strip */}
              {(() => {
                const sd = result.pageData?.structuralData || {} as any
                const tech = result.pageData?.technical || {} as any
                const schemas = (result.pageData as any)?.schemas || []
                const hasSchema = schemas.length > 0
                const hasH1 = (sd.semanticTags?.h1Count || 0) > 0
                const isHttps = tech.isHttps === true
                const hasMeta = !!(result.pageData?.title && (result.pageData as any)?.description)
                const responseTime = tech.responseTimeMs || 0
                const imgTotal = sd.media?.totalImages || 0
                const imgWithAlt = sd.media?.imagesWithAlt || 0
                const altPct = imgTotal > 0 ? Math.round((imgWithAlt / imgTotal) * 100) : 100
                const wordCount = sd.wordCount || 0
                const metrics = [
                  { label: "Schema", value: hasSchema ? `${schemas.length} found` : "None", color: hasSchema ? "text-seo" : "text-red-500", bad: !hasSchema, knowledgeId: "schema-markup" },
                  { label: "Metadata", value: hasMeta ? "Complete" : "Missing", color: hasMeta ? "text-green-500" : "text-red-500", bad: !hasMeta, knowledgeId: "metadata" },
                  { label: "H1 Tag", value: hasH1 ? "Found" : "Missing", color: hasH1 ? "text-green-500" : "text-red-500", bad: !hasH1, knowledgeId: "h1-tag" },
                  { label: "HTTPS", value: isHttps ? "Secure" : "Not Secure", color: isHttps ? "text-green-500" : "text-red-500", bad: !isHttps, knowledgeId: "https" },
                  { label: "Response", value: `${responseTime}ms`, color: responseTime < 500 ? "text-green-500" : responseTime < 1000 ? "text-yellow-500" : "text-red-500", bad: responseTime >= 1000, knowledgeId: "response-time" },
                  { label: "Alt Text", value: `${altPct}%`, color: altPct >= 80 ? "text-green-500" : altPct >= 50 ? "text-yellow-500" : "text-red-500", bad: altPct < 50, knowledgeId: "alt-text" },
                  { label: "Words", value: wordCount.toLocaleString(), color: wordCount >= 800 ? "text-green-500" : wordCount >= 300 ? "text-yellow-500" : "text-red-500", bad: wordCount < 300, knowledgeId: "word-count" },
                  { label: "Int. Links", value: `${sd.links?.internal || 0}`, color: (sd.links?.internal || 0) >= 3 ? "text-green-500" : "text-yellow-500", bad: false, knowledgeId: "internal-linking" },
                  { label: "Ext. Links", value: `${sd.links?.external || 0}`, color: "text-foreground", bad: false, knowledgeId: "external-links" },
                ]
                return (
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                    {metrics.map(m => (
                      <div key={m.label} className={`rounded-lg border px-2.5 py-2 ${m.bad ? "border-red-500/40 bg-red-500/5" : "border-border/50 bg-card/50"}`}>
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold leading-tight truncate">{m.label}</p>
                          <LearnMore term={m.knowledgeId} className="h-3 w-3 text-[7px]" />
                        </div>
                        <p className={`text-sm font-black ${m.color} truncate`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* ═══ EXPERT ANALYSIS ═══ */}
              <ExpertAnalysis
                analysis={result.expertAnalysis}
                autoGenerate
                generateData={{
                  context: 'pro-audit', url: result.url,
                  scores: { seo: result.scores.seo.score, aeo: result.scores.aeo.score, geo: result.scores.geo.score },
                  siteType: result.siteTypeResult?.primaryType, platform: result.platformDetection?.label,
                  wordCount: result.pageData?.structuralData?.wordCount,
                  schemaCount: (result.pageData?.schemas || []).length,
                  criticalIssues: result.graderResult?.criticalIssues,
                  domainAuthority: result.backlinkData?.metrics?.domainAuthority,
                  totalBacklinks: result.backlinkData?.metrics?.totalBacklinks,
                }}
              />

              {/* ═══ ROADMAP TO 100 ═══ */}
              {(result.aiAnalysis?.recommendations?.length ?? 0) > 0 && (() => {
                const recs = result.aiAnalysis!.recommendations!
                const normPriority = (r: any) => r.priority === 'STEADY' ? 'MEDIUM' : (r.priority || 'MEDIUM')
                const normDomain = (r: any) => (r.domain || 'SEO').toLowerCase()

                const criticalCount = recs.filter((r: any) => normPriority(r) === 'CRITICAL').length
                const highCount = recs.filter((r: any) => normPriority(r) === 'HIGH').length
                const mediumCount = recs.filter((r: any) => normPriority(r) === 'MEDIUM').length

                const filtered = priorityFilter === 'ALL' ? recs : recs.filter((r: any) => normPriority(r) === priorityFilter)

                return (
                  <Card className="border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5">
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Zap className="h-5 w-5 text-[#00e5ff]" />
                        <CardTitle>Roadmap to 100 - Prioritized Site Improvements</CardTitle>
                        <button onClick={() => {
                          const sep = '\u2500'.repeat(60)
                          const text = `ROADMAP TO 100 - PRIORITIZED SITE IMPROVEMENTS (${recs.length})\n${'='.repeat(60)}\n\n` + recs.map((r: any, i: number) => {
                            const p = normPriority(r); const domain = r.domain || 'SEO'
                            let t = `${sep}\n${i + 1}. [${p}] [${domain.toUpperCase()}] ${r.title}\n${sep}`
                            if (r.description) t += `\n\nWhy This Matters:\n${r.description}`
                            if (r.platform) t += `\n\nPlatform: ${r.platform}`
                            if (r.estimatedTime || r.effort) t += `\nEffort: ${r.estimatedTime || r.effort + 'h'}`
                            if (r.steps?.length) { t += '\n\nImplementation Steps:'; r.steps.forEach((s: any) => { t += `\n\n  Step ${s.step}: ${s.title}\n  ${s.description}`; if (s.code) t += `\n\n  Code:\n  ${s.code}` }) }
                            if (r.code || r.codeSnippet) t += `\n\nCode:\n${r.code || r.codeSnippet}`
                            if (r.validationLinks?.length) { t += '\n\nValidation Links:'; r.validationLinks.forEach((v: any) => { t += `\n  - ${v.tool}: ${v.url}` }) }
                            return t
                          }).join('\n\n')
                          navigator.clipboard.writeText(text)
                        }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-[#00e5ff]/50 transition-colors">
                          <Copy className="h-3.5 w-3.5" /> Copy All
                        </button>
                      </div>

                      {/* Priority Filter */}
                      <div className="flex items-center gap-2 mt-3">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        {[
                          { key: 'ALL' as const, label: 'All', count: recs.length, activeColor: 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40', inactiveColor: 'bg-muted/30 text-muted-foreground border-border/30 hover:border-border/50' },
                          { key: 'CRITICAL' as const, label: 'Critical', count: criticalCount, activeColor: 'bg-destructive/20 text-destructive border-destructive/40', inactiveColor: 'bg-destructive/5 text-destructive/60 border-destructive/20 hover:bg-destructive/10' },
                          { key: 'HIGH' as const, label: 'High', count: highCount, activeColor: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40', inactiveColor: 'bg-[#f59e0b]/5 text-[#f59e0b]/60 border-[#f59e0b]/20 hover:bg-[#f59e0b]/10' },
                          { key: 'MEDIUM' as const, label: 'Medium', count: mediumCount, activeColor: 'bg-[#BC13FE]/20 text-[#BC13FE] border-[#BC13FE]/40', inactiveColor: 'bg-[#BC13FE]/5 text-[#BC13FE]/60 border-[#BC13FE]/20 hover:bg-[#BC13FE]/10' },
                        ].filter(f => f.key === 'ALL' || f.count > 0).map(f => (
                          <button key={f.key} onClick={() => setPriorityFilter(f.key)}
                            className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all border",
                              priorityFilter === f.key ? f.activeColor : f.inactiveColor
                            )}>
                            {f.label} ({f.count})
                          </button>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((rec: any, i: number) => (
                            <FixInstructionCard
                              key={i}
                              title={rec.title}
                              domain={normDomain(rec) as any}
                              priority={normPriority(rec)}
                              steps={rec.steps || [{ step: 1, title: 'How To Fix', description: rec.howToFix || rec.fix || rec.description }]}
                              code={rec.code || rec.codeSnippet}
                              platform={rec.platform || 'Any'}
                              estimatedTime={rec.estimatedTime || `${rec.effort || 1}h`}
                              difficulty={rec.effort >= 3 ? 'difficult' : rec.effort >= 2 ? 'moderate' : 'easy'}
                              impact={rec.priority === 'CRITICAL' ? 'high' : rec.priority === 'HIGH' ? 'medium' : 'low'}
                              validationLinks={rec.validationLinks}
                              impactedScores={rec.impactedScores}
                              whyItMatters={rec.description}
                            />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {/* Tabbed SEO / AEO / GEO Analysis */}
              <Tabs defaultValue="seo" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full sm:w-auto bg-muted/50 p-1">
                  <TabsTrigger value="seo" className={cn("gap-2 border transition-all duration-200", "border-seo/10 bg-seo/5 text-seo/40 cursor-pointer", "hover:border-seo/30 hover:bg-seo/10 hover:text-seo/60", "data-[state=active]:!border-seo/50 data-[state=active]:!bg-seo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100")}>
                    <Search className="h-4 w-4" /><span className="hidden sm:inline">SEO Analysis</span><span className="sm:hidden">SEO</span>
                  </TabsTrigger>
                  <TabsTrigger value="aeo" className={cn("gap-2 border transition-all duration-200", "border-aeo/10 bg-aeo/5 text-aeo/40 cursor-pointer", "hover:border-aeo/30 hover:bg-aeo/10 hover:text-aeo/60", "data-[state=active]:!border-aeo/50 data-[state=active]:!bg-aeo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100")}>
                    <Sparkles className="h-4 w-4" /><span className="hidden sm:inline">AEO Analysis</span><span className="sm:hidden">AEO</span>
                  </TabsTrigger>
                  <TabsTrigger value="geo" className={cn("gap-2 border transition-all duration-200", "border-[#fe3f8c]/10 bg-[#fe3f8c]/5 text-[#fe3f8c]/40 cursor-pointer", "hover:border-[#fe3f8c]/30 hover:bg-[#fe3f8c]/10 hover:text-[#fe3f8c]/60", "data-[state=active]:!border-[#fe3f8c]/50 data-[state=active]:!bg-[#fe3f8c] data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100")}>
                    <Bot className="h-4 w-4" /><span className="hidden sm:inline">GEO Analysis</span><span className="sm:hidden">GEO</span>
                  </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                  <TabsContent value="seo" className="mt-0"><SEOTabEnhanced data={tabData} hideScoreDeductions /></TabsContent>
                  <TabsContent value="aeo" className="mt-0"><AEOTab data={tabData} hideScoreDeductions /></TabsContent>
                  <TabsContent value="geo" className="mt-0"><GEOTab data={tabData} hideScoreDeductions /></TabsContent>
                </div>
              </Tabs>

              {/* Link Building Intelligence */}
              {result.backlinkData && (
                <LinkBuildingIntelligence metrics={result.backlinkData.metrics} backlinks={result.backlinkData.backlinks} nofollowOnly={(result.backlinkData as any)?.nofollowOnly} />
              )}

              {/* Core Web Vitals */}
              {result.cwv && result.cwv.performanceScore > 0 && (
                <Card className="border-[#BC13FE]/20 bg-[#BC13FE]/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="h-5 w-5 text-[#BC13FE]" /> Core Web Vitals
                      <LearnMore term="core-web-vitals" />
                      <span className="ml-auto text-sm font-black text-[#BC13FE]">{result.cwv.performanceScore}/100</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { data: result.cwv.lcp, label: 'LCP', tip: 'Largest Contentful Paint — measures loading performance. Under 2.5s is good, over 4s is poor.' },
                        { data: result.cwv.inp, label: 'INP', tip: 'Interaction to Next Paint — measures responsiveness. Under 200ms is good, over 500ms is poor.' },
                        { data: result.cwv.cls, label: 'CLS', tip: 'Cumulative Layout Shift — measures visual stability. Under 0.1 is good, over 0.25 is poor.' },
                      ].map(({ data: d, label, tip }) => d && (
                        <div key={label} className={`rounded-lg border p-4 text-center ${d.category === 'FAST' ? 'border-green-500/30 bg-green-500/5' : d.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">{label}<LearnMore term="core-web-vitals" /></p>
                          <p className={`text-2xl font-black ${d.category === 'FAST' ? 'text-green-600' : d.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'}`}>{d.displayValue}</p>
                          <p className={`text-[10px] font-bold uppercase mt-1 ${d.category === 'FAST' ? 'text-green-600' : d.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'}`}>{d.category}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* What's Next — only show after results */}
          {result && (
            <WhatsNextCard steps={[
              NEXT_STEPS.deepScan(currentUrl),
              NEXT_STEPS.keywordArena(`Your SEO score is ${result.scores?.seo ?? '?'} — see how that compares against competitors`),
              NEXT_STEPS.competitorDuel(),
            ]} />
          )}
        </div>
      </main>
    </PageShell>
  )
}
