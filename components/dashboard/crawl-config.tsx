"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Settings, 
  Plus, 
  X, 
  Globe, 
  Clock, 
  Shield,
  Info,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CrawlConfigProps {
  onStartCrawl: (config: CrawlConfiguration) => void
  isAnalyzing: boolean
}

export interface CrawlConfiguration {
  url: string
  pageCount: 1 | 10 | 20 | 50
  competitorUrls: string[]
  respectRobotsTxt: boolean
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-geo cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-popover border border-border rounded-lg text-xs shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 ring-1 ring-border/50">
        <p className="text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

export function CrawlConfig({ onStartCrawl, isAnalyzing }: CrawlConfigProps) {
  const [url, setUrl] = useState("")
  const [pageCount, setPageCount] = useState<1 | 10 | 20 | 50>(20)
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true)
  const [urlError, setUrlError] = useState("")

  const validateUrl = (urlString: string): boolean => {
    if (!urlString) return false
    try {
      // Add protocol if missing
      const testUrl = urlString.startsWith('http') ? urlString : `https://${urlString}`
      new URL(testUrl)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateUrl(url)) {
      setUrlError("Please enter a valid URL")
      return
    }

    setUrlError("")
    onStartCrawl({
      url: url.startsWith('http') ? url : `https://${url}`,
      pageCount,
      competitorUrls: [],
      respectRobotsTxt
    })
  }

  const pageOptions = [
    { value: 1, label: "1 Page", time: "~5s", desc: "Single page" },
    { value: 10, label: "10 Pages", time: "~60s", desc: "Quick scan" },
    { value: 20, label: "20 Pages", time: "~120s", desc: "Standard" },
    { value: 50, label: "50 Pages", time: "~180s", desc: "Deep scan" }
  ] as const

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* URL Input - Matching other pages */}
      <div className="relative group">
        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-seo transition-colors z-10" />
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setUrlError("")
          }}
          placeholder="Enter website URL (e.g., example.com)"
          className={cn(
            "w-full pl-12 pr-4 py-4 text-lg rounded-2xl",
            "bg-muted/50 border border-border/50",
            "focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50",
            "transition-all placeholder:text-muted-foreground/70",
            urlError && "border-destructive focus:ring-destructive/20"
          )}
          disabled={isAnalyzing}
        />
        {urlError && (
          <p className="text-xs text-destructive mt-2 ml-1">{urlError}</p>
        )}
      </div>

      {/* Page Count Selector - Compact Pills */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pages to Crawl
        </Label>
        <div className="flex flex-wrap gap-2">
          {pageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPageCount(option.value)}
              disabled={isAnalyzing}
              className={cn(
                "px-4 py-2 rounded-lg border transition-all text-sm font-medium",
                "hover:border-seo/50 hover:bg-seo/5",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                pageCount === option.value
                  ? "border-seo bg-seo/10 text-seo"
                  : "border-border/50 bg-background text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{option.label}</span>
                <span className="text-xs opacity-70">({option.time})</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Robots.txt Toggle - Minimal */}
      <div className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          id="respectRobotsTxt"
          checked={respectRobotsTxt}
          onChange={(e) => setRespectRobotsTxt(e.target.checked)}
          disabled={isAnalyzing}
          className="h-4 w-4 rounded border-border/50 text-seo focus:ring-seo/20"
        />
        <Label 
          htmlFor="respectRobotsTxt" 
          className="flex items-center gap-2 cursor-pointer text-muted-foreground"
        >
          <Shield className="h-4 w-4" />
          Respect robots.txt
        </Label>
      </div>

      {/* Submit Button - Matching style */}
      <button
        type="submit"
        disabled={!url || isAnalyzing}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-base transition-all",
          "bg-seo text-seo-foreground hover:bg-seo/90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {isAnalyzing ? (
          <>
            <div className="h-4 w-4 border-2 border-t-transparent border-seo-foreground rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Start Analysis
          </>
        )}
      </button>
    </form>
  )
}
