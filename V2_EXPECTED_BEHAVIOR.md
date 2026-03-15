# V2 Expected Scoring Behavior

## Quick Reference

### PizzaTwice.com (282 words)
```
Expected Scores: SEO 70 | AEO 8 | GEO 40
```

**Why these scores?**
- **SEO 70**: Has basic SEO (title, meta, H1, HTTPS) but missing mobile viewport (-7 pts) and thin content (-15 pts)
- **AEO 8**: Massive penalties for thin content (0/20), poor Q&A (0/20), low entities (0/15), poor formatting (0/15), no definitions (0/10). Only gets points for schema (18/30)
- **GEO 40**: Poor image alt text (0/25), no expertise (0/20), no data (0/15). Gets points for neutral tone (20/20) and objectivity (20/20)

### FundyLogic.com (1514 words, optimized)
```
Expected Scores: SEO 90+ | AEO 90+ | GEO 90+
```

**Why these scores?**
- **SEO 90+**: Well-optimized with all best practices followed
- **AEO 90+**: Comprehensive content (20/20), good schema, answers questions, high entity density
- **GEO 90+**: Good accessibility, expertise signals, data-driven content

## Scoring Logic Flow

### 1. Content Analysis (API Route)
```typescript
if (wordCount < 500) {
  // Apply penalties
  semanticFlags = {
    noDirectQnAMatching: true,      // -20 AEO
    lowEntityDensity: true,          // -15 AEO
    poorFormattingConciseness: true, // -15 AEO (if <300 words)
    lackOfDefinitionStatements: true,// -10 AEO
    lackOfExpertiseSignals: true,    // -20 GEO
    lackOfHardData: true,            // -15 GEO
  }
}
```

### 2. AEO Scoring (Grader)
```
Start: 100 points

Content Depth:
  - <300 words: -20 pts (0/20)
  - 300-800 words: partial penalty
  - 800+ words: 0 penalty (20/20)

Schema Quality:
  - No schema: -30 pts (0/30)
  - Schema with issues: partial penalty
  - Good schema: 0 penalty (30/30)

Q&A Matching:
  - noDirectQnAMatching=true: -20 pts (0/20)
  - noDirectQnAMatching=false: 0 penalty (20/20)

Entity Density:
  - lowEntityDensity=true: -15 pts (0/15)
  - lowEntityDensity=false: 0 penalty (15/15)

Formatting:
  - poorFormattingConciseness=true: -15 pts (0/15)
  - poorFormattingConciseness=false: 0 penalty (15/15)

Definitions:
  - lackOfDefinitionStatements=true: -10 pts (0/10)
  - lackOfDefinitionStatements=false: 0 penalty (10/10)

Final AEO Score = max(0, 100 - total_penalties)
```

### 3. GEO Scoring (Grader)
```
Start: 100 points

Image Accessibility:
  - <50% alt text: -25 pts (0/25)
  - 50-90% alt text: partial penalty
  - 90%+ alt text: 0 penalty (25/25)

Tone:
  - promotionalTone=true: -20 pts (0/20)
  - promotionalTone=false: 0 penalty (20/20)

Expertise:
  - lackOfExpertiseSignals=true: -20 pts (0/20)
  - lackOfExpertiseSignals=false: 0 penalty (20/20)

Data & Facts:
  - lackOfHardData=true: -15 pts (0/15)
  - lackOfHardData=false: 0 penalty (15/15)

Objectivity:
  - heavyFirstPersonUsage=true: -10 pts (0/10)
  - heavyFirstPersonUsage=false: 0 penalty (10/10)

Claims:
  - unsubstantiatedClaims=true: -10 pts (0/10)
  - unsubstantiatedClaims=false: 0 penalty (10/10)

Final GEO Score = max(0, 100 - total_penalties)
```

## PizzaTwice Detailed Breakdown

