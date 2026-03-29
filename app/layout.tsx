import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://duelly.ai'),
  title: {
    default: 'Duelly - Search Intelligence Platform',
    template: '%s | Duelly',
  },
  description: 'Comprehensive SEO, AEO, and GEO analytics platform for optimizing your search visibility across traditional and AI-powered search engines.',
  generator: 'v0.app',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Duelly',
                  url: 'https://duelly.ai',
                  logo: 'https://duelly.ai/logo.png',
                  description: 'Search intelligence platform providing SEO, AEO, and GEO analytics for the AI search era.',
                  email: 'support@duelly.ai',
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'Duelly',
                  url: 'https://duelly.ai',
                  applicationCategory: 'BusinessApplication',
                  operatingSystem: 'Web',
                  description: 'AI-powered website auditing tool that scores pages on SEO, AEO, and GEO with actionable fix instructions.',
                  offers: [
                    { '@type': 'Offer', name: 'Free Audit', price: '0', priceCurrency: 'USD', description: 'Basic SEO, AEO, and GEO score. No account required.' },
                    { '@type': 'Offer', name: 'Pro Credits', price: '20', priceCurrency: 'USD', description: '200 credits for Pro Audit, Deep Scan, Competitor Duel, and Keyword Arena.' },
                    { '@type': 'Offer', name: 'Pro Plus Credits', price: '50', priceCurrency: 'USD', description: '600 credits for all tools.' },
                    { '@type': 'Offer', name: 'Agency Credits', price: '100', priceCurrency: 'USD', description: '1,500 credits for all tools.' },
                  ],
                  featureList: [
                    'SEO Analysis with Core Web Vitals',
                    'Answer Engine Optimization (AEO) scoring',
                    'Generative Engine Optimization (GEO) scoring',
                    'AI-powered content analysis via Google Gemini',
                    'Platform-specific fix instructions',
                    'Head-to-head competitive analysis with backlink data',
                    'Keyword Arena with Google vs AI rank comparison',
                    'Multi-page Deep Scan up to 50 pages',
                  ],
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://duelly.ai' },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
