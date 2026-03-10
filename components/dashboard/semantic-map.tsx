"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map, AlertTriangle, Link2, ExternalLink, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageTier {
    tier: number;
    label: string;
    pages: any[];
    avgAuthority: number;
    avgLinks: number;
    color: string;
    bgColor: string;
    borderColor: string;
}

export function SemanticMap({ pages, clusters }: { pages: any[], clusters: string[] }) {
    const [tiers, setTiers] = useState<PageTier[]>([]);
    const [orphanPages, setOrphanPages] = useState<any[]>([]);

    useEffect(() => {
        if (!pages || pages.length === 0) return;

        // Calculate authority score for each page (based on internal links)
        const pagesWithAuthority = pages.map(p => ({
            ...p,
            authority: p.url === pages[0].url ? 100 : Math.min(100, (p.internalLinks || 0) * 8)
        }));

        // Sort by authority
        const sorted = [...pagesWithAuthority].sort((a, b) => b.authority - a.authority);

        // Identify orphans (pages with 0 or 1 internal links)
        const orphans = sorted.filter(p => (p.internalLinks || 0) <= 1 && p.url !== pages[0].url);
        const nonOrphans = sorted.filter(p => (p.internalLinks || 0) > 1 || p.url === pages[0].url);

        // Create tiers
        const tierData: PageTier[] = [];
        
        // Tier 1: Top authority pages (top 20% or at least homepage)
        const tier1Count = Math.max(1, Math.ceil(nonOrphans.length * 0.2));
        const tier1Pages = nonOrphans.slice(0, tier1Count);
        if (tier1Pages.length > 0) {
            tierData.push({
                tier: 1,
                label: "Authority Hubs",
                pages: tier1Pages,
                avgAuthority: Math.round(tier1Pages.reduce((sum, p) => sum + p.authority, 0) / tier1Pages.length),
                avgLinks: Math.round(tier1Pages.reduce((sum, p) => sum + (p.internalLinks || 0), 0) / tier1Pages.length),
                color: "text-geo",
                bgColor: "bg-geo/5",
                borderColor: "border-geo/30"
            });
        }

        // Tier 2: Supporting pages (next 40%)
        const tier2Count = Math.ceil(nonOrphans.length * 0.4);
        const tier2Pages = nonOrphans.slice(tier1Count, tier1Count + tier2Count);
        if (tier2Pages.length > 0) {
            tierData.push({
                tier: 2,
                label: "Supporting Pages",
                pages: tier2Pages,
                avgAuthority: Math.round(tier2Pages.reduce((sum, p) => sum + p.authority, 0) / tier2Pages.length),
                avgLinks: Math.round(tier2Pages.reduce((sum, p) => sum + (p.internalLinks || 0), 0) / tier2Pages.length),
                color: "text-aeo",
                bgColor: "bg-aeo/5",
                borderColor: "border-aeo/30"
            });
        }

        // Tier 3: Content pages (remaining)
        const tier3Pages = nonOrphans.slice(tier1Count + tier2Count);
        if (tier3Pages.length > 0) {
            tierData.push({
                tier: 3,
                label: "Content Pages",
                pages: tier3Pages,
                avgAuthority: Math.round(tier3Pages.reduce((sum, p) => sum + p.authority, 0) / tier3Pages.length),
                avgLinks: Math.round(tier3Pages.reduce((sum, p) => sum + (p.internalLinks || 0), 0) / tier3Pages.length),
                color: "text-seo",
                bgColor: "bg-seo/5",
                borderColor: "border-seo/30"
            });
        }

        setTiers(tierData);
        setOrphanPages(orphans);
    }, [pages]);

    const getPageLabel = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.pathname === "/" || urlObj.pathname === "") return "Homepage";
            const parts = urlObj.pathname.split('/').filter(Boolean);
            return parts[parts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Page";
        } catch {
            return url;
        }
    };

    return (
        <Card className="border-border/50 bg-background/50 overflow-hidden">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Map className="h-5 w-5 text-geo" />
                            Site Architecture Map
                        </CardTitle>
                        <CardDescription>Pages organized by internal link authority and architectural tier</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-geo/5 border-geo/20 text-geo font-black text-[10px] tracking-widest uppercase">
                        {pages.length} Pages Analyzed
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tier Cards */}
                {tiers.map((tier) => (
                    <div key={tier.tier} className={cn("p-4 rounded-xl border", tier.borderColor, tier.bgColor)}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm", tier.bgColor, tier.color, "ring-2 ring-inset", tier.borderColor)}>
                                    {tier.tier}
                                </div>
                                <div>
                                    <h4 className={cn("font-bold text-sm", tier.color)}>Tier {tier.tier}: {tier.label}</h4>
                                    <p className="text-xs text-muted-foreground">{tier.pages.length} pages</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="text-right">
                                    <p className="text-muted-foreground">Avg Authority</p>
                                    <p className={cn("font-black", tier.color)}>{tier.avgAuthority}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-muted-foreground">Avg Links</p>
                                    <p className={cn("font-black", tier.color)}>{tier.avgLinks}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Page Pills */}
                        <div className="flex flex-wrap gap-2">
                            {tier.pages.map((page, idx) => (
                                <a
                                    key={idx}
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background/60 hover:bg-background transition-all text-xs font-medium",
                                        tier.borderColor
                                    )}
                                    title={page.url}
                                >
                                    <Link2 className="h-3 w-3 text-muted-foreground" />
                                    <span className="max-w-[200px] truncate">{getPageLabel(page.url)}</span>
                                    <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">
                                        {page.internalLinks || 0}
                                    </Badge>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Orphaned Pages Warning */}
                {orphanPages.length > 0 && (
                    <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <div>
                                <h4 className="font-bold text-sm text-destructive">Orphaned Pages Detected</h4>
                                <p className="text-xs text-muted-foreground">{orphanPages.length} pages with minimal internal links</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {orphanPages.map((page, idx) => (
                                <a
                                    key={idx}
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/30 bg-background/60 hover:bg-background transition-all text-xs font-medium"
                                    title={page.url}
                                >
                                    <AlertTriangle className="h-3 w-3 text-destructive" />
                                    <span className="max-w-[200px] truncate">{getPageLabel(page.url)}</span>
                                    <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 border-destructive/30 text-destructive">
                                        {page.internalLinks || 0}
                                    </Badge>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                        <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                <span className="font-semibold text-foreground">Fix:</span> Add internal links from high-authority pages to these orphaned pages to improve their discoverability and SEO value.
                            </p>
                        </div>
                    </div>
                )}

                {/* Topical Clusters */}
                {clusters && clusters.length > 0 && (
                    <div className="p-4 rounded-xl border border-border/40 bg-muted/20">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-geo" />
                            <h4 className="font-bold text-sm">Topical Clusters Detected</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {clusters.map((cluster, idx) => (
                                <Badge key={idx} variant="outline" className="border-geo/30 text-geo bg-geo/5 px-3 py-1.5 text-xs">
                                    {cluster}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
