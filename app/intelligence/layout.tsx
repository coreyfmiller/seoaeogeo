import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Competitive Intelligence',
  description: 'Compare your website head-to-head against competitors. AI-powered competitive analysis across SEO, AEO, and GEO with counter-strategy recommendations.',
  alternates: { canonical: '/intelligence' },
}

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  return children
}
