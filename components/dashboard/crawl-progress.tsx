"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Globe,
  Search,
  BarChart3,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CrawlProgressProps {
  currentPage: number
  totalPages: number
  currentStage: 'discovering' | 'crawling' | 'analyzing' | 'generating' | 'complete'
  estimatedTimeRemaining?: number // seconds
  currentUrl?: string
}

interface AnalysisStage {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

const stages: AnalysisStage[] = [
  {
    id: 'discovering',
    label: 'Discovering Pages',
    icon: Search,
    description: 'Finding internal links from homepage'
  },
  {
    id: 'crawling',
    label: 'Crawling Pages',
    icon: Globe,
    description: 'Extracting page data and metadata'
  },
  {
    id: 'analyzing',
    label: 'Analyzing Content',
    icon: BarChart3,
    description: 'Running SEO/AEO/GEO analysis'
  },
  {
    id: 'generating',
    label: 'Generating Report',
    icon: Sparkles,
    description: 'Creating recommendations and insights'
  }
]

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export function CrawlProgress({
  currentPage,
  totalPages,
  currentStage,
  estimatedTimeRemaining,
  currentUrl
}: CrawlProgressProps) {
  const progress = (currentPage / totalPages) * 100
  const currentStageIndex = stages.findIndex(s => s.id === currentStage)

  return (
    <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-background">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-geo animate-spin" />
                Analysis in Progress
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stages[currentStageIndex]?.description || 'Processing...'}
              </p>
            </div>
            {estimatedTimeRemaining !== undefined && (
              <Badge variant="outline" className="border-geo/30 text-geo bg-geo/5">
                <Clock className="h-3 w-3 mr-1" />
                ~{formatTime(estimatedTimeRemaining)} remaining
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-geo via-aeo to-seo rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* Animated shimmer effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
          </div>

          {/* Current URL */}
          {currentUrl && (
            <div className="p-3 bg-background/50 border border-border/50 rounded-lg">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                Currently Analyzing
              </p>
              <p className="text-xs font-mono text-foreground/80 truncate">
                {currentUrl}
              </p>
            </div>
          )}

          {/* Stage Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stages.map((stage, idx) => {
              const Icon = stage.icon
              const isComplete = idx < currentStageIndex
              const isCurrent = idx === currentStageIndex
              const isPending = idx > currentStageIndex

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    isComplete && "border-geo/30 bg-geo/5",
                    isCurrent && "border-geo bg-geo/10 ring-2 ring-geo/20",
                    isPending && "border-border/50 bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-geo animate-spin shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={cn(
                      "text-xs font-bold",
                      isComplete && "text-geo",
                      isCurrent && "text-geo",
                      isPending && "text-muted-foreground"
                    )}>
                      {stage.label}
                    </span>
                  </div>
                  {isCurrent && (
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {stage.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  )
}

// Compact version for inline display
export function CrawlProgressCompact({
  currentPage,
  totalPages,
  currentStage
}: Omit<CrawlProgressProps, 'estimatedTimeRemaining' | 'currentUrl'>) {
  const progress = (currentPage / totalPages) * 100

  return (
    <div className="flex items-center gap-3 p-3 bg-geo/5 border border-geo/30 rounded-lg">
      <Loader2 className="h-4 w-4 text-geo animate-spin shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold">
            Analyzing {currentPage}/{totalPages} pages
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-geo rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
