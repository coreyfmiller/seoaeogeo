'use client'

import { CheckCircle2, Zap, ArrowRight, Shield, Sparkles, Layers, Bot, FileText, Code, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'

const features = [
  { icon: Bot, title: "AI-Powered Analysis", desc: "Full Gemini AI sitewide intelligence with deep content analysis" },
  { icon: FileText, title: "Step-by-Step Fix Instructions", desc: "Detailed explanations of why each issue matters and how to fix it" },
  { icon: Code, title: "Copy-Paste Code Examples", desc: "Ready-to-implement code snippets for every fix" },
  { icon: Layers, title: "Deep Crawl (50 Pages)", desc: "Comprehensive multi-page site analysis with page comparison" },
  { icon: Sparkles, title: "Competitive Intelligence", desc: "Compare your site against competitors with gap analysis" },
  { icon: BarChart3, title: "ROI & Priority Scoring", desc: "Know which fixes deliver the biggest impact first" },
  { icon: Shield, title: "Platform-Specific Guides", desc: "WordPress, Shopify, and custom platform implementation guides" },
  { icon: FileText, title: "Export & Copy Reports", desc: "Download full audit reports or copy to clipboard" },
]

const plans = [
  {
    name: "Starter",
    price: "$5",
    period: "",
    desc: "For individual site owners",
    highlights: ["5 Pro Audits", "AI fix instructions with code examples", "Export reports"],
    cta: "Go Pro",
    popular: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "",
    desc: "For freelancers and consultants",
    highlights: ["20 Pro Audits", "10 Deep Crawls (up to 50 pages)", "10 Competitive Intelligence scans", "AI fix instructions with code examples", "Priority scoring & ROI", "Platform-specific guides", "Export reports"],
    cta: "Go Pro",
    popular: true,
  },
  {
    name: "Agency",
    price: "$50",
    period: "",
    desc: "For growing agencies",
    highlights: ["60 Pro Audits", "50 Deep Crawls (up to 50 pages)", "25 Competitive Intelligence scans", "AI fix instructions with code examples", "Priority scoring & ROI", "Platform-specific guides", "White-label reports", "Export reports", "Priority support"],
    cta: "Go Pro",
    popular: false,
  },
  {
    name: "Agency+",
    price: "$100",
    period: "",
    desc: "For high-volume professionals",
    highlights: ["140 Pro Audits", "100 Deep Crawls (up to 50 pages)", "50 Competitive Intelligence scans", "AI fix instructions with code examples", "Priority scoring & ROI", "Platform-specific guides", "White-label reports", "Export reports", "Scan history & snapshots", "Priority support"],
    cta: "Go Pro",
    popular: false,
  },
]

export default function ProPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header apiStatus="idle" />
        <main className="flex-1 overflow-y-auto px-6 pt-6">
          <div className="max-w-5xl mx-auto space-y-10 pb-6">

            {/* Hero */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-geo/10 text-geo text-sm font-bold border border-geo/20">
                <Zap className="h-4 w-4" />
                UPGRADE TO PRO
              </div>
              <h1 className="text-4xl font-bold">Stop Guessing. Start Fixing.</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get AI-powered fix instructions, copy-paste code, and deep multi-page crawling. Everything you need to actually improve your rankings.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map(f => (
                <div key={f.title} className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-2">
                  <f.icon className="h-5 w-5 text-geo" />
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map(plan => (
                <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-geo shadow-lg shadow-geo/10' : 'border-border/50'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-geo text-white text-xs font-bold">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <ul className="space-y-2 flex-1">
                      {plan.highlights.map(h => (
                        <li key={h} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      plan.popular
                        ? 'bg-geo hover:bg-geo/90 text-white shadow-md'
                        : 'border border-border hover:border-geo/50 hover:bg-geo/5'
                    }`}>
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Compare Plans */}
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-center">Compare Plans</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 font-bold text-muted-foreground w-[200px]">Feature</th>
                        <th className="text-center py-3 px-3 font-bold text-muted-foreground">Free</th>
                        <th className="text-center py-3 px-3 font-bold">Starter</th>
                        <th className="text-center py-3 px-3 font-bold text-geo bg-geo/5 border-x border-geo/20">Pro</th>
                        <th className="text-center py-3 px-3 font-bold">Agency</th>
                        <th className="text-center py-3 px-3 font-bold">Agency+</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["SEO / AEO / GEO Scores", "✓", "✓", "✓", "✓", "✓"],
                        ["Quick Health Check", "✓", "✓", "✓", "✓", "✓"],
                        ["Key Metrics Strip", "✓", "✓", "✓", "✓", "✓"],
                        ["Pro Audits", "—", "5", "20", "60", "140"],
                        ["AI Fix Instructions", "—", "✓", "✓", "✓", "✓"],
                        ["Copy-Paste Code", "—", "✓", "✓", "✓", "✓"],
                        ["Export Reports", "—", "✓", "✓", "✓", "✓"],
                        ["Deep Crawls (50 pages)", "—", "—", "10", "50", "100"],
                        ["Competitive Intelligence", "—", "—", "10", "25", "50"],
                        ["Priority Scoring & ROI", "—", "—", "✓", "✓", "✓"],
                        ["Platform Guides", "—", "—", "✓", "✓", "✓"],
                        ["White-Label Reports", "—", "—", "—", "✓", "✓"],
                        ["Scan History & Snapshots", "—", "—", "—", "—", "✓"],
                        ["Priority Support", "—", "—", "—", "✓", "✓"],
                      ].map(([feature, free, starter, pro, agency, agencyPlus], i) => (
                        <tr key={feature} className={`border-b border-border/20 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                          <td className="py-2.5 px-4 font-medium">{feature}</td>
                          {[free, starter, pro, agency, agencyPlus].map((val, j) => {
                            const isPro = j === 2
                            const isCheck = val === '✓'
                            const isDash = val === '—'
                            const isNumber = !isCheck && !isDash
                            return (
                              <td key={j} className={`py-2.5 px-3 text-center ${isPro ? 'bg-geo/5 border-x border-geo/20' : ''}`}>
                                {isCheck && <CheckCircle2 className={`h-4 w-4 mx-auto ${isPro ? 'text-geo' : 'text-green-600'}`} />}
                                {isDash && <span className="text-muted-foreground/40">—</span>}
                                {isNumber && <span className={`font-bold ${isPro ? 'text-geo' : 'text-foreground'}`}>{val}</span>}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
