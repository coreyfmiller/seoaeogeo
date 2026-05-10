"use client"

import { cn } from "@/lib/utils"
import { Link2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LearnMore } from "@/components/ui/learn-more"

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
  nofollowOnly?: boolean
}

export function LinkBuildingIntelligence({ metrics, backlinks, nofollowOnly }: LinkBuildingIntelligenceProps) {
  const da = metrics.domainAuthority

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-green-500" />
          <CardTitle>Link Building Intelligence <LearnMore term="backlinks" /></CardTitle>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-500 bg-green-500/10 gap-1">
            MOZ
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Domain Authority", value: `${da}/100`, color: da >= 60 ? "text-green-500" : da >= 40 ? "text-seo" : da >= 20 ? "text-yellow-500" : "text-red-500" },
            { label: "Page Authority", value: `${metrics.pageAuthority}/100`, color: metrics.pageAuthority >= 40 ? "text-green-500" : "text-yellow-500" },
            { label: "Linking Domains", value: metrics.linkingDomains.toLocaleString(), color: "text-foreground" },
            { label: "Total Backlinks", value: metrics.totalBacklinks.toLocaleString(), color: "text-foreground" },
            { label: "Spam Score", value: `${metrics.spamScore}%`, color: metrics.spamScore > 30 ? "text-red-500" : "text-green-500" },
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-border/50 bg-card/50 px-3 py-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold truncate">{m.label}</p>
                {m.label === 'Domain Authority' && <LearnMore term="domain-authority" />}
                {m.label === 'Page Authority' && <LearnMore term="page-authority" />}
                {m.label === 'Spam Score' && <LearnMore term="spam-score" />}
                {m.label === 'Linking Domains' && <LearnMore term="linking-domains" />}
                {m.label === 'Total Backlinks' && <LearnMore term="total-backlinks" />}
              </div>
              <p className={cn("text-lg font-black", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* DA Assessment + Guide Link */}
        <a href="/blog/backlink-strategy-guide" className={cn("block rounded-lg p-4 border transition-colors",
          da < 20 ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10" :
          da < 40 ? "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10" :
          da < 60 ? "border-seo/30 bg-seo/5 hover:bg-seo/10" :
          "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
        )}>
          <p className={cn("text-sm font-bold mb-1",
            da < 20 ? "text-red-500" : da < 40 ? "text-yellow-500" : da < 60 ? "text-seo" : "text-green-500"
          )}>
            {da < 20 && "You need a backlink strategy to compete."}
            {da >= 20 && da < 40 && "A focused backlink strategy will set you apart."}
            {da >= 40 && da < 60 && "Solid authority. Keep building quality links."}
            {da >= 60 && "Strong domain authority. Maintain your edge."}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {da < 20 && "With a Domain Authority of " + da + ", even great on-page optimization won't outrank competitors with stronger backlink profiles. A deliberate link-building strategy is the single highest-ROI activity you can invest in right now."}
            {da >= 20 && da < 40 && "A Domain Authority of " + da + " puts you in the average range. To rank for meaningful keywords you need to actively earn quality backlinks."}
            {da >= 40 && da < 60 && "A Domain Authority of " + da + " is strong. Focus on earning links from high-authority sites in your industry to break into the top tier."}
            {da >= 60 && "A Domain Authority of " + da + " puts you in the top tier. Focus on maintaining your profile and disavowing any toxic links."}
          </p>
          <p className="text-xs font-bold text-green-500 mt-2 flex items-center gap-1">
            Read our complete backlink strategy guide →
          </p>
        </a>

        {/* Top Referring Domains — always visible, prominent */}
        {backlinks.length > 0 && (
          <div className="rounded-xl border-2 border-green-500/20 bg-green-500/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-green-500/10">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-green-500" />
                <h3 className="text-base font-black">Top {backlinks.length} Referring Domains</h3>
                <LearnMore term="top-referring-domains" />
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-500 bg-green-500/10">MOZ</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">The highest-authority domains linking to your site</p>
              {nofollowOnly && (
                <p className="text-xs text-yellow-400/80 mt-2 leading-relaxed">
                  ⚠ No dofollow backlinks found. These are nofollow links — typically from directories or automated sources. They don&apos;t pass ranking authority. Building quality dofollow backlinks should be a priority.
                </p>
              )}
            </div>
            <div className="px-5 py-3 space-y-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase font-bold pb-2 border-b border-border/30">
                <span className="w-10 flex items-center gap-0.5">DA <LearnMore term="domain-authority" className="h-3 w-3 text-[7px]" /></span>
                <span className="flex-1">Linking Domain</span>
                <span className="w-32 text-right flex items-center justify-end gap-0.5">Anchor Text <LearnMore term="anchor-text" className="h-3 w-3 text-[7px]" /></span>
                <span className="w-16 text-right flex items-center justify-end gap-0.5">Type <LearnMore term="nofollow-dofollow" className="h-3 w-3 text-[7px]" /></span>
              </div>
              {backlinks.map((bl, i) => (
                <div key={i} className="flex items-center gap-3 text-sm border-b border-border/10 pb-2 last:border-0">
                  <span className={cn("font-black tabular-nums w-10", bl.domainAuthority >= 50 ? "text-green-500" : bl.domainAuthority >= 20 ? "text-yellow-500" : "text-muted-foreground")}>{bl.domainAuthority}</span>
                  <a href={(() => { const u = bl.sourceUrl || bl.sourceDomain; return u.startsWith('http') ? u : `https://${u}` })()} target="_blank" rel="noopener noreferrer" className="text-foreground/80 truncate flex-1 font-medium hover:text-green-500 hover:underline transition-colors">{bl.sourceDomain}</a>
                  <span className="text-muted-foreground truncate w-32 text-right text-xs">{bl.anchorText || '—'}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded w-16 text-right font-bold", bl.isDofollow ? "text-green-500 bg-green-500/10" : "text-muted-foreground/50 bg-muted/30")}>{bl.isDofollow ? 'follow' : 'nofollow'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
