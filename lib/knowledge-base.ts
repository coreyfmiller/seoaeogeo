/**
 * Duelly Knowledge Base
 * Static, curated library of SEO/AEO/GEO terms, best practices, and actionable tips.
 * No AI calls needed — instant, consistent, expandable.
 *
 * Usage: import { getKnowledge, getAllTerms } from '@/lib/knowledge-base'
 *        const entry = getKnowledge('domain-authority')
 */

export interface KnowledgeEntry {
  id: string
  term: string
  category: 'seo' | 'aeo' | 'geo' | 'technical' | 'backlinks' | 'local' | 'content' | 'platform'
  shortDesc: string
  fullDesc: string
  whyItMatters: string
  tips: string[]
  benchmarks?: { good: string; average: string; poor: string }
  learnMoreUrl?: string
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ═══════════════════════════════════════
  // BACKLINKS & AUTHORITY
  // ═══════════════════════════════════════
  {
    id: 'domain-authority',
    term: 'Domain Authority (DA)',
    category: 'backlinks',
    shortDesc: 'A 0-100 score predicting how well a site will rank in search results.',
    fullDesc: 'Domain Authority is a score developed by Moz that predicts how likely a website is to rank in search engine results. It is calculated based on the quantity and quality of backlinks pointing to your domain. DA is not a Google ranking factor directly, but it correlates strongly with actual rankings because it measures the same underlying signals Google cares about.',
    whyItMatters: 'Sites with higher DA consistently outrank sites with lower DA for competitive keywords. If your competitor has DA 45 and you have DA 12, even perfect on-page optimization may not be enough to outrank them. DA is the single best predictor of ranking potential.',
    tips: [
      'Claim free directory listings (Google Business Profile, Yelp, industry directories)',
      'Build partnerships with local businesses and ask for reciprocal links',
      'Create genuinely useful content that others want to reference and link to',
      'Join your local Chamber of Commerce — they typically have DA 40-60',
      'Get mentioned in local news and media outlets',
      'Guest post on relevant industry blogs',
    ],
    benchmarks: { good: 'DA 40+ (competitive for most keywords)', average: 'DA 20-40 (competitive for low-medium difficulty)', poor: 'DA 1-20 (need active link building)' },
    learnMoreUrl: '/blog/backlinks-explained',
  },
  {
    id: 'backlinks',
    term: 'Backlinks',
    category: 'backlinks',
    shortDesc: 'Links from other websites pointing to yours — like referrals for your site.',
    fullDesc: 'A backlink is a link from another website to yours. When a local newspaper, directory, partner, or blogger links to your site, that counts as a backlink. Search engines treat backlinks as votes of confidence — the more quality votes you have, the more trustworthy your site appears.',
    whyItMatters: 'Backlinks are one of the top 3 ranking factors Google uses. The #1 result on Google has an average of 3.8x more backlinks than results in positions 2-10. Pages with zero backlinks almost never rank on page 1 for competitive keywords.',
    tips: [
      'Focus on quality over quantity — one link from a news site beats 100 from junk sites',
      'Check your backlink profile quarterly using Google Search Console or Moz',
      'Disavow toxic/spammy links through Google Search Console',
      'Create linkable assets: guides, tools, local resource lists, original research',
      'Reach out to sites that mention you but don\'t link — ask for the link',
    ],
    benchmarks: { good: '50+ linking domains', average: '10-50 linking domains', poor: 'Under 10 linking domains' },
    learnMoreUrl: '/blog/backlinks-explained',
  },
  {
    id: 'spam-score',
    term: 'Spam Score',
    category: 'backlinks',
    shortDesc: 'The likelihood that your site could be penalized based on its backlink profile.',
    fullDesc: 'Spam Score is a Moz metric (0-100%) that estimates the probability of a site being penalized or banned by search engines. It looks at patterns in your backlink profile that are associated with spammy or manipulative link building.',
    whyItMatters: 'A high spam score means questionable sites are linking to you, which can hurt your rankings. Google may interpret these as attempts to manipulate rankings and penalize your site.',
    tips: [
      'Keep spam score under 30% — anything higher needs attention',
      'Use Google Search Console\'s Disavow Tool to reject toxic links',
      'Audit your backlinks regularly and remove links from low-quality directories',
      'Never buy backlinks from services promising hundreds of links cheaply',
    ],
    benchmarks: { good: 'Under 10%', average: '10-30%', poor: 'Over 30% (action needed)' },
  },

