'use client'

import { useState } from 'react'
import {
  Globe, Swords, Search, ShieldAlert,
  CheckCircle2, Sparkles, Zap, Bot,
  Copy, Link2, ExternalLink, ChevronDown, ChevronUp, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LearnMore } from '@/components/ui/learn-more'
import { ExpertAnalysis } from '@/components/dashboard/expert-analysis'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { WhatsNextCard, NEXT_STEPS } from '@/components/dashboard/whats-next-card'
import { DemoShell } from '@/components/demo/demo-shell'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ─── Hardcoded Demo Data ───────────────────────────────────────────────────────

const SITE_A_URL = 'www.sunrise-bakery.com'
const SITE_B_URL = 'www.portland-artisan-bread.com'
const SITE_A_LABEL = 'www.sunrise-bakery.com'
const SITE_B_LABEL = 'www.portland-artisan-bread.com'

const DEMO_COMPARISON = {
  seo: { siteA: 52, siteB: 71 },
  aeo: { siteA: 38, siteB: 62 },
  geo: { siteA: 27, siteB: 55 },
  winner: 'siteB',
  winnerVerdict: `${SITE_B_LABEL} dominates across all three dimensions. With a 19-point SEO lead, 24-point AEO advantage, and 28-point GEO gap, the competitor has built a significantly stronger digital presence. Their structured content, FAQ sections, and robust backlink profile give them clear visibility in both traditional search and AI-powered engines. Sunrise Bakery needs urgent improvements in schema markup, content depth, and link building to close this gap.`,
}

const DEMO_BACKLINKS = {
  siteA: {
    metrics: { domain: 'sunrise-bakery.com', domainAuthority: 12, pageAuthority: 8, linkingDomains: 2, totalBacklinks: 3, spamScore: 5 },
    backlinks: [
      { sourceDomain: 'portlandfoodguide.com', sourceUrl: 'https://portlandfoodguide.com/best-bakeries', anchorText: 'Sunrise Bakery', domainAuthority: 35, isDofollow: true },
      { sourceDomain: 'yelp.com', sourceUrl: 'https://yelp.com/biz/sunrise-bakery-portland', anchorText: 'sunrise-bakery.com', domainAuthority: 94, isDofollow: false },
      { sourceDomain: 'localchamber.org', sourceUrl: 'https://localchamber.org/members', anchorText: 'Visit Website', domainAuthority: 28, isDofollow: true },
    ],
  },
  siteB: {
    metrics: { domain: 'portland-artisan-bread.com', domainAuthority: 38, pageAuthority: 32, linkingDomains: 18, totalBacklinks: 47, spamScore: 3 },
    backlinks: [
      { sourceDomain: 'eater.com', sourceUrl: 'https://eater.com/portland/best-bread', anchorText: 'Portland Artisan Bread', domainAuthority: 89, isDofollow: true },
      { sourceDomain: 'oregonlive.com', sourceUrl: 'https://oregonlive.com/food/best-bakeries-portland', anchorText: 'artisan bread shop', domainAuthority: 82, isDofollow: true },
      { sourceDomain: 'portlandfoodguide.com', sourceUrl: 'https://portlandfoodguide.com/best-bakeries', anchorText: 'Portland Artisan Bread', domainAuthority: 35, isDofollow: true },
      { sourceDomain: 'pdxmonthly.com', sourceUrl: 'https://pdxmonthly.com/eat-drink/bakeries', anchorText: 'best sourdough in Portland', domainAuthority: 62, isDofollow: true },
      { sourceDomain: 'tripadvisor.com', sourceUrl: 'https://tripadvisor.com/portland-bakeries', anchorText: 'Portland Artisan Bread', domainAuthority: 93, isDofollow: false },
      { sourceDomain: 'yelp.com', sourceUrl: 'https://yelp.com/biz/portland-artisan-bread', anchorText: 'portland-artisan-bread.com', domainAuthority: 94, isDofollow: false },
    ],
  },
  linkGap: [
    { domain: 'eater.com', url: 'https://eater.com/portland/best-bread', da: 89 },
    { domain: 'oregonlive.com', url: 'https://oregonlive.com/food/best-bakeries-portland', da: 82 },
    { domain: 'pdxmonthly.com', url: 'https://pdxmonthly.com/eat-drink/bakeries', da: 62 },
    { domain: 'tripadvisor.com', url: 'https://tripadvisor.com/portland-bakeries', da: 93 },
  ],
  mozEnabled: true,
}

