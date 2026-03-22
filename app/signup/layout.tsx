import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for Duelly to unlock AI-powered SEO, AEO, and GEO audits. Free audits available without an account.',
  alternates: { canonical: '/signup' },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
