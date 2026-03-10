# Implementation Plan: Add All Missing Sections to Merged Dashboard

## Current Situation
- Merged page has: 3 score cards, 8 stat cards, tabs, 3 sections (Prioritized Improvements, Page Comparison, Cannibalization)
- Missing: 15+ sections from deep crawler

## Most Efficient Solution
Since the deep crawler page (app/site-analysis/page.tsx) already has ALL the sections we need, and the merged page should have the same features, the most efficient approach is:

1. Copy the entire content rendering section from deep crawler (lines 650-1880)
2. Paste it into the merged page after the tabs
3. Keep the merged page's unique features:
   - Quick/Deep scan toggle
   - Uses `/api/analyze-site` API
   - Scan mode state management

## Implementation Steps
1. Read lines 450-500 from merged page (after tabs, before closing divs)
2. Read lines 650-1880 from deep crawler (all content sections)
3. Replace merged page content with deep crawler content
4. Verify imports are correct
5. Test

This approach ensures we get ALL sections without missing anything.
