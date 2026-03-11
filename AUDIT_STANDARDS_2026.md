# SearchIQ Audit Standards & Methodology
## Comprehensive Testing Framework for Modern Search Intelligence (2026)

---

## Table of Contents
1. [Overview](#overview)
2. [The Three Pillars: SEO, AEO, GEO](#the-three-pillars)
3. [SEO Standards (Search Engine Optimization)](#seo-standards)
4. [AEO Standards (Answer Engine Optimization)](#aeo-standards)
5. [GEO Standards (Generative Engine Optimization)](#geo-standards)
6. [Technical Infrastructure Standards](#technical-infrastructure-standards)
7. [Schema & Structured Data Standards](#schema--structured-data-standards)
8. [Content Quality Standards](#content-quality-standards)
9. [Scoring Methodology](#scoring-methodology)
10. [Industry Evolution & Future-Proofing](#industry-evolution--future-proofing)

---

## Overview

SearchIQ evaluates websites against modern search intelligence standards that reflect the evolving landscape of how content is discovered, understood, and recommended in 2026. Our audit framework recognizes that traditional search engines (Google, Bing) now coexist with answer engines (featured snippets, knowledge panels) and generative AI systems (ChatGPT, Gemini, Perplexity).

### Core Philosophy
- **Multi-Engine Optimization**: Content must perform across traditional search, answer engines, and AI systems
- **Semantic Understanding**: Focus on meaning and context, not just keywords
- **User Intent Alignment**: Match content to how people actually search and ask questions
- **Future-Proof Standards**: Anticipate where search technology is heading

---

## The Three Pillars

### SEO (Search Engine Optimization)
**Purpose**: Maximize visibility in traditional search engine results (Google, Bing, DuckDuckGo)

**Focus Areas**:
- Crawlability and indexability
- Technical performance
- On-page optimization
- Link architecture
- Mobile responsiveness

### AEO (Answer Engine Optimization)
**Purpose**: Optimize for featured snippets, knowledge panels, and direct answer formats

**Focus Areas**:
- Question-answer matching
- Structured data implementation
- Content formatting for extraction
- Entity recognition
- Snippet eligibility

### GEO (Generative Engine Optimization)
**Purpose**: Maximize citation likelihood in AI-generated responses (ChatGPT, Gemini, Perplexity, etc.)

**Focus Areas**:
- Content trustworthiness
- Expertise signals
- Factual accuracy
- Neutral tone
- Citation-worthy formatting

---

## SEO Standards (Search Engine Optimization)

### 1. Technical Foundation (30 points)

#### 1.1 Page Performance
- **Response Time**: < 200ms (excellent), < 500ms (good), < 1000ms (acceptable)
- **HTTPS**: Required for all pages (security standard since 2014)
- **Mobile Responsiveness**: Viewport meta tag, responsive design
- **Core Web Vitals**: LCP, FID, CLS within acceptable ranges

#### 1.2 Crawlability
- **Robots.txt**: Properly configured, not blocking critical resources
- **XML Sitemap**: Present and submitted to search engines
- **Internal Linking**: Logical hierarchy, no orphan pages
- **URL Structure**: Clean, descriptive, hierarchical

#### 1.3 Indexability
- **Canonical Tags**: Prevent duplicate content issues
- **Meta Robots**: Proper use of noindex/nofollow where appropriate
- **Pagination**: Correct implementation of rel=next/prev or view-all
- **Hreflang**: International targeting (if applicable)

### 2. On-Page Optimization (40 points)

#### 2.1 Title Tags
- **Length**: 50-60 characters (optimal for display)
- **Uniqueness**: Every page has unique title
- **Keyword Placement**: Primary keyword near beginning
- **Brand Inclusion**: Company name at end (optional but recommended)
- **Compelling Copy**: Encourages clicks, not just keyword stuffing

**Scoring**:
- Perfect (10 pts): 50-60 chars, unique, keyword-optimized
- Good (7 pts): 40-70 chars, unique, has keywords
- Fair (4 pts): Present but too short/long or generic
- Poor (0 pts): Missing, duplicate, or >70 chars

#### 2.2 Meta Descriptions
- **Length**: 150-160 characters (optimal for display)
- **Uniqueness**: Every page has unique description
- **Call-to-Action**: Encourages clicks
- **Keyword Inclusion**: Natural integration of target keywords
- **Accurate Summary**: Reflects actual page content

**Scoring**:
- Perfect (10 pts): 150-160 chars, unique, compelling
- Good (7 pts): 120-170 chars, unique, descriptive
- Fair (4 pts): Present but too short/long
- Poor (0 pts): Missing, duplicate, or >200 chars

#### 2.3 Heading Structure
- **H1 Tag**: One per page, describes main topic
- **H2-H6 Hierarchy**: Logical structure, not skipping levels
- **Keyword Usage**: Natural integration in headings
- **Descriptive**: Headings convey content structure

**Scoring**:
- Perfect (10 pts): Single H1, logical H2-H3 hierarchy
- Good (7 pts): Has H1, some hierarchy
- Fair (4 pts): Multiple H1s or poor hierarchy
- Poor (0 pts): No H1 or chaotic structure

#### 2.4 Content Quality
- **Word Count**: Sufficient depth for topic (varies by intent)
- **Readability**: Appropriate for target audience
- **Keyword Density**: Natural, not stuffed (1-2% guideline)
- **Topic Coverage**: Comprehensive treatment of subject
- **Freshness**: Updated regularly for time-sensitive topics

### 3. Link Architecture (20 points)

#### 3.1 Internal Linking
- **Navigation**: Clear, logical site structure
- **Contextual Links**: Related content linked naturally
- **Anchor Text**: Descriptive, varied
- **Depth**: Important pages within 3 clicks of homepage
- **Orphan Pages**: None (all pages linked from somewhere)

#### 3.2 External Linking
- **Outbound Links**: To authoritative sources (builds trust)
- **Link Quality**: Relevant, reputable sites
- **Nofollow Usage**: Appropriate for untrusted content
- **Broken Links**: None (regular audits)

### 4. Image Optimization (10 points)

#### 4.1 Alt Text
- **Coverage**: All images have descriptive alt text
- **Quality**: Describes image content and context
- **Keyword Integration**: Natural, not stuffed
- **Accessibility**: Helps screen readers

#### 4.2 Technical
- **File Size**: Optimized for web (WebP, compression)
- **Dimensions**: Appropriate for display size
- **Lazy Loading**: Implemented for below-fold images
- **Responsive**: Serves appropriate sizes for device

---

## AEO Standards (Answer Engine Optimization)

### 1. Question-Answer Matching (30 points)

#### 1.1 Direct Answers
- **Who**: Identifies people, organizations, entities
- **What**: Defines terms, concepts, products
- **Where**: Provides locations, directions
- **When**: Specifies times, dates, schedules
- **Why**: Explains reasons, causes, motivations
- **How**: Describes processes, methods, steps

**Scoring**: Points awarded for each question type addressed (5 pts each)

#### 1.2 Answer Format
- **Conciseness**: Direct answer in first 40-60 words
- **Clarity**: Simple, jargon-free language
- **Completeness**: Fully answers the question
- **Context**: Provides necessary background

### 2. Structured Data Implementation (40 points)

#### 2.1 Schema.org Markup
- **Presence**: JSON-LD structured data on page
- **Validity**: Passes schema.org validation
- **Completeness**: All required properties included
- **Relevance**: Appropriate schema types for content

**Common Schema Types**:
- **Organization**: Company info, logo, social profiles
- **LocalBusiness**: Address, hours, contact info
- **Article**: News, blog posts, editorial content
- **Product**: E-commerce items with pricing, availability
- **FAQ**: Frequently asked questions
- **HowTo**: Step-by-step instructions
- **Review**: Ratings and reviews
- **Event**: Dates, locations, tickets
- **Recipe**: Ingredients, instructions, nutrition
- **VideoObject**: Video content metadata

#### 2.2 Modern Schema Standards (2026)
- **Arrays at Root**: Valid and preferred (not penalized)
- **@graph Structure**: Properly parsed and understood
- **Multiple Blocks**: Acceptable for complex pages
- **Distributed Schema**: Related entities across multiple blocks

**What We DON'T Penalize** (Legacy Misconceptions):
- ❌ Root-level arrays
- ❌ @graph structures
- ❌ Multiple schema blocks per page
- ❌ Distributed schema patterns

**What We DO Penalize**:
- ✅ Missing required properties
- ✅ Placeholder data (000-0000, example@example.com)
- ✅ Invalid JSON syntax
- ✅ Wrong schema type for content

### 3. Content Formatting (20 points)

#### 3.1 Lists and Tables
- **Bullet Points**: Key information in scannable format
- **Numbered Lists**: Step-by-step processes
- **Tables**: Comparative data, specifications
- **Definitions**: Clear term explanations

#### 3.2 Featured Snippet Optimization
- **Paragraph Snippets**: 40-60 word direct answers
- **List Snippets**: 3-8 item lists
- **Table Snippets**: Comparison tables with headers
- **Video Snippets**: Timestamped content

### 4. Entity Recognition (10 points)

#### 4.1 Named Entities
- **People**: Full names, titles, credentials
- **Organizations**: Official names, acronyms
- **Places**: Specific locations, addresses
- **Products**: Brand names, model numbers
- **Events**: Dates, names, locations

#### 4.2 Entity Linking
- **Wikipedia Links**: To establish entity relationships
- **Official Sources**: To authoritative references
- **Consistent Naming**: Same entity referenced consistently

---

## GEO Standards (Generative Engine Optimization)

### 1. Content Trustworthiness (25 points)

#### 1.1 Expertise Signals
- **Author Credentials**: Qualifications, experience listed
- **About Pages**: Detailed company/author information
- **Credentials**: Certifications, awards, recognition
- **Experience**: Years in industry, case studies
- **Authority**: Published works, speaking engagements

**Scoring**:
- Strong signals (20 pts): Multiple credentials, detailed bios
- Moderate signals (10 pts): Some credentials present
- Weak signals (0 pts): No expertise indicators

#### 1.2 Factual Accuracy
- **Citations**: Links to sources for claims
- **Data**: Specific numbers, statistics, studies
- **Dates**: Current information, last updated
- **Verification**: Cross-referenced facts
- **Corrections**: Transparent error handling

### 2. Tone and Objectivity (25 points)

#### 2.1 Neutral Tone
- **Promotional Language**: Avoid "best," "amazing," "revolutionary"
- **First-Person Usage**: Minimize "we," "our," "us"
- **Objective Statements**: Facts over opinions
- **Balanced Perspective**: Acknowledge limitations
- **Professional Voice**: Informative, not salesy

**Penalties**:
- Heavy promotional tone: -20 pts
- Excessive first-person: -10 pts
- Unsubstantiated claims: -10 pts

#### 2.2 Writing Quality
- **Clarity**: Simple, direct language
- **Conciseness**: No unnecessary words
- **Structure**: Logical flow, clear organization
- **Grammar**: Professional, error-free
- **Readability**: Appropriate for audience

### 3. Citation-Worthy Formatting (25 points)

#### 3.1 Definition Statements
- **Clear Definitions**: "X is [category] that [key characteristic]"
- **Context**: Background information provided
- **Examples**: Concrete illustrations
- **Comparisons**: Relates to known concepts

#### 3.2 Quotable Content
- **Key Takeaways**: Highlighted important points
- **Statistics**: Specific, cited data
- **Expert Quotes**: Attributed statements
- **Summaries**: Concise recaps of complex topics

### 4. Image Accessibility (25 points)

#### 4.1 Alt Text Coverage
- **Percentage**: % of images with alt text
- **Quality**: Descriptive, contextual
- **Completeness**: All meaningful images covered

**Scoring**:
- 90-100% coverage: 25 pts
- 70-89% coverage: 15 pts
- 50-69% coverage: 5 pts
- <50% coverage: 0 pts (critical issue)

**Why It Matters**: AI systems cannot "see" images without alt text. Missing alt text creates blind spots in AI understanding of your content.

---

## Technical Infrastructure Standards

### 1. Performance Benchmarks

#### 1.1 Response Time
- **Excellent**: < 200ms
- **Good**: 200-500ms
- **Acceptable**: 500-1000ms
- **Poor**: > 1000ms

#### 1.2 Page Size
- **Optimal**: < 1MB total
- **Acceptable**: 1-3MB
- **Heavy**: > 3MB (needs optimization)

### 2. Security Standards

#### 2.1 HTTPS
- **Required**: All pages served over HTTPS
- **Certificate**: Valid, not expired
- **Mixed Content**: No HTTP resources on HTTPS pages
- **HSTS**: HTTP Strict Transport Security enabled

#### 2.2 Security Headers
- **Content-Security-Policy**: XSS protection
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection

### 3. Mobile Standards

#### 3.1 Responsive Design
- **Viewport Meta**: Properly configured
- **Touch Targets**: Minimum 48x48px
- **Font Size**: Readable without zooming (16px minimum)
- **Horizontal Scrolling**: None required

#### 3.2 Mobile Performance
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

---

## Schema & Structured Data Standards

### 1. Implementation Requirements

#### 1.1 Format
- **JSON-LD**: Preferred format (not Microdata or RDFa)
- **Placement**: In `<head>` or `<body>`
- **Validation**: Passes Google Rich Results Test
- **Syntax**: Valid JSON, no errors

#### 1.2 Required Properties

**Organization Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "customer service"
  }
}
```

**LocalBusiness Schema** (additional requirements):
- address (PostalAddress)
- geo (GeoCoordinates)
- openingHoursSpecification
- priceRange (optional but recommended)

**Article Schema**:
- headline
- image
- datePublished
- dateModified
- author
- publisher

### 2. Quality Standards

#### 2.1 Completeness
- All required properties present
- Optional properties included where relevant
- Nested objects fully populated

#### 2.2 Accuracy
- Data matches visible page content
- No placeholder values
- Current information (not outdated)
- Consistent across pages

### 3. Modern Schema Patterns (2026)

#### 3.1 Accepted Patterns
- **Root Arrays**: `[{schema1}, {schema2}]`
- **@graph**: `{"@graph": [{entity1}, {entity2}]}`
- **Multiple Blocks**: Separate `<script>` tags for different schemas
- **Nested Entities**: Related entities within parent schema

#### 3.2 Best Practices
- Use specific types over generic (LocalBusiness > Organization)
- Include all relevant properties, not just required ones
- Link related entities with @id references
- Keep schema close to related content

---

## Content Quality Standards

### 1. Semantic Flags (AI-Evaluated)

#### 1.1 Topic Alignment
- **Definition**: Content matches title and meta description
- **Evaluation**: AI checks if content delivers on promise
- **Penalty**: -15 pts if misaligned

#### 1.2 Keyword Stuffing
- **Definition**: Unnatural repetition of keywords
- **Threshold**: > 3% keyword density
- **Penalty**: -10 pts if detected

#### 1.3 Readability
- **Definition**: Content is clear and understandable
- **Factors**: Sentence length, vocabulary, structure
- **Penalty**: -10 pts if poor

#### 1.4 Question-Answer Matching
- **Definition**: Content directly answers common questions
- **Evaluation**: Presence of who/what/where/when/why/how
- **Penalty**: -15 pts if lacking

#### 1.5 Entity Density
- **Definition**: Presence of named entities (people, places, things)
- **Evaluation**: AI identifies and counts entities
- **Penalty**: -10 pts if low

#### 1.6 Formatting & Conciseness
- **Definition**: Content is well-structured and scannable
- **Factors**: Headings, lists, paragraphs, white space
- **Penalty**: -10 pts if poor

#### 1.7 Definition Statements
- **Definition**: Clear explanations of key terms
- **Format**: "X is [category] that [characteristic]"
- **Penalty**: -10 pts if lacking

#### 1.8 Promotional Tone
- **Definition**: Overly salesy or biased language
- **Indicators**: "best," "amazing," "revolutionary," excessive superlatives
- **Penalty**: -20 pts (GEO impact)

#### 1.9 Expertise Signals
- **Definition**: Indicators of author/company expertise
- **Indicators**: Credentials, experience, case studies
- **Penalty**: -20 pts if lacking (GEO impact)

#### 1.10 Hard Data
- **Definition**: Specific facts, statistics, numbers
- **Evaluation**: Presence of quantifiable information
- **Penalty**: -15 pts if lacking (GEO impact)

#### 1.11 First-Person Usage
- **Definition**: Frequency of "I," "we," "our," "us"
- **Threshold**: > 5% of content
- **Penalty**: -10 pts if excessive (GEO impact)

#### 1.12 Unsubstantiated Claims
- **Definition**: Statements without evidence or citations
- **Indicators**: "Studies show" without links, vague claims
- **Penalty**: -10 pts (GEO impact)

### 2. Content Depth

#### 2.1 Word Count Guidelines
- **Thin Content**: < 300 words (usually insufficient)
- **Adequate**: 300-600 words (depends on topic)
- **Comprehensive**: 600-1500 words (most topics)
- **In-Depth**: 1500+ words (complex topics)

**Note**: Quality > quantity. A 400-word page that perfectly answers a question beats a 2000-word page that doesn't.

#### 2.2 Topic Coverage
- **Breadth**: Covers main aspects of topic
- **Depth**: Sufficient detail for user intent
- **Completeness**: Answers follow-up questions
- **Uniqueness**: Adds value beyond existing content

---

## Scoring Methodology

### 1. Component-Based Scoring (V2 System)

#### 1.1 SEO Score (100 points total)

**Technical Foundation** (30 pts):
- HTTPS: 10 pts
- Response Time: 10 pts
- Mobile Responsive: 10 pts

**On-Page Optimization** (40 pts):
- Title Tag: 10 pts
- Meta Description: 10 pts
- H1 Tag: 10 pts
- Content Quality: 10 pts

**Schema & Structure** (20 pts):
- Schema Presence: 10 pts
- Schema Quality: 10 pts

**Content Signals** (10 pts):
- Semantic Flags: Variable penalties

#### 1.2 AEO Score (100 points total)

**Question Coverage** (30 pts):
- Who/What/Where/When/Why/How: 5 pts each

**Schema Implementation** (40 pts):
- Schema Presence: 20 pts
- Schema Quality: 20 pts

**Content Format** (20 pts):
- Lists & Structure: 10 pts
- Definition Statements: 10 pts

**Entity Recognition** (10 pts):
- Named Entities: 10 pts

#### 1.3 GEO Score (100 points total)

**Image Accessibility** (25 pts):
- Alt text coverage: 0-25 pts based on %

**Tone** (20 pts):
- Promotional tone: -20 pts if detected

**Expertise** (20 pts):
- Expertise signals: -20 pts if lacking

**Data & Facts** (15 pts):
- Hard data: -15 pts if lacking

**Objectivity** (10 pts):
- First-person usage: -10 pts if excessive

**Claims** (10 pts):
- Unsubstantiated claims: -10 pts if present

### 2. Penalty System

#### 2.1 Critical Issues (Immediate Impact)
- Missing H1: -10 pts (SEO)
- No HTTPS: -10 pts (SEO)
- < 50% alt text: -25 pts (GEO)
- No schema: -20 pts (AEO)

#### 2.2 Warning Issues (Moderate Impact)
- Suboptimal title length: -3 pts (SEO)
- Missing meta description: -10 pts (SEO)
- Poor schema quality: -10 pts (AEO)
- Promotional tone: -20 pts (GEO)

#### 2.3 Info Issues (Minor Impact)
- Suggestions for improvement
- Best practice recommendations
- No point deductions

### 3. Grade Boundaries

**A Grade (90-100)**:
- Exceptional implementation
- Follows all best practices
- Ready for modern search landscape

**B Grade (80-89)**:
- Strong implementation
- Minor improvements needed
- Competitive in search

**C Grade (70-79)**:
- Adequate implementation
- Several improvements recommended
- Functional but not optimized

**D Grade (60-69)**:
- Below standard
- Significant issues present
- Needs attention

**F Grade (< 60)**:
- Critical issues
- Major problems affecting visibility
- Immediate action required

---

## Industry Evolution & Future-Proofing

### 1. The Changing Search Landscape

#### 1.1 From Keywords to Intent
- **Past**: Exact keyword matching
- **Present**: Semantic understanding, context
- **Future**: Conversational AI, multimodal search

#### 1.2 From Pages to Entities
- **Past**: Ranking web pages
- **Present**: Understanding entities and relationships
- **Future**: Knowledge graphs, entity-first results

#### 1.3 From Links to Trust
- **Past**: Link quantity as authority signal
- **Present**: Link quality, E-E-A-T signals
- **Future**: AI-verified expertise, real-world credentials

### 2. Emerging Standards

#### 2.1 AI-First Content
- **Structured for Extraction**: Easy for AI to parse and cite
- **Factual Accuracy**: Verifiable claims with sources
- **Neutral Tone**: Informative, not promotional
- **Entity-Rich**: Clear identification of people, places, things

#### 2.2 Multimodal Optimization
- **Images**: Descriptive alt text, contextual relevance
- **Video**: Transcripts, timestamps, chapters
- **Audio**: Transcripts, speaker identification
- **Interactive**: Accessible, crawlable content

#### 2.3 Conversational Search
- **Natural Language**: Content that answers how people actually ask
- **Follow-Up Questions**: Anticipates next questions
- **Context Awareness**: Understands user journey
- **Personalization**: Adapts to user preferences

### 3. Future-Proof Strategies

#### 3.1 Focus on Fundamentals
- **Quality Content**: Always the foundation
- **User Experience**: Fast, accessible, mobile-friendly
- **Technical Excellence**: Clean code, proper structure
- **Semantic Markup**: Helps all systems understand content

#### 3.2 Embrace New Technologies
- **Structured Data**: Implement and maintain
- **AI-Friendly Formatting**: Clear, scannable, quotable
- **Accessibility**: Benefits humans and machines
- **Performance**: Speed matters more than ever

#### 3.3 Monitor and Adapt
- **Track Changes**: Search algorithms evolve constantly
- **Test and Measure**: What works for your audience
- **Stay Informed**: Industry news, best practices
- **Iterate**: Continuous improvement, not one-time fixes

---

## Conclusion

SearchIQ's audit standards reflect the reality of modern search: it's no longer just about ranking in Google. Content must perform across traditional search engines, answer engines, and generative AI systems. By following these standards, websites can maximize visibility across all channels while future-proofing against the evolving search landscape.

Our methodology combines:
- **Industry Best Practices**: Proven SEO fundamentals
- **Modern Standards**: AEO and GEO optimization
- **AI-Powered Analysis**: Semantic understanding at scale
- **Future-Proof Approach**: Anticipating where search is heading

The result is a comprehensive audit that tells you not just what's wrong, but why it matters and how to fix it.

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Next Review**: June 2026

*This document is maintained by the SearchIQ team and updated quarterly to reflect evolving search standards and industry best practices.*
