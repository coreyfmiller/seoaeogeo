"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      enhancedPenalties?: EnhancedPenalty[],
      seoAnalysis: {
        onPageIssues: string[],
        keywordOpportunities: string[],
        contentQuality: string,
        metaAnalysis: string
      }
    }
  }
}

export function SEOTabEnhanced({ data }: SEOTabProps) {
  const [expandedPenalty, setExpandedPenalty] = useState<number | null>(null);
  
  const displayTechnicalHealth = data?.technical ? [
    { name: "SSL Certificate", status: data.technical.isHttps, icon: Shield },
    { name: "Server Status", status: data.technical.status === 200, icon: MapPin },
    { name: "Response Time", status: data.technical.responseTimeMs < 2000, icon: Bot },
  ] : []

  const aiSeo = data?.ai?.seoAnalysis
  const enhancedPenalties = data?.ai?.enhancedPenalties?.filter(p => p.category === 'SEO') || []
  const struct = data?.structuralData

  return (
    <div className="grid gap-6">
      {/* Enhanced Penalty Ledger */}
      {enhancedPenalties.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              SEO Intelligence Penalty Ledger
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              The AI explicitly deducted points from this site for the following structural failures. Click any penalty for detailed explanation and fix instructions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enhancedPenalties.map((penalty, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "rounded-lg border transition-all cursor-pointer",
                    penalty.severity === 'critical' ? "border-destructive/30 bg-destructive/5" : "border-yellow-500/30 bg-yellow-500/5",
                    expandedPenalty === i && "ring-2 ring-offset-2",
                    penalty.severity === 'critical' && expandedPenalty === i && "ring-destructive/50",
                    penalty.severity === 'warning' && expandedPenalty === i && "ring-yellow-500/50"
                  )}
                  onClick={() => setExpandedPenalty(expandedPenalty === i ? null : i)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "shrink-0 font-mono",
                          penalty.severity === 'critical' ? "border-destructive/50 text-destructive bg-destructive/10" : "border-yellow-500/50 text-yellow-600 bg-yellow-500/10"
                        )}
                      >
                        {penalty.pointsDeducted} pts
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">{penalty.component}</span>
                          {penalty.severity === 'critical' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        </div>
                        <p className="text-sm font-medium text-foreground leading-tight mb-2">{penalty.penalty}</p>
                        
                        {expandedPenalty === i && (
                          <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                            {/* Explanation */}
                            <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-bold uppercase text-muted-foreground">Why This Matters</span>
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">{penalty.explanation}</p>
                            </div>
                            
                            {/* Fix */}
                            <div className="p-3 rounded-lg bg-geo/5 border border-geo/30">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-geo" />
                                <span className="text-xs font-bold uppercase text-geo">How To Fix</span>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">{penalty.fix}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Click any penalty to see detailed explanation and step-by-step fix instructions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* On-Page AI Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-seo/20 bg-seo-muted/10">
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
              <div className="mt-4 p-3 rounded bg-seo-muted/30 border border-seo/10">
                <p className="text-xs font-semibold text-seo uppercase mb-1">AI Context Analysis</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{aiSeo.metaAnalysis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-seo/20 bg-seo-muted/10">
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
                  <Badge key={i} variant="outline" className="border-seo/30 text-seo bg-seo/5 px-3 py-1.5 text-sm">
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
      <h2 className="text-xl font-bold mt-4 flex items-center gap-2">
        <Bot className="h-6 w-6 text-geo" />
        Extracted DOM Intelligence
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-seo/20 bg-seo-muted/10">
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
                    item.status ? "border-geo/30 bg-geo-muted/20" : "border-destructive/30 bg-destructive/10"
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

        <Card className="border-seo/20 bg-seo-muted/10">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
