"use client"

import { useState } from "react"
import { Globe, Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  onSubmit: (url: string) => void
  isAnalyzing?: boolean
  placeholder?: string
  buttonText?: string
  className?: string
  variant?: "default" | "large" | "compact"
}

export function SearchInput({
  onSubmit,
  isAnalyzing = false,
  placeholder = "Enter website URL (e.g., example.com)",
  buttonText = "Analyze",
  className,
  variant = "default"
}: SearchInputProps) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
    }
  }

  const variants = {
    default: {
      container: "w-full max-w-2xl",
      input: "pl-12 pr-32 py-4 text-lg",
      icon: "left-4 h-5 w-5",
      button: "right-2 px-6 py-2 text-base"
    },
    large: {
      container: "w-full max-w-3xl",
      input: "pl-14 pr-36 py-5 text-xl",
      icon: "left-5 h-6 w-6",
      button: "right-2.5 px-8 py-3 text-lg"
    },
    compact: {
      container: "w-full",
      input: "pl-10 pr-28 py-3 text-base",
      icon: "left-3 h-4 w-4",
      button: "right-1.5 px-4 py-1.5 text-sm"
    }
  }

  const style = variants[variant]

  return (
    <form onSubmit={handleSubmit} className={cn(style.container, className)}>
      <div className="relative group">
        <Globe className={cn(
          "absolute top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-seo transition-colors",
          style.icon
        )} />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-muted/50 border border-border/50 rounded-2xl",
            "focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50",
            "transition-all placeholder:text-muted-foreground/70",
            style.input
          )}
          required
          disabled={isAnalyzing}
        />
        <button
          type="submit"
          disabled={isAnalyzing || !url.trim()}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-xl font-bold",
            "bg-seo text-seo-foreground hover:bg-seo/90",
            "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            style.button
          )}
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{buttonText}</span>
            </div>
          )}
        </button>
      </div>
    </form>
  )
}

interface DualSearchInputProps {
  onSubmit: (urlA: string, urlB: string) => void
  isAnalyzing?: boolean
  placeholderA?: string
  placeholderB?: string
  labelA?: string
  labelB?: string
  className?: string
}

export function DualSearchInput({
  onSubmit,
  isAnalyzing = false,
  placeholderA = "example.com",
  placeholderB = "competitor.com",
  labelA = "Site 1",
  labelB = "Site 2",
  className
}: DualSearchInputProps) {
  const [urlA, setUrlA] = useState("")
  const [urlB, setUrlB] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlA.trim() && urlB.trim()) {
      onSubmit(urlA.trim(), urlB.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center">
        {/* Site A */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-seo ml-1 uppercase tracking-wider">
            {labelA}
          </label>
          <div className="relative group">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-seo transition-colors" />
            <input
              type="text"
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              placeholder={placeholderA}
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50 transition-all text-sm"
              required
              disabled={isAnalyzing}
            />
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
          <div className="h-12 w-px bg-border/50 hidden md:block" />
          <div className="h-10 w-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center font-bold text-sm text-foreground italic z-10 shrink-0">
            VS
          </div>
          <div className="h-12 w-px bg-border/50 hidden md:block" />
        </div>

        {/* Site B */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-aeo ml-1 uppercase tracking-wider">
            {labelB}
          </label>
          <div className="relative group">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-aeo transition-colors" />
            <input
              type="text"
              value={urlB}
              onChange={(e) => setUrlB(e.target.value)}
              placeholder={placeholderB}
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeo/20 focus:border-aeo/50 transition-all text-sm"
              required
              disabled={isAnalyzing}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={isAnalyzing || !urlA.trim() || !urlB.trim()}
          className={cn(
            "group relative flex items-center justify-center px-8 py-3",
            "bg-foreground text-background rounded-lg font-bold text-base",
            "hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg",
            "ring-2 ring-transparent hover:ring-foreground/10",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              Compare Now
              <Search className="inline-block ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
