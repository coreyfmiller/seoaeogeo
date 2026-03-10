# Test Snapshot System - Quick Reference

## What It Does

Stores crawl data and AI responses locally so you can:
- ✅ Verify deterministic scores are consistent
- ✅ Test prompt changes without re-crawling
- ✅ Debug scoring issues by replaying exact conditions
- ✅ Track token usage over time
- ✅ Compare results before/after code changes

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Capture a Snapshot

1. Go to `/site-analysis` (Deep Crawler page)
2. Enter a URL
3. ✅ Check "Save test snapshot (for variance testing)"
4. Click "Analyze Site"
5. Snapshot saved to `test-data/` directory

### 3. Analyze Variance

```bash
npm run test:variance
```

Shows if deterministic scores are consistent across multiple runs.

### 4. Replay a Snapshot

```bash
npm run replay
```

Lists available snapshots. Then:

```bash
npm run replay 1              # Replay first snapshot
npm run replay filename.json  # Replay specific file
```

Re-runs current validation logic on saved data to detect if code changes affected scoring.

## Files Created

```
lib/
  └── test-data-store.ts          # Core storage functions
scripts/
  ├── test-variance.ts            # Compare multiple snapshots
  └── replay-snapshot.ts          # Re-run validation on saved data
test-data/                        # Snapshots stored here (gitignored)
  └── YYYY-MM-DD_HH-MM-SS_domain_type.json
TEST_SNAPSHOTS.md                 # Full documentation
TESTING_EXAMPLE.md                # Usage examples
```

## Common Workflows

### Verify Determinism

1. Run same URL twice with snapshot enabled
2. `npm run test:variance`
3. Confirm scores are identical

### Test Prompt Changes

1. Capture baseline snapshot
2. Modify `lib/gemini-sitewide.ts` prompt
3. `npm run replay 1`
4. Compare old vs new scores

### Debug Score Drop

1. Load historical snapshot when score was good
2. Run fresh scan with snapshot
3. `npm run test:variance`
4. Compare crawl data to see what changed

### Track Token Usage

1. Run snapshots over time
2. `npm run test:variance`
3. Review token counts in output

## What Gets Saved

Each snapshot contains:

```typescript
{
  timestamp: "2026-03-09T14:30:45.123Z",
  url: "fundylogic.com",
  type: "deep-site",
  crawlData: {
    pages: [...],           // Full page data
    totalWords: 12450,
    schemaCount: 15,
    avgResponseTime: 850,
    pagesCrawled: 20
  },
  aiResponses: {
    raw: "...",            // Raw Gemini response
    parsed: {...},         // Parsed JSON
    model: "gemini-2.5-flash",
    inputTokens: 12450,
    outputTokens: 3200
  },
  scores: {
    deterministic: {
      schemaQuality: 85,
      brandConsistency: 92,
      schemaValidation: {...},
      brandBreakdown: {...}
    },
    final: {...}           // Complete merged result
  }
}
```

## Expected Results

### ✅ Deterministic Scores Should Match

If you run the same URL twice:
- Schema Quality: **Identical**
- Brand Consistency: **Identical**

These are calculated by `lib/schema-validator.ts`, not AI.

### ⚠️ AI Insights May Vary

Gemini's recommendations and verdicts may differ slightly between runs. This is expected and acceptable.

### ❌ Large Variance = Problem

If deterministic scores vary >5 points:
- Site content changed between scans
- Validation logic was modified
- Crawler bug (extracted different data)

## Tips

- Snapshots are ~50-200KB each
- Not committed to git (in `.gitignore`)
- Delete old snapshots manually from `test-data/`
- Use descriptive URLs for easy identification
- Run variance tests after any scoring logic changes

## Integration with Development

```typescript
// In your test files
import { loadTestSnapshot, getLatestSnapshot } from '@/lib/test-data-store';

// Load specific snapshot
const snapshot = loadTestSnapshot('2026-03-09_14-30-45_fundylogic_deep-site.json');

// Get latest for a domain
const latest = getLatestSnapshot('fundylogic.com', 'deep-site');

// Re-run validation
import { validateSchemas } from '@/lib/schema-validator';
const result = validateSchemas(snapshot.crawlData.pages[0].schemas);
```

## Questions?

See full documentation:
- `TEST_SNAPSHOTS.md` - Complete system documentation
- `TESTING_EXAMPLE.md` - Detailed usage examples
