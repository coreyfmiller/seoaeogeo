import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ChatWrapper } from '@/components/chat/chat-wrapper'
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
  openGraph: {
    title: 'Duelly - Search Intelligence Platform',
    description: 'Audit your website for SEO, AEO, and GEO. See how Google, ChatGPT, Gemini, and Perplexity view your site — and outrank your competitors.',
    url: 'https://duelly.ai',
    siteName: 'Duelly',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Duelly - SEO, AEO & GEO Intelligence Platform' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duelly - Search Intelligence Platform',
    description: 'Audit your website for SEO, AEO, and GEO. See how Google, ChatGPT, Gemini, and Perplexity view your site — and outrank your competitors.',
    images: ['/og.png'],
  },
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
                  founder: {
                    '@type': 'Person',
                    name: 'Fundylogic',
                    url: 'https://fundylogic.com',
                  },
                  foundingDate: '2025',
                  sameAs: [
                    'https://fundylogic.com',
                  ],
                },
                {
                  '@type': 'WebSite',
                  name: 'Duelly',
                  url: 'https://duelly.ai',
                  description: 'AI-powered search intelligence platform for SEO, AEO, and GEO analytics.',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://duelly.ai/keyword-arena?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'Duelly',
                  url: 'https://duelly.ai',
                  applicationCategory: 'BusinessApplication',
                  operatingSystem: 'Web',
                  description: 'AI-powered website auditing tool that scores pages on SEO, AEO, and GEO with actionable fix instructions.',
                  offers: [
                    { '@type': 'Offer', name: 'AI Launch Pack', price: '79.99', priceCurrency: 'USD', description: '180 credits for Pro Analysis, Deep Scan, Competitor Duel, and Keyword Arena.' },
                    { '@type': 'Offer', name: 'Visibility Growth Bundle', price: '149.99', priceCurrency: 'USD', description: '550 credits for all tools. Includes 60 bonus credits.' },
                    { '@type': 'Offer', name: 'Authority Agency Suite', price: '299.99', priceCurrency: 'USD', description: '1,450 credits for all tools with premium features. Includes 150 bonus credits.' },
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
                    { '@type': 'ListItem', position: 2, name: 'Pro Audit', item: 'https://duelly.ai/pro-audit' },
                    { '@type': 'ListItem', position: 3, name: 'Deep Scan', item: 'https://duelly.ai/deep-scan' },
                    { '@type': 'ListItem', position: 4, name: 'Competitor Duel', item: 'https://duelly.ai/battle-mode' },
                    { '@type': 'ListItem', position: 5, name: 'Keyword Arena', item: 'https://duelly.ai/keyword-arena' },
                    { '@type': 'ListItem', position: 6, name: 'Blog', item: 'https://duelly.ai/blog' },
                    { '@type': 'ListItem', position: 7, name: 'Pricing', item: 'https://duelly.ai/pricing' },
                    { '@type': 'ListItem', position: 8, name: 'About', item: 'https://duelly.ai/about' },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
            <ChatWrapper>
                {children}
            </ChatWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
