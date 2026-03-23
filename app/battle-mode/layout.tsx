import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Battle Mode — Strategy Duel',
  description: 'Head-to-head competitive intelligence duel. Compare SEO, AEO, and GEO scores with glowing radial gauges and AI-powered counter-strategies.',
  alternates: { canonical: '/battle-mode' },
}

export default function BattleModeLayout({ children }: { children: React.ReactNode }) {
  return children
}
