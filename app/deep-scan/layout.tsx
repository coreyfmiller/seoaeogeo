import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deep Scan - Multi-Page AI Analysis',
  description: 'Crawl and analyze up to 50 pages with AI-powered Deep Scan. Get comprehensive site-wide SEO, AEO, and GEO scoring with page-by-page breakdowns.',
  alternates: { canonical: '/deep-scan' },
}

export default function DeepV3Layout({ children }: { children: React.ReactNode }) {
  return children
}
