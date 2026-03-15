# Freemium Strategy - V2 for Free, V3 for Paid

## Strategy Overview

Use V2 (fast, heuristic-based) for free tier, V3 (AI-powered) for paid tier.

## Free Tier (V2)
- **Speed**: 1-2 seconds
- **Accuracy**: 70% (good enough for preview)
- **Features**:
  - ✅ Technical SEO scores (title, meta, H1, HTTPS, etc.)
  - ✅ Basic AEO/GEO scores (word-count based)
  - ✅ Site-type detection
  - ✅ Circular progress UI
  - ❌ NO actionable fixes
  - ❌ NO detailed breakdowns
  - ❌ NO AI content analysis
- **Value Prop**: "Get your SEO/AEO/GEO scores in seconds"
- **CTA**: "Upgrade for AI-powered analysis and actionable fixes"

## Paid Tier (V3)
- **Speed**: 20-30 seconds
- **Accuracy**: 95% (production-grade)
- **Features**:
  - ✅ Everything from Free tier
  - ✅ AI content analysis (tone, expertise, claims)
  - ✅ Accurate AEO/GEO scoring
  - ✅ Actionable fixes with step-by-step instructions
  - ✅ Detailed breakdowns
  - ✅ Priority recommendations
  - ✅ Export reports
- **Value Prop**: "Get AI-powered insights and fix every issue"

## Implementation Tasks

### Task 1: Modify V2 for Free Tier
**File**: `app/v2/page.tsx`

Changes needed:
1. Hide actionable fixes section
2. Hide detailed breakdowns (show only scores)
3. Add "Upgrade to Pro" CTA after scores
4. Add blur effect on detailed sections with lock icon
5. Update copy: "Free Quick Scan" instead of "Beta"

### Task 2: Create Free Tier Landing Page
**File**: `app/free-scan/page.tsx` (new)

Features:
- Simple input box
- "Get Your Free SEO Score" CTA
- Shows only 3 circular progress scores
- "Upgrade for detailed analysis" button
- No detailed breakdowns visible

### Task 3: Add Paywall Logic
**File**: `lib/auth.ts` or similar

Logic:
- Check if user is authenticated
- Check if user has paid subscription
- Free users → V2 API
- Paid users → V3 API
- Redirect to pricing page on upgrade click

### Task 4: Update Pricing Page
**File**: `app/pricing/page.tsx` (new or existing)

Comparison table:
| Feature | Free | Pro |
|---------|------|-----|
| SEO/AEO/GEO Scores | ✓ | ✓ |
| Site-Type Detection | ✓ | ✓ |
| Speed | 1-2 sec | 20-30 sec |
| AI Content Analysis | ✗ | ✓ |
| Actionable Fixes | ✗ | ✓ |
| Detailed Breakdowns | ✗ | ✓ |
| Export Reports | ✗ | ✓ |
| Priority Support | ✗ | ✓ |

### Task 5: Add Usage Limits
**File**: `lib/rate-limiter.ts` (new)

Limits:
- Free: 3 scans per day
- Pro: Unlimited scans
- Track by IP or email
- Show "X scans remaining today" message

## User Journey

### Free User
1. Lands on homepage
2. Enters URL
3. Gets scores in 1-2 seconds
4. Sees: "Your site scores 62/100 SEO, 11/100 AEO, 55/100 GEO"
5. Sees blurred "Actionable Fixes" section with lock icon
6. Clicks "Upgrade to Pro" → Pricing page

### Paid User
1. Logs in
2. Enters URL
3. Gets scores in 20-30 seconds
4. Sees full detailed analysis
5. Gets step-by-step fixes
6. Can export report

## Marketing Copy

### Free Tier
"Get your SEO, AEO, and GEO scores in seconds. See how your site performs in traditional search, AI answers, and generative engines."

### Paid Tier
"Unlock AI-powered insights. Get detailed analysis, actionable fixes, and step-by-step instructions to improve your rankings."

## Technical Notes

- V2 API has no Gemini costs (free for us)
- V3 API costs ~$0.02-0.04 per scan (paid users only)
- Can handle high free tier volume without cost concerns
- Paid tier justified by AI costs + value provided

## Pricing Suggestions

- **Free**: $0 (3 scans/day)
- **Pro**: $29/month (unlimited scans)
- **Agency**: $99/month (unlimited scans + white label)

## Next Steps

1. ✅ V3 is built and working
2. ⏳ Modify V2 UI to hide fixes (add paywall)
3. ⏳ Create free tier landing page
4. ⏳ Add authentication/subscription logic
5. ⏳ Create pricing page
6. ⏳ Add rate limiting
7. ⏳ Test user journey
8. ⏳ Launch!

## Benefits of This Strategy

1. **Low acquisition cost**: Free tier has no AI costs
2. **Clear value prop**: Users see scores, want fixes
3. **Natural upsell**: "Here's what's wrong, pay to learn how to fix it"
4. **Scalable**: Can handle thousands of free users
5. **Justified pricing**: AI analysis costs money, users understand
6. **Competitive advantage**: Most tools don't offer free AEO/GEO scores

## Status

📋 **DOCUMENTED - NOT IMPLEMENTED**

This is a roadmap item. V2 and V3 are built and working. Now need to add:
- Paywall UI
- Authentication
- Subscription logic
- Pricing page
- Rate limiting
