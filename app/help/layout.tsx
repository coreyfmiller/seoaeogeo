import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description: 'Get answers about Citatom audits, scoring methodology, SEO, AEO, and GEO optimization. Learn how to use Pro Audit, Deep Scan, and Competitive Intelligence.',
  alternates: { canonical: '/help' },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}
