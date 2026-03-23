"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Menu,
  Globe,
  Loader2,
  Activity,
  ShieldAlert,
  Crown,
  Coins,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface HeaderProps {
  onAnalyze?: (url: string) => void
  isAnalyzing?: boolean
  currentUrl?: string
  apiStatus?: "healthy" | "error" | "idle"
  hideSearch?: boolean
  placeholder?: string
  buttonLabel?: string
  onMenuToggle?: () => void
}

export function Header({ onAnalyze, isAnalyzing, currentUrl, apiStatus = "idle", hideSearch = false, placeholder, buttonLabel, onMenuToggle }: HeaderProps) {
  const [url, setUrl] = useState(currentUrl || "")
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetchCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase
        .from("profiles")
        .select("credits, is_admin")
        .eq("id", user.id)
        .single()
      if (prof) {
        setCredits(prof.credits || 0)
      }
    }
    fetchCredits()

    // Re-fetch when credits change (scan confirmed, refund, etc.)
    const handler = () => fetchCredits()
    window.addEventListener('credits-changed', handler)
    return () => window.removeEventListener('credits-changed', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url && onAnalyze) {
      onAnalyze(url)
    }
  }

  return (
    <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={onMenuToggle} aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search Bar */}
      {!hideSearch && (
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl min-w-0">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder || "Enter URL to analyze..."}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              "pl-10 pr-20 sm:pr-24 h-10 sm:h-11 bg-input border-border/50 text-sm",
              "focus:border-seo/50 focus:ring-seo/20",
              "placeholder:text-muted-foreground/70"
            )}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!url || isAnalyzing}
            className={cn(
              "absolute right-1.5 top-1/2 -translate-y-1/2 overflow-hidden",
              "bg-seo hover:bg-seo/90 text-seo-foreground"
            )}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{buttonLabel || "Analyze"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
      )}

      {/* Right side — always pinned far right */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
        {/* API Status — hide on mobile */}
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
          apiStatus === "healthy" && "border-geo/30 bg-geo/10 text-geo",
          apiStatus === "error" && "border-destructive/30 bg-destructive/10 text-destructive animate-pulse",
          apiStatus === "idle" && "border-border/50 bg-muted/50 text-muted-foreground"
        )}>
          {apiStatus === "healthy" ? <Activity className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          API {apiStatus}
        </div>

        {/* Credit Balance */}
        {credits !== null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#842ce0]/30 bg-[#842ce0]/5">
            <Coins className="h-3.5 w-3.5 text-[#842ce0]" />
            <span className="text-sm font-bold text-[#842ce0] tabular-nums">{credits}</span>
          </div>
        )}

        {/* Buy Credits Button */}
        <Link href="/pro">
          <Button
            className="bg-[#118fff] hover:bg-[#118fff]/90 text-white font-semibold px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base shadow-md"
          >
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Buy Credits</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
