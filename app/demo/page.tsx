'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Search, Sparkles, Bot, Loader2, ArrowRight, AlertTriangle, CheckCircle2,
  Globe, Trophy, Swords, FlaskConical, ExternalLink, Shield, Zap,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------
const DEMO_URL = 'www.example-bakery.com'

const DEMO_SCORES = { seo: 52, aeo: 38, geo: 27 }

const DEMO_PENALTIES = [
  { severity: 'critical' as const, component: 'Missing H1 Tag', points: -10, category: 'SEO', fix: 'Add a single <h1> tag with your primary keyword.' },
  { severity: 'critical' as const, component: 'No Meta Description', points: -8, category: 'SEO', fix: 'Add a meta description between 120-160 characters.' },
  { severity: 'critical' as const, component: 'No Schema Markup', points: -15, category: 'AEO', fix: 'Add LocalBusiness JSON-LD schema to your page.' },
  { severity: 'warning' as const, component: 'Low Word Count (187 words)', points: -7, category: 'SEO', fix: 'Expand content to at least 800 words with H2 subheadings.' },
  { severity: 'warning' as const, component: 'No FAQ Section', points: -10, category: 'AEO', fix: 'Add an FAQ section with 5-8 common questions and answers.' },
  { severity: 'warning' as const, component: 'Promotional Tone', points: -8, category: 'GEO', fix: 'Replace superlatives with factual, evidence-based language.' },
  { severity: 'warning' as const, component: 'Missing Alt Text (4 images)', points: -5, category: 'SEO', fix: 'Add descriptive alt text to every image.' },
  { severity: 'info' as const, component: 'No External Links', points: -3, category: 'SEO', fix: 'Link to 2-3 authoritative external sources.' },
  { severity: 'info' as const, component: 'Weak Expertise Signals', points: -6, category: 'GEO', fix: 'Add author bio, credentials, and years of experience.' },
]

const DEMO_COMPETITOR = {
  siteA: 'example-bakery.com', siteB: 'competitor-bakery.com',
  scores: { seoA: 52, seoB: 71, aeoA: 38, aeoB: 62, geoA: 27, geoB: 55 },
  winner: 'competitor-bakery.com',
}

const DEMO_AI_VISIBILITY = [
  { engine: 'Google', recommended: true, rank: 4, color: '#4285f4' },
  { engine: 'Gemini', recommended: false, rank: null, color: '#00e5ff' },
  { engine: 'ChatGPT', recommended: false, rank: null, color: '#BC13FE' },
  { engine: 'Perplexity', recommended: true, rank: 7, color: '#fe3f8c' },
]

