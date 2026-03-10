# SEO/AEO/GEO Best Practices Recognition - 2026 Standards

## 🎯 RECENT UPDATES (March 2026)

### Changes Made to Validation Logic:
1. **Semantic Tags** - Now context-aware:
   - `<main>` tag: Only penalized on pages with 300+ words (-5 pts, down from -10)
   - `<article>` tag: No longer penalized (removed)
   - `<nav>` tag: No longer penalized (removed)

2. **External Links** - Now context-aware:
   - Only penalized on long-form content (500+ words)
   - Reduced penalty from -5 to -3 points
   - Short pages don't need external references

3. **Social Proof Links** - Now context-aware:
   - Only penalized on business sites (with Organization/LocalBusiness schema)
   - Reduced penalty from -10 to -5 points
   - Personal sites/portfolios don't need social links

4. **Schema Validation** - Removed overly specific penalties:
   - Removed: -15 pts for missing FAQ schema
   - Removed: -10 pts for missing Organization schema
   - Removed: -5 pts for missing HowTo schema
   - Now: Only penalize if NO schema exists (-20 pts)
   - Gemini AI recommends appropriate schema types based on content context

### Philosophy:
- **Context matters**: Homepage ≠ blog post ≠ contact page
- **Recommend, don't penalize**: Gemini suggests improvements, deterministic scoring only penalizes real problems
- **Modern standards**: Recognize 2026 best practices (arrays, @graph, distributed schema)

---

## Our Philosophy
**We recognize MODERN best practices and don't penalize correct implementations.**

---

## ✅ TITLE TAG BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **Brand name in 80%+ of titles** = 100% score
   - Pattern: "[Page Topic] | Brand Name"
   - Example: "Services | FundyLogic" ✓
   
2. **Homepage with full branding** = Bonus points
   - Pattern: "Brand — Value Prop | Location"
   - Example: "FundyLogic — AI-Ready Websites | Quispamsis, NB" ✓

3. **Unique page-specific content** = Good
   - Each title should be unique
   - Don't repeat location/services on every page (that's keyword stuffing)

### What We SHOULD Penalize:
- ❌ No brand name in titles
- ❌ Duplicate titles across pages
- ❌ Missing titles
- ❌ Titles too short (<30 chars) or too long (>60 chars)

### What We SHOULD NOT Penalize:
- ✅ Not repeating location on every page
- ✅ Not repeating services on every page
- ✅ Different title structures (homepage vs internal pages)

---

## ✅ META DESCRIPTION BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **All pages have descriptions** = 100% score
2. **Consistent length (120-160 chars)** = Bonus
3. **Unique descriptions per page** = Good

### What We SHOULD Penalize:
- ❌ Missing descriptions
- ❌ Duplicate descriptions
- ❌ Too short (<50 chars) or too long (>160 chars)

### What We SHOULD NOT Penalize:
- ✅ Variance in length (as long as within 120-160 range)
- ✅ Different writing styles per page type

---

## ✅ SCHEMA MARKUP BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **JSON-LD arrays** = Valid (not an error!)
   ```json
   [
     { "@type": "Organization", ... },
     { "@type": "FAQPage", ... }
   ]
   ```

2. **@graph structures** = Best practice!
   ```json
   {
     "@context": "https://schema.org",
     "@graph": [...]
   }
   ```

3. **Distributed schema** = Modern pattern!
   - Layout: Organization schema
   - Page: Page-specific schema
   - Connected via @id references

4. **Protocol variations** = OK if canonical tags match
   - www vs non-www is fine
   - http vs https is fine (if canonical is correct)

### What We SHOULD Penalize:
- ❌ Missing required properties (per schema.org spec)
- ❌ Placeholder data (000-0000, example@example.com)
- ❌ Invalid JSON
- ❌ Broken @id references (404 errors)

### What We SHOULD NOT Penalize:
- ✅ Using arrays
- ✅ Using @graph
- ✅ Multiple <script> tags
- ✅ Schema in layout + page files
- ✅ Protocol mismatches if canonical is correct

---

## ✅ CONTENT QUALITY BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **300+ words per page** = Good
2. **500+ words for key pages** = Better
3. **1000+ words for pillar content** = Best

### What We SHOULD Penalize:
- ❌ <300 words (thin content)
- ❌ Duplicate content
- ❌ Keyword stuffing

### What We SHOULD NOT Penalize:
- ✅ Short pages if appropriate (contact, thank you pages)
- ✅ Different content lengths per page type

---

## ✅ TECHNICAL SEO BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **One H1 per page** = Perfect
2. **H2-H6 hierarchy** = Good structure
3. **HTTPS everywhere** = Security standard
4. **<2s page load** = Fast
5. **Mobile responsive** = Essential

