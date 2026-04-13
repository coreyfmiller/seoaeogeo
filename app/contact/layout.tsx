import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Duelly team. Questions about SEO, AEO, GEO audits, or your account? We are here to help.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | Duelly',
    description: 'Get in touch with the Duelly team. Questions about SEO, AEO, GEO audits, or your account? We are here to help.',
    url: 'https://duelly.ai/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Duelly',
    description: 'Get in touch with the Duelly team. Questions about audits or your account? We are here to help.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
