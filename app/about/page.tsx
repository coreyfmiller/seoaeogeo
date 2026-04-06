import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Shield, Brain, Target, Zap, Users, Globe } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'About Duelly — Search Intelligence Built for Small Business',
  description: 'Duelly is a search intelligence platform built by Fundylogic to help small businesses compete in the AI search era. Learn about our mission, methodology, and the team behind the tool.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />

      <article className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-6 leading-tight">About Duelly</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">

          {/* Mission */}
          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#00e5ff]" /> Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Search is changing. Google is no longer the only place people find businesses — AI assistants like
              ChatGPT, Perplexity, and Google AI Overviews are answering questions directly, and they decide which
              websites to cite. Most small businesses have no idea whether AI can even find them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Duelly exists to close that gap. We built a search intelligence platform that scores your website
              across three dimensions — SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine
              Optimization) — so you can see exactly where you stand and what to fix. No guesswork, no jargon,
              just actionable data.
            </p>
          </section>

          {/* Who We Are */}
          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#BC13FE]" /> Who We Are
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Duelly is built by <a href="https://fundylogic.com" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Fundylogic</a>,
              a software development studio based in Atlantic Canada. We specialize in building tools that help
              small and medium businesses compete with larger players in the digital space.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We started Duelly because we saw a problem firsthand: small business owners were paying for SEO
              audits that gave them a checklist of issues but no context on what actually mattered. Meanwhile,
              the search landscape was shifting under their feet — AI engines were becoming a major traffic source,
              and nobody was measuring readiness for that. We decided to build the tool we wished existed.
            </p>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#00e5ff]" /> How Duelly Works
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every Duelly audit follows a rigorous, multi-step process. First, a headless browser crawls your
              page to extract technical data — response times, schema markup, heading structure, image alt text,
              internal and external links, Open Graph tags, and more. Then, Google&apos;s Gemini AI analyzes your
              content the same way AI search engines do, evaluating semantic quality, entity density, factual
              accuracy, and citation likelihood.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We run two parallel AI analyses and average the results for stability. Scores are calculated using
              site-type-specific weights — because an e-commerce store, a restaurant, and a law firm shouldn&apos;t
              be graded the same way. The result is three scores (SEO, AEO, GEO) plus prioritized, platform-specific
              fix instructions you can act on immediately.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For a detailed breakdown of our scoring methodology, see our{' '}
              <Link href="/standards" className="text-[#00e5ff] hover:underline">How We Score</Link> page.
            </p>
          </section>

          {/* Our Data Sources */}
          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#fe3f8c]" /> Our Data Sources
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Duelly integrates data from trusted, industry-standard sources to give you the most complete picture:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#00e5ff] font-bold mt-0.5">•</span>
                <span><a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Google Gemini AI</a> — powers our content analysis, scoring the same signals that AI search engines evaluate when deciding which sources to cite.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00e5ff] font-bold mt-0.5">•</span>
                <span><a href="https://moz.com/products/api" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Moz Link Explorer API</a> — provides Domain Authority scores, backlink profiles, and spam scores for competitive analysis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00e5ff] font-bold mt-0.5">•</span>
                <span><a href="https://serper.dev/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Serper API</a> — delivers real-time Google search results for our Keyword Arena, showing you exactly where you rank from a neutral perspective.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00e5ff] font-bold mt-0.5">•</span>
                <span><a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Google PageSpeed Insights</a> — the same performance metrics Google uses to evaluate your Core Web Vitals.</span>
              </li>
            </ul>
          </section>

          {/* What Makes Us Different */}
          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00e5ff]" /> What Makes Duelly Different
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
              {[
                { title: 'AI-Native Scoring', desc: 'We don\'t just check SEO boxes. We measure whether AI engines can understand and cite your content — something traditional SEO tools ignore entirely.' },
                { title: 'Site-Type Awareness', desc: 'A restaurant gets different advice than a law firm. Our AI detects your business type and adjusts scoring weights and recommendations accordingly.' },
                { title: 'Platform-Specific Fixes', desc: 'Every fix instruction is tailored to your platform — WordPress, Shopify, Wix, Squarespace, or whatever you\'re running. No generic advice.' },
                { title: 'Competitive Context', desc: 'Your scores mean nothing in isolation. Keyword Arena and Competitor Duel show you exactly how you compare to the sites you\'re actually competing against.' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-4">
                  <p className="text-sm font-bold text-foreground mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy & Trust */}
          <section>
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#BC13FE]" /> Privacy &amp; Trust
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We take data seriously. Duelly only accesses publicly available information on your website — the same
              data any search engine or visitor can see. We don&apos;t install tracking scripts, we don&apos;t require
              code changes, and we don&apos;t store your content beyond what&apos;s needed to generate your report.
              Scan history is tied to your account and can be deleted at any time from your{' '}
              <Link href="/settings" className="text-[#00e5ff] hover:underline">account settings</Link>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For full details, read our <Link href="/privacy" className="text-[#00e5ff] hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* CTA */}
          <section className="mt-12 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 p-8 text-center not-prose">
            <h2 className="text-2xl font-black mb-3">Ready to see where you stand?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Sign up and start auditing in minutes. Credit packs starting at $79.99.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="px-6 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold transition-colors flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="px-6 py-3 rounded-xl border border-border/50 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold transition-colors">
                View Pricing
              </Link>
            </div>
          </section>
        </div>
      </article>

      {/* About Page Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Duelly',
            url: 'https://duelly.ai/about',
            description: 'Learn about Duelly, the search intelligence platform built by Fundylogic to help small businesses compete in the AI search era.',
            mainEntity: {
              '@type': 'Organization',
              name: 'Duelly',
              url: 'https://duelly.ai',
              logo: 'https://duelly.ai/logo.png',
              description: 'AI-powered search intelligence platform providing SEO, AEO, and GEO analytics.',
              founder: { '@type': 'Person', name: 'Fundylogic', url: 'https://fundylogic.com' },
              foundingDate: '2025',
              email: 'support@duelly.ai',
              sameAs: ['https://fundylogic.com'],
            },
          }),
        }}
      />

      <PublicFooter />
    </main>
  )
}
