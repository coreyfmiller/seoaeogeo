import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audit Standards & Methodology',
  description: 'Learn how Citatom scores websites across SEO, AEO, and GEO. Transparent methodology with 50+ scoring signals and site-type-specific weighting.',
  alternates: { canonical: '/standards' },
}

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return children
}