  // ═══════════════════════════════════════
  // SEO FUNDAMENTALS
  // ═══════════════════════════════════════
  {
    id: 'title-tag',
    term: 'Title Tag',
    category: 'seo',
    shortDesc: 'The clickable headline that appears in search results for your page.',
    fullDesc: 'The title tag is an HTML element that specifies the title of a web page. It appears as the clickable headline in search engine results and in the browser tab. It is the single most important on-page SEO element because it tells both users and search engines what your page is about.',
    whyItMatters: 'Google uses the title tag as a primary ranking signal. A missing or poorly written title means search engines can\'t properly understand your page, and users have no reason to click your result in search.',
    tips: [
      'Keep it 50-60 characters — longer titles get cut off in search results',
      'Put your primary keyword near the beginning',
      'Make each page title unique across your entire site',
      'Format: "Primary Keyword - Secondary Info | Brand Name"',
      'Write for humans first, search engines second — it needs to be clickable',
    ],
    benchmarks: { good: '50-60 characters with primary keyword', average: 'Present but too long/short or missing keyword', poor: 'Missing entirely' },
  },
  {
    id: 'meta-description',
    term: 'Meta Description',
    category: 'seo',
    shortDesc: 'The snippet of text that appears below your title in search results.',
    fullDesc: 'The meta description is an HTML attribute that provides a brief summary of a web page. It appears as the description text below the title in search engine results. While not a direct ranking factor, it is the primary driver of click-through rate (CTR).',
    whyItMatters: 'A compelling meta description can increase clicks by 5-10%. Without one, Google auto-generates a snippet that may not represent your page well, leading to fewer visitors even if you rank well.',
    tips: [
      'Write 120-160 characters — shorter gets wasted space, longer gets truncated',
      'Include your primary keyword naturally',
      'Add a clear call-to-action ("Learn more", "Get started", "Shop now")',
      'Make each page description unique',
      'Think of it as a mini-ad for your page',
    ],
    benchmarks: { good: '120-160 characters with keyword and CTA', average: 'Present but generic or too short', poor: 'Missing entirely' },
  },
  {
    id: 'h1-tag',
    term: 'H1 Heading',
    category: 'seo',
    shortDesc: 'The main heading of your page — tells search engines what the page is about.',
    fullDesc: 'The H1 tag is the primary heading on a web page. It should clearly state the main topic of the page and contain your target keyword. There should be exactly one H1 per page, with H2-H6 tags used for subheadings to create a content hierarchy.',
    whyItMatters: 'Google uses the H1 as a strong relevance signal to understand your page topic. Missing H1 means crawlers can\'t determine what your page is about. Multiple H1s dilute the signal and confuse the content hierarchy.',
    tips: [
      'Use exactly one H1 per page',
      'Include your primary keyword in the H1',
      'Make it descriptive and specific to the page content',
      'Use H2-H6 for subheadings to create a clear hierarchy',
      'Don\'t use H1 for styling — use CSS instead',
    ],
    benchmarks: { good: 'One H1 with primary keyword', average: 'H1 present but missing keyword', poor: 'Missing H1 or multiple H1s' },
  },
  {
    id: 'internal-linking',
    term: 'Internal Links',
    category: 'seo',
    shortDesc: 'Links between pages on your own website that help search engines discover content.',
    fullDesc: 'Internal links are hyperlinks that point from one page on your website to another page on the same website. They help search engines discover and understand your site architecture, distribute ranking power across pages, and keep users engaged longer.',
    whyItMatters: 'Pages with no internal links are "orphaned" — search engines may never find them. Good internal linking distributes authority across your site and helps users navigate to related content, reducing bounce rate.',
    tips: [
      'Aim for 3-5 contextual internal links per page',
      'Use descriptive anchor text (not "click here")',
      'Link from high-authority pages to important pages that need a boost',
      'Add a "Related Posts" or "You May Also Like" section',
      'Ensure every important page is reachable within 3 clicks from the homepage',
    ],
    benchmarks: { good: '5+ internal links per page', average: '2-4 internal links', poor: '0-1 internal links (orphaned content)' },
  },
  {
    id: 'alt-text',
    term: 'Image Alt Text',
    category: 'seo',
    shortDesc: 'Descriptive text for images that search engines and screen readers use.',
    fullDesc: 'Alt text (alternative text) is an HTML attribute added to image tags that describes what the image shows. It serves two purposes: helping search engines understand image content (since they can\'t "see" images), and providing accessibility for users with screen readers.',
    whyItMatters: 'Images without alt text are invisible to search engines and screen readers. Google Image Search drives 22% of all web searches — missing alt text means you lose this traffic entirely. It\'s also legally required for accessibility compliance.',
    tips: [
      'Describe what the image actually shows, specifically',
      'Include relevant keywords naturally — don\'t stuff',
      'Keep alt text under 125 characters',
      'For decorative images, use empty alt text: alt=""',
      'Never start with "image of" or "picture of"',
      'Format: "[subject] [action/context] [setting]"',
    ],
    benchmarks: { good: '100% of content images have descriptive alt text', average: '50-90% coverage', poor: 'Under 50% coverage' },
  },
  {
    id: 'schema-markup',
    term: 'Schema Markup (Structured Data)',
    category: 'seo',
    shortDesc: 'Code that helps search engines understand your content and display rich results.',
    fullDesc: 'Schema markup is a standardized vocabulary (from schema.org) that you add to your HTML to help search engines understand the meaning of your content. It enables rich results in Google — star ratings, FAQ dropdowns, recipe cards, event listings, product prices, and more.',
    whyItMatters: 'Pages with schema markup get rich results in Google, which dramatically increase click-through rates (up to 58% more clicks). Schema also helps AI engines like ChatGPT and Perplexity understand and cite your content more accurately.',
    tips: [
      'Start with Organization schema (name, logo, contact info)',
      'Add the schema type that matches your business: LocalBusiness, Restaurant, Product, Article, etc.',
      'Use JSON-LD format (recommended by Google) — paste it in your <head> section',
      'Add FAQPage schema if you have an FAQ section',
      'Validate your schema at search.google.com/test/rich-results',
      'Most CMS platforms have plugins that add schema automatically (Yoast, RankMath, etc.)',
    ],
    benchmarks: { good: 'Multiple relevant schema types implemented and validated', average: 'Basic Organization schema only', poor: 'No schema markup at all' },
  },
  {
    id: 'core-web-vitals',
    term: 'Core Web Vitals',
    category: 'technical',
    shortDesc: 'Google\'s metrics for measuring your site\'s speed and user experience.',
    fullDesc: 'Core Web Vitals are a set of three metrics Google uses to measure real-world user experience on your site: LCP (Largest Contentful Paint) measures loading speed, INP (Interaction to Next Paint) measures responsiveness, and CLS (Cumulative Layout Shift) measures visual stability.',
    whyItMatters: 'Core Web Vitals are a confirmed Google ranking factor. Pages that take longer than 3 seconds to load lose 53% of mobile visitors. Slow sites have higher bounce rates, lower conversion rates, and worse rankings.',
    tips: [
      'Target LCP under 2.5 seconds (how fast your main content loads)',
      'Target INP under 200ms (how fast your site responds to clicks)',
      'Target CLS under 0.1 (how much your page layout shifts while loading)',
      'Compress images to WebP format, keep under 100KB each',
      'Use a CDN (Cloudflare free tier works well)',
      'Defer non-critical JavaScript with async/defer attributes',
    ],
    benchmarks: { good: 'All three metrics in "Good" range', average: 'One or two metrics need improvement', poor: 'Multiple metrics in "Poor" range' },
  },
  {
    id: 'https',
    term: 'HTTPS / SSL Certificate',
    category: 'technical',
    shortDesc: 'Encryption that secures your website and is required for Google ranking.',
    fullDesc: 'HTTPS (Hypertext Transfer Protocol Secure) encrypts data between your website and visitors\' browsers using an SSL/TLS certificate. It protects sensitive information like passwords and payment details, and is indicated by the padlock icon in the browser address bar.',
    whyItMatters: 'HTTPS is a confirmed Google ranking signal since 2014. Sites without SSL are marked "Not Secure" in Chrome, which destroys user trust — 85% of users will not continue browsing on an insecure site.',
    tips: [
      'Most hosting providers offer free SSL via Let\'s Encrypt',
      'Enable SSL in your hosting control panel',
      'Set up 301 redirects from http:// to https://',
      'Update all internal links to use https://',
      'Update your sitemap and Google Search Console to use https://',
    ],
    benchmarks: { good: 'HTTPS enabled with valid certificate', average: 'N/A', poor: 'No HTTPS — site marked "Not Secure"' },
  },
  {
    id: 'site-speed',
    term: 'Site Speed / Page Load Time',
    category: 'technical',
    shortDesc: 'How fast your website loads — directly impacts rankings and user experience.',
    fullDesc: 'Site speed measures how quickly your web pages load for visitors. It encompasses server response time, file sizes, number of requests, and rendering performance. Google measures this through Core Web Vitals and uses it as a ranking factor.',
    whyItMatters: 'Every second of load time costs you visitors. A 1-second delay in page load reduces conversions by 7%. Pages loading in 5+ seconds have a 90% bounce rate. Google explicitly penalizes slow sites in rankings.',
    tips: [
      'Compress all images before uploading (use TinyPNG or WebP format)',
      'Enable browser caching with proper Cache-Control headers',
      'Minify CSS and JavaScript files',
      'Use a CDN to serve content from servers closer to your visitors',
      'Remove unused plugins, scripts, and CSS',
      'Target under 2 seconds total load time',
    ],
    benchmarks: { good: 'Under 2 seconds', average: '2-4 seconds', poor: 'Over 4 seconds' },
  },
  {
    id: 'open-graph',
    term: 'Open Graph Tags',
    category: 'seo',
    shortDesc: 'Tags that control how your page looks when shared on social media.',
    fullDesc: 'Open Graph (OG) tags are HTML meta tags that control how your content appears when shared on Facebook, LinkedIn, Twitter, and other social platforms. They specify the title, description, and image that appear in the social media preview card.',
    whyItMatters: 'Without OG tags, social platforms guess what to show — often picking the wrong image or a truncated description. Proper OG tags make your shared links look professional and clickable, driving more traffic from social media.',
    tips: [
      'Add og:title, og:description, and og:image to every page',
      'Use a high-quality image at least 1200x630 pixels for og:image',
      'Keep og:title under 60 characters and og:description under 200',
      'Test your OG tags with Facebook\'s Sharing Debugger',
      'Add Twitter Card tags (twitter:card, twitter:title) for Twitter-specific previews',
    ],
    benchmarks: { good: 'All three OG tags present with quality image', average: 'Partial OG tags (missing image)', poor: 'No OG tags at all' },
  },
  {
    id: 'semantic-html',
    term: 'Semantic HTML',
    category: 'technical',
    shortDesc: 'HTML tags that give meaning to your content structure for search engines.',
    fullDesc: 'Semantic HTML uses tags like <main>, <nav>, <article>, <header>, <footer>, and <section> to describe the purpose of content, rather than just its appearance. These tags help search engines and AI systems understand your page structure.',
    whyItMatters: 'Without semantic HTML, crawlers see a flat document with no structural meaning. Semantic markup improves indexing accuracy, can influence featured snippet selection, and improves accessibility for screen readers.',
    tips: [
      'Wrap your main content in <main>',
      'Use <nav> for navigation menus',
      'Use <article> for blog posts and standalone content',
      'Use <header> and <footer> for page/section headers and footers',
      'Use <section> to group related content with headings',
    ],
    benchmarks: { good: 'Multiple semantic tags used correctly', average: 'Some semantic tags present', poor: 'No semantic HTML — all <div> tags' },
  },

