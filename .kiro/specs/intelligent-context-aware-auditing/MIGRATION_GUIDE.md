# Migration Guide - Intelligent Context-Aware Auditing System

## Overview

This guide helps you migrate from the basic single-page audit system to the new intelligent context-aware multi-page auditing system.

## What's New

### Major Features
- ✨ Multi-page crawling (1, 10, 20, or 50 pages)
- 🎯 Intelligent site type detection
- 🔍 Competitor gap analysis
- 📊 ROI-based priority scoring
- 🛠️ Platform-specific fix instructions with code
- 📈 Site-wide issue aggregation
- 🔗 Link graph analysis and orphan detection
- 💾 Intelligent caching system

### Breaking Changes
**None!** The new system is 100% backward compatible. Existing single-page audits continue to work exactly as before.

---

## Migration Steps

### Step 1: Update Dependencies (if needed)

No new dependencies required! The system uses existing packages.

### Step 2: Understand New Data Structures

#### Old Structure (Single Page)
```typescript
{
  url: string;
  seoScore: number;
  aeoScore: number;
  geoScore: number;
  issues: Issue[];
  recommendations: Recommendation[];
}
```

#### New Structure (Multi-Page)
```typescript
{
  // All old fields still present
  url: string;
  seoScore: number;
  aeoScore: number;
  geoScore: number;
  issues: Issue[];
  recommendations: PriorityRecommendation[]; // Enhanced with ROI
  
  // New fields
  pagesCrawled: number;
  pages: PageScan[]; // Array of all crawled pages
  siteType?: SiteTypeResult;
  siteWideIssues?: SiteWideIssue[];
  linkGraph?: LinkGraph;
  orphanPages?: string[];
  duplicateContent?: DuplicateGroup[];
  competitorAnalysis?: GapAnalysis;
}
```

### Step 3: Update API Calls

#### Before (Single Page)
```typescript
const response = await fetch('/api/analyze-site', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com' })
});
```

#### After (Multi-Page)
```typescript
const response = await fetch('/api/analyze-site', {
  method: 'POST',
  body: JSON.stringify({ 
    url: 'https://example.com',
    maxPages: 20, // NEW: Optional, defaults to 1
    competitorUrls: ['https://competitor.com'], // NEW: Optional
    respectRobotsTxt: true // NEW: Optional, defaults to true
  })
});
```

**Backward Compatibility:** If you don't specify `maxPages`, it defaults to 1 (single-page mode).

### Step 4: Update UI Components

#### Conditional Rendering

The new UI components only render when appropriate data is available:

```typescript
// Old: Always show recommendations
{recommendations.map(rec => <RecommendationCard {...rec} />)}

// New: Show enhanced components when data available
{recommendations.map(rec => (
  <FixInstructionCard
    {...rec}
    // New props are optional and have defaults
  />
))}

// Multi-page components (only show when pagesCrawled > 1)
{pagesCrawled > 1 && (
  <>
    <MultiPageDashboard {...data} />
    <PageComparisonTable pages={pages} />
  </>
)}
```

#### Site Type Badge

```typescript
// Add site type indicator (optional)
{siteType && (
  <SiteTypeBadge
    siteType={siteType}
    onManualSelect={(type) => {
      // Handle manual override
    }}
  />
)}
```

---

## Feature-by-Feature Migration

### 1. Multi-Page Crawling

**Before:** Only homepage analyzed
```typescript
const result = await analyzeSite('https://example.com');
// Returns: Single page data
```

**After:** Analyze multiple pages
```typescript
const result = await analyzeSite('https://example.com', { maxPages: 20 });
// Returns: Multi-page data with site-wide insights
```

**Migration Tip:** Start with `maxPages: 10` to test, then increase to 20 or 50.

### 2. Site Type Detection

**Before:** No site type detection
```typescript
// Recommendations were generic
```

**After:** Context-aware recommendations
```typescript
// Site type automatically detected
const { siteType } = result;
// Recommendations tailored to site type

// Manual override if needed
if (siteType.confidence < 70) {
  // Show manual selection UI
}
```

**Migration Tip:** Use the `SiteTypeBadge` component for automatic UI handling.

### 3. Priority Scoring

**Before:** Recommendations in arbitrary order
```typescript
recommendations.forEach(rec => {
  // No priority information
});
```

