"use client"

import { useState, useEffect } from "react"
import { PageShell } from "@/components/dashboard/page-shell"
import { saveScanToHistory, wasHistoryCleared } from '@/lib/scan-history'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreditConfirmDialog } from "@/components/dashboard/credit-confirm-dialog"
import { ScanErrorDialog } from "@/components/dashboard/scan-error-dialog"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { ExpertAnalysis } from "@/components/dashboard/expert-analysis"
import { DownloadReportButton } from "@/components/dashboard/download-report-button"
import { LinkBuildingIntelligence } from "@/components/dashboard/link-building-intelligence"
import { LearnMore } from "@/components/ui/learn-more"
import { safeSetItem } from "@/lib/safe-storage"
import { cn } from "@/lib/utils"
import {
  Trophy, Search, Sparkles, Bot, Clock, Crown,
  Plus, X, Globe, ChevronDown, ChevronUp,
  Swords, Loader2, Copy, RefreshCw,
  ArrowRight, AlertTriangle, CheckCircle2, Target, Zap
} from "lucide-react"
import Link from "next/link"

interface SearchResult {
  rank: number
  title: string
  url: string
  snippet: string
  displayLink: string
}

interface ScanDetails {
  wordCount: number
  h1Count: number
  h2Count: number
  internalLinks: number
  externalLinks: number
  totalImages: number
  imagesWithAlt: number
  hasSchema: boolean
  schemaTypes: string[]
  schemaScore: number
  hasOgTitle: boolean
  hasOgDescription: boolean
  hasOgImage: boolean
  hasTwitterCard: boolean
  hasViewport: boolean
  titleLength: number
  descriptionLength: number
  isHttps: boolean
  responseTimeMs: number
  platform: string | null
}

interface ArenaSite {
  url: string
  title: string
  description?: string
  siteType?: string
  scores: { seo: number | null; aeo: number | null; geo: number | null; overall: number | null }
  googleRank: number | null
  aiStatus: 'scored' | 'failed'
  isUserSite: boolean
  error?: string
  scanDetails: ScanDetails | null
}

interface ArenaAverages {
  seo: number; aeo: number; geo: number; overall: number
  wordCount: number; schemaAdoption: number; totalSites: number
  avgSchemaScore: number; ogAdoption: number; altTextCoverage: number
}

interface ArenaResult {
  keyword: string
  sites: ArenaSite[]
  userSiteRank: number | null
  totalSites: number
  scoredSites: number
  creditCost: number
  arenaAvg: ArenaAverages | null
  expertAnalysis?: string | { bottomLine: string; keyInsight: string; priorityAction: string } | null
  backlinkData?: { metrics: any; backlinks: any[] } | null
  competitorDA?: { domain: string; url: string; domainAuthority: number } | null
}

/** Normalize URL for comparison (strip protocol, www, trailing slash) */
function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
}

