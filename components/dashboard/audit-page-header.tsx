"use client"

import { RefreshCw, Download, Copy, Check, Search, Clock, Activity, Sparkles, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SiteTypeBadge } from "@/components/dashboard/site-type-badge"
import { useState } from "react"
import { downloadReport, copyReportToClipboard } from "@/lib/report-exporter"

interface AuditPageHeaderProps {
  title: string
  description?: string
  badge?: string
  badgeVariant?: "pro" | "beta"
  currentUrl: string
  hasResults: boolean
  isAnalyzing: boolean
  onNewAudit: () => void
  onRefreshAnalysis: () => void
  analysisData?: any
  pageCount?: number
  siteType?: {
    primaryType: string
    confidence: number
  }
}

export function AuditPageHeader({
  title,
  description,
  badge,
  badgeVariant = "pro",
  currentUrl,
  hasResults,
  isAnalyzing,
  onNewAudit,
  onRefreshAnalysis,
  analysisData,
  pageCount = 1,
  siteType
}: AuditPageHeaderProps) {
  const [reportCopied, setReportCopied] = useState(false)

  const handleExportReport = () => {
    if (!analysisData) return
    
    try {
      const exportData = {
        url: currentUrl,
        timestamp: new Date().toLocaleString(),
        scores: analysisData.scores || analysisData.ai?.scores || { seo: 0, aeo: 0, geo: 0 },
        penalties: analysisData.enhancedPenalties || analysisData.ai?.enhancedPenalties || [],
        technical: analysisData.technical,
        structuralData: analysisData.structuralData
      }
      
      downloadReport(exportData)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export report. Please try again.')
    }
  }

  const handleCopyReport = async () => {
    if (!analysisData) return
    
    const exportData = {
      url: currentUrl,
      timestamp: new Date().toLocaleString(),
      scores: analysisData.scores || analysisData.ai?.scores || { seo: 0, aeo: 0, geo: 0 },
      penalties: analysisData.enhancedPenalties || analysisData.ai?.enhancedPenalties || [],
      technical: analysisData.technical,
      structuralData: analysisData.structuralData
    }
    
    const success = await copyReportToClipboard(exportData)
    if (success) {
      setReportCopied(true)
      setTimeout(() => setReportCopied(false), 2000)
    }
  }

  const getBadgeStyles = () => {
    if (badgeVariant === "beta") {
      return "bg-purple-500/10 text-purple-600 border-purple-500/20"
    }
    return "bg-green-500/10 text-green-600 border-green-500/20"
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-6 w-6 text-seo" />
            {title}
            {badge && (
              <Badge variant="secondary" className={`${getBadgeStyles()} px-3 py-1`}>
                {badge}
              </Badge>
            )}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl truncate">
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              {currentUrl || "No analysis active"}
            </span>
            {hasResults && (
              <>
                <Badge variant="outline" className="border-geo/50 text-geo">
                  <Clock className="h-3 w-3 mr-1" />
                  Analysis Live
                </Badge>
                <Badge variant="outline" className="border-geo/50 text-geo bg-geo/5">
                  <Activity className="h-3 w-3 mr-1.5" />
                  {pageCount} Page{pageCount !== 1 ? 's' : ''} Scanned
                </Badge>
              </>
            )}
          </div>
        </div>
        
        {/* Right Side: Context-Aware Scoring + Action Buttons */}
        <div className="lg:w-[480px] shrink-0 space-y-2">
          {hasResults && (
            <>
              {siteType && (
                <div className="px-2 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wide">Context-Aware Scoring</span>
                    <div className="group relative inline-flex ml-auto">
                      <HelpCircle className="h-3.5 w-3.5 text-purple-600/60 hover:text-purple-600 cursor-help transition-colors" />
                      <div className="absolute bottom-full right-0 mb-2 w-64 px-3 py-2 bg-popover border border-border rounded-lg text-xs shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                        <p className="text-foreground font-semibold mb-1">What is Context-Aware Scoring?</p>
                        <p className="text-muted-foreground leading-relaxed">
                          Our AI detects your site type (e-commerce, restaurant, blog, etc.) and applies specialized scoring weights to each category. This ensures your audit reflects what matters most for your specific business model.
                        </p>
                      </div>
                    </div>
                  </div>
                  <SiteTypeBadge 
                    siteType={{
                      primaryType: siteType.primaryType as any,
                      confidence: siteType.confidence
                    }}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={onNewAudit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-seo/50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Audit
                </button>
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-geo/50 transition-colors"
                  title="Copy report to clipboard"
                >
                  {reportCopied ? (
                    <>
                      <Check className="h-4 w-4 text-geo" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Report
                    </>
                  )}
                </button>
                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                  title="Download report as text file"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </>
          )}
          
          {!hasResults && !isAnalyzing && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground italic">Ready to optimize?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
