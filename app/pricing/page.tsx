'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, ArrowRight, Shield, Sparkles, Layers, Bot, FileText, Code, BarChart3, Loader2, Coins, Crown, Rocket, Clock, Infinity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

const features = [
  { icon: Bot, title: "AI-Powered Analysis", desc: "Gemini AI evaluates your content the same way ChatGPT and Perplexity decide whether to cite you" },
  { icon: FileText, title: "Step-by-Step Fixes", desc: "Platform-specific instructions for WordPress, Shopify, Wix, and more — not generic advice" },
  { icon: Code, title: "Schema Generation", desc: "Auto-generated JSON-LD markup tailored to your site type, ready to paste" },
  { icon: Layers, title: "Multi-Page Deep Scan", desc: "Crawl up to 50 pages, find duplicate titles, missing schemas, and sitewide issues" },
  { icon: Sparkles, title: "Competitor Intelligence", desc: "Head-to-head duels with backlink analysis, gap detection, and counter-strategies" },
  { icon: BarChart3, title: "Priority Scoring", desc: "Every fix ranked by impact so you know what to tackle first" },
]

const tiers = [
  {
    name: "The AI Launch Pack",
    packId: "launch",
    price: "$79.99",
    credits: 180,
    icon: Rocket,
    description: "Audit your homepage and top landing pages, scope out the competition, and see exactly what AI engines think of your site. Enough firepower to fix your core pages and start getting cited.",
    lineup: [
      "2 Pro Analyses — 20 Credits",
      "2 Deep Scans (5-page) — 60 Credits",
      "5 Competitor Duels — 50 Credits",
      "5 Keyword Arenas — 50 Credits",
    ],
    bestFor: 'Small business owners auditing their core pages for AI visibility.',
    cta: "Get the Launch Pack",
    popular: true,
    badge: "Most Popular",
    premiumFeatures: null,
    bonusNote: null,
  },
  {
    name: "The Visibility Growth Bundle",
    packId: "growth",
    price: "$149.99",
    credits: 550,
    icon: Zap,
    description: "Go beyond the basics. Audit every service page, track your blog content, and run competitive intelligence across your market. Bonus credits give you room to dig deeper.",
    lineup: [
      "6 Pro Analyses — 60 Credits",
      "6 Deep Scans (5-page) — 180 Credits",
      "10 Competitor Duels — 100 Credits",
      "15 Keyword Arenas — 150 Credits",
      "+60 Bonus Credits",
    ],
    bonusNote: "Includes 60 Bonus Credits",
    bestFor: "Growing brands with multiple service pages or a consistent blog.",
    cta: "Get the Growth Bundle",
    popular: false,
    badge: "Best Value",
    premiumFeatures: null,
  },
  {
    name: "The Authority Agency Suite",
    packId: "authority",
    price: "$299.99",
    credits: 1450,
    icon: Crown,
    description: "Built for consultants and agencies running audits across client portfolios. Our best per-credit rate with the biggest bonus. Audit entire client sites without watching your balance.",
    lineup: [
      "25 Pro Analyses — 250 Credits",
      "25 Deep Scans (5-page) — 750 Credits",
      "15 Competitor Duels — 150 Credits",
      "15 Keyword Arenas — 150 Credits",
      "+150 Bonus Credits",
    ],
    bonusNote: "Includes 150 Bonus Credits",
    bestFor: "SEO consultants and agencies managing multiple client sites.",
    cta: "Get the Agency Suite",
    popular: false,
    badge: "For Agencies",
    premiumFeatures: null,
  },
]

const creditCosts = [
  { action: "Pro Analysis", cost: "10 credits", note: "Single page AI deep dive with fix instructions" },
  { action: "Deep Scan", cost: "30 credits", note: "5-page crawl with sitewide intelligence" },
  { action: "Competitor Duel", cost: "10 credits", note: "Head-to-head comparison with backlink analysis" },
  { action: "Keyword Arena", cost: "10 credits/site", note: "Score top-ranking sites for any keyword" },
]

export default function PricingPage() {
  const [loadingPack, setLoadingPack] = useState<string | null>(null)

  const handleCheckout = async (packId: string) => {
    setLoadingPack(packId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: packId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error === 'Not authenticated') {
        window.location.href = '/login?redirect=/pricing'
      } else {
        console.error('Checkout error:', data.error)
      }
    } catch (err) {
      console.error('Checkout failed:', err)
    } finally {
      setLoadingPack(null)
    }
  }

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />
        <main className="flex-1 px-3 sm:px-6 pt-4 sm:pt-6">
          <div className="max-w-6xl mx-auto space-y-10 pb-6">

            {/* Hero */}
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] text-sm font-bold border border-[#00e5ff]/20">
                <Coins className="h-4 w-4" />
                ONE-TIME CREDIT PACKS
              </div>
              <h1 className="text-4xl font-bold">See What AI Sees. Fix What AI Skips.</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ChatGPT, Perplexity, and Gemini don't crawl your site — they read it and decide whether to cite you.
                Duelly audits your pages with the same AI, so you see exactly what they see.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Infinity className="h-4 w-4 text-[#00e5ff]" /> Credits never expire</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-[#00e5ff]" /> One-time purchase</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#00e5ff]" /> 1 year data retention</span>
              </div>
            </div>

            {/* Tier Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map(tier => (
                <Card key={tier.name} className={`relative flex flex-col ${tier.popular ? 'border-[#00e5ff] shadow-lg shadow-[#00e5ff]/10' : 'border-border/50'}`}>
                  {tier.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold ${
                      tier.popular ? 'bg-[#00e5ff] text-white' : 'bg-muted text-foreground border border-border/50'
                    }`}>
                      {tier.badge}
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <tier.icon className="h-8 w-8 text-[#00e5ff]" />
                    </div>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-4xl font-black">{tier.price}</span>
                      <span className="text-sm text-muted-foreground">one-time</span>
                    </div>
                    <p className="text-2xl font-bold text-[#00e5ff] mt-2">{tier.credits.toLocaleString()} Credits</p>
                    {tier.bonusNote && (
                      <p className="text-xs text-green-400 font-semibold mt-1">{tier.bonusNote}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                    <ul className="space-y-2 flex-1">
                      {tier.lineup.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#00e5ff] shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground italic">{tier.bestFor}</p>
                    <button
                      onClick={() => handleCheckout(tier.packId)}
                      disabled={loadingPack !== null}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                        tier.popular
                          ? 'bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white shadow-md'
                          : 'border border-border hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/5'
                      }`}
                    >
                      {loadingPack === tier.packId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Credit Cost Reference */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Coins className="h-5 w-5 text-[#00e5ff]" />
                  Credit Costs Per Action
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">Use your credits on any tool — mix and match however you want</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {creditCosts.map(item => (
                    <div key={item.action} className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center space-y-1">
                      <p className="text-sm font-bold">{item.action}</p>
                      <p className="text-xl font-black text-[#00e5ff]">{item.cost}</p>
                      <p className="text-[10px] text-muted-foreground">{item.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map(f => (
                <div key={f.title} className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-2">
                  <f.icon className="h-5 w-5 text-[#00e5ff]" />
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </main>
      <PublicFooter />
    </div>
  )
}
