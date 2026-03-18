"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
  Layers,
  Crown,
  Home,
  ChevronDown,
  ChevronRight,
  Archive,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  icon: React.ElementType
  href: string
  badge?: string
}

const mainNav: NavItem[] = [
  { name: "Free Audit", icon: Sparkles, href: "/v2" },
  { name: "Pro Audit", icon: Bot, href: "/v3", badge: "PRO AI" },
  { name: "Deep Scan", icon: Layers, href: "/deep-v3", badge: "PRO AI" },
  { name: "Competitive Intel", icon: Globe, href: "/intelligence", badge: "PRO AI" },
  { name: "Dashboard", icon: Home, href: "/dashboard" },
]

const eolNav: NavItem[] = [
  { name: "V4 Free Audit", icon: Sparkles, href: "/v4", badge: "BETA AI" },
  { name: "Free Audit EOL", icon: Search, href: "/free", badge: "EOL" },
  { name: "Pro Audit EOL", icon: LayoutDashboard, href: "/", badge: "EOL" },
  { name: "Deep Crawler EOL", icon: TrendingUp, href: "/site-analysis", badge: "EOL" },
]

const comingSoonNav: NavItem[] = []

const bottomNav: NavItem[] = [
  { name: "Our Standards", icon: FileText, href: "/standards" },
  { name: "Help & Support", icon: HelpCircle, href: "/help", badge: "" },
  { name: "Settings", icon: Settings, href: "#", badge: "SOON" },
  { name: "Usage & Costs", icon: BarChart3, href: "/usage", badge: "ADMIN" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [eolOpen, setEolOpen] = useState(false)

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-seo text-seo-foreground">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">Vantege</h1>
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
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.badge === "PRO AI" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-green-500/10 to-purple-500/10 text-green-600 border border-green-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      PRO AI
                    </span>
                  )}
                  {item.badge === "FREE" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      FREE
                    </span>
                  )}
                  {item.badge === "ADMIN" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.badge === "BETA" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.badge === "BETA AI" && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500/10 to-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      BETA AI
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </nav>
      <div className="px-3 py-4 border-t border-border/50 space-y-3">
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
                <span className="flex-1">{item.name}</span>
                {item.badge === "ADMIN" && (
                  <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    {item.badge}
                  </span>
                )}
                {item.badge === "SOON" && (
                  <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* EOL Section */}
        <div>
          <button
            onClick={() => setEolOpen(!eolOpen)}
            className="flex items-center gap-2 px-3 mb-2 w-full text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            {eolOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <Archive className="h-3 w-3" />
            <span>EOL</span>
            <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm ml-auto">
              ADMIN
            </span>
          </button>
          {eolOpen && (
            <ul className="space-y-1">
              {eolNav.map((item) => (
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
                    {item.badge === "EOL" && (
                      <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        EOL
                      </span>
                    )}
                    {item.badge === "BETA AI" && (
                      <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500/10 to-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        BETA AI
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
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
