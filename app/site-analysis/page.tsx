"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import {
    ShieldCheck,
    Search,
    Activity,
    Globe,
    CheckCircle2,
    Loader2,
    AlertCircle,
    TrendingUp,
    Target,
    Zap,
    Lock,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SiteAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [url, setUrl] = useState("")
    const [analysisData, setAnalysisData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
    const [progress, setProgress] = useState(0)

    const handleDeepAudit = async (targetUrl: string) => {
        setIsAnalyzing(true)
        setError(null)
        setApiStatus("idle")
        setProgress(10)

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
            setProgress(0)
        }
    }

    return (
        <div className="flex h-screen bg-background">
            <AppSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header apiStatus={apiStatus} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Pro Header */}
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                    <ShieldCheck className="h-8 w-8 text-geo" />
                                    PRO: Deep Site Authority Audit
                                </h1>
                                <p className="text-muted-foreground mt-2 max-w-2xl">
                                    Advanced sitewide analysis. We crawl 20+ pages to verify brand consistency,
                                    schema coverage, and global AI authority.
                                </p>
                                {analysisData && (
                                    <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-left-4">
                                        <span className="flex items-center gap-1.5 text-geo font-medium">
                                            <Globe className="h-4 w-4" />
                                            Analysis Live: {url}
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

                        {/* Error Message */}
                        {error && (
                            <div className="mb-8 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <AlertCircle className="h-5 w-5" />
                                <div className="flex-1 text-sm font-medium">{error}</div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-xs uppercase tracking-wider font-bold hover:underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Input Form */}
                        {!analysisData && !isAnalyzing ? (
                            <div className="bg-card/50 border border-border/50 rounded-3xl p-12 flex flex-col items-center animate-in fade-in zoom-in-95">
                                <div className="max-w-xl w-full text-center space-y-6">
                                    <div className="mx-auto h-16 w-16 bg-geo/10 rounded-2xl flex items-center justify-center mb-4">
                                        <Search className="h-8 w-8 text-geo" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Launch Full Domain Scan</h2>
                                    <p className="text-muted-foreground">
                                        Enter a domain to discover internal links and perform a multi-page
                                        Search Intelligence benchmark.
                                    </p>

                                    <div className="flex gap-2 p-2 bg-background border border-border/50 rounded-2xl focus-within:ring-2 focus-within:ring-geo/20 transition-all shadow-lg">
                                        <input
                                            type="text"
                                            placeholder="e.g. valleymarketing.ca"
                                            className="flex-1 bg-transparent border-none focus:outline-none px-4 py-3"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
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

                                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                                    <div className="p-6 bg-background/50 border border-border/50 rounded-2xl">
                                        <h4 className="font-bold flex items-center gap-2 mb-2">
                                            <Globe className="h-4 w-4 text-geo" />
                                            Link Discovery
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Automatically identifies and crawls up to 15 internal links to verify sitewide health.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-background/50 border border-border/50 rounded-2xl">
                                        <h4 className="font-bold flex items-center gap-2 mb-2">
                                            <Activity className="h-4 w-4 text-aeo" />
                                            Brand Consistency
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            AI checks if your sub-pages match the AI SEO authority of your homepage.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-background/50 border border-border/50 rounded-2xl">
                                        <h4 className="font-bold flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-4 w-4 text-seo" />
                                            Schema Coverage
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Maps JSON-LD deployment across your entire site structure.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
                                <div className="h-20 w-20 rounded-full border-4 border-t-geo border-r-aeo border-b-seo border-l-transparent animate-spin mb-6"></div>
                                <h2 className="text-2xl font-bold">Deep Sitewide Scan in Progress...</h2>
                                <p className="text-muted-foreground mt-2 italic animate-pulse">This usually takes 45-90 seconds for 20+ pages.</p>
                                <div className="mt-8 w-64 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-geo animate-progress-fast"></div>
                                </div>
                            </div>
                        ) : (
                            /* Deep Audit Results */
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Top Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <Card className="border-border/50 bg-muted/30">
                                        <CardHeader className="pb-2">
                                            <CardDescription className="text-xs font-bold uppercase tracking-tighter">Pages Scanned</CardDescription>
                                            <CardTitle className="text-4xl font-black">{analysisData.pagesCrawled}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card className="border-geo/20 bg-geo/5">
                                        <CardHeader className="pb-2">
                                            <CardDescription className="text-xs font-bold uppercase tracking-tighter">Domain Health</CardDescription>
                                            <CardTitle className="text-4xl font-black text-geo">{analysisData.ai.domainHealthScore}%</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card className="border-aeo/20 bg-aeo/5">
                                        <CardHeader className="pb-2">
                                            <CardDescription className="text-xs font-bold uppercase tracking-tighter">Consistency</CardDescription>
                                            <CardTitle className="text-4xl font-black text-aeo">{analysisData.ai.consistencyScore}%</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-2">
                                            <CardDescription className="text-xs font-bold uppercase tracking-tighter">Schema Coverage</CardDescription>
                                            <CardTitle className="text-4xl font-black">{analysisData.ai.authorityMetrics.schemaCoverage}%</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-2">
                                            <CardDescription className="text-xs font-bold uppercase tracking-tighter">Meta Opt.</CardDescription>
                                            <CardTitle className="text-4xl font-black">{analysisData.ai.authorityMetrics.metadataOptimization}%</CardTitle>
                                        </CardHeader>
                                    </Card>
                                </div>

                                {/* Detailed Insights */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <Card className="border-border/50 bg-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-geo" />
                                                Sitewide Strategic Insights
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {analysisData.ai.sitewideInsights.map((insight: any, i: number) => (
                                                    <div key={i} className="p-4 rounded-xl border border-border/40 bg-background/50 flex gap-4">
                                                        <div className={cn(
                                                            "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold",
                                                            insight.impact === 'critical' ? "bg-destructive/10 text-destructive" : insight.impact === 'high' ? "bg-aeo/10 text-aeo" : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {insight.impact[0].toUpperCase()}
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

                                    <div className="space-y-6">
                                        <Card className="border-geo/20 bg-geo/5">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Target className="h-5 w-5 text-geo" />
                                                    Navigation & Architecture
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm leading-relaxed text-foreground/80 italic">
                                                    "{analysisData.ai.navigationAnalysis}"
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-aeo/20 bg-aeo/5">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-aeo">
                                                    <Sparkles className="h-5 w-5" />
                                                    Expert Brand Verdict
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm font-medium leading-relaxed">
                                                    {analysisData.ai.brandClarityVerdict}
                                                </p>
                                                <div className="mt-6 flex items-center justify-between">
                                                    <button
                                                        onClick={() => { setAnalysisData(null); setUrl(""); }}
                                                        className="text-xs text-muted-foreground hover:underline"
                                                    >
                                                        Start New Audit
                                                    </button>
                                                    <Badge className="bg-geo hover:bg-geo/90 cursor-pointer">Export White-Label Report (Pro)</Badge>
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
