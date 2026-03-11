"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Shield,
  Code2,
  Sparkles,
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

interface AEOTabProps {
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
      aeoAnalysis: {
        questionsAnswered: { who: number, what: number, where: number, why: number, how: number },
        missingSchemas: string[],
        snippetEligibilityScore: number,
        topOpportunities: string[]
      }
    }
  }
}

export function AEOTab({ data }: AEOTabProps) {
  const [expandedPenalty, setExpandedPenalty] = useState<number | null>(null);
  const [copiedFix, setCopiedFix] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [showOpportunities, setShowOpportunities] = useState(false);
  
  const aeoData = data?.ai?.aeoAnalysis
  const struct = data?.structuralData
  
  // Filter to only AEO penalties
  const allAeoPenalties = (data?.ai?.enhancedPenalties || []).filter(p => p.category === 'AEO')
  
  // Calculate Quick Wins (AEO only)
  const quickWins = allAeoPenalties
    .filter(p => p.severity === 'warning' && Math.abs(p.pointsDeducted) <= 15)
    .slice(0, 5)
  
  // Filter penalties by severity
  const filteredPenalties = severityFilter === 'all' 
    ? allAeoPenalties 
    : allAeoPenalties.filter(p => p.severity === severityFilter)

  const handleCopyFix = (fix: string, index: number) => {
    navigator.clipboard.writeText(fix)
    setCopiedFix(index)
    setTimeout(() => setCopiedFix(null), 2000)
  }

  return (
    <div className="grid gap-6">
      {/* Roadmap to 100 - Intelligence Penalty Ledger (AEO) */}
      {allAeoPenalties.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Roadmap to 100
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fix these Answer Engine Optimization issues to reach a perfect AEO score. Click any penalty for detailed explanation and fix instructions.
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
                All ({allAeoPenalties.length})
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
                Critical ({allAeoPenalties.filter(p => p.severity === 'critical').length})
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
                Warning ({allAeoPenalties.filter(p => p.severity === 'warning').length})
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
                            className="text-[9px] font-black uppercase px-1.5 py-0.5 border-aeo/50 text-aeo bg-aeo/10"
                          >
                            AEO
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
              Showing {filteredPenalties.length} AEO penalties{severityFilter !== 'all' ? ` (${severityFilter} only)` : ''}. Click any to expand.
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
              Easy AEO fixes with solid impact. Click any for detailed explanation and fix instructions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickWins.map((penalty, i) => {
                const quickWinIndex = allAeoPenalties.indexOf(penalty);
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
                              className="text-[9px] font-black uppercase px-1.5 py-0.5 border-aeo/50 text-aeo bg-aeo/10"
                            >
                              AEO
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

      {/* Answer Engine Readiness */}
      <h2 className="text-xl font-bold mt-4 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-aeo" />
        Answer Engine Readiness
      </h2>

      {/* Question-Based Content Analysis */}
      {aeoData?.questionsAnswered && (
        <Card className="border-aeo/20 bg-aeo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Code2 className="h-5 w-5 text-aeo" />
              Question-Based Content Analysis
              <InfoTooltip content="Measures how well your content answers common question types (Who, What, Where, Why, How). Answer engines like ChatGPT and Google's AI Overviews prioritize content that directly answers questions. Higher scores = better AI visibility." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(aeoData.questionsAnswered).map(([type, score]) => {
                const percentage = Math.round((score / 10) * 100)
                const isGood = score >= 7
                return (
                  <div
                    key={type}
                    className="rounded-lg border border-aeo/20 bg-aeo-muted/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-aeo capitalize">{type}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-aeo/50 font-mono",
                          isGood ? "text-geo bg-geo/10" : "text-yellow-600 bg-yellow-500/10"
                        )}
                      >
                        {score}/10
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isGood ? "bg-geo" : "bg-yellow-500"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    {!isGood && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Add more "{type}" questions
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Status explanation */}
            <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-sm text-foreground/80">
                <strong>What this means:</strong> {(() => {
                  const totalScore = Object.values(aeoData.questionsAnswered).reduce((a, b) => a + b, 0)
                  const avgScore = totalScore / 5
                  if (avgScore >= 7) {
                    return "Your content comprehensively answers common questions. AI systems can easily extract and cite your answers in response to user queries."
                  } else if (avgScore >= 5) {
                    return "Your content answers some questions but has gaps. AI systems may skip your content for queries in weak areas."
                  } else {
                    return "Your content lacks clear question-answer structure. AI systems will struggle to cite your content as authoritative answers."
                  }
                })()}
              </p>
            </div>

            {/* Improvement opportunities - Collapsible */}
            {Object.entries(aeoData.questionsAnswered).some(([_, score]) => score < 7) && (
              <div className="mt-3">
                <button
                  onClick={() => setShowOpportunities(!showOpportunities)}
                  className="w-full p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-yellow-600">
                    Opportunities to Fix ({Object.entries(aeoData.questionsAnswered).filter(([_, score]) => score < 7).length} areas)
                  </span>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 text-yellow-600 transition-transform",
                      showOpportunities && "rotate-180"
                    )}
                  />
                </button>
                
                {showOpportunities && (
                  <div className="mt-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 animate-in fade-in slide-in-from-top-2">
                    <ul className="text-sm text-foreground/80 space-y-2">
                      {Object.entries(aeoData.questionsAnswered)
                        .filter(([_, score]) => score < 7)
                        .map(([type, score]) => (
                          <li key={type} className="border-l-2 border-yellow-500 pl-3">
                            <strong className="capitalize text-foreground">{type} Questions</strong>
                            <span className="text-xs text-muted-foreground ml-2">({7 - score} more needed)</span>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Add FAQ sections with "{type}" questions and provide direct answers in the first sentence.
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content QA Depth */}
        <Card className="border-aeo/20 bg-aeo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Code2 className="h-5 w-5 text-aeo" />
              Content QA Depth
              <InfoTooltip content="Answer engines like ChatGPT and Google's AI Overviews prioritize content with clear question-answer structure. Headers formatted as questions and comprehensive answers improve AI visibility." />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
              <span className="text-sm font-medium text-muted-foreground">Conversational Headers</span>
              <span className="font-mono font-bold text-aeo">{struct?.semanticTags?.headers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
              <span className="text-sm font-medium text-muted-foreground">Total Answer Corpus</span>
              <span className="font-mono font-bold">{struct?.wordCount || 0} words</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              LLMs rely on deep header hierarchy to instantly index Answers.
            </p>
          </CardContent>
        </Card>

        {/* Missing Schemas */}
        <Card className="border-aeo/20 bg-aeo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Code2 className="h-5 w-5 text-aeo" />
              Schema Opportunities
              <InfoTooltip content="Schema markup (structured data) helps AI systems understand your content. Different schema types enable different AI capabilities like FAQs, products, recipes, etc." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aeoData?.missingSchemas && aeoData.missingSchemas.length > 0 ? (
                aeoData.missingSchemas.map((schema: string) => (
                  <div key={schema} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Sparkles className="h-4 w-4 text-aeo mt-0.5 shrink-0" />
                    <span>Add {schema} schema for better AI understanding</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">Run an analysis to identify schema opportunities...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
