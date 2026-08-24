# Duelly.ai Public Audit API — Integration & UI Implementation Prompt

Use this prompt in your other project to build a results page that matches the Duelly.ai look and feel.

---

## PROMPT (copy everything below this line)

---

I need to build a page that displays SEO/AEO/GEO audit results from the Duelly.ai Public Audit API. The page should match Duelly's dark-theme dashboard aesthetic. Here is everything you need.

## 1. API Call

```typescript
const response = await fetch('https://duelly.ai/api/public-audit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.DUELLY_API_KEY!,
  },
  body: JSON.stringify({ url: 'https://example.com' }),
})
const data = await response.json()
```

**Important:** This call takes 30-90 seconds. Make it server-side (API route or server action), not from the browser. Show a loading state while waiting.

## 2. Full API Response Shape

```typescript
interface DuellyAuditResponse {
  url: string
  analyzedAt: string // ISO 8601
  durationMs: number

  scores: {
    seo: number  // 0-100
    aeo: number  // 0-100
    geo: number  // 0-100
  }

  siteType: {
    primary: string   // e.g. "restaurant", "e-commerce", "blog", "saas", "local-business", "contractor"
    secondary: string[]
    confidence: number // 0-100
  }

  platform: {
    platform: string  // e.g. "wordpress", "shopify", "nextjs", "wix"
    label: string     // e.g. "WordPress", "Shopify"
    confidence: number
  } | null

  expertAnalysis: {
    bottomLine: string      // 2 sentences: the single most important takeaway
    keyInsight: string      // 2 sentences: the non-obvious insight
    priorityAction: string  // 2 sentences: what to do first
  } | string | null

  // Roadmap to 100: every issue found, sorted by severity. NO fix instructions included.
  roadmapTo100: Array<{
    category: 'SEO' | 'AEO' | 'GEO'
    component: string       // e.g. "SEO Foundation - Missing title tag"
    penalty: string         // Short issue description
    explanation: string     // Why this matters (50-100 words)
    severity: 'critical' | 'warning' | 'info'
    pointsDeducted: number  // Negative number, e.g. -10
  }>

  // AI recommendations: what to improve, but NOT how to fix it
  recommendations: Array<{
    rank: number
    title: string
    description: string       // Why this matters
    affectedElement: string   // What specific element is the problem
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    effort: 1 | 2 | 3
    domain: 'SEO' | 'AEO' | 'GEO'
    impact: 'High' | 'Medium'
    impactedScores: string    // e.g. "SEO Score, AEO Score, Rich Results"
  }>

  onPageAudit: {
    seoAnalysis: {
      onPageIssues: string[]
      contentQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unacceptable'
      metaAnalysis: string
      keywordOpportunities: string[]
    } | null
    aeoAnalysis: {
      questionsAnswered: { who: number; what: number; where: number; why: number; how: number }
      missingSchemas: string[]
      snippetEligibilityScore: number
      topOpportunities: string[]
    } | null
    geoAnalysis: {
      sentimentScore: number        // -100 to 100
      brandPerception: 'positive' | 'neutral' | 'negative'
      citationLikelihood: number    // 0-100
      llmContextClarity: number     // 0-100
      visibilityGaps: string[]
    } | null
    schemaQuality: {
      score: number
      hasSchema: boolean
      schemaTypes: string[]
      issues: string[]
      strengths: string[]
    } | null
  }

  keywordOpportunities: string[]

  liveInterrogation: {
    identifiedQuery: string
    isRecommended: boolean
    shareOfVoiceData: Array<{ competitor: string; share: number }>
    aiCitations: Array<{
      llm: string
      query: string
      context: string
      sentiment: 'positive' | 'neutral' | 'negative'
      date: string
    }>
  } | null

  coreWebVitals: {
    lcp: { displayValue: string; category: 'FAST' | 'AVERAGE' | 'SLOW' }
    inp: { displayValue: string; category: 'FAST' | 'AVERAGE' | 'SLOW' }
    cls: { displayValue: string; category: 'FAST' | 'AVERAGE' | 'SLOW' }
    overallCategory: string
    performanceScore: number // 0-100
  } | null

  backlinks: {
    domainAuthority: number
    totalBacklinks: number
    spamScore: number
    topBacklinks: Array<{ source: string; anchor: string; domainAuthority: number }>
  } | null

  pageMetrics: {
    title: string
    description: string
    wordCount: number
    schemaCount: number
    hasH1: boolean
    isHttps: boolean
    responseTimeMs: number
    internalLinks: number
    externalLinks: number
    totalImages: number
    imagesWithAlt: number
    altTextCoverage: number // 0-100
  }

  scoreBreakdown: {
    seo: CategoryBreakdown[]
    aeo: CategoryBreakdown[]
    geo: CategoryBreakdown[]
  }
}

interface CategoryBreakdown {
  name: string
  score: number
  maxScore: number
  percentage: number
  components: Array<{
    score: number
    maxScore: number
    status: 'excellent' | 'good' | 'warning' | 'critical'
    feedback: string
    issues?: string[]
  }>
}
```

## 3. Design System — Duelly Visual Language

### Color Palette
```
Background:       #050508 (near-black)
Card background:  rgba(255,255,255,0.03) with border rgba(255,255,255,0.1)
Text primary:     #ffffff
Text secondary:   rgba(255,255,255,0.6)
Text muted:       rgba(255,255,255,0.4)

SEO accent:       #00e5ff (cyan)
AEO accent:       #BC13FE (purple)
GEO accent:       #fe3f8c (pink)
Warning:          #f59e0b (amber)
Success:          #22c55e (green)
Critical/Error:   #ef4444 (red)
```

