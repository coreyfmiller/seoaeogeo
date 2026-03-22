import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/settings', '/usage'],
      },
    ],
    sitemap: 'https://duelly.ai/sitemap.xml',
  }
}