/** Generate gap insights comparing user site vs arena */
function generateInsights(userSite: ArenaSite, allSites: ArenaSite[], avg: ArenaAverages, backlinkData?: any, competitorDA?: any) {
  const insights: { type: 'gap' | 'strength'; metric: string; detail: string; severity: 'critical' | 'warning' | 'good' }[] = []
  const ud = userSite.scanDetails
  if (!ud) return insights

  const competitors = allSites.filter(s => !s.isUserSite && s.scanDetails && s.scores.overall !== null)
  const top3 = competitors.slice(0, 3)
  const top3Details = top3.map(s => s.scanDetails!).filter(Boolean)

  // Domain Authority gap (most impactful — show first)
  if (backlinkData?.metrics?.domainAuthority != null && competitorDA?.domainAuthority != null) {
    const userDA = backlinkData.metrics.domainAuthority
    const compDA = competitorDA.domainAuthority
    const gap = compDA - userDA
    if (gap > 20) {
      insights.push({ type: 'gap', metric: 'Domain Authority', detail: `Your Domain Authority is ${userDA} — top competitor has ${compDA}. This ${gap}-point gap is the biggest factor holding you back in rankings.`, severity: 'critical' })
    } else if (gap > 5) {
      insights.push({ type: 'gap', metric: 'Domain Authority', detail: `Your Domain Authority (${userDA}) is ${gap} points behind the top competitor (${compDA}). Targeted link building can close this gap.`, severity: 'warning' })
    } else if (gap <= 0) {
      insights.push({ type: 'strength', metric: 'Domain Authority', detail: `Your Domain Authority (${userDA}) is competitive with or ahead of the top competitor (${compDA}).`, severity: 'good' })
    }
  }

  // SEO score vs arena average
  const us = userSite.scores
  if (us.seo !== null && avg.seo > 0 && us.seo < avg.seo - 10) {
    insights.push({ type: 'gap', metric: 'SEO Score', detail: `Your SEO score (${us.seo}) is ${avg.seo - us.seo} points below the arena average (${avg.seo})`, severity: us.seo < avg.seo - 20 ? 'critical' : 'warning' })
  } else if (us.seo !== null && us.seo >= avg.seo) {
    insights.push({ type: 'strength', metric: 'SEO Score', detail: `Your SEO score (${us.seo}) is at or above the arena average (${avg.seo})`, severity: 'good' })
  }

  // Word count comparison
  const avgWords = top3Details.length > 0 ? Math.round(top3Details.reduce((a, d) => a + d.wordCount, 0) / top3Details.length) : avg.wordCount
  if (ud.wordCount < avgWords * 0.5) {
    insights.push({ type: 'gap', metric: 'Content Depth', detail: `Your page has ${ud.wordCount} words — top 3 competitors average ${avgWords}. You're in the bottom tier for content depth.`, severity: 'critical' })
  } else if (ud.wordCount < avgWords * 0.8) {
    insights.push({ type: 'gap', metric: 'Content Depth', detail: `${ud.wordCount} words vs top 3 average of ${avgWords}`, severity: 'warning' })
  } else if (ud.wordCount >= avgWords) {
    insights.push({ type: 'strength', metric: 'Content Depth', detail: `${ud.wordCount} words — more than the top 3 average (${avgWords})`, severity: 'good' })
  }

  // Heading structure
  const avgH2 = top3Details.length > 0 ? Math.round(top3Details.reduce((a, d) => a + d.h2Count, 0) / top3Details.length) : 0
  if (ud.h2Count === 0 && avgH2 > 0) {
    insights.push({ type: 'gap', metric: 'Heading Structure', detail: `You have no H2 headings. Top 3 competitors average ${avgH2}. Headings help search engines and AI understand your content structure.`, severity: 'critical' })
  } else if (ud.h2Count < avgH2 * 0.5 && avgH2 >= 3) {
    insights.push({ type: 'gap', metric: 'Heading Structure', detail: `You have ${ud.h2Count} H2 headings — top 3 average ${avgH2}. More headings = better content organization for search engines.`, severity: 'warning' })
  }

  // Schema comparison with type details
  const competitorsWithSchema = competitors.filter(s => s.scanDetails?.hasSchema).length
  if (!ud.hasSchema && competitorsWithSchema > 0) {
    const compSchemaTypes = competitors.filter(s => s.scanDetails?.hasSchema).flatMap(s => s.scanDetails?.schemaTypes || [])
    const uniqueTypes = [...new Set(compSchemaTypes)].slice(0, 5)
    insights.push({ type: 'gap', metric: 'Schema Markup', detail: `${competitorsWithSchema}/${competitors.length} competitors have structured data (${uniqueTypes.join(', ') || 'various types'}) — you have none. This means they get rich results in Google and you don't.`, severity: 'critical' })
  } else if (ud.hasSchema && competitorsWithSchema === 0) {
    insights.push({ type: 'strength', metric: 'Schema Markup', detail: `You have schema markup (${ud.schemaTypes.join(', ')}) — none of your competitors do. You're ahead on rich results.`, severity: 'good' })
  } else if (ud.hasSchema && ud.schemaScore < avg.avgSchemaScore) {
    insights.push({ type: 'gap', metric: 'Schema Quality', detail: `Your schema score (${ud.schemaScore}) is below the arena average (${avg.avgSchemaScore})`, severity: 'warning' })
  }

  // Response time / site speed
  const avgResponseTime = top3Details.length > 0 ? Math.round(top3Details.reduce((a, d) => a + d.responseTimeMs, 0) / top3Details.length) : 0
  if (ud.responseTimeMs > 3000 && avgResponseTime < 2000) {
    insights.push({ type: 'gap', metric: 'Site Speed', detail: `Your site loads in ${(ud.responseTimeMs / 1000).toFixed(1)}s — top 3 competitors average ${(avgResponseTime / 1000).toFixed(1)}s. Google penalizes slow sites.`, severity: 'critical' })
  } else if (ud.responseTimeMs > 2000 && avgResponseTime < ud.responseTimeMs * 0.7) {
    insights.push({ type: 'gap', metric: 'Site Speed', detail: `Your site loads in ${(ud.responseTimeMs / 1000).toFixed(1)}s — competitors are faster at ${(avgResponseTime / 1000).toFixed(1)}s average`, severity: 'warning' })
  } else if (ud.responseTimeMs < avgResponseTime && ud.responseTimeMs < 2000) {
    insights.push({ type: 'strength', metric: 'Site Speed', detail: `Your site loads in ${(ud.responseTimeMs / 1000).toFixed(1)}s — faster than the top 3 average (${(avgResponseTime / 1000).toFixed(1)}s)`, severity: 'good' })
  }

  // HTTPS
  if (!ud.isHttps) {
    const competitorsWithHttps = competitors.filter(s => s.scanDetails?.isHttps).length
    if (competitorsWithHttps > 0) {
      insights.push({ type: 'gap', metric: 'HTTPS Security', detail: `Your site doesn't use HTTPS. ${competitorsWithHttps}/${competitors.length} competitors do. Google marks non-HTTPS sites as "Not Secure".`, severity: 'critical' })
    }
  }

  // Open Graph
  const hasFullOg = ud.hasOgTitle && ud.hasOgDescription && ud.hasOgImage
  if (!hasFullOg) {
    const missing = [!ud.hasOgTitle && 'og:title', !ud.hasOgDescription && 'og:description', !ud.hasOgImage && 'og:image'].filter(Boolean)
    insights.push({ type: 'gap', metric: 'Social Sharing', detail: `Missing ${missing.join(', ')} — links shared on social media won't display properly`, severity: 'warning' })
  }

  // Alt text
  if (ud.totalImages > 0) {
    const altPct = Math.round((ud.imagesWithAlt / ud.totalImages) * 100)
    if (altPct < 50) {
      insights.push({ type: 'gap', metric: 'Image Alt Text', detail: `Only ${altPct}% of images have alt text (${ud.imagesWithAlt}/${ud.totalImages}). Search engines can't understand your images.`, severity: 'critical' })
    } else if (altPct < 90) {
      insights.push({ type: 'gap', metric: 'Image Alt Text', detail: `${altPct}% alt text coverage — aim for 100%`, severity: 'warning' })
    }
  }

  // AEO/GEO score comparisons
  if (us.aeo !== null && avg.aeo > 0 && us.aeo < avg.aeo - 10) {
    insights.push({ type: 'gap', metric: 'AEO Score', detail: `Your AEO score (${us.aeo}) is ${avg.aeo - us.aeo} points below the arena average (${avg.aeo}). AI engines are less likely to cite your content.`, severity: us.aeo < avg.aeo - 20 ? 'critical' : 'warning' })
  }
  if (us.geo !== null && avg.geo > 0 && us.geo < avg.geo - 10) {
    insights.push({ type: 'gap', metric: 'GEO Score', detail: `Your GEO score (${us.geo}) is ${avg.geo - us.geo} points below the arena average (${avg.geo}). You're less visible in AI-generated search results.`, severity: us.geo < avg.geo - 20 ? 'critical' : 'warning' })
  }

  // Platform comparison
  if (ud.platform) {
    const competitorPlatforms = competitors.filter(s => s.scanDetails?.platform).map(s => s.scanDetails!.platform!)
    const uniquePlatforms = [...new Set(competitorPlatforms)]
    if (uniquePlatforms.length > 0 && !uniquePlatforms.includes(ud.platform)) {
      insights.push({ type: 'gap', metric: 'Platform', detail: `You're on ${ud.platform}. Competitors use ${uniquePlatforms.slice(0, 3).join(', ')}. Make sure your platform has equivalent SEO capabilities.`, severity: 'warning' })
    }
  }

  return insights
}

