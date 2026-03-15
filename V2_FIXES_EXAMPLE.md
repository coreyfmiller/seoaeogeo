# V2 Actionable Fixes - Example Output

## What You'll See for PizzaTwice.com

After running the audit, scroll down to see the "Actionable Fixes" section with prioritized issues:

---

## 🔴 CRITICAL Issues (Fix These First)

### 1. Content Depth - AEO (-20 points)

**Issue:**
Only 282 words - thin content is invisible to AI (need 800+ words)

**Why this matters:**
Thin content (under 300 words) rarely ranks. Search engines prefer comprehensive content that thoroughly covers topics. AI systems like ChatGPT, Gemini, and Perplexity need substantial content to cite and reference. Pages under 300 words are essentially invisible to AI search engines.

**How to fix:**
Expand content to at least 800 words. Add sections covering:
- What: Define your product/service clearly
- Why: Explain benefits and value proposition
- How: Describe process or usage
- Benefits: List specific advantages
- Examples: Provide real-world use cases
- FAQs: Answer 5-10 common questions

Focus on depth over length - add value, not fluff.

---

## ⚠️ WARNING Issues (Important)

### 2. Question Answering - AEO (-20 points)

**Issue:**
Content does not directly answer common questions

**Why this matters:**
AI systems prioritize content that directly answers questions. Content without clear Q&A patterns gets ignored. When users ask "What are the best pizza places in Oromocto?", AI systems look for pages that directly answer this question format.

**How to fix:**
Add FAQ section with 5-10 common questions:
```html
<h3>What types of pizza do you offer?</h3>
<p>We offer traditional, gourmet, and specialty pizzas including...</p>

<h3>Do you deliver to Oromocto?</h3>
<p>Yes, we deliver throughout Oromocto within 30 minutes...</p>
```

Start answers with direct responses (Yes/No, specific numbers). Use question format in headings.

---

### 3. Entity Density - AEO (-15 points)

**Issue:**
Low density of named entities and specific facts

**Why this matters:**
AI systems look for specific entities (people, places, things, concepts). Low entity density suggests vague, unhelpful content. Entities help AI understand context and relevance.

**How to fix:**
Add specific names, numbers, dates, and locations:
- Replace "many years" with "since 2008"
- Replace "various toppings" with "pepperoni, mushrooms, olives, and 15 other toppings"
- Replace "local area" with "Oromocto, New Brunswick"
- Add specific product names, prices, and quantities
- Link to Wikipedia for key entities (e.g., "Oromocto, New Brunswick")

---

### 4. Formatting - AEO (-15 points)

**Issue:**
Poor formatting or lack of conciseness

**Why this matters:**
AI systems prefer well-formatted, concise content. Walls of text or poor structure make content hard to parse and cite. Good formatting improves both human and AI readability.

**How to fix:**
Improve content structure:
- Break up long paragraphs (3-4 sentences max)
- Use bullet points for lists
- Add subheadings every 200-300 words
- Use bold for key terms (sparingly)
- Add white space between sections
- Keep sentences under 20 words when possible

Example:
```
❌ Bad: We have many different types of pizza with various toppings and sizes available for delivery or pickup and we also offer specials on certain days...

✅ Good:
Pizza Options:
• Traditional pizzas (pepperoni, cheese, veggie)
• Gourmet pizzas (BBQ chicken, Hawaiian, meat lovers)
• Custom pizzas (choose from 20+ toppings)

Available in 3 sizes: Small (10"), Medium (12"), Large (14")
```

---

### 5. Definitions - AEO (-10 points)

**Issue:**
Missing clear definition statements

**Why this matters:**
Clear definition statements help AI systems understand and explain concepts. Missing definitions reduce citation likelihood. AI systems often pull definitions directly for featured snippets and AI responses.

**How to fix:**
Start with a clear definition:
```
Pizza Twice is a family-owned pizzeria in Oromocto, New Brunswick that specializes in traditional and gourmet pizzas with fresh, locally-sourced ingredients.
```

Format: "X is [category] that [key characteristic]"

Add definitions for key terms:
- "Gourmet pizza: Premium pizzas featuring specialty ingredients like..."
- "Wood-fired: Pizzas cooked in a traditional wood-burning oven at..."

---

### 6. Image Accessibility - GEO (-10 points)

**Issue:**
58% alt text coverage - aim for 100%

**Why this matters:**
AI systems cannot "see" images without alt text. Missing alt text creates blind spots in AI understanding of your content. Alt text is also critical for accessibility and SEO.

**How to fix:**
Add descriptive alt text to all images:

```html
❌ Bad: <img src="pizza.jpg" alt="pizza">

✅ Good: <img src="pizza.jpg" alt="Large pepperoni pizza with melted mozzarella cheese on wooden serving board at Pizza Twice restaurant">
```

Format: "what + where + why"
- What: Describe what's in the image
- Where: Add context/location if relevant
- Why: Include purpose or action if applicable

Be specific and descriptive. Include relevant keywords naturally.

---

### 7. Expertise - GEO (-20 points)

**Issue:**
Missing expertise signals and credentials

**Why this matters:**
AI systems look for expertise signals (credentials, experience, data). Content without these signals is considered less authoritative. E-E-A-T (Experience, Expertise, Authoritativeness, Trust) is critical for rankings.

**How to fix:**
Add expertise signals:

1. **About Section:**
```
About Pizza Twice
Founded in 2008 by Chef Mario Rossi, a third-generation pizzaiolo trained in Naples, Italy. Over 15 years serving Oromocto with authentic Italian pizza.
```

2. **Credentials:**
- Years in business
- Training/certifications
- Awards or recognition
- Customer testimonials
- Press mentions

3. **Author Bio:**
If you have a blog, add author bios with credentials and links to professional profiles (LinkedIn, etc.)

---

### 8. Data & Facts - GEO (-15 points)

**Issue:**
Lacks specific data, statistics, and facts

**Why this matters:**
AI systems prioritize content with specific data, statistics, and facts. Vague claims without evidence are ignored. Data makes content more credible and citable.

**How to fix:**
Add specific numbers and data:

❌ Vague: "We serve many customers"
✅ Specific: "We serve over 500 customers weekly"

❌ Vague: "Fast delivery"
✅ Specific: "Average delivery time: 28 minutes"

❌ Vague: "Quality ingredients"
✅ Specific: "100% Canadian beef, organic vegetables from local farms, imported Italian mozzarella"

Include:
- Prices
- Quantities
- Percentages
- Time frames
- Measurements
- Customer counts
- Years in business

Cite sources for statistics: "According to [Source], [statistic]"

---

## Summary

**Total Points Lost: 145 points**

**Priority Order:**
1. ✅ Expand content to 800+ words (fixes 3 issues: depth, Q&A, entities)
2. ✅ Add FAQ section with 5-10 questions
3. ✅ Improve formatting with bullets, headings, white space
4. ✅ Add clear definition statements
5. ✅ Complete alt text for all images
6. ✅ Add expertise signals and credentials
7. ✅ Include specific data, numbers, and statistics

**Expected Score Improvement:**
- Current: AEO 11, GEO 55
- After fixes: AEO 90+, GEO 90+

**Time Estimate:**
- Quick wins (2-3 hours): Alt text, definitions, data
- Major work (1-2 days): Content expansion, FAQ section
- Total: 2-3 days for comprehensive fixes

---

## Next Steps

1. Start with content expansion (biggest impact)
2. Add FAQ section while writing
3. Improve formatting as you go
4. Add alt text to images (quick win)
5. Include expertise signals and data
6. Re-run audit to verify improvements

Each fix includes specific examples and templates you can adapt for your site!
