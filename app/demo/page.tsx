'use client'

import { useState } from 'react'
import { PageShell } from '@/components/dashboard/page-shell'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Search, Sparkles, Bot, Loader2, AlertTriangle, CheckCircle2,
  Globe, Trophy, Swords, FlaskConical, ArrowRight, Shield, Zap,
  Filter, ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------
const DEMO_SCORES = { seo: 52, aeo: 38, geo: 27 }

const DEMO_PENALTIES = [
  { severity: 'critical' as const, category: 'SEO' as const, component: 'SEO Foundation - Missing title tag - critical SEO issue', penalty: 'No H1 heading found on page', explanation: 'The H1 tag is the main heading of your page and tells both users and search engines what the page is about.', fix: 'Add a single <h1> tag with your primary keyword at the top of your main content area.', pointsDeducted: -10 },
  { severity: 'critical' as const, category: 'SEO' as const, component: 'SEO Foundation - Missing meta description', penalty: 'No meta description tag found', explanation: 'Meta descriptions appear as the snippet text below your title in search results.', fix: 'Add a <meta name="description"> tag with 120-160 characters summarizing the page.', pointsDeducted: -8 },
  { severity: 'critical' as const, category: 'AEO' as const, component: 'AEO Schema Quality - No structured data', penalty: 'No JSON-LD schema markup found', explanation: 'Structured data helps AI systems understand your content programmatically.', fix: 'Add LocalBusiness JSON-LD schema to your page with name, address, phone, and hours.', pointsDeducted: -15 },
  { severity: 'warning' as const, category: 'SEO' as const, component: 'SEO Content Quality - Thin content', penalty: 'Only 187 words on page (minimum 800 recommended)', explanation: 'Pages with fewer than 300 words are considered thin content by search engines.', fix: 'Expand content to at least 800 words with H2 subheadings covering different aspects of your service.', pointsDeducted: -7 },
  { severity: 'warning' as const, category: 'AEO' as const, component: 'AEO Q&A Matching - No FAQ section', penalty: 'No question-answer patterns detected', explanation: 'AI systems actively seek content that directly addresses common queries.', fix: 'Add an FAQ section with 5-8 common questions and direct answers.', pointsDeducted: -10 },
  { severity: 'warning' as const, category: 'GEO' as const, component: 'GEO Tone - Promotional language detected', penalty: 'Content uses superlatives and promotional tone', explanation: 'AI systems deprioritize promotional or biased content.', fix: 'Replace superlatives with factual, evidence-based language.', pointsDeducted: -8 },
  { severity: 'warning' as const, category: 'SEO' as const, component: 'SEO Content Quality - Missing alt text', penalty: '4 images missing alt text', explanation: 'Images without alt text are invisible to search engines and screen readers.', fix: 'Add descriptive alt text to every image describing what it shows.', pointsDeducted: -5 },
  { severity: 'info' as const, category: 'SEO' as const, component: 'SEO Advanced - No external links', penalty: 'No outbound links to authoritative sources', explanation: 'Linking to authoritative sources signals well-researched content.', fix: 'Link to 2-3 authoritative external sources relevant to your content.', pointsDeducted: -3 },
  { severity: 'info' as const, category: 'GEO' as const, component: 'GEO Expertise - Weak expertise signals', penalty: 'No author credentials or experience indicators', explanation: 'AI systems evaluate E-E-A-T signals to determine source credibility.', fix: 'Add author bio, credentials, and years of experience to your page.', pointsDeducted: -6 },
]

const SCAN_PHASES = [
  'Crawling page and extracting content...',
  'Detecting site type...',
  'Starting AI analysis...',
  'Analyzing content with Gemini AI...',
  'Deep AI analysis in progress...',
  'Fetching backlink profile...',
  'Calculating scores...',
  'Generating actionable fixes...',
  'Audit complete!',
]

const DEMO_AI_VISIBILITY = [
  { engine: 'Google Search', recommended: true, rank: 4, color: '#4285f4', icon: Search },
  { engine: 'Google Gemini', recommended: false, rank: null, color: '#00e5ff', icon: Globe },
  { engine: 'ChatGPT', recommended: false, rank: null, color: '#BC13FE', icon: Bot },
  { engine: 'Perplexity', recommended: true, rank: 7, color: '#fe3f8c', icon: Sparkles },
]

