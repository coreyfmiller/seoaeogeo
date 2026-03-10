# Complete Instructions to Add All Sections to Merged Dashboard

## Summary
The merged dashboard is missing 15+ sections that exist in the deep crawler. Due to file size (1880 lines) and API limitations, manual file editing is the most efficient approach.

## What's Currently in Merged Page
✓ Quick/Deep scan toggle
✓ 3 score cards (SEO, AEO, GEO)
✓ 8 stat cards
✓ SEO/AEO/GEO tabs
✓ Prioritized Site Improvements
✓ Page Comparison Table
✓ Keyword Cannibalization
✓ Recommendations sidebar

## What's Missing (from app/site-analysis/page.tsx)
1. Domain Health Breakdown (lines 776-960)
2. Schema Health Audit (lines 963-1170)
3. Brand Consistency Audit (lines 1173-1270)
4. Sitewide Strategic Insights (lines 1276-1340)
5. Content Gap Analysis (lines 1347-1370)
6. Competitor Gap Analysis (lines 1373-1385)
7. Internal Link Leaders (lines 1430-1450)
8. Potential Orphan Pages (lines 1451-1470)
9. Semantic Map (line 1477)
10. Page Speed Breakdown (lines 1480-1510)
11. Page Health Matrix (lines 1513-1565)
12. HTTPS Violations (lines 1571-1595)
13. Navigation & Semantic Architecture (lines 1600-1610)
14. Robots.txt & Sitemap Status (lines 1617-1640)
15. Heading Structure Analysis (lines 1647-1675)
16. Image Alt Text Coverage (lines 1682-1710)
17. Duplicate Title & Meta Detection (lines 1718-1760)
18. AEO Citation Readiness Score (lines 1767-1795)
19. E-E-A-T Trust Signals (lines 1804-1850)

## Required Imports to Add
```typescript
import { SemanticMap } from "@/components/dashboard/semantic-map"
import { CompetitorGapView } from "@/components/dashboard/competitor-gap-view"
import {
  TrendingUp,
  Target,
  Link2,
  AlarmClock,
  LayoutDashboard,
  Globe,
  FileText,
  Code2,
  ShieldCheck,
  Info,
  Map,
} from "lucide-react"
```

## InfoTooltip Component
Add this helper component at the top of the file (after imports, before the main component):

```typescript
function InfoTooltip({ text, title }: { text: string; title?: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-aeo cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-popover border border-border rounded-lg text-xs shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 ring-1 ring-border/50">
        {title && <p className="font-bold text-foreground mb-1">{title}</p>}
        <p className="text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
```

## Where to Insert
In `app/merged/page.tsx`, find the Keyword Cannibalization section (around line 450). After its closing `</Card>` tag and before the closing `</div>` of the space-y-6 container, insert all the missing sections.

## Easiest Approach
1. Open both files side-by-side in your editor
2. Copy lines 1173-1850 from `app/site-analysis/page.tsx`
3. Paste after line 485 in `app/merged/page.tsx` (after Keyword Cannibalization)
4. Add the missing imports at the top
5. Add the InfoTooltip component
6. Save and test

## Alternative: Use the Deep Crawler Structure
Since the deep crawler already has everything, you could:
1. Copy `app/site-analysis/page.tsx` to `app/merged/page-new.tsx`
2. Modify the header section to add the Quick/Deep scan toggle
3. Change the API call from multi-page-crawler to analyze-site
4. Replace the old merged page

This ensures you don't miss anything and get all 18 sections.
