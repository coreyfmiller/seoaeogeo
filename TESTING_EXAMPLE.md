# Testing Example: Verifying Deterministic Scoring

## Scenario: Prove Schema Quality Scores Are Consistent

Let's verify that our deterministic schema validator produces identical scores on identical data.

### Step 1: Capture First Snapshot

1. Go to Deep Crawler page (`/site-analysis`)
2. Enter URL: `fundylogic.com`
3. ✅ Check "Save test snapshot (for variance testing)"
4. Click "Analyze Site"
5. Wait for scan to complete
6. Note the Schema Quality score (e.g., 85%)

### Step 2: Capture Second Snapshot

1. **Without changing anything on the site**, run the same scan again
2. Enter URL: `fundylogic.com`
3. ✅ Check "Save test snapshot (for variance testing)"
4. Click "Analyze Site"
5. Note the Schema Quality score

### Step 3: Analyze Variance

Run the variance analysis:

```bash
npm run test:variance
```

Expected output:

```
=== Test Snapshot Variance Analysis ===

Found 2 snapshot(s):

📊 Domain: fundylogic_com
   Snapshots: 2

   📈 Deterministic Score Variance:
      Schema Quality: ✅ CONSISTENT
      Brand Consistency: ✅ CONSISTENT

   📋 Individual Scores:
      1. 3/9/2026, 2:30:45 PM
         Schema: 85%
         Brand: 92%
         Tokens: 12450 in / 3200 out
      2. 3/9/2026, 2:35:12 PM
         Schema: 85%
         Brand: 92%
         Tokens: 12450 in / 3210 out

   🔍 Detailed Comparison (First 2 Snapshots):
      Same Input Data: ✅ YES
      Schema Scores Match: ✅ YES
      Brand Scores Match: ✅ YES
      AI Responses Differ: ⚠️  YES (expected)

────────────────────────────────────────────────────────────

✅ Analysis complete
```

### What This Proves

✅ **Deterministic scores are truly deterministic** - Schema Quality and Brand Consistency produce identical scores on identical data

⚠️ **AI insights may vary slightly** - Gemini's recommendations and verdicts might differ slightly (this is expected and acceptable)

## Scenario: Testing Prompt Changes

Let's say you want to modify the Gemini prompt to be more strict about schema validation.

### Step 1: Capture Baseline

1. Run a scan with snapshot enabled
2. Note the scores and recommendations

### Step 2: Modify Prompt

Edit `lib/gemini-sitewide.ts`:

```typescript
// Add stricter validation rules
const prompt = `
  ...existing prompt...
  
  ADDITIONAL RULE: Penalize any schema missing "image" property by 10 points.
`;
```

### Step 3: Test on Same Data

Instead of re-crawling (which takes time), you can:

```typescript
// Create a test script
import { loadTestSnapshot } from '@/lib/test-data-store';
import { analyzeSitewideIntelligence } from '@/lib/gemini-sitewide';

const snapshot = loadTestSnapshot('2026-03-09_14-30-45_fundylogic_deep-site.json');

// Re-run AI analysis with new prompt
const newResult = await analyzeSitewideIntelligence({
  domain: snapshot.crawlData.pages[0].url,
  pages: snapshot.crawlData.pages
});

console.log('Old Schema Score:', snapshot.scores.deterministic.schemaQuality);
console.log('New Schema Score:', newResult.schemaHealthAudit.overallScore);
```

### Step 4: Compare Results

- Did the stricter rule affect the score as expected?
- Are the recommendations more actionable?
- Did token usage change significantly?

## Scenario: Debugging Score Drop

User reports: "My schema score dropped from 90% to 60% but I didn't change anything!"

### Step 1: Load Historical Snapshot

```typescript
import { listTestSnapshots, loadTestSnapshot } from '@/lib/test-data-store';

// Find snapshots for this domain
const snapshots = listTestSnapshots().filter(f => f.includes('fundylogic'));

// Load the one from when score was 90%
const goodSnapshot = loadTestSnapshot(snapshots[0]);
console.log('Good score:', goodSnapshot.scores.deterministic.schemaQuality);
console.log('Issues:', goodSnapshot.scores.deterministic.schemaValidation.issues);
```

### Step 2: Run Fresh Scan with Snapshot

1. Run new scan with snapshot enabled
2. Load the new snapshot

### Step 3: Compare

```typescript
const newSnapshot = loadTestSnapshot(snapshots[1]);

// Compare crawl data
const oldSchemas = goodSnapshot.crawlData.pages.map(p => p.schemas);
const newSchemas = newSnapshot.crawlData.pages.map(p => p.schemas);

// Did the site content actually change?
console.log('Schemas changed:', JSON.stringify(oldSchemas) !== JSON.stringify(newSchemas));

// What new issues appeared?
const oldIssues = goodSnapshot.scores.deterministic.schemaValidation.issues;
const newIssues = newSnapshot.scores.deterministic.schemaValidation.issues;

console.log('New issues:', newIssues.filter(i => 
  !oldIssues.some(old => old.message === i.message)
));
```

### Step 4: Root Cause

You'll discover either:
- ✅ Site content actually changed (user added placeholder data)
- ❌ Validation logic changed (regression in code)
- ❌ Crawler extracted different data (crawler bug)

## Benefits of This System

1. **Fast iteration** - Test prompt changes without re-crawling
2. **Reproducible bugs** - Replay exact conditions that caused issues
3. **Regression testing** - Verify code changes don't break scoring
4. **Performance tracking** - Monitor token usage over time
5. **Confidence** - Prove deterministic scores are truly deterministic
