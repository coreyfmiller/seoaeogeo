---
inclusion: auto
---

# Scoring Consistency Rule

Every route or function that produces SEO, AEO, or GEO scores MUST use the same scan preparation pipeline. The canonical pipeline is:

1. `performScan(url)` — crawl the page (lightweight flag is OK for Arena/batch)
2. `detectSiteType(scan)` → set `scan.siteType`
3. **Schema quality** — check `scan.schemas` and set `scan.schemaQuality` with `{ hasSchema, score, issues }`
4. **Semantic flags** — set `scan.semanticFlags` based on word count thresholds (see analyze-v4 route for reference)
5. `calculateScoresFromScanResult(scan)` — heuristic grading

If any of these steps are skipped, scores will be inflated or inconsistent across products (Pro Audit, Keyword Arena, Competitive Intel, etc.).

The ideal fix is to extract steps 2-4 into a shared `prepareScanForGrading(scan)` function in a shared lib file so no route can accidentally skip them.

When adding new routes that score sites, always check that the full pipeline is used. Never call `calculateScoresFromScanResult` without first setting `schemaQuality` and `semanticFlags` on the scan result.
