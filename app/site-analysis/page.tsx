"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ShieldCheck,
    Search,
    Activity,
    Globe,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    TrendingUp,
    Target,
    Zap,
    Lock,
    Sparkles,
    FileText,
    Link2,
    AlarmClock,
    LayoutDashboard,
    AlertTriangle,
    Map,
    Code2,
} from "lucide-react"

export default function SiteAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [url, setUrl] = useState("")
    const [analysisData, setAnalysisData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (localStorage.getItem("isProUnlocked") === "true") {
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }
            setIsCheckingAuth(false)

            const savedUrl = sessionStorage.getItem("pro_url")
            const savedData = sessionStorage.getItem("pro_data")
            if (savedUrl) setUrl(savedUrl)
            if (savedData) setAnalysisData(JSON.parse(savedData))
        }
    }, [])

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (url) sessionStorage.setItem("pro_url", url)
            if (analysisData) sessionStorage.setItem("pro_data", JSON.stringify(analysisData))
        }
    }, [url, analysisData])

    const handleDeepAudit = async (targetUrl: string) => {
        setIsAnalyzing(true)
        setError(null)
        setApiStatus("idle")

        try {
            const response = await fetch('/api/analyze-site', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl, maxPages: 20 })
            })

            const result = await response.json()

            if (result.success) {
                setAnalysisData(result.data)
                setApiStatus("healthy")
            } else {
                setError(result.error || 'Deep audit failed. Site might be blocking crawlers.')
                setApiStatus("error")
            }
        } catch (err: any) {
            setError('Connection failed. Server timeout or offline.')
            setApiStatus("error")
        } finally {
            setIsAnalyzing(false)
        }
    }

    if (isCheckingAuth) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 text-geo animate-spin" />
            </div>
        )
    }

    const ai = analysisData?.ai
    const pages = analysisData?.pages || []

    // Derived per-page metrics from actual crawl data
    const avgResponseTime = pages.length > 0
        ? Math.round(pages.reduce((s: number, p: any) => s + (p.responseTimeMs || 0), 0) / pages.length)
        : 0
    const slowPages = pages.filter((p: any) => p.responseTimeMs > 2000)
    const thinPages = pages.filter((p: any) => p.wordCount < 300)
    const missingH1 = pages.filter((p: any) => !p.hasH1)
    const pagesWithSchema = pages.filter((p: any) => p.schemas?.length > 0)

    return (
        <div className="flex h-screen bg-background">
            <AppSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header apiStatus={apiStatus} />

                <main className="flex-1 overflow-y-auto p-6">
                    {!isAuthorized ? (
                        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-card/50 border border-border/50 rounded-3xl animate-in zoom-in-95 mt-4 max-w-2xl mx-auto shadow-lg">
                            <div className="h-16 w-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Lock className="h-8 w-8 text-yellow-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-center">Pro Feature Locked</h2>
                            <p className="text-muted-foreground text-center text-lg mb-8 max-w-lg">
                                Deep Domain Auditing is an advanced feature reserved for Pro members. Unlock the Deep Crawler to analyze up to 20 pages at once for sitewide brand intelligence, global schema coverage, and architectural health.
                            </p>
                            <p className="text-sm font-semibold text-yellow-500 animate-pulse tracking-wider uppercase border border-yellow-500/30 bg-yellow-500/10 px-6 py-3 rounded-full">
                                ↑ Click &ldquo;Go Pro&rdquo; in the top right to unlock
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            {/* Pro Header */}
                            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                        <ShieldCheck className="h-8 w-8 text-geo" />
                                        PRO: Deep Crawler
                                    </h1>
                                    <p className="text-muted-foreground mt-2 max-w-2xl">
                                        Full domain authority audit — sitewide schema coverage, content gaps, cannibalization detection, and internal link architecture.
                                    </p>
                                    {analysisData && (
                                        <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-left-4">
                                            <span className="flex items-center gap-1.5 text-geo font-medium">
                                                <Globe className="h-4 w-4" />
                                                {url}
                                            </span>
                                            <Badge variant="outline" className="border-geo/50 text-geo bg-geo/5">
                                                <Activity className="h-3 w-3 mr-1.5" />
                                                {analysisData.pagesCrawled} Pages Scanned
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <Badge variant="secondary" className="bg-geo/10 text-geo border-geo/20 px-4 py-1 self-start sm:self-center">
                                    <Lock className="h-3 w-3 mr-2" />
                                    PROFESSIONAL PLAN
                                </Badge>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-8 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                    <AlertCircle className="h-5 w-5" />
                                    <div className="flex-1 text-sm font-medium">{error}</div>
                                    <button onClick={() => setError(null)} className="text-xs uppercase tracking-wider font-bold hover:underline">Dismiss</button>
                                </div>
                            )}

                            {/* Input State */}
                            {!analysisData && !isAnalyzing ? (
                                <div className="bg-card/50 border border-border/50 rounded-3xl p-12 flex flex-col items-center animate-in fade-in zoom-in-95">
                                    <div className="max-w-xl w-full text-center space-y-6">
                                        <div className="mx-auto h-16 w-16 bg-geo/10 rounded-2xl flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 text-geo" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Launch Full Domain Scan</h2>
                                        <p className="text-muted-foreground">
                                            Enter a domain to crawl 20+ pages and generate a full Pro authority report.
                                        </p>
                                        <div className="flex gap-2 p-2 bg-background border border-border/50 rounded-2xl focus-within:ring-2 focus-within:ring-geo/20 transition-all shadow-lg">
                                            <input
                                                type="text"
                                                placeholder="e.g. fundylogic.com"
                                                className="flex-1 bg-transparent border-none focus:outline-none px-4 py-3"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && url && handleDeepAudit(url)}
                                            />
                                            <button
                                                onClick={() => url && handleDeepAudit(url)}
                                                className="bg-geo text-geo-foreground px-6 py-3 rounded-xl font-bold hover:bg-geo/90 transition-all flex items-center gap-2"
                                            >
                                                Analyze Site
                                                <Zap className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Feature Preview */}
                                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                                        {[
                                            { icon: Map, color: "text-geo", label: "Site Architecture Map", desc: "Crawl Map with orphan page detection and internal link leaders" },
                                            { icon: FileText, color: "text-aeo", label: "Content Gap Analysis", desc: "AI identifies missing pages that competitors have but you don't" },
                                            { icon: AlertTriangle, color: "text-seo", label: "Cannibalization Risks", desc: "Detect pages competing for the same keywords and splitting authority" },
                                        ].map(f => (
                                            <div key={f.label} className="p-5 bg-background/50 border border-border/50 rounded-2xl">
                                                <f.icon className={cn("h-5 w-5 mb-3", f.color)} />
                                                <h4 className="font-bold text-sm mb-1">{f.label}</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            ) : isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
                                    <div className="h-20 w-20 rounded-full border-4 border-t-geo border-r-aeo border-b-seo border-l-transparent animate-spin mb-6"></div>
                                    <h2 className="text-2xl font-bold">Deep Domain Scan in Progress...</h2>
                                    <p className="text-muted-foreground mt-2 italic animate-pulse">Crawling 20 pages — this usually takes 45-90 seconds.</p>
                                </div>

                            ) : (
                                /* RESULTS */
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                                    {/* ── Row 1: Aggregate Score Cards ── */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                                        {[
                                            { label: "Pages Scanned", value: analysisData.pagesCrawled, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30" },
                                            { label: "Domain Health", value: `${ai?.domainHealthScore ?? "–"}%`, color: "text-geo", border: "border-geo/20", bg: "bg-geo/5" },
                                            { label: "Brand Consistency", value: `${ai?.consistencyScore ?? "–"}%`, color: "text-aeo", border: "border-aeo/20", bg: "bg-aeo/5" },
                                            { label: "Schema Coverage", value: `${ai?.authorityMetrics?.schemaCoverage ?? "–"}%`, color: "text-seo", border: "border-seo/20", bg: "bg-seo/5" },
                                            { label: "Metadata Opt.", value: `${ai?.authorityMetrics?.metadataOptimization ?? "–"}%`, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30" },
                                            { label: "H1 Coverage", value: `${ai?.authorityMetrics?.h1Coverage ?? "–"}%`, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30" },
                                            { label: "HTTPS Compliance", value: `${ai?.authorityMetrics?.httpsCompliance ?? "–"}%`, color: "text-geo", border: "border-geo/20", bg: "bg-geo/5" },
                                            { label: "Avg Response", value: `${avgResponseTime}ms`, color: avgResponseTime < 1500 ? "text-geo" : "text-destructive", border: "border-border/50", bg: "bg-muted/30" },
                                        ].map(stat => (
                                            <Card key={stat.label} className={cn("col-span-1 md:col-span-1 lg:col-span-1", stat.border, stat.bg)}>
                                                <CardHeader className="pb-1 pt-4 px-4">
                                                    <CardDescription className="text-[10px] font-bold uppercase tracking-tighter leading-tight">{stat.label}</CardDescription>
                                                    <CardTitle className={cn("text-2xl font-black", stat.color)}>{stat.value}</CardTitle>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* ── Row 2: Sitewide Insights + Content Gap ── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <TrendingUp className="h-5 w-5 text-geo" />
                                                    Sitewide Strategic Insights
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {ai?.sitewideInsights?.map((insight: any, i: number) => (
                                                        <div key={i} className="p-4 rounded-xl border border-border/40 bg-background/50 flex gap-4">
                                                            <div className={cn(
                                                                "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold uppercase",
                                                                insight.impact === 'critical' ? "bg-destructive/10 text-destructive" :
                                                                    insight.impact === 'high' ? "bg-aeo/10 text-aeo" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {insight.impact[0]}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-sm mb-1">{insight.title}</h5>
                                                                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-aeo" />
                                                    Content Gap Analysis
                                                </CardTitle>
                                                <CardDescription>Missing pages that are weakening your domain authority</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {ai?.contentGapAnalysis?.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {ai.contentGapAnalysis.map((gap: any, i: number) => (
                                                            <div key={i} className="flex gap-3 p-3 rounded-lg border border-aeo/20 bg-aeo/5">
                                                                <AlertCircle className="h-4 w-4 text-aeo shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-sm font-semibold">{gap.missingPage}</p>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{gap.reason}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No major content gaps detected.</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* ── Row 3: Cannibalization + Internal Link Leaders ── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card className="border-destructive/20">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-destructive">
                                                    <AlertTriangle className="h-5 w-5" />
                                                    Keyword Cannibalization Risks
                                                </CardTitle>
                                                <CardDescription>Pages competing against each other for the same topic</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {ai?.cannibalizationRisks?.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {ai.cannibalizationRisks.map((risk: any, i: number) => (
                                                            <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2">
                                                                <Badge variant="outline" className="border-destructive/40 text-destructive text-xs">{risk.conflictingTopic}</Badge>
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="text-xs text-muted-foreground font-mono truncate">{risk.pageA}</p>
                                                                    <p className="text-xs text-muted-foreground font-mono truncate">{risk.pageB}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-geo">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        <p className="text-sm font-medium">No cannibalization risks detected.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Link2 className="h-5 w-5 text-seo" />
                                                    Internal Link Leaders
                                                </CardTitle>
                                                <CardDescription>Pages receiving the most internal equity — prioritized by Google</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {ai?.internalLinkLeaders?.map((link: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-seo/20 bg-seo/5">
                                                            <span className="text-xs font-black text-seo w-5 shrink-0">#{i + 1}</span>
                                                            <span className="text-xs font-mono text-muted-foreground truncate">{link}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* ── Row 4: Page-level Speed + Orphan Risks ── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <AlarmClock className="h-5 w-5 text-aeo" />
                                                    Page Speed Breakdown
                                                </CardTitle>
                                                <CardDescription>Response times across all crawled pages</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                                    {pages.map((p: any, i: number) => {
                                                        const ms = p.responseTimeMs || 0
                                                        const pct = Math.min((ms / 4000) * 100, 100)
                                                        const color = ms < 1000 ? "bg-geo" : ms < 2000 ? "bg-aeo" : "bg-destructive"
                                                        return (
                                                            <div key={i} className="space-y-1">
                                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                                    <span className="truncate max-w-[75%] font-mono">{new URL(p.url).pathname || "/"}</span>
                                                                    <span className={cn("font-bold", ms < 1000 ? "text-geo" : ms < 2000 ? "text-aeo" : "text-destructive")}>{ms}ms</span>
                                                                </div>
                                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                                    <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="flex gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-geo inline-block" />Fast (&lt;1s)</span>
                                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-aeo inline-block" />OK (1-2s)</span>
                                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive inline-block" />Slow (&gt;2s)</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <LayoutDashboard className="h-5 w-5 text-seo" />
                                                    Page Health Matrix
                                                </CardTitle>
                                                <CardDescription>Per-page structural signals from the crawl</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="border-b border-border/50">
                                                                <th className="text-left text-muted-foreground pb-2 font-medium">Page</th>
                                                                <th className="text-center text-muted-foreground pb-2 font-medium">H1</th>
                                                                <th className="text-center text-muted-foreground pb-2 font-medium">Schema</th>
                                                                <th className="text-center text-muted-foreground pb-2 font-medium">Words</th>
                                                                <th className="text-center text-muted-foreground pb-2 font-medium">Int. Links</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/30">
                                                            {pages.slice(0, 12).map((p: any, i: number) => (
                                                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                                    <td className="py-2 font-mono truncate max-w-[140px]">{new URL(p.url).pathname || "/"}</td>
                                                                    <td className="py-2 text-center">
                                                                        {p.hasH1 ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                    </td>
                                                                    <td className="py-2 text-center">
                                                                        {p.schemas?.length > 0 ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                    </td>
                                                                    <td className={cn("py-2 text-center font-mono", p.wordCount < 300 ? "text-destructive" : "text-foreground")}>{p.wordCount}</td>
                                                                    <td className="py-2 text-center font-mono text-muted-foreground">{p.internalLinks}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="mt-4 flex gap-4 flex-wrap text-xs text-destructive font-medium">
                                                    {thinPages.length > 0 && <span>⚠ {thinPages.length} thin page(s) &lt;300 words</span>}
                                                    {slowPages.length > 0 && <span>⚠ {slowPages.length} slow page(s) &gt;2s</span>}
                                                    {missingH1.length > 0 && <span>⚠ {missingH1.length} page(s) missing H1</span>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* ── Row 5: Brand Verdict + Orphan Pages + Schema Coverage ── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <Card className="border-aeo/20 bg-aeo/5 lg:col-span-1">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-aeo">
                                                    <Sparkles className="h-5 w-5" />
                                                    Brand Verdict
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm font-medium leading-relaxed">{ai?.brandClarityVerdict}</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/50 lg:col-span-1">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Target className="h-5 w-5 text-geo" />
                                                    Navigation & Architecture
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm leading-relaxed text-foreground/80 italic">
                                                    &ldquo;{ai?.navigationAnalysis}&rdquo;
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/50 lg:col-span-1">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Code2 className="h-5 w-5 text-seo" />
                                                    Schema Type Coverage
                                                </CardTitle>
                                                <CardDescription>{pagesWithSchema.length} of {pages.length} pages have structured data</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {[...new Set(pages.flatMap((p: any) => p.schemaTypes || []))].map((type: any) => (
                                                        <Badge key={type} variant="outline" className="border-seo/30 text-seo bg-seo/5 text-xs">{type}</Badge>
                                                    ))}
                                                    {pages.flatMap((p: any) => p.schemaTypes || []).length === 0 && (
                                                        <p className="text-sm text-muted-foreground italic">No structured data found across crawled pages.</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Start Over */}
                                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                        <button
                                            onClick={() => { setAnalysisData(null); setUrl(""); sessionStorage.removeItem("pro_url"); sessionStorage.removeItem("pro_data"); }}
                                            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                                        >
                                            ← Start New Audit
                                        </button>
                                        <Badge className="bg-geo hover:bg-geo/90 cursor-pointer">Export White-Label Report (Pro)</Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
