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
    const [showBacklinksA, setShowBacklinksA] = useState(true)
    const [showBacklinksB, setShowBacklinksB] = useState(true)
    const [reportCopied, setReportCopied] = useState(false)
    const [inlineUrlA, setInlineUrlA] = useState("")
    const [inlineUrlB, setInlineUrlB] = useState("")
    const [showLinkGap, setShowLinkGap] = useState(false)

    // Session restore
    useEffect(() => {
        if (typeof window === "undefined") return
        const a = localStorage.getItem("battle_v3_siteA")
        const b = localStorage.getItem("battle_v3_siteB")
        const d = localStorage.getItem("battle_v3_data")
        const bl = localStorage.getItem("battle_v3_backlinks")
        if (a) setSiteA(a)
        if (b) setSiteB(b)
        if (d) setComparisonData(JSON.parse(d))
        if (bl) setBacklinkData(JSON.parse(bl))
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return
        if (siteA) localStorage.setItem("battle_v3_siteA", siteA)
        if (siteB) localStorage.setItem("battle_v3_siteB", siteB)
        if (comparisonData) localStorage.setItem("battle_v3_data", JSON.stringify(comparisonData))
        if (backlinkData) localStorage.setItem("battle_v3_backlinks", JSON.stringify(backlinkData))
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
            localStorage.removeItem("battle_v3_siteA"); localStorage.removeItem("battle_v3_siteB")
            localStorage.removeItem("battle_v3_data"); localStorage.removeItem("battle_v3_backlinks")
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

                    {/* ── Persistent Search Bar (always visible) ── */}
                    <div className="mb-6 flex items-center gap-2">
                        <input type="text" value={inlineUrlA} onChange={(e) => setInlineUrlA(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && inlineUrlA.trim() && inlineUrlB.trim() && handleBattle(inlineUrlA.trim(), inlineUrlB.trim())}
                            placeholder="yoursite.com"
                            className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-1 focus:ring-[#00e5ff]/30 text-sm" />
                        <span className="text-white/20 font-black italic text-sm px-2">VS</span>
                        <input type="text" value={inlineUrlB} onChange={(e) => setInlineUrlB(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && inlineUrlA.trim() && inlineUrlB.trim() && handleBattle(inlineUrlA.trim(), inlineUrlB.trim())}
                            placeholder="competitor.com"
                            className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#fe3f8c]/50 focus:ring-1 focus:ring-[#fe3f8c]/30 text-sm" />
                        {comparisonData && !isAnalyzing && (
                            <button onClick={() => {
                                const c = comparisonData.comparison || comparisonData
                                const sep = '═'.repeat(60)
                                let report = `DUELLY STRATEGY DUEL REPORT\n${sep}\n${siteALabel} vs ${siteBLabel}\n${sep}\n\n`
                                report += `SCORES:\n`
                                report += `  SEO:  ${siteALabel} ${c.seo?.siteA ?? '?'} vs ${siteBLabel} ${c.seo?.siteB ?? '?'}\n`
                                report += `  AEO:  ${siteALabel} ${c.aeo?.siteA ?? '?'} vs ${siteBLabel} ${c.aeo?.siteB ?? '?'}\n`
                                report += `  GEO:  ${siteALabel} ${c.geo?.siteA ?? '?'} vs ${siteBLabel} ${c.geo?.siteB ?? '?'}\n`
                                if (blA && blB) {
                                    report += `  DA:   ${siteALabel} ${blA.metrics.domainAuthority} vs ${siteBLabel} ${blB.metrics.domainAuthority}\n`
                                    report += `\nBACKLINK PROFILE:\n`
                                    report += `  ${siteALabel}: ${blA.metrics.totalBacklinks.toLocaleString()} backlinks, ${blA.metrics.linkingDomains.toLocaleString()} linking domains, DA ${blA.metrics.domainAuthority}\n`
                                    report += `  ${siteBLabel}: ${blB.metrics.totalBacklinks.toLocaleString()} backlinks, ${blB.metrics.linkingDomains.toLocaleString()} linking domains, DA ${blB.metrics.domainAuthority}\n`
                                }
                                if (comparisonData.winnerVerdict || c.winnerVerdict) {
                                    report += `\nEXPERT VERDICT:\n${comparisonData.winnerVerdict || c.winnerVerdict}\n`
                                }
                                const recs = comparisonData.recommendations || c.recommendations || []
                                if (recs.length > 0) {
                                    report += `\nCOUNTER-STRATEGIES (${recs.length}):\n`
                                    recs.forEach((r: any, i: number) => {
                                        report += `\n${i + 1}. [${r.roi || r.priority || 'MEDIUM'}] ${r.title}\n`
                                        if (r.description) report += `   Why: ${r.description}\n`
                                        if (r.howToFix) report += `   Fix: ${r.howToFix}\n`
                                    })
                                }
                                const opps = comparisonData.stolenOpportunities || c.stolenOpportunities || []
                                if (opps.length > 0) {
                                    report += `\nSTOLEN OPPORTUNITIES (${opps.length}):\n`
                                    opps.forEach((o: any) => { report += `  • [${o.category?.toUpperCase()}] ${o.title}: ${o.description}\n` })
                                }
                                const gaps = comparisonData.strategicGaps || c.strategicGaps || []
                                if (gaps.length > 0) {
                                    report += `\nSTRATEGIC GAPS (${gaps.length}):\n`
                                    gaps.forEach((g: string) => { report += `  • ${g}\n` })
                                }
                                report += `\n${sep}\nGenerated by Duelly.ai — ${new Date().toLocaleDateString()}\n`
                                navigator.clipboard.writeText(report)
                                setReportCopied(true)
                                setTimeout(() => setReportCopied(false), 2000)
                            }}
                                className="px-4 py-2.5 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/5 text-xs font-bold text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-colors flex items-center gap-1.5 shrink-0">
                                <Copy className="h-3.5 w-3.5" /> {reportCopied ? '✓ Copied' : 'Copy Report'}
                            </button>
                        )}
                        <button onClick={() => inlineUrlA.trim() && inlineUrlB.trim() && handleBattle(inlineUrlA.trim(), inlineUrlB.trim())}
                            disabled={!inlineUrlA.trim() || !inlineUrlB.trim() || isAnalyzing}
                            className="px-5 py-2.5 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shrink-0">
                            <Swords className="h-4 w-4" /> Battle
                        </button>
                    </div>

                    {/* ── ENTRY FORM (hero version, only when no results) ── */}
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
                                    { label: "SEO", data: comparisonData.comparison?.seo || comparisonData.seo, icon: <Search className="h-3.5 w-3.5" />, tooltip: "Traditional SEO strength — measures technical health, on-page optimization, content quality, meta tags, heading structure, internal linking, and mobile-friendliness. A higher score means the site follows more SEO best practices.", colorA: "#00e5ff", colorB: "#fe3f8c" },
                                    { label: "AEO", data: comparisonData.comparison?.aeo || comparisonData.aeo, icon: <Sparkles className="h-3.5 w-3.5" />, tooltip: "Answer Engine Optimization — measures how well a site is optimized for AI answer engines like Google SGE, ChatGPT, and Perplexity. Evaluates structured data (schema markup), FAQ content, direct Q&A formatting, entity density, and content conciseness.", colorA: "#00e5ff", colorB: "#fe3f8c" },
                                    { label: "GEO", data: comparisonData.comparison?.geo || comparisonData.geo, icon: <Globe className="h-3.5 w-3.5" />, tooltip: "Generative Engine Optimization — measures how likely AI systems are to cite and recommend this site. Evaluates brand authority, expertise signals, objectivity, data-backed claims, image accessibility, and content tone. Higher GEO = more likely to appear in AI-generated answers.", colorA: "#00e5ff", colorB: "#fe3f8c" },
                                    { label: "Domain Authority", data: blA && blB ? { siteA: blA.metrics.domainAuthority, siteB: blB.metrics.domainAuthority } : null, icon: <Link2 className="h-3.5 w-3.5" />, tooltip: "Moz Domain Authority (DA) — a 0-100 score predicting how well a domain will rank in search results. Based on the quantity and quality of backlinks pointing to the domain. DA 1-20 is low, 20-40 is average, 40-60 is good, 60+ is excellent. This is an off-page signal that complements on-page SEO/AEO/GEO scores.", colorA: "#00e5ff", colorB: "#fe3f8c" },
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

                            {/* ── Expert Verdict (right after scores) ── */}
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
                                                <div><p className="text-2xl font-black">{blA.metrics.domainAuthority}</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Domain Authority <InfoTooltip content="Moz's 0-100 score predicting how well a domain will rank in search results. Based on the quantity and quality of external backlinks. DA 1-20 is low (new/small sites), 20-40 is average, 40-60 is strong, 60+ is excellent (major brands, news sites). Higher DA = more ranking power." /></p></div>
                                                <div><p className="text-lg font-black">{blA.metrics.totalBacklinks.toLocaleString()}</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Total Backlinks <InfoTooltip content="The total number of external pages linking to this domain. More backlinks generally means more authority, but quality matters more than quantity. 1,000 backlinks from spam sites is worth less than 10 backlinks from high-DA domains like news sites or universities." /></p></div>
                                                <div><p className="text-lg font-black">{blA.metrics.linkingDomains.toLocaleString()}</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Linking Domains <InfoTooltip content="The number of unique root domains that link to this site. This is often more important than total backlinks — 100 links from 100 different domains is far more valuable than 100 links from 1 domain. Google values diversity of linking sources as a stronger trust signal." /></p></div>
                                                <div><p className={cn("text-lg font-black", blA.metrics.spamScore > 30 ? "text-red-400" : "text-green-400")}>{blA.metrics.spamScore}%</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Spam Score <InfoTooltip content="Moz's assessment of how likely this domain is to be penalized or banned by search engines. Based on 27 signals including thin content, low authority links, and suspicious patterns. 0-30% is healthy, 30-60% is moderate risk, 60%+ is high risk. A high spam score means the site may have toxic backlinks or spammy content." /></p></div>
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
                                            <div className="px-4 py-3">
                                                <span className="text-xs font-bold text-[#00e5ff]">Top Backlinks — {siteALabel} ({blA.backlinks.length})</span>
                                            </div>
                                            <div className="px-4 pb-3 space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold pb-1 border-b border-white/[0.04]">
                                                        <span className="w-8">DA</span>
                                                        <span className="flex-1">Linking Domain</span>
                                                        <span>Type</span>
                                                    </div>
                                                    {blA.backlinks.map((bl: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs border-b border-white/[0.04] pb-2 last:border-0">
                                                            <span className={cn("font-black tabular-nums w-8", bl.domainAuthority >= 50 ? "text-green-400" : bl.domainAuthority >= 20 ? "text-yellow-400" : "text-white/40")}>{bl.domainAuthority}</span>
                                                            <span className="text-white/70 truncate flex-1">{bl.sourceDomain}</span>
                                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", bl.isDofollow ? "bg-green-500/10 text-green-400" : "bg-white/[0.06] text-white/30")}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                                                        </div>
                                                    ))}
                                                    {blA.backlinks.length === 0 && <p className="text-xs text-white/30 italic py-2">No backlinks found</p>}
                                                </div>
                                        </div>
                                        {/* Site B Backlinks */}
                                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                            <div className="px-4 py-3">
                                                <span className="text-xs font-bold text-[#fe3f8c]">Top Backlinks — {siteBLabel} ({blB.backlinks.length})</span>
                                            </div>
                                                <div className="px-4 pb-3 space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold pb-1 border-b border-white/[0.04]">
                                                        <span className="w-8">DA</span>
                                                        <span className="flex-1">Linking Domain</span>
                                                        <span>Type</span>
                                                    </div>
                                                    {blB.backlinks.map((bl: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs border-b border-white/[0.04] pb-2 last:border-0">
                                                            <span className={cn("font-black tabular-nums w-8", bl.domainAuthority >= 50 ? "text-green-400" : bl.domainAuthority >= 20 ? "text-yellow-400" : "text-white/40")}>{bl.domainAuthority}</span>
                                                            <span className="text-white/70 truncate flex-1">{bl.sourceDomain}</span>
                                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", bl.isDofollow ? "bg-green-500/10 text-green-400" : "bg-white/[0.06] text-white/30")}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                                                        </div>
                                                    ))}
                                                    {blB.backlinks.length === 0 && <p className="text-xs text-white/30 italic py-2">No backlinks found</p>}
                                                </div>
                                        </div>
                                    </div>

                                    {/* Link Gap */}
                                    {linkGap.length > 0 && (
                                        <div className="mt-4 rounded-xl border border-[#BC13FE]/20 bg-[#BC13FE]/[0.03] overflow-hidden">
                                            <button onClick={() => setShowLinkGap(!showLinkGap)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#BC13FE]/[0.02] transition-colors">
                                                <h4 className="text-xs font-black text-[#BC13FE] uppercase tracking-widest flex items-center gap-1.5">
                                                    <ExternalLink className="h-3.5 w-3.5" /> Link Gap — Sites linking to competitor but not you ({linkGap.length})
                                                </h4>
                                                {showLinkGap ? <ChevronUp className="h-4 w-4 text-[#BC13FE]/40" /> : <ChevronDown className="h-4 w-4 text-[#BC13FE]/40" />}
                                            </button>
                                            {showLinkGap && (
                                                <div className="px-4 pb-3 space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold pb-1 border-b border-white/[0.04]">
                                                        <span className="w-8">DA</span>
                                                        <span className="flex-1">Domain</span>
                                                        <span>Status</span>
                                                    </div>
                                                    {linkGap.map((g: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs">
                                                            <span className={cn("font-black tabular-nums w-8", g.da >= 50 ? "text-green-400" : g.da >= 20 ? "text-yellow-400" : "text-white/40")}>{g.da}</span>
                                                            <span className="text-white/70 truncate flex-1">{g.domain}</span>
                                                            <span className="text-[10px] text-[#BC13FE]/60">Opportunity</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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

                            {/* ── Link Building Intelligence (deterministic, always shows when backlink data available) ── */}
                            {blA && (
                                <div className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/[0.02] backdrop-blur-xl p-5">
                                    <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                                        <Link2 className="h-4 w-4 text-green-400" /> Link Building Intelligence
                                        <InfoTooltip content="Data-driven link building recommendations based on your Domain Authority, backlink profile, and the gap between you and your competitor. Backlinks remain one of the strongest ranking signals in both traditional and AI search." />
                                    </h3>

                                    {/* DA Assessment */}
                                    <div className={cn("rounded-lg p-4 mb-4 border",
                                        blA.metrics.domainAuthority < 20 ? "border-red-500/30 bg-red-500/10" :
                                        blA.metrics.domainAuthority < 40 ? "border-yellow-500/30 bg-yellow-500/10" :
                                        blA.metrics.domainAuthority < 60 ? "border-[#00e5ff]/30 bg-[#00e5ff]/10" :
                                        "border-green-500/30 bg-green-500/10"
                                    )}>
                                        <p className={cn("text-sm font-bold mb-1",
                                            blA.metrics.domainAuthority < 20 ? "text-red-400" :
                                            blA.metrics.domainAuthority < 40 ? "text-yellow-400" :
                                            blA.metrics.domainAuthority < 60 ? "text-[#00e5ff]" :
                                            "text-green-400"
                                        )}>
                                            {blA.metrics.domainAuthority < 20 && `DA ${blA.metrics.domainAuthority} — Critical: Your domain authority is very low`}
                                            {blA.metrics.domainAuthority >= 20 && blA.metrics.domainAuthority < 40 && `DA ${blA.metrics.domainAuthority} — Below Average: Link building should be a consistent priority`}
                                            {blA.metrics.domainAuthority >= 40 && blA.metrics.domainAuthority < 60 && `DA ${blA.metrics.domainAuthority} — Solid Foundation: Continue building to stay competitive`}
                                            {blA.metrics.domainAuthority >= 60 && `DA ${blA.metrics.domainAuthority} — Strong Authority: Maintain your link profile and target high-DA opportunities`}
                                        </p>
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            {blA.metrics.domainAuthority < 20 && "Sites with DA under 20 struggle to rank for anything competitive. Every quality backlink you earn has an outsized impact at this stage. Focus on local directories, industry listings, and creating content worth linking to."}
                                            {blA.metrics.domainAuthority >= 20 && blA.metrics.domainAuthority < 40 && "You have some authority but not enough to compete for mid-difficulty keywords. Consistent link building — even 2-3 quality links per month — will compound over time and significantly improve your rankings."}
                                            {blA.metrics.domainAuthority >= 40 && blA.metrics.domainAuthority < 60 && "Your domain has decent authority. Focus on earning links from higher-DA sites (DA 50+) to push into the competitive tier. Guest posting on industry blogs and digital PR are your best bets."}
                                            {blA.metrics.domainAuthority >= 60 && "You have strong authority. Focus on maintaining your link profile, disavowing toxic links, and targeting high-value placements (news sites, .edu, .gov) to stay ahead."}
                                        </p>
                                    </div>

                                    {/* Competitor Gap */}
                                    {blB && blB.metrics.domainAuthority > blA.metrics.domainAuthority && (
                                        <div className="rounded-lg p-4 mb-4 border border-[#BC13FE]/30 bg-[#BC13FE]/10">
                                            <p className="text-sm font-bold text-[#BC13FE] mb-1">
                                                Competitor DA Gap: {blB.metrics.domainAuthority - blA.metrics.domainAuthority} points
                                            </p>
                                            <p className="text-xs text-white/60 leading-relaxed">
                                                {siteBLabel} has DA {blB.metrics.domainAuthority} vs your DA {blA.metrics.domainAuthority} — a {blB.metrics.domainAuthority - blA.metrics.domainAuthority}-point gap.
                                                {blB.metrics.linkingDomains > blA.metrics.linkingDomains * 2
                                                    ? ` They also have ${blB.metrics.linkingDomains.toLocaleString()} linking domains vs your ${blA.metrics.linkingDomains.toLocaleString()}. Closing this gap requires sustained outreach and content marketing.`
                                                    : ` Focus on earning links from the same caliber of sites that link to them.`
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Actionable Tactics */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Recommended Tactics</p>
                                        {[
                                            blA.metrics.domainAuthority < 30 && { icon: "📍", title: "Claim Local & Industry Directories", desc: "Submit to Google Business Profile, Yelp, industry-specific directories, and local chamber of commerce listings. These are easy wins for new sites." },
                                            blA.metrics.domainAuthority < 50 && { icon: "✍️", title: "Guest Post on Industry Blogs", desc: "Write valuable content for blogs in your niche with DA 30+. Include a natural link back to your site. Aim for 2-3 per month." },
                                            { icon: "📰", title: "Digital PR & HARO", desc: "Sign up for Help A Reporter Out (HARO) or Connectively. Respond to journalist queries in your expertise area to earn links from news sites." },
                                            linkGap.length > 0 && { icon: "🎯", title: `Target ${linkGap.length} Link Gap Opportunities`, desc: `${linkGap.length} sites link to your competitor but not you. Reach out to these sites — they already link to content in your space, so they're warm prospects.` },
                                            { icon: "📊", title: "Create Linkable Assets", desc: "Original research, data studies, infographics, and free tools naturally attract backlinks. One great linkable asset can earn more links than months of outreach." },
                                            blA.metrics.spamScore > 20 && { icon: "🧹", title: "Clean Up Toxic Backlinks", desc: `Your spam score is ${blA.metrics.spamScore}%. Review your backlink profile for low-quality or spammy links and submit a disavow file to Google Search Console.` },
                                        ].filter(Boolean).map((tactic: any, i) => (
                                            <div key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                                                <span className="text-lg shrink-0">{tactic.icon}</span>
                                                <div>
                                                    <p className="text-xs font-bold text-white/80">{tactic.title}</p>
                                                    <p className="text-xs text-white/50 leading-relaxed mt-0.5">{tactic.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Affiliate/CTA placeholder */}
                                    <div className="mt-4 rounded-lg border border-dashed border-green-500/20 bg-green-500/[0.03] p-3 text-center">
                                        <p className="text-xs text-green-400/60 italic">Need help building backlinks? Professional link building services coming soon.</p>
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
