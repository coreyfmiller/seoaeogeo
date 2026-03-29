import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Local SEO Guide for Atlantic Canadian Small Businesses',
  description: 'A practical guide to getting your New Brunswick, Nova Scotia, PEI, or Newfoundland business found online — in Google and AI search.',
  alternates: { canonical: '/blog/local-seo-atlantic-canada' },
}

export default function LocalSEOAtlanticCanadaPage() {
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
          <span className="text-xs font-bold uppercase tracking-widest text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded">Local</span>
          <span className="text-xs text-muted-foreground ml-3">March 29, 2026 · 8 min read</span>
        </div>

        <h1 className="text-4xl font-black mb-6 leading-tight">Local SEO Guide for Atlantic Canadian Small Businesses</h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            If you run a small business in New Brunswick, Nova Scotia, Prince Edward Island, or Newfoundland, your customers are searching for you online — in Google, on their phones, and increasingly through AI assistants like ChatGPT and Siri. This guide covers what you need to do to make sure they find you.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">1. Claim your Google Business Profile</h2>
          <p className="text-muted-foreground leading-relaxed">
            This is the single most important thing you can do for local visibility. Your Google Business Profile (formerly Google My Business) is what shows up in the map pack when someone searches &ldquo;plumber near me&rdquo; or &ldquo;restaurant in Fredericton.&rdquo; If you haven&apos;t claimed yours, do it today at business.google.com.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Make sure your name, address, and phone number are exactly the same everywhere online. Inconsistencies confuse Google and hurt your rankings. Add photos, business hours, and respond to reviews.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">2. Get listed in local directories</h2>
          <p className="text-muted-foreground leading-relaxed">
            Beyond Google, make sure you&apos;re listed on:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Yelp Canada</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Yellow Pages Canada (yellowpages.ca)</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Your local Chamber of Commerce website</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Industry-specific directories (TripAdvisor for restaurants, HomeStars for contractors)</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Provincial business directories (e.g., New Brunswick business directory)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Each listing is a backlink to your website, which builds your domain authority and helps you rank higher.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">3. Make your website mobile-friendly</h2>
          <p className="text-muted-foreground leading-relaxed">
            Over 60% of local searches happen on mobile phones. If your website is hard to read or navigate on a phone, you&apos;re losing customers. Google also uses mobile-friendliness as a ranking factor. Test your site on your own phone — if you have to pinch and zoom, it needs work.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">4. Add your location to your website content</h2>
          <p className="text-muted-foreground leading-relaxed">
            Don&apos;t just say &ldquo;we serve the local area.&rdquo; Be specific. Mention your city, province, and the neighborhoods or communities you serve. If you&apos;re a plumber in Saint John, your homepage should say &ldquo;plumbing services in Saint John, New Brunswick&rdquo; — not just &ldquo;plumbing services.&rdquo;
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This is especially important for AI search. When someone asks ChatGPT &ldquo;best plumber in Saint John NB,&rdquo; the AI looks for pages that explicitly mention that location.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">5. Add schema markup</h2>
          <p className="text-muted-foreground leading-relaxed">
            Schema markup is code that tells search engines and AI systems exactly what your business is, where it&apos;s located, what services you offer, and your hours. It&apos;s invisible to visitors but critical for how Google and AI understand your site.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At minimum, add LocalBusiness schema with your name, address, phone, hours, and service area. If you&apos;re a restaurant, use Restaurant schema. If you&apos;re a contractor, use HomeAndConstructionBusiness. Your web developer can add this, or many website platforms have plugins that do it automatically.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">6. Get reviews — and respond to them</h2>
          <p className="text-muted-foreground leading-relaxed">
            Reviews are one of the strongest local ranking signals. Ask happy customers to leave a Google review. Respond to every review — positive and negative. This shows Google (and potential customers) that you&apos;re active and engaged.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">7. Prepare for AI search</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI search is growing fast in Atlantic Canada, just like everywhere else. To make sure AI assistants recommend your business:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Add an FAQ page answering common questions about your services</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Write clear, factual descriptions of what you do (avoid vague marketing language)</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Include specific details: years in business, certifications, service areas</li>
            <li className="flex gap-2"><span className="text-[#22c55e] font-bold shrink-0">→</span> Make sure your content is substantial — pages with only a few sentences won&apos;t get cited</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">The Atlantic Canada advantage</h2>
          <p className="text-muted-foreground leading-relaxed">
            Here&apos;s the good news: most small businesses in Atlantic Canada haven&apos;t done any of this yet. The competition for local SEO and AI search visibility in the Maritimes is much lower than in Toronto or Vancouver. If you take action now, you&apos;ll be ahead of 90% of your local competitors.
          </p>

          <div className="mt-12 p-6 rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/5">
            <h3 className="font-bold mb-2">See how your business scores</h3>
            <p className="text-sm text-muted-foreground mb-4">Run a free audit to check your SEO, AEO, and GEO scores. See exactly what&apos;s helping and what&apos;s hurting your visibility.</p>
            <Link href="/free-audit" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-sm transition-colors">
              Free Local SEO Audit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'Local SEO Guide for Atlantic Canadian Small Businesses',
        description: 'A practical guide to getting your New Brunswick, Nova Scotia, PEI, or Newfoundland business found online.',
        datePublished: '2026-03-29', author: { '@type': 'Organization', name: 'Duelly', url: 'https://duelly.ai' },
        publisher: { '@type': 'Organization', name: 'Duelly', logo: { '@type': 'ImageObject', url: 'https://duelly.ai/logo.png' } },
      }) }} />
    </main>
  )
}
