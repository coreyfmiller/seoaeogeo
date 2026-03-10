"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Image,
  Link2,
  Copy,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SiteWideIssue {
  type: 'missing-h1' | 'thin-content' | 'missing-meta' | 'poor-alt-coverage' | 'orphan-pages' | 'duplicate-content'
  affectedPages: string[]
  count: number
  severity: 'critical' | 'high' | 'medium'
  description: string
}

interface AggregateScores {
  seo: number
  aeo: number
  geo: number
}

interface MultiPageDashboardProps {
  pagesCrawled: number
  aggregateScores: AggregateScores
  siteWideIssues: SiteWideIssue[]
  totalWords: number
  schemaCount: number
  orphanCount: number
  duplicateCount: number
}

const issueConfig = {
  'missing-h1': {
    label: 'Missing H1 Tags',
    icon: FileText,
    color: 'text-destructive',
    description: 'Pages without a primary heading'
  },
  'thin-content': {
    label: 'Thin Content',
    icon: FileText,
    color: 'text-yellow-600',
    description: 'Pages with less than 300 words'
  },
  'missing-meta': {
    label: 'Missing Meta Descriptions',
    icon: FileText,
    color: 'text-yellow-600',
    description: 'Pages without meta descriptions'
  },
  'poor-alt-coverage': {
    label: 'Poor Image Alt Text',
    icon: Image,
    color: 'text-yellow-600',
    description: 'Images missing descriptive alt text'
  },
  'orphan-pages': {
    label: 'Orphan Pages',
    icon: Link2,
    color: 'text-destructive',
    description: 'Pages with 0-1 internal links'
  },
  'duplicate-content': {
    label: 'Duplicate Content',
    icon: Copy,
    color: 'text-yellow-600',
    description: 'Pages with similar or identical content'
  }
}

const severityConfig = {
  critical: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/30',
    label: 'CRITICAL'
  },
  high: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600',
    border: 'border-yellow-500/30',
    label: 'HIGH'
  },
  medium: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-500/30',
    label: 'MEDIUM'
  }
}

function IssueCard({ issue }: { issue: SiteWideIssue }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = issueConfig[issue.type]
  const severity = severityConfig[issue.severity]
  
  // Safety check - if config or severity is undefined, skip rendering
  if (!config || !severity || !config.icon || !severity.bg) {
    console.warn('[IssueCard] Invalid config for issue:', issue)
    return null
  }
  
  const Icon = config.icon

  return (
    <div className={cn("p-4 rounded-xl border bg-background/60", severity.border)}>
      <div className="flex items-start gap-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", severity.bg)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h5 className="font-bold text-sm mb-1">{config.label}</h5>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
            <Badge variant="outline" className={cn("shrink-0 text-[10px] font-black", severity.text, severity.bg)}>
              {issue.count} {issue.count === 1 ? 'PAGE' : 'PAGES'}
            </Badge>
          </div>

          {issue.affectedPages.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-bold text-geo hover:underline mb-2"
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {isExpanded ? 'Hide' : 'Show'} affected pages
              </button>
              
              {isExpanded && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {issue.affectedPages.map((url, idx) => (
                    <div key={idx} className="text-xs font-mono text-muted-foreground/80 truncate bg-muted/30 px-2 py-1 rounded">
                      {url}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ label, score, previousScore }: { label: string; score: number; previousScore?: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-geo'
    if (s >= 60) return 'text-yellow-600'
    return 'text-destructive'
  }

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-geo/10'
    if (s >= 60) return 'bg-yellow-500/10'
    return 'bg-destructive/10'
  }

  const getScoreBorder = (s: number) => {
    if (s >= 80) return 'border-geo/30'
    if (s >= 60) return 'border-yellow-500/30'
    return 'border-destructive/30'
  }

  const change = previousScore ? score - previousScore : null
  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus

  return (
    <div className={cn("p-4 rounded-xl border", getScoreBorder(score), getScoreBg(score))}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        {change !== null && (
          <Badge variant="outline" className={cn("text-[10px]", change > 0 ? "text-geo" : change < 0 ? "text-destructive" : "text-muted-foreground")}>
            <TrendIcon className="h-3 w-3 mr-0.5" />
            {change > 0 ? '+' : ''}{change}
          </Badge>
        )}
      </div>
      <div className={cn("text-3xl font-black", getScoreColor(score))}>
        {score}
      </div>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", getScoreColor(score).replace('text-', 'bg-'))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function MultiPageDashboard({
  pagesCrawled,
  aggregateScores,
  siteWideIssues,
  totalWords,
  schemaCount,
  orphanCount,
  duplicateCount
}: MultiPageDashboardProps) {
  const criticalIssues = siteWideIssues.filter(i => i.severity === 'critical')
  const highIssues = siteWideIssues.filter(i => i.severity === 'high')
  const mediumIssues = siteWideIssues.filter(i => i.severity === 'medium')

  return (
    <div className="space-y-6">
      {/* Site Overview */}
      <Card className="border-geo/30 bg-gradient-to-br from-geo/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-geo" />
                Site Overview
              </CardTitle>
              <CardDescription>
                Aggregate metrics across {pagesCrawled} crawled pages
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-geo/30 text-geo bg-geo/5">
              {pagesCrawled} Pages
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Aggregate Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ScoreCard label="SEO Score" score={aggregateScores.seo} />
            <ScoreCard label="AEO Score" score={aggregateScores.aeo} />
            <ScoreCard label="GEO Score" score={aggregateScores.geo} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-xl border border-border/50">
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">
                Total Content
              </p>
              <p className="text-lg font-bold font-mono">{totalWords.toLocaleString()} words</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">
                Schema Blocks
              </p>
              <p className="text-lg font-bold font-mono">{schemaCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">
                Orphan Pages
              </p>
              <p className={cn("text-lg font-bold font-mono", orphanCount > 0 ? "text-destructive" : "text-geo")}>
                {orphanCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">
                Duplicates
              </p>
              <p className={cn("text-lg font-bold font-mono", duplicateCount > 0 ? "text-yellow-600" : "text-geo")}>
                {duplicateCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site-Wide Issues */}
      {siteWideIssues.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Site-Wide Issues
                </CardTitle>
                <CardDescription>
                  {criticalIssues.length} critical, {highIssues.length} high, {mediumIssues.length} medium priority issues found
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10">
                {siteWideIssues.length} Issues
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Critical Issues First */}
              {criticalIssues.map((issue, idx) => (
                <IssueCard key={`critical-${idx}`} issue={issue} />
              ))}
              
              {/* High Issues */}
              {highIssues.map((issue, idx) => (
                <IssueCard key={`high-${idx}`} issue={issue} />
              ))}
              
              {/* Medium Issues */}
              {mediumIssues.map((issue, idx) => (
                <IssueCard key={`medium-${idx}`} issue={issue} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
