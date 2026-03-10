"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  ExternalLink,
  Code2,
  Zap,
  Clock,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InstructionStep {
  step: number
  title: string
  description: string
  code?: string
  validationUrl?: string
}

interface FixInstructionCardProps {
  title: string
  category: 'Quick Win' | 'High Priority' | 'Medium Priority' | 'Long-term Investment' | 'Low Priority'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  steps: InstructionStep[]
  code?: string
  platform: string
  estimatedTime: string
  difficulty: 'easy' | 'moderate' | 'difficult'
  impact: 'high' | 'medium' | 'low'
  affectedPages: number
  validationLinks?: Array<{ tool: string; url: string }>
  onMarkComplete?: () => void
  isCompleted?: boolean
}

const categoryConfig = {
  'Quick Win': {
    color: 'text-geo',
    bg: 'bg-geo/10',
    border: 'border-geo/30'
  },
  'High Priority': {
    color: 'text-aeo',
    bg: 'bg-aeo/10',
    border: 'border-aeo/30'
  },
  'Medium Priority': {
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30'
  },
  'Long-term Investment': {
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30'
  },
  'Low Priority': {
    color: 'text-muted-foreground',
    bg: 'bg-muted/30',
    border: 'border-border/50'
  }
}

const priorityConfig = {
  CRITICAL: {
    label: '🔥 URGENT',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30'
  },
  HIGH: {
    label: '⚡ HIGH PRIORITY',
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30'
  },
  MEDIUM: {
    label: '✓ QUICK WIN',
    color: 'text-geo',
    bg: 'bg-geo/10',
    border: 'border-geo/30'
  }
}

const difficultyConfig = {
  easy: { label: 'Easy', dots: 1, color: 'bg-geo' },
  moderate: { label: 'Moderate', dots: 2, color: 'bg-aeo' },
  difficult: { label: 'Difficult', dots: 3, color: 'bg-destructive' }
}

export function FixInstructionCard({
  title,
  category,
  priority,
  steps,
  code,
  platform,
  estimatedTime,
  difficulty,
  impact,
  affectedPages,
  validationLinks,
  onMarkComplete,
  isCompleted = false
}: FixInstructionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const categoryStyle = categoryConfig[category]
  const priorityStyle = priorityConfig[priority]
  const difficultyStyle = difficultyConfig[difficulty]

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  return (
    <Card className={cn(
      "border-2 transition-all hover:shadow-lg",
      isCompleted ? "opacity-60 border-muted" : categoryStyle.border,
      isCompleted && "bg-muted/20"
    )}>
      {/* Header */}
      <div 
        className={cn(
          "p-4 cursor-pointer",
          !isCompleted && categoryStyle.bg
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={cn("text-[10px] font-black uppercase tracking-wider", categoryStyle.bg, categoryStyle.color, categoryStyle.border)}>
                {category}
              </Badge>
              <Badge className={cn("text-[10px] font-black uppercase tracking-wider", priorityStyle.bg, priorityStyle.color, priorityStyle.border)}>
                {priorityStyle.label}
              </Badge>
              {isCompleted && (
                <Badge className="text-[10px] font-black bg-geo/10 text-geo border-geo/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  COMPLETED
                </Badge>
              )}
            </div>
            
            <h3 className="font-bold text-base mb-2 leading-tight">{title}</h3>
            
            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{estimatedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{affectedPages} pages</span>
              </div>
              <div className="flex items-center gap-1">
                <Code2 className="h-3 w-3" />
                <span>{platform}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold">Difficulty:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(level => (
                    <div 
                      key={level}
                      className={cn(
                        "h-1.5 w-3 rounded-full",
                        level <= difficultyStyle.dots ? difficultyStyle.color : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <button className="shrink-0 p-2 hover:bg-background/50 rounded-lg transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0 pb-4 space-y-4">
          {/* Steps */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Implementation Steps
            </h4>
            {steps.map((step) => (
              <div key={step.step} className="flex gap-3">
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                  categoryStyle.bg,
                  categoryStyle.color
                )}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-sm mb-1">{step.title}</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  {step.code && (
                    <pre className="mt-2 p-3 bg-muted/50 rounded-lg text-xs font-mono overflow-x-auto border border-border/50">
                      <code>{step.code}</code>
                    </pre>
                  )}
                  {step.validationUrl && (
                    <a
                      href={step.validationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-geo hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Validate this step
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Code Block */}
          {code && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Code Snippet
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-8"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-geo" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-4 bg-muted/50 rounded-lg text-xs font-mono overflow-x-auto border border-border/50 max-h-64">
                <code>{code}</code>
              </pre>
            </div>
          )}

          {/* Validation Links */}
          {validationLinks && validationLinks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Validation Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                {validationLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/50 rounded-lg text-xs hover:border-geo/50 hover:bg-geo/5 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.tool}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Mark Complete Button */}
          {onMarkComplete && !isCompleted && (
            <div className="pt-3 border-t border-border/50">
              <Button
                onClick={onMarkComplete}
                className="w-full bg-geo text-geo-foreground hover:bg-geo/90"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