const DEMO_EXPERT_ANALYSIS = {
  bottomLine: `Portland Artisan Bread outperforms Sunrise Bakery across every dimension — SEO (71 vs 52), AEO (62 vs 38), and GEO (55 vs 27). The competitor's Domain Authority of 38 vs your 12 reflects a much stronger backlink profile with 47 links from 18 domains compared to your 3 links from 2 domains.`,
  keyInsight: `The biggest gap is in GEO (28 points). Portland Artisan Bread has built strong citation signals through food blog features, local press coverage, and directory listings that make AI engines confident in recommending them. Sunrise Bakery is nearly invisible to AI assistants.`,
  priorityAction: 'Build local citations and earn backlinks from Portland food blogs to close the authority gap',
}

const DEMO_RECOMMENDATIONS = [
  {
    title: 'Add LocalBusiness Schema Markup',
    category: 'seo',
    roi: 'CRITICAL',
    effort: 1,
    description: 'Your competitor has full schema markup while you have none. This is the fastest way to improve visibility in both search and AI engines.',
    howToFix: 'Install Rank Math or Yoast SEO plugin and configure LocalBusiness > Bakery schema with your business name, address, hours, and contact info.',
    steps: [{ step: 1, title: 'How To Fix', description: 'Install Rank Math or Yoast SEO plugin and configure LocalBusiness > Bakery schema with your business name, address, hours, and contact info.' }],
    platform: 'WordPress',
    impactedScores: 'SEO +8, AEO +5',
  },
  {
    title: 'Create FAQ Section to Match Competitor',
    category: 'aeo',
    roi: 'CRITICAL',
    effort: 2,
    description: 'Portland Artisan Bread has a comprehensive FAQ section that AI assistants cite frequently. You have no FAQ content at all.',
    howToFix: 'Add 8-10 Q&A pairs covering ordering, ingredients, dietary options, and delivery. Wrap in FAQPage schema.',
    steps: [{ step: 1, title: 'How To Fix', description: 'Add 8-10 Q&A pairs covering ordering, ingredients, dietary options, and delivery. Wrap in FAQPage schema.' }],
    platform: 'WordPress',
    impactedScores: 'AEO +12, SEO +3',
  },
  {
    title: 'Build Local Citation Profile',
    category: 'geo',
    roi: 'CRITICAL',
    effort: 3,
    description: 'With only 3 backlinks vs their 47, your authority gap is massive. AI engines use citation signals to determine which businesses to recommend.',
    howToFix: 'Claim Google Business Profile, submit to Yelp, TripAdvisor, Foursquare, and 10+ local Portland food directories. Reach out to food bloggers for reviews.',
    steps: [{ step: 1, title: 'How To Fix', description: 'Claim Google Business Profile, submit to Yelp, TripAdvisor, Foursquare, and 10+ local Portland food directories. Reach out to food bloggers for reviews.' }],
    platform: 'Any',
    impactedScores: 'GEO +15, SEO +5',
  },
  {
    title: 'Expand Content Depth to 800+ Words',
    category: 'seo',
    roi: 'HIGH',
    effort: 2,
    description: 'Your competitor has rich, detailed content while your page is thin at 487 words. Search engines and AI favor comprehensive content.',
    howToFix: 'Add service descriptions, local context, customer testimonials, and ingredient sourcing stories. Target 800-1200 words.',
    steps: [{ step: 1, title: 'How To Fix', description: 'Add service descriptions, local context, customer testimonials, and ingredient sourcing stories. Target 800-1200 words.' }],
    platform: 'WordPress',
    impactedScores: 'SEO +6, AEO +4',
  },
  {
    title: 'Earn Press Coverage from Local Media',
    category: 'geo',
    roi: 'HIGH',
    effort: 3,
    description: 'Portland Artisan Bread has links from Eater, OregonLive, and PDX Monthly. These high-DA sites are the primary reason for their authority advantage.',
    howToFix: 'Pitch a story angle to local food journalists — seasonal menu launch, community event, or unique ingredient sourcing. Offer tastings for food bloggers.',
    steps: [{ step: 1, title: 'How To Fix', description: 'Pitch a story angle to local food journalists — seasonal menu launch, community event, or unique ingredient sourcing. Offer tastings for food bloggers.' }],
    platform: 'Any',
    impactedScores: 'GEO +10, SEO +8',
  },
  {
    title: 'Add How-To Content for AI Assistants',
    category: 'aeo',
    roi: 'MEDIUM',
    effort: 1,
    description: 'How-to content is highly cited by AI assistants. Your competitor has recipe snippets and ordering guides that get featured in AI responses.',
    howToFix: 'Create "How to Order a Custom Cake" and simple recipe pages with HowTo schema markup.',
    steps: [{ step: 1, title: 'How To Fix', description: 'Create "How to Order a Custom Cake" and simple recipe pages with HowTo schema markup.' }],
    platform: 'WordPress',
    impactedScores: 'AEO +5',
  },
]

