import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pro Credit Packs',
  description: 'Purchase Citatom credit packs for Pro Audit, Deep Scan, and Competitive Intelligence. Plans start at $20 for 200 credits.',
  alternates: { canonical: '/pro' },
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return children
}
