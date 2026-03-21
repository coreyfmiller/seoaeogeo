# Weekly Must-Do Checklist

## 🔄 Platform Fix Instructions Review
**File:** `lib/grader-v2.ts` — `getFix()` function (platformTips object)
**Frequency:** Weekly
**Why:** The penalty fix instructions for each platform (WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, Gatsby, Drupal) are hardcoded. If a platform updates their UI or settings locations, the advice becomes stale.

**What to check:**
- [ ] WordPress: Yoast/RankMath SEO panel locations, plugin names still current
- [ ] Shopify: "Edit website SEO" section, theme editor paths, recommended apps
- [ ] Wix: Marketing & SEO dashboard, SEO Tools paths, editor UI
- [ ] Squarespace: Page settings > SEO tab, code injection paths
- [ ] Webflow: Pages panel, CMS settings, custom code locations
- [ ] Next.js: Metadata API, app router conventions, recommended packages
- [ ] Gatsby: Head API, plugin names (gatsby-plugin-react-helmet etc.)
- [ ] Drupal: Metatag module, Schema.org module, admin paths

**How to check:**
1. Open each platform's admin/editor (or their docs)
2. Verify the navigation paths mentioned in the fix text are still accurate
3. Check if any major platform updates were announced that week
4. Update `platformTips` in `getFix()` if anything changed

**Also review:**
- [ ] Generic fix advice in `genericFixes` object — SEO best practices still current?
- [ ] `getExplanation()` — any new Google algorithm updates that change why something matters?
- [ ] `resolveComponentKey()` — any new scoring components added that need mapping?
