"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  Zap,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  BarChart3,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Priority = "high" | "medium" | "low"

interface Recommendation {
  id: string
  rank?: number
  title: string // Now used for the "Action/Solution"
  description: string // Now used for the "Reasoning/Impact"
  priority: Priority
  category: "seo" | "aeo" | "geo" | "Schema" | "Technical" | "Content" | "Trust" | "AEO"
  impact: string
  effort?: "easy" | "moderate" | "tough"
}

const defaultRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "Optimize LCP and Lazy Load Images",
    description: "Your Largest Contentful Paint is above 2.5s. Optimized images and deferred loading of off-screen content will improve user retention and ranking signals.",
    priority: "high",
    category: "seo",
    impact: "Critical Performance Gain",
    effort: "moderate"
  },
  {
    id: "2",
    title: "Deploy FAQ Schema to Capture Snippets",
    description: "AEO analysis shows top traffic pages lack structured data. Adding FAQ schema increases the likelihood of appearing in 'People Also Ask' and SGE modules.",
    priority: "high",
    category: "aeo",
    impact: "Visibility Boost",
    effort: "easy"
  },
  {
    id: "3",
    title: "Standardize Brand NAP Data Across Pages",
    description: "Inconsistent Name, Address, and Phone data confuses LLMs during GEO entity mapping. Aligning these signals strengthens local and brand authority.",
    priority: "medium",
    category: "geo",
    impact: "Trust Expansion",
    effort: "easy"
  },
  {
    id: "4",
    title: "Inject Hard Data Points for LLM Citations",
    description: "Generative engines prioritize content with 'hard' statistics. Adding data tables or specific numbers makes your site more citable as a primary source.",
    priority: "medium",
    category: "geo",
    impact: "Citation Lift",
    effort: "moderate"
  },
  {
    id: "5",
    title: "Refactor Headers for Question Matching",
    description: "Restructuring H2/H3 tags into natural language questions (Who, What, How) directly maps your content to AEO query intent.",
    priority: "low",
    category: "aeo",
    impact: "Snippet Mapping",
    effort: "moderate"
  },
  {
    id: "6",
    title: "Consolidate Low-Value Internal Pages",
    description: "Detected multiple pages with under 300 words. Merging these into comprehensive guides builds topical depth and increases crawl efficiency.",
    priority: "low",
    category: "seo",
    impact: "Authority Depth",
    effort: "tough"
  }
]

const priorityConfig = {
  high: {
    icon: Zap,
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    badgeColor: "bg-destructive/20 text-destructive border-destructive/30",
    iconColor: "text-destructive"
  },
  medium: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    badgeColor: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    iconColor: "text-yellow-500"
  },
  low: {
    icon: Info,
    bgColor: "bg-seo/10",
    borderColor: "border-seo/20",
    badgeColor: "bg-seo/20 text-seo border-seo/30",
    iconColor: "text-seo"
  }
}

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    seo: "border-seo/30 bg-seo/10 text-seo",
    aeo: "border-aeo/30 bg-aeo/10 text-aeo",
    geo: "border-geo/30 bg-geo/10 text-geo",
    Schema: "border-seo/30 bg-seo/10 text-seo",
    Technical: "border-seo/30 bg-seo/10 text-seo",
    Content: "border-aeo/30 bg-aeo/10 text-aeo",
    Trust: "border-geo/30 bg-geo/10 text-geo",
    AEO: "border-aeo/30 bg-aeo/10 text-aeo",
    SEO: "border-seo/30 bg-seo/10 text-seo",
    GEO: "border-geo/30 bg-geo/10 text-geo",
  }
  const colorClass = colors[category] || colors[category.toLowerCase()] || "border-muted-foreground/30 bg-muted/10 text-muted-foreground"

  return (
    <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest", colorClass)}>
      {category}
    </Badge>
  )
}

function RecommendationItem({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Normalize priority to valid values with fallback
  const normalizedPriority = (rec.priority?.toLowerCase() as Priority) || "medium"
  const validPriority: Priority = ["high", "medium", "low"].includes(normalizedPriority) 
    ? normalizedPriority 
    : "medium"
  
  const config = priorityConfig[validPriority]
  const PriorityIcon = config.icon

  const handleCopy = () => {
    const textToCopy = `[ACTION]: ${rec.title}\n[CATEGORY]: ${rec.category.toUpperCase()}\n[WHY]: ${rec.description}\n[IMPACT]: ${rec.impact}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      "group rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {rec.rank ? (
            <div className="h-6 w-6 shrink-0 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-[10px] font-black text-foreground shadow-sm">
              {rec.rank}
            </div>
          ) : (
            <div className={cn("mt-0.5 p-1 rounded-lg bg-background/50", config.iconColor)}>
              <PriorityIcon className="h-3 w-3" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-[13px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {rec.title}
            </h4>
          </div>
        </div>
        <div className="pt-0.5">
          <CategoryBadge category={rec.category} />
        </div>
      </div>

      {/* Expandable Why section */}
      <div className="ml-10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Why this matters?
        </button>

        {expanded && (
          <p className="text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 mb-3">
            {rec.description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center justify-between gap-4 mt-1 pt-3 border-t border-background/20">
          <div className="flex items-center gap-3">
            {/* Effort Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Effort:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "h-1 w-3 rounded-full",
                      rec.effort === "tough" ? "bg-destructive/40" :
                        rec.effort === "moderate" ? "bg-yellow-500/40" : "bg-geo/40",
                      step === 1 ? "opacity-100" :
                        step === 2 && (rec.effort === "moderate" || rec.effort === "tough") ? "opacity-100" :
                          step === 3 && rec.effort === "tough" ? "opacity-100" : "opacity-20"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-background/40 hover:bg-background/60 text-[10px] h-6 flex items-center gap-1 text-geo font-black border-transparent">
              <ArrowUpRight className="h-3 w-3" />
              {rec.impact.split(' ')[0]} ROI
            </Badge>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-background/60 text-muted-foreground hover:text-foreground transition-all"
            >
              {copied ? <Check className="h-3 w-3 text-geo" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RecommendationsProps {
  data?: Recommendation[]
}

export function Recommendations({ data }: RecommendationsProps) {
  const displayRecommendations = data && data.length > 0 ? data : defaultRecommendations
  const [allCopied, setAllCopied] = useState(false)

  const copyAll = () => {
    const text = displayRecommendations.map(r =>
      `[${r.category.toUpperCase()}] ${r.title}\nImpact: ${r.description}`
    ).join('\n\n')
    navigator.clipboard.writeText(text)
    setAllCopied(true)
    setTimeout(() => setAllCopied(false), 2000)
  }

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/10 bg-muted/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-foreground">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Roadmap To 100
          </CardTitle>
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-[10px] font-bold uppercase transition-all"
          >
            {allCopied ? <Check className="h-3 w-3 text-geo" /> : <BarChart3 className="h-3 w-3" />}
            Copy Plan
          </button>
        </div>
        <CardDescription className="text-[10px] font-medium pt-1">
          AI-prioritized roadmap to maximize cross-engine visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          {displayRecommendations.map((rec, index) => (
            <RecommendationItem key={rec.id || `rec-${index}-${rec.title}`} rec={rec} />
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          Expand Theoretical Strategy
          <ChevronDown className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
