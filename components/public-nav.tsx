import Link from 'next/link'
import Image from 'next/image'

export function PublicNav() {
  return (
    <header>
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Duelly" width={140} height={56} className="h-14 w-auto" priority />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</Link>
            <Link href="/standards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How We Score</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="px-5 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-white font-bold text-sm transition-colors">
              Get Started
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
