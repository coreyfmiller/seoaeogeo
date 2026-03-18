"use client"

import { RefreshCw, Download, Copy, Check, Search, Clock, Activity, Sparkles, HelpCircle, Zap, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SiteTypeBadge } from "@/components/dashboard/site-type-badge"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { downloadReport, copyReportToClipboard } from "@/lib/report-exporter"

interface CWVMetric {
  value: number
  category: string
  displayValue: string
  score: number
}

interface CWVData {
  performanceScore: number
  lcp: CWVMetric | null
  inp: CWVMetric | null
  cls: CWVMetric | null
}

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
  onSiteTypeConfirm?: (confirmedType: string) => void
  onSiteTypeChange?: (selectedType: string) => void
  cwv?: CWVData
  proLocked?: boolean
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
  siteType,
  onSiteTypeConfirm,
  onSiteTypeChange,
  cwv,
  proLocked = false
}: AuditPageHeaderProps) {
  const [reportCopied, setReportCopied] = useState(false)
  const router = useRouter()

  const buildExportData = () => {
    if (!analysisData) return null
    // Deep scan: has pages array and sitewideIntelligence
    const isDeepScan = !!(analysisData.pages && analysisData.sitewideIntelligence)
    if (isDeepScan) {
      return { url: currentUrl, timestamp: new Date().toLocaleString(), deepScan: analysisData } as any
    }
    return {
      url: currentUrl,
      timestamp: new Date().toLocaleString(),
      scores: analysisData.scores || analysisData.ai?.scores || { seo: 0, aeo: 0, geo: 0 },
      penalties: analysisData.enhancedPenalties || analysisData.ai?.enhancedPenalties || [],
      technical: analysisData.technical,
      structuralData: analysisData.structuralData
    }
  }

  const handleExportReport = () => {
    const exportData = buildExportData()
    if (!exportData) return
    try {
      downloadReport(exportData)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export report. Please try again.')
    }
  }

  const handleCopyReport = async () => {
    const exportData = buildExportData()
    if (!exportData) return
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
                    onConfirm={onSiteTypeConfirm}
                    onManualSelect={onSiteTypeChange}
                  />
                  {cwv && (
                    <div className="flex items-center gap-2 flex-wrap mt-1.5 pt-1.5 border-t border-purple-500/20">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                        <Zap className="h-3 w-3" />
                        <span>Core Web Vitals</span>
                        <span className="text-foreground">{cwv.performanceScore}/100</span>
                      </div>
                      {cwv.lcp && (
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
                          cwv.lcp.category === 'FAST' ? 'border-green-500/30 bg-green-500/5 text-green-600' :
                          cwv.lcp.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5 text-red-600' :
                          'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
                        }`}>
                          LCP {cwv.lcp.displayValue}
                          <InfoTooltip content="Largest Contentful Paint — measures loading performance. How long until the largest visible element renders. Under 2.5s is good." className="[&_svg]:h-2.5 [&_svg]:w-2.5" />
                        </span>
                      )}
                      {cwv.inp && (
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
                          cwv.inp.category === 'FAST' ? 'border-green-500/30 bg-green-500/5 text-green-600' :
                          cwv.inp.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5 text-red-600' :
                          'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
                        }`}>
                          INP {cwv.inp.displayValue}
                          <InfoTooltip content="Interaction to Next Paint — measures responsiveness. How long until the page responds to user input. Under 200ms is good." className="[&_svg]:h-2.5 [&_svg]:w-2.5" />
                        </span>
                      )}
                      {cwv.cls && (
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
                          cwv.cls.category === 'FAST' ? 'border-green-500/30 bg-green-500/5 text-green-600' :
                          cwv.cls.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5 text-red-600' :
                          'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
                        }`}>
                          CLS {cwv.cls.displayValue}
                          <InfoTooltip content="Cumulative Layout Shift — measures visual stability. How much the page layout shifts during loading. Under 0.1 is good." className="[&_svg]:h-2.5 [&_svg]:w-2.5" />
                        </span>
                      )}
                    </div>
                  )}
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
                  onClick={proLocked ? () => router.push('/pro') : handleCopyReport}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm transition-colors ${proLocked ? 'text-muted-foreground hover:text-foreground hover:border-geo/50 cursor-pointer' : 'text-muted-foreground hover:text-foreground hover:border-geo/50'}`}
                  title={proLocked ? "Upgrade to Pro to copy reports" : "Copy report to clipboard"}
                >
                  {proLocked ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Copy Report
                    </>
                  ) : reportCopied ? (
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
                  onClick={proLocked ? () => router.push('/pro') : handleExportReport}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${proLocked ? 'bg-primary/50 text-primary-foreground hover:bg-primary/70 cursor-pointer' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                  title={proLocked ? "Upgrade to Pro to export reports" : "Download report as text file"}
                >
                  {proLocked && <Lock className="h-4 w-4" />}
                  {!proLocked && <Download className="h-4 w-4" />}
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
