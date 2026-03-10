# Test Snapshot System Flow

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                     /site-analysis page                          │
│                                                                   │
│  [URL Input: fundylogic.com]                                    │
│  ☑ Save test snapshot (for variance testing)                    │
│  [Analyze Site Button]                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE                                     │
│              /api/analyze-site/route.ts                          │
│                                                                   │
│  1. Receive: { url, maxPages, saveSnapshot: true }              │
│  2. Call: performDeepScan(url, maxPages)                        │
│  3. Call: analyzeSitewideIntelligence(crawlData)                │
│  4. If saveSnapshot: saveTestSnapshot(...)                      │
│  5. Return: Complete analysis result                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CRAWLER (Playwright)                           │
│                lib/crawler-deep.ts                               │
│                                                                   │
│  • Launches headless browser                                    │
│  • Crawls up to 20 pages                                        │
│  • Extracts: titles, descriptions, schemas, word counts, etc.   │
│  • Returns: { pages: [...], domain, pagesCrawled }             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              DETERMINISTIC VALIDATION                            │
│              lib/schema-validator.ts                             │
│                                                                   │
│  validateSchemas(pages):                                        │
│    • Check required properties                                  │
│    • Detect placeholder data                                    │
│    • Validate formats                                           │
│    • Return: { score, issues, strengths }                       │
│                                                                   │
│  calculateBrandConsistency(pages):                              │
│    • Schema name consistency (40%)                              │
│    • Title term consistency (30%)                               │
│    • Description consistency (30%)                              │
│    • Return: { score, breakdown }                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AI ANALYSIS (Gemini)                           │
│              lib/gemini-sitewide.ts                              │
│                                                                   │
│  • Receives: crawl data + deterministic scores                  │
│  • Generates: insights, recommendations, verdicts               │
│  • Returns: merged result with _metadata (tokens)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SNAPSHOT STORAGE                                │
│              lib/test-data-store.ts                              │
│                                                                   │
│  saveTestSnapshot({                                             │
│    timestamp: "2026-03-09T14:30:45.123Z",                       │
│    url: "fundylogic.com",                                       │
│    type: "deep-site",                                           │
│    crawlData: { pages, totalWords, ... },                       │
│    aiResponses: { raw, parsed, tokens },                        │
│    scores: { deterministic, final }                             │
│  })                                                             │
│                                                                   │
│  Saves to: test-data/YYYY-MM-DD_HH-MM-SS_domain_type.json      │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Workflows

### Workflow 1: Verify Determinism

```
┌──────────────┐
│ Run Scan #1  │  → Snapshot A saved
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Run Scan #2  │  → Snapshot B saved
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ npm run test:variance│
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Compare Snapshots A & B:            │
│  ✅ Schema scores match?            │
│  ✅ Brand scores match?             │
│  ⚠️  AI responses differ? (OK)      │
└─────────────────────────────────────┘
```

### Workflow 2: Test Prompt Changes

```
┌──────────────┐
│ Run Scan     │  → Baseline snapshot saved
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Modify Gemini Prompt │  (edit lib/gemini-sitewide.ts)
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│ npm run replay│  → Re-run validation on saved data
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Compare:                            │
│  • Old score: 85%                   │
│  • New score: 78%                   │
│  • Diff: -7% ⚠️                     │
│  • New issues: [...]                │
└─────────────────────────────────────┘
```

### Workflow 3: Debug Score Drop

```
┌──────────────────────┐
│ User Reports:        │
│ "Score dropped from  │
│  90% to 60%!"        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Load Historical      │  → Snapshot from when score was 90%
│ Snapshot             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Run Fresh Scan       │  → New snapshot with 60% score
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ npm run test:variance│
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Analysis Shows:                     │
│  • Crawl data changed: YES          │
│  • New issues:                      │
│    - Missing "address" property     │
│    - Placeholder data detected      │
│  • Root cause: User added           │
│    placeholder schema to new pages  │
└─────────────────────────────────────┘
```

## Key Components

### Storage Layer
- **Location**: `test-data/` directory (gitignored)
- **Format**: JSON files with timestamp + domain naming
- **Size**: ~50-200KB per snapshot
- **Retention**: Manual cleanup (no auto-deletion)

### Validation Layer
- **Schema Validator**: Deterministic, rule-based
- **Brand Calculator**: Deterministic, statistical
- **AI Analysis**: Non-deterministic, qualitative

### Analysis Tools
- **test-variance.ts**: Compare multiple snapshots
- **replay-snapshot.ts**: Re-run validation on saved data
- **test-data-store.ts**: Core storage functions

## Benefits

1. **Fast Iteration**: Test changes without re-crawling (saves 60-90 seconds per test)
2. **Reproducible**: Replay exact conditions that caused issues
3. **Confidence**: Prove deterministic scores are truly deterministic
4. **Cost Tracking**: Monitor Gemini token usage over time
5. **Regression Prevention**: Catch scoring changes before deployment

## Limitations

- Snapshots don't include live site changes (use for code testing only)
- AI responses will always differ slightly (temperature > 0)
- Manual cleanup required for old snapshots
- Requires disk space (~1MB per 10 snapshots)
