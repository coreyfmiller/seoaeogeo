"use client"

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
  active?: boolean
  badge?: string
}

const mainNav: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "#", active: true },
  { name: "Site Analysis", icon: Search, href: "#" },
  { name: "Keywords", icon: FileText, href: "#" },
  { name: "Backlinks", icon: TrendingUp, href: "#" },
]

const intelligenceNav: NavItem[] = [
  { name: "SEO Insights", icon: BarChart3, href: "#", badge: "12" },
  { name: "AEO Monitor", icon: Sparkles, href: "#", badge: "5" },
  { name: "GEO Tracker", icon: Bot, href: "#", badge: "8" },
  { name: "Competitors", icon: Globe, href: "#" },
]

const bottomNav: NavItem[] = [
  { name: "Settings", icon: Settings, href: "#" },
  { name: "Help & Support", icon: HelpCircle, href: "#" },
]

export function AppSidebar() {
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
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    item.active
                      ? "bg-seo/10 text-seo font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Intelligence
          </p>
          <ul className="space-y-1">
            {intelligenceNav.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-seo/20 text-seo text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                </a>
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
              <a
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </a>
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
