import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://duelly.ai'

  return [
    { url: baseUrl, lastModified: '2026-04-13', changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/pro-audit`, lastModified: '2026-04-01', changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/deep-scan`, lastModified: '2026-04-01', changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/keyword-arena`, lastModified: '2026-04-01', changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/battle-mode`, lastModified: '2026-04-01', changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/ai-test`, lastModified: '2026-04-01', changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/free-audit`, lastModified: '2026-03-15', changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/demo`, lastModified: '2026-04-20', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: '2026-04-01', changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog/what-is-aeo`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/seo-vs-aeo-vs-geo`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/local-seo-atlantic-canada`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/backlinks-explained`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/content-ai-cites`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/google-rank-vs-ai-rank`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/schema-markup-small-business`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog/seo-mistakes-small-business`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: '2026-04-01', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/standards`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/help`, lastModified: '2026-03-15', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: '2026-03-15', changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.3 },
  ]
}
