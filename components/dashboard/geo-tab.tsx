"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Shield,
  ImageIcon,
  Sparkles,
  Bot,
  AlertTriangle,
  Info,
  ChevronDown,
  Copy,
  Check,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { useState } from "react"

interface EnhancedPenalty {
  category: 'SEO' | 'AEO' | 'GEO';
  component: string;
  penalty: string;
  explanation: string;
  fix: string;
  pointsDeducted: number;
  severity: 'critical' | 'warning' | 'info';
}

interface GEOTabProps {
  data?: {
    structuralData?: {
      semanticTags: { article: number, main: number, nav: number, aside: number, headers: number };
      links: { internal: number, external: number };
      media: { totalImages: number, imagesWithAlt: number };
      wordCount: number;
    },
    ai?: {
      scores?: {
        seo: number,
        aeo: number,
        geo: number
      },
      enhancedPenalties?: EnhancedPenalty[],
      geoAnalysis: {
        sentimentScore: number,
        brandPerception: "positive" | "neutral" | "negative",
        citationLikelihood: number,
        llmContextClarity: number,
        visibilityGaps: string[]
      }
    }
  }
  hideScoreDeductions?: boolean
}

export function GEOTab({ data, hideScoreDeductions }: GEOTabProps) {
  const [expandedPenalty, setExpandedPenalty] = useState<number | null>(null);
  const [copiedFix, setCopiedFix] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [allCopied, setAllCopied] = useState(false);
  
  const geoData = data?.ai?.geoAnalysis
  const struct = data?.structuralData
  
  // Filter to only GEO penalties
  const allGeoPenalties = (data?.ai?.enhancedPenalties || []).filter(p => p.category === 'GEO')
  
  // Calculate Quick Wins (GEO only)
  const quickWins = allGeoPenalties
    .filter(p => p.severity === 'warning' && Math.abs(p.pointsDeducted) <= 15)
    .slice(0, 5)
  
  // Filter penalties by severity
  const filteredPenalties = severityFilter === 'all' 
    ? allGeoPenalties 
    : allGeoPenalties.filter(p => p.severity === severityFilter)

  const handleCopyFix = (fix: string, index: number) => {
    navigator.clipboard.writeText(fix)
    setCopiedFix(index)
    setTimeout(() => setCopiedFix(null), 2000)
  }

  return (
    <div className="grid gap-6">
      {/* Score Deductions - Intelligence Penalty Ledger (GEO) */}
      {!hideScoreDeductions && allGeoPenalties.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Score Deductions
              <button
                onClick={() => {
                  const sep = '─'.repeat(60)
                  const text = `SCORE DEDUCTIONS — GEO Penalties (${allGeoPenalties.length})\n${'═'.repeat(60)}\n\n` + allGeoPenalties.map((p, i) => {
                    let t = `${sep}\n${i + 1}. [${p.severity.toUpperCase()}] [${p.category}] ${p.component} (${p.pointsDeducted} pts)\n${sep}`
                    t += `\n\nIssue:\n${p.penalty}`
                    t += `\n\nWhy This Matters:\n${p.explanation}`
                    t += `\n\nHow To Fix:\n${p.fix}`
                    return t
                  }).join('\n\n')
                  navigator.clipboard.writeText(text)
                  setAllCopied(true)
                  setTimeout(() => setAllCopied(false), 2000)
                }}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-destructive/50 transition-colors"
              >
                {allCopied ? <Check className="h-3.5 w-3.5 text-geo" /> : <Copy className="h-3.5 w-3.5" />}
                {allCopied ? 'Copied' : 'Copy All'}
              </button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fix these Generative Engine Optimization issues to reach a perfect GEO score. Click any penalty for detailed explanation and fix instructions.
            </p>
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-destructive/10">
              <span className="text-xs font-bold uppercase text-muted-foreground mr-2">Filter:</span>
              <button
                onClick={() => setSeverityFilter('all')}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  severityFilter === 'all' 
                    ? "bg-foreground text-background" 
                    : "bg-background/50 text-muted-foreground hover:bg-background/80"
                )}
              >
                All ({allGeoPenalties.length})
              </button>
              <button
                onClick={() => setSeverityFilter('critical')}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  severityFilter === 'critical' 
                    ? "bg-destructive text-white" 
                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                )}
              >
                Critical ({allGeoPenalties.filter(p => p.severity === 'critical').length})
              </button>
              <button
                onClick={() => setSeverityFilter('warning')}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  severityFilter === 'warning' 
                    ? "bg-yellow-500 text-white" 
                    : "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                )}
              >
                Warning ({allGeoPenalties.filter(p => p.severity === 'warning').length})
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPenalties.map((penalty, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "rounded-lg border transition-all cursor-pointer",
                    penalty.severity === 'critical' ? "border-destructive/30 bg-destructive/5" : "border-yellow-500/30 bg-yellow-500/5",
                    expandedPenalty === i && "ring-2 ring-offset-2 col-span-full",
                    penalty.severity === 'critical' && expandedPenalty === i && "ring-destructive/50",
                    penalty.severity === 'warning' && expandedPenalty === i && "ring-yellow-500/50"
                  )}
                  onClick={() => setExpandedPenalty(expandedPenalty === i ? null : i)}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "shrink-0 font-mono text-xs",
                          penalty.severity === 'critical' ? "border-destructive/50 text-destructive bg-destructive/10" : "border-yellow-500/50 text-yellow-600 bg-yellow-500/10"
                        )}
                      >
                        {penalty.pointsDeducted} pts
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className="text-[9px] font-black uppercase px-1.5 py-0.5 border-geo/50 text-geo bg-geo/10"
                          >
                            GEO
                          </Badge>
                          {penalty.severity === 'critical' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        </div>
                        <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{penalty.component}</div>
                        <p className="text-sm font-medium text-foreground leading-tight">{penalty.penalty}</p>
                        
                        {expandedPenalty === i && (
                          <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-bold uppercase text-muted-foreground">Why This Matters</span>
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">{penalty.explanation}</p>
                            </div>
                            
                            <div className="p-3 rounded-lg bg-geo/5 border border-geo/30">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-geo" />
                                  <span className="text-xs font-bold uppercase text-geo">How To Fix</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopyFix(penalty.fix, i)
                                  }}
                                  className="p-1.5 rounded-md hover:bg-geo/10 transition-colors"
                                  title="Copy fix instructions"
                                >
                                  {copiedFix === i ? (
                                    <Check className="h-3.5 w-3.5 text-geo" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-geo" />
                                  )}
                                </button>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">{penalty.fix}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5",
                          expandedPenalty === i && "rotate-180"
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Showing {filteredPenalties.length} GEO penalties{severityFilter !== 'all' ? ` (${severityFilter} only)` : ''}. Click any to expand.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins Section */}
      {quickWins.length > 0 && (
        <Card className="border-geo/30 bg-geo/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-geo">
              <Zap className="h-5 w-5" />
              Quick Wins
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Easy GEO fixes with solid impact. Click any for detailed explanation and fix instructions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickWins.map((penalty, i) => {
                const quickWinIndex = allGeoPenalties.indexOf(penalty);
                const isExpanded = expandedPenalty === quickWinIndex;
                
                return (
                  <div 
                    key={`quick-${i}`}
                    className={cn(
                      "rounded-lg border border-geo/20 bg-background/50 hover:bg-geo/5 transition-all cursor-pointer",
                      isExpanded && "ring-2 ring-offset-2 ring-geo/50 col-span-full"
                    )}
                    onClick={() => setExpandedPenalty(isExpanded ? null : quickWinIndex)}
                  >
                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <Badge 
                          variant="outline" 
                          className="shrink-0 font-mono text-xs border-geo/50 text-geo bg-geo/10"
                        >
                          {penalty.pointsDeducted} pts
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge 
                              variant="outline" 
                              className="text-[9px] font-black uppercase px-1.5 py-0.5 border-geo/50 text-geo bg-geo/10"
                            >
                              GEO
                            </Badge>
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">{penalty.component}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground leading-tight">{penalty.penalty}</p>
                          
                          {isExpanded && (
                            <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                              <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Info className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs font-bold uppercase text-muted-foreground">Why This Matters</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">{penalty.explanation}</p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-geo/5 border border-geo/30">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-geo" />
                                    <span className="text-xs font-bold uppercase text-geo">How To Fix</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCopyFix(penalty.fix, quickWinIndex)
                                    }}
                                    className="p-1.5 rounded-md hover:bg-geo/10 transition-colors"
                                    title="Copy fix instructions"
                                  >
                                    {copiedFix === quickWinIndex ? (
                                      <Check className="h-3.5 w-3.5 text-geo" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-geo" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{penalty.fix}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <ChevronDown 
                          className={cn(
                            "h-4 w-4 text-geo transition-transform shrink-0 mt-0.5",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generative Engine Readiness */}
      <h2 className="text-xl font-bold mt-4 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-geo" />
        Generative Engine Readiness
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Media Context & Brand Visibility */}
        <Card className="border-geo/20 bg-geo/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <ImageIcon className="h-5 w-5 text-geo" />
              Media Context & Brand Visibility
              <InfoTooltip content="Multi-modal AI models (ChatGPT, Claude, Gemini) use image alt text to understand visual content. Without alt text, AI cannot 'see' your images or associate them with your brand." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-geo/20 bg-geo/10 p-4">
                <span className="text-sm font-medium text-muted-foreground">Total Brand Images</span>
                <p className="mt-1 text-3xl font-bold font-mono">{struct?.media?.totalImages || 0}</p>
              </div>
              <div className="rounded-lg border border-geo/20 bg-geo/10 p-4">
                <span className="text-sm font-medium text-muted-foreground">Images with AI Context</span>
                <p className="mt-1 text-3xl font-bold font-mono text-geo">{struct?.media?.imagesWithAlt || 0}</p>
              </div>
              <div className="rounded-lg border border-geo/20 bg-geo/10 p-4">
                <span className="text-sm font-medium text-muted-foreground">AI Blindspot Ratio</span>
                <p className="mt-1 text-3xl font-bold font-mono text-destructive">
                  {struct?.media?.totalImages ? Math.round(((struct.media.totalImages - struct.media.imagesWithAlt) / struct.media.totalImages) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LLM Context Clarity */}
        <Card className="border-geo/20 bg-geo/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-geo" />
              LLM Context Clarity
              <InfoTooltip content="Measures how clearly AI systems can understand and cite your content. Higher clarity = more frequent and accurate AI citations." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-full">
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-geo"
                    style={{
                      width: `${geoData?.citationLikelihood ?? 70}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground uppercase font-semibold">
                  <span>Citation Likelihood</span>
                  <span className="text-geo">{geoData?.citationLikelihood ?? 70}%</span>
                </div>
              </div>
              <div className="mt-6 w-full p-4 rounded bg-geo/10 border border-geo/10">
                <p className="text-sm text-foreground/70 text-center italic">
                  Your site's context clarity is rated at {geoData?.citationLikelihood ?? 70}%. High clarity leads to more frequent and accurate AI citations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Visibility Gaps */}
      <Card className="border-geo/20 bg-geo/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Bot className="h-5 w-5 text-geo" />
            AI Visibility Gaps
            <InfoTooltip content="Areas where your content could be more visible to AI systems. These are opportunities to improve how generative engines understand and cite your content." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {geoData?.visibilityGaps && geoData.visibilityGaps.length > 0 ? (
              geoData.visibilityGaps.map((gap: string) => (
                <div key={gap} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Sparkles className="h-4 w-4 text-geo mt-0.5 shrink-0" />
                  <span>{gap}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Run an analysis to identify visibility gaps...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


// TEMP: Sentiment section to be inserted after line 333
/*
      {geoData?.sentimentScore !== undefined && (
        <Card className="border-geo/20 bg-geo/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-geo" />
              LLM Sentiment Analysis
              <InfoTooltip content="Measures how AI systems perceive your content's tone and trustworthiness. Positive sentiment increases citation likelihood." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const score = geoData.sentimentScore;
                const positive = Math.max(0, score);
                const negative = Math.max(0, -score);
                const neutral = score === 0 ? 100 : 0;
                
                const sentimentData = [
                  { name: "Positive", value: positive, color: "oklch(0.7 0.2 160)" },
                  { name: "Neutral", value: neutral, color: "oklch(0.65 0 0)" },
                  { name: "Negative", value: negative, color: "oklch(0.55 0.22 25)" },
                ].filter(item => item.value > 0);

                return sentimentData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="mt-6 p-4 rounded-lg border border-geo/30 bg-geo/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-geo" />
                <span className="font-medium text-foreground">Overall Sentiment Score</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-geo">
                {geoData.sentimentScore > 0 ? `+${geoData.sentimentScore}` : geoData.sentimentScore}%
              </p>
              <p className="text-sm text-muted-foreground">
                {geoData.brandPerception === 'positive' && 'Positive perception across AI systems'}
                {geoData.brandPerception === 'neutral' && 'Neutral perception - room for improvement'}
                {geoData.brandPerception === 'negative' && 'Negative perception - needs attention'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
*/
