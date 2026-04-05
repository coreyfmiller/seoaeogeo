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
  Globe,
  Brain,
  Target,
  TrendingUp,
  FileText,
  Code,
  Layers,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Duelly - SEO, AEO & GEO Intelligence Platform',
  description:
    'Audit your website for SEO, AEO, and GEO with AI-powered scoring. See what AI sees, fix what AI skips, and outrank your competitors.',
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
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</Link>
            <Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How We Score</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors">
              Get Started
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
          Your Competitor Didn't Get Lucky.
          They Got Optimized.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          When AI or Google cites a competitor instead of you, it's not random. Their site had better structure,
          clearer content, stronger signals. Duelly runs the same comparison so you can see exactly what they
          did right — and do it better.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors flex items-center gap-2"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3 rounded-xl border border-border/50 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-3">No credit card required.</p>
      </section>

      {/* Three Pillars — compact */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-black text-center mb-4">Three Scores That Tell You Everything</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          Duelly audits your site across the three dimensions that determine your visibility in 2026.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 text-center">
            <Search className="h-8 w-8 text-[#00e5ff] mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">SEO</h3>
            <p className="text-sm text-muted-foreground">Can search engines find you? Technical health, content quality, metadata, site speed, and internal linking.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#BC13FE]/20 bg-[#BC13FE]/5 text-center">
            <Sparkles className="h-8 w-8 text-[#BC13FE] mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">AEO</h3>
            <p className="text-sm text-muted-foreground">Will AI engines cite you? Q&A coverage, structured data, entity density, and definition clarity.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#fe3f8c]/20 bg-[#fe3f8c]/5 text-center">
            <Bot className="h-8 w-8 text-[#fe3f8c] mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">GEO</h3>
            <p className="text-sm text-muted-foreground">Are you showing up in AI results? Expertise signals, factual density, tone, and citation likelihood.</p>
          </div>
        </div>
      </section>

      {/* Tools — what they do for you */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-4">Four Ways to Outrank Your Competition</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Audit your pages, scan your entire site, spy on competitors, and dominate your keyword landscape.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-[#00e5ff]" />
              <h3 className="text-lg font-bold">Pro Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Deep-dive a single page with AI. Get your SEO, AEO, and GEO scores plus up to 15 prioritized
              fix instructions written for your specific platform. 10 credits.
            </p>
            <Link href="/pro-audit" className="text-sm font-semibold text-[#00e5ff] hover:underline flex items-center gap-1">
              Run Pro Analysis <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#BC13FE]/30 bg-[#BC13FE]/5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-[#BC13FE]" />
              <h3 className="text-lg font-bold">Deep Scan</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Crawl up to 50 pages and find sitewide issues — duplicate titles, missing schemas, slow pages,
              and content gaps your competitors don't have. 30 credits.
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
              Pick any competitor and run a head-to-head comparison. See their scores, backlinks, and gaps —
              then get AI-generated strategies to overtake them. 10 credits.
            </p>
            <Link href="/battle-mode" className="text-sm font-semibold text-[#fe3f8c] hover:underline flex items-center gap-1">
              Start a Duel <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-[#00e5ff]" />
              <h3 className="text-lg font-bold">Keyword Arena</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Search any keyword and see how every top-ranking site scores. Compare Google Rank vs AI Rank
              and find exactly where you need to improve to climb. 10 credits per site.
            </p>
            <Link href="/keyword-arena" className="text-sm font-semibold text-[#00e5ff] hover:underline flex items-center gap-1">
              Enter the Arena <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: <Globe className="h-5 w-5" />, title: 'Enter Your URL', desc: 'Paste any website URL. No installation or code changes required.' },
            { step: '2', icon: <Brain className="h-5 w-5" />, title: 'AI Analyzes Your Site', desc: 'Gemini AI reads your content the same way AI search engines do.' },
            { step: '3', icon: <BarChart3 className="h-5 w-5" />, title: 'Get Your Scores', desc: 'SEO, AEO, and GEO scores with a breakdown of every issue found.' },
            { step: '4', icon: <Target className="h-5 w-5" />, title: 'Fix & Outrank', desc: 'Follow prioritized, platform-specific instructions to improve your visibility.' },
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

      {/* What's Included */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-4">What You Get</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Every feature unlocked from the start. No hidden tiers.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Bot className="h-5 w-5 text-[#00e5ff]" />, title: "AI-Powered Audits", desc: "Evaluated by the same Gemini AI that powers AI search. Not a checklist — an actual AI reading your content." },
            { icon: <BarChart3 className="h-5 w-5 text-[#00e5ff]" />, title: "Real Site Speed Scores", desc: "Performance data from Google PageSpeed Insights — the same metrics Google uses to rank you." },
            { icon: <Code className="h-5 w-5 text-[#BC13FE]" />, title: "Platform-Specific Fixes", desc: "Step-by-step instructions tailored to WordPress, Shopify, Wix, Squarespace, and more." },
            { icon: <FileText className="h-5 w-5 text-[#BC13FE]" />, title: "PDF Reports", desc: "Every scan generates a shareable PDF you can send to your developer or keep for your records." },
            { icon: <Layers className="h-5 w-5 text-[#fe3f8c]" />, title: "Backlink Intelligence", desc: "See who's linking to you and your competitors, powered by Moz. Find the gaps." },
            { icon: <Shield className="h-5 w-5 text-[#fe3f8c]" />, title: "Priority-Ranked Fixes", desc: "Every issue scored by impact so you always know what to fix first." },
            { icon: <Sparkles className="h-5 w-5 text-[#00e5ff]" />, title: "Schema Markup", desc: "Structured data generated for your site type — ready to copy and paste." },
            { icon: <Zap className="h-5 w-5 text-[#BC13FE]" />, title: "Competitor Gap Analysis", desc: "Head-to-head comparisons showing exactly where competitors beat you." },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-2">
              {f.icon}
              <p className="text-sm font-bold">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
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
              a: 'GEO measures how well your content performs in AI-generated search results. It evaluates expertise signals, factual density, tone objectivity, and citation likelihood. Content that scores high on GEO is more likely to appear in AI summaries and be recommended by large language models.',
            },
            {
              q: 'How does Duelly calculate scores?',
              a: 'Duelly uses a multi-layer approach: a headless browser crawls your page to extract technical data, then Gemini AI analyzes content quality and semantic signals. Two parallel AI calls are averaged for stability. Scores are calculated using site-type-specific weights — an e-commerce site is graded differently than a blog or local business.',
            },
            {
              q: 'Is there a free tier?',
              a: 'Yes. You can run a free audit with no account required. After that, credit packs start at $79.99 for 180 credits.',
            },
            {
              q: 'How many credits does each scan cost?',
              a: 'Pro Analysis costs 10 credits per scan. Deep Scan costs 30 credits (5 pages). Competitor Duel costs 10 credits per comparison. Keyword Arena costs 10 credits per site analyzed.',
            },
            {
              q: 'What platforms does Duelly detect?',
              a: 'Duelly automatically detects WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Hugo, and many other platforms. When a platform is detected, all fix instructions are tailored to that specific platform.',
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
              { '@type': 'Question', name: 'Is there a free tier?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can run a free audit with no account required. Credit packs start at $79.99 for 180 credits.' } },
              { '@type': 'Question', name: 'How many credits does each scan cost?', acceptedAnswer: { '@type': 'Answer', text: 'Pro Analysis: 10 credits. Deep Scan: 30 credits (5 pages). Competitor Duel: 10 credits. Keyword Arena: 10 credits per site.' } },
              { '@type': 'Question', name: 'What platforms does Duelly detect?', acceptedAnswer: { '@type': 'Answer', text: 'WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Hugo, and more. Fix instructions are tailored to the detected platform.' } },
            ],
          }),
        }}
      />

      {/* CTA */}
      </article>
      <section className="max-w-6xl mx-auto px-6 py-20 text-center border-t border-border/30">
        <h2 className="text-3xl font-black mb-4">Ready to See What AI Sees?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Run a free audit in 60 seconds. No account required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/free-audit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border/50 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-sm mb-3">Tools</h4>
              <ul className="space-y-2">
                <li><Link href="/pro-audit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pro Analysis</Link></li>
                <li><Link href="/deep-scan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deep Scan</Link></li>
                <li><Link href="/battle-mode" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Competitor Duel</Link></li>
                <li><Link href="/keyword-arena" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Keyword Arena</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How We Score</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
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
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Duelly. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/50">Built by <a href="https://fundylogic.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">Fundylogic.com</a></p>
          </div>
        </div>
      </footer>
    </main>
  )
}
