"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { PageShell } from "@/components/dashboard/page-shell"
import { CreditConfirmDialog } from "@/components/dashboard/credit-confirm-dialog"
import { ScanErrorDialog } from "@/components/dashboard/scan-error-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FlaskConical, Search, Loader2, Crown, CheckCircle2, XCircle, Sparkles, Bot, Globe, Trophy, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react"

interface Recommendation {
  rank: number; name: string; url?: string; urlStatus?: 'valid' | 'invalid' | 'parked'; reason: string
}
interface EngineResult {
  engine: 'gemini' | 'chatgpt' | 'perplexity' | 'google'
  recommendations: Recommendation[]
  error?: string
  durationMs: number
}
interface ConsensusItem {
  name: string; url: string; engines: string[]; reasons: string[]
}
interface AITestResult {
  keyword: string
  results: EngineResult[]
  consensus: ConsensusItem[]
  insights?: { visibility: string; competitors: string; actions: string[]; nextTool: { name: string; reason: string } } | null
  creditCost: number
}

const ENGINE_META: Record<string, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  google: { label: 'Google Search', color: '#4285f4', icon: <Search className="h-5 w-5" />, desc: 'Actual Google results' },
  gemini: { label: 'Google Gemini', color: '#00e5ff', icon: <Globe className="h-5 w-5" />, desc: 'Powered by Google Search' },
  chatgpt: { label: 'ChatGPT', color: '#BC13FE', icon: <Bot className="h-5 w-5" />, desc: 'Powered by web search' },
  perplexity: { label: 'Perplexity', color: '#fe3f8c', icon: <Sparkles className="h-5 w-5" />, desc: 'Real-time web search' },
}

