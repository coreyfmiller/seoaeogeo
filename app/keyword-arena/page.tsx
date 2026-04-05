"use client"

import { useState, useEffect } from "react"
import { PageShell } from "@/components/dashboard/page-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { CreditConfirmDialog } from "@/components/dashboard/credit-confirm-dialog"
import { ScanErrorDialog } from "@/components/dashboard/scan-error-dialog"
import { cn } from "@/lib/utils"
import {
  Trophy, Search, Sparkles, Bot, Clock, Crown,
  Plus, X, Globe,
  Swords, Loader2, Copy, RefreshCw, Brain
} from "lucide-react"

interface SearchResult {
  rank: number
  title: string
  url: string
  snippet: string
  displayLink: string
}

interface ArenaSite {
  url: string
  title: string
  description?: string
  siteType?: string
  scores: { seo: number | null; aeo: number | null; geo: number | null; aiQuality: number | null; overall: number | null }
  aiStatus: 'scored' | 'failed'
  aiBreakdown?: Record<string, number> | null
  isUserSite: boolean
  error?: string
  penaltyCount?: number
}

interface ArenaResult {
  keyword: string
  sites: ArenaSite[]
  userSiteRank: number | null
  totalSites: number
  scoredSites: number
  creditCost: number
}

export default function KeywordArenaPage() {
  const [keyword, setKeyword] = useState("")
  const [resultCount, setResultCount] = useState<5 | 10>(10)
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [userSiteUrl, setUserSiteUrl] = useState("")
  const [showAddSite, setShowAddSite] = useState(false)


  // Arena state
  const [arenaResult, setArenaResult] = useState<ArenaResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creditsRefunded, setCreditsRefunded] = useState(0)
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [pendingUrls, setPendingUrls] = useState<string[]>([])
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingPhase, setLoadingPhase] = useState("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [retryingUrl, setRetryingUrl] = useState<string | null>(null)

  // Progress ticker
  useEffect(() => {
    if (!isAnalyzing) { setLoadingProgress(0); setElapsedSeconds(0); setLoadingPhase(""); return }
    const start = Date.now()
    const phases = [
      { at: 0, label: "Initiating multi-site crawl..." },
      { at: 10, label: "Crawling competitor sites in parallel..." },
      { at: 30, label: "Extracting content, metadata, and schemas..." },
      { at: 50, label: "Running heuristic SEO/AEO/GEO scoring..." },
      { at: 65, label: "Running AI quality analysis on each site..." },
      { at: 80, label: "Calculating rankings and comparisons..." },
      { at: 90, label: "Building leaderboard..." },
    ]
    setLoadingPhase(phases[0].label)
    const iv = setInterval(() => {
      const el = (Date.now() - start) / 1000
      setElapsedSeconds(Math.floor(el))
      const pct = Math.min(95, Math.round(95 * (1 - Math.exp(-el / 35))))
      setLoadingProgress(pct)
      const cur = [...phases].reverse().find(p => pct >= p.at)
      if (cur) setLoadingPhase(cur.label)
    }, 300)
    return () => clearInterval(iv)
  }, [isAnalyzing])

  const handleSearch = async () => {
    if (!keyword.trim()) return
    setIsSearching(true)
    setSearchResults(null)
    setArenaResult(null)
    setError(null)
    try {
      const res = await fetch('/api/keyword-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), count: resultCount }),
      })
      const data = await res.json()
      if (data.success) {
        setSearchResults(data.results)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch {
      setError('Connection failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleStartArena = () => {
    if (!searchResults) return
    const urls = searchResults.map(r => r.url)
    if (userSiteUrl.trim()) {
      urls.unshift(userSiteUrl.trim())
    }
    setPendingUrls(urls)
    setCreditDialogOpen(true)
  }

  const handleConfirmArena = async () => {
    setCreditDialogOpen(false)
    setIsAnalyzing(true)
    setError(null)
    setCreditsRefunded(0)
    try {
      const res = await fetch('/api/keyword-arena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: pendingUrls.filter(u => u !== userSiteUrl.trim()),
          keyword: keyword.trim(),
          userSiteUrl: userSiteUrl.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))
      if (data.success) {
        setArenaResult(data.data)
      } else {
        setError(data.error || 'Arena failed')
        setCreditsRefunded(data.creditsRefunded || 0)
      }
    } catch {
      setError('Connection failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRetry = async (url: string) => {
    if (!arenaResult || retryingUrl) return
    setRetryingUrl(url)
    try {
      const res = await fetch('/api/keyword-arena/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, userSiteUrl: userSiteUrl.trim() || undefined }),
      })
      const data = await res.json()
      if (data.success && data.site) {
        // Replace the failed site with the scored one and re-sort
        setArenaResult(prev => {
          if (!prev) return prev
          const updated = prev.sites.map(s => s.url === url ? data.site : s)
          // Re-sort: scored first by overall desc, failed at bottom
          updated.sort((a, b) => {
            if (a.scores.overall !== null && b.scores.overall === null) return -1
            if (a.scores.overall === null && b.scores.overall !== null) return 1
            if (a.scores.overall === null && b.scores.overall === null) return 0
            return (b.scores.overall ?? 0) - (a.scores.overall ?? 0)
          })
          const scoredSites = updated.filter(s => s.scores.overall !== null)
          const userRank = userSiteUrl
            ? (() => { const idx = scoredSites.findIndex(s => s.isUserSite); return idx >= 0 ? idx + 1 : null })()
            : null
          return { ...prev, sites: updated, userSiteRank: userRank, scoredSites: scoredSites.length }
        })
      } else {
        setError(data.error || 'Retry failed')
      }
    } catch {
      setError('Retry connection failed')
    } finally {
      setRetryingUrl(null)
    }
  }

  const creditCost = pendingUrls.length * 10
  const scoreColor = (v: number | null) => v === null ? "text-white/20" : v >= 75 ? "text-green-500" : v >= 50 ? "text-yellow-500" : "text-red-500"

  const handleReset = () => {
    setKeyword("")
    setSearchResults(null)
    setArenaResult(null)
    setUserSiteUrl("")
    setShowAddSite(false)
    setError(null)
  }

  return (
    <PageShell apiStatus="idle" hideSearch>
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-12">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                <Trophy className="h-6 w-6 text-[#00e5ff]" />
                Keyword Arena
                <Badge className="bg-[#BC13FE]/10 text-[#BC13FE] border border-[#BC13FE]/30 text-[10px] font-black uppercase tracking-widest">AI</Badge>
              </h1>
              <p className="text-sm text-white/40 mt-1.5">Search a keyword. Battle the top-ranking sites. AI-scored leaderboard.</p>
            </div>
            {(searchResults || arenaResult) && !isAnalyzing && (
              <button onClick={handleReset}
                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 rounded-lg font-bold text-sm transition-all">
                <Search className="h-4 w-4" /> New Search
              </button>
            )}
          </div>

          <ScanErrorDialog error={error} onClose={() => setError(null)} onRetry={handleStartArena} creditsRefunded={creditsRefunded} />
          <CreditConfirmDialog
            open={creditDialogOpen}
            onConfirm={handleConfirmArena}
            onCancel={() => setCreditDialogOpen(false)}
            creditCost={creditCost}
            scanType="Keyword Arena"
            costBreakdown={`${pendingUrls.length} sites × 10 credits each = ${creditCost} credits`}
          />

          {/* ── STEP 1: Keyword Search ── */}
          {!searchResults && !arenaResult && !isAnalyzing && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#BC13FE]/8 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10 w-full max-w-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#00e5ff]/10 flex items-center justify-center mb-4">
                    <Trophy className="h-8 w-8 text-[#00e5ff]" />
                  </div>
                  <h2 className="text-2xl font-black text-white">Enter a Keyword to Battle</h2>
                  <p className="text-sm text-white/40">We&apos;ll find the top-ranking sites and score them all against each other</p>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. plumber in Toronto"
                    className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-1 focus:ring-[#00e5ff]/30 text-sm"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !keyword.trim()}
                    className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
                  </button>
                </div>

                {/* Result count toggle */}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-white/30">Analyze:</span>
                  <button
                    onClick={() => setResultCount(5)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                      resultCount === 5
                        ? "bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40"
                        : "bg-white/[0.03] text-white/40 border-white/[0.08] hover:border-white/[0.15]"
                    )}
                  >
                    Top 5 — 50 credits
                  </button>
                  <button
                    onClick={() => setResultCount(10)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                      resultCount === 10
                        ? "bg-[#BC13FE]/20 text-[#BC13FE] border-[#BC13FE]/40"
                        : "bg-white/[0.03] text-white/40 border-white/[0.08] hover:border-white/[0.15]"
                    )}
                  >
                    Top 10 — 100 credits
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review Results + Add Your Site ── */}
          {searchResults && !arenaResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="border-white/[0.06] bg-white/[0.02]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="h-5 w-5 text-[#00e5ff]" />
                        Top {searchResults.length} Results for &ldquo;{keyword}&rdquo;
                      </CardTitle>
                      <CardDescription className="text-white/30">These sites will be crawled and scored. Add your site to see where you rank.</CardDescription>
                    </div>
                    <button onClick={handleStartArena}
                      className="px-5 py-2.5 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all flex items-center gap-2 text-sm">
                      <Swords className="h-4 w-4" />
                      Start Arena Battle
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!showAddSite ? (
                    <button
                      onClick={() => setShowAddSite(true)}
                      className="w-full p-3 rounded-xl border-2 border-dashed border-[#00e5ff]/20 hover:border-[#00e5ff]/40 text-[#00e5ff]/60 hover:text-[#00e5ff] transition-all flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <Plus className="h-4 w-4" /> Add Your Site to the Battle
                    </button>
                  ) : (
                    <div className="flex gap-2 p-3 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
                      <input
                        type="text"
                        value={userSiteUrl}
                        onChange={(e) => setUserSiteUrl(e.target.value)}
                        placeholder="https://yoursite.com"
                        className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5ff]/50 text-sm"
                      />
                      <button onClick={() => { setShowAddSite(false); setUserSiteUrl("") }}
                        className="p-2 text-white/30 hover:text-white/60 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {userSiteUrl.trim() && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
                      <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/20 flex items-center justify-center">
                        <Crown className="h-4 w-4 text-[#00e5ff]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#00e5ff] truncate">{userSiteUrl.trim()}</p>
                        <p className="text-[10px] text-white/30">Your site — will be included in the battle</p>
                      </div>
                      <Badge className="bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 text-[10px]">YOUR SITE</Badge>
                    </div>
                  )}

                  {searchResults.map((result, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all">
                      <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-black text-white/40">
                        #{result.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white/80 truncate">{result.title}</p>
                        <p className="text-[10px] text-[#00e5ff]/60 truncate">{result.displayLink}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── LOADING STATE ── */}
          {isAnalyzing && (
            <div className="space-y-6 animate-in fade-in">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden relative">
                <div className="h-1 w-full bg-white/[0.04]">
                  <div className="h-full bg-gradient-to-r from-[#00e5ff] via-[#BC13FE] to-[#fe3f8c] transition-all duration-700" style={{ width: `${loadingProgress}%` }} />
                </div>
                <div className="py-12 flex flex-col items-center gap-6">
                  <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#00e5ff] border-r-[#BC13FE] border-b-[#fe3f8c] border-l-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-white tabular-nums">{loadingProgress}%</span>
                    </div>
                  </div>
                  <div className="text-center space-y-1.5">
                    <h2 className="text-xl font-black text-white">Arena Battle in Progress</h2>
                    <p className="text-sm text-white/40 max-w-md">{loadingPhase}</p>
                  </div>
                  <div className="w-full max-w-md">
                    <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00e5ff] via-[#BC13FE] to-[#fe3f8c] rounded-full transition-all duration-700" style={{ width: `${loadingProgress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-white/30 tabular-nums">{loadingProgress}%</span>
                      <span className="text-[10px] text-white/30 tabular-nums flex items-center gap-1"><Clock className="h-3 w-3" />{elapsedSeconds}s</span>
                    </div>
                  </div>
                  <Badge className="border-[#BC13FE]/30 text-[#BC13FE] bg-[#BC13FE]/5 px-4 py-1.5 text-sm font-bold">
                    &ldquo;{keyword}&rdquo; — {pendingUrls.length} sites
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS: Leaderboard ── */}
          {arenaResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Keyword + Summary */}
              <div className="rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/[0.03] backdrop-blur-xl p-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00e5ff]/5 rounded-full blur-[60px] pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-[#00e5ff]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        Arena Results: &ldquo;{arenaResult.keyword}&rdquo;
                        <InfoTooltip content="Sites are crawled, heuristic-scored (SEO/AEO/GEO), and AI-scored (domain health). Overall = average of all 4. Failed AI sites show '—' with a retry option." />
                      </h3>
                      <p className="text-[10px] text-white/30">
                        {arenaResult.scoredSites}/{arenaResult.totalSites} sites scored • {arenaResult.creditCost} credits used
                        {arenaResult.totalSites - arenaResult.scoredSites > 0 && (
                          <span className="text-yellow-500"> • {arenaResult.totalSites - arenaResult.scoredSites} failed AI</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {arenaResult.userSiteRank ? (
                    <div className="text-right">
                      <p className="text-[10px] text-white/30 uppercase font-bold">Your Rank</p>
                      <p className="text-2xl font-black text-[#00e5ff]">#{arenaResult.userSiteRank}<span className="text-sm text-white/30">/{arenaResult.scoredSites}</span></p>
                    </div>
                  ) : userSiteUrl && (
                    <div className="text-right">
                      <p className="text-[10px] text-white/30 uppercase font-bold">Your Rank</p>
                      <p className="text-sm font-black text-yellow-500">Unscored</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Copy leaderboard */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const text = `KEYWORD ARENA: "${arenaResult.keyword}"\n${'='.repeat(50)}\n\n` +
                      arenaResult.sites.map((s, i) => {
                        const scored = s.scores.overall !== null
                        return `#${scored ? i + 1 : '—'} ${s.isUserSite ? '⭐ ' : ''}${s.url}\n   ${scored
                          ? `SEO: ${s.scores.seo} | AEO: ${s.scores.aeo} | GEO: ${s.scores.geo} | AI: ${s.scores.aiQuality} | Overall: ${s.scores.overall}`
                          : 'N/A — AI scoring failed'}`
                      }).join('\n\n')
                    navigator.clipboard.writeText(text)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white/80 transition-colors"
                >
                  <Copy className="h-3 w-3" /> Copy Leaderboard
                </button>
              </div>

              {/* Leaderboard Table */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Rank</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Site</th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#00e5ff]/60">SEO</th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#BC13FE]/60">AEO</th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#fe3f8c]/60">GEO</th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#00e5ff]/40">
                          <span className="flex items-center justify-center gap-1"><Brain className="h-3 w-3" />AI</span>
                        </th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white/40">Overall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arenaResult.sites.map((site, i) => {
                        const scored = site.scores.overall !== null
                        const scoredIndex = scored ? arenaResult.sites.slice(0, i).filter(s => s.scores.overall !== null).length : -1
                        const isFirst = scoredIndex === 0 && scored
                        const isUser = site.isUserSite
                        const isRetrying = retryingUrl === site.url
                        return (
                          <tr key={i} className={cn(
                            "border-b border-white/[0.04] transition-colors",
                            isUser && scored && "bg-[#00e5ff]/[0.04]",
                            isFirst && !isUser && "bg-yellow-500/[0.03]",
                            !scored && "opacity-60"
                          )}>
                            <td className="px-4 py-3">
                              {scored ? (
                                <div className="flex items-center gap-2">
                                  {isFirst ? (
                                    <div className="h-7 w-7 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                      <Crown className="h-3.5 w-3.5 text-yellow-400" />
                                    </div>
                                  ) : (
                                    <div className="h-7 w-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-black text-white/40">
                                      {scoredIndex + 1}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-white/[0.04] flex items-center justify-center text-xs text-white/20">—</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="min-w-0">
                                  <p className={cn("text-sm font-bold truncate max-w-[280px]", isUser ? "text-[#00e5ff]" : "text-white/80")}>
                                    {site.title || site.url}
                                  </p>
                                  <p className="text-[10px] text-white/30 truncate max-w-[280px]">{site.url}</p>
                                </div>
                                {isUser && <Badge className="shrink-0 bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 text-[8px] font-black">YOU</Badge>}
                                {!scored && !site.error && (
                                  <button
                                    onClick={() => handleRetry(site.url)}
                                    disabled={isRetrying}
                                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-bold hover:bg-yellow-500/20 transition-all disabled:opacity-50"
                                  >
                                    {isRetrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                    Retry
                                  </button>
                                )}
                                {site.error && (
                                  <Badge className="shrink-0 bg-red-500/10 text-red-400 border-red-500/30 text-[8px]">ERROR</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-sm font-black tabular-nums", scoreColor(site.scores.seo))}>
                                {site.scores.seo !== null ? site.scores.seo : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-sm font-black tabular-nums", scoreColor(site.scores.aeo))}>
                                {site.scores.aeo !== null ? site.scores.aeo : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-sm font-black tabular-nums", scoreColor(site.scores.geo))}>
                                {site.scores.geo !== null ? site.scores.geo : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-sm font-black tabular-nums", scoreColor(site.scores.aiQuality))}>
                                {site.scores.aiQuality !== null ? site.scores.aiQuality : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-lg font-black tabular-nums", scoreColor(site.scores.overall))}>
                                {site.scores.overall !== null ? site.scores.overall : '—'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Score Distribution Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                  { label: "SEO", color: "#00e5ff", icon: <Search className="h-4 w-4" />, key: "seo" as const },
                  { label: "AEO", color: "#BC13FE", icon: <Sparkles className="h-4 w-4" />, key: "aeo" as const },
                  { label: "GEO", color: "#fe3f8c", icon: <Bot className="h-4 w-4" />, key: "geo" as const },
                  { label: "AI Quality", color: "#00e5ff", icon: <Brain className="h-4 w-4" />, key: "aiQuality" as const },
                ] as const).map(cat => {
                  const scored = arenaResult.sites.filter(s => s.scores[cat.key] !== null)
                  if (scored.length === 0) return null
                  const sorted = [...scored].sort((a, b) => (b.scores[cat.key] ?? 0) - (a.scores[cat.key] ?? 0))
                  const leader = sorted[0]
                  const userSite = sorted.find(s => s.isUserSite)
                  return (
                    <div key={cat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}15`, color: cat.color }}>
                          {cat.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white/50">{cat.label} Leader</span>
                      </div>
                      <p className="text-sm font-bold text-white/80 truncate">{leader?.title || leader?.url}</p>
                      <p className="text-2xl font-black tabular-nums mt-1" style={{ color: cat.color }}>{leader?.scores[cat.key]}</p>
                      {userSite && (
                        <p className="text-[10px] text-white/30 mt-2">
                          Your score: <span className={cn("font-bold", scoreColor(userSite.scores[cat.key]))}>{userSite.scores[cat.key]}</span>
                          {' '}({(userSite.scores[cat.key] ?? 0) >= (leader.scores[cat.key] ?? 0) ? '🏆 Leading' : `${(leader.scores[cat.key] ?? 0) - (userSite.scores[cat.key] ?? 0)} pts behind`})
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </PageShell>
  )
}
