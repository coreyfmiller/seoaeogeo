# Rollback Instructions

## If Consolidation Fails

This document explains how to rollback to the stable state before the scoring system consolidation.

### Current Stable State (v1.0-pre-consolidation)
- **Commit**: 16120de
- **Tag**: v1.0-pre-consolidation
- **Date**: 2026-03-10
- **Status**: 
  - Free Scan: Uses `/api/analyze-site` with maxPages=1 (deep crawler)
  - Pro Dashboard: Uses `/api/analyze` (old single-page system)
  - Deep Crawler: Uses `/api/analyze-site` with maxPages=10-20

### How to Rollback

#### Option 1: Revert to Tagged Version (Recommended)
```bash
git fetch --all --tags
git checkout v1.0-pre-consolidation
git checkout -b rollback-branch
git push origin rollback-branch
```

Then deploy the `rollback-branch` to production.

#### Option 2: Hard Reset (Use with Caution)
```bash
git reset --hard v1.0-pre-consolidation
git push origin main --force
```

⚠️ **WARNING**: This will delete all commits after the checkpoint!

#### Option 3: Revert Specific Commits
```bash
# List commits after checkpoint
git log v1.0-pre-consolidation..HEAD

# Revert specific commits (replace COMMIT_HASH)
git revert COMMIT_HASH
git push origin main
```

### Verification After Rollback

Test these URLs to confirm rollback worked:
1. Free Scan (`/free`): Should work with deep crawler
2. Pro Dashboard (`/`): Should work with old system
3. Deep Crawler (`/site-analysis`): Should work normally

### Files Modified During Consolidation

If you need to manually restore specific files:
- `app/page.tsx` - Pro Dashboard (main change)
- `lib/gemini-sitewide.ts` - AI analysis (if enhanced)
- `app/api/analyze/route.ts` - Old API (if deprecated)

### Contact
If rollback fails, check git history:
```bash
git log --oneline --graph --all
```

### Current System Architecture (Pre-Consolidation)

**APIs:**
- `/api/analyze` - Single page, uses grader.ts scoring
- `/api/analyze-site` - Multi-page, uses AI scoring

**Crawlers:**
- `lib/crawler.ts` - Single page Playwright
- `lib/crawler-deep.ts` - Multi-page parallel

**Scoring:**
- `lib/grader.ts` - Deterministic penalties
- `lib/gemini-sitewide.ts` - AI-generated scores

**AI Analysis:**
- `lib/gemini.ts` - Single page recommendations
- `lib/gemini-sitewide.ts` - Site-wide analysis
