import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SEO vs AEO vs GEO — What\'s the Difference?',
  description: 'Traditional SEO isn\'t enough anymore. Here\'s what AEO and GEO mean for your business and why all three matter in 2026.',
  alternates: { canonical: '/blog/seo-vs-aeo-vs-geo' },
}

export default function SEOvsAEOvsGEOPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header>
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center"><img src="/logo.png" alt="Duelly" className="h-14 w-auto" /></Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> All Posts</Link>
          </div>
        </nav>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded">Guide</span>
          <span className="text-xs text-muted-foreground ml-3">March 29, 2026 · 7 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">SEO vs AEO vs GEO — What&apos;s the Difference?</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            If you run a business with a website, you&apos;ve probably heard of SEO. But in 2026, SEO alone isn&apos;t enough. Two new dimensions — AEO and GEO — determine whether your business gets found in the rapidly growing world of AI-powered search.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">SEO: Search Engine Optimization</h2>
          <p className="text-muted-foreground leading-relaxed">
            SEO is the foundation. It&apos;s about making your website rank higher in Google&apos;s traditional search results — the list of 10 blue links. SEO covers technical health (fast loading, mobile-friendly, HTTPS), content quality (relevant, well-written, properly structured), and authority (other websites linking to yours).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            SEO still matters. Google processes billions of searches daily, and most people still click on traditional results. But it&apos;s no longer the only game in town.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">AEO: Answer Engine Optimization</h2>
          <p className="text-muted-foreground leading-relaxed">
            AEO is about getting cited by AI answer engines — ChatGPT, Perplexity, Google AI Overviews, and others. When someone asks an AI a question, it doesn&apos;t show a list of websites. It gives a direct answer and cites its sources. AEO is how you become one of those sources.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            AEO focuses on: structured data (schema markup), clear Q&A formatting, entity density (specific names, numbers, facts), and content that directly answers questions rather than just promoting your services.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">GEO: Generative Engine Optimization</h2>
          <p className="text-muted-foreground leading-relaxed">
            GEO goes a step further. It&apos;s about how AI systems perceive your brand and content quality. When an AI generates a summary or recommendation, it evaluates expertise signals, objectivity, factual density, and trustworthiness. GEO measures whether AI systems see your content as authoritative enough to recommend.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Content that scores high on GEO avoids promotional language, backs up claims with data, demonstrates expertise, and maintains an objective tone. Think of it as the difference between a sales pitch and an expert resource.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How they work together</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="p-4 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
              <h3 className="font-bold text-[#00e5ff] mb-2">SEO</h3>
              <p className="text-sm text-muted-foreground">Gets you on page 1 of Google. Technical health + content + backlinks.</p>
            </div>
            <div className="p-4 rounded-xl border border-[#BC13FE]/30 bg-[#BC13FE]/5">
              <h3 className="font-bold text-[#BC13FE] mb-2">AEO</h3>
              <p className="text-sm text-muted-foreground">Gets you cited by AI assistants. Structured data + direct answers + clarity.</p>
            </div>
            <div className="p-4 rounded-xl border border-[#fe3f8c]/30 bg-[#fe3f8c]/5">
              <h3 className="font-bold text-[#fe3f8c] mb-2">GEO</h3>
              <p className="text-sm text-muted-foreground">Gets you recommended by AI. Expertise + objectivity + trust signals.</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            A site with great SEO but poor AEO will rank in Google but be invisible to ChatGPT users. A site with great AEO but poor SEO might get cited by AI but never found through traditional search. You need all three.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What should you do?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Start by understanding where you stand. Run an audit that measures all three dimensions — not just traditional SEO. Then prioritize fixes based on where your biggest gaps are. For most small businesses, the quick wins are in AEO (adding schema markup and FAQ content) because so few competitors have done it yet.
          </p>

          <div className="mt-12 p-6 rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
            <h3 className="font-bold mb-2">See your SEO, AEO, and GEO scores</h3>
            <p className="text-sm text-muted-foreground mb-4">Duelly audits your site across all three dimensions and tells you exactly what to fix.</p>
            <Link href="/free-audit" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors">
              Free Audit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'SEO vs AEO vs GEO — What\'s the Difference?',
        description: 'Traditional SEO isn\'t enough anymore. Here\'s what AEO and GEO mean for your business and why all three matter in 2026.',
        datePublished: '2026-03-29', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
    </main>
  )
}
