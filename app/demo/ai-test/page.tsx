"use client"

import Link from "next/link"
import { DemoShell } from "@/components/demo/demo-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FlaskConical, Search, Crown, CheckCircle2, Sparkles, Bot, Globe, Trophy, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react"

// ─── Engine Metadata ───────────────────────────────────────────────────────────

const ENGINE_META: Record<string, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  google: { label: 'Google Search', color: '#4285f4', icon: <Search className="h-5 w-5" />, desc: 'Actual Google results' },
  gemini: { label: 'Google Gemini', color: '#00e5ff', icon: <Globe className="h-5 w-5" />, desc: 'Powered by Google Search' },
  chatgpt: { label: 'ChatGPT', color: '#BC13FE', icon: <Bot className="h-5 w-5" />, desc: 'Powered by web search' },
  perplexity: { label: 'Perplexity', color: '#fe3f8c', icon: <Sparkles className="h-5 w-5" />, desc: 'Real-time web search' },
}

// ─── Hardcoded Demo Data ───────────────────────────────────────────────────────

const DEMO_KEYWORD = "best bakery portland"
const DEMO_USER_URL = "sunrise-bakery.com"
const DEMO_USER_DOMAIN = "sunrise-bakery"

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

const DEMO_RESULTS: EngineResult[] = [
  {
    engine: 'google',
    durationMs: 1240,
    recommendations: [
      { rank: 1, name: 'Portland Artisan Bread', url: 'https://portlandartisanbread.com', urlStatus: 'valid', reason: 'Top organic result for artisan bakeries in Portland with strong local SEO signals and review presence.' },
      { rank: 2, name: 'Grand Central Bakery', url: 'https://grandcentralbakery.com', urlStatus: 'valid', reason: 'Well-established Portland bakery chain with multiple locations and strong domain authority.' },
      { rank: 3, name: "Ken's Artisan Bakery", url: 'https://kensartisan.com', urlStatus: 'valid', reason: 'Highly rated artisan bakery with extensive press coverage and backlink profile.' },
      { rank: 4, name: 'Sunrise Bakery', url: 'https://sunrise-bakery.com', urlStatus: 'valid', reason: 'Local bakery appearing in Google Maps pack with decent review count.' },
      { rank: 5, name: 'Little T Baker', url: 'https://littletbaker.com', urlStatus: 'valid', reason: 'Popular neighborhood bakery with strong Yelp and Google reviews.' },
    ],
  },
  {
    engine: 'gemini',
    durationMs: 3820,
    recommendations: [
      { rank: 1, name: "Ken's Artisan Bakery", url: 'https://kensartisan.com', urlStatus: 'valid', reason: 'Gemini highlights this as Portland\'s top artisan bakery, citing James Beard nominations and consistent critical acclaim.' },
      { rank: 2, name: 'Grand Central Bakery', url: 'https://grandcentralbakery.com', urlStatus: 'valid', reason: 'Recognized as a Portland institution with multiple locations and decades of community presence.' },
      { rank: 3, name: 'Portland Artisan Bread', url: 'https://portlandartisanbread.com', urlStatus: 'valid', reason: 'Noted for sourdough and European-style breads with strong local following.' },
      { rank: 4, name: 'Tabor Bread', url: 'https://taborbread.com', urlStatus: 'valid', reason: 'Recommended for wood-fired breads and commitment to local grain sourcing.' },
      { rank: 5, name: 'Nuvrei Patisserie', url: 'https://nuvrei.com', urlStatus: 'valid', reason: 'French-style patisserie frequently mentioned in Portland food guides.' },
    ],
  },
  {
    engine: 'chatgpt',
    durationMs: 4150,
    recommendations: [
      { rank: 1, name: 'Grand Central Bakery', url: 'https://grandcentralbakery.com', urlStatus: 'valid', reason: 'ChatGPT recommends this as the most well-known Portland bakery with consistent quality across locations.' },
      { rank: 2, name: "Ken's Artisan Bakery", url: 'https://kensartisan.com', urlStatus: 'valid', reason: 'Praised for handcrafted breads and pastries, frequently cited in food publications.' },
      { rank: 3, name: 'Portland Artisan Bread', url: 'https://portlandartisanbread.com', urlStatus: 'valid', reason: 'Highlighted for artisan sourdough and community-focused baking approach.' },
      { rank: 4, name: 'Tabor Bread', url: 'https://taborbread.com', urlStatus: 'valid', reason: 'Known for whole-grain, wood-fired breads using locally milled flour.' },
    ],
  },
  {
    engine: 'perplexity',
    durationMs: 2980,
    recommendations: [
      { rank: 1, name: "Ken's Artisan Bakery", url: 'https://kensartisan.com', urlStatus: 'valid', reason: 'Perplexity cites multiple sources ranking this as Portland\'s premier artisan bakery.' },
      { rank: 2, name: 'Grand Central Bakery', url: 'https://grandcentralbakery.com', urlStatus: 'valid', reason: 'Referenced across food blogs and local guides as a Portland staple.' },
      { rank: 3, name: 'Portland Artisan Bread', url: 'https://portlandartisanbread.com', urlStatus: 'valid', reason: 'Mentioned in multiple Portland bakery roundups for quality sourdough.' },
      { rank: 4, name: 'Sunrise Bakery', url: 'https://sunrise-bakery.com', urlStatus: 'valid', reason: 'Found in local business directories with positive customer reviews.' },
      { rank: 5, name: 'Little T Baker', url: 'https://littletbaker.com', urlStatus: 'valid', reason: 'Neighborhood favorite with strong word-of-mouth and review presence.' },
    ],
  },
]

