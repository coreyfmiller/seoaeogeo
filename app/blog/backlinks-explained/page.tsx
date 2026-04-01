import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'Backlinks Explained: Why Other Websites Linking to You Matters',
  description: 'Backlinks are one of the biggest ranking factors in SEO. Here\'s what they are, why they matter, and how to actually get them.',
  alternates: { canonical: '/blog/backlinks-explained' },
}

export default function BacklinksExplainedPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded">SEO</span>
          <span className="text-xs text-muted-foreground ml-3">April 1, 2026 · 6 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">Backlinks Explained: Why Other Websites Linking to You Matters</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            If you&apos;ve ever looked into SEO, you&apos;ve probably heard the word &ldquo;backlinks&rdquo; thrown around like it&apos;s some kind of magic ingredient. And honestly? It kind of is. Backlinks are one of the top 3 ranking factors Google uses to decide where your website shows up in search results. But a lot of business owners either don&apos;t understand what they are or have no idea how to get them.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Let&apos;s fix that. No jargon, no fluff. Just a plain language explanation of what backlinks are, why they matter so much, and what you can actually do to start building them.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What is a backlink?</h2>
          <p className="text-muted-foreground leading-relaxed">
            A backlink is simply a link from someone else&apos;s website to yours. That&apos;s it. If a local newspaper writes an article and includes a link to your business website, that&apos;s a backlink. If a blogger mentions your product and links to your page, that&apos;s a backlink. If you&apos;re listed in an online directory with a link to your site, that counts too.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Think of each backlink as a recommendation. When another website links to you, it&apos;s essentially telling Google &ldquo;hey, this site is worth checking out.&rdquo; And Google listens.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Why do backlinks matter for rankings?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Google&apos;s entire algorithm started with backlinks. Back in 1998, Larry Page and Sergey Brin built Google around the idea that links between websites are like votes. The more votes (links) a page gets, the more important it probably is. That core idea hasn&apos;t changed, even though the algorithm has gotten infinitely more complex since then.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, backlinks still account for a massive portion of how Google ranks pages. Studies consistently show that the #1 result on Google has an average of 3.8x more backlinks than results in positions 2 through 10. Pages with zero backlinks almost never rank on page 1 for competitive keywords.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            But it&apos;s not just about having links. It&apos;s about having the right kind of links.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Quality vs quantity</h2>
          <p className="text-muted-foreground leading-relaxed">
            Not all backlinks are created equal. One link from a respected news site like CBC or a well known industry publication is worth more than 100 links from random, low quality websites. Google evaluates the quality of each linking site, and it weighs that heavily.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Here&apos;s a rough way to think about it:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> A link from a government website (.gov) or educational institution (.edu) carries serious weight</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> A link from a major news outlet or industry publication is very strong</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> A link from a relevant local business or partner is solid</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> A link from a random blog with no traffic or relevance is nearly worthless</li>
            <li className="flex gap-2"><span className="text-[#00e5ff] font-bold shrink-0">→</span> A link from a spammy link farm can actually hurt your rankings</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Quality always beats quantity. Ten links from reputable, relevant websites will do more for your rankings than 500 links from junk sites. And buying cheap backlinks from services that promise &ldquo;1,000 links for $50&rdquo; is a great way to get penalized by Google.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">What is domain authority?</h2>
          <p className="text-muted-foreground leading-relaxed">
            You&apos;ll often hear people talk about &ldquo;domain authority&rdquo; or DA. This is a score from 1 to 100 (created by Moz, not Google) that estimates how likely a website is to rank in search results. It&apos;s based largely on the quality and quantity of backlinks pointing to that domain.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A brand new website with no backlinks might have a DA of 1. A site like Wikipedia has a DA of 100. Most small business websites fall somewhere between 10 and 30. Getting your DA up takes time and consistent effort, but every quality backlink you earn moves the needle.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Google doesn&apos;t use DA directly (it&apos;s a third party metric), but it correlates strongly with actual rankings because it&apos;s measuring the same underlying signals Google cares about.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How to actually get backlinks</h2>
          <p className="text-muted-foreground leading-relaxed">
            This is the part everyone wants to know. Getting backlinks takes effort, but it&apos;s not as mysterious as people make it sound. Here are the most effective approaches for small businesses:
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">1. Get listed in directories</h3>
          <p className="text-muted-foreground leading-relaxed">
            Start with the easy wins. Google Business Profile, Yelp, Yellow Pages, your local Chamber of Commerce, industry specific directories, and any relevant association listings. These are free, legitimate backlinks that also help people find you. Most small businesses are missing at least 5 to 10 directory listings they could have.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">2. Build local partnerships</h3>
          <p className="text-muted-foreground leading-relaxed">
            Do you work with other local businesses? Ask them to link to you from their website, and offer to do the same. A plumber and a real estate agent who refer clients to each other can link to each other&apos;s sites. A wedding photographer and a venue can cross promote. These are natural, relevant links that Google loves.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">3. Create content worth linking to</h3>
          <p className="text-muted-foreground leading-relaxed">
            This is the long game, but it&apos;s the most powerful. Write genuinely useful content that other people want to reference. A detailed guide, an original study, a local resource list, a tool or calculator. If you create something valuable enough, other websites will link to it naturally. A local accountant who publishes a &ldquo;2026 Tax Deadlines for Canadian Small Businesses&rdquo; guide is going to earn links from other local business sites.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">4. Join your local Chamber of Commerce</h3>
          <p className="text-muted-foreground leading-relaxed">
            Chamber of Commerce websites typically have high domain authority (often DA 40 to 60) and they link to all their members. For the cost of a membership (usually $200 to $500 per year), you get a quality backlink plus networking opportunities. It&apos;s one of the best ROI moves for local SEO.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">5. Get mentioned in local media</h3>
          <p className="text-muted-foreground leading-relaxed">
            Local newspapers and news sites are always looking for stories. Sponsor a community event, do something newsworthy, or simply reach out and offer yourself as an expert source for articles in your field. One link from a local news site can be worth more than months of other link building efforts.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">How to check your backlink profile</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can see who&apos;s linking to your site using free tools like Google Search Console (under the Links section), Ahrefs&apos; free backlink checker, or Moz&apos;s Link Explorer. These will show you how many backlinks you have, which sites are linking to you, and which of your pages get the most links.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Check your profile at least once a quarter. Look for any spammy links you didn&apos;t ask for (you can disavow these through Google Search Console) and identify opportunities where you could earn more links from sites that already mention you but don&apos;t link to you yet.
          </p>

          <div className="mt-12 p-6 rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
            <h3 className="font-bold mb-2">See how your backlink profile stacks up</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up and get 20 free credits to audit your site&apos;s SEO health, including backlink signals.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors">
              Get 20 Free Credits <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'Backlinks Explained: Why Other Websites Linking to You Matters',
        description: 'Backlinks are one of the biggest ranking factors in SEO. Here\'s what they are, why they matter, and how to actually get them.',
        datePublished: '2026-04-01', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
      <PublicFooter />
    </main>
  )
}
