"use client"

import { RefreshCw, Search, Activity, Sparkles, HelpCircle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SiteTypeBadge } from "@/components/dashboard/site-type-badge"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { useState } from "react"


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
  platformDetection?: {
    platform: string
    confidence: string
    label: string
  }
  onSiteTypeConfirm?: (confirmedType: string) => void
  onSiteTypeChange?: (selectedType: string) => void
  onPlatformChange?: (selectedPlatform: string) => void
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
  proLocked = false,
  platformDetection,
  onPlatformChange,
}: AuditPageHeaderProps) {
  const [platformOverride, setPlatformOverride] = useState<string | null>(null)

  const platformOptions = [
    { value: 'wordpress', label: 'WordPress' },
    { value: 'shopify', label: 'Shopify' },
    { value: 'wix', label: 'Wix' },
    { value: 'squarespace', label: 'Squarespace' },
    { value: 'webflow', label: 'Webflow' },
    { value: 'drupal', label: 'Drupal' },
    { value: 'joomla', label: 'Joomla' },
    { value: 'magento', label: 'Magento' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'gatsby', label: 'Gatsby' },
    { value: 'ghost', label: 'Ghost' },
    { value: 'hubspot', label: 'HubSpot' },
    { value: 'custom', label: 'Custom / Other' },
  ]

  const getBadgeStyles = () => {
    if (badgeVariant === "beta") {
      return "bg-[#BC13FE]/10 text-[#BC13FE] border-[#BC13FE]/20"
    }
    return "bg-green-500/10 text-green-600 border-green-500/20"
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left column: Title + URL badges */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <Activity className="h-6 w-6 text-seo shrink-0" />
            <h1 className="text-2xl font-bold text-foreground truncate">{title}</h1>
            {badge && (
              <Badge variant="secondary" className={`${getBadgeStyles()} px-3 py-1 shrink-0`}>
                {badge}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 shrink-0">
              <Search className="h-4 w-4" />
              {currentUrl || "No analysis active"}
            </span>
            {hasResults && (
              <>
                <Badge variant="outline" className="border-[#00e5ff]/50 text-[#00e5ff] bg-[#00e5ff]/5">
                  <Activity className="h-3 w-3 mr-1.5" />
                  {pageCount} Page{pageCount !== 1 ? 's' : ''} Scanned
                </Badge>
              </>
            )}
          </div>
          {hasResults && (
            <div className="flex items-center gap-2">
              <button
                onClick={onNewAudit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00e5ff] text-black text-xs font-bold hover:bg-[#00e5ff]/90 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                New Audit
              </button>
            </div>
          )}
          {!hasResults && !isAnalyzing && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground italic">Ready to optimize?</span>
            </div>
          )}
        </div>

        {/* Right column: Site Intelligence */}
        {hasResults && (
          <div className="shrink-0 flex flex-col gap-3 min-w-[320px]">
            {siteType && (
              <div className="px-4 py-3 rounded-lg border border-[#BC13FE]/30 bg-[#BC13FE]/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#BC13FE]" />
                  <span className="text-xs text-[#BC13FE] font-bold uppercase tracking-wide">Site Intelligence</span>
                  <div className="group relative inline-flex ml-auto">
                    <HelpCircle className="h-3.5 w-3.5 text-[#BC13FE]/60 hover:text-[#BC13FE] cursor-help transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 px-3 py-2 bg-popover border border-border rounded-lg text-xs shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                      <p className="text-foreground font-semibold mb-1">What is Site Intelligence?</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Our AI detects your site type, platform, and applies specialized scoring weights. Fix instructions are tailored to your specific platform (WordPress, Shopify, etc.) so you get actionable, relevant guidance.
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
                {(platformDetection || onPlatformChange) && (
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-[#BC13FE]/20 bg-background/60">
                    <span className="text-xs font-bold">Built With:</span>
                    <div className="group relative inline-flex">
                      <HelpCircle className="h-3.5 w-3.5 text-[#BC13FE]/60 hover:text-[#BC13FE] cursor-help transition-colors" />
                      <div className="absolute bottom-full right-0 mb-2 w-64 px-3 py-2 bg-popover border border-border rounded-lg text-xs shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                        <p className="text-foreground font-semibold mb-1">Platform Detection</p>
                        <p className="text-muted-foreground leading-relaxed">
                          Duelly detects the platform your site is built on (WordPress, Shopify, etc.) and tailors fix instructions to your specific stack. Override it here if the detection is wrong.
                        </p>
                      </div>
                    </div>
                    <select
                      value={platformOverride || platformDetection?.platform || 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlatformOverride(val);
                        onPlatformChange?.(val);
                      }}
                      className="text-xs font-bold text-foreground bg-transparent border border-border/50 rounded px-1.5 py-0.5 cursor-pointer hover:border-[#BC13FE]/60 transition-colors focus:outline-none focus:ring-1 focus:ring-[#BC13FE]/50"
                      aria-label="Select platform"
                    >
                      {platformOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {!platformOverride && platformDetection && (
                      <span className={`text-xs font-medium ${
                        platformDetection.confidence === 'high' ? 'text-[#fe3f8c]' :
                        platformDetection.confidence === 'medium' ? 'text-[#fe3f8c]/70' :
                        'text-[#fe3f8c]/50'
                      }`}>
                        auto-detected
                      </span>
                    )}
                    {platformOverride && platformOverride !== platformDetection?.platform && (
                      <span className="text-xs font-medium text-[#BC13FE]">
                        manual
                      </span>
                    )}
                  </div>
                )}
                {cwv && (
                  <div className="flex items-center gap-2 flex-wrap px-2 py-1.5 rounded-lg border border-[#BC13FE]/20 bg-background/60">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold uppercase tracking-wide">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Core Web Vitals</span>
                      <span className="text-foreground">{cwv.performanceScore}/100</span>
                    </div>
                    {cwv.lcp && (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                        cwv.lcp.category === 'FAST' ? 'border-green-500/30 bg-green-500/5 text-green-600' :
                        cwv.lcp.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5 text-red-600' :
                        'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
                      }`}>
                        LCP {cwv.lcp.displayValue}
                        <InfoTooltip content="Largest Contentful Paint — measures loading performance. How long until the largest visible element renders. Under 2.5s is good." className="[&_svg]:h-3 [&_svg]:w-3" />
                      </span>
                    )}
                    {cwv.inp && (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                        cwv.inp.category === 'FAST' ? 'border-green-500/30 bg-green-500/5 text-green-600' :
                        cwv.inp.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5 text-red-600' :
                        'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
                      }`}>
                        INP {cwv.inp.displayValue}
                        <InfoTooltip content="Interaction to Next Paint — measures responsiveness. How long until the page responds to user input. Under 200ms is good." className="[&_svg]:h-3 [&_svg]:w-3" />
                      </span>
                    )}
                    {cwv.cls && (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                        cwv.cls.category === 'FAST' ? 'border-green-500/30 bg-green-500/5 text-green-600' :
                        cwv.cls.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5 text-red-600' :
                        'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
                      }`}>
                        CLS {cwv.cls.displayValue}
                        <InfoTooltip content="Cumulative Layout Shift — measures visual stability. How much the page layout shifts during loading. Under 0.1 is good." className="[&_svg]:h-3 [&_svg]:w-3" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