function getGrade(score: number) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DemoPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanPhase, setScanPhase] = useState('')
  const [scanProgress, setScanProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [activeTab, setActiveTab] = useState('seo')
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')
  const [demoTool, setDemoTool] = useState<'audit' | 'duel' | 'ai'>('audit')

  const handleAnalyze = (url: string) => {
    if (isScanning) return
    setCurrentUrl(url)
    setIsScanning(true)
    setShowResults(false)
    setScanProgress(0)
    let phase = 0
    const interval = setInterval(() => {
      if (phase < SCAN_PHASES.length) {
        setScanPhase(SCAN_PHASES[phase])
        setScanProgress(Math.round(((phase + 1) / SCAN_PHASES.length) * 100))
        phase++
      } else {
        clearInterval(interval)
        setIsScanning(false)
        setShowResults(true)
      }
    }, 1200)
  }

  const filteredPenalties = DEMO_PENALTIES.filter(p =>
    priorityFilter === 'ALL' || p.severity.toUpperCase() === priorityFilter
  )

  return (
    <PageShell
      onAnalyze={handleAnalyze}
      isAnalyzing={isScanning}
      currentUrl={currentUrl}
      apiStatus="idle"
      placeholder="Enter any URL to see a demo audit..."
      buttonLabel="Demo Scan"
    >
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-6">

          {/* Demo banner */}
          <div className="rounded-xl border border-[#BC13FE]/30 bg-[#BC13FE]/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#BC13FE]/10 text-[#BC13FE] border-[#BC13FE]/20">INTERACTIVE DEMO</Badge>
              <span className="text-sm text-muted-foreground">This is a simulated scan. Results are demo data.</span>
            </div>
            <Link href="/signup" className="text-sm font-bold text-[#00e5ff] hover:underline flex items-center gap-1">
              Get real results <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Header */}
          <AuditPageHeader
            title="Pro Audit"
            description="AI-powered scoring with site-type-specific analysis."
            currentUrl={currentUrl || 'Enter a URL above to start'}
            hasResults={showResults}
            isAnalyzing={isScanning}
            onNewAudit={() => { setShowResults(false); setCurrentUrl('') }}
            onRefreshAnalysis={() => handleAnalyze(currentUrl)}
            pageCount={1}
            siteType={showResults ? { primaryType: 'local-business', confidence: 92 } : undefined}
            platformDetection={showResults ? { platform: 'wordpress', confidence: 'high', label: 'WordPress' } : undefined}
          />

          {/* Loading */}
          {isScanning && (
            <Card className="border-2 border-seo/20 bg-gradient-to-br from-seo/5 via-aeo/5 to-geo/5 overflow-hidden">
              <div className="h-1 w-full bg-muted/30 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-seo via-aeo to-geo transition-all duration-700" style={{ width: `${scanProgress}%` }} />
              </div>
              <CardContent className="pt-10 pb-10">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-full border-4 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-xl font-black tabular-nums">{scanProgress}%</span>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Pro Audit in Progress</h2>
                    <p className="text-sm text-muted-foreground animate-pulse">{scanPhase}</p>
                    <p className="text-xs text-muted-foreground">Demo scan — no credits used</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {showResults && (
            <>
              {/* Tool selector */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'audit' as const, label: 'Pro Audit', icon: Bot },
                  { id: 'duel' as const, label: 'Competitor Duel', icon: Swords },
                  { id: 'ai' as const, label: 'AI Visibility', icon: FlaskConical },
                ].map(tool => (
                  <button key={tool.id} onClick={() => setDemoTool(tool.id)}
                    className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                      demoTool === tool.id ? 'border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff]' : 'border-border/30 text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}>
                    <tool.icon className="h-4 w-4" /> {tool.label}
                  </button>
                ))}
              </div>

              {/* ── PRO AUDIT ── */}
              {demoTool === 'audit' && (
                <>
                  {/* Score circles */}
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <CircularProgress value={DEMO_SCORES.seo} label="SEO" sublabel={getGrade(DEMO_SCORES.seo)} variant="seo" />
                    <CircularProgress value={DEMO_SCORES.aeo} label="AEO" sublabel={getGrade(DEMO_SCORES.aeo)} variant="aeo" />
                    <CircularProgress value={DEMO_SCORES.geo} label="GEO" sublabel={getGrade(DEMO_SCORES.geo)} variant="geo" />
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                      <TabsTrigger value="seo" className="data-[state=active]:text-[#00e5ff]">SEO</TabsTrigger>
                      <TabsTrigger value="aeo" className="data-[state=active]:text-[#BC13FE]">AEO</TabsTrigger>
                      <TabsTrigger value="geo" className="data-[state=active]:text-[#fe3f8c]">GEO</TabsTrigger>
                    </TabsList>

                    {['seo', 'aeo', 'geo'].map(tab => (
                      <TabsContent key={tab} value={tab}>
                        {/* Filter */}
                        <div className="flex items-center gap-2 mb-4">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(f => (
                            <button key={f} onClick={() => setPriorityFilter(f)}
                              className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors',
                                priorityFilter === f ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-foreground'
                              )}>
                              {f}
                            </button>
                          ))}
                        </div>

                        {/* Penalties */}
                        <div className="space-y-2">
                          {filteredPenalties
                            .filter(p => p.category === tab.toUpperCase() || priorityFilter !== 'ALL')
                            .filter(p => tab === 'seo' ? p.category === 'SEO' : tab === 'aeo' ? p.category === 'AEO' : p.category === 'GEO')
                            .map((p, i) => (
                            <Card key={i} className={cn('border-l-4',
                              p.severity === 'critical' ? 'border-l-red-500' : p.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500/50'
                            )}>
                              <CardContent className="py-3 px-4">
                                <div className="flex items-start gap-3">
                                  {p.severity === 'critical' ? <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> :
                                   p.severity === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" /> :
                                   <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="text-sm font-medium">{p.component}</span>
                                      <Badge variant="outline" className={cn('text-[9px]',
                                        p.severity === 'critical' ? 'border-red-500/30 text-red-500' : p.severity === 'warning' ? 'border-yellow-500/30 text-yellow-500' : 'border-blue-500/30 text-blue-400'
                                      )}>
                                        {p.severity.toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-red-400 font-mono">{p.pointsDeducted} pts</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{p.explanation}</p>
                                    <div className="rounded-lg bg-[#00e5ff]/5 border border-[#00e5ff]/10 px-3 py-2">
                                      <p className="text-xs text-[#00e5ff]"><span className="font-bold">Fix:</span> {p.fix}</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </>
              )}

              {/* ── COMPETITOR DUEL ── */}
              {demoTool === 'duel' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="border-red-500/20">
                      <CardHeader className="text-center pb-2">
                        <p className="text-xs text-muted-foreground">Your Site</p>
                        <CardTitle className="text-sm">{currentUrl || 'example-bakery.com'}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center gap-4">
                        <CircularProgress value={52} label="SEO" variant="seo" size={90} />
                        <div className="grid grid-cols-2 gap-4 w-full text-center">
                          <div><p className="text-xl font-bold text-[#BC13FE]">38</p><p className="text-[10px] text-muted-foreground">AEO</p></div>
                          <div><p className="text-xl font-bold text-[#fe3f8c]">27</p><p className="text-[10px] text-muted-foreground">GEO</p></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-500/20">
                      <CardHeader className="text-center pb-2">
                        <p className="text-xs text-muted-foreground">Competitor</p>
                        <CardTitle className="text-sm">competitor-bakery.com</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center gap-4">
                        <CircularProgress value={71} label="SEO" variant="seo" size={90} />
                        <div className="grid grid-cols-2 gap-4 w-full text-center">
                          <div><p className="text-xl font-bold text-[#BC13FE]">62</p><p className="text-[10px] text-muted-foreground">AEO</p></div>
                          <div><p className="text-xl font-bold text-[#fe3f8c]">55</p><p className="text-[10px] text-muted-foreground">GEO</p></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card className="border-border/50">
                    <CardContent className="pt-6 text-center">
                      <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-bold">Winner: competitor-bakery.com</p>
                      <p className="text-xs text-muted-foreground mt-1">Outperforms across all three pillars. Their schema markup and content depth give them a significant edge in AI search.</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── AI VISIBILITY ── */}
              {demoTool === 'ai' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {DEMO_AI_VISIBILITY.map((engine, i) => (
                      <Card key={i} className={cn('border-border/30', engine.recommended ? 'border-green-500/20' : 'border-red-500/20')}>
                        <CardContent className="pt-6 text-center space-y-3">
                          <div className="h-12 w-12 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${engine.color}15`, border: `1px solid ${engine.color}30` }}>
                            <engine.icon className="h-6 w-6" style={{ color: engine.color }} />
                          </div>
                          <p className="text-sm font-bold">{engine.engine}</p>
                          {engine.recommended ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Rank #{engine.rank}</Badge>
                          ) : (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Not Found</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Your business was found by <span className="text-white font-bold">2 out of 4</span> AI engines. Gemini and ChatGPT do not currently recommend you.
                        Adding structured data, improving content depth, and building authority signals would increase your visibility across all AI platforms.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* CTA */}
              <Card className="border-[#00e5ff]/20 bg-gradient-to-r from-[#00e5ff]/5 to-[#BC13FE]/5">
                <CardContent className="pt-6 text-center space-y-3">
                  <h3 className="text-xl font-bold">Ready to see your real scores?</h3>
                  <p className="text-sm text-muted-foreground">Sign up and run a real audit on your website. Get actionable fixes tailored to your platform.</p>
                  <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold transition-colors">
                    Get Started <ArrowRight className="h-5 w-5" />
                  </Link>
                </CardContent>
              </Card>
            </>
          )}

          {/* Empty state */}
          {!isScanning && !showResults && (
            <Card className="border-border/30">
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <h2 className="text-xl font-bold">Enter a URL to see Duelly in action</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Type any website URL in the search bar above and click "Demo Scan" to see a simulated audit with SEO, AEO, and GEO scores, penalties, and AI visibility results.
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </PageShell>
  )
}