  // ═══════════════════════════════════════
  // AEO (Answer Engine Optimization)
  // ═══════════════════════════════════════
  {
    id: 'aeo',
    term: 'AEO (Answer Engine Optimization)',
    category: 'aeo',
    shortDesc: 'Optimizing your content so AI assistants cite your website as a source.',
    fullDesc: 'AEO is the practice of structuring your content so that AI-powered answer engines like ChatGPT, Perplexity, Google AI Overviews, and Gemini recognize your site as an authoritative source and cite it in their responses. It focuses on clear definitions, Q&A formatting, structured data, and entity density.',
    whyItMatters: 'As more people use AI assistants to find information, being cited by these systems becomes a major traffic source. Sites optimized for AEO get recommended when users ask AI for advice, products, or services.',
    tips: [
      'Add clear definitions: "[Topic] is [category] that [key characteristic]"',
      'Create FAQ sections with direct, concise answers',
      'Use structured data (schema markup) so AI can parse your content',
      'Include specific facts, numbers, and named entities',
      'Structure content with clear headings that match common questions',
    ],
    learnMoreUrl: '/blog/what-is-aeo',
  },
  {
    id: 'entity-density',
    term: 'Entity Density',
    category: 'aeo',
    shortDesc: 'How many specific, named things (people, places, numbers) are in your content.',
    fullDesc: 'Entity density measures the concentration of named entities in your content — specific people, organizations, places, products, dates, prices, and statistics. AI systems use entities to verify facts and determine content authority.',
    whyItMatters: 'Content with high entity density is more likely to be cited by AI because it contains verifiable, specific information. Vague content ("many years ago", "some people") gives AI nothing concrete to reference.',
    tips: [
      'Replace vague terms with specifics: "since 2008" not "many years"',
      'Include exact numbers: "$2.4 million" not "millions of dollars"',
      'Name specific products, people, places, and organizations',
      'Cite sources with dates: "According to [Source] (2025)..."',
      'Use proper nouns instead of pronouns where possible',
    ],
    benchmarks: { good: 'Multiple specific entities per paragraph', average: 'Some specifics mixed with vague language', poor: 'Mostly vague, generic content' },
  },
  {
    id: 'question-answering',
    term: 'Q&A Content / FAQ Sections',
    category: 'aeo',
    shortDesc: 'Content structured as questions and answers that AI can directly cite.',
    fullDesc: 'Q&A content is structured in a question-and-answer format that AI systems can easily parse and cite. This includes FAQ sections, "How does X work?" explanations, and direct answers to common queries. AI assistants are fundamentally designed to answer questions, so they actively seek this format.',
    whyItMatters: 'Pages with clear Q&A formatting are 2-3x more likely to be cited in AI-generated answers. When someone asks ChatGPT a question, it looks for content that directly answers that question in a clear, concise format.',
    tips: [
      'Create an FAQ section with 5-10 common questions',
      'Start each answer with a direct response (yes/no, a number, a definition)',
      'Use H2 or H3 tags for each question',
      'Add FAQPage schema markup for rich results in Google',
      'Keep initial answers concise (2-4 sentences), then expand',
    ],
    benchmarks: { good: 'Dedicated FAQ section with schema markup', average: 'Some Q&A content but no schema', poor: 'No Q&A formatted content' },
  },

