"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FlaskConical, Bot, Layers, Swords, Home, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const demoNav = [
  { name: "AI Visibility", icon: FlaskConical, href: "/demo/ai-test", badge: "NEW" },
  { name: "Pro Audit", icon: Bot, href: "/demo/pro-audit" },
  { name: "Deep Scan", icon: Layers, href: "/demo/deep-scan" },
  { name: "Competitor Duel", icon: Swords, href: "/demo/battle-mode" },
  { name: "Dashboard", icon: Home, href: "/demo/dashboard" },
]

export function DemoSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-sidebar h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link href="/demo/dashboard" className="flex items-center">
          <Image src="/logo.png" alt="Duelly" width={120} height={48} className="h-12 w-auto" priority />
        </Link>
      </div>

      {/* Demo badge */}
      <div className="px-4 pt-4 pb-2">
        <Badge className="w-full justify-center bg-[#BC13FE]/10 text-[#BC13FE] border-[#BC13FE]/20 text-xs py-1">
          INTERACTIVE DEMO
        </Badge>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Tools</p>
        <ul className="space-y-1">
          {demoNav.map(item => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === item.href
                    ? "bg-seo/10 text-seo font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.name}</span>
                {item.badge === "NEW" && (
                  <span className="px-1.5 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 text-[9px] font-bold uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* CTA */}
      <div className="p-4 border-t border-border/50">
        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-sm transition-colors"
        >
          Get Real Results <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Demo data — sign up for real audits</p>
      </div>
    </aside>
  )
}
