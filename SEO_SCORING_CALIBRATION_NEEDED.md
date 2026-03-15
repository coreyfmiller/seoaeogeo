# SEO Scoring Calibration Issue

## Problem
PizzaTwice (10-year-old abandoned Yellow Pages site, 282 words) scores **70-82 SEO**, which is too high.

## Current Breakdown for PizzaTwice

### Foundation: 33/40 (83%)
- ✓ Title: 10/10
- ✓ Meta: 8/8
- ✓ H1: 8/8
- ✓ HTTPS: 7/7
- ✗ Viewport: 0/7

### Content Quality: 27/42 (64%)
- ✗ Word Count: 0/15 (282 words)
- ✓ Readability: 7/7
- ✓ Internal Links: 8/10
- ⚠ Images: 5/10 (58% alt text)

### Technical: 22/22 (100%)
- ✓ Performance: 10/10
- ✓ Semantic HTML: 6/6
- ✓ URLs: 6/6

### Advanced: 6/8 (75%)
- ✓ Schema: 3/5
- ✓ External Links: 3/3

**Total: 88/112 points = 79% = 79/100**

## Why This Is Wrong

1. **Thin content (282 words) should hurt more**
   - Currently only loses 15 points (content depth)
   - Still gets 7/7 for readability (shouldn't - not enough to read!)
   - Still gets 8/10 for internal links (16 links on 282 words is spammy!)

2. **Old/abandoned sites should be penalized**
   - No freshness penalty
   - No consideration of content age
   - No penalty for outdated design patterns

3. **Yellow Pages template sites should score lower**
   - Generic, template-based content
   - No unique value
   - Minimal effort

## Proposed Fixes

### Option 1: Stricter Content Penalties
Make thin content (<300 words) also penalize:
- Readability: 0/7 (not enough content to be "readable")
- Internal Links: Reduce to 3/10 (links without content = spam)
- Semantic HTML: Reduce to 3/6 (structure without content = empty)

**Result:** PizzaTwice would score ~55/100 SEO

### Option 2: Add Content Freshness Component
Add 10-point component for content freshness:
- Updated within 6 months: 10/10
- Updated within 1 year: 7/10
- Updated within 2 years: 4/10
- Older than 2 years: 0/10

**Result:** PizzaTwice loses 10 more points = ~69/100 SEO

### Option 3: Minimum Content Threshold
Sites with <300 words automatically capped at 60/100 SEO maximum, regardless of technical score.

**Result:** PizzaTwice = 60/100 SEO

### Option 4: Combination (RECOMMENDED)
- Apply Option 1 (stricter penalties)
- Apply Option 2 (freshness component)
- Apply Option 3 (content threshold cap)

**Result:** PizzaTwice = ~50/100 SEO

## Recommended Scoring for PizzaTwice

**Current:** 79/11/55 (SEO/AEO/GEO)
**Should be:** 50/11/55 (SEO/AEO/GEO)

This better reflects that it's an abandoned site with minimal content, even if the basic technical SEO is okay.

## Implementation

### Quick Fix (Option 3 - Content Threshold Cap)
Add to `calculateSEOScore()` in `lib/grader-v2.ts`:
```typescript
// Cap score for thin content
const wordCount = data.structuralData?.wordCount || 0
if (wordCount < 300) {
  finalScore = Math.min(finalScore, 60)
}
```

### Better Fix (Option 1 - Stricter Penalties)
Modify components in `lib/scoring-components.ts`:
- Readability: Check word count, give 0 if <300
- Internal Links: Penalize if links/words ratio > 0.05
- Semantic HTML: Reduce score if <300 words

### Best Fix (Option 4 - Combination)
Implement all three options for most accurate scoring.

## Testing Plan

Test these sites to calibrate:
1. **PizzaTwice** (282 words, abandoned) - Should score ~50 SEO
2. **FundyLogic** (1514 words, optimized) - Should score ~90 SEO
3. **Medium-quality site** (600 words, decent) - Should score ~70 SEO

This ensures proper differentiation across the quality spectrum.
