import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free SEO Audit',
  description: 'Run a free SEO, AEO, and GEO audit on any website. No account required. Get instant scores and recommendations.',
  alternates: { canonical: '/v2' },
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return children
}