### What We SHOULD Penalize:
- ❌ No H1
- ❌ Multiple H1s
- ❌ HTTP (not HTTPS)
- ❌ >3s page load
- ❌ Missing alt text on >50% of images

### What We SHOULD NOT Penalize:
- ✅ Missing `<main>` tag on simple pages (<300 words)
- ✅ Missing `<article>` tag (only needed for blog/news content)
- ✅ Missing `<nav>` tag (only needed if site has navigation)
- ✅ No external links on short pages (<500 words)
- ✅ No social links on non-business sites
- ✅ Flat heading structure on simple pages
- ✅ No H3s if content doesn't need them

### Context-Aware Penalties (2026 Standards):
- **Semantic tags** (`<main>`, `<article>`, `<nav>`): Only penalize on content-heavy pages (300+ words)
- **External links**: Only penalize on long-form content (500+ words)
- **Social proof links**: Only penalize on business sites (with Organization/LocalBusiness schema)
- **Alt text**: Only penalize if >50% of images lack alt text

---

## ✅ INTERNAL LINKING BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **Hub and spoke model** = Good architecture
2. **3-5 internal links per page** = Healthy
3. **Contextual anchor text** = Best practice

### What We SHOULD Penalize:
- ❌ Orphan pages (0-1 internal links)
- ❌ No internal links
- ❌ Broken internal links

### What We SHOULD NOT Penalize:
- ✅ Different link counts per page type
- ✅ Footer/nav links

---

## ✅ AEO (ANSWER ENGINE OPTIMIZATION) BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **Any valid schema markup** = Good foundation
2. **FAQ schema** = Answer engine ready
3. **HowTo schema** = Step-by-step content
4. **Clear Q&A format** = AI-friendly
5. **Definition statements** = Citation-worthy
6. **Expert signals** (author bios, credentials) = Trust

### What We SHOULD Penalize:
- ❌ No schema markup at all
- ❌ Invalid JSON in schema
- ❌ Placeholder data in schema (000-0000, example@example.com)
- ❌ No structured Q&A on content pages
- ❌ Promotional tone (not informational)
- ❌ No expert signals

### What We SHOULD NOT Penalize:
- ✅ Missing FAQ schema (not all pages need it)
- ✅ Missing HowTo schema (not all pages need it)
- ✅ Missing Organization schema (context matters)
- ✅ Different schema types per page
- ✅ Using arrays or @graph structures

### Context-Aware Recommendations (Not Penalties):
- FAQ schema: Recommend for pages with questions
- HowTo schema: Recommend for instructional content
- Organization schema: Recommend for business sites
- LocalBusiness schema: Recommend for local businesses

**Philosophy**: Gemini AI should recommend appropriate schema types based on content context, not deterministic penalties for missing specific types.

---

## ✅ BRAND CONSISTENCY BEST PRACTICES

### What We SHOULD Recognize as PERFECT:
1. **Same brand name in all Organization schemas** = 100%
2. **Brand name in 80%+ of titles** = 100%
3. **Consistent meta description lengths** = Good

### What We SHOULD Penalize:
- ❌ Multiple brand names in schema
- ❌ Brand name missing from titles
- ❌ Wildly inconsistent description lengths

### What We SHOULD NOT Penalize:
- ✅ Homepage having more branding than internal pages
- ✅ Not repeating location/services everywhere
- ✅ Different title patterns for different page types

---

## 🎯 SCORING PHILOSOPHY

### Our Approach:
1. **Recognize modern patterns** - Don't penalize 2026 best practices
2. **Penalize real problems** - Missing data, errors, bad UX
3. **Don't penalize style choices** - Arrays vs objects, distributed vs monolithic
4. **Context matters** - Homepage ≠ blog post ≠ contact page

### Severity Levels:
- **CRITICAL (-20 to -30 pts)**: Breaks functionality, Google can't parse
- **HIGH (-10 to -15 pts)**: Limits rich results, reduces visibility
- **MEDIUM (-5 to -10 pts)**: Minor optimization opportunity
- **LOW (0 to -5 pts)**: Nice-to-have, minimal impact

---

## 📋 VALIDATION CHECKLIST

Before penalizing anything, ask:
1. ✅ Is this actually harmful to SEO/AEO/GEO?
2. ✅ Does Google's documentation say this is wrong?
3. ✅ Would fixing this improve rankings/visibility?
4. ✅ Is this a real problem or just a style preference?

If you can't answer YES to all 4, don't penalize it!

---

## 🔄 CONTINUOUS IMPROVEMENT

This document should be updated as:
- Google updates guidelines
- Schema.org adds new types
- AI engines change citation behavior
- Industry best practices evolve

**Last Updated:** March 2026
**Next Review:** June 2026
