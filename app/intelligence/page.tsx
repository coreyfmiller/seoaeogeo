"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
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
                <Header apiStatus={apiStatus} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-10 text-center sm:text-left">
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-seo via-aeo to-geo flex items-center gap-4 mb-4">
                                <Swords className="h-10 w-10 text-aeo animate-pulse" />
                                Site Vs Site
                            </h1>
                            <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
                                Benchmark SEO, AEO, and GEO citation metrics between your brand and a competitor.
                                Identify exactly how they are winning and how to reclaim your visibility.
                            </p>
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

                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-10 w-full items-center relative z-10">
                                    {/* Site A */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest text-seo">Contender 1</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-seo transition-colors" />
                                            <input
                                                id="siteA"
                                                type="text"
                                                value={siteA}
                                                onChange={(e) => setSiteA(e.target.value)}
                                                placeholder="fundylogic.com"
                                                className="w-full pl-12 pr-6 py-4 bg-muted/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50 transition-all text-lg"
                                            />
                                        </div>
                                    </div>

                                    {/* VS Divider */}
                                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                                        <div className="h-20 w-px bg-border/50 hidden md:block" />
                                        <div className="h-12 w-12 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center font-black text-foreground italic z-10 shrink-0">
                                            VS
                                        </div>
                                        <div className="h-20 w-px bg-border/50 hidden md:block" />
                                    </div>

                                    {/* Site B */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest text-aeo">Contender 2</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-aeo transition-colors" />
                                            <input
                                                id="siteB"
                                                type="text"
                                                value={siteB}
                                                onChange={(e) => setSiteB(e.target.value)}
                                                placeholder="competitor.ca"
                                                className="w-full pl-12 pr-6 py-4 bg-muted/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-aeo/20 focus:border-aeo/50 transition-all text-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-14 relative z-10">
                                    <button
                                        onClick={() => {
                                            if (siteA && siteB) handleBattle(siteA, siteB);
                                        }}
                                        disabled={isAnalyzing}
                                        className={cn(
                                            "group relative flex items-center justify-center px-10 py-4 bg-foreground text-background rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg ring-2 ring-transparent hover:ring-foreground/10",
                                            isAnalyzing && "opacity-70 pointer-events-none"
                                        )}
                                    >
                                        Start The Clash
                                        <Zap className="inline-block ml-3 h-6 w-6 animate-pulse" />
                                    </button>
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

                                {/* Stolen Opportunities */}
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                                    <div className="space-y-6">
                                        <Card className="border-aeo/20 bg-aeo/5">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Zap className="h-5 w-5 text-aeo" />
                                                    Stolen Opportunities: How they are winning
                                                </CardTitle>
                                                <CardDescription>
                                                    Specific insights where the AI recommends adopting competitor strategies to regain authority.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {comparisonData.stolenOpportunities.map((opp: any, i: number) => (
                                                        <div key={i} className="bg-background/80 border border-border/50 rounded-xl p-4 flex gap-4">
                                                            <div className={cn(
                                                                "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center",
                                                                opp.category === 'seo' ? "bg-seo/10 text-seo" : opp.category === 'aeo' ? "bg-aeo/10 text-aeo" : "bg-geo/10 text-geo"
                                                            )}>
                                                                {opp.category === 'seo' ? <Search className="h-5 w-5" /> : opp.category === 'aeo' ? <Sparkles className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-bold text-foreground">{opp.title}</h4>
                                                                    <Badge className={cn(
                                                                        opp.priority === 'high' ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                                                                    )}>
                                                                        {opp.priority}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                                    {opp.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Strategic Gaps */}
                                    <div className="space-y-6">
                                        <Card className="border-geo/20 bg-geo/5 h-full">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <ShieldAlert className="h-5 w-5 text-geo" />
                                                    Critical Strategic Gaps
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {comparisonData.strategicGaps.map((gap: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-3 text-sm border-b border-border/30 pb-3 last:border-0 italic">
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
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
