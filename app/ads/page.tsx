import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Target, Zap, Brain, TrendingUp, Eye, Globe, Search, Bot } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'Duelly.ai Ad Variations — Direct Response Ad Copy',
  description: 'Ten high-conversion direct response ad variations for Duelly.ai, the SEO, AEO, and GEO analysis platform built for the post-click era.',
  alternates: { canonical: '/ads' },
}

const ads: {
  id: number
  angle: string
  icon: React.ElementType
  color: string
  hook: string
  transparency: string
  benefit: string
  cta: string
  ctaHref: string
}[] = [
  {
    id: 1,
    angle: 'The Price Comparison',
    icon: Shield,
    color: '#00e5ff',
    hook: 'Stop paying $500 a month for legacy SEO tools that can\'t even see an AI Overview.',
    transparency: 'Duelly.ai is $79.99. We don\'t have a bloated sales team or expensive office space to fund. You pay for the data and the analysis that actually gets you cited by LLMs.',
    benefit: 'Get a full GEO (Generative Engine Optimization) report that shows exactly why Perplexity is recommending your competitor instead of you.',
    cta: 'Get Your First Audit for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 2,
    angle: 'The Anti-Enterprise',
    icon: Zap,
    color: '#BC13FE',
    hook: 'Most AEO tools require a "Demo Call." We just want to show you the data.',
    transparency: 'It is $79.99. No "custom quotes" and no surprise upsells. Just professional grade AI Search analysis for serious builders.',
    benefit: 'Identify the "Information Fragments" on your site that are currently invisible to ChatGPT and Gemini.',
    cta: 'Analyze My Site for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 3,
    angle: 'The Early Adopter',
    icon: Target,
    color: '#fe3f8c',
    hook: 'The land grab for AI Search visibility is happening right now.',
    transparency: 'For $79.99, you get the same GEO insights that top tier agencies are charging thousands for. We are keeping it accessible because we want to be the standard for the new web.',
    benefit: 'Structure your content so it becomes the "Trusted Source" for AI agents across the web.',
    cta: 'Claim Your Authority for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 4,
    angle: 'The Invisible Traffic Leak',
    icon: Eye,
    color: '#f59e0b',
    hook: 'Your Google traffic is dropping and you can\'t figure out why. It\'s not a penalty. It\'s AI Overviews eating your clicks.',
    transparency: 'For $79.99, Duelly.ai shows you exactly which queries AI is answering before users ever reach your site. No monthly subscription. One payment, full clarity.',
    benefit: 'Map every page on your site against AI citation signals. See which pages are being bypassed by ChatGPT, Perplexity, and Google AI Overviews, and get the fix instructions to reclaim that traffic.',
    cta: 'Find My Traffic Leaks for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 5,
    angle: 'The Agency Closer',
    icon: TrendingUp,
    color: '#00e5ff',
    hook: 'Your SEO agency is still reporting on keyword rankings. Meanwhile, AI engines are deciding who gets cited and who gets ignored.',
    transparency: 'Duelly.ai is $79.99. Run the audit yourself and bring the report to your next agency call. If they can\'t explain your AEO and GEO scores, you have your answer.',
    benefit: 'Get a three-pillar audit (SEO, AEO, GEO) that scores your site the way AI search engines actually evaluate it. Platform-specific fix instructions included.',
    cta: 'Audit Before Your Next Agency Call — $79.99',
    ctaHref: '/signup',
  },
  {
    id: 6,
    angle: 'The Competitor Spy',
    icon: Search,
    color: '#BC13FE',
    hook: 'Your competitor just showed up in a ChatGPT answer. You didn\'t. That wasn\'t luck.',
    transparency: '$79.99 gets you a head-to-head Competitor Duel. See their SEO, AEO, and GEO scores side by side with yours. No contracts, no monthly drain on your budget.',
    benefit: 'Duelly crawls both sites, runs AI analysis on both, and delivers a gap report showing exactly what they did right and what you need to change. Backlink data from Moz included.',
    cta: 'Run a Competitor Duel for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 7,
    angle: 'The Small Business Equalizer',
    icon: Globe,
    color: '#fe3f8c',
    hook: 'Enterprise brands have entire teams optimizing for AI search. You have a website and 30 minutes. That\'s enough.',
    transparency: 'Duelly.ai costs $79.99. Not $79.99 per month. One payment. 180 credits. Enough to audit your homepage, your top pages, and your biggest competitor.',
    benefit: 'Every audit includes prioritized fix instructions written for your specific platform. WordPress, Shopify, Wix, Squarespace. Copy the fix, paste it in, move on.',
    cta: 'Level the Playing Field for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 8,
    angle: 'The "Free Tools" Exposé',
    icon: Shield,
    color: '#f59e0b',
    hook: '"Free SEO audit" tools exist to harvest your email and sell you a $200/month subscription. You know this.',
    transparency: 'Duelly.ai is $79.99 upfront. No email drip campaigns. No "upgrade to see your results." You pay, you get the full audit, you own the data.',
    benefit: 'A real AI-powered analysis using Google Gemini. Not a checklist. An actual large language model reading your content and scoring it across SEO, AEO, and GEO. PDF report included.',
    cta: 'Get the Real Audit for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 9,
    angle: 'The Content Creator',
    icon: Brain,
    color: '#00e5ff',
    hook: 'You spent 40 hours writing that pillar post. ChatGPT doesn\'t know it exists.',
    transparency: 'For $79.99, Duelly.ai tells you exactly why. Is your schema missing? Are your entities unclear? Is your content structured in a way AI can parse? You\'ll know in minutes.',
    benefit: 'Get an AEO score that measures your content\'s "citability" by AI engines. Plus specific rewrites and schema markup you can add today to start appearing in AI-generated answers.',
    cta: 'Make My Content Citable for $79.99',
    ctaHref: '/signup',
  },
  {
    id: 10,
    angle: 'The Future-Proofer',
    icon: Sparkles,
    color: '#BC13FE',
    hook: 'Google is putting AI Overviews above every organic result. Perplexity is replacing "let me Google that." The post-click era is not coming. It is here.',
    transparency: 'Duelly.ai is $79.99 because we believe every business deserves to know where they stand in AI search. Not just the ones who can afford enterprise contracts.',
    benefit: 'Audit your entire site across three dimensions: traditional SEO health, Answer Engine readiness (AEO), and Generative Engine visibility (GEO). Walk away with a prioritized action plan and downloadable PDF.',
    cta: 'Future-Proof My Site for $79.99',
    ctaHref: '/signup',
  },
]

