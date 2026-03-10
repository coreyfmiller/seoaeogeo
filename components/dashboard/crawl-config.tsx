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
    { value: 1, label: "1 Page", time: "~5s", desc: "Single page analysis" },
    { value: 10, label: "10 Pages", time: "~60s", desc: "Quick site overview" },
    { value: 20, label: "20 Pages", time: "~120s", desc: "Standard audit" },
    { value: 50, label: "50 Pages", time: "~180s", desc: "Deep site analysis" }
  ] as const

  return (
    <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-geo" />
              Crawl Configuration
            </CardTitle>
            <CardDescription>
              Configure your site analysis settings
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-geo/30 text-geo bg-geo/5">
            <Zap className="h-3 w-3 mr-1" />
            Advanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-geo" />
              Target Website
              <InfoTooltip text="Enter the domain or URL you want to analyze. We'll start from this page and discover linked pages." />
            </Label>
            <Input
              id="url"
              type="text"
              placeholder="e.g. example.com or https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setUrlError("")
              }}
              className={cn(
                "bg-background",
                urlError && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isAnalyzing}
            />
            {urlError && (
              <p className="text-xs text-destructive">{urlError}</p>
            )}
          </div>

          {/* Page Count Selector */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-geo" />
              Pages to Crawl
              <InfoTooltip text="More pages = deeper insights but longer analysis time. Start with 10 pages for a quick overview." />
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPageCount(option.value)}
                  disabled={isAnalyzing}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    "hover:border-geo/50 hover:bg-geo/5",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    pageCount === option.value
                      ? "border-geo bg-geo/10"
                      : "border-border/50 bg-background"
                  )}
                >
                  <div className="font-bold text-sm mb-1">{option.label}</div>
                  <div className="text-xs text-muted-foreground mb-2">{option.desc}</div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {option.time}
                  </Badge>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Estimated time: <span className="font-bold text-foreground">
                  {pageOptions.find(o => o.value === pageCount)?.time}
                </span>
              </span>
            </div>
          </div>

          {/* Robots.txt Respect */}
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
            <input
              type="checkbox"
              id="respectRobotsTxt"
              checked={respectRobotsTxt}
              onChange={(e) => setRespectRobotsTxt(e.target.checked)}
              disabled={isAnalyzing}
              className="h-4 w-4 rounded border-border/50 text-geo focus:ring-geo/20"
            />
            <Label 
              htmlFor="respectRobotsTxt" 
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <Shield className="h-4 w-4 text-geo" />
              <span className="text-sm">Respect robots.txt directives</span>
              <InfoTooltip text="When enabled, we'll honor the site's robots.txt file and skip pages marked as disallowed. Recommended for ethical crawling." />
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!url || isAnalyzing}
            className="w-full bg-geo text-geo-foreground hover:bg-geo/90 font-bold py-6 text-base"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent border-geo-foreground rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
