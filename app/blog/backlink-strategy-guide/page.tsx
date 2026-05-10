import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ExternalLink, CheckCircle2, AlertTriangle, Star, Shield, Zap, Target, TrendingUp, BookOpen, Users, Globe, Award, DollarSign } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'The Complete Backlink Strategy Guide for Small Businesses (2026)',
  description: 'Everything you need to know about building backlinks in 2026. DIY tactics, professional services, what to avoid, and how backlinks affect both Google and AI search visibility.',
  alternates: { canonical: '/blog/backlink-strategy-guide' },
  openGraph: {
    title: 'The Complete Backlink Strategy Guide for Small Businesses (2026)',
    description: 'Everything you need to know about building backlinks in 2026. DIY tactics, professional services, what to avoid, and how backlinks affect both Google and AI search visibility.',
    url: 'https://duelly.ai/blog/backlink-strategy-guide',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Complete Backlink Strategy Guide for Small Businesses (2026)',
    description: 'Everything you need to know about building backlinks in 2026. DIY tactics, professional services, what to avoid, and how backlinks affect both Google and AI search visibility.',
  },
}

export default function BacklinkStrategyGuidePage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The Complete Backlink Strategy Guide for Small Businesses (2026)',
        description: 'Everything you need to know about building backlinks in 2026. DIY tactics, professional services, what to avoid, and how backlinks affect both Google and AI search visibility.',
        author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
        datePublished: '2026-05-10',
        dateModified: '2026-05-10',
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://duelly.ai/blog/backlink-strategy-guide' },
      }) }} />
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded">Guide</span>
          <span className="text-xs text-muted-foreground ml-3">May 10, 2026 · 18 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">The Complete Backlink Strategy Guide for Small Businesses</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Backlinks remain the single most powerful off-page ranking factor in 2026 — for both traditional Google search and the new wave of AI search engines. If your competitors have stronger backlink profiles than you, they will outrank you regardless of how good your on-page SEO is. This guide covers everything: why backlinks matter more than ever, exactly how to build them yourself, when to hire professionals, and how to avoid the mistakes that get sites penalized.
          </p>

          {/* Table of Contents */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-6 my-8">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">In This Guide</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {[
                { href: '#why-backlinks-matter', label: 'Why Backlinks Still Matter in 2026' },
                { href: '#backlinks-and-ai', label: 'Backlinks & AI Search Engines' },
                { href: '#anatomy', label: 'Anatomy of a Quality Backlink' },
                { href: '#diy-strategies', label: '12 DIY Backlink Strategies' },
                { href: '#local-business', label: 'Local Business Link Building' },
                { href: '#content-that-earns-links', label: 'Content That Earns Links' },
                { href: '#what-to-avoid', label: 'What to Avoid (Penalties & Risks)' },
                { href: '#measuring-progress', label: 'Measuring Your Progress' },
                { href: '#when-to-hire', label: 'When to Hire a Professional' },
                { href: '#recommended-services', label: 'Recommended Link Building Services' },
                { href: '#budget-guide', label: 'Budget Guide: What to Expect' },
                { href: '#90-day-plan', label: 'Your 90-Day Backlink Plan' },
              ].map(item => (
                <a key={item.href} href={item.href} className="text-muted-foreground hover:text-[#00e5ff] transition-colors flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-[#00e5ff] shrink-0" /> {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Section 1: Why Backlinks Matter */}
          <h2 id="why-backlinks-matter" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Why Backlinks Still Matter in 2026</h2>
          <p className="text-muted-foreground leading-relaxed">
            Google&apos;s algorithm uses hundreds of signals to rank websites, but backlinks have remained in the top 3 since the search engine launched in 1998. The reason is simple: links are hard to fake at scale. When a reputable website links to yours, it&apos;s a genuine signal that your content is trustworthy and valuable.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The data is clear. Pages ranking #1 on Google have an average of 3.8x more backlinks than pages in positions 2–10. Pages with zero referring domains almost never appear on page 1 for any keyword with commercial intent. And domain authority — which is primarily driven by backlinks — correlates more strongly with rankings than any other single metric.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For small businesses, this creates both a challenge and an opportunity. Most of your local competitors aren&apos;t actively building backlinks. If you invest even modest effort into a deliberate strategy, you can leapfrog them in months rather than years.
          </p>

          {/* Section 2: Backlinks & AI */}
          <h2 id="backlinks-and-ai" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">How Backlinks Affect AI Search Visibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Here&apos;s what most people don&apos;t realize: backlinks don&apos;t just help you rank on Google. They directly influence whether AI search engines like ChatGPT, Gemini, and Perplexity recommend your business.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            AI models are trained on web data, and they learn which sources are authoritative by analyzing link patterns. When multiple trusted websites link to your business, AI models learn to associate your brand with authority in your space. This means:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> Sites with strong backlink profiles are more likely to be cited by AI search engines</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> Mentions on high-authority sites create &ldquo;training data signals&rdquo; that AI models pick up</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> Diverse backlinks from multiple domains signal broad consensus about your authority</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> AI engines use real-time web search (which relies on Google&apos;s index) to generate recommendations</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            In other words, building backlinks is now a dual-purpose investment. You&apos;re improving your Google rankings AND increasing the likelihood that AI assistants recommend your business when people ask for help.
          </p>

          {/* Section 3: Anatomy */}
          <h2 id="anatomy" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Anatomy of a Quality Backlink</h2>
          <p className="text-muted-foreground leading-relaxed">
            Not all backlinks are equal. Understanding what makes a link valuable helps you prioritize your efforts and avoid wasting time on links that won&apos;t move the needle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {[
              { icon: <Shield className="h-5 w-5 text-[#22c55e]" />, title: 'Domain Authority', desc: 'A link from a DA 60 site is worth exponentially more than a DA 10 site. Prioritize quality over quantity.' },
              { icon: <Target className="h-5 w-5 text-[#00e5ff]" />, title: 'Relevance', desc: 'A link from a site in your industry or local area carries more weight than a random unrelated site.' },
              { icon: <Zap className="h-5 w-5 text-[#f59e0b]" />, title: 'Dofollow vs Nofollow', desc: 'Dofollow links pass ranking authority. Nofollow links (social media, some directories) don\'t directly boost rankings but still drive traffic.' },
              { icon: <Globe className="h-5 w-5 text-[#BC13FE]" />, title: 'Anchor Text', desc: 'The clickable text of the link matters. Natural, varied anchor text is ideal. Over-optimized exact-match anchors look spammy.' },
              { icon: <TrendingUp className="h-5 w-5 text-[#fe3f8c]" />, title: 'Link Placement', desc: 'Links within the main body content are worth more than links in footers, sidebars, or author bios.' },
              { icon: <Users className="h-5 w-5 text-[#22c55e]" />, title: 'Linking Domain Diversity', desc: '10 links from 10 different domains beats 100 links from 1 domain. Google values breadth of endorsement.' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-card/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <p className="text-sm font-bold">{item.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Section 4: DIY Strategies */}
          <h2 id="diy-strategies" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">12 DIY Backlink Strategies (Ranked by Effectiveness)</h2>
          <p className="text-muted-foreground leading-relaxed">
            These are proven tactics you can execute yourself without hiring anyone. They&apos;re ordered from highest impact to lowest, with realistic time estimates.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">1. Google Business Profile & Core Directories</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">HIGH IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 2–4 hours one-time</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Claim and complete your profiles on every relevant platform. Each one is a backlink plus a citation signal. Start with these:
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm mt-3">
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Google Business Profile (essential — also powers Google Maps)</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Bing Places for Business</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Apple Business Connect</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Yelp, Yellow Pages, BBB</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Industry-specific directories (Houzz for contractors, Avvo for lawyers, Healthgrades for doctors)</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Local directories (your city&apos;s business directory, regional tourism sites)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            <strong className="text-foreground">Pro tip:</strong> Make sure your Name, Address, and Phone (NAP) are identical across every listing. Inconsistencies confuse Google and weaken the signal.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">2. Chamber of Commerce & Business Associations</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">HIGH IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 1 hour + annual fee ($200–$600)</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Chamber of Commerce websites typically have Domain Authority between 40 and 70. That&apos;s higher than most sites you&apos;ll ever get a link from. For the cost of an annual membership, you get a high-quality dofollow backlink, a listing in their member directory, networking opportunities, and often event sponsorship options that generate additional links.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Also look into: trade associations, professional organizations, alumni networks, and any industry body that maintains a member directory online.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">3. Local Media & Digital PR</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">HIGH IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ Ongoing, 1–2 hours/week</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Local news websites often have DA 50–80. A single link from your local newspaper or TV station website can be worth more than months of other link building. Here&apos;s how to get covered:
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm mt-3">
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Sponsor a local event, charity run, or community initiative</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Offer yourself as an expert source — email reporters covering your industry</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Write a press release when you hit a milestone (10 years in business, new location, award)</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Respond to journalist queries on platforms like Connectively (formerly HARO), Qwoted, or SourceBottle</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Host a free workshop or webinar and pitch it to local media as a community resource</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-3">4. Guest Posting on Industry Blogs</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">MEDIUM IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 3–5 hours per post</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Write a genuinely useful article for a blog in your industry. Not a sales pitch — real value. In exchange, you get an author bio with a link back to your site, and sometimes an in-content link. Target blogs with DA 30+ and real readership. Avoid &ldquo;guest post farms&rdquo; that accept anything — those are worthless.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">How to find opportunities:</strong> Search Google for &ldquo;[your industry] + write for us&rdquo; or &ldquo;[your industry] + guest post.&rdquo; Check the site&apos;s DA before investing time. Look at where your competitors have been published.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">5. Resource Page Link Building</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">MEDIUM IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 2–3 hours per batch of outreach</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Many websites maintain &ldquo;resource pages&rdquo; — curated lists of helpful links on a topic. If you have content that fits, you can email the site owner and ask to be included. Search for &ldquo;[your topic] + resources&rdquo; or &ldquo;[your topic] + useful links&rdquo; to find these pages. Success rate is typically 5–15%, so send 20+ outreach emails per batch.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">6. Broken Link Building</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">MEDIUM IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 3–4 hours per campaign</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Find pages in your niche that link to dead (404) URLs. Create content that replaces what the dead page used to offer. Email the site owner: &ldquo;Hey, I noticed your resource page links to [dead URL] which no longer works. I have a similar resource at [your URL] that might be a good replacement.&rdquo; You&apos;re helping them fix their site while earning a link. Win-win.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Tools:</strong> Use Ahrefs&apos; broken link checker, Check My Links (Chrome extension), or Screaming Frog to find broken links on target sites.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">7. Unlinked Brand Mentions</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">MEDIUM IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 1–2 hours/month</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            People may already be mentioning your business online without linking to you. Set up Google Alerts for your business name, owner name, and product names. When you find a mention without a link, email the author and politely ask them to add one. Conversion rate is high (30–50%) because they already know and trust you enough to mention you.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">8. Supplier & Partner Links</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">MEDIUM IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 1–2 hours one-time</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Many suppliers, manufacturers, and software companies maintain &ldquo;partner&rdquo; or &ldquo;where to buy&rdquo; pages. If you sell or use their products, ask to be listed. Similarly, if you have business partners, vendors, or complementary service providers, propose mutual linking. A landscaper and a pool company. A wedding photographer and a florist. A dentist and an orthodontist. These are natural, relevant links.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">9. Testimonials & Case Studies</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">MEDIUM IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 30 minutes each</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Write a testimonial for a product or service you genuinely use. Most companies publish testimonials on their website with a link back to the reviewer&apos;s site. Think about every SaaS tool, supplier, or service provider you use — each one is a potential backlink opportunity. Similarly, if a vendor wants to write a case study about how you use their product, say yes.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">10. Community Involvement & Sponsorships</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff]">STEADY IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ Varies ($100–$1,000+)</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Sponsor a local sports team, charity event, school program, or community organization. Most will list sponsors on their website with a link. These are legitimate, high-quality links from .org and .edu domains that Google values highly. Even small sponsorships ($100–$250) often get you a link on a page with strong authority.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">11. Create Original Research or Data</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff]">STEADY IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 5–10 hours one-time, links accumulate over months</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Original data is link bait. Survey your customers, compile industry statistics, or analyze trends in your market. Publish the results as a report or infographic. Journalists and bloggers constantly need data to cite — if yours is the source, you earn links passively for months or years. A local real estate agent publishing quarterly market reports. A restaurant owner surveying dining trends. A contractor publishing renovation cost data for your region.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">12. Podcast & Interview Appearances</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff]">STEADY IMPACT</span>
            <span className="text-[10px] text-muted-foreground">⏱ 1–2 hours per appearance</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Appear as a guest on podcasts or YouTube channels in your industry. Most shows publish episode pages with links to their guests&apos; websites. Search for podcasts in your niche, pitch yourself as a guest with a specific topic you can speak on, and you&apos;ll earn a backlink plus brand exposure. Platforms like Podchaser and MatchMaker.fm help you find relevant shows.
          </p>

          {/* Section 5: Local Business */}
          <h2 id="local-business" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Local Business Link Building</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you serve a specific geographic area, local link building deserves special attention. Local links send powerful relevance signals to Google about where you operate.
          </p>

          <div className="rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-6 my-6">
            <p className="text-sm font-bold text-[#22c55e] mb-3">Local Link Building Checklist</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {[
                'Chamber of Commerce membership (DA 40–70)',
                'Local business associations and BNI groups',
                'City/town business directory',
                'Regional tourism board website',
                'Local newspaper or community blog',
                'Sponsor a local sports team or school event',
                'Partner with complementary local businesses for cross-links',
                'Get listed on your city\'s "shop local" or "support local" page',
                'Contribute to local community forums or Facebook groups (with website link)',
                'Offer a scholarship to a local school (earns .edu links)',
                'Participate in local awards programs (often listed on organizer\'s site)',
                'Join your local BIA (Business Improvement Area) if applicable',
              ].map((item, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 6: Content That Earns Links */}
          <h2 id="content-that-earns-links" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Content That Naturally Earns Links</h2>
          <p className="text-muted-foreground leading-relaxed">
            The best long-term backlink strategy is creating content so useful that people link to it without you asking. Here are the content formats that consistently earn the most backlinks:
          </p>

          <div className="space-y-4 my-6">
            {[
              { title: 'Ultimate Guides', desc: 'Comprehensive, definitive resources on a topic. This page you\'re reading is an example. When someone needs to reference "how to build backlinks," they link to the best guide they can find.', example: '"The Complete Guide to Home Renovation Costs in [Your City]"' },
              { title: 'Original Research & Surveys', desc: 'Data that doesn\'t exist anywhere else. Journalists and bloggers need sources to cite. Be the source.', example: '"We surveyed 500 homeowners about their renovation budgets. Here\'s what we found."' },
              { title: 'Free Tools & Calculators', desc: 'Interactive tools that solve a problem. People link to useful tools constantly.', example: 'A mortgage calculator, a project cost estimator, a tax deadline tracker.' },
              { title: 'Local Resource Lists', desc: 'Curated lists of resources for your area. These become go-to references that other local sites link to.', example: '"50 Free Things to Do in [Your City] This Summer"' },
              { title: 'Expert Roundups', desc: 'Interview 10–20 experts in your field and compile their answers. Each expert will likely share and link to the piece.', example: '"We asked 15 local contractors: What\'s the #1 mistake homeowners make?"' },
              { title: 'Infographics & Visual Data', desc: 'Visual content gets shared and embedded more than text. Create an infographic summarizing complex data in your industry.', example: 'A visual breakdown of where your city\'s tax dollars go, or a timeline of your industry\'s evolution.' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-card/30 p-4">
                <p className="text-sm font-bold mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                <p className="text-xs text-[#00e5ff] italic">{item.example}</p>
              </div>
            ))}
          </div>

          {/* Section 7: What to Avoid */}
          <h2 id="what-to-avoid" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">What to Avoid: Penalties & Risks</h2>
          <p className="text-muted-foreground leading-relaxed">
            Google&apos;s spam team actively penalizes manipulative link building. A penalty can drop your site from page 1 to page 10 overnight — or remove it from the index entirely. Here&apos;s what to never do:
          </p>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 my-6 space-y-3">
            {[
              { title: 'Buying cheap backlinks', desc: 'Services offering "1,000 links for $50" or "guaranteed DA 50+ links" are selling spam. These links come from link farms, PBNs (private blog networks), or hacked sites. Google detects and penalizes these.' },
              { title: 'Link exchanges at scale', desc: '"I\'ll link to you if you link to me" is fine between genuine partners. Doing it with 50+ random sites is a link scheme that Google penalizes.' },
              { title: 'PBN (Private Blog Network) links', desc: 'Networks of fake websites created solely to sell links. Google has gotten extremely good at detecting these. The risk far outweighs any short-term benefit.' },
              { title: 'Automated link building software', desc: 'Tools that auto-submit your site to hundreds of directories, forums, or comment sections. These create spammy, low-quality links that can trigger a manual penalty.' },
              { title: 'Irrelevant directory spam', desc: 'Submitting to every directory you can find regardless of relevance. A dentist listed on a gaming directory looks unnatural. Stick to relevant, legitimate directories.' },
              { title: 'Exact-match anchor text manipulation', desc: 'If every link pointing to your site uses the exact same keyword as anchor text, it looks manipulative. Natural backlink profiles have diverse, varied anchor text.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-400">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">The rule of thumb:</strong> If a link building tactic feels like a shortcut or seems too easy, it&apos;s probably something Google will penalize. Legitimate link building takes effort — that&apos;s exactly why it works as a ranking signal.
          </p>

          {/* Section 8: Measuring Progress */}
          <h2 id="measuring-progress" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Measuring Your Progress</h2>
          <p className="text-muted-foreground leading-relaxed">
            Track these metrics monthly to see if your backlink strategy is working:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {[
              { metric: 'Referring Domains', target: 'Growing month over month', tool: 'Ahrefs, Moz, or Google Search Console' },
              { metric: 'Domain Authority', target: '+2–5 points per quarter is good progress', tool: 'Moz Link Explorer (free)' },
              { metric: 'Organic Traffic', target: 'Should increase as DA grows', tool: 'Google Analytics or Search Console' },
              { metric: 'Keyword Rankings', target: 'Target keywords moving up', tool: 'Duelly AI Visibility, Ahrefs, or SEMrush' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-card/30 p-4">
                <p className="text-sm font-bold mb-1">{item.metric}</p>
                <p className="text-xs text-[#22c55e] mb-1">{item.target}</p>
                <p className="text-xs text-muted-foreground">{item.tool}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Free tools to monitor your backlinks:</strong>
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> <a href="https://search.google.com/search-console/about" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Google Search Console</a> — see who links to you (Links section)</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> <a href="https://ahrefs.com/backlink-checker" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Ahrefs Free Backlink Checker</a> — top 100 backlinks for any domain</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> <a href="https://moz.com/link-explorer" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Moz Link Explorer</a> — DA score and top linking domains (10 free queries/month)</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> <strong className="text-foreground">Duelly Pro Audit</strong> — includes backlink intelligence powered by Moz with your audit results</li>
          </ul>

          {/* Section 9: When to Hire */}
          <h2 id="when-to-hire" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">When to Hire a Professional</h2>
          <p className="text-muted-foreground leading-relaxed">
            DIY link building works, but it&apos;s time-intensive. Here&apos;s when it makes sense to bring in professional help:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> You&apos;ve done the basics (directories, partnerships) and need to scale</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> You&apos;re in a competitive niche where competitors have 100+ referring domains</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> You don&apos;t have 5–10 hours per month to dedicate to outreach</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> You need links from high-DA publications (DA 50+) that require professional outreach</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-1" /> You want to accelerate growth — professional services can build in 3 months what takes 12 months DIY</li>
          </ul>

          <div className="rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-5 my-6">
            <p className="text-sm font-bold text-[#f59e0b] mb-2">⚠️ How to Vet a Link Building Service</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">Before hiring anyone, ask these questions:</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-[#f59e0b] font-bold shrink-0">1.</span> Can you show me examples of links you&apos;ve built for other clients? (They should be on real, recognizable sites)</li>
              <li className="flex gap-2"><span className="text-[#f59e0b] font-bold shrink-0">2.</span> What&apos;s your process? (Should involve content creation and genuine outreach, not buying links)</li>
              <li className="flex gap-2"><span className="text-[#f59e0b] font-bold shrink-0">3.</span> Do you guarantee specific numbers of links? (Red flag — legitimate outreach has variable results)</li>
              <li className="flex gap-2"><span className="text-[#f59e0b] font-bold shrink-0">4.</span> What DA range do you target? (Should be DA 30+ minimum for most links)</li>
              <li className="flex gap-2"><span className="text-[#f59e0b] font-bold shrink-0">5.</span> Do you use PBNs or paid placements? (If yes, walk away)</li>
              <li className="flex gap-2"><span className="text-[#f59e0b] font-bold shrink-0">6.</span> Can I see a monthly report of links built? (Transparency is non-negotiable)</li>
            </ul>
          </div>

          {/* Section 10: Recommended Services */}
          <h2 id="recommended-services" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Recommended Link Building Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you decide to hire help, these are established, reputable companies known for white-hat link building. We&apos;re not affiliated with any of them — this is an editorial recommendation based on industry reputation, transparency of process, and track record.
          </p>

          <div className="space-y-4 my-6">
            {[
              {
                name: 'uSERP',
                url: 'https://userp.io',
                best: 'SaaS, tech companies, and businesses wanting links from major publications',
                approach: 'Digital PR and content-driven link building. They create original content and pitch it to journalists and editors at high-DA publications.',
                price: '$5,000–$15,000/month',
                minDa: 'DA 50+ placements typical',
              },
              {
                name: 'The HOTH',
                url: 'https://www.thehoth.com',
                best: 'Small businesses wanting affordable, managed link building',
                approach: 'Guest posting, blogger outreach, and managed link building packages. They handle content creation and outreach. Multiple tiers from starter to enterprise.',
                price: '$500–$5,000/month',
                minDa: 'DA 20–60 depending on package',
              },
              {
                name: 'Fat Joe',
                url: 'https://fatjoe.com',
                best: 'Agencies and businesses wanting à la carte link building',
                approach: 'Blogger outreach with content creation included. You choose the DA level and number of links. Transparent pricing per link.',
                price: '$100–$500 per link (varies by DA target)',
                minDa: 'DA 10–50+ options available',
              },
              {
                name: 'Authority Builders',
                url: 'https://www.yourauthoritybuilders.com',
                best: 'Businesses wanting curated, high-quality placements on real sites',
                approach: 'Marketplace model — they vet real websites and facilitate genuine guest post placements. You can browse available sites and choose where you want links.',
                price: '$150–$1,000+ per link',
                minDa: 'DA 20–80 sites available',
              },
              {
                name: 'Stellar SEO',
                url: 'https://www.stellarseo.com',
                best: 'Local businesses and service companies wanting white-hat link building',
                approach: 'Custom outreach campaigns, digital PR, and content marketing. They focus on building relationships with publishers rather than transactional link buying.',
                price: '$2,500–$10,000/month',
                minDa: 'DA 40+ focus',
              },
            ].map((service, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-5 hover:border-[#22c55e]/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#22c55e]" />
                    <h3 className="text-base font-bold">{service.name}</h3>
                  </div>
                  <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00e5ff] hover:underline flex items-center gap-1">
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-[#22c55e] font-medium mb-2">Best for: {service.best}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{service.approach}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3 w-3" /> {service.price}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3 w-3" /> {service.minDa}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/50 bg-card/30 p-4 my-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Disclaimer:</strong> Duelly is not affiliated with, sponsored by, or receiving compensation from any of the services listed above. These recommendations are based on publicly available information about each company&apos;s reputation, methodology, and client results. Always do your own due diligence before hiring any service provider.
            </p>
          </div>

          {/* Section 11: Budget Guide */}
          <h2 id="budget-guide" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Budget Guide: What to Expect to Spend</h2>
          <p className="text-muted-foreground leading-relaxed">
            Link building costs vary enormously. Here&apos;s a realistic breakdown of what different budget levels can achieve:
          </p>

          <div className="space-y-4 my-6">
            {[
              { level: '$0/month (DIY Only)', color: '#22c55e', results: '2–5 new links/month', timeline: '6–12 months to see meaningful ranking improvements', desc: 'Directory submissions, partnership links, testimonials, community involvement. Requires 5–10 hours/month of your time. Best for businesses just starting out or with very limited budgets.' },
              { level: '$500–$2,000/month', color: '#00e5ff', results: '5–15 new links/month', timeline: '3–6 months to see ranking improvements', desc: 'Managed guest posting and blogger outreach. A mix of DA 20–40 links with occasional DA 50+ placements. Good for local businesses in moderately competitive markets.' },
              { level: '$2,000–$5,000/month', color: '#f59e0b', results: '10–25 new links/month', timeline: '2–4 months to see significant movement', desc: 'Professional outreach campaigns targeting DA 40+ sites. Includes content creation, digital PR, and relationship-based link building. Appropriate for businesses in competitive niches.' },
              { level: '$5,000–$15,000/month', color: '#BC13FE', results: '15–40+ new links/month', timeline: '1–3 months to see major ranking shifts', desc: 'Full-service digital PR with placements in major publications (DA 60–90). Custom content campaigns, journalist relationships, and brand-building links. For businesses competing at a national level or in highly competitive industries.' },
            ].map((tier, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-card/30 p-5" style={{ borderLeftColor: tier.color, borderLeftWidth: '3px' }}>
                <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.level}</p>
                <div className="flex items-center gap-4 mt-1 mb-2 text-xs text-muted-foreground">
                  <span>📈 {tier.results}</span>
                  <span>⏱ {tier.timeline}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>

          {/* Section 12: 90-Day Plan */}
          <h2 id="90-day-plan" className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">Your 90-Day Backlink Plan</h2>
          <p className="text-muted-foreground leading-relaxed">
            Here&apos;s a practical, week-by-week plan to build your first 20+ quality backlinks in 90 days. No budget required — just time and effort.
          </p>

          <div className="space-y-4 my-6">
            <div className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/5 p-5">
              <p className="text-sm font-bold text-[#22c55e] mb-2">Weeks 1–2: Foundation</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>☐ Claim/complete Google Business Profile</li>
                <li>☐ Submit to 10 relevant directories (Yelp, BBB, industry-specific)</li>
                <li>☐ Set up Google Alerts for your business name</li>
                <li>☐ Check current backlink profile with Moz or Ahrefs free tools</li>
                <li>☐ Identify 5 local partners who could link to you</li>
                <li className="text-[#22c55e] font-medium mt-2">Expected links earned: 10–15</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#00e5ff]/30 bg-[#00e5ff]/5 p-5">
              <p className="text-sm font-bold text-[#00e5ff] mb-2">Weeks 3–4: Partnerships & Outreach</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>☐ Email 5 local partners requesting mutual links</li>
                <li>☐ Join Chamber of Commerce (if not already a member)</li>
                <li>☐ Write 2–3 testimonials for products/services you use</li>
                <li>☐ Find and claim any unlinked brand mentions</li>
                <li>☐ Research 10 resource pages in your niche for outreach</li>
                <li className="text-[#00e5ff] font-medium mt-2">Expected links earned: 5–8</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-5">
              <p className="text-sm font-bold text-[#f59e0b] mb-2">Weeks 5–8: Content & PR</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>☐ Create one &ldquo;linkable asset&rdquo; (guide, tool, local resource list, or data piece)</li>
                <li>☐ Pitch 3 local media outlets with a story angle</li>
                <li>☐ Send 20 resource page outreach emails</li>
                <li>☐ Pitch 2–3 industry blogs for guest posts</li>
                <li>☐ Identify a local sponsorship opportunity ($100–$500)</li>
                <li className="text-[#f59e0b] font-medium mt-2">Expected links earned: 5–10</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#BC13FE]/30 bg-[#BC13FE]/5 p-5">
              <p className="text-sm font-bold text-[#BC13FE] mb-2">Weeks 9–12: Scale & Repeat</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>☐ Publish guest post(s) and promote your linkable asset</li>
                <li>☐ Follow up on all outreach from weeks 5–8</li>
                <li>☐ Pitch 2 podcasts or local interview opportunities</li>
                <li>☐ Review progress: check DA, new referring domains, ranking changes</li>
                <li>☐ Plan next quarter based on what worked best</li>
                <li className="text-[#BC13FE] font-medium mt-2">Expected links earned: 5–10</li>
              </ul>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Total expected result after 90 days:</strong> 25–43 new backlinks from legitimate sources, a measurable increase in Domain Authority, and the beginning of improved rankings for your target keywords. Most importantly, you&apos;ll have built a repeatable system you can continue running quarter after quarter.
          </p>

          {/* Final CTA */}
          <div className="mt-12 p-8 rounded-2xl border border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5 text-center">
            <h3 className="text-xl font-black mb-3">See Where You Stand Right Now</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
              Run a Pro Audit on your site to see your current Domain Authority, backlink profile, and exactly where you need to improve. Your audit includes Moz-powered backlink intelligence showing your top referring domains, spam score, and link quality breakdown.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors">
                Check My Visibility Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/blog/backlinks-explained" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/50 hover:border-[#00e5ff]/30 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors">
                <BookOpen className="h-4 w-4" /> Backlinks 101
              </Link>
            </div>
          </div>
        </div>
      </article>

      <PublicFooter />
    </main>
  )
}