export default function AdsPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />

      <article className="max-w-5xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#BC13FE]/10 text-[#BC13FE] text-sm font-bold border border-[#BC13FE]/20 mb-6">
            <Sparkles className="h-4 w-4" />
            DIRECT RESPONSE AD COPY
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
            10 High-Conversion Ad Variations for Duelly.ai
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every ad leads with the <strong className="text-foreground">$79.99 price</strong> as a trust signal.
            Every ad calls out the shift from traditional SEO to AI search.
            Every ad explains exactly what the audit does. No hidden costs. No bait and switch.
          </p>
        </div>

        {/* Ad Cards */}
        <div className="space-y-8">
          {ads.map((ad) => {
            const Icon = ad.icon
            return (
              <section
                key={ad.id}
                className="rounded-2xl border bg-card/30 overflow-hidden"
                style={{ borderColor: `${ad.color}30` }}
              >
                {/* Ad Header */}
                <div
                  className="px-6 py-4 flex items-center gap-3"
                  style={{ background: `${ad.color}08`, borderBottom: `1px solid ${ad.color}20` }}
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ background: `${ad.color}20`, color: ad.color }}
                  >
                    {ad.id}
                  </div>
                  <Icon className="h-5 w-5" style={{ color: ad.color }} />
                  <h2 className="text-lg font-bold">
                    {ad.angle}
                  </h2>
                </div>

                {/* Ad Body */}
                <div className="px-6 py-6 space-y-5">
                  {/* Hook */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">The Hook</p>
                    <p className="text-xl font-black leading-snug">{ad.hook}</p>
                  </div>

                  {/* Transparency */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Price Transparency</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{ad.transparency}</p>
                  </div>

                  {/* Benefit */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">The Mechanical Benefit</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{ad.benefit}</p>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <Link
                      href={ad.ctaHref}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-colors"
                      style={{ background: ad.color }}
                    >
                      {ad.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        {/* Strategy Summary */}
        <section className="mt-16 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 p-8">
          <h2 className="text-2xl font-black mb-4 text-center">Why This Works</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#00e5ff]/20 text-[#00e5ff]">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold mb-1">Price as Trust Signal</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Leading with $79.99 filters for serious intent. It positions Duelly as confident enough in its output to tell you the price before you see the dashboard.
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#BC13FE]/20 text-[#BC13FE]">
                <Bot className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold mb-1">AI Search Narrative</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every hook calls out the shift to AI-powered search. This educates the prospect and creates urgency in a single sentence.
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#fe3f8c]/20 text-[#fe3f8c]">
                <Target className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold mb-1">Mechanical Specificity</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each ad explains what the audit actually does. No vague promises. Prospects know exactly what they are buying before they click.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-12 text-center">
          <h2 className="text-2xl font-black mb-3">Ready to Run Your First Audit?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            $79.99. 180 credits. No subscription. See what AI search engines see when they look at your site.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors"
            >
              Get Started for $79.99 <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border/50 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors"
            >
              View All Plans
            </Link>
          </div>
        </section>
      </article>

      <PublicFooter />
    </main>
  )
}
