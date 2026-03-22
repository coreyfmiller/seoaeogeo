"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan } from '@/lib/scan-history'
import { DualSearchInput } from "@/components/dashboard/search-input"
import { Badge } from "@/components/ui/badge"
import {
    Globe,
    Swords,
    Search,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    Activity,
    CheckCircle2,
    Loader2,
    Clock,
    Sparkles,
    Zap,
    Bot,
    RefreshCw,
    ChevronDown,
    Copy,
    Check,
    Code2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { CreditConfirmDialog } from '@/components/dashboard/credit-confirm-dialog'

export default function SiteVsSite() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [siteA, setSiteA] = useState("")
    const [siteB, setSiteB] = useState("")
    const [comparisonData, setComparisonData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [creditsRefunded, setCreditsRefunded] = useState(0)
    const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
    const [creditDialogOpen, setCreditDialogOpen] = useState(false)
    const [pendingUrls, setPendingUrls] = useState<{ a: string; b: string }>({ a: "", b: "" })
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [loadingPhase, setLoadingPhase] = useState("")
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [expandedStrategy, setExpandedStrategy] = useState<number | null>(null)
    const [copiedFix, setCopiedFix] = useState<number | null>(null)

    // Restore state from sessionStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedSiteA = sessionStorage.getItem("competitor_siteA")
            const savedSiteB = sessionStorage.getItem("competitor_siteB")
            const savedData = sessionStorage.getItem("competitor_data")

            if (savedSiteA) setSiteA(savedSiteA)
            if (savedSiteB) setSiteB(savedSiteB)
            if (savedData) setComparisonData(JSON.parse(savedData))
        }
    }, [])

    // Save state to sessionStorage when it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (siteA) sessionStorage.setItem("competitor_siteA", siteA)
            if (siteB) sessionStorage.setItem("competitor_siteB", siteB)
            if (comparisonData) sessionStorage.setItem("competitor_data", JSON.stringify(comparisonData))
        }
    }, [siteA, siteB, comparisonData])

    // Progress ticker while analyzing
    useEffect(() => {
        if (!isAnalyzing) {
            setLoadingProgress(0)
            setElapsedSeconds(0)
            setLoadingPhase("")
            return
        }
        const startTime = Date.now()
        const phases = [
            { at: 0, label: "Initiating dual-site crawl..." },
            { at: 8, label: "Crawling Site A — extracting content & metadata..." },
            { at: 18, label: "Crawling Site B — extracting content & metadata..." },
            { at: 30, label: "Both sites crawled. Starting AI analysis..." },
            { at: 45, label: "Gemini analyzing content quality & structure..." },
            { at: 60, label: "Comparing SEO, AEO, and GEO signals..." },
            { at: 75, label: "Generating competitive strategies..." },
            { at: 88, label: "Finalizing intelligence report..." },
        ]
        setLoadingPhase(phases[0].label)

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000
            setElapsedSeconds(Math.floor(elapsed))

            // Asymptotic curve: fast start, slows toward 95%
            // Reaches ~50% at 15s, ~75% at 30s, ~90% at 50s, caps at 95%
            const pct = Math.min(95, Math.round(95 * (1 - Math.exp(-elapsed / 25))))
            setLoadingProgress(pct)

            // Update phase label
            const currentPhase = [...phases].reverse().find(p => pct >= p.at)
            if (currentPhase) setLoadingPhase(currentPhase.label)
        }, 300)

        return () => clearInterval(interval)
    }, [isAnalyzing])

    // Save to scan history for dashboard
    useEffect(() => {
        if (comparisonData && siteA && siteB) {
            const c = comparisonData.comparison || comparisonData
            saveScanToHistory({
                url: `${siteA} vs ${siteB}`,
                type: 'competitive',
                scores: { seo: c.seo?.siteA || 0, aeo: c.aeo?.siteA || 0, geo: c.geo?.siteA || 0 },
                timestamp: new Date().toISOString(),
            }, comparisonData)
        }
    }, [comparisonData, siteA, siteB])

    // Load from history if navigated from dashboard
    useEffect(() => {
        const entry = consumeLoadFromHistory()
        if (entry && entry.type === 'competitive') {
            const full = getFullScanResult(entry)
            if (full) {
                const parts = entry.url.split(' vs ')
                if (parts.length === 2) {
                    setSiteA(parts[0])
                    setSiteB(parts[1])
                }
                setComparisonData(full)
                return
            }
        }
        const latest = getLatestFullScan('competitive')
        if (latest) {
            const parts = latest.entry.url.split(' vs ')
            if (parts.length === 2) {
                setSiteA(parts[0])
                setSiteB(parts[1])
            }
            setComparisonData(latest.result)
        }
    }, [])

    const handleBattle = async (urlA: string, urlB: string) => {
        setPendingUrls({ a: urlA, b: urlB })
        setCreditDialogOpen(true)
    }

    const handleConfirmBattle = async () => {
        setCreditDialogOpen(false)
        const urlA = pendingUrls.a
        const urlB = pendingUrls.b
        setIsAnalyzing(true)
        setError(null)
        setCreditsRefunded(0)
        setApiStatus("idle")
        setSiteA(urlA)
        setSiteB(urlB)

        try {
            const response = await fetch('/api/analyze-competitive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteAUrl: urlA, siteBUrl: urlB })
            })

            const result = await response.json()

            // Credits were deducted server-side — refresh header
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))

            if (result.success) {
                setComparisonData(result.data.comparison)
                setApiStatus("healthy")
            } else {
                setError(result.error || 'Battle failed. Check your URLs.')
                setCreditsRefunded(result.creditsRefunded || 0)
                setApiStatus("error")
            }
        } catch (err: any) {
            setError('Connection failed. Server might be offline.')
            setCreditsRefunded(0)
            setApiStatus("error")
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="flex h-screen bg-background">
            <AppSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onAnalyze={(url) => window.location.href = `/?url=${encodeURIComponent(url)}`}
                    apiStatus={apiStatus}
                    hideSearch
                />

                <main className="flex-1 overflow-y-auto px-6 pt-6">
                    <div className="max-w-7xl mx-auto pb-6">
                        <div className="mb-10 flex items-start justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                    <Activity className="h-6 w-6 text-seo" />
                                    Competitive Intel
                                </h1>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Benchmark SEO, AEO, and GEO citation metrics between your brand and a competitor.
                                    Identify exactly how they are winning and how to reclaim your visibility.
                                </p>
                            </div>
                            
                            {/* New Comparison Button - Only show when results exist */}
                            {comparisonData && !isAnalyzing && (
                                <button
                                    onClick={() => {
                                        setComparisonData(null)
                                        setSiteA("")
                                        setSiteB("")
                                        setError(null)
                                        if (typeof window !== "undefined") {
                                            sessionStorage.removeItem("competitor_siteA")
                                            sessionStorage.removeItem("competitor_siteB")
                                            sessionStorage.removeItem("competitor_data")
                                        }
                                    }}
                                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-aeo/10 hover:bg-aeo/20 text-aeo border border-aeo/30 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    New Comparison
                                </button>
                            )}
                        </div>

                        <ScanErrorDialog error={error} onClose={() => setError(null)} onRetry={() => handleBattle(siteA, siteB)} creditsRefunded={creditsRefunded} />

                        {/* Credit Confirmation Dialog */}
                        <CreditConfirmDialog
                            open={creditDialogOpen}
                            onConfirm={handleConfirmBattle}
                            onCancel={() => setCreditDialogOpen(false)}
                            creditCost={20}
                            scanType="Competitive Intel"
                            costBreakdown="20 credits per competitive intelligence scan (2 sites analyzed)"
                        />

                        {/* Battle Form */}
                        {!comparisonData && !isAnalyzing ? (
                            <div className="bg-card/50 border-2 border-border rounded-3xl p-10 flex flex-col items-center animate-in fade-in zoom-in-95 animate-duration-500 shadow-lg relative overflow-hidden">
                                {/* Ambient Background Glows */}
                                <div className="absolute top-0 left-0 w-96 h-96 bg-seo/10 rounded-full blur-[100px] pointer-events-none" />
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-aeo/10 rounded-full blur-[100px] pointer-events-none" />

                                <div className="relative z-10 w-full">
                                    <DualSearchInput
                                        onSubmit={(urlA, urlB) => handleBattle(urlA, urlB)}
                                        isAnalyzing={isAnalyzing}
                                        placeholderA="fundylogic.com"
                                        placeholderB="competitor.ca"
                                    />
                                </div>

                                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl text-center">
                                    <div className="space-y-2">
                                        <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-seo/10 text-seo">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-sm">SEO Benchmarking</h3>
                                        <p className="text-xs text-muted-foreground px-4">Authority & Link Gap identification.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-aeo/10 text-aeo">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-sm">Answer Engine Gaps</h3>
                                        <p className="text-xs text-muted-foreground px-4">See where they are stealing your Snippets.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-[#fe3f8c]/10 text-[#fe3f8c]">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-sm">LLM Citation Share</h3>
                                        <p className="text-xs text-muted-foreground px-4">Who do AIs recommend most?</p>
                                    </div>
                                </div>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="space-y-8 animate-in fade-in zoom-in-95">
                                {/* Loading Card */}
                                <Card className="border-2 border-aeo/20 bg-gradient-to-br from-seo/5 via-aeo/5 to-[#fe3f8c]/5 overflow-hidden relative">
                                    {/* Animated gradient bar at top */}
                                    <div className="h-1 w-full bg-muted/30 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-seo via-aeo to-[#fe3f8c] transition-all duration-700 ease-out"
                                            style={{ width: `${loadingProgress}%` }}
                                        />
                                    </div>
                                    
                                    <CardContent className="pt-10 pb-10">
                                        <div className="flex flex-col items-center gap-6">
                                            {/* Spinner */}
                                            <div className="relative h-24 w-24">
                                                <div className="absolute inset-0 rounded-full border-4 border-t-seo border-r-aeo border-b-[#fe3f8c] border-l-transparent animate-spin" />
                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                                    <span className="text-xl font-black text-foreground tabular-nums">{loadingProgress}%</span>
                                                </div>
                                            </div>

                                            <div className="text-center space-y-2">
                                                <h2 className="text-2xl font-bold text-foreground">Intelligence Battle in Progress</h2>
                                                <p className="text-sm text-muted-foreground max-w-md min-h-[20px] transition-opacity duration-500">
                                                    {loadingPhase}
                                                </p>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full max-w-md">
                                                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-seo via-aeo to-[#fe3f8c] rounded-full transition-all duration-700 ease-out"
                                                        style={{ width: `${loadingProgress}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-1.5">
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">{loadingProgress}% complete</span>
                                                    <span className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {elapsedSeconds}s elapsed
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Site badges */}
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="border-seo/30 text-seo bg-seo/5 px-4 py-1.5 text-sm font-bold">
                                                    {siteA ? siteA.replace(/^https?:\/\//, '').replace(/\/$/, '') : "Your Site"}
                                                </Badge>
                                                <span className="text-muted-foreground font-black italic text-lg">VS</span>
                                                <Badge variant="outline" className="border-aeo/30 text-aeo bg-aeo/5 px-4 py-1.5 text-sm font-bold">
                                                    {siteB ? siteB.replace(/^https?:\/\//, '').replace(/\/$/, '') : "Competitor"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Phase indicators */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { icon: <Search className="h-5 w-5" />, label: "Crawling Both Sites", desc: "Extracting content, metadata, and technical signals", threshold: 5 },
                                        { icon: <Sparkles className="h-5 w-5" />, label: "AI Deep Analysis", desc: "Gemini analyzing content quality, schema, and structure", threshold: 35 },
                                        { icon: <Bot className="h-5 w-5" />, label: "Competitive Scoring", desc: "Calculating head-to-head SEO, AEO, and GEO scores", threshold: 65 },
                                    ].map((phase, i) => {
                                        const isActive = loadingProgress >= phase.threshold
                                        const isDone = i < 2 && loadingProgress >= [35, 65, 100][i]
                                        return (
                                            <Card key={i} className={cn(
                                                "border-border/30 transition-all duration-500",
                                                isActive ? "bg-card/80" : "bg-card/30 opacity-50"
                                            )}>
                                                <CardContent className="pt-5 pb-5">
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500",
                                                            i === 0 ? "bg-seo/10 text-seo" : i === 1 ? "bg-aeo/10 text-aeo" : "bg-[#fe3f8c]/10 text-[#fe3f8c]",
                                                            isActive && !isDone && "animate-pulse"
                                                        )}>
                                                            {isDone ? <CheckCircle2 className="h-5 w-5" /> : phase.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-sm text-foreground">{phase.label}</h3>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{phase.desc}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Comparison Results Display */
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                {/* Score Comparison Board */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        {
                                            label: "SEO AUTHORITY BATTLE",
                                            tooltip: "Compares traditional SEO strength between both sites — technical health, backlink authority, content optimization, metadata quality, and crawlability. The higher score indicates stronger search engine visibility.",
                                            data: comparisonData.comparison.seo,
                                            titleColor: "text-seo",
                                            accentHex: "#118fff",
                                            icon: <Search className="h-3.5 w-3.5" />,
                                        },
                                        {
                                            label: "AEO SNIPPET SHARE",
                                            tooltip: "Compares Answer Engine Optimization — which site is more likely to be cited by AI assistants like ChatGPT, Perplexity, and Gemini. Measures structured data, FAQ coverage, direct answer formatting, and schema quality.",
                                            data: comparisonData.comparison.aeo,
                                            titleColor: "text-aeo",
                                            accentHex: "#842ce0",
                                            icon: <Sparkles className="h-3.5 w-3.5" />,
                                        },
                                        {
                                            label: "GEO CITATION LIKELIHOOD",
                                            tooltip: "Compares Generative Engine Optimization — which site is more likely to appear in AI-generated search results and summaries. Measures brand authority, topical depth, content uniqueness, and citation-worthiness.",
                                            data: comparisonData.comparison.geo,
                                            titleColor: "text-[#fe3f8c]",
                                            accentHex: "#fe3f8c",
                                            icon: <Globe className="h-3.5 w-3.5" />,
                                        },
                                    ].map((battle) => {
                                        const scoreA = battle.data.siteA
                                        const scoreB = battle.data.siteB
                                        const delta = scoreA - scoreB
                                        const isWinning = delta > 0
                                        const isTied = delta === 0
                                        const total = scoreA + scoreB || 1
                                        const pctA = (scoreA / total) * 100

                                        return (
                                            <Card key={battle.label} className={cn("border-border/30 bg-card/80 relative overflow-hidden group hover:border-border/60 transition-all")}>
                                                {/* Subtle top accent line */}
                                                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: battle.accentHex }} />

                                                <CardHeader className="pb-1">
                                                    <CardTitle className={cn("text-[10px] font-black uppercase tracking-widest flex justify-between items-center", battle.titleColor)}>
                                                        <span className="flex items-center gap-1.5">
                                                            {battle.icon}
                                                            {battle.label}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <InfoTooltip content={battle.tooltip} />
                                                        </span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex flex-col items-center flex-1">
                                                            <div className="text-4xl font-black tabular-nums text-seo">{scoreA}</div>
                                                            <div className="text-[9px] uppercase font-bold text-muted-foreground truncate w-full text-center mt-0.5 max-w-[100px]" title={siteA}>
                                                                {siteA ? siteA.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Your Site'}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-center gap-1 px-2">
                                                            <Swords className="h-4 w-4 text-muted-foreground/30" />
                                                            <span className="text-[9px] font-black italic text-muted-foreground/40">VS</span>
                                                        </div>
                                                        <div className="flex flex-col items-center flex-1">
                                                            <div className="text-4xl font-black tabular-nums text-aeo">{scoreB}</div>
                                                            <div className="text-[9px] uppercase font-bold text-muted-foreground truncate w-full text-center mt-0.5 max-w-[100px]" title={siteB}>
                                                                {siteB ? siteB.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Competitor'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="mt-4 h-2 w-full bg-muted/50 rounded-full overflow-hidden flex relative">
                                                        <div className={cn("h-full rounded-l-full transition-all duration-700 bg-seo")} style={{ width: `${pctA}%` }} />
                                                        <div className={cn("h-full rounded-r-full transition-all duration-700 bg-aeo")} style={{ width: `${100 - pctA}%` }} />
                                                        {/* Center marker */}
                                                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/20" />
                                                    </div>

                                                    {/* Legend */}
                                                    <div className="flex justify-between mt-2">
                                                        <span className="text-[8px] font-bold text-seo uppercase">{Math.round(pctA)}% share</span>
                                                        <span className="text-[8px] font-bold text-aeo uppercase">{Math.round(100 - pctA)}% share</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>

                                {/* Expert Verdict */}
                                {comparisonData.winnerVerdict && (
                                    <div className="rounded-xl bg-geo/10 border border-geo/20 px-5 py-3 flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-geo shrink-0" />
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase text-geo tracking-widest mb-0.5 flex items-center gap-1.5">Expert Verdict <InfoTooltip content="AI-generated summary of the competitive landscape. Identifies the overall winner and explains the key factors driving the score difference between both sites." /></h4>
                                            <p className="text-sm font-medium text-foreground leading-relaxed">{comparisonData.winnerVerdict}</p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Top 6 Strategic Fixes (Battle Recommendations) ── */}
                                {comparisonData.recommendations?.length > 0 && (
                                    <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5 relative z-10">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Zap className="h-5 w-5 text-geo" />
                                                    Top 6 Counter-Strategies
                                                    <InfoTooltip content="AI-generated tactical plan to outperform this competitor. Each strategy is ranked by potential impact and includes specific actions you can take. Categories include content, technical SEO, schema, and brand authority improvements." />
                                                </CardTitle>
                                                <CardDescription>AI-generated plan to outmaneuver this competitor in AI search rankings</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="border-geo/30 text-geo font-black text-[10px] tracking-widest uppercase px-3 py-1 bg-geo/5">
                                                    Intelligence Battle Plan
                                                </Badge>
                                                <button
                                                    onClick={() => {
                                                        const text = comparisonData.recommendations.slice(0, 6).map((f: any) => `[RANK ${f.rank}] ${f.title}\nACTION: ${f.description}\nHOW TO FIX: ${f.howToFix || 'N/A'}${f.codeSnippet ? '\nCODE: ' + f.codeSnippet : ''}\nIMPACT: ${f.impact}`).join('\n\n');
                                                        navigator.clipboard.writeText(text);
                                                        alert("Battle Plan copied!");
                                                    }}
                                                    className="bg-background/50 hover:bg-background/80 border border-border/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Copy Plan
                                                </button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {comparisonData.recommendations.slice(0, 6).map((fix: any, i: number) => {
                                                    const isExpanded = expandedStrategy === i
                                                    return (
                                                    <div 
                                                        key={i} 
                                                        className={cn(
                                                            "flex flex-col p-5 rounded-2xl border border-border/40 bg-background/70 transition-all relative group overflow-hidden cursor-pointer",
                                                            isExpanded ? "col-span-full border-aeo/40 ring-2 ring-aeo/20 ring-offset-2" : "hover:border-geo/30"
                                                        )}
                                                        onClick={() => setExpandedStrategy(isExpanded ? null : i)}
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex gap-2 flex-wrap">
                                                                <Badge className="bg-muted text-muted-foreground text-[8px] font-black uppercase tracking-tighter px-1.5 py-0">
                                                                    {fix.category}
                                                                </Badge>
                                                                <Badge 
                                                                    className={cn(
                                                                        "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0",
                                                                        (fix.priority || fix.roi) === 'CRITICAL' ? "bg-destructive/20 text-destructive border-destructive/20" : 
                                                                        (fix.priority || fix.roi) === 'HIGH' ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/20" :
                                                                        "bg-geo/20 text-geo border-geo/20"
                                                                    )}
                                                                >
                                                                    {(fix.priority || fix.roi) === 'CRITICAL' ? '🔥 URGENT' : 
                                                                     (fix.priority || fix.roi) === 'HIGH' ? '⚡ HIGH PRIORITY' : 
                                                                     '✓ QUICK WIN'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center text-[10px] font-black text-muted-foreground ring-1 ring-border/50">
                                                                    {fix.rank}
                                                                </div>
                                                                <ChevronDown className={cn(
                                                                    "h-4 w-4 text-muted-foreground transition-transform",
                                                                    isExpanded && "rotate-180"
                                                                )} />
                                                            </div>
                                                        </div>
                                                        <h5 className="font-bold text-sm mb-3 group-hover:text-geo transition-colors leading-tight">{fix.title}</h5>
                                                        <p className="text-xs text-muted-foreground leading-relaxed italic mb-6">
                                                            &ldquo;{fix.description}&rdquo;
                                                        </p>

                                                        {/* Expanded fix details */}
                                                        {isExpanded && (
                                                            <div className="space-y-4 mb-4 animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                                                                {fix.howToFix && (
                                                                    <div className="p-4 rounded-xl bg-aeo/5 border border-aeo/20">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <Zap className="h-4 w-4 text-aeo" />
                                                                                <span className="text-xs font-black uppercase text-aeo tracking-wider">How To Fix</span>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(fix.howToFix + (fix.codeSnippet ? '\n\nCode:\n' + fix.codeSnippet : ''))
                                                                                    setCopiedFix(i)
                                                                                    setTimeout(() => setCopiedFix(null), 2000)
                                                                                }}
                                                                                className="p-1.5 rounded-md hover:bg-aeo/10 transition-colors"
                                                                            >
                                                                                {copiedFix === i ? <Check className="h-3.5 w-3.5 text-aeo" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                                                                            </button>
                                                                        </div>
                                                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{fix.howToFix}</p>
                                                                    </div>
                                                                )}
                                                                {fix.codeSnippet && fix.codeSnippet.trim() && (
                                                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Code2 className="h-4 w-4 text-muted-foreground" />
                                                                            <span className="text-xs font-black uppercase text-muted-foreground tracking-wider">Code Example</span>
                                                                        </div>
                                                                        <pre className="text-xs font-mono text-foreground/70 overflow-x-auto whitespace-pre-wrap leading-relaxed">{fix.codeSnippet}</pre>
                                                                    </div>
                                                                )}
                                                                {fix.affectedElement && (
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        <span className="font-bold uppercase">Affected: </span>{fix.affectedElement}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="mt-auto pt-4 border-t border-border/20 flex items-end justify-between">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/50">Impacts</p>
                                                                <p className="text-[10px] font-bold text-foreground/80">{fix.impactedScores || fix.category}</p>
                                                            </div>
                                                            <div className="text-right space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/50">Effort</p>
                                                                <div className="flex gap-0.5">
                                                                    {[1, 2, 3].map(level => (
                                                                        <div key={level} className={cn(
                                                                            "h-1 w-3 rounded-full",
                                                                            level <= (fix.effort || 2)
                                                                                ? (fix.effort >= 3 ? "bg-destructive" : fix.effort === 2 ? "bg-aeo" : "bg-geo")
                                                                                : "bg-muted"
                                                                        )} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-geo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Stolen Opportunities & Strategic Gaps */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-20 items-stretch">
                                        <Card className="border-aeo/20 bg-aeo/5 h-full">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2 text-foreground">
                                                        <Zap className="h-5 w-5 text-aeo" />
                                                        Stolen Opportunities
                                                        <InfoTooltip content="Specific areas where your competitor is outperforming you in AI search visibility. These are opportunities they've captured that you're missing — fixing these has the highest ROI for reclaiming lost traffic and citations." />
                                                    </CardTitle>
                                                    <CardDescription>Strategies where they are winning LLM citations</CardDescription>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const text = comparisonData.stolenOpportunities.map((o: any) => `[${o.category.toUpperCase()}] ${o.title}\n${o.description}`).join('\n\n');
                                                        navigator.clipboard.writeText(text);
                                                        alert("Opportunities copied!");
                                                    }}
                                                    className="bg-muted/50 hover:bg-muted border border-border/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors"
                                                >
                                                    Copy Insights
                                                </button>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {comparisonData.stolenOpportunities.map((opp: any, i: number) => (
                                                        <div key={i} className="bg-background/80 border border-border/50 rounded-xl p-4 flex gap-4 hover:border-aeo/30 transition-colors min-w-0 overflow-hidden">
                                                            <div className={cn(
                                                                "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center",
                                                                opp.category === 'seo' ? "bg-seo/10 text-seo" : opp.category === 'aeo' ? "bg-aeo/10 text-aeo" : "bg-geo/10 text-geo"
                                                            )}>
                                                                {opp.category === 'seo' ? <Search className="h-5 w-5" /> : opp.category === 'aeo' ? <Sparkles className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-bold text-foreground text-sm truncate">{opp.title}</h4>
                                                                    <Badge className={cn(
                                                                        "text-[10px]",
                                                                        opp.priority === 'high' ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                                                                    )}>
                                                                        {opp.priority}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                                    {opp.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-geo/20 bg-geo/5 h-full">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-foreground">
                                                    <ShieldAlert className="h-5 w-5 text-geo" />
                                                    Critical Strategic Gaps
                                                    <InfoTooltip content="Fundamental weaknesses in your site's strategy compared to the competitor. These are structural or strategic issues that, if left unaddressed, will continue to erode your competitive position in both traditional and AI-powered search." />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {comparisonData.strategicGaps.map((gap: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-3 text-xs border-b border-border/30 pb-3 last:border-0 italic">
                                                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-geo" />
                                                            {gap}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-6 text-center">
                                                    <button
                                                        onClick={() => { setComparisonData(null); setSiteA(""); setSiteB(""); }}
                                                        className="text-sm text-muted-foreground hover:text-foreground hover:underline flex items-center gap-2 mx-auto"
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                        Reset Intelligence Battle
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
