"use client"

import { cn } from "@/lib/utils"
import { Link2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface BacklinkMetrics {
  domain: string
  domainAuthority: number
  pageAuthority: number
  linkingDomains: number
  totalBacklinks: number
  spamScore: number
}

interface Backlink {
  sourceDomain: string
  sourceUrl: string
  anchorText: string
  domainAuthority: number
  isDofollow: boolean
}

interface LinkBuildingIntelligenceProps {
  metrics: BacklinkMetrics
  backlinks: Backlink[]
}

export function LinkBuildingIntelligence({ metrics, backlinks }: LinkBuildingIntelligenceProps) {
  const da = metrics.domainAuthority

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-green-500" />
          <CardTitle>Link Building Intelligence</CardTitle>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-500 bg-green-500/10 gap-1">
            MOZ
          </Badge>
          <InfoTooltip content="Backlinks are links from other websites pointing to yours. They're one of the strongest signals Google uses to decide who ranks higher. More quality backlinks = more trust = higher rankings." />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Domain Authority", value: `${da}/100`, color: da >= 60 ? "text-green-500" : da >= 40 ? "text-seo" : da >= 20 ? "text-yellow-500" : "text-red-500", tip: "Moz's 0-100 score predicting how well a domain will rank. DA 1-20 is low, 20-40 is average, 40-60 is strong, 60+ is excellent." },
            { label: "Page Authority", value: `${metrics.pageAuthority}/100`, color: metrics.pageAuthority >= 40 ? "text-green-500" : "text-yellow-500", tip: "Moz's score for this specific page's ranking strength." },
            { label: "Linking Domains", value: metrics.linkingDomains.toLocaleString(), color: "text-foreground", tip: "Unique root domains linking to your site. Diversity matters more than total count." },
            { label: "Total Backlinks", value: metrics.totalBacklinks.toLocaleString(), color: "text-foreground", tip: "Total external pages linking to your domain." },
            { label: "Spam Score", value: `${metrics.spamScore}%`, color: metrics.spamScore > 30 ? "text-red-500" : "text-green-500", tip: "Likelihood of being penalized. Under 30% is healthy, over 30% needs attention." },
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-border/50 bg-card/50 px-3 py-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold truncate">{m.label}</p>
                <InfoTooltip content={m.tip} className="shrink-0 [&_svg]:h-2.5 [&_svg]:w-2.5" />
              </div>
              <p className={cn("text-lg font-black", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* DA Assessment */}
        <div className={cn("rounded-lg p-4 border",
          da < 20 ? "border-red-500/30 bg-red-500/5" :
          da < 40 ? "border-yellow-500/30 bg-yellow-500/5" :
          da < 60 ? "border-seo/30 bg-seo/5" :
          "border-green-500/30 bg-green-500/5"
        )}>
          <p className={cn("text-sm font-bold mb-1",
            da < 20 ? "text-red-500" : da < 40 ? "text-yellow-500" : da < 60 ? "text-seo" : "text-green-500"
          )}>
            {da < 20 && "Your site needs more quality backlinks to compete"}
            {da >= 20 && da < 40 && "Building momentum. Keep earning quality backlinks."}
            {da >= 40 && da < 60 && "Solid authority foundation. Continue building."}
            {da >= 60 && "Strong domain authority. Maintain your edge."}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {da < 20 && "With a DA of " + da + ", your site will struggle to outrank competitors with higher authority. Focus on earning backlinks from reputable sites in your industry."}
            {da >= 20 && da < 40 && "A DA of " + da + " puts you in the average range. Consistent link building will push you ahead of competitors who aren't actively working on this."}
            {da >= 40 && da < 60 && "A DA of " + da + " is strong. You're competitive for most keywords. Focus on earning links from high-DA sites to break into the top tier."}
            {da >= 60 && "A DA of " + da + " puts you in the top tier. Focus on maintaining your backlink profile and disavowing any toxic links."}
          </p>
        </div>

        {/* Actionable Tactics */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">What You Can Do</p>
          {[
            da < 30 && { icon: "📍", title: "Claim your free listings", desc: "Get listed on Google Business Profile, Yelp, and industry directories. These are free and give your site an immediate authority boost." },
            { icon: "🤝", title: "Ask people you already work with", desc: "Vendors, suppliers, partners, and local business associations already know you. Ask them to link to your website." },
            { icon: "📝", title: "Create something worth sharing", desc: "Write a helpful guide, build a resource page, or answer common questions. Useful content naturally attracts links over time." },
            metrics.spamScore > 20 && { icon: "⚠️", title: "Review your backlink quality", desc: `Your spam score is ${metrics.spamScore}%. Some questionable sites may be linking to you. Consider using Google's Disavow Tool to clean up toxic links.` },
          ].filter(Boolean).map((tactic: any, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border/30 bg-card/30 p-3">
              <span className="text-lg shrink-0">{tactic.icon}</span>
              <div>
                <p className="text-sm font-bold">{tactic.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tactic.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Backlinks — always visible, prominent */}
        {backlinks.length > 0 && (
          <div className="rounded-xl border-2 border-green-500/20 bg-green-500/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-green-500/10">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-green-500" />
                <h3 className="text-base font-black">Top {backlinks.length} Backlinks</h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-500 bg-green-500/10">MOZ</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">The highest-authority sites linking to your domain</p>
            </div>
            <div className="px-5 py-3 space-y-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase font-bold pb-2 border-b border-border/30">
                <span className="w-10">DA</span>
                <span className="flex-1">Linking Domain</span>
                <span className="w-32 text-right">Anchor Text</span>
                <span className="w-16 text-right">Type</span>
              </div>
              {backlinks.map((bl, i) => (
                <div key={i} className="flex items-center gap-3 text-sm border-b border-border/10 pb-2 last:border-0">
                  <span className={cn("font-black tabular-nums w-10", bl.domainAuthority >= 50 ? "text-green-500" : bl.domainAuthority >= 20 ? "text-yellow-500" : "text-muted-foreground")}>{bl.domainAuthority}</span>
                  <a href={bl.sourceUrl || `https://${bl.sourceDomain}`} target="_blank" rel="noopener noreferrer" className="text-foreground/80 truncate flex-1 font-medium hover:text-green-500 hover:underline transition-colors">{bl.sourceDomain}</a>
                  <span className="text-muted-foreground truncate w-32 text-right text-xs">{bl.anchorText || '—'}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded w-16 text-right font-bold", bl.isDofollow ? "text-green-500 bg-green-500/10" : "text-muted-foreground/50 bg-muted/30")}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Link Building CTA */}
        <div className="rounded-lg border border-green-500/30 bg-green-500/[0.05] p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-green-500">Explore a quality backlink strategy with a professional</p>
            <p className="text-xs text-muted-foreground mt-0.5">Let experts handle the outreach, content, and relationship building for you.</p>
          </div>
          <button className="shrink-0 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30 rounded-lg text-xs font-bold transition-colors">
            Learn More →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
