import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quick SEO Audit | Duelly.ai',
  description: 'Run a quick SEO, AEO, and GEO audit on any website. Get instant scores and recommendations.',
  alternates: { canonical: '/free-audit' },
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return children
}
