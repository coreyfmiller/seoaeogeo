import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Duelly terms of service — rules and guidelines for using our platform.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header>
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center"><img src="/logo.png" alt="Duelly" className="h-14 w-auto" /></Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
          </div>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 29, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using Duelly (duelly.ai), you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">Duelly is a search intelligence platform that provides SEO, AEO, and GEO analysis of websites. We crawl publicly accessible web pages, analyze their content using AI, and provide scores and recommendations. Our analysis is informational and does not guarantee search engine rankings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Accounts & Credits</h2>
            <p className="text-muted-foreground leading-relaxed">You must create an account to access paid features. Credits are purchased in packs and do not expire. Credits are non-refundable except when a scan fails due to a system error, in which case credits are automatically refunded. You are responsible for maintaining the security of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">You may only scan websites you own or have permission to analyze. You may not use Duelly to scan websites for malicious purposes, reverse-engineer our scoring algorithms, or resell our data without permission. Automated bulk scanning beyond normal usage may result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">Duelly and its original content, features, and functionality are owned by Duelly and are protected by copyright and trademark laws. Scan results generated for your websites belong to you and may be shared freely.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">Duelly is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to changes in search engine rankings, lost revenue, or data loss. Our total liability is limited to the amount you paid for credits in the preceding 12 months.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">We may terminate or suspend your account at any time for violation of these terms. You may delete your account at any time through the Settings page. Upon termination, unused credits are forfeited.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For questions about these terms, contact us at support@duelly.ai.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
