import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description: 'Get answers about Duelly audits, scoring methodology, SEO, AEO, and GEO optimization. Learn how to use Pro Audit, Deep Scan, and Competitive Intelligence.',
  alternates: { canonical: '/help' },
  openGraph: {
    title: 'Help & FAQ | Duelly',
    description: 'Get answers about Duelly audits, scoring methodology, SEO, AEO, and GEO optimization.',
    url: 'https://duelly.ai/help',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help & FAQ | Duelly',
    description: 'Get answers about Duelly audits, scoring methodology, SEO, AEO, and GEO optimization.',
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}
