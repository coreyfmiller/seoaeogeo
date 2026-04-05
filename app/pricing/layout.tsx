import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Credit Packs',
  description: 'Purchase Duelly credit packs for Pro Analysis, Deep Scan, Competitor Duels, and Keyword Arena. One-time purchase, credits never expire. Packs start at $79.99.',
  alternates: { canonical: '/pricing' },
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return children
}
