"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Sparkles,
  Globe,
  Bot,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  icon: React.ElementType
  href: string
  badge?: string
}

const mainNav: NavItem[] = [
  { name: "Free Scan", icon: Search, href: "/free" },
  { name: "Pro Dashboard", icon: LayoutDashboard, href: "/", badge: "PRO" },
  { name: "Site Vs Site", icon: Globe, href: "/intelligence" },
  { name: "Deep Crawler", icon: TrendingUp, href: "/site-analysis", badge: "PRO" },
  { name: "Merged Dashboard", icon: Sparkles, href: "/merged", badge: "BETA" },
  { name: "Usage & Costs", icon: BarChart3, href: "/usage" },
]

const comingSoonNav: NavItem[] = [
  { name: "Keywords", icon: FileText, href: "#", badge: "Soon" },
  { name: "Backlinks", icon: TrendingUp, href: "#", badge: "Soon" },
  { name: "SEO Insights", icon: BarChart3, href: "#", badge: "Soon" },
  { name: "AEO Monitor", icon: Sparkles, href: "#", badge: "Soon" },
  { name: "GEO Tracker", icon: Bot, href: "#", badge: "Soon" },
]

const bottomNav: NavItem[] = [
  { name: "Settings", icon: Settings, href: "#" },
  { name: "Help & Support", icon: HelpCircle, href: "#" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-seo text-seo-foreground">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">SearchIQ</h1>
          <p className="text-xs text-muted-foreground">Intelligence Platform</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </p>
          <ul className="space-y-1">
            {mainNav.map((item) => (
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
                  {item.badge === "PRO" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.badge === "BETA" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-geo/10 text-geo border border-geo/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Coming Soon
          </p>
          <ul className="space-y-1">
            {comingSoonNav.map((item) => (
              <li key={item.name}>
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/40 cursor-not-allowed select-none"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="flex items-center justify-center h-5 px-2.5 rounded-full bg-muted/50 text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-border/50">
        <ul className="space-y-1">
          {bottomNav.map((item) => (
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
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User */}
      <div className="px-3 py-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-seo to-aeo flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
