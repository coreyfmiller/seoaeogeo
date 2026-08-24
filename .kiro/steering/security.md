---
inclusion: auto
---

# Duelly — Security & Architecture Rules

Duelly is a competitive SEO audit tool. It uses AI (Gemini) for scanning and analysis, which costs money per call.

## Enforced Rules

- All scan routes MUST check auth + credits before executing
- Never run a scan without verifying the user has sufficient credits
- Rate limit all AI-powered endpoints (max 5 concurrent scans per user)
- Supabase is the only persistence layer — no localStorage for user data
- RLS enabled on all user tables (scans, reports, credits)
- Track every API call cost for attribution
- Stripe webhooks must verify signature before processing
- Never expose scan results to users who didn't pay for them (RLS enforces this)
- Bot detection on any endpoint that triggers external API calls (Serper, Gemini)
