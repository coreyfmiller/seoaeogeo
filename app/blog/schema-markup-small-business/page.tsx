import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'Schema Markup for Small Businesses: What It Is and Why You Need It',
  description: "Schema markup sounds technical but it's one of the easiest ways to stand out in search results. Here's how to get started.",
  alternates: { canonical: '/blog/schema-markup-small-business' },
  openGraph: {
    title: 'Schema Markup for Small Businesses: What It Is and Why You Need It',
    description: "Schema markup sounds technical but it's one of the easiest ways to stand out in search results. Here's how to get started.",
    url: 'https://duelly.ai/blog/schema-markup-small-business',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schema Markup for Small Businesses: What It Is and Why You Need It',
    description: "Schema markup sounds technical but it's one of the easiest ways to stand out in search results. Here's how to get started.",
  },
}

export default function SchemaMarkupPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Schema Markup for Small Businesses: What It Is and Why You Need It',
        description: "Schema markup sounds technical but it's one of the easiest ways to stand out in search results. Here's how to get started.",
        author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
        datePublished: '2026-03-15',
        dateModified: '2026-04-01',
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://duelly.ai/blog/schema-markup-small-business' },
      }) }} />
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded">SEO</span>
          <span className="text-xs text-muted-foreground ml-3">April 1, 2026 · 6 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">Schema Markup for Small Businesses: What It Is and Why You Need It</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            If you&apos;ve ever Googled a restaurant and seen star ratings, hours, and a phone number right there in the search results before you even clicked anything, you&apos;ve seen schema markup in action. It&apos;s the thing that makes some search results look rich and detailed while others are just a plain blue link with two lines of text.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">So what exactly is schema markup?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Schema markup is a small piece of code you add to your website that tells search engines and AI systems exactly what your business is. Think of it like a label on a package. Without the label, the delivery driver has to guess what&apos;s inside. With it, they know immediately. Schema does the same thing for Google, ChatGPT, and every other search system that looks at your site.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            It&apos;s written in a format called <a href="https://schema.org/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">JSON-LD</a>, which sounds intimidating but is really just a structured list of facts about your business. Your name, address, phone number, hours, what you sell, your reviews. All organized in a way that machines can read instantly.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Why should a small business care?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Because it directly affects how you show up in search results. Sites with schema markup get what Google calls &ldquo;rich results&rdquo; which are those enhanced listings with extra information. They take up more space on the page, they look more trustworthy, and they get clicked more often. Studies consistently show that rich results get significantly higher click through rates than plain listings.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            But here&apos;s the part most people miss. Schema markup is also how AI search engines decide which businesses to recommend. When someone asks ChatGPT &ldquo;best pizza place near me,&rdquo; the AI looks for sites that have clear, structured data about what they are and where they&apos;re located. If your site has that data in schema format, you&apos;re way more likely to get mentioned.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What types of schema should you use?</h2>
          <p className="text-muted-foreground leading-relaxed">
            It depends on what kind of business you run, but here are the most common ones:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> LocalBusiness: for any business with a physical location. Includes your address, hours, phone, and service area.</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Restaurant: if you serve food. Adds menu info, cuisine type, and reservation options.</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Product: if you sell things online. Shows price, availability, and reviews right in search results.</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> FAQPage: if you have a frequently asked questions section. Google can display your Q&As directly in search.</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> Service: for service based businesses like plumbers, electricians, or consultants.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">How do you actually add it?</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you&apos;re on WordPress, there are plugins like Yoast SEO or Rank Math that can generate schema for you automatically. Shopify has built in product schema. Squarespace and Wix have basic schema support too, though it&apos;s more limited.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you want to do it manually or your platform doesn&apos;t support it well, you can write the JSON-LD yourself and paste it into your page&apos;s HTML. It goes in a script tag in the head of your page. Google has a free tool called the <a href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Structured Data documentation</a> that walks you through it, and you can validate your markup with the <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Rich Results Test</a>.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">The bottom line</h2>
          <p className="text-muted-foreground leading-relaxed">
            Schema markup is one of those things that takes maybe an hour to set up and then works for you forever. Most of your competitors haven&apos;t done it, which means adding it gives you an immediate edge in both Google search and AI search. It&apos;s free, it&apos;s not that hard, and the payoff is real.
          </p>

          <div className="mt-12 p-6 rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
            <h3 className="font-bold mb-2">See if your site has schema markup</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up to run a Pro Audit. We&apos;ll check your schema, tell you what&apos;s missing, and give you the code to add it.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'Schema Markup for Small Businesses: What It Is and Why You Need It',
        description: 'Schema markup sounds technical but it\'s one of the easiest ways to stand out in search results.',
        datePublished: '2026-04-01', dateModified: '2026-04-08', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
      <PublicFooter />
    </main>
  )
}
