import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'How to Write Content That AI Actually Cites',
  description: "AI search engines pick favorites. Here's what makes them choose one source over another and how to write content that gets cited.",
  alternates: { canonical: '/blog/content-ai-cites' },
  openGraph: {
    title: 'How to Write Content That AI Actually Cites',
    description: "AI search engines pick favorites. Here's what makes them choose one source over another and how to write content that gets cited.",
    url: 'https://duelly.ai/blog/content-ai-cites',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Write Content That AI Actually Cites',
    description: "AI search engines pick favorites. Here's what makes them choose one source over another and how to write content that gets cited.",
  },
}

export default function ContentAICitesPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'How to Write Content That AI Actually Cites',
        description: "AI search engines pick favorites. Here's what makes them choose one source over another and how to write content that gets cited.",
        author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
        datePublished: '2026-03-15',
        dateModified: '2026-04-01',
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://duelly.ai/blog/content-ai-cites' },
      }) }} />
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#fe3f8c] bg-[#fe3f8c]/10 px-2 py-0.5 rounded">GEO</span>
          <span className="text-xs text-muted-foreground ml-3">April 1, 2026 · 7 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">How to Write Content That AI Actually Cites</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            You&apos;ve probably noticed that when you ask <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">ChatGPT</a> or <a href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Perplexity</a> a question, it doesn&apos;t just make stuff up (well, usually). It pulls from real websites and cites them. But here&apos;s the thing that frustrates a lot of content creators: it doesn&apos;t cite everyone equally. Some pages get referenced constantly while others, even well written ones, get completely ignored.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            So what&apos;s the difference? What makes AI pick one source over another? After analyzing thousands of AI citations through Duelly audits, we&apos;ve found some very clear patterns. And the good news is, most of them are things you can fix today.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Lead with direct answers</h2>
          <p className="text-muted-foreground leading-relaxed">
            This is the single biggest factor. AI systems are looking for content that directly answers the question someone asked. Not content that dances around the topic for three paragraphs before getting to the point. Not content that says &ldquo;it depends&rdquo; without explaining what it depends on.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If someone asks &ldquo;how much does a new roof cost,&rdquo; the page that starts with &ldquo;A new roof typically costs between $5,000 and $15,000 for a standard residential home, depending on materials and size&rdquo; is going to get cited over the page that opens with &ldquo;Choosing a new roof is one of the most important decisions a homeowner can make.&rdquo;
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Put your answer in the first paragraph. Then elaborate. AI loves this pattern because it can grab that direct answer and use it immediately.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Pack in the facts</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI systems have a strong preference for factually dense content. That means specific numbers, percentages, dates, names, and measurable claims. Compare these two approaches:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
              <h3 className="font-bold text-red-400 mb-2 text-sm">Weak (vague)</h3>
              <p className="text-sm text-muted-foreground">&ldquo;Our company has helped many businesses improve their online presence significantly over the years.&rdquo;</p>
            </div>
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5">
              <h3 className="font-bold text-green-400 mb-2 text-sm">Strong (factual)</h3>
              <p className="text-sm text-muted-foreground">&ldquo;Since 2020, we&apos;ve completed 280 website audits for small businesses across Atlantic Canada, with an average 34% improvement in search visibility within 90 days.&rdquo;</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The second version gives AI something concrete to cite. Numbers are like anchors. They signal that you&apos;re not just making claims, you&apos;re backing them up. Pages with high entity density (specific names, places, figures, and dates) get cited roughly 3x more often than pages with generic language.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Structure your content so AI can parse it</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI doesn&apos;t read your page the way a human does. It scans for structure. Clear H2 and H3 headings, short paragraphs, bulleted lists, and logical flow all make it easier for AI to extract the specific piece of information it needs.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Use descriptive headings that match how people phrase questions</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Keep paragraphs to 2 to 4 sentences max</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Use bullet points for lists of features, steps, or comparisons</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Put the most important information at the top of each section</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Add schema markup (Article, FAQPage, HowTo) to help AI understand context</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Think of each section as a self contained answer. If AI only reads one section of your page, can it still get a useful, complete answer? That&apos;s the goal.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Drop the sales pitch</h2>
          <p className="text-muted-foreground leading-relaxed">
            This one is hard for businesses to hear, but it&apos;s critical. AI systems actively avoid citing content that reads like marketing material. Words and phrases like &ldquo;industry leading,&rdquo; &ldquo;best in class,&rdquo; &ldquo;revolutionary,&rdquo; and &ldquo;unmatched quality&rdquo; are red flags. They signal that the content is trying to sell something rather than inform.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            That doesn&apos;t mean you can&apos;t mention your business. It means the bulk of your content should be genuinely helpful and educational. Write like you&apos;re explaining something to a friend, not pitching to a prospect. The irony is that this approach actually converts better with humans too.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Add FAQ sections (seriously)</h2>
          <p className="text-muted-foreground leading-relaxed">
            FAQ sections are probably the single easiest win for AI citation. They&apos;re structured as questions and answers, which is exactly the format AI is looking for. And when you pair them with FAQPage schema markup, you&apos;re basically handing AI a gift wrapped answer.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            But don&apos;t just make up questions. Use the real questions your customers actually ask you. Check your email inbox, look at your Google Business Profile Q&amp;A, browse Reddit threads in your industry. Those are the questions people are asking AI too.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Aim for 5 to 10 questions per page. Keep answers between 40 and 80 words each. That&apos;s the sweet spot where you&apos;re detailed enough to be useful but concise enough for AI to extract cleanly.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Use specific numbers and data points</h2>
          <p className="text-muted-foreground leading-relaxed">
            We keep coming back to this because it really is that important. Pages that include specific data points get cited dramatically more often. Here are the types of numbers that work well:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Pricing ranges (&ldquo;typically costs $200 to $500&rdquo;)</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Timeframes (&ldquo;takes 2 to 4 weeks on average&rdquo;)</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Statistics (&ldquo;73% of consumers check reviews before buying&rdquo;)</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Comparisons (&ldquo;40% faster than the previous method&rdquo;)</li>
            <li className="flex gap-2"><span className="text-[#fe3f8c] font-bold shrink-0">→</span> Results (&ldquo;clients saw a 28% increase in organic traffic&rdquo;)</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">The content checklist</h2>
          <p className="text-muted-foreground leading-relaxed">
            Before you publish any page, run through this quick check:
          </p>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Does the first paragraph directly answer the main question?</li>
            <li>Are there at least 5 specific numbers or data points?</li>
            <li>Is the content structured with clear, descriptive headings?</li>
            <li>Have you removed promotional language and superlatives?</li>
            <li>Is there an FAQ section with real customer questions?</li>
            <li>Have you added appropriate schema markup?</li>
            <li>Is each section useful on its own, even out of context?</li>
          </ol>
          <p className="text-muted-foreground leading-relaxed">
            If you can check all seven, you&apos;re in a strong position to get cited. And the beautiful part is that content written this way also performs better with human readers. Nobody likes fluff. Everyone appreciates clear, factual, well organized information.
          </p>

          <div className="mt-12 p-6 rounded-2xl border border-[#fe3f8c]/30 bg-[#fe3f8c]/5">
            <h3 className="font-bold mb-2">Find out if AI is citing your content</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up to see how your content scores for AI citation readiness.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#fe3f8c] hover:bg-[#fe3f8c]/90 text-white font-bold text-sm transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'How to Write Content That AI Actually Cites',
        description: 'AI search engines pick favorites. Here\'s what makes them choose one source over another and how to write content that gets cited.',
        datePublished: '2026-04-01', dateModified: '2026-04-08', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
      <PublicFooter />
    </main>
  )
}