const SCAN_PHASES = [
  'Crawling page and extracting content...',
  'Detecting site type...',
  'Analyzing content with Gemini AI...',
  'Deep AI analysis in progress...',
  'Fetching backlink profile...',
  'Calculating scores...',
  'Generating actionable fixes...',
  'Audit complete!',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DemoPage() {
  const [inputUrl, setInputUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanPhase, setScanPhase] = useState('')
  const [scanProgress, setScanProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState<'audit' | 'deep' | 'duel' | 'ai'>('audit')
  const displayUrl = inputUrl || DEMO_URL

  const handleScan = () => {
    if (isScanning) return
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

  function getGrade(score: number) {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Duelly" width={140} height={56} className="h-14 w-auto" priority />
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-[#BC13FE]/40 text-[#BC13FE] text-xs">INTERACTIVE DEMO</Badge>
            <Link href="/signup" className="px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Input */}
      {!showResults && (
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">
          <h1 className="text-4xl font-black mb-4">See What Duelly Can Do</h1>
          <p className="text-muted-foreground mb-8">Enter any URL and watch Duelly analyze it across SEO, AEO, and GEO. This is a demo — results are simulated to show you the full experience.</p>
          <div className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Enter a website URL (e.g. mybusiness.com)"
              className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00e5ff]/50 text-sm"
            />
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm shrink-0"
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isScanning ? 'Scanning...' : 'Run Demo Scan'}
            </button>
          </div>

          {/* Scan progress */}
          {isScanning && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-[#00e5ff] to-[#BC13FE] rounded-full transition-all duration-500" style={{ width: `${scanProgress}%` }} />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">{scanPhase}</p>
            </div>
          )}
        </section>
      )}

      {/* Results */}
      {showResults && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* URL header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Demo results for</p>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#00e5ff]" />
                {displayUrl}
              </h2>
            </div>
            <button onClick={() => { setShowResults(false); setInputUrl('') }} className="text-sm text-muted-foreground hover:text-foreground">
              ← New scan
            </button>
          </div>

          {/* Tool tabs */}
          <div className="flex gap-2 mb-6 border-b border-border/30 pb-3">
            {[
              { id: 'audit' as const, label: 'Pro Audit', icon: Bot, color: '#00e5ff' },
              { id: 'deep' as const, label: 'Deep Scan', icon: Sparkles, color: '#BC13FE' },
              { id: 'duel' as const, label: 'Competitor Duel', icon: Swords, color: '#fe3f8c' },
              { id: 'ai' as const, label: 'AI Visibility', icon: FlaskConical, color: '#00e5ff' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <tab.icon className="h-4 w-4" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── PRO AUDIT TAB ── */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Score circles */}
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <CircularProgress value={DEMO_SCORES.seo} label="SEO" sublabel={getGrade(DEMO_SCORES.seo)} variant="seo" />
                <CircularProgress value={DEMO_SCORES.aeo} label="AEO" sublabel={getGrade(DEMO_SCORES.aeo)} variant="aeo" />
                <CircularProgress value={DEMO_SCORES.geo} label="GEO" sublabel={getGrade(DEMO_SCORES.geo)} variant="geo" />
              </div>

              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-sm">Issues Found ({DEMO_PENALTIES.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {DEMO_PENALTIES.map((p, i) => (
                    <div key={i} className={cn('flex items-start gap-3 p-3 rounded-lg border', p.severity === 'critical' ? 'border-red-500/20 bg-red-500/5' : p.severity === 'warning' ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-border/30 bg-white/[0.02]')}>
                      {p.severity === 'critical' ? <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> : p.severity === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{p.component}</span>
                          <Badge variant="outline" className="text-[9px]">{p.category}</Badge>
                          <span className="text-xs text-red-400">{p.points} pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.fix}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── DEEP SCAN TAB ── */}
          {activeTab === 'deep' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <CircularProgress value={48} label="SEO" sublabel="F" variant="seo" />
                <CircularProgress value={35} label="AEO" sublabel="F" variant="aeo" />
                <CircularProgress value={31} label="GEO" sublabel="F" variant="geo" />
              </div>
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-sm">Sitewide Intelligence (5 pages crawled)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Pages Crawled', value: '5' },
                      { label: 'Avg Word Count', value: '312' },
                      { label: 'Missing H1s', value: '3 pages' },
                      { label: 'No Schema', value: '4 pages' },
                      { label: 'Missing Meta Desc', value: '2 pages' },
                      { label: 'Broken Links', value: '1 found' },
                      { label: 'Duplicate Titles', value: '2 pages' },
                      { label: 'Avg Load Time', value: '3.2s' },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl border border-border/30 bg-white/[0.02] p-3 text-center">
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── COMPETITOR DUEL TAB ── */}
          {activeTab === 'duel' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <Card className="border-red-500/20">
                  <CardHeader className="text-center pb-2">
                    <p className="text-xs text-muted-foreground">Your Site</p>
                    <CardTitle className="text-sm">{DEMO_COMPETITOR.siteA}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-center"><CircularProgress value={DEMO_COMPETITOR.scores.seoA} label="SEO" variant="seo" size={80} /></div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div><p className="text-lg font-bold text-[#BC13FE]">{DEMO_COMPETITOR.scores.aeoA}</p><p className="text-[10px] text-muted-foreground">AEO</p></div>
                      <div><p className="text-lg font-bold text-[#fe3f8c]">{DEMO_COMPETITOR.scores.geoA}</p><p className="text-[10px] text-muted-foreground">GEO</p></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-500/20">
                  <CardHeader className="text-center pb-2">
                    <p className="text-xs text-muted-foreground">Competitor</p>
                    <CardTitle className="text-sm">{DEMO_COMPETITOR.siteB}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-center"><CircularProgress value={DEMO_COMPETITOR.scores.seoB} label="SEO" variant="seo" size={80} /></div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div><p className="text-lg font-bold text-[#BC13FE]">{DEMO_COMPETITOR.scores.aeoB}</p><p className="text-[10px] text-muted-foreground">AEO</p></div>
                      <div><p className="text-lg font-bold text-[#fe3f8c]">{DEMO_COMPETITOR.scores.geoB}</p><p className="text-[10px] text-muted-foreground">GEO</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="border-border/50">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-bold">Winner: {DEMO_COMPETITOR.winner}</p>
                  <p className="text-xs text-muted-foreground mt-1">Outperforms across all three pillars. Their schema markup and content depth give them a significant edge in AI search.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── AI VISIBILITY TAB ── */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DEMO_AI_VISIBILITY.map((engine, i) => (
                  <Card key={i} className={cn('border-border/30', engine.recommended ? 'border-green-500/20' : 'border-red-500/20')}>
                    <CardContent className="pt-6 text-center space-y-2">
                      <div className="h-10 w-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${engine.color}15`, border: `1px solid ${engine.color}30` }}>
                        {engine.engine === 'Google' ? <Search className="h-5 w-5" style={{ color: engine.color }} /> :
                         engine.engine === 'Gemini' ? <Globe className="h-5 w-5" style={{ color: engine.color }} /> :
                         engine.engine === 'ChatGPT' ? <Bot className="h-5 w-5" style={{ color: engine.color }} /> :
                         <Sparkles className="h-5 w-5" style={{ color: engine.color }} />}
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
                    Your business was found by 2 out of 4 AI engines. Gemini and ChatGPT do not currently recommend you.
                    Adding structured data, improving content depth, and building authority signals would increase your visibility across all AI platforms.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 text-center border-t border-border/30 pt-8">
            <h3 className="text-xl font-bold mb-2">Ready to see your real scores?</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up and run a real audit on your website. Get actionable fixes tailored to your platform.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors">
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