  // ═══════════════════════════════════════
  // GEO (Generative Engine Optimization)
  // ═══════════════════════════════════════
  {
    id: 'geo',
    term: 'GEO (Generative Engine Optimization)',
    category: 'geo',
    shortDesc: 'Optimizing for AI-generated search results and summaries.',
    fullDesc: 'GEO measures how well your content performs in AI-generated search results — Google AI Overviews, ChatGPT web search, Perplexity answers, and similar systems. It evaluates expertise signals, factual density, tone objectivity, and citation likelihood.',
    whyItMatters: 'AI search is replacing traditional "10 blue links" for many queries. If your content isn\'t structured for AI to understand and trust, you\'re invisible to a growing portion of search traffic.',
    tips: [
      'Write with factual, objective tone — avoid promotional language',
      'Include author credentials and expertise signals',
      'Support claims with data and citations',
      'Use third-person perspective where possible',
      'Focus on being informative rather than selling',
    ],
    learnMoreUrl: '/blog/seo-vs-aeo-vs-geo',
  },
  {
    id: 'expertise-signals',
    term: 'Expertise Signals (E-E-A-T)',
    category: 'geo',
    shortDesc: 'Indicators that show search engines your content is written by qualified people.',
    fullDesc: 'Expertise signals demonstrate to search engines and AI that your content is created by knowledgeable, trustworthy people. Google\'s E-E-A-T framework (Experience, Expertise, Authoritativeness, Trustworthiness) evaluates these signals to determine content quality.',
    whyItMatters: 'AI systems prioritize content from demonstrably expert sources. Without expertise signals, your content competes with millions of generic pages. With them, AI recognizes you as an authority worth citing.',
    tips: [
      'Add an "About the Author" section with credentials and experience',
      'Link to the author\'s LinkedIn or professional profile',
      'Mention relevant certifications, degrees, or years of experience',
      'Add author schema markup with sameAs links to professional profiles',
      'For medical/legal/financial content, add "Reviewed by [Expert]" attribution',
    ],
    benchmarks: { good: 'Author bio with credentials + author schema', average: 'Author name mentioned but no credentials', poor: 'No author attribution at all' },
  },
  {
    id: 'content-tone',
    term: 'Content Tone / Objectivity',
    category: 'geo',
    shortDesc: 'How factual and objective your writing is — AI trusts informative content over sales copy.',
    fullDesc: 'Content tone refers to whether your writing is informative and objective versus promotional and salesy. AI systems are trained to prefer factual, balanced content over marketing copy. Promotional language ("best ever", "amazing", "revolutionary") reduces AI trust.',
    whyItMatters: 'AI engines deprioritize content that reads like advertising. If your page is full of superlatives and sales language, AI will cite a competitor\'s more objective page instead — even if your information is better.',
    tips: [
      'Remove superlatives: "best", "amazing", "revolutionary", "world-class"',
      'Replace "we offer the best" with "this service includes"',
      'Use factual statements: "serves 10,000 customers" not "loved by everyone"',
      'Let data and facts speak instead of adjectives',
      'Write to inform, not to sell',
    ],
    benchmarks: { good: 'Factual, objective tone throughout', average: 'Mostly informative with some promotional language', poor: 'Heavily promotional / sales-focused' },
  },