const DEMO_CONSENSUS: ConsensusItem[] = [
  {
    name: "Ken's Artisan Bakery",
    url: 'https://kensartisan.com',
    engines: ['google', 'gemini', 'chatgpt', 'perplexity'],
    reasons: ['James Beard nominated', 'Critical acclaim', 'Artisan quality'],
  },
  {
    name: 'Grand Central Bakery',
    url: 'https://grandcentralbakery.com',
    engines: ['google', 'gemini', 'chatgpt', 'perplexity'],
    reasons: ['Portland institution', 'Multiple locations', 'Consistent quality'],
  },
  {
    name: 'Portland Artisan Bread',
    url: 'https://portlandartisanbread.com',
    engines: ['google', 'gemini', 'chatgpt', 'perplexity'],
    reasons: ['Strong local SEO', 'Sourdough specialty', 'Community focused'],
  },
  {
    name: 'Tabor Bread',
    url: 'https://taborbread.com',
    engines: ['gemini', 'chatgpt'],
    reasons: ['Wood-fired breads', 'Local grain sourcing'],
  },
  {
    name: 'Sunrise Bakery',
    url: 'https://sunrise-bakery.com',
    engines: ['google', 'perplexity'],
    reasons: ['Local presence', 'Positive reviews'],
  },
  {
    name: 'Little T Baker',
    url: 'https://littletbaker.com',
    engines: ['google', 'perplexity'],
    reasons: ['Neighborhood favorite', 'Strong reviews'],
  },
]

const DEMO_INSIGHTS = {
  visibility: 'Your bakery appears in 2 of 4 AI engines (Google Search and Perplexity). Gemini and ChatGPT do not recommend you — this means your site lacks the authority signals and structured data these models rely on.',
  competitors: "Ken's Artisan Bakery and Grand Central Bakery dominate across all 4 engines. They have strong press coverage, structured data, and consistent mentions across food blogs and local guides — exactly what AI models use to build recommendations.",
  actions: [
    'Add LocalBusiness schema markup with bakery-specific properties (menu, priceRange, servesCuisine) so AI engines can properly categorize your business.',
    'Build FAQ content answering common queries like "best bakery in Portland" and "fresh bread near me" to match the conversational patterns AI engines use.',
    'Earn local press coverage and food blog mentions — AI models heavily weight editorial citations when building recommendation lists.',
  ],
  nextTool: {
    name: 'Pro Audit',
    reason: 'Get detailed, platform-specific fix instructions for every SEO, AEO, and GEO issue holding your site back from AI visibility.',
  },
}

const isUserSite = (rec: Recommendation) => {
  if (!rec.url) return false
  const recDomain = rec.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
  const recDomainBase = recDomain.split('/')[0].split('.')[0]
  const recNameNormalized = rec.name.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (recDomain.includes(DEMO_USER_URL)) return true
  if (recDomainBase === DEMO_USER_DOMAIN) return true
  if (recNameNormalized.includes(DEMO_USER_DOMAIN.replace(/-/g, ''))) return true
  return false
}

// ─── Demo Page Component ───────────────────────────────────────────────────────

