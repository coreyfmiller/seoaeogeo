"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Bell,
  Menu,
  Globe,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onAnalyze?: (url: string) => void
  isAnalyzing?: boolean
  currentUrl?: string
}

export function Header({ onAnalyze, isAnalyzing, currentUrl }: HeaderProps) {
  const [url, setUrl] = useState(currentUrl || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url && onAnalyze) {
      onAnalyze(url)
    }
  }

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Enter URL to analyze (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              "pl-10 pr-24 h-11 bg-input border-border/50",
              "focus:border-seo/50 focus:ring-seo/20",
              "placeholder:text-muted-foreground/70"
            )}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!url || isAnalyzing}
            className={cn(
              "absolute right-1.5 top-1/2 -translate-y-1/2",
              "bg-seo hover:bg-seo/90 text-seo-foreground"
            )}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-seo rounded-full" />
        </Button>
      </div>
    </header>
  )
}