export default function KeywordArenaV3Page() {
  const [keyword, setKeyword] = useState("")
  const [resultCount, setResultCount] = useState<5 | 10>(10)
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // User site selection — mandatory before battle
  const [userSiteUrl, setUserSiteUrl] = useState("")
  const [userSiteConfirmed, setUserSiteConfirmed] = useState(false)
  const [selectedFromResults, setSelectedFromResults] = useState<number | null>(null) // index in search results
  const [showManualAdd, setShowManualAdd] = useState(false)

  const [arenaResult, setArenaResult] = useState<ArenaResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creditsRefunded, setCreditsRefunded] = useState(0)
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [pendingUrls, setPendingUrls] = useState<string[]>([])
  const [pendingGoogleRanks, setPendingGoogleRanks] = useState<Record<string, number>>({})
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingPhase, setLoadingPhase] = useState("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [retryingUrl, setRetryingUrl] = useState<string | null>(null)
  const [expandedSite, setExpandedSite] = useState<string | null>(null)

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    if (wasHistoryCleared()) return
    const savedKeyword = localStorage.getItem("arena_v3_keyword")
    const savedUserSite = localStorage.getItem("arena_v3_userSite")
    const savedResult = localStorage.getItem("arena_v3_result")
    if (savedKeyword) setKeyword(savedKeyword)
    if (savedUserSite) {
      setUserSiteUrl(savedUserSite)
      setUserSiteConfirmed(true)
    }
    if (savedResult) {
      try { setArenaResult(JSON.parse(savedResult)) } catch {}
    }
  }, [])

  // Save state to sessionStorage when results change
  useEffect(() => {
    if (typeof window === "undefined") return
    if (keyword) safeSetItem("arena_v3_keyword", keyword)
    if (userSiteUrl) safeSetItem("arena_v3_userSite", userSiteUrl)
    if (arenaResult) safeSetItem("arena_v3_result", JSON.stringify(arenaResult))
  }, [keyword, userSiteUrl, arenaResult])

  // Save to scan history for dashboard
  useEffect(() => {
    if (!arenaResult || !keyword) return
    const userSite = arenaResult.sites.find(s => s.isUserSite)
    saveScanToHistory({
      url: `${keyword} (${arenaResult.totalSites} sites)`,
      type: 'keyword-arena',
      scores: userSite?.scores?.seo != null ? {
        seo: userSite.scores.seo ?? 0,
        aeo: userSite.scores.aeo ?? 0,
        geo: userSite.scores.geo ?? 0,
      } : undefined,
      timestamp: new Date().toISOString(),
    }, arenaResult)
  }, [arenaResult])

  useEffect(() => {
    if (!isAnalyzing) { setLoadingProgress(0); setElapsedSeconds(0); setLoadingPhase(""); return }
    const start = Date.now()
    const phases = [
      { at: 0, label: "Initiating multi-site crawl..." },
      { at: 8, label: "Crawling competitor sites..." },
      { at: 20, label: "Extracting content, metadata, and schemas..." },
      { at: 35, label: "Running AI analysis on each site..." },
      { at: 55, label: "AI scoring in progress (batched to avoid rate limits)..." },
      { at: 75, label: "Calculating SEO/AEO/GEO scores..." },
      { at: 88, label: "Building leaderboard & insights..." },
    ]
    setLoadingPhase(phases[0].label)
    const iv = setInterval(() => {
      const el = (Date.now() - start) / 1000
      setElapsedSeconds(Math.floor(el))
      const pct = Math.min(95, Math.round(95 * (1 - Math.exp(-el / 50))))
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
    setError(null)
    setUserSiteUrl("")
    setUserSiteConfirmed(false)
    setSelectedFromResults(null)
    setShowManualAdd(false)
    try {
      const res = await fetch('/api/keyword-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), count: resultCount }),
      })
      const data = await res.json()
      if (data.success) {
        setSearchResults(data.results)
        setArenaResult(null) // Clear old arena results only after new search succeeds
      }
      else setError(data.error || 'Search failed')
    } catch { setError('Connection failed') }
    finally { setIsSearching(false) }
  }

  const handleSelectFromResults = (index: number) => {
    if (!searchResults) return
    const result = searchResults[index]
    setSelectedFromResults(index)
    setUserSiteUrl(result.url)
    setUserSiteConfirmed(true)
    setShowManualAdd(false)
  }

  const handleConfirmManualSite = () => {
    if (!userSiteUrl.trim()) return
    let url = userSiteUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    setUserSiteUrl(url)
    setUserSiteConfirmed(true)
    setSelectedFromResults(null)
  }

  const handleClearSiteSelection = () => {
    setUserSiteUrl("")
    setUserSiteConfirmed(false)
    setSelectedFromResults(null)
    setShowManualAdd(false)
  }

  const handleStartArena = () => {
    if (!searchResults || !userSiteConfirmed) return
    // Build URL list: user's site + search results (drop last result if user site is not from results)
    let urls = searchResults.map(r => r.url)
    const googleRanks: Record<string, number> = {}
    searchResults.forEach(r => { googleRanks[r.url] = r.rank })

    if (selectedFromResults !== null) {
      // User selected from results — all results stay, their site is tagged
      googleRanks[userSiteUrl] = searchResults[selectedFromResults].rank
    } else {
      // User added manually — drop the last result to keep total at resultCount
      urls = urls.slice(0, urls.length - 1)
      urls.unshift(userSiteUrl)
      // Manual add = not ranked for this keyword
    }

    setPendingUrls(urls)
    setPendingGoogleRanks(googleRanks)
    setCreditDialogOpen(true)
  }

  const handleConfirmArena = async () => {
    setCreditDialogOpen(false)
    setIsAnalyzing(true)
    setError(null)
    setCreditsRefunded(0)
    try {
      const res = await fetch('/api/keyword-arena-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: pendingUrls.filter(u => u !== userSiteUrl),
          keyword: keyword.trim(),
          userSiteUrl: userSiteUrl || undefined,
          googleRanks: pendingGoogleRanks,
        }),
      })
      const data = await res.json()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))
      if (data.success) setArenaResult(data.data)
      else { setError(data.error || 'Arena failed'); setCreditsRefunded(data.creditsRefunded || 0) }
    } catch { setError('Connection failed') }
    finally { setIsAnalyzing(false) }
  }

  const handleRetry = async (url: string) => {
    if (!arenaResult || retryingUrl) return
    setRetryingUrl(url)
    try {
      const site = arenaResult.sites.find(s => s.url === url)
      const res = await fetch('/api/keyword-arena-v3/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, userSiteUrl: userSiteUrl || undefined, googleRank: site?.googleRank }),
      })
      const data = await res.json()
      if (data.success && data.site) {
        setArenaResult(prev => {
          if (!prev) return prev
          const updated = prev.sites.map(s => s.url === url ? data.site : s)
          updated.sort((a, b) => {
            if (a.scores.overall !== null && b.scores.overall === null) return -1
            if (a.scores.overall === null && b.scores.overall !== null) return 1
            return (b.scores.overall ?? 0) - (a.scores.overall ?? 0)
          })
          const scored = updated.filter(s => s.scores.overall !== null)
          const rank = userSiteUrl ? (() => { const idx = scored.findIndex(s => s.isUserSite); return idx >= 0 ? idx + 1 : null })() : null
          return { ...prev, sites: updated, userSiteRank: rank, scoredSites: scored.length }
        })
      } else {
        // Update the site's error message inline instead of showing a dialog
        const errorMsg = data.error || 'Retry failed'
        setArenaResult(prev => {
          if (!prev) return prev
          const updated = prev.sites.map(s => s.url === url ? { ...s, error: errorMsg } : s)
          return { ...prev, sites: updated }
        })
      }
    } catch {
      // Network/502 error — update inline
      setArenaResult(prev => {
        if (!prev) return prev
        const updated = prev.sites.map(s => s.url === url ? { ...s, error: 'This site could not be reached. It may be blocking automated crawlers or experiencing downtime.' } : s)
        return { ...prev, sites: updated }
      })
    }
    finally { setRetryingUrl(null) }
  }

  const creditCost = 10
  const scoreColor = (v: number | null) => v === null ? "text-white/20" : v >= 75 ? "text-green-500" : v >= 50 ? "text-yellow-500" : "text-red-500"

  const handleReset = () => {
    setKeyword(""); setSearchResults(null); setArenaResult(null)
    setUserSiteUrl(""); setUserSiteConfirmed(false); setSelectedFromResults(null)
    setShowManualAdd(false); setError(null); setExpandedSite(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("arena_v3_keyword")
      localStorage.removeItem("arena_v3_userSite")
      localStorage.removeItem("arena_v3_result")
    }
  }

  // Derived data for results
  const userSite = arenaResult?.sites.find(s => s.isUserSite) || null
  const insights = userSite && arenaResult?.arenaAvg ? generateInsights(userSite, arenaResult.sites, arenaResult.arenaAvg, arenaResult.backlinkData, arenaResult.competitorDA) : []
  const gaps = insights.filter(i => i.type === 'gap')
  const strengths = insights.filter(i => i.type === 'strength')

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
              </h1>
              <p className="text-sm text-white/60 mt-1.5">Search a keyword. Select your site. See how you stack up with AI scoring.</p>
            </div>
          </div>

          <ScanErrorDialog error={error} onClose={() => setError(null)} onRetry={handleStartArena} creditsRefunded={creditsRefunded} />
          <CreditConfirmDialog open={creditDialogOpen} onConfirm={handleConfirmArena} onCancel={() => setCreditDialogOpen(false)}
            creditCost={creditCost} scanType="Keyword Arena" costBreakdown="10 credits per Keyword Arena run" />

          {/* ── Persistent Keyword Search Bar (always visible) ── */}
          <div className="mb-6 flex items-center gap-2">
            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter a keyword to battle (e.g. plumber in Toronto)"
              className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-1 focus:ring-[#00e5ff]/30 text-sm" />
            <button onClick={handleSearch} disabled={isSearching || !keyword.trim() || isAnalyzing}
              className="px-5 py-2.5 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shrink-0">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
            </button>
          </div>
          {arenaResult && !isAnalyzing && (
            <div className="flex items-center gap-2 justify-end mb-6 -mt-4 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  const text = `KEYWORD ARENA: "${arenaResult.keyword}"\n${'='.repeat(50)}\n\n` +
                    arenaResult.sites.map((s, i) => {
                      const scored = s.scores.overall !== null
                      return `#${scored ? i + 1 : '—'} ${s.isUserSite ? '* ' : ''}${s.url}\n   ${scored
                        ? `SEO: ${s.scores.seo} | AEO: ${s.scores.aeo} | GEO: ${s.scores.geo} | Overall: ${s.scores.overall}${s.googleRank ? ` | Google: #${s.googleRank}` : ''}`
                        : 'N/A'}`
                    }).join('\n\n')
                  navigator.clipboard.writeText(text)
                }}
                className="px-4 py-2 rounded-lg border border-[#00e5ff]/30 bg-[#00e5ff]/5 text-xs font-bold text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-colors flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" /> Copy Report
              </button>
              <DownloadReportButton
                filename={`duelly-keyword-arena-${arenaResult.keyword.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`}
                generatePdf={async () => {
                  const { generatePdfBlob } = await import('@/lib/pdf/generate')
                  const { KeywordArenaReport } = await import('@/lib/pdf/keyword-arena-report')
                  const React = (await import('react')).default
                  return generatePdfBlob(React.createElement(KeywordArenaReport, {
                    keyword: arenaResult.keyword, date: new Date().toLocaleDateString(),
                    userSiteUrl: userSiteUrl, userRank: arenaResult.userSiteRank, totalSites: arenaResult.totalSites,
                    sites: arenaResult.sites,
                  }))
                }}
              />
            </div>
          )}

          {/* ── STEP 1: Keyword Search (hero version, only when no results) ── */}
          {!searchResults && !arenaResult && !isAnalyzing && !isSearching && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#BC13FE]/8 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 w-full max-w-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#00e5ff]/10 flex items-center justify-center mb-4">
                    <Trophy className="h-8 w-8 text-[#00e5ff]" />
                  </div>
                  <h2 className="text-2xl font-black text-white">Enter a Keyword to Battle</h2>
                  <p className="text-sm text-white/60">We&apos;ll find the top-ranking sites and score them all against each other</p>
                </div>
                <div className="flex gap-3">
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. plumber in Toronto"
                    className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-1 focus:ring-[#00e5ff]/30 text-sm" />
                  <button onClick={handleSearch} disabled={isSearching || !keyword.trim()}
                    className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
                  </button>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-white/60">Analyze:</span>
                  <button onClick={() => setResultCount(5)} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    resultCount === 5 ? "bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40" : "bg-white/[0.03] text-white/60 border-white/[0.08] hover:border-white/[0.15]")}>
                    Top 5
                  </button>
                  <button onClick={() => setResultCount(10)} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    resultCount === 10 ? "bg-[#BC13FE]/20 text-[#BC13FE] border-[#BC13FE]/40" : "bg-white/[0.03] text-white/60 border-white/[0.08] hover:border-white/[0.15]")}>
                    Top 10
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review Results + Select Your Site (MANDATORY) ── */}
          {searchResults && !arenaResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in">
              {/* Your Site Selection — Required */}
              <Card className="border-[#00e5ff]/30 bg-[#00e5ff]/[0.03]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Crown className="h-5 w-5 text-[#00e5ff]" />
                    Select Your Site
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[9px]">REQUIRED</Badge>
                  </CardTitle>
                  <CardDescription className="text-white/70">Look for your website in the search results below and click it. If it&apos;s not listed, add it manually.</CardDescription>
                </CardHeader>
                <CardContent>
                  {userSiteConfirmed ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#00e5ff]/40 bg-[#00e5ff]/10">
                      <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/20 flex items-center justify-center"><Crown className="h-4 w-4 text-[#00e5ff]" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#00e5ff] truncate">{userSiteUrl}</p>
                        <p className="text-xs text-white/60">
                          {selectedFromResults !== null ? `Google Rank #${searchResults[selectedFromResults].rank} for "${keyword}"` : 'Not ranked in search results — added manually'}
                        </p>
                      </div>
                      <button onClick={handleClearSiteSelection} className="p-1.5 text-white/50 hover:text-white/80 transition-colors"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-[#00e5ff] text-center font-bold animate-pulse">👇 Click your site in the list below to select it</p>
                      {!showManualAdd ? (
                        <button onClick={() => setShowManualAdd(true)}
                          className="w-full p-3 rounded-xl border-2 border-dashed border-[#00e5ff]/20 hover:border-[#00e5ff]/40 text-[#00e5ff]/60 hover:text-[#00e5ff] transition-all flex items-center justify-center gap-2 text-sm font-bold">
                          <Plus className="h-4 w-4" /> Don&apos;t see your site? Add it manually
                        </button>
                      ) : (
                        <div className="flex gap-2 p-3 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
                          <input type="text" value={userSiteUrl} onChange={(e) => setUserSiteUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmManualSite()}
                            placeholder="https://yoursite.com"
                            className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5ff]/50 text-sm" />
                          <button onClick={handleConfirmManualSite} disabled={!userSiteUrl.trim()}
                            className="px-4 py-2 bg-[#00e5ff] text-black font-bold rounded-lg text-sm disabled:opacity-50 transition-all">
                            Confirm
                          </button>
                          <button onClick={() => { setShowManualAdd(false); setUserSiteUrl("") }} className="p-2 text-white/50 hover:text-white/80 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Search Results List */}
              <Card className="border-white/[0.06] bg-white/[0.02]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="h-5 w-5 text-[#00e5ff]" />
                        Top {searchResults.length} Results for &ldquo;{keyword}&rdquo;
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        {userSiteConfirmed
                          ? selectedFromResults !== null
                            ? `Your site is #${searchResults[selectedFromResults].rank} — all ${searchResults.length} sites will be scored.`
                            : `Your site will replace result #${searchResults.length} — ${searchResults.length} sites total.`
                          : 'Click any result to select it as your site, then start the battle.'}
                      </CardDescription>
                    </div>
                    <button onClick={handleStartArena} disabled={!userSiteConfirmed}
                      className={cn("px-5 py-2.5 font-black rounded-xl transition-all flex items-center gap-2 text-sm",
                        userSiteConfirmed
                          ? "bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black"
                          : "bg-white/[0.06] text-white/20 cursor-not-allowed")}>
                      <Swords className="h-4 w-4" /> Start Arena Battle
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchResults.map((result, i) => {
                    const isSelected = selectedFromResults === i
                    return (
                      <button key={i} onClick={() => handleSelectFromResults(i)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer",
                          isSelected
                            ? "border-[#00e5ff]/40 bg-[#00e5ff]/10"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-[#00e5ff]/30 hover:bg-[#00e5ff]/[0.03]"
                        )}>
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black",
                          isSelected ? "bg-[#00e5ff]/20 text-[#00e5ff]" : "bg-white/[0.06] text-white/70")}>
                          #{result.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-bold truncate", isSelected ? "text-[#00e5ff]" : "text-white")}>{result.title}</p>
                          <p className="text-xs text-[#00e5ff] truncate">{result.displayLink}</p>
                        </div>
                        {isSelected && <Badge className="shrink-0 bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 text-[8px] font-black">YOUR SITE</Badge>}
                        {!isSelected && <span className="text-xs text-[#00e5ff]/60 shrink-0">Click to select</span>}
                      </button>
                    )
                  })}
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
                    <p className="text-sm text-white/60 max-w-md">{loadingPhase}</p>
                  </div>
                  <div className="w-full max-w-md">
                    <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00e5ff] via-[#BC13FE] to-[#fe3f8c] rounded-full transition-all duration-700" style={{ width: `${loadingProgress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-white/50 tabular-nums">{loadingProgress}%</span>
                      <span className="text-xs text-white/50 tabular-nums flex items-center gap-1"><Clock className="h-3 w-3" />{elapsedSeconds}s</span>
                    </div>
                  </div>
                  <Badge className="border-[#BC13FE]/30 text-[#BC13FE] bg-[#BC13FE]/5 px-4 py-1.5 text-sm font-bold">
                    &ldquo;{keyword}&rdquo; — {pendingUrls.length} sites
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {arenaResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Google Rank vs AI Rank Comparison Card */}
              {userSite && userSite.scores.overall !== null && (
                <div className="rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/[0.03] backdrop-blur-xl p-5 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00e5ff]/5 rounded-full blur-[60px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center">
                          <Target className="h-5 w-5 text-[#00e5ff]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">Your Position: &ldquo;{arenaResult.keyword}&rdquo;</h3>
                          <p className="text-xs text-white/50 truncate">{userSiteUrl}</p>
                          <p className="text-xs text-white/70">
                            {arenaResult.scoredSites}/{arenaResult.totalSites} sites scored • {arenaResult.creditCost} credits used
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rank comparison boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-center">
                        <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider mb-1 leading-tight">Google Rank <LearnMore term="google-rank-vs-ai-rank" /></p>
                        <p className="text-3xl font-black text-white tabular-nums">
                          {userSite.googleRank ? `#${userSite.googleRank}` : '—'}
                        </p>
                        <p className="text-xs text-white/50 mt-1">{userSite.googleRank ? 'In search results' : 'Not ranked'}</p>
                      </div>
                      <div className="rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/[0.05] p-4 text-center">
                        <p className="text-[10px] text-[#00e5ff]/80 uppercase font-bold tracking-wider mb-1 leading-tight">Duelly Rank <LearnMore term="duelly-rank" /></p>
                        <p className="text-3xl font-black text-[#00e5ff] tabular-nums">
                          #{arenaResult.userSiteRank}
                        </p>
                        <p className="text-xs text-white/50 mt-1">Overall Score Rank</p>
                      </div>
                      {arenaResult.backlinkData?.metrics?.domainAuthority != null && (
                        <div className="rounded-xl border border-green-500/30 bg-green-500/[0.05] p-4 text-center">
                          <p className="text-[10px] text-green-400/80 uppercase font-bold tracking-wider mb-1 leading-tight">Your Domain Authority <LearnMore term="domain-authority" /></p>
                          <p className={cn("text-3xl font-black tabular-nums",
                            arenaResult.backlinkData.metrics.domainAuthority >= 40 ? "text-green-400" :
                            arenaResult.backlinkData.metrics.domainAuthority >= 20 ? "text-yellow-400" : "text-red-400"
                          )}>
                            {arenaResult.backlinkData.metrics.domainAuthority}
                          </p>
                          <p className="text-xs text-white/50 mt-1">out of 100</p>
                        </div>
                      )}
                      {arenaResult.competitorDA?.domainAuthority != null && (
                        <div className="rounded-xl border border-[#fe3f8c]/30 bg-[#fe3f8c]/[0.05] p-4 text-center">
                          <p className="text-[10px] text-[#fe3f8c]/80 uppercase font-bold tracking-wider mb-1 leading-tight">{arenaResult.userSiteRank === 1 ? '#2' : '#1'} Domain Authority <LearnMore term="domain-authority" /></p>
                          <p className={cn("text-3xl font-black tabular-nums",
                            arenaResult.competitorDA.domainAuthority >= 40 ? "text-green-400" :
                            arenaResult.competitorDA.domainAuthority >= 20 ? "text-yellow-400" : "text-red-400"
                          )}>
                            {arenaResult.competitorDA.domainAuthority}
                          </p>
                          <p className="text-xs text-white/50 mt-1 truncate">{arenaResult.competitorDA.domain}</p>
                        </div>
                      )}
                    </div>

                    {/* Narrative */}
                    {userSite.googleRank && arenaResult.userSiteRank && (
                      <div className={cn("rounded-lg p-3 text-sm",
                        arenaResult.userSiteRank > userSite.googleRank ? "bg-red-500/10 text-red-300" :
                        arenaResult.userSiteRank < userSite.googleRank ? "bg-green-500/10 text-green-300" :
                        "bg-yellow-500/10 text-yellow-300"
                      )}>
                        {arenaResult.userSiteRank > userSite.googleRank
                          ? `⚠️ You rank #${userSite.googleRank} on Google but #${arenaResult.userSiteRank} in AI readiness. ${arenaResult.userSiteRank - userSite.googleRank} competitors score higher — as AI search grows, this gap becomes a risk.`
                          : arenaResult.userSiteRank < userSite.googleRank
                            ? `🚀 You rank #${userSite.googleRank} on Google but #${arenaResult.userSiteRank} in AI readiness. Your content is better prepared for AI search than your Google position suggests.`
                            : `Your Google rank and AI rank are aligned at #${userSite.googleRank}. Solid consistency across traditional and AI search.`
                        }
                      </div>
                    )}
                    {!userSite.googleRank && arenaResult.userSiteRank && (
                      <div className="rounded-lg p-3 text-sm bg-[#00e5ff]/10 text-[#00e5ff]/80">
                        Your site isn&apos;t in the top {arenaResult.totalSites} Google results for &ldquo;{arenaResult.keyword}&rdquo;, but your AI readiness ranks #{arenaResult.userSiteRank} out of {arenaResult.scoredSites}. Strong content — traditional SEO signals will get you on page 1.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ EXPERT ANALYSIS ═══ */}
              <ExpertAnalysis
                analysis={arenaResult?.expertAnalysis}
                tooltip="AI-powered analysis of your competitive position for this keyword, including what's working, what to improve, and specific next steps to climb the rankings."
                generateData={userSite ? {
                  context: 'keyword-arena', keyword: arenaResult?.keyword,
                  userSiteUrl: userSite.url,
                  userScores: { seo: userSite.scores.seo ?? 0, aeo: userSite.scores.aeo ?? 0, geo: userSite.scores.geo ?? 0 },
                  googleRank: userSite.googleRank, arenaRank: arenaResult?.userSiteRank,
                  totalSites: arenaResult?.totalSites,
                  arenaAvg: arenaResult?.arenaAvg ? { seo: arenaResult.arenaAvg.seo, aeo: arenaResult.arenaAvg.aeo, geo: arenaResult.arenaAvg.geo } : undefined,
                } : undefined}
              />

              {/* Leaderboard header */}
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#00e5ff]" /> Leaderboard
              </h3>

              {/* SEO / AEO / GEO Leaders */}
              {(() => {
                const scored = arenaResult.sites.filter(s => s.scores.overall !== null)
                if (scored.length === 0) return null
                const seoLeader = scored.reduce((best, s) => (s.scores.seo ?? 0) > (best.scores.seo ?? 0) ? s : best, scored[0])
                const aeoLeader = scored.reduce((best, s) => (s.scores.aeo ?? 0) > (best.scores.aeo ?? 0) ? s : best, scored[0])
                const geoLeader = scored.reduce((best, s) => (s.scores.geo ?? 0) > (best.scores.geo ?? 0) ? s : best, scored[0])
                const leaders = [
                  { label: "SEO Leader", site: seoLeader, score: seoLeader.scores.seo, color: "#00e5ff", icon: <Search className="h-4 w-4" /> },
                  { label: "AEO Leader", site: aeoLeader, score: aeoLeader.scores.aeo, color: "#BC13FE", icon: <Sparkles className="h-4 w-4" /> },
                  { label: "GEO Leader", site: geoLeader, score: geoLeader.scores.geo, color: "#fe3f8c", icon: <Bot className="h-4 w-4" /> },
                ]
                const userScores = userSite?.scores
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {leaders.map(l => {
                      const leaderTitle = l.site.title || l.site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
                      const isUser = l.site.isUserSite
                      const userScore = l.label === 'SEO Leader' ? userScores?.seo : l.label === 'AEO Leader' ? userScores?.aeo : userScores?.geo
                      const diff = (userScore != null && l.score != null) ? l.score - userScore : null
                      return (
                        <div key={l.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 relative overflow-hidden">
                          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] pointer-events-none" style={{ background: `${l.color}10` }} />
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${l.color}15`, color: l.color }}>{l.icon}</div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{l.label}</span>
                            </div>
                            <p className="text-xs text-white/60 truncate mb-1">
                              {(() => { try { return new URL(l.site.url.startsWith('http') ? l.site.url : `https://${l.site.url}`).hostname } catch { return l.site.url } })()}
                            </p>
                            <p className="text-3xl font-black tabular-nums" style={{ color: l.color }}>{l.score ?? '—'}</p>
                            {userSite && !isUser && diff != null && diff > 0 && (
                              <p className="text-xs text-white/50 mt-2">Your score: <span className="text-white/70 font-bold">{userScore}</span> <span className="text-red-400">({diff} pts behind)</span></p>
                            )}
                            {isUser && (
                              <p className="text-xs text-[#00e5ff] font-bold mt-2">You&apos;re the leader</p>
                            )}
                            {userSite && !isUser && diff != null && diff === 0 && (
                              <p className="text-xs text-yellow-400 mt-2">Tied with leader</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Google Rank Disclaimer */}
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
                <p className="text-sm text-yellow-200/90 leading-relaxed">
                  <span className="font-bold">Results may differ from what you see on Google.</span>{' '}
                  Google personalizes results based on your location, history, and device. Duelly uses a neutral, unpersonalized perspective and only compares independent websites where businesses control their own SEO — giving you the competitive analysis that actually matters.
                  <LearnMore term="google-rank-vs-ai-rank" />
                </p>
              </div>

              {/* Leaderboard Table */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white/50">Rank <LearnMore term="duelly-rank" /></th>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white/50">Site</th>
                        <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white/40">
                          Google <LearnMore term="google-rank-vs-ai-rank" />
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-[#00e5ff]/70">SEO</th>
                        <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-[#BC13FE]/70">AEO</th>
                        <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-[#fe3f8c]/70">GEO</th>
                        <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white/60">Overall</th>
                        <th className="px-2 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {arenaResult.sites.map((site, i) => {
                        const scored = site.scores.overall !== null
                        const scoredIndex = scored ? arenaResult.sites.slice(0, i).filter(s => s.scores.overall !== null).length : -1
                        const isFirst = scoredIndex === 0 && scored
                        const isUser = site.isUserSite
                        const isRetrying = retryingUrl === site.url
                        const isExpanded = expandedSite === site.url && scored && site.scanDetails
                        return (
                          <tr key={i} className={cn(
                            "border-b border-white/[0.04] transition-colors",
                            isUser && scored && "bg-[#00e5ff]/[0.04]",
                            isFirst && !isUser && "bg-yellow-500/[0.03]",
                            !scored && "opacity-60"
                          )}>
                            <td className="px-4 py-3">
                              {scored ? (
                                isFirst ? (
                                  <div className="h-7 w-7 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <Crown className="h-3.5 w-3.5 text-yellow-400" />
                                  </div>
                                ) : (
                                  <div className="h-7 w-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-black text-white/40">
                                    {scoredIndex + 1}
                                  </div>
                                )
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-white/[0.04] flex items-center justify-center text-xs text-white/40">—</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="min-w-0">
                                  <p className={cn("text-sm font-bold truncate max-w-[500px]", isUser ? "text-[#00e5ff]" : "text-white/80")}>
                                    {site.title || site.url}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <a href={site.url.startsWith('http') ? site.url : `https://${site.url}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-white/60 hover:text-[#00e5ff] hover:underline">
                                      {(() => { try { return new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname } catch { return site.url } })()}
                                    </a>
                                    {site.siteType && site.siteType !== 'general' && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 font-bold uppercase">{site.siteType}</span>
                                    )}
                                  </div>
                                </div>
                                {isUser && <Badge className="shrink-0 bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 text-[8px] font-black">YOU</Badge>}
                                {!scored && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => handleRetry(site.url)} disabled={!!isRetrying}
                                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs font-bold hover:bg-yellow-500/20 transition-all disabled:opacity-50">
                                      {isRetrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Retry
                                    </button>
                                    {site.error && (
                                      <InfoTooltip content={site.error} className="[&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:text-yellow-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-black text-white/70 tabular-nums">{site.googleRank ? `#${site.googleRank}` : '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-sm font-black tabular-nums", scoreColor(site.scores.seo))}>{site.scores.seo ?? '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-sm font-black tabular-nums", scoreColor(site.scores.aeo))}>{site.scores.aeo ?? '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-sm font-black tabular-nums", scoreColor(site.scores.geo))}>{site.scores.geo ?? '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-lg font-black tabular-nums", scoreColor(site.scores.overall))}>{site.scores.overall ?? '—'}</span>
                            </td>
                            <td className="px-2 py-3">
                              {scored && site.scanDetails && (
                                <button onClick={() => setExpandedSite(isExpanded ? null : site.url)}
                                  className="p-1 text-white/40 hover:text-white/70 transition-colors">
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Expanded site details panel */}
                {expandedSite && (() => {
                  const site = arenaResult.sites.find(s => s.url === expandedSite)
                  if (!site?.scanDetails) return null
                  const d = site.scanDetails
                  const altPct = d.totalImages > 0 ? Math.round((d.imagesWithAlt / d.totalImages) * 100) : 100
                  return (
                    <div className="border-t border-white/[0.06] bg-white/[0.01] px-6 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">Words <LearnMore term="content-depth" /></p>
                          <p className="text-lg font-black text-white/70 tabular-nums">{d.wordCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">Schema <LearnMore term="schema-markup" /></p>
                          <p className={cn("text-lg font-black tabular-nums", d.hasSchema ? "text-green-400" : "text-red-400")}>{d.hasSchema ? 'Yes' : 'No'}</p>
                          {d.schemaTypes.length > 0 && <p className="text-xs text-white/50 truncate">{d.schemaTypes.join(', ')}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">Alt Text <LearnMore term="alt-text" /></p>
                          <p className={cn("text-lg font-black tabular-nums", altPct >= 90 ? "text-green-400" : altPct >= 50 ? "text-yellow-400" : "text-red-400")}>{altPct}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">Open Graph <LearnMore term="open-graph" /></p>
                          <p className={cn("text-lg font-black", d.hasOgTitle && d.hasOgDescription ? "text-green-400" : "text-yellow-400")}>
                            {[d.hasOgTitle, d.hasOgDescription, d.hasOgImage].filter(Boolean).length}/3
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">Headings <LearnMore term="heading-structure" /></p>
                          <p className="text-sm text-white/70">H1: {d.h1Count} · H2: {d.h2Count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">Links <LearnMore term="internal-linking" /></p>
                          <p className="text-sm text-white/70">Int: {d.internalLinks} · Ext: {d.externalLinks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">HTTPS <LearnMore term="https" /></p>
                          <p className={cn("text-lg font-black", d.isHttps ? "text-green-400" : "text-red-400")}>{d.isHttps ? '✓' : '✗'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 uppercase font-bold">Platform <LearnMore term="platform-detection" /></p>
                          <p className="text-sm text-white/70">{d.platform || 'Custom'}</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Competitive Gaps & Strengths */}
              {insights.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {gaps.length > 0 && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-5">
                      <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-red-400" /> Competitive Gaps
                      </h3>
                      <div className="space-y-2">
                        {gaps.map((gap, i) => {
                          const term = gap.metric === 'Domain Authority' ? 'domain-authority' : (gap.metric === 'Schema Markup' || gap.metric === 'Schema Quality') ? 'schema-markup' : gap.metric === 'Content Depth' ? 'content-depth' : gap.metric === 'Site Speed' ? 'site-speed' : gap.metric === 'Image Alt Text' ? 'alt-text' : gap.metric === 'AEO Score' ? 'aeo' : gap.metric === 'GEO Score' ? 'geo' : gap.metric === 'Heading Structure' ? 'heading-structure' : gap.metric === 'HTTPS Security' ? 'https' : gap.metric === 'Social Sharing' ? 'open-graph' : gap.metric === 'SEO Score' ? 'competitive-gap' : null
                          return (
                          <div key={i} className={cn("rounded-lg p-3 border relative", gap.severity === 'critical' ? "border-red-500/30 bg-red-500/10" : "border-yellow-500/30 bg-yellow-500/10")}>
                            <p className={cn("text-xs font-bold flex items-center gap-1", gap.severity === 'critical' ? "text-red-400" : "text-yellow-400")}>
                              {gap.metric}
                              {term && <LearnMore term={term} />}
                            </p>
                            <p className="text-[11px] text-white/60 mt-0.5">{gap.detail}</p>
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {strengths.length > 0 && (
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.02] p-5">
                      <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-400" /> Your Strengths
                      </h3>
                      <div className="space-y-2">
                        {strengths.map((s, i) => {
                          const term = s.metric === 'Domain Authority' ? 'domain-authority' : (s.metric === 'Schema Markup' || s.metric === 'Schema Quality') ? 'schema-markup' : s.metric === 'Content Depth' ? 'content-depth' : s.metric === 'Site Speed' ? 'site-speed' : s.metric === 'Image Alt Text' ? 'alt-text' : s.metric === 'AEO Score' ? 'aeo' : s.metric === 'GEO Score' ? 'geo' : s.metric === 'Heading Structure' ? 'heading-structure' : s.metric === 'HTTPS Security' ? 'https' : s.metric === 'Social Sharing' ? 'open-graph' : s.metric === 'SEO Score' ? 'competitive-gap' : null
                          return (
                          <div key={i} className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
                            <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                              {s.metric}
                              {term && <LearnMore term={term} />}
                            </p>
                            <p className="text-[11px] text-white/60 mt-0.5">{s.detail}</p>
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Link Building Intelligence */}
              {arenaResult.backlinkData && (
                <LinkBuildingIntelligence
                  metrics={arenaResult.backlinkData.metrics}
                  backlinks={arenaResult.backlinkData.backlinks}
                />
              )}

              {/* Recommended Next Steps */}
              {userSite && userSite.scores.overall !== null && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-[#00e5ff]" /> Recommended Next Steps
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(userSite.scores.overall ?? 0) < 90 && (
                      <Link href="/pro-audit" className="group rounded-xl border border-[#00e5ff]/20 bg-[#00e5ff]/[0.03] p-4 hover:border-[#00e5ff]/40 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-7 w-7 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-[#00e5ff]" /></div>
                          <span className="text-xs font-bold text-[#00e5ff]">Pro Audit</span>
                          <span className="text-xs text-white/40 ml-auto">10 credits</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">Get step-by-step fix instructions for every issue found on your site.</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#00e5ff]/60 group-hover:text-[#00e5ff] transition-colors">Run Pro Audit <ArrowRight className="h-3 w-3" /></div>
                      </Link>
                    )}
                    {(userSite.scores.aeo ?? 0) < 70 && (
                      <Link href="/deep-scan" className="group rounded-xl border border-[#BC13FE]/20 bg-[#BC13FE]/[0.03] p-4 hover:border-[#BC13FE]/40 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-7 w-7 rounded-lg bg-[#BC13FE]/10 flex items-center justify-center"><Bot className="h-3.5 w-3.5 text-[#BC13FE]" /></div>
                          <span className="text-xs font-bold text-[#BC13FE]">Deep Scan</span>
                          <span className="text-xs text-white/40 ml-auto">10+ credits</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">Scan your entire site to find schema gaps, thin pages, and AI blind spots.</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#BC13FE]/60 group-hover:text-[#BC13FE] transition-colors">Run Deep Scan <ArrowRight className="h-3 w-3" /></div>
                      </Link>
                    )}
                    <Link href="/battle-mode" className="group rounded-xl border border-[#fe3f8c]/20 bg-[#fe3f8c]/[0.03] p-4 hover:border-[#fe3f8c]/40 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-lg bg-[#fe3f8c]/10 flex items-center justify-center"><Globe className="h-3.5 w-3.5 text-[#fe3f8c]" /></div>
                        <span className="text-xs font-bold text-[#fe3f8c]">Competitor Duel</span>
                        <span className="text-xs text-white/40 ml-auto">10 credits</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">Deep-dive comparison against specific competitors with full gap analysis.</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-[#fe3f8c]/60 group-hover:text-[#fe3f8c] transition-colors">Run Competitor Duel <ArrowRight className="h-3 w-3" /></div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </PageShell>
  )
}