  // ═══════════════════════════════════════
  // LOCAL SEO
  // ═══════════════════════════════════════
  {
    id: 'google-business-profile',
    term: 'Google Business Profile',
    category: 'local',
    shortDesc: 'Your free Google listing that appears in Maps and local search results.',
    fullDesc: 'Google Business Profile (formerly Google My Business) is a free tool that lets you manage how your business appears on Google Search and Maps. It displays your business name, address, phone number, hours, reviews, photos, and more directly in search results.',
    whyItMatters: 'For local businesses, Google Business Profile is often more important than your website. It drives the "Map Pack" results that appear above organic results for local searches. 46% of all Google searches have local intent.',
    tips: [
      'Claim and verify your profile at business.google.com',
      'Fill out every field completely — name, address, phone, hours, categories',
      'Add high-quality photos (businesses with photos get 42% more direction requests)',
      'Respond to every review — positive and negative',
      'Post updates regularly (weekly is ideal)',
      'Add your products/services with descriptions and prices',
    ],
    benchmarks: { good: 'Fully optimized with photos, reviews, and regular posts', average: 'Claimed but incomplete', poor: 'Not claimed or not set up' },
  },
  {
    id: 'local-citations',
    term: 'Local Citations',
    category: 'local',
    shortDesc: 'Mentions of your business name, address, and phone number across the web.',
    fullDesc: 'Local citations are online mentions of your business\'s Name, Address, and Phone number (NAP) on directories, social platforms, and other websites. They help search engines verify your business exists and is located where you say it is.',
    whyItMatters: 'Consistent citations across the web build trust with search engines. Inconsistent information (different phone numbers or addresses on different sites) confuses Google and can hurt your local rankings.',
    tips: [
      'Ensure your NAP is identical everywhere — exact same format',
      'Get listed on major directories: Yelp, Yellow Pages, BBB, industry-specific directories',
      'Check for and fix inconsistent listings using a tool like Moz Local',
      'Add your business to Apple Maps, Bing Places, and Facebook',
      'Update all listings immediately when you change address or phone number',
    ],
    benchmarks: { good: '30+ consistent citations across major directories', average: '10-30 citations with some inconsistencies', poor: 'Under 10 citations or major inconsistencies' },
  },
  {
    id: 'local-schema',
    term: 'LocalBusiness Schema',
    category: 'local',
    shortDesc: 'Structured data that tells search engines your business details for local results.',
    fullDesc: 'LocalBusiness schema is a specific type of schema markup that provides search engines with structured information about your local business — name, address, phone, hours, price range, and geographic coordinates. It helps Google display your business correctly in local search results and Maps.',
    whyItMatters: 'Without LocalBusiness schema, search engines have to guess your business details from unstructured text. With it, they can confidently display your hours, location, and contact info in rich results and knowledge panels.',
    tips: [
      'Use the most specific schema type: Restaurant, Dentist, Plumber, etc.',
      'Include address, phone, hours, price range, and geo coordinates',
      'Add your menu URL for restaurants',
      'Keep schema data consistent with your Google Business Profile',
      'Validate at search.google.com/test/rich-results',
    ],
    benchmarks: { good: 'Specific business type schema with complete data', average: 'Generic LocalBusiness schema', poor: 'No local schema at all' },
  },

