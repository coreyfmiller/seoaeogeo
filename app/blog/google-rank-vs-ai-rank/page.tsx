import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'Why Your Google Ranking Doesn\'t Match Your AI Ranking',
  description: 'You can be #3 on Google and #8 in AI search. Here\'s why the gap exists and what you can do to close it.',
  alternates: { canonical: '/blog/google-rank-vs-ai-rank' },
}

export default function GoogleRankVsAIRankPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#BC13FE] bg-[#BC13FE]/10 px-2 py-0.5 rounded">AEO</span>
          <span className="text-xs text-muted-foreground ml-3">April 1, 2026 · 5 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">Why Your Google Ranking Doesn&apos;t Match Your AI Ranking</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Here&apos;s something that catches a lot of business owners off guard. You check your Google ranking, see you&apos;re sitting at position 3 for your main keyword, and feel pretty good about it. Then you ask ChatGPT or Perplexity the same question and your business is nowhere to be found. Or worse, your competitor who&apos;s on page 2 of Google is the one getting cited.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This isn&apos;t a glitch. It&apos;s two completely different ranking systems looking at your website through completely different lenses. And understanding the gap is the first step to closing it.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How Google decides who ranks</h2>
          <p className="text-muted-foreground leading-relaxed">
            Google&apos;s algorithm has been refined over 25+ years, and it weighs a very specific set of signals. <a href="https://moz.com/learn/seo/backlinks" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Backlinks</a> are still a massive factor. If 50 reputable websites link to your page, Google sees that as a vote of confidence. Technical SEO matters too. Page speed, mobile responsiveness, HTTPS, clean URL structures, proper canonical tags. Then there&apos;s content relevance, keyword placement, and user engagement metrics like bounce rate and time on page.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The thing is, you can rank well on Google with a page that&apos;s technically solid and has strong backlinks, even if the actual content is mediocre. We&apos;ve all seen those pages that rank #1 but don&apos;t really answer your question. Google&apos;s system rewards authority and technical signals heavily.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How AI decides who gets cited</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI search engines like ChatGPT, Perplexity, and Google&apos;s AI Overviews work differently. They&apos;re not ranking pages in a list. They&apos;re reading your content, understanding it, and deciding whether it&apos;s worth pulling into an answer. The signals they care about are almost entirely content driven.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Does your page directly answer the question being asked?</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Is the information structured clearly with proper headings?</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Do you use schema markup that helps AI understand your content?</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Are there specific facts, numbers, and named entities?</li>
            <li className="flex gap-2"><span className="text-[#BC13FE] font-bold shrink-0">→</span> Does the content read as objective and expert, or promotional and salesy?</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Backlinks? AI doesn&apos;t care much. Page speed? Irrelevant to an AI reading your text. That fancy technical SEO setup you spent months on? It helps Google, but it does almost nothing for ChatGPT.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Real examples of the gap</h2>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;ve seen this play out hundreds of times with Duelly audits. A local law firm ranked #2 on Google for &ldquo;personal injury lawyer Halifax&rdquo; but wasn&apos;t mentioned at all when we asked ChatGPT the same query. Why? Their homepage was beautifully designed but had almost no actual text content. Just a hero image, a tagline, and a contact form. Google ranked them because they had 80+ backlinks and a fast site. AI had nothing to extract.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Meanwhile, a smaller firm ranking #7 on Google had a detailed FAQ page answering 15 common questions about personal injury claims, complete with LocalBusiness schema and clear service descriptions. ChatGPT cited them as the top recommendation. The content gave the AI something to work with.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Another example: a SaaS company ranking #3 for &ldquo;project management software for small teams.&rdquo; Their page was heavy on marketing copy and light on specifics. Phrases like &ldquo;revolutionary platform&rdquo; and &ldquo;game changing solution&rdquo; everywhere. Perplexity skipped right over them and cited a competitor whose page listed actual features, pricing tiers, and comparison tables with real numbers.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Why the gap is getting wider</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI search usage is growing fast. As of early 2026, roughly 40% of people under 35 use AI tools as their primary way to search for information. That number was under 15% just two years ago. And these users aren&apos;t going back to scrolling through ten blue links. They want direct answers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you&apos;re only optimizing for Google, you&apos;re optimizing for a shrinking share of how people actually find things. That doesn&apos;t mean Google is dying. It means you need to play both games now.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What to do about it</h2>
          <p className="text-muted-foreground leading-relaxed">
            The good news is that fixing your AI ranking doesn&apos;t mean sacrificing your Google ranking. Most of the changes help both. Here&apos;s where to start:
          </p>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Add structured data (schema markup) to every important page. At minimum, use Organization, LocalBusiness, or FAQPage schema depending on your page type.</li>
            <li>Write content that directly answers questions. If someone asks &ldquo;what does [your service] cost,&rdquo; your page should have a clear answer, not a &ldquo;contact us for a quote&rdquo; button.</li>
            <li>Include specific numbers and facts. Instead of &ldquo;we&apos;ve helped many clients,&rdquo; say &ldquo;we&apos;ve completed 340+ projects since 2019.&rdquo;</li>
            <li>Add FAQ sections with the actual questions your customers ask. These are gold for AI citation.</li>
            <li>Cut the promotional fluff. AI systems actively downweight content that reads like a sales pitch.</li>
          </ol>

          <div className="mt-12 p-6 rounded-2xl border border-[#BC13FE]/30 bg-[#BC13FE]/5">
            <h3 className="font-bold mb-2">See where you rank in AI search</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up and get 20 credits to compare your Google ranking vs your AI ranking.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#BC13FE] hover:bg-[#BC13FE]/90 text-white font-bold text-sm transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'Why Your Google Ranking Doesn\'t Match Your AI Ranking',
        description: 'You can be #3 on Google and #8 in AI search. Here\'s why the gap exists and what you can do to close it.',
        datePublished: '2026-04-01', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
      <PublicFooter />
    </main>
  )
}
