"use client"

import { useState, useEffect } from "react"
import { PageShell } from "@/components/dashboard/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    BarChart3,
    DollarSign,
    Hash,
    Zap,
    RefreshCw,
    Calendar,
    ArrowUpRight,
    Search,
    Bot,
    Sparkles,
    Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function UsagePage() {
    const [stats, setStats] = useState<any>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchStats = async () => {
        setIsRefreshing(true)
        try {
            const res = await fetch('/api/usage')
            const data = await res.json()
            if (data.success) {
                setStats(data.stats)
            }
        } catch (error) {
            console.error("Failed to fetch usage stats:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const todayDate = new Date().toISOString().split('T')[0]
    const todayStats = stats?.dailyUsage?.[todayDate] || { cost: 0, queries: 0, tokens: 0 }

    return (
        <PageShell hideSearch apiStatus="idle">
                <main className="flex-1 overflow-y-auto p-3 sm:p-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                                    <BarChart3 className="h-8 w-8 text-geo" />
                                    Usage & Intelligence Costs
                                </h1>
                                <p className="text-muted-foreground mt-1">Real-time tracking of AI API consumption and estimated spend.</p>
                            </div>
                            <button
                                onClick={fetchStats}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-4 py-2 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors text-sm font-bold uppercase tracking-wider"
                            >
                                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                                {isRefreshing ? "Refreshing..." : "Refresh Logs"}
                            </button>
                        </div>

                        {/* Top Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-geo/5 border-geo/20 relative overflow-hidden">
                                <DollarSign className="absolute -right-4 -bottom-4 h-24 w-24 text-geo/10" />
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs font-black uppercase tracking-widest text-geo">Cumulative Spend</CardDescription>
                                    <CardTitle className="text-4xl font-black text-foreground">${stats?.totalCost.toFixed(4) || "0.0000"}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">Estimated Gemini 2.0 Flash billing based on token volume.</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-aeo/5 border-aeo/20 relative overflow-hidden">
                                <Hash className="absolute -right-4 -bottom-4 h-24 w-24 text-aeo/10" />
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs font-black uppercase tracking-widest text-aeo">Today's Queries</CardDescription>
                                    <CardTitle className="text-4xl font-black text-foreground">{todayStats.queries}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">Number of intelligence reports generated since midnight.</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-seo/5 border-seo/20 relative overflow-hidden">
                                <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-seo/10" />
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs font-black uppercase tracking-widest text-seo">Today's Cost</CardDescription>
                                    <CardTitle className="text-4xl font-black text-foreground">${todayStats.cost.toFixed(4)}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">Daily burn rate for current crawler session.</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Efficiency Note */}
                        <Card className="mb-8 border-yellow-500/20 bg-yellow-500/5">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-foreground">Efficiency Engine Active</h4>
                                    <p className="text-xs text-muted-foreground">Using token-optimized thinned HTML extraction to reduce Gemini costs by up to 60% compared to raw HTML ingestion.</p>
                                </div>
                                <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 text-[10px] font-black uppercase">Optimization On</Badge>
                            </CardContent>
                        </Card>

                        {/* Daily Log Table */}
                        <Card className="border-border/50 bg-card/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    Daily Burn History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Date</th>
                                                <th className="py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Total Queries</th>
                                                <th className="py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Total Tokens</th>
                                                <th className="py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Estimated Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats?.dailyUsage && Object.entries(stats.dailyUsage).reverse().map(([date, data]: [string, any]) => (
                                                <tr key={date} className="border-b border-border/10 last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 font-medium">{date === todayDate ? "Today" : date}</td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-aeo" />
                                                            {data.queries}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-muted-foreground">{data.tokens.toLocaleString()}</td>
                                                    <td className="py-4">
                                                        <Badge variant="secondary" className="bg-geo/10 text-geo border-geo/20 hover:bg-geo/20 transition-all font-black">
                                                            ${data.cost.toFixed(4)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!stats?.dailyUsage && (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-muted-foreground italic">No logs found. Start an audit to track costs.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
        </PageShell>
    )
}