const DEMO_STOLEN_OPPORTUNITIES = [
  { category: 'seo', title: 'Rich Snippet Dominance', description: 'Portland Artisan Bread appears in rich results for "best bakery Portland" with star ratings, hours, and price range — all powered by their complete schema markup.' },
  { category: 'aeo', title: 'AI Assistant Recommendations', description: 'When users ask ChatGPT or Google SGE for bakery recommendations in Portland, the competitor is consistently cited thanks to their FAQ content and strong citation profile.' },
  { category: 'geo', title: 'Food Blog Features', description: 'The competitor has been featured on Eater, OregonLive, and PDX Monthly — earning high-authority backlinks that boost their visibility across all AI platforms.' },
  { category: 'seo', title: 'Local Pack Visibility', description: 'Portland Artisan Bread consistently appears in Google\'s Local 3-Pack for bakery-related searches, driven by their complete Google Business Profile and review volume.' },
]

const DEMO_STRATEGIC_GAPS = [
  'No structured data markup — competitor has full LocalBusiness + FAQPage + HowTo schema',
  'Domain Authority gap of 26 points (12 vs 38) — need 15+ quality backlinks to close',
  'Zero food blog or press coverage vs competitor\'s 4 high-DA media mentions',
  'No FAQ or how-to content — competitor\'s Q&A section drives 40% of their AI citations',
  'Thin content (487 words) vs competitor\'s comprehensive 1,200+ word pages',
]

// ─── Glowing Radial Ring (SVG) ───────────────────────────────────────────────

function BattleRing({ value, color, glowColor, size = 130 }: { value: number; color: string; glowColor: string; size?: number }) {
  const sw = 10
  const r = (size - sw) / 2
  const circ = r * 2 * Math.PI
  const pct = Math.min(value / 100, 1)
  const offset = circ - pct * circ
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} className="stroke-white/[0.06]" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} strokeLinecap="round"
          stroke={color} style={{ strokeDasharray: circ, strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums text-white">{Math.round(value)}</span>
        <span className="text-[9px] uppercase font-bold text-white/40">/100</span>
      </div>
    </div>
  )
}

// ─── Demo Page Component ───────────────────────────────────────────────────────

