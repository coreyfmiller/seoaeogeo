import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Credit Packs',
  description: 'Purchase Duelly credit packs for Pro Analysis, Deep Scan, Competitor Duels, and Keyword Arena. One-time purchase, credits never expire. Packs start at $79.99.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — Credit Packs | Duelly',
    description: 'One-time credit packs for AI-powered SEO, AEO, and GEO audits. No subscriptions. Credits never expire. Packs start at $79.99.',
    url: 'https://duelly.ai/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Credit Packs | Duelly',
    description: 'One-time credit packs for AI-powered SEO, AEO, and GEO audits. No subscriptions. Credits never expire.',
  },
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return children
}
