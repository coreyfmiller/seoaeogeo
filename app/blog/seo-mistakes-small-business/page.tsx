import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'The 7 Biggest SEO Mistakes Small Businesses Make',
  description: 'Most small business websites have at least 3 of these 7 SEO problems. Here\'s what they are and exactly how to fix each one.',
  alternates: { canonical: '/blog/seo-mistakes-small-business' },
}

export default function SEOMistakesSmallBusinessPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded">Guide</span>
          <span className="text-xs text-muted-foreground ml-3">April 1, 2026 · 8 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">The 7 Biggest SEO Mistakes Small Businesses Make</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            We&apos;ve audited thousands of small business websites through Duelly, and the same problems come up over and over again. The frustrating part? Most of these are easy to fix once you know they exist. But they&apos;re silently killing your search rankings every single day you leave them in place.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Here are the 7 mistakes we see most often, why each one matters, and exactly what to do about it.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">1. No schema markup</h2>
          <p className="text-muted-foreground leading-relaxed">
            This is the #1 issue we find. Roughly 78% of small business websites we audit have zero schema markup. Schema is structured data you add to your site&apos;s code that tells search engines exactly what your page is about. It&apos;s like giving Google a cheat sheet instead of making it guess.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Without schema, Google has to figure out on its own that your page is about a local plumbing business in Fredericton that&apos;s open Monday through Saturday. With schema, you spell it out explicitly: business name, address, phone number, hours, services, service area. Google rewards this clarity with better visibility, including rich snippets in search results.
          </p>
          <div className="p-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 my-4">
            <p className="text-sm font-bold text-[#f59e0b] mb-1">How to fix it</p>
            <p className="text-sm text-muted-foreground">At minimum, add LocalBusiness or Organization schema to your homepage. Include your business name, address, phone, hours, and a description. If you have service pages, add Service schema. If you have an FAQ, add FAQPage schema. You can use Google&apos;s Structured Data Markup Helper to generate the code, then paste it into your site&apos;s head section.</p>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">2. Missing or duplicate meta descriptions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your meta description is the short summary that shows up under your page title in Google search results. It&apos;s your 155 character sales pitch to get someone to click. And yet about 65% of small business sites either have no meta descriptions at all (letting Google auto generate something random) or use the exact same description on every page.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When every page has the same meta description, Google sees that as a signal that your pages aren&apos;t differentiated. It makes it harder for Google to understand what each page is specifically about. And when there&apos;s no description at all, Google pulls whatever text it finds, which is often not the most compelling snippet.
          </p>
          <div className="p-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 my-4">
            <p className="text-sm font-bold text-[#f59e0b] mb-1">How to fix it</p>
            <p className="text-sm text-muted-foreground">Write a unique meta description for every page on your site. Keep it between 120 and 155 characters. Include your primary keyword naturally. Make it compelling enough that someone would want to click. For a service page, something like &ldquo;Licensed plumber in Moncton serving residential and commercial clients. Same day emergency service available. Call for a free estimate.&rdquo;</p>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">3. No H1 tag or multiple H1s</h2>
          <p className="text-muted-foreground leading-relaxed">
            The H1 tag is your page&apos;s main heading. It tells both users and search engines what the page is about. Every page should have exactly one H1, and it should clearly describe the page&apos;s content. Sounds simple, right? But we find H1 problems on about 45% of sites we audit.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Some sites have no H1 at all because the designer used a styled div or a paragraph tag instead of an actual H1 element. Others have 3 or 4 H1 tags on a single page, which confuses search engines about what the page&apos;s primary topic actually is. And some have an H1 that says something useless like &ldquo;Welcome&rdquo; or &ldquo;Home&rdquo; instead of describing what the business does.
          </p>
          <div className="p-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 my-4">
            <p className="text-sm font-bold text-[#f59e0b] mb-1">How to fix it</p>
            <p className="text-sm text-muted-foreground">Make sure every page has exactly one H1 tag. It should include your primary keyword and clearly describe what the page is about. For your homepage, something like &ldquo;Residential Plumbing Services in Moncton, NB&rdquo; is much better than &ldquo;Welcome to Our Website.&rdquo; Use H2s and H3s for subheadings, keeping a logical hierarchy.</p>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">4. Ignoring mobile</h2>
          <p className="text-muted-foreground leading-relaxed">
            Google switched to mobile first indexing back in 2019. That means Google primarily uses the mobile version of your site for ranking and indexing. If your site looks great on desktop but is a mess on phones, your rankings are going to suffer. Period.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            As of 2026, over 63% of all web traffic comes from mobile devices. For local searches (like &ldquo;restaurant near me&rdquo; or &ldquo;emergency plumber&rdquo;), that number jumps to over 75%. If someone pulls up your site on their phone and the text is tiny, buttons are impossible to tap, or the layout is broken, they&apos;re gone in about 3 seconds. And Google notices that bounce.
          </p>
          <div className="p-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 my-4">
            <p className="text-sm font-bold text-[#f59e0b] mb-1">How to fix it</p>
            <p className="text-sm text-muted-foreground">Test your site on an actual phone, not just by resizing your browser window. Check that text is readable without zooming, buttons are easy to tap (at least 44x44 pixels), and nothing overflows the screen horizontally. Use Google&apos;s Mobile Friendly Test tool. If your site isn&apos;t responsive, that should be your top priority to fix.</p>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">5. Slow page speed</h2>
          <p className="text-muted-foreground leading-relaxed">
            Page speed is a confirmed Google ranking factor, and it&apos;s been one since 2018. Google&apos;s <a href="https://web.dev/articles/vitals" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Core Web Vitals</a> (LCP, FID, and CLS) measure how fast your page loads, how quickly it becomes interactive, and how stable the layout is while loading. Sites that fail these metrics get pushed down in rankings.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The numbers are stark. Pages that load in under 2.5 seconds have a bounce rate of about 9%. Pages that take 5 seconds jump to a 38% bounce rate. And pages over 10 seconds? Over 58% of visitors leave before the page even finishes loading. Every second counts.
          </p>
          <div className="p-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 my-4">
            <p className="text-sm font-bold text-[#f59e0b] mb-1">How to fix it</p>
            <p className="text-sm text-muted-foreground">Run your site through <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Google PageSpeed Insights</a> and aim for a score above 80 on mobile. The most common fixes: compress and resize images (this alone often cuts load time in half), enable browser caching, minimize CSS and JavaScript files, and use a CDN if you serve visitors across multiple regions. If you&apos;re on WordPress, a caching plugin like WP Rocket can make a huge difference.</p>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">6. Thin content (under 300 words)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Google wants to show users pages that thoroughly answer their questions. A page with 150 words of generic text isn&apos;t going to do that. We regularly see small business service pages with barely a paragraph of content, just a heading, a sentence or two, and a contact form.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Research shows that the average word count of a page ranking in Google&apos;s top 10 results is around 1,400 words. That doesn&apos;t mean you need to write a novel for every page, but you do need enough content to be genuinely useful. Pages under 300 words are almost always classified as &ldquo;thin content&rdquo; by Google, and they rarely rank for anything competitive.
          </p>
          <div className="p-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 my-4">
            <p className="text-sm font-bold text-[#f59e0b] mb-1">How to fix it</p>
            <p className="text-sm text-muted-foreground">Aim for at least 500 words on every important page, and 800 to 1,500 words on service pages and blog posts. Don&apos;t pad with fluff though. Add real value: explain your process, answer common questions, describe what makes your approach different, include pricing ranges if possible, and add customer testimonials. If you genuinely can&apos;t write 500 words about a topic, consider whether it deserves its own page or should be combined with related content.</p>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">7. Not claiming Google Business Profile</h2>
          <p className="text-muted-foreground leading-relaxed">
            This one blows our minds because it&apos;s completely free and takes about 15 minutes. Google Business Profile (formerly Google My Business) is how you show up in Google Maps, the local 3 pack (those three business listings that appear at the top of local searches), and Google&apos;s knowledge panel. And roughly 30% of small businesses either haven&apos;t claimed their profile or have one that&apos;s barely filled out.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Businesses with a complete Google Business Profile are 70% more likely to attract location visits and 50% more likely to lead to a purchase. It&apos;s arguably the single highest impact thing a local business can do for their online visibility, and it costs nothing.
          </p>
          <div className="p-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 my-4">
            <p className="text-sm font-bold text-[#f59e0b] mb-1">How to fix it</p>
            <p className="text-sm text-muted-foreground">Go to business.google.com and claim your profile if you haven&apos;t already. Fill out every single field: business name, address, phone, website, hours, categories (pick all that apply), services, and a detailed description. Add at least 10 photos. Post updates regularly. Respond to every review, good or bad. And keep your information consistent with what&apos;s on your website. Inconsistencies between your site and your GBP confuse Google and hurt your local rankings.</p>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4">How many of these apply to you?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Most small business websites we audit have at least 3 of these 7 issues. Some have all 7. The good news is that every single one of them is fixable, and fixing even 2 or 3 can lead to a noticeable improvement in your search rankings within a few weeks.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The best approach is to start with the ones that are easiest to fix (claiming your Google Business Profile, writing meta descriptions, fixing your H1 tags) and then tackle the bigger projects (page speed, content depth, schema markup) over time. You don&apos;t have to do everything at once. But you do have to start.
          </p>

          <div className="mt-12 p-6 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5">
            <h3 className="font-bold mb-2">Find out which mistakes your site is making</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up to run a full SEO audit and see exactly what needs fixing.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black font-bold text-sm transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'The 7 Biggest SEO Mistakes Small Businesses Make',
        description: 'Most small business websites have at least 3 of these 7 SEO problems. Here\'s what they are and exactly how to fix each one.',
        datePublished: '2026-04-01', dateModified: '2026-04-08', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
      <PublicFooter />
    </main>
  )
}
