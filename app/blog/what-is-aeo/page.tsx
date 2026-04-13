import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'What is AEO? Answer Engine Optimization Explained',
  description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
  alternates: { canonical: '/blog/what-is-aeo' },
  openGraph: {
    title: 'What is AEO? Answer Engine Optimization Explained',
    description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
    url: 'https://duelly.ai/blog/what-is-aeo',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What is AEO? Answer Engine Optimization Explained',
    description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
  },
}

export default function WhatIsAEOPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'What is AEO? Answer Engine Optimization Explained',
        description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
        author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
        datePublished: '2026-03-15',
        dateModified: '2026-04-01',
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://duelly.ai/blog/what-is-aeo' },
      }) }} />
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BC13FE] bg-[#BC13FE]/10 px-2 py-0.5 rounded">AEO</span>
          <span className="text-xs text-muted-foreground ml-3">March 29, 2026 · 5 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">What is AEO? Answer Engine Optimization Explained</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Picture this. Someone opens <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">ChatGPT</a> and types &ldquo;best plumber in Moncton&rdquo; or asks <a href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Perplexity</a> &ldquo;how to fix a leaky faucet.&rdquo; The AI doesn&apos;t spit out ten blue links like Google does. It gives one answer. Maybe two. And if your business isn&apos;t the one getting mentioned, you basically don&apos;t exist to that person.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            That&apos;s the problem AEO solves. AEO stands for Answer Engine Optimization, and it&apos;s all about making your website&apos;s content easy for AI systems to understand, trust, and actually cite when they&apos;re pulling together an answer.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">So how is AEO different from regular SEO?</h2>
          <p className="text-muted-foreground leading-relaxed">
            With traditional SEO, you&apos;re trying to climb Google&apos;s rankings. You tweak your titles, write solid meta descriptions, nail your headings, and build backlinks so Google puts you on page one. And honestly, that still matters a lot.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            AEO is a different game though. The question it answers is: when an AI assistant needs to respond to someone, will it pull information from your website? These AI systems couldn&apos;t care less about your meta description. What they care about is whether your content clearly and directly answers the question someone just asked.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What makes content work well for AEO?</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI systems look for specific things when they&apos;re deciding which sources to cite:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Clear definitions and straight answers to the questions people actually ask</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Structured data (schema markup) that spells out what your page is about</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Real facts, actual numbers, and named entities instead of fluffy marketing speak</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Content that&apos;s well organized with clear headings and a logical flow</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Enough depth to be useful. A page with 200 words isn&apos;t going to cut it</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">Why should small businesses pay attention to this?</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI search is growing really fast. <a href="https://blog.google/products/search/generative-ai-google-search-may-2024/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Google AI Overviews</a> are showing up on a huge chunk of searches now. ChatGPT has hundreds of millions of users. When someone asks an AI &ldquo;who should I hire for [service] in [city],&rdquo; it goes looking for websites that have clear, well structured content about that exact service in that exact location.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Here&apos;s the thing. If your competitor has a detailed FAQ page, clear service descriptions, and proper schema markup, and you don&apos;t, the AI is going to recommend them instead of you. This is especially true for local businesses where the competition for AI citations is still pretty low. There&apos;s a real window of opportunity right now.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How to get started with AEO</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Add an FAQ section to your main pages with the real questions your customers ask you</li>
            <li>Make sure your business name, address, and services are clearly written out in text (not buried in images)</li>
            <li>Add schema markup to your site. At minimum, go with LocalBusiness or Organization schema</li>
            <li>Write content that actually answers questions instead of just promoting your services</li>
            <li>Run an audit with a tool like Duelly to see your AEO score and figure out what needs fixing</li>
          </ol>

          <div className="mt-12 p-6 rounded-2xl border border-[#BC13FE]/30 bg-[#BC13FE]/5">
            <h3 className="font-bold mb-2">Check your AEO score</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up to audit your site for AI search readiness.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#BC13FE] hover:bg-[#BC13FE]/90 text-white font-bold text-sm transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'What is AEO? Answer Engine Optimization Explained',
        description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
        datePublished: '2026-03-29', dateModified: '2026-04-08', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
      <PublicFooter />
    </main>
  )
}