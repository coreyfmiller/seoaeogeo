import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-sm mb-3">Tools</h4>
            <ul className="space-y-2">
              <li><Link href="/pro-audit-v4" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pro Audit</Link></li>
              <li><Link href="/deep-scan-v4" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deep Scan</Link></li>
              <li><Link href="/battle-mode-v3" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Competitor Duel</Link></li>
              <li><Link href="/keyword-arena-v3" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Keyword Arena</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How We Score</Link></li>
              <li><Link href="/pro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link></li>
              <li><a href="mailto:support@duelly.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; 2026 Duelly. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/50">The roadmap to outrank your rivals. Built by <a href="https://fundylogic.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">Fundylogic.com</a></p>
        </div>
      </div>
    </footer>
  )
}