export default function DemoAITestPage() {
  return (
    <DemoShell>
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-12">

          {/* Demo Banner */}
          <div className="rounded-lg border-2 border-[#BC13FE]/40 bg-[#BC13FE]/5 px-4 py-3 flex items-center justify-between gap-3 flex-wrap mb-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#BC13FE] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5">Interactive Demo</Badge>
              <p className="text-sm text-white/60">This is a demo AI Visibility check for <span className="font-bold text-[#00e5ff]">&ldquo;{DEMO_KEYWORD}&rdquo;</span></p>
            </div>
            <Link href="/signup" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#BC13FE] hover:bg-[#BC13FE]/90 text-white text-xs font-bold transition-all shrink-0">
              Sign Up Free <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <FlaskConical className="h-6 w-6 text-[#00e5ff]" />
              AI Visibility
            </h1>
            <p className="text-sm text-white/60 mt-1.5">Compare real Google Search results with AI recommendations from Gemini, ChatGPT, and Perplexity. See who ranks where — and if AI can find you.</p>
          </div>

          {/* Input (filled but disabled) */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-xs text-white font-bold mb-1.5">Step 1 — Enter a keyword</p>
              <div className="flex items-center gap-2">
                <input type="text" value={DEMO_KEYWORD} disabled
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none text-sm opacity-60 cursor-not-allowed" />
                <button disabled
                  className="px-5 py-2.5 bg-[#00e5ff] text-black font-black rounded-xl flex items-center gap-2 text-sm shrink-0 opacity-50 cursor-not-allowed">
                  <FlaskConical className="h-4 w-4" /> Check AI Visibility
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-white font-bold mb-1.5">Step 2 — Your website (optional)</p>
              <input type="text" value={DEMO_USER_URL} disabled
                className="w-full px-4 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white focus:outline-none text-sm opacity-60 cursor-not-allowed" />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Consensus */}
            <Card className="border-[#f59e0b]/20 bg-[#f59e0b]/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-[#f59e0b]" />
                  AI Consensus — Mentioned by {DEMO_CONSENSUS[0].engines.length}+ Engines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEMO_CONSENSUS.map((c, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border",
                    c.name.toLowerCase().includes('sunrise')
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

            {/* 4 Engine Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEMO_RESULTS.map(engineResult => {
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

                      {/* User site not found warning */}
                      {hasResults && !engineResult.recommendations.some(isUserSite) && (
                        <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                          <p className="text-[10px] text-red-400 font-bold">Your site was not recommended by {meta.label}</p>
                        </div>
                      )}
                      {hasResults && engineResult.recommendations.some(isUserSite) && (
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
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <p className="text-sm text-white/60">
                <span className="text-[#f59e0b] font-bold">Only 1 AI engine recommends your site. Google Search finds you.</span>
              </p>
            </div>

            {/* Methodology Note */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-[#f59e0b] shrink-0 mt-0.5" />
              <p className="text-xs text-white/40 leading-relaxed">
                These results come from a clean, unpersonalized session with no browsing history, location data, or logged-in accounts influencing the output. This is your baseline visibility — how AI sees your brand when it knows nothing about the person asking. Individual users will see different results based on their personal context, location, and search history. Minor variance between runs is normal — AI models are non-deterministic by design. The trend over time is what matters.
              </p>
            </div>

            {/* AI Insights */}
            <Card className="border-[#00e5ff]/20 bg-[#00e5ff]/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-[#00e5ff]" />
                  What This Means
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-white/70">{DEMO_INSIGHTS.visibility}</p>
                  <p className="text-sm text-white/50">{DEMO_INSIGHTS.competitors}</p>
                </div>
              </CardContent>
            </Card>

            {/* Next Step CTA */}
            <Card className="border-[#BC13FE]/30 bg-gradient-to-br from-[#BC13FE]/[0.04] to-[#00e5ff]/[0.04] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#BC13FE]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="text-center space-y-3">
                  <p className="text-[10px] text-[#BC13FE] uppercase tracking-widest font-bold">Now you know where you stand</p>
                  <h3 className="text-xl font-black text-white">Get Specific Fixes to Improve Your AI Visibility</h3>
                  <p className="text-sm text-white/50 max-w-lg mx-auto">
                    Pro Audit analyzes your site with the same AI that powers these search engines and gives you step-by-step, platform-specific instructions to fix every issue holding you back.
                  </p>
                  <div className="pt-2">
                    <Link href="/demo/pro-audit"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#BC13FE] hover:bg-[#BC13FE]/90 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                      Run Pro Audit on sunrise-bakery.com
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </DemoShell>
  )
}