export default function DemoBattleModePage() {
  const [showLinkGap, setShowLinkGap] = useState(false)
  const [strategyFilter, setStrategyFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL')

  const blA = DEMO_BACKLINKS.siteA
  const blB = DEMO_BACKLINKS.siteB
  const linkGap = DEMO_BACKLINKS.linkGap

  const recs = DEMO_RECOMMENDATIONS
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
    <DemoShell>
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-12">

          {/* ═══ DEMO BANNER ═══ */}
          <div className="rounded-lg border-2 border-[#BC13FE]/40 bg-[#BC13FE]/5 px-4 py-3 flex items-center justify-between gap-3 flex-wrap mb-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#BC13FE] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5">Interactive Demo</Badge>
              <p className="text-sm text-white/60">This is a demo duel: <span className="font-bold text-[#00e5ff]">{SITE_A_LABEL}</span> vs <span className="font-bold text-[#fe3f8c]">{SITE_B_LABEL}</span></p>
            </div>
            <Link href="/signup" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-xs transition-colors">
              Get Real Results <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                  <Swords className="h-6 w-6 text-[#00e5ff]" />
                  Competitor Duel
                </h1>
                <p className="text-sm text-white/60 mt-1.5">Two sites enter. One dominates.</p>
              </div>
            </div>
          </div>

          {/* ── RESULTS ── */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Score Duel Rings (SEO + AEO + GEO + DA) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'SEO', data: DEMO_COMPARISON.seo, icon: <Search className="h-3.5 w-3.5" />, learnMoreTerm: 'aeo', colorA: '#00e5ff', colorB: '#fe3f8c' },
                { label: 'AEO', data: DEMO_COMPARISON.aeo, icon: <Sparkles className="h-3.5 w-3.5" />, learnMoreTerm: 'aeo', colorA: '#00e5ff', colorB: '#fe3f8c' },
                { label: 'GEO', data: DEMO_COMPARISON.geo, icon: <Globe className="h-3.5 w-3.5" />, learnMoreTerm: 'geo', colorA: '#00e5ff', colorB: '#fe3f8c' },
                { label: 'Domain Authority', data: { siteA: blA.metrics.domainAuthority, siteB: blB.metrics.domainAuthority }, icon: <Link2 className="h-3.5 w-3.5" />, learnMoreTerm: 'domain-authority', colorA: '#00e5ff', colorB: '#fe3f8c' },
              ].map((battle) => {
                const scoreA = battle.data.siteA
                const scoreB = battle.data.siteB
                return (
                  <div key={battle.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-black uppercase tracking-widest text-white/80 flex items-center gap-1.5">{battle.icon}{battle.label}</span>
                        <LearnMore term={battle.learnMoreTerm} />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <BattleRing value={scoreA} color={battle.colorA} glowColor={`${battle.colorA}66`} size={100} />
                          <span className="text-[9px] font-bold text-[#00e5ff]/70 uppercase truncate max-w-[80px]">{SITE_A_LABEL}</span>
                        </div>
                        <Swords className="h-4 w-4 text-white/10" />
                        <div className="flex flex-col items-center gap-1">
                          <BattleRing value={scoreB} color={battle.colorB} glowColor={`${battle.colorB}66`} size={100} />
                          <span className="text-[9px] font-bold text-[#fe3f8c]/70 uppercase truncate max-w-[80px]">{SITE_B_LABEL}</span>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#00e5ff] rounded-l-full transition-all duration-700" style={{ width: `${(scoreA / (scoreA + scoreB || 1)) * 100}%` }} />
                        <div className="h-full bg-[#fe3f8c] rounded-r-full transition-all duration-700" style={{ width: `${(scoreB / (scoreA + scoreB || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Expert Analysis ── */}
            <ExpertAnalysis analysis={DEMO_EXPERT_ANALYSIS} label="Expert Analysis" tooltip="AI-generated analysis of your competitive position, including strengths, opportunities, and specific next steps based on all scan data." />

            {/* ── Counter-Strategies ── */}
            <Card className="border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#00e5ff]" />
                  <CardTitle className="text-white">Counter-Strategies</CardTitle>
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
                      className={cn('px-3 py-1 rounded-lg text-xs font-bold transition-all border',
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
                      steps={rec.steps || [{ step: 1, title: 'How To Fix', description: rec.howToFix || rec.fix || rec.description }]}
                      code={rec.codeSnippet} platform={rec.platform || 'Any'} estimatedTime={`${rec.effort || 1}h`}
                      difficulty={rec.effort >= 3 ? 'difficult' : rec.effort >= 2 ? 'moderate' : 'easy'}
                      impact={rec.roi === 'CRITICAL' ? 'high' : rec.roi === 'HIGH' ? 'medium' : 'low'}
                      impactedScores={rec.impactedScores}
                      whyItMatters={rec.description} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Backlink Profile Comparison ── */}
            <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.02] backdrop-blur-xl p-5">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Link2 className="h-4 w-4 text-green-400" /> Backlink Profile Comparison <LearnMore term="backlinks" />
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="text-[#00e5ff]">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/50">{SITE_A_LABEL}</p>
                  <div className="space-y-3">
                    <div><p className="text-2xl font-black">{blA.metrics.domainAuthority}</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Domain Authority <LearnMore term="domain-authority" /></p></div>
                    <div><p className="text-lg font-black">{blA.metrics.totalBacklinks.toLocaleString()}</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Total Backlinks <LearnMore term="backlinks" /></p></div>
                    <div><p className="text-lg font-black">{blA.metrics.linkingDomains.toLocaleString()}</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Linking Domains <LearnMore term="backlinks" /></p></div>
                    <div><p className={cn('text-lg font-black', blA.metrics.spamScore > 30 ? 'text-red-400' : 'text-green-400')}>{blA.metrics.spamScore}%</p><p className="text-xs text-white/40 flex items-center justify-center gap-1">Spam Score <LearnMore term="spam-score" /></p></div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 text-white/20">
                  <Swords className="h-6 w-6" />
                  <span className="text-xs font-black italic">VS</span>
                </div>
                <div className="text-[#fe3f8c]">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/50">{SITE_B_LABEL}</p>
                  <div className="space-y-3">
                    <div><p className="text-2xl font-black">{blB.metrics.domainAuthority}</p><p className="text-xs text-white/40">Domain Authority</p></div>
                    <div><p className="text-lg font-black">{blB.metrics.totalBacklinks.toLocaleString()}</p><p className="text-xs text-white/40">Total Backlinks</p></div>
                    <div><p className="text-lg font-black">{blB.metrics.linkingDomains.toLocaleString()}</p><p className="text-xs text-white/40">Linking Domains</p></div>
                    <div><p className={cn('text-lg font-black', blB.metrics.spamScore > 30 ? 'text-red-400' : 'text-green-400')}>{blB.metrics.spamScore}%</p><p className="text-xs text-white/40">Spam Score</p></div>
                  </div>
                </div>
              </div>

              {/* Top Referring Domains Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                {/* Site A Backlinks */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="px-4 py-3">
                    <span className="text-xs font-bold text-[#00e5ff]">Top Referring Domains — {SITE_A_LABEL} ({blA.backlinks.length})</span>
                  </div>
                  <div className="px-4 pb-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold pb-1 border-b border-white/[0.04]">
                      <span className="w-8">DA</span>
                      <span className="flex-1">Linking Domain</span>
                      <span>Type</span>
                    </div>
                    {blA.backlinks.map((bl: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs border-b border-white/[0.04] pb-2 last:border-0">
                        <span className={cn('font-black tabular-nums w-8', bl.domainAuthority >= 50 ? 'text-green-400' : bl.domainAuthority >= 20 ? 'text-yellow-400' : 'text-white/40')}>{bl.domainAuthority}</span>
                        <a href={bl.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 truncate flex-1 hover:text-[#00e5ff] hover:underline transition-colors">{bl.sourceDomain}</a>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', bl.isDofollow ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.06] text-white/30')}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Site B Backlinks */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="px-4 py-3">
                    <span className="text-xs font-bold text-[#fe3f8c]">Top Referring Domains — {SITE_B_LABEL} ({blB.backlinks.length})</span>
                  </div>
                  <div className="px-4 pb-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold pb-1 border-b border-white/[0.04]">
                      <span className="w-8">DA</span>
                      <span className="flex-1">Linking Domain</span>
                      <span>Type</span>
                    </div>
                    {blB.backlinks.map((bl: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs border-b border-white/[0.04] pb-2 last:border-0">
                        <span className={cn('font-black tabular-nums w-8', bl.domainAuthority >= 50 ? 'text-green-400' : bl.domainAuthority >= 20 ? 'text-yellow-400' : 'text-white/40')}>{bl.domainAuthority}</span>
                        <a href={bl.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 truncate flex-1 hover:text-[#fe3f8c] hover:underline transition-colors">{bl.sourceDomain}</a>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', bl.isDofollow ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.06] text-white/30')}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Link Gap */}
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
                        <span className={cn('font-black tabular-nums w-8', g.da >= 50 ? 'text-green-400' : g.da >= 20 ? 'text-yellow-400' : 'text-white/40')}>{g.da}</span>
                        <a href={g.url} target="_blank" rel="noopener noreferrer" className="text-white/70 truncate flex-1 hover:text-[#BC13FE] hover:underline transition-colors">{g.domain}</a>
                        <span className="text-[10px] text-[#BC13FE]/60">Opportunity</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Link Building Intelligence ── */}
            <div className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/[0.02] backdrop-blur-xl p-5">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Link2 className="h-4 w-4 text-green-400" /> Link Building Intelligence <LearnMore term="backlinks" />
              </h3>

              {/* DA Assessment */}
              <div className="rounded-lg p-4 mb-4 border border-red-500/30 bg-red-500/10">
                <p className="text-sm font-bold mb-2 text-red-400">
                  Domain Authority {blA.metrics.domainAuthority}/100 — Your site needs more high quality backlinks
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Backlinks are like votes of confidence from other websites. The more reputable sites that link to yours, the more Google trusts you and the higher you rank. Without them, even great content stays invisible.
                </p>
              </div>

              {/* Competitor Gap */}
              <div className="rounded-lg p-4 mb-4 border border-[#BC13FE]/30 bg-[#BC13FE]/10">
                <p className="text-sm font-bold text-[#BC13FE] mb-1">
                  Your competitor is {blB.metrics.domainAuthority - blA.metrics.domainAuthority} points ahead
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  {SITE_B_LABEL} has a Domain Authority of {blB.metrics.domainAuthority} compared to your {blA.metrics.domainAuthority}.
                  They have {blB.metrics.linkingDomains.toLocaleString()} websites linking to them vs your {blA.metrics.linkingDomains.toLocaleString()}. Building quality backlinks is the fastest way to close this gap.
                </p>
              </div>

              {/* Simple Actionable Tactics */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">What You Can Do</p>
                {[
                  { icon: '📍', title: 'Claim your free listings', desc: 'Make sure you\'re listed on Google Business Profile, Yelp, and any directories specific to your industry. These are free and give your site an immediate authority boost.' },
                  { icon: '🤝', title: 'Ask people you already work with', desc: 'Your vendors, suppliers, partners, and local business associations already know you. Ask them to add a link to your website on theirs — most will be happy to.' },
                  { icon: '📝', title: 'Create something worth sharing', desc: 'Write a helpful guide, build a local resource page, or answer common questions in your industry. Useful content naturally attracts links from other websites over time.' },
                  { icon: '🎯', title: `${linkGap.length} websites link to your competitor but not you`, desc: 'These sites already link to businesses in your space — they\'re your best opportunities. Reaching out to them is the fastest way to earn quality backlinks.' },
                ].map((tactic, i) => (
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

            {/* ── Stolen Opportunities & Strategic Gaps ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#BC13FE]/20 bg-[#BC13FE]/[0.03] backdrop-blur-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#BC13FE]/10">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#BC13FE]" /> Stolen Opportunities
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Where <span className="text-[#fe3f8c] font-bold">{SITE_B_LABEL}</span> is winning</p>
                </div>
                <div className="p-6 space-y-3">
                  {DEMO_STOLEN_OPPORTUNITIES.map((opp, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3">
                      <div className={cn('h-9 w-9 shrink-0 rounded-lg flex items-center justify-center',
                        opp.category === 'seo' ? 'bg-[#00e5ff]/10 text-[#00e5ff]' : opp.category === 'aeo' ? 'bg-[#BC13FE]/10 text-[#BC13FE]' : 'bg-[#fe3f8c]/10 text-[#fe3f8c]'
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

              <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] backdrop-blur-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-green-500/10">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-green-400" /> Critical Strategic Gaps
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Weaknesses the competitor is exploiting</p>
                </div>
                <div className="p-6 space-y-3">
                  {DEMO_STRATEGIC_GAPS.map((gap, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-white/60 border-b border-white/[0.04] pb-3 last:border-0 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-400 shrink-0" />
                      {gap}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <WhatsNextCard steps={[
            NEXT_STEPS.proAudit('Now you know the gaps — get detailed fix instructions for your site'),
            NEXT_STEPS.keywordArena('See how you rank against all competitors, not just one'),
          ]} />
        </div>
      </main>
    </DemoShell>
  )
}
