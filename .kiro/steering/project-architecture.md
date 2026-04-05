---
inclusion: auto
---

# Duelly Project Architecture

## Product Overview
Duelly is a search intelligence platform that audits websites across SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization). Built with Next.js 14 App Router, Tailwind CSS, Supabase, and Google Gemini AI.

## Active Tool Pages (V4 = current)
- `/pro-audit` — Single-page AI audit (10 credits). API: `/api/analyze-v3`
- `/deep-scan` — Multi-page site audit (30 credits). API: `/api/analyze-deep-v3`
- `/battle-mode` — Competitor Duel, head-to-head comparison (10 credits). API: `/api/battle-v3`
- `/keyword-arena` — Keyword Arena, multi-site scoring (10/site). API: `/api/keyword-arena-v3`

## Page Layout Patterns
- **Dashboard pages** (tools): Use `PageShell` component (sidebar + header). Scroll via `<main className="flex-1 overflow-y-auto">`.
- **Public pages** (blog, help, pricing, terms, privacy, contact, standards): Use `PublicNav` + `PublicFooter` components. Scroll via `<div className="min-h-screen h-screen overflow-y-auto">`.
- **Homepage** (`/`): Own inline nav matching PublicNav links. Own footer.
- **CRITICAL**: `html, body { overflow: hidden }` always. Every page manages its own scroll container. Never add overflow to html/body.

## Naming Conventions
- Tool names: Pro Audit, Deep Scan, Competitor Duel, Keyword Arena
- Slogan: "The roadmap to outrank your rivals."
- Priority levels: Critical (red), High (amber #f59e0b), Medium (purple #BC13FE)
- No "AI-Powered" badges. No version numbers in UI (V3/V4 are internal only).
- No em dashes in content. Write conversationally.

## Key Shared Components
- `FixInstructionCard` — Recommendation cards with Why This Matters + How To Fix sections
- `LinkBuildingIntelligence` — Backlink metrics + top backlinks + professional CTA
- `DownloadReportButton` — PDF report generation (lazy-loaded @react-pdf/renderer)
- `InfoTooltip` — (?) hover explanations. Every metric/label should have one.
- `CircularProgress` — Score circles for SEO/AEO/GEO

## Color System
- SEO: `#00e5ff` (cyan)
- AEO: `#BC13FE` (purple)
- GEO: `#fe3f8c` (pink)
- Green: `#22c55e` (backlinks, success)
- Critical: `destructive` (red)
- High: `#f59e0b` (amber)
- Medium: `#BC13FE` (purple)

## Data Flow
- Backlinks: `fetchBacklinksWithCache()` from `lib/backlink-fetcher.ts`. Cache: own site 7 days, competitors 30 days.
- Scan history: `lib/scan-history.ts` using localStorage. Types: `free-v3`, `pro`, `deep`, `competitive`, `keyword-arena`.
- Dashboard routing: `getRouteForType()` maps scan types to V4 URLs.
- PDF reports: `lib/pdf/` directory. Pro/Deep use `ProAuditReport`, Duel uses `CompetitorDuelReport`, Arena uses `KeywordArenaReport`.

## Scoring Pipeline (CRITICAL)
Every route producing scores MUST follow:
1. `performScan(url)` — crawl
2. `detectSiteType(scan)` → set `scan.siteType`
3. Set `scan.schemaQuality` and `scan.semanticFlags`
4. `calculateScoresFromScanResult(scan)` — grading
Never call step 4 without steps 2-3.

## EOL Pages (admin-only sidebar section)
Old versions kept for reference: `/pro-audit`, `/deep-scan`, `/competitive-intel`, `/battle-mode`, `/keyword-arena`, `/keyword-arena-v2`

## Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini AI
- `PAGESPEED_API_KEY` — Core Web Vitals
- `MOZ_API_TOKEN` — Backlink data
- `RESEND_API_KEY` — Contact form emails
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` — Spam protection
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Database
- `SERPER_API_KEY` — Google Search for Keyword Arena
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Payments
