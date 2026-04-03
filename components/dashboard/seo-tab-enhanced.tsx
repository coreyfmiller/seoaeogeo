"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  Shield,
  MapPin,
  Bot,
  FileText,
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

interface SEOTabProps {
  data?: {
    technical?: {
      isHttps: boolean,
      status: number,
      responseTimeMs: number
    },
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
      seoAnalysis: {
        onPageIssues: string[],
        keywordOpportunities: string[],
        contentQuality: string,
        metaAnalysis: string
      }
    }
  }
  hideScoreDeductions?: boolean
}

export function SEOTabEnhanced({ data, hideScoreDeductions }: SEOTabProps) {
  const [expandedPenalty, setExpandedPenalty] = useState<number | null>(null);
  const [copiedFix, setCopiedFix] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [allCopied, setAllCopied] = useState(false);
  
  const displayTechnicalHealth = data?.technical ? [
    { name: "SSL Certificate", status: data.technical.isHttps, icon: Shield },
    { name: "Server Status", status: data.technical.status === 200, icon: MapPin },
    { name: "Response Time", status: data.technical.responseTimeMs < 2000, icon: Bot },
  ] : []

  const aiSeo = data?.ai?.seoAnalysis
  const allPenalties = data?.ai?.enhancedPenalties || []
  
  // Calculate Quick Wins
  const quickWins = allPenalties
    .filter(p => p.severity === 'warning' && Math.abs(p.pointsDeducted) <= 15)
    .slice(0, 5)
  
  // Filter penalties by severity
  const filteredPenalties = severityFilter === 'all' 
    ? allPenalties 
    : allPenalties.filter(p => p.severity === severityFilter)
  
  const struct = data?.structuralData

  const handleCopyFix = (fix: string, index: number) => {
    navigator.clipboard.writeText(fix)
    setCopiedFix(index)
    setTimeout(() => setCopiedFix(null), 2000)
  }

  return (
    <div className="grid gap-6 overflow-hidden">
      {/* Score Deductions - Intelligence Penalty Ledger */}
      {!hideScoreDeductions && allPenalties.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Score Deductions
              <button
                onClick={() => {
                  const sep = '─'.repeat(60)
                  const text = `SCORE DEDUCTIONS — All Penalties (${allPenalties.length})\n${'═'.repeat(60)}\n\n` + allPenalties.map((p, i) => {
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
              Fix these issues to reach a perfect score. All point deductions across SEO, AEO, and GEO categories. Click any penalty for detailed explanation and fix instructions.
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
                All ({allPenalties.length})
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
                Critical ({allPenalties.filter(p => p.severity === 'critical').length})
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
                Warning ({allPenalties.filter(p => p.severity === 'warning').length})
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
                            className={cn(
                              "text-[9px] font-black uppercase px-1.5 py-0.5",
                              penalty.category === 'SEO' && "border-seo/50 text-seo bg-seo/10",
                              penalty.category === 'AEO' && "border-aeo/50 text-aeo bg-aeo/10",
                              penalty.category === 'GEO' && "border-geo/50 text-geo bg-geo/10"
                            )}
                          >
                            {penalty.category}
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
              Showing {filteredPenalties.filter(p => p.category === 'SEO').length} SEO, {filteredPenalties.filter(p => p.category === 'AEO').length} AEO, and {filteredPenalties.filter(p => p.category === 'GEO').length} GEO penalties{severityFilter !== 'all' ? ` (${severityFilter} only)` : ''}. Click any to expand.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins Section - Now Expandable */}
      {quickWins.length > 0 && (
        <Card className="border-geo/30 bg-geo/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-geo">
              <Zap className="h-5 w-5" />
              Quick Wins
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Easy fixes with solid impact. Click any for detailed explanation and fix instructions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickWins.map((penalty, i) => {
                const quickWinIndex = allPenalties.indexOf(penalty);
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
                              className={cn(
                                "text-[9px] font-black uppercase px-1.5 py-0.5",
                                penalty.category === 'SEO' && "border-seo/50 text-seo bg-seo/10",
                                penalty.category === 'AEO' && "border-aeo/50 text-aeo bg-aeo/10",
                                penalty.category === 'GEO' && "border-geo/50 text-geo bg-geo/10"
                              )}
                            >
                              {penalty.category}
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

      {/* On-Page AI Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-seo/20 bg-seo/5 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-seo" />
              On-Page AI Audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiSeo ? (
                aiSeo.onPageIssues.map((issue: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">Run an analysis to see AI audit results...</p>
              )}
            </div>
            {aiSeo?.metaAnalysis && (
              <div className="mt-4 p-3 rounded bg-seo/10 border border-seo/10">
                <p className="text-xs font-semibold text-seo uppercase mb-1">AI Context Analysis</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{aiSeo.metaAnalysis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-seo/20 bg-seo/5 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-seo" />
              Keyword Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {aiSeo ? (
                aiSeo.keywordOpportunities.map((kw: string, i: number) => (
                  <Badge key={i} variant="outline" className="border-seo/30 text-seo bg-seo/5 px-3 py-1.5 text-sm whitespace-normal text-left break-words">
                    {kw}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">Identify new keyword gaps via AI...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Health & Structure */}
      {!hideScoreDeductions && (
      <Card className="border-[#00e5ff]/20 bg-gradient-to-br from-[#00e5ff]/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#00e5ff]" />
            Extracted DOM Intelligence
          </CardTitle>
          <CardDescription>Raw technical signals and semantic structure extracted from the page DOM</CardDescription>
        </CardHeader>
        <CardContent>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-seo/20 bg-seo/5 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-seo" />
              Technical Response Items
              <InfoTooltip content="Technical health checks that search engines and AI crawlers evaluate." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {displayTechnicalHealth.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3",
                    item.status ? "border-geo/30 bg-geo/10" : "border-destructive/30 bg-destructive/10"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", item.status ? "text-geo" : "text-destructive")} />
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="ml-auto">
                    {item.status ? (
                      <CheckCircle2 className="h-5 w-5 text-geo" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-seo/20 bg-seo/5 min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-seo" />
              Semantic DOM Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <span className="text-sm font-medium text-muted-foreground">Word Count</span>
                <span className="font-mono font-bold">{struct?.wordCount || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <span className="text-sm font-medium text-muted-foreground">Internal Links</span>
                <span className="font-mono font-bold text-seo">{struct?.links?.internal || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <span className="text-sm font-medium text-muted-foreground">Semantic Tags</span>
                <span className="font-mono font-bold">
                  {(struct?.semanticTags?.article || 0) + (struct?.semanticTags?.main || 0) + (struct?.semanticTags?.aside || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <span className="text-sm font-medium text-muted-foreground">Headers</span>
                <span className="font-mono font-bold">{struct?.semanticTags?.headers || 0}</span>
              </div>
            </div>

            {struct?.wordCount && struct.wordCount < 300 && (
              <div className="mt-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm flex gap-2">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                Warning: Thin Content. Sites with under 300 words rarely rank in AI queries.
              </div>
            )}

            {/* Explanation block */}
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-xs text-foreground/80 space-y-1">
                  <p><strong className="text-foreground">What this measures:</strong> Semantic HTML tags (&lt;main&gt;, &lt;article&gt;, &lt;aside&gt;, &lt;nav&gt;) help search engines and AI systems understand your page structure and content hierarchy.</p>
                  <p><strong className="text-foreground">Why it matters:</strong> Pages with proper semantic structure are easier for crawlers to parse, leading to better indexing and more accurate AI citations. Word count and internal linking signal content depth and site architecture.</p>
                  <p><strong className="text-foreground">Good targets:</strong> 800+ words for content pages, 5+ internal links, at least 1 semantic tag (&lt;main&gt; or &lt;article&gt;), 3+ headers (H2-H6).</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