### Typography
- Font: System font stack (Inter if available)
- Score numbers: `text-2xl font-bold` inside circular progress rings
- Section headers: `text-xs font-black uppercase tracking-widest` in accent color
- Body text: `text-sm text-white/80 leading-relaxed`
- Labels: `text-[9px] uppercase tracking-wider text-white/40 font-bold`

### Component Patterns

#### Circular Score Rings (3 across the top)
Each score (SEO, AEO, GEO) is displayed as an SVG circular progress ring:
- Size: 140px, stroke width: 10px
- Background ring: muted gray
- Progress ring: accent color with a subtle glow/drop-shadow
- Score number centered inside the ring
- Label below: "SEO Score", "AEO Score", "GEO Score"
- Each ring uses its pillar color (SEO=cyan, AEO=purple, GEO=pink)

#### Key Metrics Strip (horizontal row of small cards)
A grid of small metric cards (9 across on desktop, 3 on mobile):
- Each card: `rounded-lg border px-2.5 py-2`
- Label on top in tiny uppercase
- Value below in `text-sm font-black`
- Color-coded: green for good, yellow for warning, red for critical
- Cards with critical values get `border-red-500/40 bg-red-500/5`
- Metrics to show: Schema, Metadata, H1 Tag, HTTPS, Response Time, Alt Text %, Words, Internal Links, External Links

#### Expert Analysis Card
A rounded card with subtle cyan border and glow:
- `rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/[0.03] backdrop-blur-xl p-5`
- Blurred glow circle in top-right corner
- Three sections inside, each in its own sub-card:
  - **Bottom Line** (cyan icon, cyan accent): Zap icon
  - **Key Insight** (purple icon, purple accent): Lightbulb icon
  - **Priority Action** (green icon, green accent): Target icon
- Each section: icon + title in tiny uppercase + body text

#### Roadmap to 100 (Recommendation Cards)
A card with cyan-to-purple gradient background:
- Header: "Roadmap to 100 — Prioritized Site Improvements"
- Priority filter buttons: All, Critical (red), High (amber), Medium (purple)
- Grid of recommendation cards (3 columns on desktop):
  - Each card shows: rank number, title, domain badge (SEO/AEO/GEO), priority badge
  - Priority badges: CRITICAL = red, HIGH = amber, MEDIUM = purple
  - Domain badges: SEO = cyan, AEO = purple, GEO = pink
  - Description text explaining why it matters
  - Affected element
  - Impact and effort indicators
  - **Do NOT show fix instructions** (the API does not include them)
  - Instead, show a CTA like "Get the fix on Duelly.ai" linking to your Duelly signup

#### On-Page AI Audit (Tabbed)
Three tabs: SEO Analysis, AEO Analysis, GEO Analysis
- Tab buttons use pillar colors with active state being solid color with white text
- SEO tab: on-page issues list, content quality badge, meta analysis, keyword opportunities
- AEO tab: questions answered radar (who/what/where/why/how), missing schemas, snippet eligibility score, top opportunities
- GEO tab: sentiment score, brand perception, citation likelihood, LLM context clarity, visibility gaps

#### Core Web Vitals
A card with purple accent:
- Three metric boxes in a row: LCP, INP, CLS
- Each box color-coded: green border for FAST, yellow for AVERAGE, red for SLOW
- Display value large and bold, category label below

#### Backlinks Section
- Domain Authority prominently displayed
- Total backlinks count
- Spam score
- Table of top backlinks with source, anchor text, and DA

### Card Style
All cards follow this pattern:
```css
rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5
```
For accent cards (expert analysis, roadmap):
```css
rounded-2xl border border-[accent]/30 bg-[accent]/[0.03] to bg-[accent]/5
```

### Severity Color Coding
- Critical: `text-red-500`, `border-red-500/40`, `bg-red-500/5`
- Warning/High: `text-[#f59e0b]`, `border-[#f59e0b]/40`, `bg-[#f59e0b]/5`
- Info/Medium: `text-[#BC13FE]`, `border-[#BC13FE]/40`, `bg-[#BC13FE]/5`
- Good: `text-green-500`, `border-green-500/40`, `bg-green-500/5`

## 4. Page Layout (top to bottom)

1. **URL input + "Run Audit" button** — triggers the API call
2. **Loading state** — progress spinner with phases: "Crawling page...", "AI Analysis...", "Scoring..."
3. **Three Score Rings** — SEO, AEO, GEO in a row
4. **Key Metrics Strip** — 9 small metric cards
5. **Expert Analysis** — Bottom Line, Key Insight, Priority Action
6. **Roadmap to 100** — Filterable recommendation cards with priority badges (no fixes, CTA to Duelly)
7. **On-Page AI Audit** — Tabbed SEO/AEO/GEO analysis
8. **Keyword Opportunities** — List from the SEO analysis
9. **Core Web Vitals** — LCP, INP, CLS cards
10. **Backlinks** — DA, total, spam score, top backlinks table
11. **Live AI Interrogation** — Share of voice chart, AI citations
12. **Powered by Duelly.ai** footer badge with link

## 5. Important Notes

- The API takes 30-90 seconds. You MUST show a loading state.
- The API does NOT return fix instructions. The roadmap shows WHAT is wrong and WHY, but not HOW to fix it. This is intentional. Add a CTA like "Get step-by-step fixes on Duelly.ai →" linking to https://duelly.ai/signup
- Rate limit: 3 requests per minute. Handle 429 responses gracefully.
- All data is for a single page audit (not sitewide).
- The `expertAnalysis` field can be a structured object OR a plain string OR null. Handle all three cases.
- Score breakdown gives you component-level detail if you want to build expandable score cards.

## 6. Attribution

Include a "Powered by Duelly.ai" badge somewhere visible on the results page. Suggested placement: bottom of the results, or in the header next to the scores. Link to https://duelly.ai
