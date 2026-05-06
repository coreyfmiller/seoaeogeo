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
  Menu,
} from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Duelly - SEO, AEO & GEO Intelligence Platform',
  description:
    'Audit your website for SEO, AEO, and GEO. See how Google, ChatGPT, Gemini, and Perplexity view your site — and outrank your competitors.',
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
            <Image src="/logo.png" alt="Duelly" width={140} height={56} className="h-14 w-auto" priority />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</Link>
            <Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How We Score</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/demo" className="text-sm px-3 py-1 rounded-lg border border-[#BC13FE]/50 bg-[#BC13FE]/10 font-bold text-[#BC13FE] hover:bg-[#BC13FE]/20 transition-colors">Try Demo</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-sm transition-colors">
              Get Started
            </Link>
            <Link href="/login" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log In
            </Link>
            {/* Mobile menu */}
            <details className="md:hidden relative">
              <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Menu className="h-5 w-5 text-muted-foreground" />
              </summary>
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl p-3 space-y-1 z-50">
                <Link href="/demo" className="block px-3 py-2 rounded-lg text-sm font-bold text-[#BC13FE] hover:bg-[#BC13FE]/10 transition-colors">Try Demo</Link>
                <Link href="/pricing" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">Pricing</Link>
                <Link href="/blog" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">Blog</Link>
                <Link href="/help" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">Help</Link>
                <Link href="/standards" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">How We Score</Link>
                <Link href="/about" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">About</Link>
                <div className="border-t border-border/30 pt-1 mt-1">
                  <Link href="/login" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">Log In</Link>
                </div>
              </div>
            </details>
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
          When Google, ChatGPT, Gemini, or Perplexity cites a competitor instead of you, it's not random. Their site had better structure,
          clearer content, stronger signals. Duelly runs the same comparison so you can see exactly what they
          did right — and do it better.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo"
            className="px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#00e5ff]/20"
          >
            Try the Demo Free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-xl border border-white/20 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors flex items-center gap-2"
          >
            Get Started — $79.99
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-3">No subscription. No demo call. Just data. Starting at $79.99 for 180 credits.</p>

        {/* Product Screenshot */}
        <div className="mt-16 relative mx-auto max-w-5xl perspective-[2000px]">
          {/* Ambient glow */}
          <div className="absolute -inset-8 bg-gradient-to-r from-[#00e5ff]/30 via-[#BC13FE]/20 to-[#fe3f8c]/30 rounded-3xl blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
          {/* Screenshot with perspective */}
          <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,229,255,0.3),0_20px_60px_-30px_rgba(188,19,254,0.2)] transform rotate-x-1 hover:rotate-x-0 transition-transform duration-700 ease-out">
            <Image
              src="/duellyexample.png"
              alt="Duelly dashboard showing SEO, AEO, and GEO scores with prioritized fix recommendations"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Social Proof Strip */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Powered by industry-leading data sources</p>
          <div className="flex items-center justify-center gap-8 opacity-70">
            <Image src="/google.png" alt="Google" width={100} height={32} className="h-7 w-auto grayscale hover:grayscale-0 transition-all" />
            <Image src="/gemini.png" alt="Gemini AI" width={100} height={32} className="h-7 w-auto grayscale hover:grayscale-0 transition-all" />
            <Image src="/moz.png" alt="Moz" width={80} height={32} className="h-7 w-auto grayscale hover:grayscale-0 transition-all" />
          </div>
          <p className="text-xs text-muted-foreground/50">500+ sites audited. Real data from Google PageSpeed, Gemini AI, and Moz Link Explorer.</p>
        </div>
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

          <div className="p-6 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-[#f59e0b]" />
              <h3 className="text-lg font-bold">Keyword Arena</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Search any keyword and see how every top-ranking site scores. Compare Google Rank vs AI Rank
              and find exactly where you need to improve to climb. 10 credits per run.
            </p>
            <Link href="/keyword-arena" className="text-sm font-semibold text-[#f59e0b] hover:underline flex items-center gap-1">
              Enter the Arena <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <div className="text-center mb-12 p-6 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 max-w-2xl mx-auto">
          <p className="text-2xl font-black text-foreground mb-1">$79.99. One time. No subscription.</p>
          <p className="text-sm text-muted-foreground">180 credits. Enough to audit your homepage, top pages, and biggest competitor. Credits never expire.</p>
        </div>
        <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: <Globe className="h-5 w-5" />, title: 'Paste Any URL', desc: 'No code changes, no installation. Works on any site, any platform.', color: '#00e5ff' },
            { step: '2', icon: <Brain className="h-5 w-5" />, title: 'Dual AI Analysis', desc: 'Two parallel Gemini AI calls averaged for accuracy. Same model that powers AI search.', color: '#BC13FE' },
            { step: '3', icon: <BarChart3 className="h-5 w-5" />, title: 'Three Scores + Roadmap', desc: 'SEO, AEO, and GEO scores with every issue ranked by impact on your visibility.', color: '#fe3f8c' },
            { step: '4', icon: <Target className="h-5 w-5" />, title: 'Platform-Specific Fixes', desc: 'WordPress? Shopify? Wix? Every fix is written for your exact platform. Copy, paste, done.', color: '#f59e0b' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-black border" style={{ borderColor: `${item.color}40`, background: `${item.color}15`, color: item.color }}>
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
            { icon: <Bot className="h-5 w-5 text-[#00e5ff]" />, title: "Know Why AI Ignores You", desc: "Gemini AI reads your content the same way ChatGPT and Perplexity do. See exactly what they see." },
            { icon: <BarChart3 className="h-5 w-5 text-[#00e5ff]" />, title: "Prove Speed to Google", desc: "Real Core Web Vitals from Google PageSpeed Insights. The same data Google uses to rank you." },
            { icon: <Code className="h-5 w-5 text-[#BC13FE]" />, title: "Fixes You Can Actually Do", desc: "Step-by-step for YOUR platform. WordPress plugin paths, Shopify theme edits, Wix settings. Not generic advice." },
            { icon: <FileText className="h-5 w-5 text-[#BC13FE]" />, title: "Hand Off a PDF", desc: "Send your developer a professional report with every issue and fix. No back-and-forth explaining." },
            { icon: <Layers className="h-5 w-5 text-[#fe3f8c]" />, title: "See Who Links to Rivals", desc: "Moz backlink data shows who's vouching for your competitors. Find the gaps in your authority." },
            { icon: <Shield className="h-5 w-5 text-[#fe3f8c]" />, title: "Fix What Matters First", desc: "Every issue ranked by ROI. Stop guessing which fix moves the needle most." },
            { icon: <Sparkles className="h-5 w-5 text-[#00e5ff]" />, title: "Get Cited by AI", desc: "Auto-generated schema markup for your site type. The structured data AI engines need to reference you." },
            { icon: <Zap className="h-5 w-5 text-[#BC13FE]" />, title: "Expose Competitor Gaps", desc: "Head-to-head comparisons reveal exactly where they beat you and what to do about it." },
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
              q: 'How do I get started?',
              a: 'Sign up for an account and choose a credit pack. Credit packs start at $79.99 for 180 credits.',
            },
            {
              q: 'How many credits does each scan cost?',
              a: 'Pro Analysis costs 10 credits per scan. Deep Scan costs 30 credits (5 pages). Competitor Duel costs 10 credits per comparison. Keyword Arena costs 10 credits per run.',
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
              { '@type': 'Question', name: 'What is AEO (Answer Engine Optimization)?', acceptedAnswer: { '@type': 'Answer', text: 'AEO is the practice of optimizing your content so that AI-powered answer engines like ChatGPT, Perplexity, and Google AI Overviews cite your website as a source. It focuses on clear definitions, Q&A formatting, structured data, and entity density — the signals AI systems use to determine which sources to reference.' } },
              { '@type': 'Question', name: 'What is GEO (Generative Engine Optimization)?', acceptedAnswer: { '@type': 'Answer', text: 'GEO measures how well your content performs in AI-generated search results. It evaluates expertise signals, factual density, tone objectivity, and citation likelihood. Content that scores high on GEO is more likely to appear in AI summaries and be recommended by large language models.' } },
              { '@type': 'Question', name: 'How does Duelly calculate scores?', acceptedAnswer: { '@type': 'Answer', text: 'Duelly uses a multi-layer approach: a headless browser crawls your page to extract technical data, then Gemini AI analyzes content quality and semantic signals. Two parallel AI calls are averaged for stability. Scores are calculated using site-type-specific weights — an e-commerce site is graded differently than a blog or local business.' } },
              { '@type': 'Question', name: 'How do I get started?', acceptedAnswer: { '@type': 'Answer', text: 'Sign up for an account and choose a credit pack. Credit packs start at $79.99 for 180 credits.' } },
              { '@type': 'Question', name: 'How many credits does each scan cost?', acceptedAnswer: { '@type': 'Answer', text: 'Pro Analysis costs 10 credits per scan. Deep Scan costs 30 credits (5 pages). Competitor Duel costs 10 credits per comparison. Keyword Arena costs 10 credits per run.' } },
              { '@type': 'Question', name: 'What platforms does Duelly detect?', acceptedAnswer: { '@type': 'Answer', text: 'Duelly automatically detects WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Hugo, and many other platforms. When a platform is detected, all fix instructions are tailored to that specific platform.' } },
            ],
          }),
        }}
      />

      {/* CTA */}
      </article>
      <section className="max-w-6xl mx-auto px-6 py-20 text-center border-t border-border/30">
        <h2 className="text-3xl font-black mb-4">Your Competitors Are Already Optimizing for AI Search.</h2>
        <p className="text-muted-foreground mb-3 max-w-xl mx-auto">
          Every week you wait, they're getting cited by ChatGPT, Perplexity, and Google AI Overviews instead of you.
        </p>
        <p className="text-sm font-bold text-[#00e5ff] mb-8">Run your first audit in 2 minutes. $79.99. No subscription.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors shadow-lg shadow-[#00e5ff]/20"
          >
            Try the Demo Free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/20 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors"
          >
            Get Started — $79.99
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
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
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
