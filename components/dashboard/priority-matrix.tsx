"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Zap, TrendingUp, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriorityRecommendation {
  id: string
  title: string
  category: 'Quick Win' | 'High Priority' | 'Medium Priority' | 'Long-term Investment' | 'Low Priority'
  effortScore: 1 | 2 | 3
  impactScore: number // 0-100
  roiScore: number
  affectedPages: number
  estimatedTime: string
}

interface PriorityMatrixProps {
  recommendations: PriorityRecommendation[]
  onRecommendationClick?: (rec: PriorityRecommendation) => void
}

const categoryConfig = {
  'Quick Win': {
    color: 'text-geo',
    bg: 'bg-geo/10',
    border: 'border-geo/30',
    label: 'Quick Win'
  },
  'High Priority': {
    color: 'text-aeo',
    bg: 'bg-aeo/10',
    border: 'border-aeo/30',
    label: 'High Priority'
  },
  'Medium Priority': {
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'Medium'
  },
  'Long-term Investment': {
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    label: 'Long-term'
  },
  'Low Priority': {
    color: 'text-muted-foreground',
    bg: 'bg-muted/30',
    border: 'border-border/50',
    label: 'Low Priority'
  }
}

export function PriorityMatrix({ recommendations, onRecommendationClick }: PriorityMatrixProps) {
  // Calculate position in matrix (0-100 scale for both axes)
  const getPosition = (rec: PriorityRecommendation) => {
    // Effort: 1=low (right), 2=medium (center), 3=high (left)
    // Convert to 0-100 scale where 0=high effort, 100=low effort
    const effortX = rec.effortScore === 1 ? 85 : rec.effortScore === 2 ? 50 : 15
    
    // Impact: 0-100 where 100=high impact (top)
    const impactY = rec.impactScore
    
    return { x: effortX, y: 100 - impactY } // Invert Y so high impact is at top
  }

  const quickWins = recommendations.filter(r => r.category === 'Quick Win')
  const highPriority = recommendations.filter(r => r.category === 'High Priority')
  const mediumPriority = recommendations.filter(r => r.category === 'Medium Priority')
  const longTerm = recommendations.filter(r => r.category === 'Long-term Investment')
  const lowPriority = recommendations.filter(r => r.category === 'Low Priority')

  return (
    <Card className="border-geo/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-geo" />
              Priority Matrix
            </CardTitle>
            <CardDescription>
              Effort vs Impact visualization for {recommendations.length} recommendations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Matrix Visualization */}
          <div className="relative aspect-square w-full max-w-2xl mx-auto bg-gradient-to-br from-muted/30 to-background rounded-xl border border-border/50 p-8">
            {/* Grid Lines */}
            <div className="absolute inset-8 border-l-2 border-b-2 border-border/30">
              {/* Vertical center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/20" />
              {/* Horizontal center line */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-border/20" />
            </div>

            {/* Quadrant Labels */}
            <div className="absolute top-4 left-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
              High Impact
            </div>
            <div className="absolute bottom-4 left-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
              Low Impact
            </div>
            <div className="absolute bottom-4 left-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
              High Effort
            </div>
            <div className="absolute bottom-4 right-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
              Low Effort
            </div>

            {/* Quadrant Background Colors */}
            <div className="absolute inset-8">
              {/* Top Right - Quick Wins */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-geo/5 rounded-tl-lg" />
              {/* Top Left - Long-term */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-500/5 rounded-tr-lg" />
              {/* Bottom Right - High Priority */}
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-aeo/5 rounded-bl-lg" />
              {/* Bottom Left - Low Priority */}
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-muted/20 rounded-br-lg" />
            </div>

            {/* Plot Points */}
            <div className="absolute inset-8">
              {recommendations.map((rec) => {
                const pos = getPosition(rec)
                // Normalize category to match expected values, or use default
                const normalizedCategory = rec.category in categoryConfig 
                  ? rec.category 
                  : 'Medium Priority' as const
                const config = categoryConfig[normalizedCategory]
                
                // Safety check - skip if config is still undefined (shouldn't happen with fallback)
                if (!config || !config.bg || !config.border || !config.color) {
                  console.warn('[PriorityMatrix] Invalid category:', rec.category, 'for recommendation:', rec.title)
                  return null
                }
                
                return (
                  <button
                    key={rec.id}
                    onClick={() => onRecommendationClick?.(rec)}
                    className={cn(
                      "absolute w-10 h-10 rounded-full border-2 flex items-center justify-center",
                      "transform -translate-x-1/2 -translate-y-1/2",
                      "hover:scale-125 transition-all cursor-pointer group",
                      "shadow-lg hover:shadow-xl",
                      config.bg,
                      config.border
                    )}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`
                    }}
                    title={rec.title}
                  >
                    <span className={cn("text-xs font-black", config.color)}>
                      {rec.roiScore.toFixed(0)}
                    </span>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-popover border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      <p className="text-xs font-bold mb-1">{rec.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>ROI: {rec.roiScore.toFixed(1)}</span>
                        <span>Impact: {rec.impactScore}</span>
                        <span>Effort: {rec.effortScore}/3</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(categoryConfig).map(([category, config]) => {
              // Safety check - skip if config is invalid
              if (!config || !config.border || !config.bg || !config.label) {
                console.warn('[PriorityMatrix] Invalid config in legend for category:', category)
                return null
              }
              
              const count = recommendations.filter(r => r.category === category).length
              if (count === 0) return null
              
              return (
                <div key={category} className={cn("p-3 rounded-lg border", config.border, config.bg)}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("h-3 w-3 rounded-full", config.bg, config.border, "border-2")} />
                    <span className="text-xs font-bold">{config.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{count} items</p>
                </div>
              )
            })}
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            {/* Quick Wins */}
            {quickWins.length > 0 && categoryConfig['Quick Win'] && (
              <div className={cn("p-4 rounded-xl border", categoryConfig['Quick Win'].border, categoryConfig['Quick Win'].bg)}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className={cn("h-4 w-4", categoryConfig['Quick Win'].color)} />
                  <h4 className="font-bold text-sm">Quick Wins ({quickWins.length})</h4>
                  <Badge variant="outline" className={cn("text-[10px] ml-auto", categoryConfig['Quick Win'].border, categoryConfig['Quick Win'].color)}>
                    Do These First
                  </Badge>
                </div>
                <div className="space-y-2">
                  {quickWins.slice(0, 3).map(rec => (
                    <div key={rec.id} className="flex items-center justify-between text-xs">
                      <span className="flex-1 truncate">{rec.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          {rec.estimatedTime}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {rec.affectedPages} pages
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High Priority */}
            {highPriority.length > 0 && categoryConfig['High Priority'] && (
              <div className={cn("p-4 rounded-xl border", categoryConfig['High Priority'].border, categoryConfig['High Priority'].bg)}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className={cn("h-4 w-4", categoryConfig['High Priority'].color)} />
                  <h4 className="font-bold text-sm">High Priority ({highPriority.length})</h4>
                </div>
                <div className="space-y-2">
                  {highPriority.slice(0, 3).map(rec => (
                    <div key={rec.id} className="flex items-center justify-between text-xs">
                      <span className="flex-1 truncate">{rec.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          {rec.estimatedTime}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {rec.affectedPages} pages
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
