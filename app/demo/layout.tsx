import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interactive Demo | Duelly',
  description: 'Try Duelly with simulated data. See Pro Audit, Deep Scan, Competitor Duel, and AI Visibility in action — no account required.',
  robots: { index: false, follow: false },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