export default function AITestPage() {
  const [keyword, setKeyword] = useState("")
  const [userUrl, setUserUrl] = useState("")
  const [result, setResult] = useState<AITestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creditsRefunded, setCreditsRefunded] = useState(0)
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [retryingEngine, setRetryingEngine] = useState<string | null>(null)
  const autoRetryDoneRef = useRef<string | null>(null) // tracks which result set we've auto-retried

  // Auto-retry failed AI engines when results first load
  useEffect(() => {
    if (!result || autoRetryDoneRef.current === result.keyword) return
    const failedAiEngines = result.results.filter(r =>
      r.engine !== 'google' && r.error && r.recommendations.length === 0
    )
    if (failedAiEngines.length === 0) return
    autoRetryDoneRef.current = result.keyword

    // Stagger retries slightly to avoid hammering APIs simultaneously
    failedAiEngines.forEach((engineResult, i) => {
      setTimeout(() => {
        setRetryingEngine(engineResult.engine)
        fetch('/api/ai-test/retry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ engine: engineResult.engine, keyword: result.keyword }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.success && data.result) {
              setResult(prev => {
                if (!prev) return prev
                return { ...prev, results: prev.results.map(r => r.engine === engineResult.engine ? data.result : r) }
              })
            }
          })
          .catch(() => {})
          .finally(() => setRetryingEngine(prev => prev === engineResult.engine ? null : prev))
      }, i * 1500) // stagger by 1.5s each
    })
  }, [result?.keyword])

  const handleRun = () => {
    if (!keyword.trim()) return
    setCreditDialogOpen(true)
  }

  const handleConfirm = async () => {
    setCreditDialogOpen(false)
    setIsLoading(true)
    setError(null)
    setCreditsRefunded(0)
    try {
      const res = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), userUrl: userUrl.trim() || undefined }),
      })
      const data = await res.json()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'AI Visibility check failed')
        setCreditsRefunded(data.creditsRefunded || 0)
      }
    } catch { setError('Connection failed') }
    finally { setIsLoading(false) }
  }

  const handleRetryEngine = async (engine: string) => {
    if (!result || retryingEngine) return
    setRetryingEngine(engine)
    try {
      const res = await fetch('/api/ai-test/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine, keyword: result.keyword }),
      })
      const data = await res.json()
      if (data.success && data.result) {
        setResult(prev => {
          if (!prev) return prev
          const updated = prev.results.map(r => r.engine === engine ? data.result : r)
          return { ...prev, results: updated }
        })
      }
    } catch {}
    finally { setRetryingEngine(null) }
  }

  const normalizeUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
  const userDomain = userUrl ? normalizeUrl(userUrl) : ''
  // Extract just the core domain name without TLD for fuzzy name matching
  const userDomainBase = userDomain ? userDomain.split('/')[0].split('.')[0] : ''

  const isUserSite = (rec: Recommendation) => {
    if (!userDomain) return false
    const recDomain = rec.url ? normalizeUrl(rec.url) : ''
    const recDomainBase = recDomain ? recDomain.split('/')[0].split('.')[0] : ''
    const recNameNormalized = rec.name.toLowerCase().replace(/[^a-z0-9]/g, '')

    // 1. Exact domain match (url contains user domain or vice versa)
    if (recDomain && (recDomain.includes(userDomain) || recDomain.startsWith(userDomainBase + '.'))) return true
    // 2. Domain base match (e.g. "pizzatwice" in both domains)
    if (recDomainBase && userDomainBase && recDomainBase === userDomainBase) return true
    // 3. Name contains domain base (e.g. name "Pizza Twice" -> "pizzatwice" matches "pizzatwice")
    if (userDomainBase && recNameNormalized.includes(userDomainBase)) return true
    // 4. Domain base contains the stripped name (e.g. domain "pizzatwice" matches name "pizzatwice")
    if (recNameNormalized && userDomainBase.includes(recNameNormalized) && recNameNormalized.length >= 4) return true

    return false
  }

  return (
    <PageShell apiStatus="idle" hideSearch>
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-12">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <FlaskConical className="h-6 w-6 text-[#00e5ff]" />
              AI Visibility
            </h1>
            <p className="text-sm text-white/60 mt-1.5">Compare real Google Search results with AI recommendations from Gemini, ChatGPT, and Perplexity. See who ranks where — and if AI can find you.</p>
          </div>

          <ScanErrorDialog error={error} onClose={() => setError(null)} creditsRefunded={creditsRefunded} />
          <CreditConfirmDialog open={creditDialogOpen} onConfirm={handleConfirm} onCancel={() => setCreditDialogOpen(false)}
            creditCost={5} scanType="AI Visibility" costBreakdown="5 credits per run" />

          {/* Input */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1.5">Step 1 — Enter a keyword</p>
              <div className="flex items-center gap-2">
                <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRun()}
                  placeholder="Enter a keyword (e.g. best coffee shop downtown, dentist near me)"
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00e5ff]/50 focus:ring-1 focus:ring-[#00e5ff]/30 text-sm" />
                <button onClick={handleRun} disabled={isLoading || !keyword.trim()}
                  className="px-5 py-2.5 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shrink-0">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />} Check AI Visibility
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1.5">Step 2 — Your website (optional)</p>
              <input type="text" value={userUrl} onChange={e => setUserUrl(e.target.value)}
                placeholder="e.g. yourbusiness.com — highlights your site in results"
                className="w-full px-4 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5ff]/30 text-sm" />
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-4 border-t-[#00e5ff] border-r-[#BC13FE] border-b-[#fe3f8c] border-l-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FlaskConical className="h-6 w-6 text-[#00e5ff]" />
                </div>
              </div>
              <p className="text-sm text-white/60">Searching Google and asking 3 AI engines...</p>
              <div className="flex items-center gap-4 text-xs text-white/30">
                <span className="flex items-center gap-1"><Search className="h-3 w-3 text-[#4285f4]" /> Google</span>
                <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-[#00e5ff]" /> Gemini</span>
                <span className="flex items-center gap-1"><Bot className="h-3 w-3 text-[#BC13FE]" /> ChatGPT</span>
                <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#fe3f8c]" /> Perplexity</span>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Consensus */}
              {result.consensus.length > 0 && (
                <Card className="border-[#f59e0b]/20 bg-[#f59e0b]/[0.03]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      <Trophy className="h-5 w-5 text-[#f59e0b]" />
                      AI Consensus — Mentioned by {result.consensus[0].engines.length}+ Engines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.consensus.map((c, i) => (
                      <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border",
                        userDomain && c.name.toLowerCase().includes(userDomain.split('.')[0])
                          ? "border-[#00e5ff]/40 bg-[#00e5ff]/10" : "border-white/[0.06] bg-white/[0.02]")}>
                        <div className="flex items-center gap-1">
                          {c.engines.map(e => {
                            const meta = ENGINE_META[e as keyof typeof ENGINE_META]
                            return <div key={e} className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: `${meta.color}20`, color: meta.color }}>
                              <span className="text-[8px] font-black">{e[0].toUpperCase()}</span>
                            </div>
                          })}
                        </div>
                        <span className="text-sm font-bold text-white flex-1">{c.name}</span>
                        <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30 text-[10px]">{c.engines.length} engines</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 4 Engine Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.results.map(engineResult => {
                  const meta = ENGINE_META[engineResult.engine]
                  const hasResults = engineResult.recommendations.length > 0
                  return (
                    <Card key={engineResult.engine} className="border-white/[0.06]" style={{ borderColor: hasResults ? `${meta.color}30` : undefined }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}15`, color: meta.color }}>
                            {meta.icon}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-black" style={{ color: meta.color }}>{meta.label}</CardTitle>
                            <p className="text-[10px] text-white/30">{meta.desc}</p>
                          </div>
                          {hasResults && <Badge className="ml-auto text-[10px] px-1.5" style={{ background: `${meta.color}10`, color: meta.color, borderColor: `${meta.color}30` }}>{engineResult.durationMs}ms</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {engineResult.error ? (
                          <div className="text-center py-6">
                            {retryingEngine === engineResult.engine ? (
                              <>
                                <Loader2 className="h-8 w-8 text-white/20 mx-auto mb-2 animate-spin" />
                                <p className="text-xs text-white/30">Retrying...</p>
                                <div className="mt-3 h-0.5 bg-white/[0.04] rounded-full overflow-hidden">
                                  <div className="h-full bg-white/20 rounded-full animate-pulse w-2/3" />
                                </div>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-8 w-8 text-white/10 mx-auto mb-2" />
                                <p className="text-xs text-white/30 mb-3">{engineResult.error}</p>
                                <button onClick={() => handleRetryEngine(engineResult.engine)}
                                  className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
                                  Retry
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {engineResult.recommendations.map((rec, i) => {
                              const highlighted = isUserSite(rec)
                              return (
                                <div key={i} className={cn("p-3 rounded-lg border transition-all",
                                  highlighted ? "border-[#00e5ff]/40 bg-[#00e5ff]/10" : "border-white/[0.04] bg-white/[0.02]")}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black w-5 text-center" style={{ color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>
                                      {i === 0 ? <Crown className="h-3.5 w-3.5 text-[#f59e0b]" /> : `#${i + 1}`}
                                    </span>
                                    <span className={cn("text-sm font-bold flex-1 truncate", highlighted ? "text-[#00e5ff]" : "text-white/80")}>{rec.name}</span>
                                    {highlighted && <Badge className="bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 text-[8px] shrink-0">YOUR SITE</Badge>}
                                  </div>
                                  {rec.url && (
                                    <div className="flex items-center gap-1 mb-1">
                                      <a href={rec.url.startsWith('http') ? rec.url : `https://${rec.url}`} target="_blank" rel="noopener noreferrer"
                                        className={cn("text-[10px] truncate", rec.urlStatus === 'invalid' || rec.urlStatus === 'parked' ? "text-red-400/50 line-through" : "text-white/30 hover:text-[#00e5ff]")}>{rec.url}</a>
                                      {(rec.urlStatus === 'invalid' || rec.urlStatus === 'parked') && (
                                        <span className="text-[8px] text-red-400/60 flex items-center gap-0.5 shrink-0"><AlertTriangle className="h-2.5 w-2.5" />{rec.urlStatus === 'parked' ? 'parked' : 'bad link'}</span>
                                      )}
                                    </div>
                                  )}
                                  <p className="text-xs text-white/50 leading-relaxed">{rec.reason}</p>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* User site not found warning */}
                        {userDomain && hasResults && !engineResult.recommendations.some(isUserSite) && (
                          <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                            <p className="text-[10px] text-red-400 font-bold">Your site was not recommended by {meta.label}</p>
                          </div>
                        )}
                        {userDomain && hasResults && engineResult.recommendations.some(isUserSite) && (
                          <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                            <p className="text-[10px] text-green-400 font-bold flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> {meta.label} recommends your site</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Summary */}
              {userDomain && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                  <p className="text-sm text-white/60">
                    {(() => {
                      const aiResults = result.results.filter(r => r.engine !== 'google')
                      const found = aiResults.filter(r => r.recommendations.some(isUserSite)).length
                      const googleFound = result.results.find(r => r.engine === 'google')?.recommendations.some(isUserSite)
                      const googleNote = googleFound ? ' Google Search finds you.' : ' Google Search doesn\u2019t show you either.'
                      if (found === 3) return <span className="text-green-400 font-bold">All 3 AI engines recommend your site for &ldquo;{result.keyword}&rdquo;.{googleNote}</span>
                      if (found === 2) return <span className="text-yellow-400 font-bold">2 of 3 AI engines recommend your site.{googleNote}</span>
                      if (found === 1) return <span className="text-[#f59e0b] font-bold">Only 1 AI engine recommends your site.{googleNote}</span>
                      return <span className="text-red-400 font-bold">None of the 3 AI engines recommended your site for &ldquo;{result.keyword}&rdquo;.{googleNote}</span>
                    })()}
                  </p>
                </div>
              )}

              {/* AI Insights */}
              {result.insights && (
                <Card className="border-[#00e5ff]/20 bg-[#00e5ff]/[0.02]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      <Lightbulb className="h-5 w-5 text-[#00e5ff]" />
                      What This Means
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-white/70">{result.insights.visibility}</p>
                      <p className="text-sm text-white/50">{result.insights.competitors}</p>
                    </div>
                    {result.insights.actions.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">What to do</p>
                        {result.insights.actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                            <span className="text-[#00e5ff] font-bold shrink-0">{i + 1}.</span>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.insights.nextTool && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <Link href={`/${result.insights.nextTool.name}`}
                          className="flex items-center gap-2 text-sm text-[#00e5ff] hover:text-[#00e5ff]/80 transition-colors group">
                          <span className="font-bold">Next step:</span>
                          <span className="text-white/50 group-hover:text-white/70">{result.insights.nextTool.reason}</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Hero — only when no results */}
          {!result && !isLoading && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#00e5ff]/8 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#fe3f8c]/8 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 w-full max-w-lg space-y-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#00e5ff]/10 flex items-center justify-center mb-4">
                  <FlaskConical className="h-8 w-8 text-[#00e5ff]" />
                </div>
                <h2 className="text-2xl font-black text-white">Check Your AI Visibility</h2>
                <p className="text-sm text-white/60">Enter any keyword and we&apos;ll show you real Google Search results alongside what Gemini, ChatGPT, and Perplexity recommend. See how AI compares to traditional search — and if either can find you.</p>
                <div className="flex items-center justify-center gap-6 text-xs text-white/40">
                  <span className="flex items-center gap-1.5"><Search className="h-4 w-4 text-[#4285f4]" /> Google</span>
                  <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-[#00e5ff]" /> Gemini</span>
                  <span className="flex items-center gap-1.5"><Bot className="h-4 w-4 text-[#BC13FE]" /> ChatGPT</span>
                  <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-[#fe3f8c]" /> Perplexity</span>
                </div>
                <p className="text-xs text-white/30">5 credits per run</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </PageShell>
  )
}
