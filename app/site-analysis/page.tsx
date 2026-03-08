"use client"

import { useState, useEffect, useRef } from "react"
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
    Info,
    Code2,
} from "lucide-react"

// Simple tooltip component
function StatTooltip({ text }: { text: string }) {
    return (
        <div className="group relative inline-flex">
            <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-popover border border-border rounded-lg text-xs text-muted-foreground shadow-xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 leading-relaxed">
                {text}
            </div>
        </div>
    )
}

export default function SiteAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [url, setUrl] = useState("")
    const [analysisData, setAnalysisData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)

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

    // Duplicate title / meta detection
    const titleGroups = pages.reduce((acc: Record<string, string[]>, p: any) => {
        if (p.title) { acc[p.title] = [...(acc[p.title] || []), p.url] }
        return acc
    }, {})
    const duplicateTitles: [string, string[]][] = (Object.entries(titleGroups) as [string, string[]][]).filter(([, urls]) => urls.length > 1)

    const metaGroups = pages.reduce((acc: Record<string, string[]>, p: any) => {
        if (p.description) { acc[p.description] = [...(acc[p.description] || []), p.url] }
        return acc
    }, {})
    const duplicateMetas: [string, string[]][] = (Object.entries(metaGroups) as [string, string[]][]).filter(([, urls]) => urls.length > 1)

    // Image alt coverage
    const totalImgs = pages.reduce((s: number, p: any) => s + (p.imgTotal || 0), 0)
    const imgsWithAlt = pages.reduce((s: number, p: any) => s + (p.imgWithAlt || 0), 0)
    const imgAltPct = totalImgs > 0 ? Math.round((imgsWithAlt / totalImgs) * 100) : 100

    // Heading depth
    const pagesWithH2 = pages.filter((p: any) => (p.h2Count || 0) > 0).length
    const pagesWithH3 = pages.filter((p: any) => (p.h3Count || 0) > 0).length
    const flatPages = pages.filter((p: any) => (p.h2Count || 0) === 0 && p.hasH1)

    // PDF Export
    const handleExportPdf = () => {
        const printStyles = `
            @media print {
                @page { size: auto; margin: 15mm; }

                /* 1. Hide EVERYTHING */
                body * { visibility: hidden !important; }

                /* 2. Show only the report and all its descendants */
                [data-report],
                [data-report] * {
                    visibility: visible !important;
                }

                /* 3. Pull report out of the dashboard layout */
                [data-report] {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }

                /* 4. Unlock all parent scroll locks */
                html, body,
                body > div, body > div > div, body > div > div > div,
                main, [class*="overflow"] {
                    height: auto !important;
                    max-height: none !important;
                    overflow: visible !important;
                    position: static !important;
                }

                /* 5. Preserve all colours in print */
                *, *::before, *::after {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }

                /* 6. Prevent cards from being sliced */
                [data-report] > div {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                /* 7. Hide interactive-only elements */
                .no-print { display: none !important; }

                /* 8. Show print header */
                .print-header { display: block !important; }
            }
        `
        const styleEl = document.createElement('style')
        styleEl.id = 'pdf-print-styles'
        styleEl.innerHTML = printStyles
        document.head.appendChild(styleEl)

        const originalTitle = document.title
        try {
            const hostname = url.includes('://') ? new URL(url).hostname : url
            document.title = `SiteAudit_Report_${hostname}`
        } catch { document.title = 'SiteAudit_Report' }

        window.print()

        document.title = originalTitle
        document.head.removeChild(styleEl)
    }

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
                                analysisData && (
                                    <div ref={reportRef} data-report className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                        {/* ── Print Header (Only visible in PDF) ── */}
                                        <div className="hidden print-header">
                                            <h1 className="text-3xl font-black mb-1">Intelligence Report</h1>
                                            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">
                                                Domain Audit: {url} • Generated {new Date().toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* ── Row 1: Key Metrics ── */}
                                        {(() => {
                                            const h1Pct = pages.length > 0 ? Math.round((pages.filter((p: any) => p.hasH1).length / pages.length) * 100) : 0
                                            const httpsPct = pages.length > 0 ? Math.round((pages.filter((p: any) => p.isHttps).length / pages.length) * 100) : 0
                                            const stats = [
                                                { label: "Pages Scanned", value: analysisData.pagesCrawled, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30", tip: "Total number of unique internal pages the crawler successfully visited on this domain." },
                                                { label: "Domain Health", value: `${ai?.domainHealthScore ?? "–"}%`, color: "text-geo", border: "border-geo/20", bg: "bg-geo/5", tip: "AI-generated composite score (0-100) measuring the overall structural and content health of the domain." },
                                                { label: "Brand Consistency", value: `${ai?.consistencyScore ?? "–"}%`, color: "text-aeo", border: "border-aeo/20", bg: "bg-aeo/5", tip: "How consistently the brand message, tone, and topic focus is maintained across all crawled pages." },
                                                { label: "Schema Coverage", value: `${ai?.authorityMetrics?.schemaCoverage ?? "–"}%`, color: "text-seo", border: "border-seo/20", bg: "bg-seo/5", tip: "Percentage of pages that include at least one valid JSON-LD structured data block. Critical for AI citation visibility." },
                                                { label: "Metadata Opt.", value: `${ai?.authorityMetrics?.metadataOptimization ?? "–"}%`, color: "text-foreground", border: "border-border/50", bg: "bg-muted/30", tip: "Percentage of pages that have both a title tag and a meta description present and non-empty." },
                                                { label: "H1 Coverage", value: `${h1Pct}%`, color: h1Pct >= 90 ? "text-geo" : "text-destructive", border: h1Pct >= 90 ? "border-geo/20" : "border-destructive/20", bg: h1Pct >= 90 ? "bg-geo/5" : "bg-destructive/5", tip: "Percentage of pages with a valid H1 heading tag. Missing H1s are a direct SEO penalty signal." },
                                                { label: "HTTPS", value: `${httpsPct}%`, color: httpsPct === 100 ? "text-geo" : "text-destructive", border: httpsPct === 100 ? "border-geo/20" : "border-destructive/20", bg: httpsPct === 100 ? "bg-geo/5" : "bg-destructive/5", tip: "Percentage of crawled pages served over a secure HTTPS connection. Any HTTP pages are a trust and ranking risk." },
                                                { label: "Avg Response", value: `${avgResponseTime}ms`, color: avgResponseTime < 1500 ? "text-geo" : "text-destructive", border: "border-border/50", bg: "bg-muted/30", tip: "Average server response time across all crawled pages. Under 1500ms is healthy. Over 2000ms risks ranking demotion." },
                                            ]
                                            return (
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                                                    {stats.map(stat => (
                                                        <Card key={stat.label} className={cn("col-span-1", stat.border, stat.bg)}>
                                                            <CardHeader className="pb-1 pt-4 px-4">
                                                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter leading-tight flex items-center gap-1">
                                                                    {stat.label}
                                                                    <StatTooltip text={stat.tip} />
                                                                </CardDescription>
                                                                <CardTitle className={cn("text-2xl font-black", stat.color)}>{stat.value}</CardTitle>
                                                            </CardHeader>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )
                                        })()}

                                        {/* ── Domain Health Breakdown ── */}
                                        <Card className="border-geo/20 bg-geo/5">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-geo">
                                                    <ShieldCheck className="h-5 w-5" />
                                                    Domain Health Breakdown
                                                    <Badge className="ml-auto bg-geo/10 text-geo border-geo/30 text-xs font-black">{ai?.domainHealthScore ?? "–"} / 100</Badge>
                                                </CardTitle>
                                                <CardDescription>How the composite Domain Health score was calculated across crawled pages</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                                    {[
                                                        {
                                                            label: "Content Quality",
                                                            desc: "Pages with 300+ words of substantive body text",
                                                            pct: pages.length > 0 ? Math.round((pages.filter((p: any) => p.wordCount >= 300).length / pages.length) * 100) : 0,
                                                            color: "text-geo",
                                                            bar: "bg-geo"
                                                        },
                                                        {
                                                            label: "Schema Deployment",
                                                            desc: "Pages with valid JSON-LD structured data",
                                                            pct: pages.length > 0 ? Math.round((pages.filter((p: any) => p.schemas?.length > 0).length / pages.length) * 100) : 0,
                                                            color: "text-seo",
                                                            bar: "bg-seo"
                                                        },
                                                        {
                                                            label: "Metadata Completeness",
                                                            desc: "Pages with both a title tag and meta description",
                                                            pct: pages.length > 0 ? Math.round((pages.filter((p: any) => p.title && p.description).length / pages.length) * 100) : 0,
                                                            color: "text-aeo",
                                                            bar: "bg-aeo"
                                                        },
                                                        {
                                                            label: "H1 Compliance",
                                                            desc: "Pages with at least one H1 heading tag",
                                                            pct: pages.length > 0 ? Math.round((pages.filter((p: any) => p.hasH1).length / pages.length) * 100) : 0,
                                                            color: "text-geo",
                                                            bar: "bg-geo"
                                                        },
                                                        {
                                                            label: "Site Security",
                                                            desc: "Pages served over a secure HTTPS connection",
                                                            pct: pages.length > 0 ? Math.round((pages.filter((p: any) => p.isHttps).length / pages.length) * 100) : 0,
                                                            color: "text-geo",
                                                            bar: "bg-geo"
                                                        },
                                                    ].map(factor => (
                                                        <div key={factor.label} className="p-3 rounded-xl border border-border/40 bg-background/60 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold">{factor.label}</p>
                                                                <span className={cn("text-sm font-black", factor.color)}>{factor.pct}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div className={cn("h-full rounded-full", factor.bar)} style={{ width: `${factor.pct}%` }} />
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground leading-snug">{factor.desc}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

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
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Meta</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Schema</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">HTTPS</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Words</th>
                                                                    <th className="text-center text-muted-foreground pb-2 font-medium">Links</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border/30">
                                                                {pages.slice(0, 12).map((p: any, i: number) => (
                                                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                                        <td className="py-2 font-mono truncate max-w-[120px]">{new URL(p.url).pathname || "/"}</td>
                                                                        <td className="py-2 text-center">
                                                                            {p.hasH1 ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className="py-2 text-center">
                                                                            {(p.title && p.description) ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className="py-2 text-center">
                                                                            {p.schemas?.length > 0 ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className="py-2 text-center">
                                                                            {p.isHttps ? <CheckCircle2 className="h-3 w-3 text-geo inline" /> : <XCircle className="h-3 w-3 text-destructive inline" />}
                                                                        </td>
                                                                        <td className={cn("py-2 text-center font-mono text-xs", p.wordCount < 300 ? "text-destructive" : "text-foreground")}>{p.wordCount}</td>
                                                                        <td className="py-2 text-center font-mono text-xs text-muted-foreground">{p.internalLinks}</td>
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

                                        {/* ── HTTPS Violations (conditional) ── */}
                                        {(() => {
                                            const httpViolations = pages.filter((p: any) => !p.isHttps)
                                            if (httpViolations.length === 0) return null
                                            return (
                                                <Card className="border-destructive/30 bg-destructive/5">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2 text-destructive">
                                                            <AlertTriangle className="h-5 w-5" />
                                                            HTTPS Violations Detected
                                                            <Badge variant="outline" className="ml-auto border-destructive/50 text-destructive">{httpViolations.length} insecure page{httpViolations.length > 1 ? 's' : ''}</Badge>
                                                        </CardTitle>
                                                        <CardDescription>These pages are being served over unencrypted HTTP. Google treats mixed-content sites as untrusted and may demote them in rankings.</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-2">
                                                            {httpViolations.map((p: any, i: number) => (
                                                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-destructive/20 bg-background/50">
                                                                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                                                    <span className="text-xs font-mono text-muted-foreground truncate">{p.url}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })()}

                                        {/* ── Row 5: Brand Consistency Analysis + Architecture + Schema ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <Card className="border-aeo/20 bg-aeo/5 lg:col-span-1">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-aeo">
                                                        <Sparkles className="h-5 w-5" />
                                                        Brand Consistency Analysis
                                                        <Badge className="ml-auto bg-aeo/10 text-aeo border-aeo/30 text-xs font-black">{ai?.consistencyScore ?? "–"}%</Badge>
                                                    </CardTitle>
                                                    <CardDescription>AI-measured brand cohesion across all crawled pages</CardDescription>
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

                                        {/* ── Robots.txt & Sitemap Status ── */}
                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Globe className="h-5 w-5 text-geo" />
                                                    Robots.txt & Sitemap Status
                                                </CardTitle>
                                                <CardDescription>Crawlability infrastructure check</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className={cn("flex items-center gap-3 p-4 rounded-xl border", analysisData?.robotsTxt?.exists ? "border-geo/30 bg-geo/5" : "border-destructive/30 bg-destructive/5")}>
                                                        {analysisData?.robotsTxt?.exists ? <CheckCircle2 className="h-5 w-5 text-geo shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                                                        <div>
                                                            <p className="text-sm font-bold">robots.txt</p>
                                                            <p className="text-xs text-muted-foreground">{analysisData?.robotsTxt?.exists ? "File found — crawler instructions present" : "Missing — all bots have unrestricted access"}</p>
                                                        </div>
                                                    </div>
                                                    <div className={cn("flex items-center gap-3 p-4 rounded-xl border", analysisData?.sitemap?.exists ? "border-geo/30 bg-geo/5" : "border-destructive/30 bg-destructive/5")}>
                                                        {analysisData?.sitemap?.exists ? <CheckCircle2 className="h-5 w-5 text-geo shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                                                        <div>
                                                            <p className="text-sm font-bold">sitemap.xml</p>
                                                            <p className="text-xs text-muted-foreground">{analysisData?.sitemap?.exists ? "Sitemap found — Google can discover all pages" : "Missing — Google must manually crawl to find pages"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* ── Heading Structure + Image Alt ── */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="border-border/50">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5 text-aeo" />
                                                        Heading Structure Analysis
                                                    </CardTitle>
                                                    <CardDescription>Document hierarchy depth across all crawled pages</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {[
                                                            { label: "H1 Coverage", pct: Math.round((pages.filter((p: any) => p.hasH1).length / Math.max(pages.length, 1)) * 100), count: pages.filter((p: any) => p.hasH1).length, color: "bg-geo", textColor: "text-geo", desc: "pages have an H1 heading" },
                                                            { label: "H2 Coverage", pct: Math.round((pagesWithH2 / Math.max(pages.length, 1)) * 100), count: pagesWithH2, color: "bg-aeo", textColor: "text-aeo", desc: "pages have H2 subheadings" },
                                                            { label: "H3 Coverage", pct: Math.round((pagesWithH3 / Math.max(pages.length, 1)) * 100), count: pagesWithH3, color: "bg-seo", textColor: "text-seo", desc: "pages have H3 subheadings" },
                                                        ].map(h => (
                                                            <div key={h.label} className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="font-bold">{h.label}</span>
                                                                    <span className={cn("font-black", h.textColor)}>{h.count} / {pages.length} pages</span>
                                                                </div>
                                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                                    <div className={cn("h-full rounded-full", h.color)} style={{ width: `${h.pct}%` }} />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground">{h.count} {h.desc}</p>
                                                            </div>
                                                        ))}
                                                        {flatPages.length > 0 && (
                                                            <div className="mt-2 p-3 rounded-lg border border-aeo/20 bg-aeo/5 text-xs text-aeo">
                                                                ⚠ {flatPages.length} page(s) have H1 but no H2 — &ldquo;flat&rdquo; content that AI models find hard to parse.
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className={cn("border-border/50", imgAltPct < 80 && "border-destructive/20")}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Activity className="h-5 w-5 text-seo" />
                                                        Image Alt Text Coverage
                                                        <Badge className={cn("ml-auto text-xs font-black", imgAltPct >= 90 ? "bg-geo/10 text-geo border-geo/30" : imgAltPct >= 70 ? "bg-aeo/10 text-aeo border-aeo/30" : "bg-destructive/10 text-destructive border-destructive/30")}>{imgAltPct}%</Badge>
                                                    </CardTitle>
                                                    <CardDescription>Accessibility & SEO image signal across the domain</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-xs mb-1.5">
                                                            <span className="text-muted-foreground">{imgsWithAlt} of {totalImgs} images have alt text</span>
                                                            <span className={cn("font-black", imgAltPct >= 90 ? "text-geo" : imgAltPct >= 70 ? "text-aeo" : "text-destructive")}>{imgAltPct}%</span>
                                                        </div>
                                                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                            <div className={cn("h-full rounded-full", imgAltPct >= 90 ? "bg-geo" : imgAltPct >= 70 ? "bg-aeo" : "bg-destructive")} style={{ width: `${imgAltPct}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                                        {pages.filter((p: any) => (p.imgTotal || 0) > 0).map((p: any, i: number) => {
                                                            const pct = p.imgTotal > 0 ? Math.round((p.imgWithAlt / p.imgTotal) * 100) : 100
                                                            return (
                                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                                    <span className="font-mono text-muted-foreground truncate flex-1">{new URL(p.url).pathname || "/"}</span>
                                                                    <span className={cn("font-bold shrink-0", pct === 100 ? "text-geo" : pct >= 70 ? "text-aeo" : "text-destructive")}>{p.imgWithAlt}/{p.imgTotal}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* ── Duplicate Title & Meta Detection ── */}
                                        {(duplicateTitles.length > 0 || duplicateMetas.length > 0) && (
                                            <Card className="border-destructive/30 bg-destructive/5">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                                        <AlertTriangle className="h-5 w-5" />
                                                        Duplicate Title & Meta Detection
                                                    </CardTitle>
                                                    <CardDescription>Pages sharing identical title tags or meta descriptions — a direct ranking penalty signal</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-5">
                                                    {duplicateTitles.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">Duplicate Titles ({duplicateTitles.length})</p>
                                                            <div className="space-y-2">
                                                                {duplicateTitles.map(([title, urls], i) => (
                                                                    <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-background/50">
                                                                        <p className="text-xs font-semibold mb-1.5 truncate">&ldquo;{title}&rdquo;</p>
                                                                        {urls.map((u, j) => <p key={j} className="text-[10px] font-mono text-muted-foreground truncate">↳ {u}</p>)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {duplicateMetas.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">Duplicate Meta Descriptions ({duplicateMetas.length})</p>
                                                            <div className="space-y-2">
                                                                {duplicateMetas.map(([meta, urls], i) => (
                                                                    <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-background/50">
                                                                        <p className="text-xs font-semibold mb-1.5 line-clamp-2">&ldquo;{meta}&rdquo;</p>
                                                                        {urls.map((u, j) => <p key={j} className="text-[10px] font-mono text-muted-foreground truncate">↳ {u}</p>)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                        {(duplicateTitles.length === 0 && duplicateMetas.length === 0 && pages.length > 0) && (
                                            <Card className="border-geo/20 bg-geo/5">
                                                <CardContent className="flex items-center gap-3 py-4">
                                                    <CheckCircle2 className="h-5 w-5 text-geo shrink-0" />
                                                    <p className="text-sm font-medium text-geo">No duplicate titles or meta descriptions detected across {pages.length} pages.</p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── AEO Citation Readiness ── */}
                                        {ai?.aeoReadiness && (
                                            <Card className="border-aeo/20 bg-aeo/5">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-aeo">
                                                        <Sparkles className="h-5 w-5" />
                                                        AEO Citation Readiness Score
                                                        <Badge className="ml-auto bg-aeo/10 text-aeo border-aeo/30 text-xs font-black">{ai.aeoReadiness.score} / 100</Badge>
                                                    </CardTitle>
                                                    <CardDescription>How ready this domain is to be cited by ChatGPT, Perplexity, and Gemini</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
                                                        {ai.aeoReadiness.signals && Object.entries(ai.aeoReadiness.signals).map(([key, val]: [string, any]) => {
                                                            const labels: Record<string, string> = {
                                                                hasAboutPage: "About Page", hasFaqContent: "FAQ Content", hasStructuredQa: "Q&A Structure",
                                                                hasAuthorOrExpertSignals: "Expert Signals", hasClearTopicFocus: "Topic Focus",
                                                                hasSchemaForAi: "AI Schema", hasLongformContent: "Long-form"
                                                            }
                                                            return (
                                                                <div key={key} className={cn("flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-center", val ? "border-aeo/30 bg-aeo/10" : "border-border/40 bg-muted/30")}>
                                                                    {val ? <CheckCircle2 className="h-4 w-4 text-aeo" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                                                                    <p className="text-[10px] font-medium leading-tight">{labels[key] || key}</p>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <p className="text-sm text-foreground/80 leading-relaxed italic border-t border-border/50 pt-4">&ldquo;{ai.aeoReadiness.verdict}&rdquo;</p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* ── Social Proof Signals ── */}
                                        {ai?.socialProofSignals && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <Card className="border-border/50">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-5 w-5 text-geo" />
                                                            Social Proof Signals Found
                                                        </CardTitle>
                                                        <CardDescription>Trust signals Google and AI models use to verify authority</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {ai.socialProofSignals.found?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {ai.socialProofSignals.found.map((s: string, i: number) => (
                                                                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-geo/20 bg-geo/5">
                                                                        <CheckCircle2 className="h-3.5 w-3.5 text-geo shrink-0" />
                                                                        <p className="text-xs">{s}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">No social proof signals detected on this domain.</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                                <Card className="border-border/50">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <AlertCircle className="h-5 w-5 text-aeo" />
                                                            Missing Trust Signals
                                                        </CardTitle>
                                                        <CardDescription>High-impact trust indicators your competitors likely have</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {ai.socialProofSignals.missing?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {ai.socialProofSignals.missing.map((s: string, i: number) => (
                                                                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-aeo/20 bg-aeo/5">
                                                                        <XCircle className="h-3.5 w-3.5 text-aeo shrink-0" />
                                                                        <p className="text-xs">{s}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-geo">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <p className="text-sm font-medium">Strong trust signal presence — no major gaps found.</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}

                                        {/* ── Prioritized Fix List ── */}
                                        {ai?.prioritizedFixes?.length > 0 && (
                                            <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-aeo/5">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Zap className="h-5 w-5 text-geo" />
                                                        Top 3 Prioritized Fixes
                                                    </CardTitle>
                                                    <CardDescription>If you could only fix 3 things this month, fix these — ordered by ROI</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {ai.prioritizedFixes.map((fix: any, i: number) => (
                                                            <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-background/70">
                                                                <div className="h-10 w-10 shrink-0 rounded-full bg-geo/10 border border-geo/30 flex items-center justify-center text-lg font-black text-geo">
                                                                    {fix.rank}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h5 className="font-bold text-sm">{fix.title}</h5>
                                                                        <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">{fix.category}</Badge>
                                                                        <Badge className={cn("text-[10px] ml-auto", fix.estimatedImpact === 'High' ? "bg-geo/10 text-geo border-geo/30" : "bg-aeo/10 text-aeo border-aeo/30")}>{fix.estimatedImpact} Impact</Badge>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground leading-relaxed">{fix.action}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Start Over + PDF Export */}
                                        <div className="flex justify-between items-center pt-4 border-t border-border/50 no-print">
                                            <button
                                                onClick={() => { setAnalysisData(null); setUrl(""); sessionStorage.removeItem("pro_url"); sessionStorage.removeItem("pro_data"); }}
                                                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                                            >
                                                ← Start New Audit
                                            </button>
                                            <button
                                                onClick={handleExportPdf}
                                                className="flex items-center gap-2 bg-geo text-geo-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-geo/90 transition-all text-sm shadow-md"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Export PDF Report
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
