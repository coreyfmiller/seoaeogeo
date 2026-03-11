# Token Optimization Rollback

## Issue
The content summarization optimization caused score instability:
- AEO scores fluctuating (68 → 75)
- GEO scores fluctuating (50 → 80 → 60)
- Scores should remain consistent for the same content

## Root Cause
By sending only 500 words + sample paragraphs instead of full content:
- AI receives different context each time
- Semantic analysis becomes inconsistent
- Different content samples = different flag detection

## Decision
**Rolled back to full content** (`thinnedText`) for scoring stability.

Token optimization is disabled until we can:
1. Ensure consistent scoring across runs
2. Validate that summarization doesn't affect accuracy
3. Potentially use deterministic content selection (not just "first 500 words")

## What's Still Active
- Content summarizer code exists but is NOT used
- `summarizedContent` field is still generated but ignored
- System uses `thinnedText` (full cleaned content) like before

## Cost Impact
- Back to original costs: ~$0.0227 per query
- Daily cost: ~$1.68 for 74 queries
- No savings, but scores are stable and reliable

## Future Optimization Paths

### Option 1: Deterministic Summarization
Instead of "first 500 words", use:
- Hash-based content selection (same content = same summary)
- Full paragraph boundaries (don't cut mid-sentence)
- Consistent sampling algorithm

### Option 2: Two-Pass Analysis
- Pass 1: Quick technical checks (no AI, deterministic)
- Pass 2: AI semantic analysis on full content (only when needed)

### Option 3: Caching + Full Content
- Use full content for accuracy
- Cache results aggressively to reduce API calls
- Focus on reducing duplicate analyses, not content size

### Option 4: Prompt Optimization
- Keep full content
- Optimize the prompt instructions (currently ~800-1000 tokens)
- Use more concise output format

## Recommendation
Focus on **Option 4 (Prompt Optimization)** next:
- Doesn't affect scoring accuracy
- Can reduce tokens by 20-30%
- No risk of score instability
- Easier to validate

## Files Modified (Rollback)
- `lib/gemini.ts` - Reverted to use `thinnedText`
- `app/api/analyze/route.ts` - Reverted to use `thinnedText`

## Files Kept (For Future Use)
- `lib/utils/content-summarizer.ts` - Code preserved but not used
- `lib/crawler.ts` - Still generates `summarizedContent` field
