# Scoring Standardization - Hybrid Approach

## Overview

Both Pro Dashboard and Deep Crawler now use **consistent scoring methodology** with Grader V2 while preserving unique insights from each analysis type.

## Implementation

### Option 3: Hybrid Approach ✅

**What We Did:**
1. Run Grader V2 on each page individually
2. Aggregate per-page scores using weighted average
3. Keep AI site-wide insights (recommendations, patterns)
4. Standardize output format across both APIs
5. Add data validation to deep crawler

## Standardized Output Format

Both `/api/analyze` and `/api/analyze-site` now return:

```typescript
{
  success: true,
  data: {
    // ... scan data ...
    ai: {
      scores: {
        seo: number,  // 0-100
        aeo: number,  // 0-100
        geo: number   // 0-100
      },
      // ... other AI insights ...
    }
  }
}
```

## Deep Crawler Enhancements

### 1. Per-Page Scoring (`lib/grader-aggregator.ts`)

- Runs Grader V2 on each crawled page
- Returns per-page scores for comparison table
- Includes breakdown and critical issues per page

### 2. Score Aggregation

**Weighted Average (Primary):**
- Homepage gets 2x weight
- Other pages get 1x weight
- Formula: `(homepage * 2 + sum(others)) / (2 + count(others))`

**Also Calculated:**
- Simple average
- Median
- Min/Max range

### 3. Data Validation

- Uses same `validateAnalysisData()` as Pro Dashboard
- Ensures AI returns complete data structure
- Prevents crashes from malformed responses

### 4. Preserved AI Insights

Deep crawler still provides:
- `recommendations` - Prioritized site improvements
- `orphanPageRisks` - Pages with no internal links
- `topicalClusters` - Content organization
- `schemaHealthAudit` - Structured data quality
- `brandConsistencyBreakdown` - Brand cohesion analysis

Original AI scores preserved in `_originalScores`:
- `domainHealthScore`
- `consistencyScore`
- `aeoReadinessScore`

## Benefits

### Consistency
✅ Both dashboards use same scoring foundation (Grader V2)
✅ Transparent, component-based scoring
✅ Predictable score ranges (not overly lenient)

### Accuracy
✅ Per-page technical scores
✅ Proper aggregation for multi-page sites
✅ Data validation prevents crashes

### Insights
✅ AI provides site-wide patterns
✅ Recommendations based on full domain analysis
✅ Per-page breakdown available

## Score Comparison

### Pro Dashboard (`/api/analyze`)
- **Input:** Single page
- **Grader V2:** Runs once on that page
- **Output:** `ai.scores.seo/aeo/geo`

### Deep Crawler (`/api/analyze-site`)
- **Input:** Multiple pages (up to 10)
- **Grader V2:** Runs on each page, then aggregates
- **Output:** `ai.scores.seo/aeo/geo` (aggregated)
- **Bonus:** Per-page scores in `pages[].graderScores`

## Migration Notes

### Frontend Changes Needed

If your frontend was using:
```typescript
// OLD (Deep Crawler)
ai.domainHealthScore
ai.consistencyScore
ai.aeoReadiness.overallScore
```

Update to:
```typescript
// NEW (Standardized)
ai.scores.seo
ai.scores.aeo
ai.scores.geo

// Original scores still available at:
ai._originalScores.domainHealthScore
ai._originalScores.consistencyScore
ai._originalScores.aeoReadinessScore
```

### Backwards Compatibility

The deep crawler still returns original AI scores in `_originalScores` for reference, but the standardized `ai.scores` should be used for display.

## Testing

Run a deep scan and verify:
1. ✅ `ai.scores.seo/aeo/geo` exists
2. ✅ Per-page scores in `pages[].graderScores`
3. ✅ Aggregation metadata in `ai._graderMetadata`
4. ✅ Original AI insights preserved
5. ✅ Data validation passes

## Future Enhancements

- [ ] Implement AEO scoring in Grader V2 (currently placeholder at 50)
- [ ] Implement GEO scoring in Grader V2 (currently placeholder at 50)
- [ ] Add site-type specific scoring adjustments
- [ ] Consider different aggregation strategies (median, best-page, etc.)
