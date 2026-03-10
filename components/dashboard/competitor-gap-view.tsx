"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CompetitorGap {
  type: 'schema' | 'content' | 'structural' | 'keyword'
  category: string
  description: string
  impact: 'high' | 'medium' | 'low'
  examples: string[]
  recommendation: string
  estimatedTrafficGain?: string
}

interface Strength {
  category: string
  description: string
  advantage: string
  maintainStrategy: string
}

interface CompetitorGapViewProps {
  gaps: CompetitorGap[]
  strengths: Strength[]
  advantageScore: number // 0-100
  quickWins: CompetitorGap[]
  competitorCount: number
}

const impactConfig = {
  high: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    label: 'High Impact'
  },
  medium: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'Medium Impact'
  },
  low: {
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Low Impact'
  }
}

const typeConfig = {
  schema: { label: 'Schema Gap', icon: '📊' },
  content: { label: 'Content Gap', icon: '📝' },
  structural: { label: 'Structural Gap', icon: '🏗️' },
  keyword: { label: 'Keyword Gap', icon: '🔑' }
}

function GapCard({ gap }: { gap: CompetitorGap }) {
  const impact = impactConfig[gap.impact]
  const type = typeConfig[gap.type]

  return (
    <div className={cn("p-4 rounded-xl border bg-background/60", impact.border)}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{type.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-bold text-sm">{gap.category}</h5>
                <Badge variant="outline" className={cn("text-[10px]", impact.color, impact.bg)}>
                  {impact.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{gap.description}</p>
            </div>
          </div>

          {gap.estimatedTrafficGain && (
            <div className="mb-2 p-2 bg-geo/5 border border-geo/20 rounded-lg">
              <p className="text-xs font-bold text-geo">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Estimated gain: {gap.estimatedTrafficGain}
              </p>
            </div>
          )}

          <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Recommendation</p>
            <p className="text-xs text-foreground/90 leading-relaxed">{gap.recommendation}</p>
          </div>

          {gap.examples.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Examples</p>
              <div className="space-y-1">
                {gap.examples.slice(0, 2).map((example, idx) => (
                  <p key={idx} className="text-xs font-mono text-muted-foreground/80 truncate bg-muted/30 px-2 py-1 rounded">
                    {example}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StrengthCard({ strength }: { strength: Strength }) {
  return (
    <div className="p-4 rounded-xl border border-geo/30 bg-geo/5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-geo/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-geo" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-sm mb-1">{strength.category}</h5>
          <p className="text-xs text-muted-foreground mb-2">{strength.description}</p>
          
          <div className="space-y-2">
            <div className="p-2 bg-background/50 rounded-lg">
              <p className="text-[10px] font-black uppercase text-geo mb-1">Your Advantage</p>
              <p className="text-xs text-foreground/90">{strength.advantage}</p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Maintain Strategy</p>
              <p className="text-xs text-muted-foreground">{strength.maintainStrategy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CompetitorGapView({
  gaps,
  strengths,
  advantageScore,
  quickWins,
  competitorCount
}: CompetitorGapViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-geo'
    if (score >= 40) return 'text-yellow-600'
    return 'text-destructive'
  }

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-geo/10'
    if (score >= 40) return 'bg-yellow-500/10'
    return 'bg-destructive/10'
  }

  const getScoreBorder = (score: number) => {
    if (score >= 70) return 'border-geo/30'
    if (score >= 40) return 'border-yellow-500/30'
    return 'border-destructive/30'
  }

  const highImpactGaps = gaps.filter(g => g.impact === 'high')
  const mediumImpactGaps = gaps.filter(g => g.impact === 'medium')
  const lowImpactGaps = gaps.filter(g => g.impact === 'low')

  return (
    <div className="space-y-6">
      {/* Competitive Advantage Score */}
      <Card className={cn("border-2", getScoreBorder(advantageScore))}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className={cn("h-5 w-5", getScoreColor(advantageScore))} />
                Competitive Position
              </CardTitle>
              <CardDescription>
                Compared against {competitorCount} competitor{competitorCount > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className={cn("text-center p-4 rounded-xl", getScoreBg(advantageScore), getScoreBorder(advantageScore), "border")}>
              <div className={cn("text-3xl font-black", getScoreColor(advantageScore))}>
                {advantageScore}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Advantage Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Position:</span>
              <span className={cn("font-bold", getScoreColor(advantageScore))}>
                {advantageScore >= 70 ? 'Leading' : advantageScore >= 40 ? 'Competitive' : 'Behind'}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all", getScoreColor(advantageScore).replace('text-', 'bg-'))}
                style={{ width: `${advantageScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {advantageScore >= 70 
                ? 'You are outperforming competitors in most areas. Focus on maintaining your lead.'
                : advantageScore >= 40
                ? 'You are competitive but have room for improvement. Focus on quick wins to gain an edge.'
                : 'Significant gaps exist. Prioritize high-impact improvements to catch up.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-geo" />
                  Quick Wins
                </CardTitle>
                <CardDescription>
                  High-impact gaps that are easy to close
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-geo/30 text-geo bg-geo/5">
                {quickWins.length} Opportunities
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickWins.map((gap, idx) => (
                <GapCard key={idx} gap={gap} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Gaps */}
      {gaps.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Identified Gaps
                </CardTitle>
                <CardDescription>
                  {highImpactGaps.length} high, {mediumImpactGaps.length} medium, {lowImpactGaps.length} low impact gaps
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10">
                {gaps.length} Gaps
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* High Impact First */}
              {highImpactGaps.map((gap, idx) => (
                <GapCard key={`high-${idx}`} gap={gap} />
              ))}
              
              {/* Medium Impact */}
              {mediumImpactGaps.map((gap, idx) => (
                <GapCard key={`medium-${idx}`} gap={gap} />
              ))}
              
              {/* Low Impact */}
              {lowImpactGaps.map((gap, idx) => (
                <GapCard key={`low-${idx}`} gap={gap} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card className="border-geo/30 bg-geo/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-geo" />
                  Your Strengths
                </CardTitle>
                <CardDescription>
                  Areas where you outperform competitors
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-geo/30 text-geo bg-geo/10">
                {strengths.length} Strengths
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strengths.map((strength, idx) => (
                <StrengthCard key={idx} strength={strength} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
