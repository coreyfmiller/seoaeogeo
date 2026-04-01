import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search,
  Sparkles,
  Bot,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Globe,
  Brain,
  Target,
  TrendingUp,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Duelly - SEO, AEO & GEO Intelligence Platform',
  description:
    'Audit your website for SEO, AEO, and GEO with AI-powered scoring. Get actionable fixes for the 2026 search landscape.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      {/* Navigation */}
      <header>
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Duelly" className="h-14 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="/pro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</Link>
            <Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How We Score</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors">
              Get Started Free
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log In
            </Link>
          </div>
        </div>
        </nav>
      </header>

      {/* Hero Section */}
      <article>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-4 text-center">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
          Search Intelligence for the
          <span className="bg-gradient-to-r from-[#00e5ff] via-[#BC13FE] to-[#fe3f8c] bg-clip-text text-transparent"> AI Era</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Duelly is a search intelligence platform that audits your website across three dimensions:
          traditional SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO).
          Built for the 2026 search landscape where AI-powered search engines like ChatGPT, Perplexity,
          and Google AI Overviews determine who gets cited and who gets ignored.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors flex items-center gap-2"
          >
            Get 20 Free Credits <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pro"
            className="px-8 py-3 rounded-xl border border-border/50 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-3">No credit card required.</p>
        <Link href="/battle-mode-v3" className="mt-8 inline-block text-4xl md:text-5xl font-black text-[#fe3f8c] hover:text-[#fe3f8c]/80 transition-colors">
          Beat Your Competition
        </Link>
      </section>

      {/* What is Duelly */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-3xl font-black text-center mb-4">What is Duelly?</h2>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12 leading-relaxed">
          Duelly is a comprehensive website auditing tool that scores your pages on SEO, AEO, and GEO
          using AI-powered analysis. It crawls your site, analyzes content quality with Google Gemini,
          detects your platform (WordPress, Shopify, Next.js, and more), and delivers actionable,
          platform-specific fix instructions ranked by impact.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/5">
            <div className="h-12 w-12 rounded-xl bg-[#00e5ff]/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-[#00e5ff]" />
            </div>
            <h3 className="text-xl font-bold mb-2">SEO Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Evaluates technical SEO, content quality, metadata, schema markup, internal linking,
              and <a href="https://web.dev/articles/vitals" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Core Web Vitals</a> using
              real PageSpeed Insights data. Scores against 2026 Google crawling standards.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#BC13FE]/20 bg-[#BC13FE]/5">
            <div className="h-12 w-12 rounded-xl bg-[#BC13FE]/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-[#BC13FE]" />
            </div>
            <h3 className="text-xl font-bold mb-2">AEO Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Measures how likely AI assistants like ChatGPT, Perplexity, and Gemini are to cite
              your content. Evaluates Q&A coverage, definition clarity, entity density, and
              <a href="https://schema.org" target="_blank" rel="noopener noreferrer" className="text-[#BC13FE] hover:underline">structured data</a> quality.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#fe3f8c]/20 bg-[#fe3f8c]/5">
            <div className="h-12 w-12 rounded-xl bg-[#fe3f8c]/10 flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-[#fe3f8c]" />
            </div>
            <h3 className="text-xl font-bold mb-2">GEO Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Assesses how well your content performs in AI-generated search results and summaries.
              Analyzes <a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" target="_blank" rel="noopener noreferrer" className="text-[#fe3f8c] hover:underline">expertise signals</a>, factual density, tone objectivity, and citation likelihood
              across major AI platforms.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: <Globe className="h-5 w-5" />, title: 'Enter Your URL', desc: 'Paste any website URL into the audit tool. No installation or code changes required.' },
            { step: '2', icon: <Brain className="h-5 w-5" />, title: 'AI Crawl & Analysis', desc: 'A headless browser crawls your page. Gemini AI analyzes content quality, tone, and structure.' },
            { step: '3', icon: <BarChart3 className="h-5 w-5" />, title: 'Get Your Scores', desc: 'Receive SEO, AEO, and GEO scores out of 100 with a detailed breakdown of every penalty.' },
            { step: '4', icon: <Target className="h-5 w-5" />, title: 'Fix & Improve', desc: 'Follow prioritized, platform-specific fix instructions to improve your scores and visibility.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-10 w-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mx-auto mb-3 text-sm font-black">
                {item.step}
              </div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audit Tools */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-4">Our Tools</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Four powerful tools to analyze, compare, and dominate your search landscape.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-[#00e5ff]" />
              <h3 className="text-lg font-bold">Pro Audit</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Single-page deep analysis. Dual AI calls for score stability, real Core Web Vitals
              from PageSpeed Insights, site type detection, and up to 15 prioritized fix instructions.
              10 credits per scan.
            </p>
            <Link href="/pro-audit" className="text-sm font-semibold text-[#00e5ff] hover:underline flex items-center gap-1">
              Run Pro Audit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#BC13FE]/30 bg-[#BC13FE]/5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-[#BC13FE]" />
              <h3 className="text-lg font-bold">Deep Scan</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Multi-page site-wide audit. Crawls up to 50 pages, runs AI analysis on each,
              detects duplicate titles and meta descriptions, checks robots.txt and sitemap,
              and provides sitewide intelligence. 10 credits + 1 per page.
            </p>
            <Link href="/deep-scan" className="text-sm font-semibold text-[#BC13FE] hover:underline flex items-center gap-1">
              Run Deep Scan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#fe3f8c]/30 bg-[#fe3f8c]/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-[#fe3f8c]" />
              <h3 className="text-lg font-bold">Competitor Duel</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Head-to-head comparison of two websites with backlink analysis powered by Moz.
              See Domain Authority, top backlinks, link gaps, and AI-generated counter-strategies
              to outrank your competitor. 20 credits per duel.
            </p>
            <Link href="/battle-mode-v3" className="text-sm font-semibold text-[#fe3f8c] hover:underline flex items-center gap-1">
              Start a Duel <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-[#00e5ff]" />
              <h3 className="text-lg font-bold">Keyword Arena</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Search a keyword, find the top-ranking sites, and battle them all with AI scoring.
              See how your site stacks up against the competition with Google Rank vs AI Rank
              comparison and competitive gap insights. 5 credits per site.
            </p>
            <Link href="/keyword-arena-v3" className="text-sm font-semibold text-[#00e5ff] hover:underline flex items-center gap-1">
              Enter the Arena <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-12">What Sets Duelly Apart</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: <Brain className="h-5 w-5 text-[#BC13FE]" />, title: 'Dual AI Scoring', desc: 'Every Pro Audit runs two parallel Gemini AI calls and averages the results for consistent, stable scores across repeated scans.' },
            { icon: <Globe className="h-5 w-5 text-[#00e5ff]" />, title: 'Real Core Web Vitals', desc: 'Integrates the Google PageSpeed Insights API for real LCP, INP, and CLS data — the same metrics Google uses as ranking signals.' },
            { icon: <Target className="h-5 w-5 text-[#fe3f8c]" />, title: 'Site Type Detection', desc: 'Automatically detects your site type (e-commerce, blog, SaaS, portfolio, etc.) and adjusts scoring weights accordingly.' },
            { icon: <Shield className="h-5 w-5 text-[#BC13FE]" />, title: 'Platform-Specific Fixes', desc: 'Detects WordPress, Shopify, Wix, Squarespace, Next.js, and more. Fix instructions reference your actual admin paths and plugins.' },
            { icon: <BarChart3 className="h-5 w-5 text-[#00e5ff]" />, title: 'Transparent Scoring', desc: 'Every point deducted is explained with severity, impact reasoning, and a step-by-step fix. No black-box scores.' },
            { icon: <Zap className="h-5 w-5 text-[#fe3f8c]" />, title: 'Live Interrogation', desc: 'Secretly asks AI models if they would recommend your business — revealing your actual visibility in AI-generated answers.' },
          ].map((feature, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/30 bg-card/30">
              <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'What is AEO (Answer Engine Optimization)?',
              a: 'AEO is the practice of optimizing your content so that AI-powered answer engines like ChatGPT, Perplexity, and Google AI Overviews cite your website as a source. It focuses on clear definitions, Q&A formatting, structured data, and entity density — the signals AI systems use to determine which sources to reference.',
            },
            {
              q: 'What is GEO (Generative Engine Optimization)?',
              a: 'GEO measures how well your content performs in AI-generated search results. It evaluates expertise signals (E-E-A-T), factual density, tone objectivity, and citation likelihood. Content that scores high on GEO is more likely to appear in AI summaries and be recommended by large language models.',
            },
            {
              q: 'How does Duelly calculate scores?',
              a: 'Duelly uses a multi-layer approach: a headless browser crawls your page to extract technical data, then Google Gemini AI analyzes content quality and semantic signals. Two parallel AI calls are averaged for stability. Scores are calculated using site-type-specific weights — an e-commerce site is graded differently than a blog or SaaS product.',
            },
            {
              q: 'Is there a free tier?',
              a: 'Yes. Every new account gets 20 free credits on signup, no credit card required. That gives you 2 Pro Audits or 1 Deep Scan to try the platform. After that, credit packs start at $20 for 200 credits.',
            },
            {
              q: 'How many credits does each scan cost?',
              a: 'Pro Audit costs 10 credits per scan. Deep Scan costs 10 credits plus 1 credit per page crawled. Competitor Duel costs 20 credits per comparison. Keyword Arena costs 5 credits per site analyzed.',
            },
            {
              q: 'What platforms does Duelly detect?',
              a: 'Duelly automatically detects WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Hugo, and many other platforms. When a platform is detected, all fix instructions are tailored to that specific platform — referencing actual admin paths, plugins, and configuration files.',
            },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-xl border border-border/30 bg-card/30">
              <h3 className="font-bold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'What is AEO (Answer Engine Optimization)?', acceptedAnswer: { '@type': 'Answer', text: 'AEO is the practice of optimizing your content so that AI-powered answer engines like ChatGPT, Perplexity, and Google AI Overviews cite your website as a source.' } },
              { '@type': 'Question', name: 'What is GEO (Generative Engine Optimization)?', acceptedAnswer: { '@type': 'Answer', text: 'GEO measures how well your content performs in AI-generated search results, evaluating expertise signals, factual density, tone objectivity, and citation likelihood.' } },
              { '@type': 'Question', name: 'How does Duelly calculate scores?', acceptedAnswer: { '@type': 'Answer', text: 'Duelly uses a headless browser crawl plus dual Gemini AI analysis with site-type-specific scoring weights for consistent, accurate results.' } },
              { '@type': 'Question', name: 'Is there a free tier?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every new account gets 20 free credits on signup. That gives you 2 Pro Audits or 1 Deep Scan. Credit packs start at $20 for 200 credits.' } },
              { '@type': 'Question', name: 'How many credits does each scan cost?', acceptedAnswer: { '@type': 'Answer', text: 'Pro Audit: 10 credits. Deep Scan: 10 + 1 per page. Competitor Duel: 20 credits. Keyword Arena: 5 credits per site.' } },
              { '@type': 'Question', name: 'What platforms does Duelly detect?', acceptedAnswer: { '@type': 'Answer', text: 'WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Hugo, and more. Fix instructions are tailored to the detected platform.' } },
            ],
          }),
        }}
      />

      {/* CTA */}
      </article>
      <section className="max-w-6xl mx-auto px-6 py-20 text-center border-t border-border/30">
        <h2 className="text-3xl font-black mb-4">Ready to Audit Your Site?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Sign up and get 20 free credits to run your first Pro Audit. No credit card required.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors"
        >
          Get 20 Free Credits <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-sm mb-3">Tools</h4>
              <ul className="space-y-2">
                <li><Link href="/pro-audit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pro Audit</Link></li>
                <li><Link href="/deep-scan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deep Scan</Link></li>
                <li><Link href="/battle-mode-v3" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Competitor Duel</Link></li>
                <li><Link href="/keyword-arena-v3" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Keyword Arena</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Our Standards</Link></li>
                <li><Link href="/pro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Account</h4>
              <ul className="space-y-2">
                <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link></li>
                <li><a href="mailto:support@duelly.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Duelly. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/50">The roadmap to outrank your rivals. Built by <a href="https://fundylogic.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">Fundylogic.com</a></p>
          </div>
        </div>
      </footer>
    </main>
  )
}
