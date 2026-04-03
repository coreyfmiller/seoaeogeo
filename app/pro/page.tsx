'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, ArrowRight, Shield, Sparkles, Layers, Bot, FileText, Code, BarChart3, Loader2, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

const features = [
  { icon: Bot, title: "AI-Powered Analysis", desc: "Full Gemini AI sitewide intelligence with deep content analysis" },
  { icon: FileText, title: "Step-by-Step Fix Instructions", desc: "Detailed explanations of why each issue matters and how to fix it" },
  { icon: Code, title: "Schema Code Generation", desc: "Auto-generated JSON-LD schema markup tailored to your site type" },
  { icon: Layers, title: "Deep Scan (up to 50 Pages)", desc: "Comprehensive multi-page site analysis with page comparison" },
  { icon: Sparkles, title: "Competitor Duel", desc: "Compare your site against competitors with gap analysis" },
  { icon: BarChart3, title: "ROI & Priority Scoring", desc: "Know which fixes deliver the biggest impact first" },
  { icon: Shield, title: "Platform-Specific Guides", desc: "WordPress, Shopify, Wix, and more — tailored fix instructions" },
  { icon: FileText, title: "Export & Copy Reports", desc: "Download full audit reports or copy to clipboard" },
]

const creditPacks = [
  {
    name: "Starter",
    packId: "credits_200",
    price: "$20",
    credits: 200,
    perCredit: "$0.10",
    examples: ["20 Pro Audits", "or 8 Deep Scans (5 pages)", "or 10 Duels", "or a mix of all three"],
    cta: "Buy 200 Credits",
    popular: false,
  },
  {
    name: "Growth",
    packId: "credits_600",
    price: "$50",
    credits: 600,
    perCredit: "$0.083",
    examples: ["60 Pro Audits", "or 24 Deep Scans (5 pages)", "or 30 Duels", "or a mix of all three"],
    cta: "Buy 600 Credits",
    popular: true,
  },
  {
    name: "Scale",
    packId: "credits_1500",
    price: "$100",
    credits: 1500,
    perCredit: "$0.067",
    examples: ["150 Pro Audits", "or 60 Deep Scans (5 pages)", "or 75 Duels", "or a mix of all three"],
    cta: "Buy 1,500 Credits",
    popular: false,
  },
]

const creditCosts = [
  { action: "Pro Audit", cost: "10 credits", note: "Single page AI-powered audit" },
  { action: "Deep Scan", cost: "25 or 50 credits", note: "5 pages = 25 credits, 10 pages = 50 credits" },
  { action: "Competitor Duel", cost: "20 credits", note: "Head-to-head comparison of two sites" },
  { action: "Keyword Arena", cost: "5 credits/site", note: "Score top-ranking sites for any keyword" },
]

export default function ProPage() {
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
        window.location.href = '/login?redirect=/pro'
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
          <div className="max-w-5xl mx-auto space-y-10 pb-6">

            {/* Hero */}
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] text-sm font-bold border border-[#00e5ff]/20">
                <Coins className="h-4 w-4" />
                BUY CREDITS
              </div>
              <h1 className="text-4xl font-bold">Stop Guessing. Start Fixing.</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ChatGPT, Perplexity, and Gemini don't crawl your site — they read it and decide whether to cite you. Duelly uses the same AI to audit your pages, so you see exactly what they see.
              </p>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Buy credits once, use them however you want. No subscriptions, no plans — just credits that never expire.
              </p>
            </div>

            {/* Credit Pack Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {creditPacks.map(pack => (
                <Card key={pack.name} className={`relative flex flex-col ${pack.popular ? 'border-[#00e5ff] shadow-lg shadow-[#00e5ff]/10' : 'border-border/50'}`}>
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00e5ff] text-white text-xs font-bold">
                      Best Value
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">{pack.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-5xl font-black">{pack.price}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#00e5ff] mt-2">{pack.credits.toLocaleString()} credits</p>
                    <p className="text-xs text-muted-foreground mt-1">{pack.perCredit} per credit • never expire</p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <ul className="space-y-2 flex-1">
                      {pack.examples.map(ex => (
                        <li key={ex} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#00e5ff] shrink-0" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleCheckout(pack.packId)}
                      disabled={loadingPack !== null}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                        pack.popular
                          ? 'bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white shadow-md'
                          : 'border border-border hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/5'
                      }`}
                    >
                      {loadingPack === pack.packId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {pack.cta}
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
                  Credit Costs
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">Use your credits on any scan type — mix and match however you want</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
