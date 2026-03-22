"use client"

import { RefreshCw, Search, Clock, Activity, Sparkles, HelpCircle, Zap } from "lucide-react"
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
      return "bg-[#842ce0]/10 text-[#842ce0] border-[#842ce0]/20"
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
                <Badge variant="outline" className="border-[#fe3f8c]/50 text-[#fe3f8c]">
                  <Clock className="h-3 w-3 mr-1" />
                  Analysis Live
                </Badge>
                <Badge variant="outline" className="border-[#fe3f8c]/50 text-[#fe3f8c] bg-[#fe3f8c]/5">
                  <Activity className="h-3 w-3 mr-1.5" />
                  {pageCount} Page{pageCount !== 1 ? 's' : ''} Scanned
                </Badge>
              </>
            )}
          </div>
        </div>
        
        {/* Right Side: Site Intelligence + Action Buttons */}
        <div className="lg:w-[480px] shrink-0 space-y-2">
          {hasResults && (
            <>
              {siteType && (
                <div className="px-2 py-1.5 rounded-lg border border-[#842ce0]/30 bg-[#842ce0]/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#842ce0]" />
                    <span className="text-[10px] text-[#842ce0] font-bold uppercase tracking-wide">Site Intelligence</span>
                    <div className="group relative inline-flex ml-auto">
                      <HelpCircle className="h-3.5 w-3.5 text-[#842ce0]/60 hover:text-[#842ce0] cursor-help transition-colors" />
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
                    <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-[#842ce0]/20">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Built With:</span>
                      <select
                        value={platformOverride || platformDetection?.platform || 'custom'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlatformOverride(val);
                          onPlatformChange?.(val);
                        }}
                        className="text-[10px] font-bold text-foreground bg-transparent border border-[#842ce0]/30 rounded px-1.5 py-0.5 cursor-pointer hover:border-[#842ce0]/60 transition-colors focus:outline-none focus:ring-1 focus:ring-[#842ce0]/50"
                        aria-label="Select platform"
                      >
                        {platformOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {!platformOverride && platformDetection && (
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${
                          platformDetection.confidence === 'high' ? 'border-[#fe3f8c]/30 text-[#fe3f8c] bg-[#fe3f8c]/10' :
                          platformDetection.confidence === 'medium' ? 'border-[#fe3f8c]/30 text-[#fe3f8c]/70 bg-[#fe3f8c]/5' :
                          'border-[#fe3f8c]/20 text-[#fe3f8c]/50 bg-[#fe3f8c]/5'
                        }`}>
                          auto-detected
                        </Badge>
                      )}
                      {platformOverride && platformOverride !== platformDetection?.platform && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-[#842ce0]/30 text-[#842ce0] bg-[#842ce0]/10">
                          manual
                        </Badge>
                      )}
                    </div>
                  )}
                  {cwv && (
                    <div className="flex items-center gap-2 flex-wrap mt-1.5 pt-1.5 border-t border-[#842ce0]/20">
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
