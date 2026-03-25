"use client"

import { useState, useEffect } from "react"
import { PageShell } from "@/components/dashboard/page-shell"
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan } from '@/lib/scan-history'
import { DualSearchInput } from "@/components/dashboard/search-input"
import { Badge } from "@/components/ui/badge"
import {
    Globe, Swords, Search, ShieldAlert,
    CheckCircle2, Clock, Sparkles, Zap, Bot, RefreshCw,
    Copy, Link2, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { CreditConfirmDialog } from '@/components/dashboard/credit-confirm-dialog'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'

/* ── Glowing Radial Ring (SVG) ── */
function BattleRing({ value, color, glowColor, size = 130 }: { value: number; color: string; glowColor: string; size?: number }) {
    const sw = 10
    const r = (size - sw) / 2
    const circ = r * 2 * Math.PI
    const pct = Math.min(value / 100, 1)
    const offset = circ - pct * circ
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size} style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={sw} className="stroke-white/[0.06]" />
                <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={sw} strokeLinecap="round"
                    stroke={color} style={{ strokeDasharray: circ, strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tabular-nums text-white">{Math.round(value)}</span>
                <span className="text-[9px] uppercase font-bold text-white/40">/100</span>
            </div>
        </div>
    )
}

export default function BattleModeV3() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [siteA, setSiteA] = useState("")
    const [siteB, setSiteB] = useState("")
    const [comparisonData, setComparisonData] = useState<any>(null)
    const [backlinkData, setBacklinkData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [creditsRefunded, setCreditsRefunded] = useState(0)
    const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
    const [creditDialogOpen, setCreditDialogOpen] = useState(false)
    const [pendingUrls, setPendingUrls] = useState<{ a: string; b: string }>({ a: "", b: "" })
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [loadingPhase, setLoadingPhase] = useState("")
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [showBacklinksA, setShowBacklinksA] = useState(false)
    const [showBacklinksB, setShowBacklinksB] = useState(false)

    // Session restore
    useEffect(() => {
        if (typeof window === "undefined") return
        const a = sessionStorage.getItem("battle_v3_siteA")
        const b = sessionStorage.getItem("battle_v3_siteB")
        const d = sessionStorage.getItem("battle_v3_data")
        const bl = sessionStorage.getItem("battle_v3_backlinks")
        if (a) setSiteA(a)
        if (b) setSiteB(b)
        if (d) setComparisonData(JSON.parse(d))
        if (bl) setBacklinkData(JSON.parse(bl))
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return
        if (siteA) sessionStorage.setItem("battle_v3_siteA", siteA)
        if (siteB) sessionStorage.setItem("battle_v3_siteB", siteB)
        if (comparisonData) sessionStorage.setItem("battle_v3_data", JSON.stringify(comparisonData))
        if (backlinkData) sessionStorage.setItem("battle_v3_backlinks", JSON.stringify(backlinkData))
    }, [siteA, siteB, comparisonData, backlinkData])

    // Progress ticker
    useEffect(() => {
        if (!isAnalyzing) { setLoadingProgress(0); setElapsedSeconds(0); setLoadingPhase(""); return }
        const start = Date.now()
        const phases = [
            { at: 0, label: "Initiating dual-site crawl..." },
            { at: 8, label: "Crawling Site A — extracting content & metadata..." },
            { at: 15, label: "Crawling Site B — extracting content & metadata..." },
            { at: 25, label: "Fetching backlink profiles from Moz..." },
            { at: 35, label: "Both sites crawled. Starting AI analysis..." },
            { at: 50, label: "Gemini analyzing content quality & structure..." },
            { at: 65, label: "Comparing SEO, AEO, GEO, and link authority..." },
            { at: 80, label: "Generating competitive strategies..." },
            { at: 90, label: "Finalizing intelligence report..." },
        ]
        setLoadingPhase(phases[0].label)
        const iv = setInterval(() => {
            const el = (Date.now() - start) / 1000
            setElapsedSeconds(Math.floor(el))
            const pct = Math.min(95, Math.round(95 * (1 - Math.exp(-el / 30))))
            setLoadingProgress(pct)
            const cur = [...phases].reverse().find(p => pct >= p.at)
            if (cur) setLoadingPhase(cur.label)
        }, 300)
        return () => clearInterval(iv)
    }, [isAnalyzing])

    // Save to scan history
    useEffect(() => {
        if (comparisonData && siteA && siteB) {
            const c = comparisonData.comparison || comparisonData
            saveScanToHistory({
                url: `${siteA} vs ${siteB}`, type: 'competitive',
                scores: { seo: c.seo?.siteA || 0, aeo: c.aeo?.siteA || 0, geo: c.geo?.siteA || 0 },
                timestamp: new Date().toISOString(),
            }, comparisonData)
        }
    }, [comparisonData, siteA, siteB])

    // Load from history
    useEffect(() => {
        const entry = consumeLoadFromHistory()
        if (entry && entry.type === 'competitive') {
            const full = getFullScanResult(entry)
            if (full) {
                const parts = entry.url.split(' vs ')
                if (parts.length === 2) { setSiteA(parts[0]); setSiteB(parts[1]) }
                setComparisonData(full)
                return
            }
        }
        const latest = getLatestFullScan('competitive')
        if (latest) {
            const parts = latest.entry.url.split(' vs ')
            if (parts.length === 2) { setSiteA(parts[0]); setSiteB(parts[1]) }
            setComparisonData(latest.result)
        }
    }, [])

    const handleBattle = (urlA: string, urlB: string) => { setPendingUrls({ a: urlA, b: urlB }); setCreditDialogOpen(true) }

    const handleConfirmBattle = async () => {
        setCreditDialogOpen(false)
        const urlA = pendingUrls.a, urlB = pendingUrls.b
        setIsAnalyzing(true); setError(null); setCreditsRefunded(0); setApiStatus("idle"); setSiteA(urlA); setSiteB(urlB)
        setBacklinkData(null)
        try {
            const res = await fetch('/api/battle-v3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteAUrl: urlA, siteBUrl: urlB }) })
            const result = await res.json()
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))
            if (result.success) {
                setComparisonData(result.data.comparison)
                setBacklinkData(result.data.backlinks)
                setApiStatus("healthy")
            } else {
                setError(result.error || 'Battle failed.')
                setCreditsRefunded(result.creditsRefunded || 0)
                setApiStatus("error")
            }
        } catch { setError('Connection failed.'); setCreditsRefunded(0); setApiStatus("error") }
        finally { setIsAnalyzing(false) }
    }

    const handleReset = () => {
        setComparisonData(null); setBacklinkData(null); setSiteA(""); setSiteB(""); setError(null)
        setShowBacklinksA(false); setShowBacklinksB(false)
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("battle_v3_siteA"); sessionStorage.removeItem("battle_v3_siteB")
            sessionStorage.removeItem("battle_v3_data"); sessionStorage.removeItem("battle_v3_backlinks")
        }
    }

    const siteALabel = siteA ? siteA.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Your Site'
    const siteBLabel = siteB ? siteB.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Competitor'

    const blA = backlinkData?.siteA
    const blB = backlinkData?.siteB
    const linkGap = backlinkData?.linkGap || []
    const mozEnabled = backlinkData?.mozEnabled

    return (
        <PageShell apiStatus={apiStatus} hideSearch>
            <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-12">

                    {/* Header */}
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                                <Swords className="h-6 w-6 text-[#00e5ff]" />
                                Strategy Duel
                                <Badge className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-[10px] font-black uppercase tracking-widest">V3</Badge>
                            </h1>
                            <p className="text-sm text-white/60 mt-1.5">Head-to-head intelligence warfare with backlink analysis. Two sites enter. One dominates.</p>
                        </div>
                        {comparisonData && !isAnalyzing && (
                            <button onClick={handleReset}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 rounded-lg font-bold text-sm transition-all">
                                <RefreshCw className="h-4 w-4" /> New Duel
                            </button>
                        )}
                    </div>

                    <ScanErrorDialog error={error} onClose={() => setError(null)} onRetry={() => handleBattle(siteA, siteB)} creditsRefunded={creditsRefunded} />
                    <CreditConfirmDialog open={creditDialogOpen} onConfirm={handleConfirmBattle} onCancel={() => setCreditDialogOpen(false)} creditCost={20} scanType="Strategy Duel V3" costBreakdown="20 credits per competitive intelligence duel (2 sites analyzed + backlink profiles)" />

                    {/* ── ENTRY FORM ── */}
                    {!comparisonData && !isAnalyzing ? (
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden">
                            <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px] pointer-events-none" />
                            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px] pointer-events-none" />
                            <div className="relative z-10 w-full">
                                <DualSearchInput onSubmit={(a, b) => handleBattle(a, b)} isAnalyzing={isAnalyzing} placeholderA="yoursite.com" placeholderB="competitor.com" />
                            </div>
                            <div className="mt-10 grid grid-cols-4 gap-4 w-full max-w-4xl text-center">
                                {[
                                    { icon: <Search className="h-5 w-5" />, label: "SEO Authority", desc: "Technical & content dominance", color: "#00e5ff" },
                                    { icon: <Sparkles className="h-5 w-5" />, label: "AEO Snippet Share", desc: "AI answer engine visibility", color: "#BC13FE" },
                                    { icon: <Bot className="h-5 w-5" />, label: "GEO Citation", desc: "LLM recommendation likelihood", color: "#fe3f8c" },
                                    { icon: <Link2 className="h-5 w-5" />, label: "Link Authority", desc: "Backlink profile & domain power", color: "#22c55e" },
                                ].map(c => (
                                    <div key={c.label} className="space-y-2">
                                        <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full border border-white/[0.08]" style={{ color: c.color, background: `${c.color}10` }}>{c.icon}</div>
                                        <h3 className="font-bold text-xs text-white/80">{c.label}</h3>
                                        <p className="text-xs text-white/40">{c.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : isAnalyzing ? (
                        /* ── LOADING STATE ── */
                        <div className="space-y-6 animate-in fade-in">
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden relative">
                                <div className="h-1 w-full bg-white/[0.04]"><div className="h-full bg-gradient-to-r from-[#00e5ff] via-[#BC13FE] to-[#fe3f8c] transition-all duration-700" style={{ width: `${loadingProgress}%` }} /></div>
                                <div className="py-12 flex flex-col items-center gap-6">
                                    <div className="relative h-24 w-24">
                                        <div className="absolute inset-0 rounded-full border-4 border-t-[#00e5ff] border-r-[#BC13FE] border-b-[#fe3f8c] border-l-transparent animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-black text-white tabular-nums">{loadingProgress}%</span></div>
                                    </div>
                                    <div className="text-center space-y-1.5">
                                        <h2 className="text-xl font-black text-white">Intelligence Duel in Progress</h2>
                                        <p className="text-sm text-white/60 max-w-md">{loadingPhase}</p>
                                    </div>
                                    <div className="w-full max-w-md">
                                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#00e5ff] via-[#BC13FE] to-[#fe3f8c] rounded-full transition-all duration-700" style={{ width: `${loadingProgress}%` }} /></div>
                                        <div className="flex justify-between mt-1"><span className="text-xs text-white/50 tabular-nums">{loadingProgress}%</span><span className="text-xs text-white/50 tabular-nums flex items-center gap-1"><Clock className="h-3 w-3" />{elapsedSeconds}s</span></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className="border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/5 px-4 py-1.5 text-sm font-bold">{siteALabel}</Badge>
                                        <span className="text-white/20 font-black italic text-lg">VS</span>
                                        <Badge className="border-[#fe3f8c]/30 text-[#fe3f8c] bg-[#fe3f8c]/5 px-4 py-1.5 text-sm font-bold">{siteBLabel}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── RESULTS ── */
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* ── Score Duel Rings (SEO + AEO + GEO + DA) ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: "SEO", data: comparisonData.comparison?.seo || comparisonData.seo, icon: <Search className="h-3.5 w-3.5" />, tooltip: "Traditional SEO strength", colorA: "#00e5ff", colorB: "#fe3f8c" },
                                    { label: "AEO", data: comparisonData.comparison?.aeo || comparisonData.aeo, icon: <Sparkles className="h-3.5 w-3.5" />, tooltip: "Answer Engine Optimization", colorA: "#00e5ff", colorB: "#fe3f8c" },
                                    { label: "GEO", data: comparisonData.comparison?.geo || comparisonData.geo, icon: <Globe className="h-3.5 w-3.5" />, tooltip: "Generative Engine Optimization", colorA: "#00e5ff", colorB: "#fe3f8c" },
                                    { label: "DA", data: blA && blB ? { siteA: blA.metrics.domainAuthority, siteB: blB.metrics.domainAuthority } : null, icon: <Link2 className="h-3.5 w-3.5" />, tooltip: "Domain Authority (Moz)", colorA: "#00e5ff", colorB: "#fe3f8c" },
                                ].map((battle) => {
                                    const scoreA = battle.data?.siteA ?? 0
                                    const scoreB = battle.data?.siteB ?? 0
                                    const noData = !battle.data
                                    return (
                                        <div key={battle.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">{battle.icon}{battle.label}</span>
                                                    <InfoTooltip content={battle.tooltip} />
                                                </div>
                                                {noData ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <p className="text-xs text-white/30 italic">Moz API not configured</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <BattleRing value={scoreA} color={battle.colorA} glowColor={`${battle.colorA}66`} size={100} />
                                                                <span className="text-[9px] font-bold text-[#00e5ff]/70 uppercase truncate max-w-[80px]">{siteALabel}</span>
                                                            </div>
                                                            <Swords className="h-4 w-4 text-white/10" />
                                                            <div className="flex flex-col items-center gap-1">
                                                                <BattleRing value={scoreB} color={battle.colorB} glowColor={`${battle.colorB}66`} size={100} />
                                                                <span className="text-[9px] font-bold text-[#fe3f8c]/70 uppercase truncate max-w-[80px]">{siteBLabel}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                                                            <div className="h-full bg-[#00e5ff] rounded-l-full transition-all duration-700" style={{ width: `${(scoreA / (scoreA + scoreB || 1)) * 100}%` }} />
                                                            <div className="h-full bg-[#fe3f8c] rounded-r-full transition-all duration-700" style={{ width: `${(scoreB / (scoreA + scoreB || 1)) * 100}%` }} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* ── Backlink Profile Comparison ── */}
                            {blA && blB && (
                                <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.02] backdrop-blur-xl p-5">
                                    <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                                        <Link2 className="h-4 w-4 text-green-400" /> Backlink Profile Comparison
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[9px]">MOZ</Badge>
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="text-[#00e5ff]">
                                            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/50">{siteALabel}</p>
                                            <div className="space-y-3">
                                                <div><p className="text-2xl font-black">{blA.metrics.domainAuthority}</p><p className="text-xs text-white/40">Domain Authority</p></div>
                                                <div><p className="text-lg font-black">{blA.metrics.totalBacklinks.toLocaleString()}</p><p className="text-xs text-white/40">Total Backlinks</p></div>
                                                <div><p className="text-lg font-black">{blA.metrics.linkingDomains.toLocaleString()}</p><p className="text-xs text-white/40">Linking Domains</p></div>
                                                <div><p className={cn("text-lg font-black", blA.metrics.spamScore > 30 ? "text-red-400" : "text-green-400")}>{blA.metrics.spamScore}%</p><p className="text-xs text-white/40">Spam Score</p></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center gap-2 text-white/20">
                                            <Swords className="h-6 w-6" />
                                            <span className="text-xs font-black italic">VS</span>
                                        </div>
                                        <div className="text-[#fe3f8c]">
                                            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/50">{siteBLabel}</p>
                                            <div className="space-y-3">
                                                <div><p className="text-2xl font-black">{blB.metrics.domainAuthority}</p><p className="text-xs text-white/40">Domain Authority</p></div>
                                                <div><p className="text-lg font-black">{blB.metrics.totalBacklinks.toLocaleString()}</p><p className="text-xs text-white/40">Total Backlinks</p></div>
                                                <div><p className="text-lg font-black">{blB.metrics.linkingDomains.toLocaleString()}</p><p className="text-xs text-white/40">Linking Domains</p></div>
                                                <div><p className={cn("text-lg font-black", blB.metrics.spamScore > 30 ? "text-red-400" : "text-green-400")}>{blB.metrics.spamScore}%</p><p className="text-xs text-white/40">Spam Score</p></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Backlinks Tables */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                                        {/* Site A Backlinks */}
                                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                            <button onClick={() => setShowBacklinksA(!showBacklinksA)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
                                                <span className="text-xs font-bold text-[#00e5ff]">Top Backlinks — {siteALabel} ({blA.backlinks.length})</span>
                                                {showBacklinksA ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
                                            </button>
                                            {showBacklinksA && (
                                                <div className="px-4 pb-3 space-y-2">
                                                    {blA.backlinks.map((bl: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs border-b border-white/[0.04] pb-2 last:border-0">
                                                            <span className={cn("font-black tabular-nums w-8", bl.domainAuthority >= 50 ? "text-green-400" : bl.domainAuthority >= 20 ? "text-yellow-400" : "text-white/40")}>{bl.domainAuthority}</span>
                                                            <span className="text-white/70 truncate flex-1">{bl.sourceDomain}</span>
                                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", bl.isDofollow ? "bg-green-500/10 text-green-400" : "bg-white/[0.06] text-white/30")}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                                                        </div>
                                                    ))}
                                                    {blA.backlinks.length === 0 && <p className="text-xs text-white/30 italic py-2">No backlinks found</p>}
                                                </div>
                                            )}
                                        </div>
                                        {/* Site B Backlinks */}
                                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                            <button onClick={() => setShowBacklinksB(!showBacklinksB)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
                                                <span className="text-xs font-bold text-[#fe3f8c]">Top Backlinks — {siteBLabel} ({blB.backlinks.length})</span>
                                                {showBacklinksB ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
                                            </button>
                                            {showBacklinksB && (
                                                <div className="px-4 pb-3 space-y-2">
                                                    {blB.backlinks.map((bl: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs border-b border-white/[0.04] pb-2 last:border-0">
                                                            <span className={cn("font-black tabular-nums w-8", bl.domainAuthority >= 50 ? "text-green-400" : bl.domainAuthority >= 20 ? "text-yellow-400" : "text-white/40")}>{bl.domainAuthority}</span>
                                                            <span className="text-white/70 truncate flex-1">{bl.sourceDomain}</span>
                                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", bl.isDofollow ? "bg-green-500/10 text-green-400" : "bg-white/[0.06] text-white/30")}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                                                        </div>
                                                    ))}
                                                    {blB.backlinks.length === 0 && <p className="text-xs text-white/30 italic py-2">No backlinks found</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Link Gap */}
                                    {linkGap.length > 0 && (
                                        <div className="mt-4 rounded-xl border border-[#BC13FE]/20 bg-[#BC13FE]/[0.03] p-4">
                                            <h4 className="text-xs font-black text-[#BC13FE] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                <ExternalLink className="h-3.5 w-3.5" /> Link Gap — Sites linking to competitor but not you ({linkGap.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {linkGap.map((g: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                        <span className={cn("font-black tabular-nums w-8", g.da >= 50 ? "text-green-400" : g.da >= 20 ? "text-yellow-400" : "text-white/40")}>{g.da}</span>
                                                        <span className="text-white/70 truncate flex-1">{g.domain}</span>
                                                        <span className="text-[10px] text-[#BC13FE]/60">Opportunity</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Moz not configured notice */}
                            {!mozEnabled && !blA && (
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                                    <Link2 className="h-5 w-5 text-white/20 mx-auto mb-2" />
                                    <p className="text-xs text-white/30">Backlink analysis coming soon — Domain Authority, top backlinks, and link gap comparison.</p>
                                </div>
                            )}

                            {/* ── Expert Verdict ── */}
                            {(comparisonData.winnerVerdict || comparisonData.comparison?.winnerVerdict) && (
                                <div className="rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/[0.03] backdrop-blur-xl p-5 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00e5ff]/5 rounded-full blur-[60px] pointer-events-none" />
                                    <div className="relative z-10 flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center shrink-0">
                                            <Zap className="h-4 w-4 text-[#00e5ff]" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-[#00e5ff] tracking-widest mb-1 flex items-center gap-1.5">Expert Verdict</h4>
                                            <p className="text-sm font-medium text-white/80 leading-relaxed">{comparisonData.winnerVerdict || comparisonData.comparison?.winnerVerdict}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Counter-Strategies ── */}
                            {(comparisonData.recommendations || comparisonData.comparison?.recommendations)?.length > 0 && (() => {
                                const recs = comparisonData.recommendations || comparisonData.comparison?.recommendations || []
                                const normPriority = (r: any) => r.roi === 'STEADY' ? 'MEDIUM' : r.roi === 'CRITICAL' ? 'CRITICAL' : r.roi === 'HIGH' ? 'HIGH' : (r.priority || 'MEDIUM').toUpperCase()
                                const normDomain = (r: any) => {
                                    const cat = (r.category || '').toLowerCase()
                                    if (cat === 'aeo') return 'aeo'
                                    if (cat === 'geo' || cat === 'trust') return 'geo'
                                    return 'seo'
                                }
                                const urgent = recs.filter((r: any) => normPriority(r) === 'CRITICAL')
                                const high = recs.filter((r: any) => normPriority(r) === 'HIGH')
                                const medium = recs.filter((r: any) => normPriority(r) === 'MEDIUM' || normPriority(r) === 'STEADY')
                                const groups = [
                                    { label: '🔥 Urgent', items: urgent },
                                    { label: '⚡ High', items: high },
                                    { label: '📌 Medium', items: medium },
                                ].filter(g => g.items.length > 0)

                                return (
                                    <Card className="border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5">
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-[#00e5ff]" />
                                                <CardTitle className="text-white">Counter-Strategies</CardTitle>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#BC13FE]/30 text-[#BC13FE] bg-[#BC13FE]/10 gap-1">
                                                    <Sparkles className="h-2.5 w-2.5" /> AI-Powered
                                                </Badge>
                                                <button onClick={() => {
                                                    const text = recs.map((r: any, i: number) => `${i + 1}. [${normPriority(r)}] ${r.title}\n${r.description || ''}\n${r.howToFix || ''}`).join('\n\n')
                                                    navigator.clipboard.writeText(text)
                                                }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                    <Copy className="h-3.5 w-3.5" /> Copy All
                                                </button>
                                            </div>
                                            <CardDescription>AI-generated plan to outmaneuver this competitor</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {groups.map(group => (
                                                    <div key={group.label}>
                                                        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">{group.label} ({group.items.length})</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {group.items.map((rec: any, i: number) => (
                                                                <FixInstructionCard key={i} title={rec.title} domain={normDomain(rec) as any} priority={normPriority(rec)}
                                                                    steps={rec.howToFix ? [{ step: 1, title: 'How To Fix', description: rec.howToFix }] : [{ step: 1, title: rec.title, description: rec.description }]}
                                                                    code={rec.codeSnippet} platform={rec.platform || 'Any'} estimatedTime={`${rec.effort || 1}h`}
                                                                    difficulty={rec.effort >= 3 ? 'difficult' : rec.effort >= 2 ? 'moderate' : 'easy'}
                                                                    impact={rec.roi === 'CRITICAL' ? 'high' : rec.roi === 'HIGH' ? 'medium' : 'low'}
                                                                    affectedPages={1} impactedScores={rec.impactedScores} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })()}

                            {/* ── Stolen Opportunities & Strategic Gaps ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {(comparisonData.stolenOpportunities || comparisonData.comparison?.stolenOpportunities)?.length > 0 && (
                                    <div className="rounded-2xl border border-[#BC13FE]/20 bg-[#BC13FE]/[0.03] backdrop-blur-xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-[#BC13FE]/10">
                                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-[#BC13FE]" /> Stolen Opportunities
                                            </h3>
                                            <p className="text-xs text-white/40 mt-0.5">Where <span className="text-[#fe3f8c] font-bold">{siteBLabel}</span> is winning</p>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            {(comparisonData.stolenOpportunities || comparisonData.comparison?.stolenOpportunities || []).map((opp: any, i: number) => (
                                                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3">
                                                    <div className={cn("h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
                                                        opp.category === 'seo' ? "bg-[#00e5ff]/10 text-[#00e5ff]" : opp.category === 'aeo' ? "bg-[#BC13FE]/10 text-[#BC13FE]" : "bg-[#fe3f8c]/10 text-[#fe3f8c]"
                                                    )}>
                                                        {opp.category === 'seo' ? <Search className="h-4 w-4" /> : opp.category === 'aeo' ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-white/80 text-sm truncate">{opp.title}</h4>
                                                        <p className="text-xs text-white/40 leading-relaxed mt-1">{opp.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(comparisonData.strategicGaps || comparisonData.comparison?.strategicGaps)?.length > 0 && (
                                    <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] backdrop-blur-xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-green-500/10">
                                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                                <ShieldAlert className="h-4 w-4 text-green-400" /> Critical Strategic Gaps
                                            </h3>
                                            <p className="text-xs text-white/40 mt-0.5">Weaknesses the competitor is exploiting</p>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            {(comparisonData.strategicGaps || comparisonData.comparison?.strategicGaps || []).map((gap: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 text-xs text-white/60 border-b border-white/[0.04] pb-3 last:border-0 leading-relaxed">
                                                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-400 shrink-0" />
                                                    {gap}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </PageShell>
    )
}
