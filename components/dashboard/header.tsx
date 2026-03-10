"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Bell,
  Menu,
  Globe,
  Loader2,
  Activity,
  ShieldAlert,
  Lock,
  Unlock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

interface HeaderProps {
  onAnalyze?: (url: string) => void
  isAnalyzing?: boolean
  currentUrl?: string
  apiStatus?: "healthy" | "error" | "idle"
}

export function Header({ onAnalyze, isAnalyzing, currentUrl, apiStatus = "idle" }: HeaderProps) {
  const [url, setUrl] = useState(currentUrl || "")
  const [isProUnlocked, setIsProUnlocked] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsProUnlocked(localStorage.getItem("isProUnlocked") === "true")
    }
  }, [])

  const handleUnlock = () => {
    if (password === "password123") {
      localStorage.setItem("isProUnlocked", "true")
      setIsProUnlocked(true)
      setShowProModal(false)
      setPassword("")
      setError(false)
      if (pathname === "/site-analysis") {
        window.location.reload()
      } else {
        router.push("/site-analysis")
      }
    } else {
      setError(true)
    }
  }

  const handleLock = () => {
    localStorage.removeItem("isProUnlocked")
    setIsProUnlocked(false)
    if (pathname === "/site-analysis") {
      router.push("/")
    }
  }

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
            type="text"
            placeholder="Enter URL to analyze (e.g., example.com)"
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
              "absolute right-1.5 top-1/2 -translate-y-1/2 overflow-hidden",
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
      <div className="flex items-center gap-4">
        {/* API Status Indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
          apiStatus === "healthy" && "border-geo/30 bg-geo/10 text-geo",
          apiStatus === "error" && "border-destructive/30 bg-destructive/10 text-destructive animate-pulse",
          apiStatus === "idle" && "border-border/50 bg-muted/50 text-muted-foreground"
        )}>
          {apiStatus === "healthy" ? <Activity className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          API {apiStatus}
        </div>

        {/* Pro Mode Unlock Toggle */}
        {isProUnlocked ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLock}
            className="text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-2 border border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10"
          >
            <Lock className="h-4 w-4" />
            Exit Pro Mode
          </Button>
        ) : (
          <Dialog open={showProModal} onOpenChange={setShowProModal}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30 font-semibold shadow-sm transition-all"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Go Pro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Lock className="h-5 w-5 text-yellow-500" />
                  Enter Beta Authorization
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your beta key to unlock the Deep Scanning multi-page engine.
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  type="password"
                  placeholder="Enter Passcode..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  className={cn(
                    "border-border/50 bg-input",
                    error && "border-destructive focus-visible:ring-destructive"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUnlock()
                  }}
                />
                {error && <p className="text-sm text-destructive font-medium animate-in fade-in">Invalid passcode. Please try again.</p>}
              </div>
              <DialogFooter>
                <Button onClick={handleUnlock} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold w-full">
                  Unlock Pro Dashboard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  )
}
