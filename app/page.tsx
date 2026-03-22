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
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header>
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Duelly" className="h-14 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-[#118fff] hover:bg-[#118fff]/90 text-white text-sm font-semibold transition-colors"
            >
              Get Started Free
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
          <span className="bg-gradient-to-r from-[#118fff] via-[#842ce0] to-[#fe3f8c] bg-clip-text text-transparent"> AI Era</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Duelly is a search intelligence platform that audits your website across three dimensions:
          traditional SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO).
          Built for the 2026 search landscape where AI-powered search engines like ChatGPT, Perplexity,
          and Google AI Overviews determine who gets cited and who gets ignored.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/free-audit"
            className="px-8 py-3 rounded-xl bg-[#118fff] hover:bg-[#118fff]/90 text-white font-bold text-lg transition-colors flex items-center gap-2"
          >
            Try Free Audit <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pro"
            className="px-8 py-3 rounded-xl border border-border/50 hover:border-[#842ce0]/50 hover:bg-[#842ce0]/5 font-bold text-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
        <Link href="/competitive-intel" className="mt-8 inline-block text-4xl md:text-5xl font-black text-[#fe3f8c] hover:text-[#fe3f8c]/80 transition-colors">
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
          <div className="p-6 rounded-2xl border border-[#118fff]/20 bg-[#118fff]/5">
            <div className="h-12 w-12 rounded-xl bg-[#118fff]/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-[#118fff]" />
            </div>
            <h3 className="text-xl font-bold mb-2">SEO Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Evaluates technical SEO, content quality, metadata, schema markup, internal linking,
              and <a href="https://web.dev/articles/vitals" target="_blank" rel="noopener noreferrer" className="text-[#118fff] hover:underline">Core Web Vitals</a> using
              real PageSpeed Insights data. Scores against 2026 Google crawling standards.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#842ce0]/20 bg-[#842ce0]/5">
            <div className="h-12 w-12 rounded-xl bg-[#842ce0]/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-[#842ce0]" />
            </div>
            <h3 className="text-xl font-bold mb-2">AEO Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Measures how likely AI assistants like ChatGPT, Perplexity, and Gemini are to cite
              your content. Evaluates Q&A coverage, definition clarity, entity density, and
              <a href="https://schema.org" target="_blank" rel="noopener noreferrer" className="text-[#842ce0] hover:underline">structured data</a> quality.
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
        <h2 className="text-3xl font-black text-center mb-4">Three Audit Tools</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Choose the right level of analysis for your needs.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-[#118fff]" />
              <h3 className="text-lg font-bold">Pro Audit</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Single-page deep analysis. Dual AI calls for score stability, real Core Web Vitals
              from PageSpeed Insights, site type detection, and up to 15 prioritized fix instructions.
              10 credits per scan.
            </p>
            <Link href="/pro-audit" className="text-sm font-semibold text-[#118fff] hover:underline flex items-center gap-1">
              Run Pro Audit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#842ce0]/30 bg-[#842ce0]/5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-[#842ce0]" />
              <h3 className="text-lg font-bold">Deep Scan</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Multi-page site-wide audit. Crawls up to 50 pages, runs AI analysis on each,
              detects duplicate titles and meta descriptions, checks robots.txt and sitemap,
              and provides sitewide intelligence. 10 credits + 1 per page.
            </p>
            <Link href="/deep-scan" className="text-sm font-semibold text-[#842ce0] hover:underline flex items-center gap-1">
              Run Deep Scan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-[#fe3f8c]" />
              <h3 className="text-lg font-bold">Competitive Intel</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Head-to-head comparison of two websites. See exactly where your competitor
              outperforms you across SEO, AEO, and GEO with gap analysis and strategic
              recommendations. 20 credits per comparison.
            </p>
            <Link href="/competitive-intel" className="text-sm font-semibold text-[#fe3f8c] hover:underline flex items-center gap-1">
              Run Comparison <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-12">What Sets Duelly Apart</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: <Brain className="h-5 w-5 text-[#842ce0]" />, title: 'Dual AI Scoring', desc: 'Every Pro Audit runs two parallel Gemini AI calls and averages the results for consistent, stable scores across repeated scans.' },
            { icon: <Globe className="h-5 w-5 text-[#118fff]" />, title: 'Real Core Web Vitals', desc: 'Integrates the Google PageSpeed Insights API for real LCP, INP, and CLS data — the same metrics Google uses as ranking signals.' },
            { icon: <Target className="h-5 w-5 text-[#fe3f8c]" />, title: 'Site Type Detection', desc: 'Automatically detects your site type (e-commerce, blog, SaaS, portfolio, etc.) and adjusts scoring weights accordingly.' },
            { icon: <Shield className="h-5 w-5 text-[#842ce0]" />, title: 'Platform-Specific Fixes', desc: 'Detects WordPress, Shopify, Wix, Squarespace, Next.js, and more. Fix instructions reference your actual admin paths and plugins.' },
            { icon: <BarChart3 className="h-5 w-5 text-[#118fff]" />, title: 'Transparent Scoring', desc: 'Every point deducted is explained with severity, impact reasoning, and a step-by-step fix. No black-box scores.' },
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
              a: 'Yes. The Free Audit provides a basic SEO, AEO, and GEO score with domain health analysis. Pro Audit, Deep Scan, and Competitive Intel require credits, which start at $20 for 200 credits.',
            },
            {
              q: 'How many credits does each scan cost?',
              a: 'Pro Audit costs 10 credits per scan. Deep Scan costs 10 credits plus 1 credit per page crawled. Competitive Intel costs 20 credits per comparison.',
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
              { '@type': 'Question', name: 'Is there a free tier?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Free Audit provides basic SEO, AEO, and GEO scores. Pro features require credits starting at $20 for 200 credits.' } },
              { '@type': 'Question', name: 'How many credits does each scan cost?', acceptedAnswer: { '@type': 'Answer', text: 'Pro Audit: 10 credits. Deep Scan: 10 + 1 per page. Competitive Intel: 20 credits.' } },
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
          Start with a free audit to see your SEO, AEO, and GEO scores. No account required.
        </p>
        <Link
          href="/free-audit"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#118fff] hover:bg-[#118fff]/90 text-white font-bold text-lg transition-colors"
        >
          Start Free Audit <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Duelly. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</Link>
            <Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Standards</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
