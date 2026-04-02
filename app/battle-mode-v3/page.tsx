"use client"

import { useState, useEffect } from "react"
import { PageShell } from "@/components/dashboard/page-shell"
import { saveScanToHistory, consumeLoadFromHistory, getFullScanResult, getLatestFullScan } from '@/lib/scan-history'
import { DualSearchInput } from "@/components/dashboard/search-input"
import { Badge } from "@/components/ui/badge"
import {
    Globe, Swords, Search, ShieldAlert,
    CheckCircle2, Clock, Sparkles, Zap, Bot, RefreshCw,
    Copy, Link2, ExternalLink, ChevronDown, ChevronUp, Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScanErrorDialog } from '@/components/dashboard/scan-error-dialog'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { CreditConfirmDialog } from '@/components/dashboard/credit-confirm-dialog'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { DownloadReportButton } from '@/components/dashboard/download-report-button'
import { safeSetItem } from '@/lib/safe-storage'

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
    const [strategyFilter, setStrategyFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL')

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
        if (siteA) safeSetItem("battle_v3_siteA", siteA)
        if (siteB) safeSetItem("battle_v3_siteB", siteB)
        if (comparisonData) safeSetItem("battle_v3_data", JSON.stringify(comparisonData))
        if (backlinkData) safeSetItem("battle_v3_backlinks", JSON.stringify(backlinkData))
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

                    {/* Header + Search */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                                    <Swords className="h-6 w-6 text-[#00e5ff]" />
                                    Competitor Duel
                                </h1>
                                <p className="text-sm text-white/60 mt-1.5">Head-to-head intelligence warfare with backlink analysis. Two sites enter. One dominates.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="text" value={inlineUrlA} onChange={(e) => setInlineUrlA(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && inlineUrlA.trim() && inlineUrlB.trim() && handleBattle(inlineUrlA.trim(), inlineUrlB.trim())}
                                placeholder="yoursite.com"
                                className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-1 focus:ring-[#00e5ff]/30 text-sm" />
                            <span className="text-white/20 font-black italic text-sm px-2">VS</span>
                            <input type="text" value={inlineUrlB} onChange={(e) => setInlineUrlB(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && inlineUrlA.trim() && inlineUrlB.trim() && handleBattle(inlineUrlA.trim(), inlineUrlB.trim())}
                                placeholder="competitor.com"
                                className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#fe3f8c]/50 focus:ring-1 focus:ring-[#fe3f8c]/30 text-sm" />
                            <button onClick={() => inlineUrlA.trim() && inlineUrlB.trim() && handleBattle(inlineUrlA.trim(), inlineUrlB.trim())}
                                disabled={!inlineUrlA.trim() || !inlineUrlB.trim() || isAnalyzing}
                                className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shrink-0">
                                <Swords className="h-4 w-4" /> Battle
                            </button>
                        </div>
                        {comparisonData && !isAnalyzing && (
                            <div className="flex items-center gap-2 justify-end mt-4 pt-4 border-t border-white/[0.06]">
                                <button onClick={() => {
                                    const c = comparisonData.comparison || comparisonData
                                    const sep = '═'.repeat(60)
                                    let report = `DUELLY COMPETITOR DUEL REPORT\n${sep}\n${siteALabel} vs ${siteBLabel}\n${sep}\n\n`
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
                                    if (comparisonData.winnerVerdict || c.winnerVerdict) report += `\nEXPERT VERDICT:\n${comparisonData.winnerVerdict || c.winnerVerdict}\n`
                                    const recs = comparisonData.recommendations || c.recommendations || []
                                    if (recs.length > 0) { report += `\nCOUNTER-STRATEGIES (${recs.length}):\n`; recs.forEach((r: any, i: number) => { report += `\n${i + 1}. [${r.roi || r.priority || 'MEDIUM'}] ${r.title}\n`; if (r.description) report += `   Why: ${r.description}\n`; if (r.howToFix) report += `   Fix: ${r.howToFix}\n` }) }
                                    const opps = comparisonData.stolenOpportunities || c.stolenOpportunities || []
                                    if (opps.length > 0) { report += `\nSTOLEN OPPORTUNITIES:\n`; opps.forEach((o: any) => { report += `  • [${o.category?.toUpperCase()}] ${o.title}: ${o.description}\n` }) }
                                    const gps = comparisonData.strategicGaps || c.strategicGaps || []
                                    if (gps.length > 0) { report += `\nSTRATEGIC GAPS:\n`; gps.forEach((g: string) => { report += `  • ${g}\n` }) }
                                    report += `\n${sep}\nGenerated by Duelly.ai — ${new Date().toLocaleDateString()}\n`
                                    navigator.clipboard.writeText(report); setReportCopied(true); setTimeout(() => setReportCopied(false), 2000)
                                }}
                                    className="px-4 py-2 rounded-lg border border-[#00e5ff]/30 bg-[#00e5ff]/5 text-xs font-bold text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-colors flex items-center gap-1.5">
                                    <Copy className="h-3.5 w-3.5" /> {reportCopied ? '✓ Copied' : 'Copy Report'}
                                </button>
                                <DownloadReportButton
                                  filename={`duelly-competitor-duel-${siteALabel}-vs-${siteBLabel}-${new Date().toISOString().slice(0, 10)}.pdf`}
                                  generatePdf={async () => {
                                    const { generatePdfBlob } = await import('@/lib/pdf/generate')
                                    const { CompetitorDuelReport } = await import('@/lib/pdf/competitor-duel-report')
                                    const React = (await import('react')).default
                                    const c = comparisonData.comparison || comparisonData
                                    return generatePdfBlob(React.createElement(CompetitorDuelReport, {
                                      siteA: siteA, siteB: siteB, date: new Date().toLocaleDateString(),
                                      scores: { seo: { siteA: c.seo?.siteA ?? 0, siteB: c.seo?.siteB ?? 0 }, aeo: { siteA: c.aeo?.siteA ?? 0, siteB: c.aeo?.siteB ?? 0 }, geo: { siteA: c.geo?.siteA ?? 0, siteB: c.geo?.siteB ?? 0 } },
                                      verdict: comparisonData.winnerVerdict || c.winnerVerdict,
                                      recommendations: comparisonData.recommendations || c.recommendations,
                                      backlinkA: backlinkData?.siteA, backlinkB: backlinkData?.siteB, linkGap: backlinkData?.linkGap,
                                      stolenOpportunities: comparisonData.stolenOpportunities || c.stolenOpportunities,
                                      strategicGaps: comparisonData.strategicGaps || c.strategicGaps,
                                    }))
                                  }}
                                />
                            </div>
                        )}
                    </div>

                    <ScanErrorDialog error={error} onClose={() => setError(null)} onRetry={() => handleBattle(siteA, siteB)} creditsRefunded={creditsRefunded} />
                    <CreditConfirmDialog open={creditDialogOpen} onConfirm={handleConfirmBattle} onCancel={() => setCreditDialogOpen(false)} creditCost={20} scanType="Competitor Duel" costBreakdown="20 credits per competitive intelligence duel (2 sites analyzed + backlink profiles)" />

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
                                        <h2 className="text-xl font-black text-white">Competitor Duel in Progress</h2>
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
                                            <h4 className="text-xs font-black uppercase text-[#00e5ff] tracking-widest mb-1 flex items-center gap-1.5">Expert Verdict <InfoTooltip content="AI-generated analysis of which site has the competitive advantage and why." /></h4>
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
                                const criticalCount = recs.filter((r: any) => normPriority(r) === 'CRITICAL').length
                                const highCount = recs.filter((r: any) => normPriority(r) === 'HIGH').length
                                const mediumCount = recs.filter((r: any) => normPriority(r) === 'MEDIUM').length
                                const filtered = strategyFilter === 'ALL' ? recs : recs.filter((r: any) => normPriority(r) === strategyFilter)

                                return (
                                    <Card className="border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5">
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-[#00e5ff]" />
                                                <CardTitle className="text-white">Counter-Strategies</CardTitle>
                                                <InfoTooltip content="AI-generated action plan to outrank your competitor. Each strategy targets a specific weakness in your site relative to theirs, with step-by-step implementation instructions." />
                                                <button onClick={() => {
                                                    const text = recs.map((r: any, i: number) => `${i + 1}. [${normPriority(r)}] ${r.title}\n${r.description || ''}\n${r.howToFix || ''}`).join('\n\n')
                                                    navigator.clipboard.writeText(text)
                                                }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                    <Copy className="h-3.5 w-3.5" /> Copy All
                                                </button>
                                            </div>
                                            <CardDescription>Your personalized action plan to outrank this competitor</CardDescription>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Filter className="h-3.5 w-3.5 text-white/40" />
                                                {[
                                                    { key: 'ALL' as const, label: 'All', count: recs.length, activeColor: 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40', inactiveColor: 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:border-white/[0.15]' },
                                                    { key: 'CRITICAL' as const, label: 'Critical', count: criticalCount, activeColor: 'bg-red-500/20 text-red-400 border-red-500/40', inactiveColor: 'bg-red-500/5 text-red-400/60 border-red-500/20 hover:bg-red-500/10' },
                                                    { key: 'HIGH' as const, label: 'High', count: highCount, activeColor: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40', inactiveColor: 'bg-[#f59e0b]/5 text-[#f59e0b]/60 border-[#f59e0b]/20 hover:bg-[#f59e0b]/10' },
                                                    { key: 'MEDIUM' as const, label: 'Medium', count: mediumCount, activeColor: 'bg-[#BC13FE]/20 text-[#BC13FE] border-[#BC13FE]/40', inactiveColor: 'bg-[#BC13FE]/5 text-[#BC13FE]/60 border-[#BC13FE]/20 hover:bg-[#BC13FE]/10' },
                                                ].filter(f => f.key === 'ALL' || f.count > 0).map(f => (
                                                    <button key={f.key} onClick={() => setStrategyFilter(f.key)}
                                                        className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all border",
                                                            strategyFilter === f.key ? f.activeColor : f.inactiveColor
                                                        )}>
                                                        {f.label} ({f.count})
                                                    </button>
                                                ))}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {filtered.map((rec: any, i: number) => (
                                                    <FixInstructionCard key={i} title={rec.title} domain={normDomain(rec) as any} priority={normPriority(rec)}
                                                        steps={rec.howToFix ? [{ step: 1, title: 'How To Fix', description: rec.howToFix }] : [{ step: 1, title: rec.title, description: rec.description }]}
                                                        code={rec.codeSnippet} platform={rec.platform || 'Any'} estimatedTime={`${rec.effort || 1}h`}
                                                        difficulty={rec.effort >= 3 ? 'difficult' : rec.effort >= 2 ? 'moderate' : 'easy'}
                                                        impact={rec.roi === 'CRITICAL' ? 'high' : rec.roi === 'HIGH' ? 'medium' : 'low'}
                                                        impactedScores={rec.impactedScores}
                                                        whyItMatters={rec.description} />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })()}

                            {/* ── Backlink Profile Comparison ── */}
                            {blA && blB && (
                                <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.02] backdrop-blur-xl p-5">
                                    <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                                        <Link2 className="h-4 w-4 text-green-400" /> Backlink Profile Comparison <InfoTooltip content="Side-by-side comparison of each site's backlink authority from Moz data." />
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

                                    {/* Top Referring Domains Tables */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                                        {/* Site A Backlinks */}
                                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                            <div className="px-4 py-3">
                                                <span className="text-xs font-bold text-[#00e5ff]">Top Referring Domains — {siteALabel} ({blA.backlinks.length})</span>
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
                                                            <a href={(() => { const u = bl.sourceUrl || bl.sourceDomain; return u.startsWith('http') ? u : `https://${u}` })()} target="_blank" rel="noopener noreferrer" className="text-white/70 truncate flex-1 hover:text-[#00e5ff] hover:underline transition-colors">{bl.sourceDomain}</a>
                                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", bl.isDofollow ? "bg-green-500/10 text-green-400" : "bg-white/[0.06] text-white/30")}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                                                        </div>
                                                    ))}
                                                    {blA.backlinks.length === 0 && <p className="text-xs text-white/30 italic py-2">No backlinks found</p>}
                                                </div>
                                        </div>
                                        {/* Site B Backlinks */}
                                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                            <div className="px-4 py-3">
                                                <span className="text-xs font-bold text-[#fe3f8c]">Top Referring Domains — {siteBLabel} ({blB.backlinks.length})</span>
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
                                                            <a href={(() => { const u = bl.sourceUrl || bl.sourceDomain; return u.startsWith('http') ? u : `https://${u}` })()} target="_blank" rel="noopener noreferrer" className="text-white/70 truncate flex-1 hover:text-[#fe3f8c] hover:underline transition-colors">{bl.sourceDomain}</a>
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
                                                            <a href={(() => { const u = g.url || g.domain; return u.startsWith('http') ? u : `https://${u}` })()} target="_blank" rel="noopener noreferrer" className="text-white/70 truncate flex-1 hover:text-[#BC13FE] hover:underline transition-colors">{g.domain}</a>
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
                                    <p className="text-xs text-white/30">Backlink analysis coming soon — Domain Authority, top referring domains, and link gap comparison.</p>
                                </div>
                            )}

                            {/* ── Link Building Intelligence ── */}
                            {blA && (
                                <div className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/[0.02] backdrop-blur-xl p-5">
                                    <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                                        <Link2 className="h-4 w-4 text-green-400" /> Link Building Intelligence
                                        <InfoTooltip content="Backlinks are links from other websites pointing to yours. They're one of the strongest signals Google uses to decide who ranks higher. More quality backlinks = more trust = higher rankings." />
                                    </h3>

                                    {/* DA Assessment with backlink explainer */}
                                    <div className={cn("rounded-lg p-4 mb-4 border",
                                        blA.metrics.domainAuthority < 20 ? "border-red-500/30 bg-red-500/10" :
                                        blA.metrics.domainAuthority < 40 ? "border-yellow-500/30 bg-yellow-500/10" :
                                        blA.metrics.domainAuthority < 60 ? "border-[#00e5ff]/30 bg-[#00e5ff]/10" :
                                        "border-green-500/30 bg-green-500/10"
                                    )}>
                                        <p className={cn("text-sm font-bold mb-2",
                                            blA.metrics.domainAuthority < 20 ? "text-red-400" :
                                            blA.metrics.domainAuthority < 40 ? "text-yellow-400" :
                                            blA.metrics.domainAuthority < 60 ? "text-[#00e5ff]" :
                                            "text-green-400"
                                        )}>
                                            {blA.metrics.domainAuthority < 20 && `Domain Authority ${blA.metrics.domainAuthority}/100 — Your site needs more high quality backlinks`}
                                            {blA.metrics.domainAuthority >= 20 && blA.metrics.domainAuthority < 40 && `Domain Authority ${blA.metrics.domainAuthority}/100 — Building momentum, keep earning quality backlinks`}
                                            {blA.metrics.domainAuthority >= 40 && blA.metrics.domainAuthority < 60 && `Domain Authority ${blA.metrics.domainAuthority}/100 — Solid foundation, continue building`}
                                            {blA.metrics.domainAuthority >= 60 && `Domain Authority ${blA.metrics.domainAuthority}/100 — Strong authority, maintain your edge`}
                                        </p>
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            Backlinks are like votes of confidence from other websites. The more reputable sites that link to yours, the more Google trusts you and the higher you rank. Without them, even great content stays invisible.
                                        </p>
                                    </div>

                                    {/* Competitor Gap */}
                                    {blB && blB.metrics.domainAuthority > blA.metrics.domainAuthority && (
                                        <div className="rounded-lg p-4 mb-4 border border-[#BC13FE]/30 bg-[#BC13FE]/10">
                                            <p className="text-sm font-bold text-[#BC13FE] mb-1">
                                                Your competitor is {blB.metrics.domainAuthority - blA.metrics.domainAuthority} points ahead
                                            </p>
                                            <p className="text-xs text-white/60 leading-relaxed">
                                                {siteBLabel} has a Domain Authority of {blB.metrics.domainAuthority} compared to your {blA.metrics.domainAuthority}.
                                                {blB.metrics.linkingDomains > blA.metrics.linkingDomains * 2
                                                    ? ` They have ${blB.metrics.linkingDomains.toLocaleString()} websites linking to them vs your ${blA.metrics.linkingDomains.toLocaleString()}. Building quality backlinks is the fastest way to close this gap.`
                                                    : ` Consistently earning quality backlinks will help you close this gap over time.`
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Simple Actionable Tactics */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest">What You Can Do</p>
                                        {[
                                            blA.metrics.domainAuthority < 30 && { icon: "📍", title: "Claim your free listings", desc: "Make sure you're listed on Google Business Profile, Yelp, and any directories specific to your industry. These are free and give your site an immediate authority boost." },
                                            { icon: "🤝", title: "Ask people you already work with", desc: "Your vendors, suppliers, partners, and local business associations already know you. Ask them to add a link to your website on theirs — most will be happy to." },
                                            { icon: "📝", title: "Create something worth sharing", desc: "Write a helpful guide, build a local resource page, or answer common questions in your industry. Useful content naturally attracts links from other websites over time." },
                                            linkGap.length > 0 && { icon: "🎯", title: `${linkGap.length} websites link to your competitor but not you`, desc: "These sites already link to businesses in your space — they're your best opportunities. Reaching out to them is the fastest way to earn quality backlinks." },
                                            blA.metrics.spamScore > 20 && { icon: "⚠️", title: "Some low-quality sites are linking to you", desc: `Your spam score is ${blA.metrics.spamScore}%, which means some questionable websites are linking to your site. This can hurt your rankings. A professional can help clean this up.` },
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

                                    {/* CTA */}
                                    <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/[0.05] p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-green-400">Explore a quality backlink strategy with a professional</p>
                                            <p className="text-xs text-white/40 mt-0.5">Let experts handle the outreach, content, and relationship building for you.</p>
                                        </div>
                                        <button className="shrink-0 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold transition-colors">
                                            Learn More →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Stolen Opportunities & Strategic Gaps ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {(comparisonData.stolenOpportunities || comparisonData.comparison?.stolenOpportunities)?.length > 0 && (
                                    <div className="rounded-2xl border border-[#BC13FE]/20 bg-[#BC13FE]/[0.03] backdrop-blur-xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-[#BC13FE]/10">
                                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-[#BC13FE]" /> Stolen Opportunities <InfoTooltip content="Specific areas where your competitor is outperforming you in search visibility." />
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
                                                <ShieldAlert className="h-4 w-4 text-green-400" /> Critical Strategic Gaps <InfoTooltip content="High-level weaknesses in your site's strategy compared to the competitor." />
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
