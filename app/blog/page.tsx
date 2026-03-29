import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — Search Intelligence for Small Business',
  description: 'Practical guides on SEO, AEO, and GEO for small businesses. Learn how to get found in Google, AI search, and beyond.',
  alternates: { canonical: '/blog' },
}

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  category: 'SEO' | 'AEO' | 'GEO' | 'Local' | 'Guide'
  readTime: string
}

const posts: BlogPost[] = [
  {
    slug: 'what-is-aeo',
    title: 'What is AEO? Answer Engine Optimization Explained',
    description: 'AI search engines like ChatGPT and Perplexity are changing how people find businesses. AEO is how you make sure they find yours.',
    date: '2026-03-29',
    category: 'AEO',
    readTime: '5 min',
  },
  {
    slug: 'seo-vs-aeo-vs-geo',
    title: 'SEO vs AEO vs GEO — What\'s the Difference?',
    description: 'Traditional SEO isn\'t enough anymore. Here\'s what AEO and GEO mean for your business and why all three matter in 2026.',
    date: '2026-03-29',
    category: 'Guide',
    readTime: '7 min',
  },
  {
    slug: 'local-seo-atlantic-canada',
    title: 'Local SEO Guide for Atlantic Canadian Small Businesses',
    description: 'A practical guide to getting your New Brunswick, Nova Scotia, PEI, or Newfoundland business found online — in Google and AI search.',
    date: '2026-03-29',
    category: 'Local',
    readTime: '8 min',
  },
]

const categoryColor: Record<string, string> = {
  SEO: '#00e5ff', AEO: '#BC13FE', GEO: '#fe3f8c', Local: '#22c55e', Guide: '#f59e0b',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header>
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center"><img src="/logo.png" alt="Duelly" className="h-14 w-auto" /></Link>
            <div className="flex items-center gap-4">
              <Link href="/signup" className="px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors">Get Started</Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-2">Blog</h1>
        <p className="text-muted-foreground mb-12">Practical guides on SEO, AEO, and GEO for small businesses.</p>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block p-6 rounded-2xl border border-border/50 bg-card/30 hover:border-border transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ color: categoryColor[post.category], background: `${categoryColor[post.category]}15` }}>
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <span className="text-xs text-muted-foreground">· {post.readTime}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-[#00e5ff] transition-colors">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.description}</p>
              <span className="text-sm font-semibold text-[#00e5ff] flex items-center gap-1">
                Read more <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
