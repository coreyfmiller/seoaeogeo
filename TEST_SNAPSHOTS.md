# Test Snapshot System

This system stores crawl data and AI responses locally for variance testing and debugging.

## How It Works

1. **Enable Snapshot Saving**: Check the "Save test snapshot" checkbox on the Deep Crawler page
2. **Run a Scan**: Perform a normal deep site audit
3. **Data Saved**: Crawl data, AI responses, and scores are saved to `test-data/` directory
4. **Analyze Variance**: Run the variance analysis script to compare snapshots

## File Structure

```
test-data/
  └── YYYY-MM-DD_HH-MM-SS_domain_deep-site.json
```

Each snapshot contains:
- **crawlData**: Raw page data from Playwright crawler
- **aiResponses**: Raw and parsed Gemini responses with token counts
- **scores**: Deterministic scores (schema quality, brand consistency) and final merged scores

## Usage

### 1. Capture Test Data

On the Deep Crawler page:
1. Enter a URL
2. ✅ Check "Save test snapshot (for variance testing)"
3. Click "Analyze Site"
4. Snapshot saved to `test-data/` directory

### 2. Run Multiple Scans

To test variance:
1. Run the same URL multiple times with snapshot enabled
2. Each scan creates a new timestamped snapshot
3. Compare to detect scoring inconsistencies

### 3. Analyze Variance

Run the analysis script:

```bash
npx tsx scripts/test-variance.ts
```

This will:
- List all snapshots grouped by domain
- Calculate variance in deterministic scores
- Show if scores are consistent across runs
- Compare AI response differences

### 4. Manual Inspection

Load a snapshot in your code:

```typescript
import { loadTestSnapshot, getLatestSnapshot } from '@/lib/test-data-store';

// Load specific snapshot
const snapshot = loadTestSnapshot('2026-03-09_12-30-45_fundylogic_deep-site.json');

// Get latest for a domain
const latest = getLatestSnapshot('fundylogic.com', 'deep-site');

// Access data
console.log('Schema Quality:', snapshot.scores.deterministic.schemaQuality);
console.log('Brand Consistency:', snapshot.scores.deterministic.brandConsistency);
console.log('AI Response:', snapshot.aiResponses.parsed);
```

## What to Test

### ✅ Expected: Deterministic Scores Should Be Identical

If you run the same URL twice:
- Schema Quality score should be **exactly the same**
- Brand Consistency score should be **exactly the same**
- These are calculated deterministically, not by AI

### ⚠️ Expected: AI Insights May Vary Slightly

Gemini's qualitative analysis (recommendations, insights, verdicts) may vary slightly between runs due to:
- Temperature setting (currently 0.1, very low but not zero)
- Non-deterministic nature of LLMs

### ❌ Unexpected: Large Score Variance

If deterministic scores vary significantly (>5 points):
- Check if crawl data is identical between runs
- Verify validation logic hasn't changed
- Investigate if site content changed between scans

## Debugging Workflow

1. **Capture baseline**: Run scan with snapshot enabled
2. **Make changes**: Modify validation logic or prompts
3. **Capture comparison**: Run same URL again with snapshot
4. **Analyze**: Run `test-variance.ts` to see differences
5. **Investigate**: Load snapshots manually to debug specific issues

## Benefits

- **Catch regressions**: Detect when code changes affect scoring
- **Test prompt changes**: Compare AI responses before/after prompt modifications
- **Debug scoring issues**: Replay problematic scans without re-crawling
- **Verify determinism**: Prove that deterministic scores are truly deterministic
- **Token tracking**: Monitor API usage across different prompt versions

## Notes

- Snapshots are **not committed to git** (in .gitignore)
- Each snapshot is ~50-200KB depending on site size
- Old snapshots can be manually deleted from `test-data/`
- Snapshots include full page content (titles, descriptions, schemas, etc.)