### Input Data
```json
{
  "wordCount": 282,
  "schemas": [
    { "@type": "Organization" },
    { "@type": "LocalBusiness" }
  ],
  "semanticFlags": {
    "noDirectQnAMatching": true,
    "lowEntityDensity": true,
    "poorFormattingConciseness": true,
    "lackOfDefinitionStatements": true,
    "promotionalTone": false,
    "lackOfExpertiseSignals": true,
    "lackOfHardData": true,
    "heavyFirstPersonUsage": false,
    "unsubstantiatedClaims": false
  },
  "media": {
    "totalImages": 12,
    "imagesWithAlt": 5
  }
}
```

### AEO Calculation
```
Start: 100

Content Depth: 282 words < 300
  → -20 pts (0/20)
  → Score: 80

Schema Quality: Has 2 schemas with @type
  → -12 pts (18/30) [70% quality]
  → Score: 68

Q&A: noDirectQnAMatching=true
  → -20 pts (0/20)
  → Score: 48

Entity Density: lowEntityDensity=true
  → -15 pts (0/15)
  → Score: 33

Formatting: poorFormattingConciseness=true
  → -15 pts (0/15)
  → Score: 18

Definitions: lackOfDefinitionStatements=true
  → -10 pts (0/10)
  → Score: 8

Final AEO: 8/100
```

### GEO Calculation
```
Start: 100

Image Alt: 5/12 = 42% coverage
  → -25 pts (0/25)
  → Score: 75

Tone: promotionalTone=false
  → 0 penalty (20/20)
  → Score: 75

Expertise: lackOfExpertiseSignals=true
  → -20 pts (0/20)
  → Score: 55

Data: lackOfHardData=true
  → -15 pts (0/15)
  → Score: 40

Objectivity: heavyFirstPersonUsage=false
  → 0 penalty (10/10)
  → Score: 40

Claims: unsubstantiatedClaims=false
  → 0 penalty (10/10)
  → Score: 40

Final GEO: 40/100
```

## Console Output Example

When analyzing PizzaTwice, you should see:

```
[V2 API] Starting analysis for: pizzatwice.com
[V2 API] Crawling page...
[Crawler] Navigating to: https://pizzatwice.com
[Crawler] Successfully loaded https://pizzatwice.com (Status: 200)
[V2 API] Analyzing content quality...
[V2 API] Word count: 282
[V2 API] Schemas found: 2
[V2 API] Applying penalties for thin content (<500 words)
[V2 API] Semantic flags: {
  "noDirectQnAMatching": true,
  "lowEntityDensity": true,
  "poorFormattingConciseness": true,
  "lackOfDefinitionStatements": true,
  "promotionalTone": false,
  "lackOfExpertiseSignals": true,
  "lackOfHardData": true,
  "heavyFirstPersonUsage": false,
  "unsubstantiatedClaims": false
}
[V2 API] Schema quality: {
  "hasSchema": true,
  "score": 70,
  "issues": []
}
[V2 API] Grading page...
[Grader V2] Calculating AEO score...
[Grader V2] Word count: 282
[Grader V2] Semantic flags: {
  "noDirectQnAMatching": true,
  ...
}
[V2 API] Analysis complete
[V2 API] SEO: 70 AEO: 8 GEO: 40
```

## Verification Checklist

✅ Restart dev server (clears cached code)
✅ Navigate to http://localhost:3000/v2
✅ Enter "pizzatwice.com" and click Analyze
✅ Open browser console (F12)
✅ Verify logs show:
   - Word count: 282
   - "Applying penalties for thin content"
   - semanticFlags with true values
✅ Verify scores displayed:
   - SEO: ~70
   - AEO: ~8
   - GEO: ~40
✅ Check detailed breakdown shows penalties
✅ Test FundyLogic.com - should score 90+

## If Scores Don't Match

1. **Check console logs** - Are semantic flags being set?
2. **Hard refresh** - Ctrl+Shift+R (clears browser cache)
3. **Restart dev server** - Clears Node.js cache
4. **Check Network tab** - Is API being called or cached?
5. **Run test script** - `npx tsx scripts/test-pizzatwice-scoring.ts`
6. **Check you're on /v2** - Not /merged or other routes
