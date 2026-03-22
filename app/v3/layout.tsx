import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pro Audit - AI-Powered SEO Analysis',
  description: 'Run an AI-powered Pro Audit on any website. Get SEO, AEO, and GEO scores with platform-specific fix instructions and actionable recommendations.',
  alternates: { canonical: '/v3' },
}

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return children
}
