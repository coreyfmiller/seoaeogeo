import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'Local SEO Guide for Atlantic Canadian Small Businesses',
  description: 'A practical guide to getting your New Brunswick, Nova Scotia, PEI, or Newfoundland business found online in Google and AI search.',
  alternates: { canonical: '/blog/local-seo-atlantic-canada' },
}

export default function LocalSEOAtlanticCanadaPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded">Local</span>
          <span className="text-xs text-muted-foreground ml-3">March 29, 2026 · 8 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">Local SEO Guide for Atlantic Canadian Small Businesses</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            If you run a small business in New Brunswick, Nova Scotia, Prince Edward Island, or Newfoundland, your customers are already looking for you online. They&apos;re searching on Google, on their phones, and more and more through AI assistants like ChatGPT and Siri. This guide walks you through what you need to do to make sure they actually find you.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">1. Claim your Google Business Profile</h2>
          <p className="text-muted-foreground leading-relaxed">
            This is hands down the most important thing you can do for local visibility. Your <a href="https://www.google.com/business/" target="_blank" rel="noopener noreferrer" className="text-[#00e5ff] hover:underline">Google Business Profile</a> (it used to be called Google My Business) is what shows up in the map pack when someone searches &ldquo;plumber near me&rdquo; or &ldquo;restaurant in Fredericton.&rdquo; If you haven&apos;t claimed yours yet, go do it today at business.google.com. Seriously, stop reading and go do it.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Once it&apos;s claimed, make sure your name, address, and phone number are exactly the same everywhere you appear online. Even small inconsistencies confuse Google and can hurt your rankings. While you&apos;re at it, add some good photos, keep your business hours up to date, and make a habit of responding to reviews.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">2. Get listed in local directories</h2>
          <p className="text-muted-foreground leading-relaxed">
            Google isn&apos;t the only place people look. You should also make sure you&apos;re listed on:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Yelp Canada</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Yellow Pages Canada (yellowpages.ca)</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Your local Chamber of Commerce website</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Industry specific directories (TripAdvisor for restaurants, HomeStars for contractors)</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Provincial business directories (like the New Brunswick business directory)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Every one of these listings is a backlink to your website, which builds your domain authority and helps you rank higher. It&apos;s free and it works.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">3. Make your website mobile friendly</h2>
          <p className="text-muted-foreground leading-relaxed">
            Over 60% of local searches happen on phones. If your website is hard to read or navigate on a mobile screen, you&apos;re losing customers right there. Google also uses mobile friendliness as a ranking factor, so it hurts you in two ways. Pull out your phone and look at your own site. If you have to pinch and zoom to read anything, it needs work.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">4. Actually mention your location on your website</h2>
          <p className="text-muted-foreground leading-relaxed">
            This sounds obvious but so many businesses get it wrong. Don&apos;t just say &ldquo;we serve the local area.&rdquo; Be specific. Mention your city, your province, and the neighborhoods or communities you serve. If you&apos;re a plumber in Saint John, your homepage should say &ldquo;plumbing services in Saint John, New Brunswick&rdquo; not just &ldquo;plumbing services.&rdquo;
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This matters even more for AI search. When someone asks ChatGPT &ldquo;best plumber in Saint John NB,&rdquo; the AI goes looking for pages that explicitly mention that location. If your site doesn&apos;t say it, you won&apos;t come up.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">5. Add schema markup</h2>
          <p className="text-muted-foreground leading-relaxed">
            Schema markup is a bit of code you add to your site that tells search engines and AI systems exactly what your business is, where it&apos;s located, what services you offer, and when you&apos;re open. Visitors can&apos;t see it, but it&apos;s critical for how Google and AI understand your site behind the scenes.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At minimum, you want LocalBusiness schema with your name, address, phone, hours, and service area. If you&apos;re a restaurant, use Restaurant schema. If you&apos;re a contractor, use HomeAndConstructionBusiness. Your web developer can add this for you, or if you&apos;re on WordPress or Squarespace, there are plugins that handle it automatically.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">6. Get reviews and actually respond to them</h2>
          <p className="text-muted-foreground leading-relaxed">
            Reviews are one of the strongest signals Google uses for local rankings. When a happy customer walks out the door, ask them to leave a Google review. It takes 30 seconds and it makes a real difference. And when reviews come in, respond to every single one, good and bad. It shows Google (and your future customers) that you&apos;re active and you care.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">7. Get ready for AI search</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI search is growing fast in Atlantic Canada, same as everywhere else. If you want AI assistants to actually recommend your business when people ask, here&apos;s what to focus on:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Add an FAQ page that answers the real questions your customers ask you</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Write clear, factual descriptions of what you do (skip the vague marketing fluff)</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Include specific details like how long you&apos;ve been in business, certifications, and exactly where you serve</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Make sure your pages have real substance. A page with just a couple sentences isn&apos;t going to get cited by anyone</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">The Atlantic Canada advantage</h2>
          <p className="text-muted-foreground leading-relaxed">
            Here&apos;s the good news. Most small businesses in Atlantic Canada haven&apos;t done any of this yet. The competition for local SEO and AI search visibility in the Maritimes is way lower than in Toronto or Vancouver. If you take action now, you&apos;ll be ahead of 90% of your local competitors. That&apos;s not an exaggeration. The window is wide open.
          </p>

          <div className="mt-12 p-6 rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/5">
            <h3 className="font-bold mb-2">See how your business scores</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign up to check your SEO, AEO, and GEO scores. See exactly what&apos;s helping and what&apos;s hurting your visibility.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-sm transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'Local SEO Guide for Atlantic Canadian Small Businesses',
        description: 'A practical guide to getting your New Brunswick, Nova Scotia, PEI, or Newfoundland business found online.',
        datePublished: '2026-03-29', dateModified: '2026-04-08', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
      <PublicFooter />
    </main>
  )
}