**After:** ROI-based prioritization
```typescript
recommendations.forEach(rec => {
  console.log(`${rec.title}: ROI=${rec.roi}, Category=${rec.category}`);
  // rec.impact: 1-10
  // rec.effort: 1-10
  // rec.roi: impact / effort
  // rec.category: 'Quick Win' | 'High Priority' | etc.
});
```

**Migration Tip:** Use the `PriorityMatrix` component to visualize effort vs impact.

### 4. Fix Instructions

**Before:** Generic text recommendations
```typescript
{
  title: "Add schema markup",
  description: "Your site needs schema markup"
}
```

**After:** Platform-specific code and steps
```typescript
{
  title: "Add LocalBusiness Schema",
  description: "Detailed explanation...",
  platform: "wordpress", // Detected automatically
  steps: [
    { step: 1, title: "...", description: "...", code: "..." }
  ],
  code: "<script type=\"application/ld+json\">...</script>",
  estimatedTime: "15 minutes",
  difficulty: "easy",
  validationLinks: [
    { tool: "Google Rich Results Test", url: "..." }
  ]
}
```

**Migration Tip:** Use the `FixInstructionCard` component for rich display.

### 5. Competitor Analysis

**Before:** Not available
```typescript
// No competitor comparison
```

**After:** Gap analysis with competitors
```typescript
const result = await analyzeSite('https://example.com', {
  maxPages: 20,
  competitorUrls: [
    'https://competitor1.com',
    'https://competitor2.com'
  ]
});

// Access gap analysis
const { competitorAnalysis } = result;
console.log('Schema gaps:', competitorAnalysis.schemaGaps);
console.log('Quick wins:', competitorAnalysis.quickWins);
console.log('Your strengths:', competitorAnalysis.yourStrengths);
```

**Migration Tip:** Use the `CompetitorGapView` component for visualization.

---

## Code Examples

### Example 1: Minimal Migration (Single Page)

No changes needed! Existing code continues to work:

```typescript
// This still works exactly as before
const result = await fetch('/api/analyze-site', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com' })
});
```

### Example 2: Opt-in to Multi-Page

Add one parameter to enable multi-page:

```typescript
// Just add maxPages
const result = await fetch('/api/analyze-site', {
  method: 'POST',
  body: JSON.stringify({ 
    url: 'https://example.com',
    maxPages: 20 // Enable multi-page
  })
});
```

### Example 3: Full Feature Adoption

Use all new features:

```typescript
// 1. Configure crawl
const config = {
  url: 'https://example.com',
  maxPages: 20,
  competitorUrls: ['https://competitor.com'],
  respectRobotsTxt: true
};

// 2. Run analysis
const result = await fetch('/api/analyze-site', {
  method: 'POST',
  body: JSON.stringify(config)
});

const data = await result.json();

// 3. Use new data
if (data.siteType) {
  console.log('Site type:', data.siteType.primaryType);
}

if (data.pagesCrawled > 1) {
  console.log('Multi-page data available');
  console.log('Site-wide issues:', data.siteWideIssues);
  console.log('Orphan pages:', data.orphanPages);
}

if (data.competitorAnalysis) {
  console.log('Gaps found:', data.competitorAnalysis.schemaGaps.length);
}

// 4. Display with new components
<>
  {data.siteType && <SiteTypeBadge siteType={data.siteType} />}
  {data.pagesCrawled > 1 && <MultiPageDashboard {...data} />}
  {data.competitorAnalysis && <CompetitorGapView {...data.competitorAnalysis} />}
  <PriorityMatrix recommendations={data.recommendations} />
</>
```

---

## UI Component Migration

### Old Recommendation Display

```typescript
// Before
<div className="recommendations">
  {recommendations.map(rec => (
    <div key={rec.id} className="card">
      <h3>{rec.title}</h3>
      <p>{rec.description}</p>
    </div>
  ))}
</div>
```

### New Enhanced Display

```typescript
// After
<div className="recommendations">
  {/* Priority Matrix */}
  <PriorityMatrix recommendations={recommendations} />
  
  {/* Detailed Cards */}
  {recommendations.map(rec => (
    <FixInstructionCard
      key={rec.id}
      title={rec.title}
      category={rec.category}
      priority={rec.priority}
      steps={rec.steps}
      code={rec.code}
      platform={rec.platform}
      estimatedTime={rec.estimatedTime}
      difficulty={rec.difficulty}
      impact={rec.impact}
      affectedPages={rec.affectedPages}
      validationLinks={rec.validationLinks}
      onMarkComplete={() => handleComplete(rec.id)}
    />
  ))}
</div>
```