  // ═══════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════
  {
    id: 'content-depth',
    term: 'Content Depth / Word Count',
    category: 'content',
    shortDesc: 'How comprehensive your page content is — thin content rarely ranks.',
    fullDesc: 'Content depth refers to how thoroughly a page covers its topic. While there\'s no magic word count, pages with substantial, well-organized content consistently outrank thin pages. Top-ranking pages average 1,400+ words, though the right length depends on the topic and intent.',
    whyItMatters: 'Pages under 300 words are considered "thin content" by search engines and AI. They provide insufficient material for AI to cite and rarely rank for competitive terms. However, more words doesn\'t automatically mean better — quality and relevance matter more than raw count.',
    tips: [
      'Aim for at least 800 words for content pages',
      'For local businesses: focus on quality over quantity — 300-500 words with complete business info is fine',
      'For blogs/articles: 1,000-2,000 words for comprehensive coverage',
      'Structure with H2 subheadings every 200-300 words',
      'Include an FAQ section to add depth naturally',
      'Don\'t pad content — every sentence should add value',
    ],
    benchmarks: { good: '800+ words (content pages) or complete business info (local)', average: '300-800 words', poor: 'Under 300 words (thin content)' },
  },
  {
    id: 'heading-structure',
    term: 'Heading Structure (H1-H6)',
    category: 'content',
    shortDesc: 'How your content is organized with headings — helps search engines understand topics.',
    fullDesc: 'Heading structure refers to the hierarchy of H1-H6 tags that organize your content. H1 is the main topic, H2s are major sections, H3s are subsections, and so on. This hierarchy helps both users scan content and search engines understand the relationship between topics.',
    whyItMatters: 'Well-structured headings help Google understand what each section of your page covers, which can lead to featured snippets and better rankings. AI systems also use headings to parse and cite specific sections of your content.',
    tips: [
      'Use one H1 for the main topic',
      'Use H2s for major sections (aim for 3-8 per page)',
      'Use H3s for subsections within H2s',
      'Include keywords in headings naturally',
      'Make headings descriptive — they should make sense when read alone',
    ],
    benchmarks: { good: '1 H1 + 4-8 H2s with clear hierarchy', average: 'H1 present with 1-3 H2s', poor: 'No heading structure or multiple H1s' },
  },

