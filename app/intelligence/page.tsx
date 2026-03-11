"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
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
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SiteVsSite() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [siteA, setSiteA] = useState("")
    const [siteB, setSiteB] = useState("")
    const [comparisonData, setComparisonData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")

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

    const handleBattle = async (urlA: string, urlB: string) => {
        setIsAnalyzing(true)
        setError(null)
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

            if (result.success) {
                setComparisonData(result.data.comparison)
                setApiStatus("healthy")
            } else {
                setError(result.error || 'Battle failed. Check your URLs.')
                setApiStatus("error")
            }
        } catch (err: any) {
            setError('Connection failed. Server might be offline.')
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
                />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-10 flex items-start justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                    <Swords className="h-6 w-6 text-aeo" />
                                    Competitive Intel
                                </h1>
                                <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
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

                        {/* Error Message */}
                        {error && (
                            <div className="mb-8 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <ShieldAlert className="h-5 w-5" />
                                <div className="flex-1 text-sm font-medium">{error}</div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-xs uppercase tracking-wider font-bold hover:underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Battle Form */}
                        {!comparisonData && !isAnalyzing ? (
                            <div className="bg-card/50 border border-border/50 rounded-3xl p-10 flex flex-col items-center animate-in fade-in zoom-in-95 animate-duration-500">
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
                                        <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-geo/10 text-geo">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-sm">LLM Citation Share</h3>
                                        <p className="text-xs text-muted-foreground px-4">Who do AIs recommend most?</p>
                                    </div>
                                </div>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
                                <div className="relative h-24 w-24 mb-6">
                                    <div className="absolute inset-0 rounded-full border-4 border-t-seo border-r-aeo border-b-geo border-l-transparent animate-spin"></div>
                                    <Swords className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-aeo animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Analyzing Intelligence Battle...</h2>
                                <p className="text-muted-foreground mt-2 italic animate-pulse">Running dual-crawls on both domains...</p>
                                <div className="mt-8 flex gap-4">
                                    <Badge variant="outline" className="border-seo/30 text-seo bg-seo/5 px-4 py-1">{siteA || "Target"}</Badge>
                                    <span className="text-muted-foreground font-black italic">VS</span>
                                    <Badge variant="outline" className="border-aeo/30 text-aeo bg-aeo/5 px-4 py-1">{siteB || "Competitor"}</Badge>
                                </div>
                            </div>
                        ) : (
                            /* Comparison Results Display */
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                {/* Score Comparison Board */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* SEO Battle */}
                                    <Card className="border-seo/20 bg-seo/5">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                                                SEO AUTHORITY BATTLE
                                                {comparisonData.comparison.seo.winner === "siteA" ? <TrendingUp className="h-4 w-4 text-geo" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-end justify-between gap-4">
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className="text-3xl font-black text-seo">{comparisonData.comparison.seo.siteA}</div>
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground truncate w-full text-center">Your Site</div>
                                                </div>
                                                <div className="text-xs font-black italic text-muted-foreground mb-4 opacity-50">VS</div>
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className="text-3xl font-black text-aeo">{comparisonData.comparison.seo.siteB}</div>
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground truncate w-full text-center">Competitor</div>
                                                </div>
                                            </div>
                                            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                                                <div className="h-full bg-seo" style={{ width: `${(comparisonData.comparison.seo.siteA / (comparisonData.comparison.seo.siteA + comparisonData.comparison.seo.siteB)) * 100}%` }}></div>
                                                <div className="h-full bg-aeo" style={{ width: `${(comparisonData.comparison.seo.siteB / (comparisonData.comparison.seo.siteA + comparisonData.comparison.seo.siteB)) * 100}%` }}></div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* AEO Battle */}
                                    <Card className="border-aeo/20 bg-aeo/5">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                                                AEO SNIPPET SHARE
                                                {comparisonData.comparison.aeo.winner === "siteA" ? <TrendingUp className="h-4 w-4 text-geo" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-end justify-between gap-4">
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className="text-3xl font-black text-seo">{comparisonData.comparison.aeo.siteA}</div>
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground truncate w-full text-center">Your Site</div>
                                                </div>
                                                <div className="text-xs font-black italic text-muted-foreground mb-4 opacity-50">VS</div>
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className="text-3xl font-black text-aeo">{comparisonData.comparison.aeo.siteB}</div>
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground truncate w-full text-center">Competitor</div>
                                                </div>
                                            </div>
                                            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                                                <div className="h-full bg-seo" style={{ width: `${(comparisonData.comparison.aeo.siteA / (comparisonData.comparison.aeo.siteA + comparisonData.comparison.aeo.siteB)) * 100}%` }}></div>
                                                <div className="h-full bg-aeo" style={{ width: `${(comparisonData.comparison.aeo.siteB / (comparisonData.comparison.aeo.siteA + comparisonData.comparison.aeo.siteB)) * 100}%` }}></div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* GEO Battle */}
                                    <Card className="border-geo/20 bg-geo/5">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                                                GEO CITATION LIKELIHOOD
                                                {comparisonData.comparison.geo.winner === "siteA" ? <TrendingUp className="h-4 w-4 text-geo" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-end justify-between gap-4">
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className="text-3xl font-black text-seo">{comparisonData.comparison.geo.siteA}</div>
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground truncate w-full text-center">Your Site</div>
                                                </div>
                                                <div className="text-xs font-black italic text-muted-foreground mb-4 opacity-50">VS</div>
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className="text-3xl font-black text-aeo">{comparisonData.comparison.geo.siteB}</div>
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground truncate w-full text-center">Competitor</div>
                                                </div>
                                            </div>
                                            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                                                <div className="h-full bg-seo" style={{ width: `${(comparisonData.comparison.geo.siteA / (comparisonData.comparison.geo.siteA + comparisonData.comparison.geo.siteB)) * 100}%` }}></div>
                                                <div className="h-full bg-aeo" style={{ width: `${(comparisonData.comparison.geo.siteB / (comparisonData.comparison.geo.siteA + comparisonData.comparison.geo.siteB)) * 100}%` }}></div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Stolen Opportunities & Strategic Gaps */}
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-8 relative z-20">
                                    <div className="space-y-6">
                                        <Card className="border-aeo/20 bg-aeo/5">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2 text-foreground">
                                                        <Zap className="h-5 w-5 text-aeo" />
                                                        Stolen Opportunities
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
                                    </div>

                                    <div className="space-y-6">
                                        <Card className="border-geo/20 bg-geo/5 h-full">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-foreground">
                                                    <ShieldAlert className="h-5 w-5 text-geo" />
                                                    Critical Strategic Gaps
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
                                                <div className="mt-8 p-4 rounded-xl bg-geo/10 border border-geo/20">
                                                    <h4 className="text-xs font-black uppercase text-geo tracking-widest mb-2">Expert Verdict</h4>
                                                    <p className="text-sm font-medium text-foreground leading-relaxed">
                                                        {comparisonData.winnerVerdict}
                                                    </p>
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

                                {/* ── Top 6 Strategic Fixes (Battle Recommendations) ── */}
                                {comparisonData.recommendations?.length > 0 && (
                                    <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5 relative z-10 mb-10">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Zap className="h-5 w-5 text-geo" />
                                                    Top 6 Counter-Strategies
                                                </CardTitle>
                                                <CardDescription>AI-generated plan to outmaneuver this competitor in AI search rankings</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="border-geo/30 text-geo font-black text-[10px] tracking-widest uppercase px-3 py-1 bg-geo/5">
                                                    Intelligence Battle Plan
                                                </Badge>
                                                <button
                                                    onClick={() => {
                                                        const text = comparisonData.recommendations.map((f: any) => `[RANK ${f.rank}] ${f.title}\nACTION: ${f.description}\nIMPACT: ${f.impact}`).join('\n\n');
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
                                                {comparisonData.recommendations.map((fix: any, i: number) => (
                                                    <div key={i} className="flex flex-col p-5 rounded-2xl border border-border/40 bg-background/70 hover:border-geo/30 transition-all relative group overflow-hidden">
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
                                                                    title={
                                                                        (fix.priority || fix.roi) === 'CRITICAL' ? "Urgent - Fix immediately for maximum impact" :
                                                                        (fix.priority || fix.roi) === 'HIGH' ? "High priority - Address soon for significant gains" :
                                                                        "Quick win - Easy implementation with steady results"
                                                                    }
                                                                >
                                                                    {(fix.priority || fix.roi) === 'CRITICAL' ? '🔥 URGENT' : 
                                                                     (fix.priority || fix.roi) === 'HIGH' ? '⚡ HIGH PRIORITY' : 
                                                                     '✓ QUICK WIN'}
                                                                </Badge>
                                                            </div>
                                                            <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center text-[10px] font-black text-muted-foreground ring-1 ring-border/50">
                                                                {fix.rank}
                                                            </div>
                                                        </div>

                                                        <h5 className="font-bold text-sm mb-3 group-hover:text-geo transition-colors leading-tight">{fix.title}</h5>

                                                        <p className="text-xs text-muted-foreground leading-relaxed italic mb-6">
                                                            &ldquo;{fix.description}&rdquo;
                                                        </p>

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

                                                        {/* Accent glow on hover */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-geo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
