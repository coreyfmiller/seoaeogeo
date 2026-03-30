import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Duelly privacy policy — how we collect, use, and protect your data.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <header>
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center"><img src="/logo.png" alt="Duelly" className="h-14 w-auto" /></Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
          </div>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 29, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">When you create an account, we collect your name, email address, and payment information (processed securely by Stripe). When you use our tools, we collect the URLs you submit for analysis. We do not store the content of the websites you scan — only the analysis results and scores.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use your information to provide and improve our services, process payments, send transactional emails (scan results, account updates), and communicate product updates. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">Your account data is stored securely in Supabase (hosted on AWS). Payment processing is handled entirely by Stripe — we never store your credit card details. All data is transmitted over HTTPS. Scan results are stored temporarily and may be cached to improve performance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">We use the following third-party services: Google Gemini AI (content analysis), Stripe (payment processing), Supabase (authentication and data storage), Vercel (hosting), Moz (backlink data), and Serper (search results). Each service has its own privacy policy governing how they handle data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">We use essential cookies for authentication and session management. We use Vercel Analytics for anonymous usage statistics. We do not use advertising cookies or tracking pixels.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">You can request deletion of your account and all associated data at any time through the Settings page or by contacting us at support@duelly.ai. You can export your scan history from the Dashboard.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For privacy-related questions, contact us at support@duelly.ai.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
