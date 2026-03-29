import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'What is AEO? Answer Engine Optimization Explained',
  description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
  alternates: { canonical: '/blog/what-is-aeo' },
}

export default function WhatIsAEOPage() {
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
          <span className="text-xs font-bold uppercase tracking-widest text-[#BC13FE] bg-[#BC13FE]/10 px-2 py-0.5 rounded">AEO</span>
          <span className="text-xs text-muted-foreground ml-3">March 29, 2026 · 5 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">What is AEO? Answer Engine Optimization Explained</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            When someone asks ChatGPT &ldquo;best plumber in Moncton&rdquo; or Perplexity &ldquo;how to fix a leaky faucet,&rdquo; the AI doesn&apos;t show a list of 10 blue links. It gives one answer. Maybe two. If your business isn&apos;t the one being cited, you&apos;re invisible to a growing segment of searchers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            That&apos;s what AEO — Answer Engine Optimization — is about. It&apos;s the practice of making your website&apos;s content easy for AI systems to understand, trust, and cite as a source.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How is AEO different from SEO?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Traditional SEO focuses on ranking in Google&apos;s list of results. You optimize titles, meta descriptions, headings, and build backlinks so Google puts you on page one. That still matters.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            AEO focuses on a different question: when an AI assistant needs to answer a question, will it pull information from your website? AI systems don&apos;t care about your meta description. They care about whether your content clearly and directly answers the question being asked.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What makes content AEO-friendly?</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI systems look for specific signals when deciding which sources to cite:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Clear definitions and direct answers to common questions</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Structured data (schema markup) that tells AI what your page is about</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Specific facts, numbers, and named entities — not vague marketing language</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Well-organized content with clear headings and logical structure</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Sufficient depth — thin pages with 200 words won&apos;t get cited</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">Why should small businesses care?</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI search is growing fast. Google AI Overviews now appear on a significant percentage of searches. ChatGPT has hundreds of millions of users. When someone asks an AI &ldquo;who should I hire for [service] in [city],&rdquo; the AI pulls from websites that have clear, well-structured content about that service in that location.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If your competitor has a detailed FAQ page, clear service descriptions, and proper schema markup — and you don&apos;t — the AI will recommend them, not you. This is especially true for local businesses where the competition for AI citations is still relatively low.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How to get started with AEO</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Add an FAQ section to your main pages with real questions your customers ask</li>
            <li>Make sure your business name, address, and services are clearly stated (not buried in images)</li>
            <li>Add schema markup — at minimum, LocalBusiness or Organization schema</li>
            <li>Write content that directly answers questions, not just promotes your services</li>
            <li>Audit your site with a tool like Duelly to see your AEO score and what to fix</li>
          </ol>

          <div className="mt-12 p-6 rounded-2xl border border-[#BC13FE]/30 bg-[#BC13FE]/5">
            <h3 className="font-bold mb-2">Check your AEO score</h3>
            <p className="text-sm text-muted-foreground mb-4">Run a free audit to see how well your site is optimized for AI search engines.</p>
            <Link href="/free-audit" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#BC13FE] hover:bg-[#BC13FE]/90 text-white font-bold text-sm transition-colors">
              Free AEO Audit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'What is AEO? Answer Engine Optimization Explained',
        description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
        datePublished: '2026-03-29', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
    </main>
  )
}