  // ═══════════════════════════════════════
  // PLATFORM
  // ═══════════════════════════════════════
  {
    id: 'platform-detection',
    term: 'Platform Detection',
    category: 'platform',
    shortDesc: 'Identifying what your website is built with to give platform-specific advice.',
    fullDesc: 'Platform detection identifies the technology your website is built on — WordPress, Shopify, Wix, Squarespace, Next.js, etc. This allows Duelly to provide fix instructions that reference your actual admin paths, plugins, and configuration options instead of generic HTML advice.',
    whyItMatters: 'Generic "edit your HTML" advice is useless if you\'re on WordPress or Shopify. Platform-specific instructions tell you exactly where to click, which plugin to install, or which setting to change — making fixes actionable instead of theoretical.',
    tips: [
      'WordPress: Use Yoast SEO or RankMath for automated SEO optimization',
      'Shopify: Use the built-in SEO fields in product/page editors',
      'Wix: Use the SEO Wiz and structured data tools in the dashboard',
      'Squarespace: Use the SEO panel in page settings',
      'Custom sites: Implement SEO manually in your HTML/templates',
    ],
    benchmarks: { good: 'Platform detected with SEO tools installed', average: 'Platform detected but no SEO tools', poor: 'Custom platform with no SEO infrastructure' },
  },