---

## Performance Considerations

### Crawl Times

- **Single page**: ~5-10 seconds (unchanged)
- **10 pages**: ~30-60 seconds
- **20 pages**: ~60-90 seconds
- **50 pages**: ~120-180 seconds

### Caching

The new system includes intelligent caching:

```typescript
// Automatic caching (24-hour TTL)
const result1 = await analyzeSite(url); // Crawls site
const result2 = await analyzeSite(url); // Uses cache

// Force fresh crawl
const cache = PageCache.getInstance();
cache.delete(url);
const result3 = await analyzeSite(url); // Crawls again
```

### API Usage

Multi-page crawls use more API calls:
- Single page: 1-2 Gemini API calls
- 20 pages: 5-10 Gemini API calls (batched)

**Tip:** Use caching to reduce API usage for repeated analyses.

---

## Testing Your Migration

### 1. Test Single-Page Mode

Verify backward compatibility:

```typescript
// Should work exactly as before
const result = await analyzeSite('https://example.com');
expect(result.seoScore).toBeDefined();
expect(result.recommendations).toBeDefined();
```

### 2. Test Multi-Page Mode

Verify new features:

```typescript
const result = await analyzeSite('https://example.com', { maxPages: 10 });
expect(result.pagesCrawled).toBe(10);
expect(result.pages).toHaveLength(10);
expect(result.siteWideIssues).toBeDefined();
```

### 3. Test UI Components

Verify conditional rendering:

```typescript
// Single page: Old UI
render(<Results data={singlePageData} />);
expect(screen.queryByText('Multi-Page Dashboard')).not.toBeInTheDocument();

// Multi-page: New UI
render(<Results data={multiPageData} />);
expect(screen.getByText('Multi-Page Dashboard')).toBeInTheDocument();
```

---

## Rollback Plan

If you need to rollback:

1. **API Level:** Simply don't pass `maxPages` parameter
2. **UI Level:** Remove new components, keep old ones
3. **Data Level:** Old data structure is still present in response

```typescript
// Rollback: Use only old fields
const { url, seoScore, aeoScore, geoScore, issues, recommendations } = result;
// Ignore: pagesCrawled, pages, siteType, siteWideIssues, etc.
```

---

## Common Migration Issues

### Issue: "Too many pages crawled"
**Solution:** Reduce `maxPages` or implement pagination in UI

### Issue: "Crawl takes too long"
**Solution:** Start with `maxPages: 10`, increase gradually

### Issue: "Site type detection wrong"
**Solution:** Use manual override UI (`SiteTypeBadge` component)

### Issue: "Recommendations changed"
**Solution:** New ROI-based prioritization may reorder recommendations

### Issue: "UI components not showing"
**Solution:** Check conditional rendering logic and data availability

---

## Support

For migration help:
1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Review the [Troubleshooting Guide](./TROUBLESHOOTING.md)
3. See [Usage Examples](./API_DOCUMENTATION.md#usage-examples)
4. Report issues with migration details

---

## Timeline Recommendation

**Week 1:** Test in development
- Enable multi-page for test sites
- Verify backward compatibility
- Test new UI components

**Week 2:** Gradual rollout
- Enable for 10% of users
- Monitor performance and errors
- Collect feedback

**Week 3:** Full deployment
- Enable for all users
- Promote new features
- Provide user documentation

---

## Checklist

- [ ] Tested single-page mode (backward compatibility)
- [ ] Tested multi-page mode with 10 pages
- [ ] Tested multi-page mode with 20 pages
- [ ] Tested site type detection
- [ ] Tested competitor analysis
- [ ] Tested new UI components
- [ ] Verified performance targets
- [ ] Updated user documentation
- [ ] Trained support team
- [ ] Prepared rollback plan
- [ ] Monitored error rates
- [ ] Collected user feedback

---

## Next Steps

After successful migration:
1. Monitor crawl performance
2. Collect user feedback on recommendations
3. Refine site type detection based on real data
4. Optimize priority scoring weights
5. Add more platform-specific fix templates
6. Expand competitor analysis features
