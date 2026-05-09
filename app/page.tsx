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
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Duelly — Does AI Recommend Your Business?',
  description:
    'Find out if ChatGPT, Gemini, Perplexity, and Google AI would recommend your business. The AI search visibility platform for businesses that refuse to be invisible.',
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
            <Link href="/demo" className="text-sm px-3 py-1 rounded-lg border border-[#BC13FE]/50 bg-[#BC13FE]/10 font-bold text-[#BC13FE] hover:bg-[#BC13FE]/20 transition-colors">View Demo</Link>
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
                <Link href="/demo" className="block px-3 py-2 rounded-lg text-sm font-bold text-[#BC13FE] hover:bg-[#BC13FE]/10 transition-colors">View Demo</Link>
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

      {/* Hero Section — AI Visibility Positioning */}
      <article>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] text-sm font-bold border border-[#00e5ff]/20 mb-6">
          <Sparkles className="h-4 w-4" />
          AI SEARCH VISIBILITY INTELLIGENCE
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
          Does AI Recommend<br />Your Business?
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          ChatGPT, Gemini, and Perplexity are deciding which businesses get recommended.
          Most don&apos;t know if they&apos;re visible or invisible. Duelly tells you in minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#00e5ff]/20"
          >
            Check My Visibility Free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/demo"
            className="px-8 py-3 rounded-xl border border-white/20 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors flex items-center gap-2"
          >
            View Demo
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-3">No subscription. No demo call. Results in minutes.</p>
      </section>

      {/* AI Visibility Table — The Hook */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Example: Local Plumbing Company</p>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { engine: 'Google Search', icon: <Search className="h-5 w-5" />, status: 'Page 3', color: '#f59e0b', StatusIcon: AlertTriangle },
              { engine: 'ChatGPT', icon: <Bot className="h-5 w-5" />, status: 'Not Recommended', color: '#ef4444', StatusIcon: XCircle },
              { engine: 'Google Gemini', icon: <Sparkles className="h-5 w-5" />, status: 'Recommended', color: '#22c55e', StatusIcon: CheckCircle2 },
              { engine: 'Perplexity', icon: <Globe className="h-5 w-5" />, status: 'Not Recommended', color: '#ef4444', StatusIcon: XCircle },
            ].map((row) => (
              <div key={row.engine} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{row.icon}</span>
                  <span className="font-medium">{row.engine}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: row.color }}>
                  <row.StatusIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">{row.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] text-center">
            <p className="text-sm text-muted-foreground">This business is invisible to 75% of AI search engines. <span className="text-[#00e5ff] font-bold">Duelly shows you why and how to fix it.</span></p>
          </div>
        </div>
      </section>

      {/* Product Screenshot */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="relative mx-auto max-w-5xl perspective-[2000px]">
          <div className="absolute -inset-8 bg-gradient-to-r from-[#00e5ff]/30 via-[#BC13FE]/20 to-[#fe3f8c]/30 rounded-3xl blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
          <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,229,255,0.3),0_20px_60px_-30px_rgba(188,19,254,0.2)] transform rotate-x-1 hover:rotate-x-0 transition-transform duration-700 ease-out">
            <Image
              src="/duellyexample.png"
              alt="Duelly dashboard showing AI visibility scores and recommendations"
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
          <div className="flex items-center justify-center gap-8">
            <Image src="/google.png" alt="Google" width={100} height={32} className="h-7 w-auto" />
            <Image src="/gemini.png" alt="Gemini AI" width={100} height={32} className="h-7 w-auto invert" />
            <Image src="/moz.png" alt="Moz" width={80} height={32} className="h-7 w-auto" />
          </div>
        </div>
      </section>

      {/* The Problem — Why This Matters */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-border/30 text-center">
        <h2 className="text-3xl font-black mb-4">Search Has Split in Two. Most Businesses Only Optimize for One.</h2>
        <p className="text-lg text-[#00e5ff] font-bold mb-6">We help you optimize for both.</p>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Old Search (2015-2024)</p>
            <p className="text-lg font-bold mb-2">Google ranks your page</p>
            <p className="text-sm text-muted-foreground leading-relaxed">You optimize keywords, build backlinks, fix technical issues. You show up in a list of 10 blue links. Users click through to your site.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] mb-3">AI Search (2025+)</p>
            <p className="text-lg font-bold mb-2">AI decides whether to cite you</p>
            <p className="text-sm text-muted-foreground leading-relaxed">ChatGPT, Gemini, and Perplexity answer questions directly. They choose which businesses to recommend. No click-through. You&apos;re either cited or invisible.</p>
          </div>
        </div>
        <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">Duelly measures both. Three scores tell you exactly where you stand: <span className="text-[#00e5ff] font-bold">SEO</span> (can Google find you), <span className="text-[#BC13FE] font-bold">AEO</span> (will AI cite you), <span className="text-[#fe3f8c] font-bold">GEO</span> (are you showing up in AI results).</p>
      </section>

      {/* What Duelly Tells You */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-4">What You Learn in Minutes</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Not another dashboard of vanity metrics. Answers to the questions that actually matter.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Bot className="h-6 w-6 text-[#00e5ff]" />, question: "Does AI recommend me?", answer: "We query ChatGPT, Gemini, Perplexity, and Google for your keywords. See exactly which engines cite you and which cite your competitors." },
            { icon: <Target className="h-6 w-6 text-[#fe3f8c]" />, question: "Why am I invisible?", answer: "AI engines need specific signals to cite you: structured data, entity clarity, factual density. We measure all of them and show what's missing." },
            { icon: <TrendingUp className="h-6 w-6 text-[#BC13FE]" />, question: "Who's beating me?", answer: "Head-to-head competitor comparisons show exactly what they have that you don't. Backlink data, schema coverage, content depth." },
            { icon: <Zap className="h-6 w-6 text-[#f59e0b]" />, question: "What do I fix first?", answer: "Every issue ranked by impact. Platform-specific instructions for WordPress, Shopify, Wix, Squarespace. Copy the fix, paste it in." },
            { icon: <BarChart3 className="h-6 w-6 text-[#00e5ff]" />, question: "How do I compare to top sites?", answer: "Search any keyword, score every top-ranking site, and see exactly where you fall short. Google Rank vs AI Rank side by side." },
            { icon: <Shield className="h-6 w-6 text-[#22c55e]" />, question: "Is my site technically healthy?", answer: "Core Web Vitals, response time, HTTPS, schema markup, alt text coverage. The same signals Google and AI engines evaluate." },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border/30 bg-card/30 space-y-3">
              {item.icon}
              <p className="text-lg font-bold">{item.question}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools — How We Answer Those Questions */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-4">Five Tools. One Platform.</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Each tool answers a different visibility question. Use them together for the full picture.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-5 w-5 text-[#00e5ff]" />
              <h3 className="text-lg font-bold">AI Visibility Check</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] font-bold">5 credits</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Query Google, ChatGPT, Gemini, and Perplexity for your keyword. See which engines recommend you, which recommend competitors, and where you&apos;re invisible.
            </p>
            <Link href="/ai-test" className="text-sm font-semibold text-[#00e5ff] hover:underline flex items-center gap-1">
              Check My Visibility <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#BC13FE]/30 bg-[#BC13FE]/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-[#BC13FE]" />
              <h3 className="text-lg font-bold">Pro Audit</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#BC13FE]/20 text-[#BC13FE] font-bold">10 credits</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Deep AI analysis of a single page. Get your SEO, AEO, and GEO scores plus up to 15 prioritized fix instructions written for your specific platform.
            </p>
            <Link href="/pro-audit" className="text-sm font-semibold text-[#BC13FE] hover:underline flex items-center gap-1">
              Run Pro Audit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#fe3f8c]/30 bg-[#fe3f8c]/5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-[#fe3f8c]" />
              <h3 className="text-lg font-bold">Deep Scan</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#fe3f8c]/20 text-[#fe3f8c] font-bold">30 credits</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Crawl up to 5 pages and find sitewide patterns. Duplicate titles, missing schemas, thin content, and the systemic issues dragging your whole domain down.
            </p>
            <Link href="/deep-scan" className="text-sm font-semibold text-[#fe3f8c] hover:underline flex items-center gap-1">
              Run Deep Scan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-[#f59e0b]" />
              <h3 className="text-lg font-bold">Competitor Duel</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] font-bold">10 credits</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Head-to-head comparison against any competitor. See their scores, backlinks, and gaps. Get AI-generated strategies to overtake them.
            </p>
            <Link href="/battle-mode" className="text-sm font-semibold text-[#f59e0b] hover:underline flex items-center gap-1">
              Start a Duel <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="mt-6">
          <div className="p-6 rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-[#22c55e]" />
              <h3 className="text-lg font-bold">Keyword Arena</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] font-bold">10 credits</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Search any keyword and score every top-ranking site. Compare Google Rank vs AI Rank and find exactly where you need to improve to climb.
            </p>
          </div>
        </div>
      </section>

      {/* Price Callout */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-border/30">
        <div className="text-center p-8 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 max-w-2xl mx-auto">
          <p className="text-3xl font-black text-foreground mb-2">$79.99. One time. No subscription.</p>
          <p className="text-muted-foreground">180 credits. Enough to check your AI visibility, audit your homepage, scan your top pages, and duel your biggest competitor. Credits never expire.</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: <Globe className="h-5 w-5" />, title: 'Enter Your URL', desc: 'Paste any website. No code changes, no installation required.', color: '#00e5ff' },
            { step: '2', icon: <Brain className="h-5 w-5" />, title: 'AI Reads Your Site', desc: 'Gemini AI evaluates your content the same way AI search engines do.', color: '#BC13FE' },
            { step: '3', icon: <BarChart3 className="h-5 w-5" />, title: 'See Your Visibility', desc: 'Three scores show if Google, AI engines, and generative search can find you.', color: '#fe3f8c' },
            { step: '4', icon: <Target className="h-5 w-5" />, title: 'Get Found', desc: 'Platform-specific fixes tell you exactly what to change. WordPress, Shopify, Wix, whatever you run.', color: '#f59e0b' },
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

      {/* Old vs New Positioning */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-8">This Is Not Another SEO Tool</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-4 border-b border-r border-white/10 bg-white/[0.02]">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Traditional SEO Tools</p>
            </div>
            <div className="p-4 border-b border-white/10 bg-[#00e5ff]/5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00e5ff]">Duelly</p>
            </div>
            {[
              ['Optimize for Google rankings', 'Optimize for AI recommendations'],
              ['Keyword-first', 'Citation-first'],
              ['SEO only', 'SEO + AEO + GEO'],
              ['Technical dashboards', 'Actionable visibility intelligence'],
              ['$100-500/month subscriptions', '$79.99 one-time, credits never expire'],
            ].map(([old, duelly], i) => (
              <div key={i} className="contents">
                <div className="p-4 border-b border-r border-white/10 text-sm text-muted-foreground">{old}</div>
                <div className="p-4 border-b border-white/10 text-sm font-medium text-foreground">{duelly}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-border/30">
        <h2 className="text-3xl font-black text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'What does "AI Visibility" actually mean?',
              a: 'It means whether AI-powered search engines (ChatGPT, Gemini, Perplexity, Google AI Overviews) would recommend your business when someone asks a relevant question. If you\'re not visible to AI, you\'re missing a growing share of how people find businesses.',
            },
            {
              q: 'How is this different from a regular SEO audit?',
              a: 'Traditional SEO tools measure if Google can crawl and rank your page. Duelly also measures if AI engines can understand, trust, and cite your content. That requires different signals: structured data quality, entity density, factual accuracy, and citation likelihood.',
            },
            {
              q: 'What are SEO, AEO, and GEO scores?',
              a: 'SEO (0-100) measures traditional search health. AEO (Answer Engine Optimization, 0-100) measures if AI engines will cite you as a source. GEO (Generative Engine Optimization, 0-100) measures if you show up in AI-generated results. Together they give you the full visibility picture.',
            },
            {
              q: 'How much does it cost?',
              a: 'Credit packs start at $79.99 for 180 credits. AI Visibility Check costs 5 credits, Pro Audit costs 10, Competitor Duel costs 10, Keyword Arena costs 10, Deep Scan costs 30. No subscription. Credits never expire.',
            },
            {
              q: 'What platforms do you support?',
              a: 'Duelly automatically detects WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Hugo, and more. Every fix instruction is tailored to your specific platform.',
            },
            {
              q: 'How long does an audit take?',
              a: 'AI Visibility Check takes about 30 seconds. Pro Audit takes 60-90 seconds. Deep Scan takes 2-3 minutes. Results are delivered in real-time as the analysis progresses.',
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
              { '@type': 'Question', name: 'What does "AI Visibility" actually mean?', acceptedAnswer: { '@type': 'Answer', text: 'It means whether AI-powered search engines (ChatGPT, Gemini, Perplexity, Google AI Overviews) would recommend your business when someone asks a relevant question.' } },
              { '@type': 'Question', name: 'How is this different from a regular SEO audit?', acceptedAnswer: { '@type': 'Answer', text: 'Traditional SEO tools measure if Google can crawl and rank your page. Duelly also measures if AI engines can understand, trust, and cite your content.' } },
              { '@type': 'Question', name: 'What are SEO, AEO, and GEO scores?', acceptedAnswer: { '@type': 'Answer', text: 'SEO measures traditional search health. AEO measures if AI engines will cite you. GEO measures if you show up in AI-generated results.' } },
              { '@type': 'Question', name: 'How much does it cost?', acceptedAnswer: { '@type': 'Answer', text: 'Credit packs start at $79.99 for 180 credits. No subscription. Credits never expire.' } },
              { '@type': 'Question', name: 'What platforms do you support?', acceptedAnswer: { '@type': 'Answer', text: 'WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Hugo, and more. Every fix is platform-specific.' } },
              { '@type': 'Question', name: 'How long does an audit take?', acceptedAnswer: { '@type': 'Answer', text: 'AI Visibility Check takes 30 seconds. Pro Audit takes 60-90 seconds. Deep Scan takes 2-3 minutes.' } },
            ],
          }),
        }}
      />

      {/* Bottom CTA */}
      </article>
      <section className="max-w-6xl mx-auto px-6 py-20 text-center border-t border-border/30">
        <h2 className="text-3xl font-black mb-4">AI Is Already Deciding Who Gets Recommended.</h2>
        <p className="text-muted-foreground mb-3 max-w-xl mx-auto">
          Every day you don&apos;t check, competitors are getting cited instead of you. Find out where you stand in 2 minutes.
        </p>
        <p className="text-sm font-bold text-[#00e5ff] mb-8">$79.99. No subscription. Credits never expire.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-lg transition-colors shadow-lg shadow-[#00e5ff]/20"
          >
            Check My Visibility Free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/20 hover:border-[#BC13FE]/50 hover:bg-[#BC13FE]/5 font-bold text-lg transition-colors"
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
                <li><Link href="/ai-test" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Visibility</Link></li>
                <li><Link href="/pro-audit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pro Audit</Link></li>
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
            <p className="text-sm text-muted-foreground">&copy; 2026 Duelly. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/50">Built by <a href="https://fundylogic.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">Fundylogic.com</a></p>
          </div>
        </div>
      </footer>
    </main>
  )
}