  // ═══════════════════════════════════════
  // COMPETITIVE ANALYSIS
  // ═══════════════════════════════════════
  {
    id: 'competitive-gap',
    term: 'Competitive Gap Analysis',
    category: 'seo',
    shortDesc: 'Identifying specific areas where competitors outperform you.',
    fullDesc: 'Competitive gap analysis compares your site against competitors across multiple dimensions — content depth, schema markup, backlinks, site speed, heading structure, and more. It identifies the specific areas where competitors have an advantage and prioritizes which gaps to close first.',
    whyItMatters: 'You don\'t need to be perfect at everything — you need to be better than your competitors at the things that matter most. Gap analysis shows you exactly where to focus your effort for maximum ranking improvement.',
    tips: [
      'Focus on closing the biggest gaps first — they have the most impact',
      'If competitors have schema and you don\'t, that\'s usually the highest-ROI fix',
      'Content depth gaps are easier to close than DA gaps',
      'DA gaps require a long-term backlink strategy — start now',
      'Check competitors quarterly to track progress',
    ],
  },
  {
    id: 'google-rank-vs-ai-rank',
    term: 'Google Rank vs AI Rank',
    category: 'seo',
    shortDesc: 'The difference between where Google ranks you and where AI would rank you.',
    fullDesc: 'Google Rank is your position in traditional search results, influenced heavily by backlinks and domain authority. AI Rank is your position based on on-page content quality, structure, and AI readiness. These often don\'t match — a site can rank #1 on Google but #5 in AI readiness, or vice versa.',
    whyItMatters: 'If your AI rank is worse than your Google rank, competitors with better content could overtake you as AI search grows. If your AI rank is better, your content is strong but you need more backlinks/authority to match.',
    tips: [
      'If AI rank > Google rank: focus on backlink building and authority',
      'If AI rank < Google rank: focus on content quality and schema',
      'If they match: you\'re well-balanced — maintain both',
      'Track both over time to see if the gap is closing',
    ],
    learnMoreUrl: '/blog/google-rank-vs-ai-rank',
  },
]

// ═══════════════════════════════════════
// LOOKUP FUNCTIONS
// ═══════════════════════════════════════

const KNOWLEDGE_MAP = new Map(KNOWLEDGE_BASE.map(e => [e.id, e]))

/** Get a single knowledge entry by ID */
export function getKnowledge(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_MAP.get(id)
}

/** Get all entries */
export function getAllKnowledge(): KnowledgeEntry[] {
  return KNOWLEDGE_BASE
}

/** Get entries by category */
export function getKnowledgeByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
  return KNOWLEDGE_BASE.filter(e => e.category === category)
}

/** Get all term IDs */
export function getAllTermIds(): string[] {
  return KNOWLEDGE_BASE.map(e => e.id)
}

/** Search knowledge base by keyword */
export function searchKnowledge(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase()
  return KNOWLEDGE_BASE.filter(e =>
    e.term.toLowerCase().includes(q) ||
    e.shortDesc.toLowerCase().includes(q) ||
    e.id.includes(q)
  )
}
