/**
 * Duelly Knowledge Base — Best-in-class SEO/AEO/GEO education library.
 * Static, curated, no AI calls needed. Instant, consistent, expandable.
 *
 * Every entry includes: plain-language explanation, real data points,
 * actionable tips with specifics, common mistakes, timeline expectations,
 * and benchmarks.
 *
 * Usage: import { getKnowledge, getAllKnowledge } from '@/lib/knowledge-base'
 */

export interface KnowledgeEntry {
  id: string
  term: string
  category: 'seo' | 'aeo' | 'geo' | 'technical' | 'backlinks' | 'local' | 'content' | 'platform'
  shortDesc: string
  fullDesc: string
  whyItMatters: string
  tips: string[]
  commonMistakes?: string[]
  timelineExpectation?: string
  benchmarks?: { good: string; average: string; poor: string }
  learnMoreUrl?: string
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [

  {
    id: 'duelly-rank',
    term: 'Duelly Rank',
    category: 'seo',
    shortDesc: 'Your position based on combined SEO, AEO, and GEO scores — how you stack up against competitors on site quality.',
    fullDesc: 'Duelly Rank orders competitors by their combined SEO, AEO, and GEO scores (the "Overall" column). This is different from Google Rank, which is heavily influenced by backlinks, domain age, brand recognition, and user behavior signals that aren\'t visible on the page itself. Duelly Rank focuses purely on what you can control: on-page optimization, content quality, schema markup, AI readiness, and technical health.',
    whyItMatters: 'Google Rank tells you where you are today. Duelly Rank tells you where you should be based on your site quality. If your Duelly Rank is higher than your Google Rank, your content is strong but you need more authority (backlinks). If it\'s lower, competitors with weaker content are outranking you because of stronger domain authority — meaning your on-page work has the most room for improvement.',
    tips: [
      'If Duelly Rank > Google Rank: your site quality is ahead of your authority. Focus on link building to match your content quality.',
      'If Duelly Rank < Google Rank: your authority is carrying you. Invest in content, schema, and AI readiness before competitors catch up.',
      'If they match: you\'re well-balanced. Maintain both content quality and authority building.',
      'Use the SEO, AEO, and GEO columns to identify which specific pillar is dragging your overall score down.',
    ],
    benchmarks: { good: 'Duelly Rank matches or beats Google Rank', average: 'Within 2-3 positions of Google Rank', poor: 'More than 3 positions behind Google Rank (site quality gap)' },
  },

  // ═══════════════════════════════════════════════════════════════
  // SCORES & OVERVIEW
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'seo-score',
    term: 'SEO Score',
    category: 'seo',
    shortDesc: 'Your overall Search Engine Optimization score — how well your page is optimized for Google and traditional search.',
    fullDesc: 'The SEO score is a composite metric (0-100) that evaluates how well your page follows search engine optimization best practices. It combines technical health (HTTPS, speed, mobile-friendliness), on-page optimization (title tags, meta descriptions, headings, alt text), content quality (word count, depth, structure), and internal/external linking. Each component is weighted based on its real-world impact on rankings, adjusted for your specific site type.',
    whyItMatters: 'Your SEO score directly predicts how competitive your page is in traditional Google search results. Pages scoring 80+ are well-optimized and competitive for most keywords. Pages under 50 have significant gaps that are likely costing you rankings and traffic. Every 10-point improvement typically correlates with measurable ranking gains.',
    tips: [
      'Focus on critical issues first — they have the biggest point impact.',
      'Technical basics (HTTPS, speed, mobile) are table stakes. Fix these before anything else.',
      'On-page elements (title, meta, H1) are the highest-ROI fixes — they take minutes and show results in weeks.',
      'Content depth matters more than ever. Aim for 800+ words on key pages with clear heading structure.',
    ],
    benchmarks: { good: '80-100 (competitive for most keywords)', average: '50-79 (room for improvement)', poor: 'Under 50 (significant optimization needed)' },
  },
  {
    id: 'aeo-score',
    term: 'AEO Score',
    category: 'aeo',
    shortDesc: 'Your Answer Engine Optimization score — how likely AI assistants are to cite your content.',
    fullDesc: 'The AEO score (0-100) measures how well your content is structured for AI answer engines like ChatGPT, Perplexity, and Google AI Overviews. It evaluates Q&A content structure, schema markup completeness, entity density (specific facts and data points), snippet eligibility, and whether your content directly answers common questions in your niche.',
    whyItMatters: 'AI search is growing rapidly. When someone asks ChatGPT or Perplexity for a recommendation, AI reads hundreds of pages and decides which to cite. A high AEO score means your content is structured in the format AI systems prefer — clear answers, structured data, and verifiable facts. Sites with high AEO scores get recommended when users ask AI for advice.',
    tips: [
      'Add FAQ sections with 5-10 real questions and direct, concise answers.',
      'Use schema markup (FAQPage, HowTo, Organization) so AI can parse your content programmatically.',
      'Include specific facts, numbers, and named entities. "Serving since 2005" is citable. "We\'ve been around a while" is not.',
      'Structure content with clear headings that match common questions people ask.',
    ],
    benchmarks: { good: '80-100 (AI-ready, likely to be cited)', average: '50-79 (some AI readiness)', poor: 'Under 50 (invisible to AI assistants)' },
    learnMoreUrl: '/blog/what-is-aeo',
  },
  {
    id: 'geo-score',
    term: 'GEO Score',
    category: 'geo',
    shortDesc: 'Your Generative Engine Optimization score — how well you perform in AI-generated search results.',
    fullDesc: 'The GEO score (0-100) measures how well your content performs in AI-generated search results like Google AI Overviews and ChatGPT web search. It evaluates expertise signals (E-E-A-T), content tone objectivity, citation likelihood, factual density, and brand consistency. GEO focuses on whether AI systems trust your content enough to synthesize and cite it in generated answers.',
    whyItMatters: 'Google AI Overviews now appear for over 30% of searches. When AI generates an answer, it typically cites 3-5 sources. If you\'re not one of them, you\'re invisible for that query. GEO optimization ensures your content reads as authoritative and factual — the signals AI uses to decide who gets cited.',
    tips: [
      'Write with a factual, objective tone. AI deprioritizes content that reads like advertising.',
      'Include author credentials and expertise signals.',
      'Support claims with data or citations. "According to [source]..." is citable.',
      'Focus on being informative rather than selling. The most-cited pages are educational.',
    ],
    benchmarks: { good: '80-100 (strong AI citation potential)', average: '50-79 (moderate visibility)', poor: 'Under 50 (unlikely to be cited by AI)' },
    learnMoreUrl: '/blog/seo-vs-aeo-vs-geo',
  },
  {
    id: 'domain-health',
    term: 'Domain Health',
    category: 'seo',
    shortDesc: 'An aggregate score measuring overall site quality across content, schema, metadata, performance, and architecture.',
    fullDesc: 'Domain Health is a composite score that evaluates five key pillars of your website: content depth and quality, schema markup implementation, metadata optimization (titles, descriptions), technical performance (speed, HTTPS, response time), and site architecture (internal linking, semantic HTML, heading structure). Each pillar contributes to the overall health score, giving you a holistic view of your site\'s SEO foundation.',
    whyItMatters: 'Domain Health is the foundation of your SEO authority. A site with poor health will struggle to rank regardless of how much content you produce or how many backlinks you earn. Think of it like a building — if the foundation is weak, nothing you build on top will be stable. Fixing domain health issues is always the highest-ROI starting point.',
    tips: [
      'Address the lowest-scoring pillar first for maximum impact.',
      'Schema and metadata are usually the quickest wins — they can be fixed in hours.',
      'Content depth takes longer but has lasting impact on rankings.',
      'Technical performance issues (slow speed, no HTTPS) should be treated as urgent.',
    ],
    benchmarks: { good: '80-100 (strong foundation)', average: '50-79 (needs attention in some areas)', poor: 'Under 50 (significant foundational issues)' },
  },
  {
    id: 'response-time',
    term: 'Server Response Time (TTFB)',
    category: 'technical',
    shortDesc: 'How fast your server responds to requests — the first step in page loading.',
    fullDesc: 'Server response time, also called Time to First Byte (TTFB), measures how long it takes your web server to send the first byte of data back to a visitor\'s browser after receiving a request. It\'s the very first step in page loading — before any content, images, or scripts can load, the server has to respond. A slow TTFB means everything else is delayed.',
    whyItMatters: 'Google recommends a TTFB under 200ms. Response times over 500ms noticeably slow down the user experience, and over 1000ms is critical — visitors start abandoning your site. TTFB directly impacts Core Web Vitals (LCP) and is a signal Google uses for ranking. A fast server response is the foundation of a fast website.',
    tips: [
      'Under 500ms is good, 500-1000ms needs attention, over 1000ms is critical.',
      'Upgrade your hosting if TTFB is consistently high. Shared hosting is often the bottleneck.',
      'Use a CDN (Cloudflare free tier) to serve content from servers closer to your visitors.',
      'Enable server-side caching to avoid regenerating pages on every request.',
      'Check if heavy database queries or unoptimized server code is causing delays.',
    ],
    benchmarks: { good: 'Under 500ms', average: '500-1000ms (needs improvement)', poor: 'Over 1000ms (critical — losing visitors)' },
  },
  {
    id: 'metadata',
    term: 'Page Metadata',
    category: 'seo',
    shortDesc: 'Your page\'s title tag and meta description — they control how your page appears in search results.',
    fullDesc: 'Page metadata refers to the title tag and meta description that appear in search engine results. The title tag is the clickable blue headline, and the meta description is the 1-2 sentence summary below it. Together, they\'re your page\'s "advertisement" in search results — they determine whether someone clicks your result or a competitor\'s. Missing metadata means Google auto-generates your snippet, which often looks terrible.',
    whyItMatters: 'Pages with optimized metadata get 20-30% more clicks than pages with missing or generic metadata. The title tag is also the strongest on-page ranking signal — it tells Google exactly what your page is about. Missing metadata is one of the most common and easiest-to-fix SEO issues.',
    tips: [
      'Every page needs a unique title tag (50-60 characters) with the primary keyword near the start.',
      'Every page needs a unique meta description (120-160 characters) with a clear call-to-action.',
      'Never duplicate titles or descriptions across pages.',
      'Write for humans first — the title needs to make someone want to click.',
    ],
    benchmarks: { good: 'Both title and description present, unique, and optimized', average: 'Present but generic or wrong length', poor: 'Missing title or description' },
  },
  {
    id: 'external-links',
    term: 'External Links',
    category: 'seo',
    shortDesc: 'Links from your site to other websites — they signal trust and help search engines understand your content.',
    fullDesc: 'External links are hyperlinks on your page that point to other websites. Linking to authoritative, relevant sources signals to search engines that your content is well-researched and trustworthy. It also helps search engines understand the topic and context of your content by seeing what sources you reference.',
    whyItMatters: 'Pages that link to relevant, authoritative sources tend to rank better than pages with no external links. It seems counterintuitive — why send visitors away? — but search engines interpret outbound links as a sign of quality content. A page that cites sources is more trustworthy than one that makes claims without references. For AI citation, external links to authoritative sources boost your credibility.',
    tips: [
      'Link to 2-5 relevant, authoritative sources per content page.',
      'Use descriptive anchor text that tells readers what they\'ll find.',
      'Link to .gov, .edu, and established industry sources when possible.',
      'Don\'t link to competitors\' product pages — link to informational resources.',
      'Use rel="noopener noreferrer" on external links for security.',
    ],
    benchmarks: { good: '2-5 relevant external links per content page', average: '1 external link', poor: 'No external links at all' },
  },
  {
    id: 'word-count',
    term: 'Word Count',
    category: 'content',
    shortDesc: 'Total words on the page — pages under 300 words are considered thin content and struggle to rank.',
    fullDesc: 'Word count measures the total number of words in your page\'s main content area. While there\'s no magic number, search engines and AI systems need sufficient content to understand what your page is about and determine its relevance. Pages under 300 words are classified as "thin content" and almost never rank for competitive keywords. The ideal length depends on your page type and industry.',
    whyItMatters: 'Thin content (under 300 words) is one of the most common reasons pages fail to rank. Google needs enough text to understand your topic, match it to search queries, and determine its quality. AI systems need even more — they extract facts, quotes, and structured information, which requires substantial content. Top-ranking pages average 1,400+ words.',
    tips: [
      'Service/product pages: 500-800 words covering what you offer, who it\'s for, and FAQs.',
      'Blog posts: 1,000-2,000 words with comprehensive coverage.',
      'Local business homepages: 300-500 words with complete business info.',
      'Don\'t pad with filler — quality matters more than raw count.',
    ],
    benchmarks: { good: '800+ words for content pages', average: '300-800 words', poor: 'Under 300 words (thin content)' },
  },
  {
    id: 'schema-quality',
    term: 'Schema Quality',
    category: 'seo',
    shortDesc: 'How complete and correct your structured data implementation is — not just having schema, but having it right.',
    fullDesc: 'Schema quality measures three dimensions of your structured data: coverage (what percentage of pages have schema), quality (are required properties filled in correctly, or are they placeholder/generic?), and diversity (how many different schema types are used). Having schema is step one — having high-quality, validated schema with complete data is what actually triggers rich results and AI citations.',
    whyItMatters: 'Invalid or incomplete schema is ignored by Google. Having schema with placeholder data ("Your Business Name") or missing required fields is worse than having no schema at all — it wastes crawl budget and signals low quality. High-quality schema with complete, accurate data is what triggers rich results (star ratings, FAQs, product prices) and helps AI systems cite your content.',
    tips: [
      'Validate all schema at search.google.com/test/rich-results before publishing.',
      'Fill in every required and recommended property — don\'t leave placeholders.',
      'Use multiple schema types: Organization + FAQPage + BreadcrumbList at minimum.',
      'Keep schema data consistent with visible page content.',
    ],
    benchmarks: { good: 'Multiple schema types, all validated, complete data', average: 'Basic schema with some missing properties', poor: 'No schema or invalid/placeholder schema' },
  },
  {
    id: 'content-quality',
    term: 'Content Quality',
    category: 'content',
    shortDesc: 'How well-written, informative, and useful your content is — the foundation of all search rankings.',
    fullDesc: 'Content quality is a holistic assessment of how well your page serves its intended audience. It encompasses writing quality, factual accuracy, depth of coverage, originality, readability, and usefulness. Google\'s Helpful Content system specifically evaluates whether content is written for humans (good) or primarily for search engines (bad). High-quality content answers questions thoroughly, provides unique insights, and leaves the reader satisfied.',
    whyItMatters: 'Content quality is the #1 ranking factor. Google\'s algorithm updates consistently reward high-quality, helpful content and penalize thin, generic, or AI-generated filler. For AI citation, content quality determines whether your page gets recommended or ignored. A single high-quality page can outrank hundreds of mediocre ones.',
    tips: [
      'Write for your audience first, search engines second.',
      'Cover topics comprehensively — answer the question and related questions.',
      'Include original insights, data, or perspectives that competitors don\'t have.',
      'Use clear structure with headings, lists, and short paragraphs for readability.',
      'Update content regularly to keep it accurate and fresh.',
    ],
    benchmarks: { good: 'Comprehensive, original, well-structured content that fully answers the query', average: 'Adequate coverage but lacks depth or originality', poor: 'Thin, generic, or poorly written content' },
  },
  {
    id: 'snippet-eligibility',
    term: 'Snippet Eligibility',
    category: 'aeo',
    shortDesc: 'How likely your content is to appear as a featured snippet or be cited by AI in search results.',
    fullDesc: 'Snippet eligibility measures how well your content is formatted for Google\'s featured snippets (position zero) and AI-generated answers. Featured snippets pull a direct answer from a web page and display it prominently above all other results. AI Overviews similarly extract and cite content. Pages with clear Q&A formatting, structured data, concise definitions, and well-organized lists are most likely to be selected.',
    whyItMatters: 'Featured snippets get approximately 8% of all clicks for a query — and they appear above the #1 organic result. Being selected for a featured snippet can double or triple your traffic for that keyword overnight. For AI Overviews, being cited means your brand appears in the AI-generated answer that millions of users see.',
    tips: [
      'Answer questions directly in the first 1-2 sentences, then expand with details.',
      'Use H2/H3 headings formatted as questions that people actually search for.',
      'Add FAQPage schema to increase your chances of being selected.',
      'Use numbered lists and tables — Google loves pulling these into snippets.',
      'Keep answers concise (40-60 words) for the best snippet format.',
    ],
    benchmarks: { good: 'Multiple snippet-eligible sections with Q&A format and schema', average: 'Some Q&A content but no schema', poor: 'No structured Q&A content' },
  },
  {
    id: 'citation-likelihood',
    term: 'Citation Likelihood',
    category: 'geo',
    shortDesc: 'The probability that AI systems will cite your content when answering related questions.',
    fullDesc: 'Citation likelihood estimates how probable it is that AI engines (ChatGPT, Perplexity, Google AI Overviews) will reference your content in their generated answers. It\'s based on content clarity, factual density, expertise signals, tone objectivity, and structural organization. AI systems prefer content that reads as authoritative and informative rather than promotional.',
    whyItMatters: 'When AI generates an answer, it typically cites 3-5 sources from potentially hundreds of candidates. Your citation likelihood score predicts whether you\'ll be one of those chosen sources. Higher citation likelihood means more visibility in the fastest-growing segment of search — AI-generated results.',
    tips: [
      'Write with a factual, objective tone — avoid superlatives and sales language.',
      'Include specific data points, statistics, and named entities.',
      'Add author credentials and expertise signals.',
      'Structure content with clear headings and concise, direct answers.',
      'Support every claim with evidence or citations.',
    ],
    benchmarks: { good: '70%+ (strong chance of being cited)', average: '40-70% (moderate chance)', poor: 'Under 40% (unlikely to be cited)' },
  },
  {
    id: 'brand-visibility',
    term: 'Brand Visibility in AI',
    category: 'geo',
    shortDesc: 'How visible and recognizable your brand is to AI systems — consistency across your site matters.',
    fullDesc: 'Brand visibility measures how consistently and prominently your brand identity appears across your website in ways that AI systems can detect and reference. This includes consistent business names in schema markup, brand terms in page titles, consistent meta descriptions, and clear brand entity signals. AI systems build a "knowledge graph" of your brand from these signals.',
    whyItMatters: 'AI systems need to confidently identify your brand before they can recommend it. If your business name appears differently across pages, or your schema has inconsistent data, AI systems may not recognize you as a single, authoritative entity. Strong brand visibility means AI can confidently say "According to [Your Brand]..." when citing your content.',
    tips: [
      'Use the exact same business name in all schema markup across every page.',
      'Include your brand name in page titles consistently.',
      'Maintain consistent meta description style and length across pages.',
      'Add Organization schema with complete brand information on every page.',
    ],
    benchmarks: { good: '90%+ consistency across all brand signals', average: '60-90% consistency', poor: 'Under 60% (inconsistent brand identity)' },
  },
  {
    id: 'linking-domains',
    term: 'Linking Domains',
    category: 'backlinks',
    shortDesc: 'The number of unique websites linking to yours — diversity of sources matters more than total link count.',
    fullDesc: 'Linking domains (also called referring domains) counts the number of unique websites that have at least one link pointing to your site. This is different from total backlinks — one website might link to you 50 times, but that counts as just 1 linking domain. Search engines value diversity of sources. Ten links from 10 different websites is far more valuable than 50 links from one website.',
    whyItMatters: 'Linking domain count is one of the strongest predictors of ranking success. Google interprets links from many different websites as a broader vote of confidence than many links from a single source. Studies show that the number of unique linking domains correlates more strongly with rankings than total backlink count.',
    tips: [
      'Focus on earning links from new domains rather than getting more links from sites that already link to you.',
      'Diversify your link sources: directories, local businesses, industry sites, news outlets, blogs.',
      'Even low-DA domains count — a link from a local business association (DA 15) still adds a unique referring domain.',
      'Track your linking domain growth monthly. Steady growth signals a healthy, natural link profile.',
    ],
    benchmarks: { good: '50+ unique linking domains', average: '10-50 linking domains', poor: 'Under 10 linking domains' },
  },
  {
    id: 'total-backlinks',
    term: 'Total Backlinks',
    category: 'backlinks',
    shortDesc: 'The total number of links from other websites pointing to yours — quantity with quality.',
    fullDesc: 'Total backlinks counts every individual link from external websites pointing to your site. This includes multiple links from the same domain. While linking domain diversity is more important, total backlink count still matters — it indicates the overall volume of external references to your content. A healthy backlink profile has both high diversity (many linking domains) and reasonable volume.',
    whyItMatters: 'Total backlinks contribute to your overall domain authority and page authority scores. While one high-quality link is worth more than 100 low-quality ones, volume still plays a role in competitive rankings. Pages with more total backlinks tend to rank higher, especially when the links come from diverse, relevant sources.',
    tips: [
      'Quality always beats quantity — don\'t chase link count at the expense of link quality.',
      'Monitor your backlink growth rate. Sudden spikes can trigger spam filters.',
      'Check for and disavow toxic backlinks that could hurt your profile.',
      'Create link-worthy content that naturally attracts backlinks over time.',
    ],
    benchmarks: { good: '100+ quality backlinks from diverse sources', average: '20-100 backlinks', poor: 'Under 20 backlinks' },
  },
  {
    id: 'top-referring-domains',
    term: 'Top Referring Domains',
    category: 'backlinks',
    shortDesc: 'The highest-authority websites linking to you — these are your most valuable backlinks.',
    fullDesc: 'Top referring domains are the websites with the highest Domain Authority (DA) that link to your site. These are your most valuable backlinks because high-DA sites pass more ranking power (link equity) than low-DA sites. A single link from a DA 70 news site can be worth more than 100 links from DA 5 directories. Understanding your top referrers helps you identify what\'s working and where to focus future link building efforts.',
    whyItMatters: 'Your top referring domains are the backbone of your site\'s authority. They\'re the reason you rank where you do. Losing a high-DA referring domain can cause noticeable ranking drops, while gaining one can provide a significant boost. Monitoring these relationships is critical for maintaining and growing your search visibility.',
    tips: [
      'Protect your highest-value backlinks — make sure the linked pages stay live and relevant.',
      'Analyze what content earned your best backlinks and create more like it.',
      'Look for patterns: are your best links from news sites, directories, or industry blogs? Double down on what works.',
      'If a high-DA site links to you with a nofollow tag, it\'s still valuable for traffic and brand visibility.',
    ],
    benchmarks: { good: 'Multiple referring domains with DA 40+', average: 'A few referring domains with DA 20-40', poor: 'No referring domains above DA 20' },
  },
  {
    id: 'conversational-headers',
    term: 'Conversational Headers',
    category: 'aeo',
    shortDesc: 'Headings written as questions or conversational phrases — the format AI systems are trained to find.',
    fullDesc: 'Conversational headers are H2/H3 headings written in a question or conversational format that mirrors how people actually search and ask AI assistants. Instead of "Our Services," a conversational header would be "What services do we offer?" or "How does our process work?" AI systems are fundamentally question-answering machines, and they actively scan for headings that match user queries.',
    whyItMatters: 'AI assistants match user questions to content headings. When someone asks ChatGPT "How does X work?", the AI looks for pages with headings that match that question format. Pages with conversational headers are 2-3x more likely to be cited because the AI can directly map the user\'s question to your content structure.',
    tips: [
      'Rewrite section headings as questions: "How does [service] work?" instead of "Our Process".',
      'Use the same language your customers use when asking questions.',
      'Aim for 4-8 conversational headers per content page.',
      'Start answers immediately after the heading — don\'t bury the answer in the third paragraph.',
    ],
    benchmarks: { good: '4+ conversational/question-format headers per page', average: '1-3 conversational headers', poor: 'No question-format headers' },
  },

  // ═══════════════════════════════════════════════════════════════
  // BACKLINKS & AUTHORITY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'domain-authority',
    term: 'Domain Authority (DA)',
    category: 'backlinks',
    shortDesc: 'A 0-100 score predicting how well your site will rank — like a credit score for your website.',
    fullDesc: 'Domain Authority is a score developed by Moz that predicts how likely a website is to rank in search results. Think of it like a credit score for your website: a bank checks your credit before giving you a loan, and Google checks your authority before giving you a ranking. DA is calculated based on the quantity and quality of other websites linking to yours. A brand new site starts at DA 1. Wikipedia is DA 100. Most small businesses fall between DA 10-30. The average local business that ranks on page 1 of Google has a DA between 25-45.',
    whyItMatters: 'DA is the single best predictor of whether you\'ll rank for competitive keywords. If your competitor has DA 40 and you have DA 12, even perfect on-page optimization probably won\'t be enough to outrank them. The #1 result on Google has an average of 3.8x more backlinks than positions 2-10. In local search, the difference between DA 15 and DA 35 is often the difference between page 3 and the top 3.',
    tips: [
      'Start with free directory listings this week: Google Business Profile, Yelp, Yellow Pages, BBB, and any industry-specific directories. These are free backlinks that also help customers find you.',
      'Email 5 local businesses you already work with and ask: "Would you add a link to our site on your partners page? We\'ll do the same." This alone can boost DA by 3-5 points over 6 months.',
      'Join your local Chamber of Commerce — they typically have DA 40-60 and link to all members. For $200-500/year, it\'s one of the best ROI moves in SEO.',
      'Create one genuinely useful resource (a local guide, a how-to, a tool) that other sites would want to link to. One viral piece of content can earn more links than months of outreach.',
      'Pitch yourself as an expert source to local media. One link from a local news site (DA 50-70) is worth more than 50 directory listings.',
    ],
    commonMistakes: [
      'Buying 500 backlinks for $50 on Fiverr — this will get you penalized by Google, not ranked.',
      'Expecting DA to change overnight. It takes 3-6 months of consistent effort to see meaningful movement.',
      'Ignoring DA because "it\'s not a Google metric." It\'s not, but it measures the same signals Google uses. The correlation is strong.',
      'Only focusing on on-page SEO while ignoring backlinks. You can have the best content in the world, but without authority, Google won\'t trust you enough to rank it.',
    ],
    timelineExpectation: 'DA moves slowly. Expect 3-6 months of consistent link building before you see a 5-10 point increase. Quick wins like directory listings show up in 4-8 weeks.',
    benchmarks: { good: 'DA 40+ (competitive for most keywords)', average: 'DA 20-40 (can rank for low-medium difficulty keywords)', poor: 'DA 1-20 (need an active link building strategy)' },
    learnMoreUrl: '/blog/backlinks-explained',
  },
  {
    id: 'backlinks',
    term: 'Backlinks',
    category: 'backlinks',
    shortDesc: 'Links from other websites to yours — each one is like a vote of confidence in your site.',
    fullDesc: 'A backlink is simply a link from someone else\'s website to yours. When a local newspaper writes about your business and includes a link, that\'s a backlink. When you\'re listed in an online directory with a link to your site, that\'s a backlink. Google\'s entire algorithm was originally built around this concept: if other websites link to you, you\'re probably worth visiting. Not all backlinks are equal — one link from a respected news site is worth more than 100 links from random, low-quality websites.',
    whyItMatters: 'Backlinks are one of the top 3 ranking factors Google uses. Studies consistently show that the #1 result on Google has 3.8x more backlinks than positions 2-10. Pages with zero backlinks almost never rank on page 1 for competitive keywords. For AI search, backlinks also signal authority — AI engines are more likely to cite content from well-linked, trusted domains.',
    tips: [
      'Quality always beats quantity. Ten links from reputable, relevant websites will do more than 500 links from junk sites.',
      'Check your backlink profile at least quarterly using Google Search Console (Links section) or Moz\'s free Link Explorer.',
      'Look for "unlinked mentions" — sites that mention your business but don\'t link to you. Email them and ask for the link. Success rate is typically 10-20%.',
      'Create content worth linking to: a detailed local guide, an original survey, a free tool, or a comprehensive how-to. Useful content attracts links naturally over time.',
      'Sponsor a local event or charity. Event websites almost always link to sponsors, and these are high-quality, relevant links.',
    ],
    commonMistakes: [
      'Buying cheap backlinks from services promising "1,000 links for $50." Google can detect these patterns and will penalize your site.',
      'Ignoring anchor text diversity. If every backlink uses the exact same anchor text, Google sees it as manipulation.',
      'Not disavowing toxic links. If spammy sites link to you without your knowledge, use Google\'s Disavow Tool to reject them.',
      'Thinking all links are good links. A link from a gambling or adult site can actually hurt your rankings.',
    ],
    timelineExpectation: 'Individual backlinks can take 2-8 weeks to be discovered and indexed by Google. A sustained link building campaign typically shows ranking improvements in 3-6 months.',
    benchmarks: { good: '50+ unique linking domains from relevant, quality sites', average: '10-50 linking domains with mixed quality', poor: 'Under 10 linking domains (very limited authority)' },
    learnMoreUrl: '/blog/backlinks-explained',
  },
  {
    id: 'page-authority',
    term: 'Page Authority (PA)',
    category: 'backlinks',
    shortDesc: 'A 0-100 score for a specific page\'s ranking strength — like DA but for individual pages.',
    fullDesc: 'While Domain Authority measures your entire website\'s ranking potential, Page Authority measures the strength of a single specific page. A page with lots of backlinks pointing directly to it will have high PA even if the overall domain DA is low. This is why some individual blog posts or articles can outrank entire websites for specific queries.',
    whyItMatters: 'PA explains why a specific page ranks well (or doesn\'t) for a particular keyword. Your homepage might have PA 30 while an inner page has PA 5. That inner page needs its own backlinks or strong internal links to rank competitively.',
    tips: [
      'Link to your most important pages from your homepage and navigation — this passes authority to them.',
      'When you earn a backlink, try to get it pointed to the specific page you want to rank, not just your homepage.',
      'Add internal links from your highest-PA pages to pages you want to boost.',
      'Create "pillar content" pages that attract their own backlinks and link out to related pages on your site.',
    ],
    benchmarks: { good: 'PA 30+ for key landing pages', average: 'PA 15-30', poor: 'PA under 15 (page has very few links)' },
  },
  {
    id: 'spam-score',
    term: 'Spam Score',
    category: 'backlinks',
    shortDesc: 'How likely your site is to be penalized based on suspicious patterns in your backlink profile.',
    fullDesc: 'Spam Score is a Moz metric (0-100%) that estimates the probability of a site being penalized by search engines. It analyzes patterns in your backlink profile that are associated with spammy or manipulative link building — things like a sudden spike in low-quality links, links from irrelevant foreign-language sites, or links from known link farms. A high spam score doesn\'t mean you\'ve done anything wrong — sometimes spammy sites link to you without your knowledge.',
    whyItMatters: 'A spam score over 30% is a red flag. Google may interpret suspicious backlink patterns as attempts to manipulate rankings and penalize your site — dropping you from search results entirely. Even if you didn\'t build the bad links yourself, you\'re responsible for cleaning them up.',
    tips: [
      'Check your spam score monthly. If it\'s rising, investigate which new links are causing it.',
      'Use Google Search Console\'s Disavow Tool to reject links from spammy domains. Create a disavow file listing the domains you want Google to ignore.',
      'Never buy backlinks from services that promise hundreds of links cheaply. These are almost always from spam networks.',
      'If your spam score suddenly spikes, check for a "negative SEO attack" — competitors sometimes point spam links at rival sites deliberately.',
    ],
    commonMistakes: [
      'Ignoring spam score because "I didn\'t build those links." You\'re still responsible for your backlink profile.',
      'Disavowing too aggressively — only disavow clearly spammy links, not every low-DA site that links to you.',
    ],
    benchmarks: { good: 'Under 5% (clean profile)', average: '5-30% (monitor and clean up)', poor: 'Over 30% (immediate action needed)' },
  },
  {
    id: 'anchor-text',
    term: 'Anchor Text',
    category: 'backlinks',
    shortDesc: 'The clickable text in a hyperlink — it tells search engines what the linked page is about.',
    fullDesc: 'Anchor text is the visible, clickable text in a hyperlink. When someone links to your site with the text "best pizza in Oromocto," Google interprets that as a signal that your page is relevant to that phrase. Natural anchor text varies — sometimes it\'s your brand name, sometimes it\'s a keyword, sometimes it\'s "click here." A healthy backlink profile has diverse anchor text.',
    whyItMatters: 'Anchor text is one of the strongest signals Google uses to understand what a page is about. If 50 different sites link to your page with anchor text related to "plumber in Toronto," Google becomes very confident your page is relevant for that search. But if the anchor text looks manipulated (every link uses the exact same keyword), Google may penalize you.',
    tips: [
      'When asking for links, suggest natural anchor text like your business name or a descriptive phrase — not an exact keyword match every time.',
      'Aim for diversity: 30-40% branded (your business name), 20-30% natural phrases, 10-20% keyword-related, and the rest generic ("click here", "learn more").',
      'Check your anchor text distribution in Moz or Ahrefs. If one keyword dominates over 50% of your anchors, it looks unnatural.',
    ],
    commonMistakes: [
      'Using the exact same keyword anchor text for every backlink — this is the #1 signal of link manipulation.',
      'Ignoring anchor text entirely and letting every link say "click here" — you\'re missing a ranking opportunity.',
    ],
    benchmarks: { good: 'Diverse mix of branded, keyword, and natural anchors', average: 'Some diversity but one type dominates', poor: 'Over 50% exact-match keyword anchors (manipulation risk)' },
  },
  {
    id: 'nofollow-dofollow',
    term: 'Nofollow vs Dofollow Links',
    category: 'backlinks',
    shortDesc: 'Whether a link passes ranking power to your site or just sends traffic.',
    fullDesc: 'By default, all links are "dofollow" — they pass ranking power (link equity) from the linking site to yours. A "nofollow" link includes a special HTML attribute (rel="nofollow") that tells search engines not to pass ranking power. Social media links, paid links, and user-generated content (comments, forums) are typically nofollow. Since 2019, Google treats nofollow as a "hint" rather than a directive, meaning some nofollow links may still pass value.',
    whyItMatters: 'Dofollow links directly boost your rankings. Nofollow links don\'t pass direct ranking power, but they still drive traffic, build brand awareness, and contribute to a natural-looking backlink profile. A healthy profile has both.',
    tips: [
      'Don\'t obsess over nofollow vs dofollow. A nofollow link from a major news site still sends traffic and builds brand recognition.',
      'Focus your link building efforts on earning dofollow links from relevant, authoritative sites.',
      'Check if your directory listings are dofollow — many are, and they\'re easy wins.',
      'Social media links are nofollow but still valuable for driving traffic and brand signals.',
    ],
    benchmarks: { good: '60-80% dofollow links in your profile', average: '40-60% dofollow', poor: 'Under 40% dofollow (most links aren\'t passing value)' },
  },

  // ═══════════════════════════════════════════════════════════════
  // SEO FUNDAMENTALS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'title-tag',
    term: 'Title Tag',
    category: 'seo',
    shortDesc: 'The clickable headline in search results — the single most important on-page SEO element.',
    fullDesc: 'The title tag is the blue, clickable headline you see in Google search results. It also appears in your browser tab. It\'s the first thing a potential visitor reads about your page, and it\'s the strongest signal you can give Google about what your page is about. Think of it as the headline of a newspaper article — it needs to be accurate, compelling, and include the topic (keyword) you want to rank for.',
    whyItMatters: 'Google uses the title tag as its primary on-page ranking signal. A page without a title tag is like a book without a cover — Google doesn\'t know what it\'s about, and users have no reason to click. Studies show that optimizing title tags alone can improve click-through rates by 20-30%. A well-written title with your target keyword near the beginning can be the difference between ranking on page 1 and page 3.',
    tips: [
      'Keep it 50-60 characters. Google truncates anything longer with "..." which looks unprofessional and loses your message.',
      'Put your primary keyword within the first 3-5 words. Google gives more weight to words at the beginning.',
      'Make every page title unique across your entire site. Duplicate titles confuse Google about which page to rank.',
      'Format: "Primary Keyword - Supporting Detail | Brand Name" — e.g., "Pizza Delivery Oromocto - Fresh & Hot in 30 Min | Joe\'s Pizza"',
      'Write for humans first. The title needs to make someone want to click, not just contain keywords.',
    ],
    commonMistakes: [
      'Using the same title on every page (e.g., "Home | My Business" on all pages).',
      'Stuffing multiple keywords: "Pizza Oromocto Pizza Delivery Best Pizza" — this looks spammy and Google may rewrite it.',
      'Making it too short: "Home" or "Welcome" tells Google nothing about your page.',
      'Forgetting the title tag entirely — surprisingly common, especially on inner pages.',
    ],
    timelineExpectation: 'Google typically picks up title tag changes within 1-4 weeks. Ranking improvements from better titles can appear within 2-6 weeks.',
    benchmarks: { good: '50-60 characters, primary keyword near the start, unique per page', average: 'Present but too long, too short, or missing keyword', poor: 'Missing entirely or duplicated across pages' },
  },
  {
    id: 'meta-description',
    term: 'Meta Description',
    category: 'seo',
    shortDesc: 'The snippet text below your title in search results — your page\'s elevator pitch.',
    fullDesc: 'The meta description is the 1-2 sentence summary that appears below your title in Google search results. It\'s your chance to convince someone to click your result instead of a competitor\'s. While Google has confirmed that meta descriptions are not a direct ranking factor, they are the primary driver of click-through rate (CTR) — and CTR does influence rankings indirectly. Think of it as a mini-advertisement for your page.',
    whyItMatters: 'A compelling meta description can increase clicks by 5-10% compared to a generic or missing one. Without a meta description, Google auto-generates one by pulling random text from your page — which often looks terrible and doesn\'t represent your content well. Higher CTR sends positive signals to Google that your result is relevant, which can improve your ranking over time.',
    tips: [
      'Write 120-160 characters. Under 120 wastes valuable space. Over 160 gets truncated.',
      'Include your primary keyword — Google bolds matching keywords in the description, which catches the eye.',
      'End with a call-to-action: "Learn more", "Get a free quote", "Shop now", "See our menu".',
      'Make each page\'s description unique. Duplicate descriptions across pages is a missed opportunity.',
      'Think of it as ad copy — you\'re competing with 9 other results on the page. Why should someone click yours?',
    ],
    commonMistakes: [
      'Leaving it blank and hoping Google figures it out. Google\'s auto-generated snippets are often terrible.',
      'Writing the same description for every page.',
      'Making it too salesy: "BUY NOW BEST DEALS CLICK HERE!!!" — this looks spammy.',
      'Stuffing it with keywords instead of writing naturally.',
    ],
    timelineExpectation: 'Google picks up meta description changes within 1-4 weeks. CTR improvements are immediate once the new description appears in search results.',
    benchmarks: { good: '120-160 characters with keyword and clear CTA', average: 'Present but generic or wrong length', poor: 'Missing entirely' },
  },
  {
    id: 'h1-tag',
    term: 'H1 Heading',
    category: 'seo',
    shortDesc: 'The main heading of your page — the biggest, most prominent text that tells everyone what the page is about.',
    fullDesc: 'The H1 tag is the primary heading on your web page — typically the largest text at the top of your content. It serves the same purpose as a newspaper headline: it tells both readers and search engines exactly what this page covers. There should be exactly one H1 per page. Subheadings (H2, H3, etc.) break your content into sections, creating a hierarchy that search engines use to understand the relationship between topics on your page.',
    whyItMatters: 'Google uses the H1 as one of its strongest on-page signals for understanding page topic. A page without an H1 is like a chapter without a title — Google has to guess what it\'s about. Multiple H1s dilute the signal and confuse the hierarchy. Pages with a clear, keyword-rich H1 rank measurably better than pages without one.',
    tips: [
      'Use exactly one H1 per page — no more, no less.',
      'Include your primary keyword in the H1, but write it naturally.',
      'Make it specific to the page content: "Pizza Delivery in Oromocto" not just "Welcome".',
      'Use H2s for major sections (aim for 3-8 per page) and H3s for subsections.',
      'Don\'t use heading tags for styling. If you want big text, use CSS — heading tags are for content structure.',
    ],
    commonMistakes: [
      'Having no H1 at all — common on sites built with visual editors where the "title" is actually just styled text.',
      'Multiple H1s on the same page (e.g., the logo, the page title, and a section header are all H1s).',
      'Using H1 for the site name/logo on every page instead of the page-specific topic.',
      'Making the H1 too vague: "About Us" instead of "About [Business Name] - [City] [Service]".',
    ],
    timelineExpectation: 'H1 changes are picked up by Google within 1-4 weeks. Combined with other on-page fixes, ranking improvements typically appear within 2-8 weeks.',
    benchmarks: { good: 'One H1 with primary keyword + 4-8 H2s creating clear structure', average: 'H1 present but vague or missing keyword', poor: 'No H1, multiple H1s, or H1 used for non-content elements' },
  },
  {
    id: 'internal-linking',
    term: 'Internal Links',
    category: 'seo',
    shortDesc: 'Links between pages on your own site — they help search engines discover your content and keep visitors engaged.',
    fullDesc: 'Internal links are hyperlinks that connect one page on your website to another page on the same website. They serve three critical purposes: they help search engines discover and crawl all your pages, they distribute ranking power (authority) from strong pages to weaker ones, and they keep visitors on your site longer by guiding them to related content. Think of internal links as the hallways in a building — without them, some rooms are completely inaccessible.',
    whyItMatters: 'Pages with no internal links pointing to them are "orphaned" — search engines may never find or index them, no matter how good the content is. Good internal linking can boost a page\'s rankings without earning a single external backlink, simply by channeling authority from your stronger pages. Sites with strong internal linking also have lower bounce rates because visitors find more relevant content to explore.',
    tips: [
      'Aim for 3-5 contextual internal links per page — links within your content that point to related pages.',
      'Use descriptive anchor text: "our pizza delivery menu" not "click here." The anchor text tells Google what the linked page is about.',
      'Link from your highest-traffic pages to pages you want to rank better. Authority flows through links.',
      'Add a "Related Posts" or "You May Also Like" section at the bottom of blog posts and service pages.',
      'Make sure every important page is reachable within 3 clicks from your homepage. If it takes more clicks, search engines consider it less important.',
      'Use breadcrumb navigation — it creates automatic internal links and helps users understand where they are on your site.',
    ],
    commonMistakes: [
      'Having pages with zero internal links pointing to them (orphaned pages).',
      'Using "click here" or "read more" as anchor text for every link — this tells Google nothing.',
      'Only linking from the navigation menu and never within content. Contextual links within paragraphs carry more weight.',
      'Linking to the same page 10 times from one page — Google only counts the first link.',
    ],
    timelineExpectation: 'Internal linking improvements are picked up quickly — usually within 1-2 weeks as Google recrawls your pages. Ranking improvements from better internal linking can appear within 2-6 weeks.',
    benchmarks: { good: '5+ contextual internal links per page with descriptive anchors', average: '2-4 internal links, mostly from navigation', poor: '0-1 internal links (orphaned content risk)' },
  },
  {
    id: 'alt-text',
    term: 'Image Alt Text',
    category: 'seo',
    shortDesc: 'Descriptive text for images — tells search engines what the image shows since they can\'t "see" it.',
    fullDesc: 'Alt text (alternative text) is a short description added to every image on your website. Since search engines can\'t actually see images, alt text is how they understand what an image depicts. It also serves as the text that screen readers read aloud for visually impaired users, making it both an SEO element and an accessibility requirement. When an image fails to load, the alt text appears in its place.',
    whyItMatters: 'Google Image Search drives 22% of all web searches — images without alt text are completely invisible to this traffic source. Alt text also helps Google understand the context of your page content. For accessibility, alt text is legally required under WCAG 2.1 AA standards. Missing alt text means visually impaired users can\'t understand your images at all.',
    tips: [
      'Describe what the image actually shows, specifically: "chef preparing wood-fired pizza in restaurant kitchen" not just "pizza."',
      'Include relevant keywords naturally — but don\'t stuff. "Our pepperoni pizza on a wooden board" is fine. "Best pizza cheap pizza buy pizza" is spam.',
      'Keep alt text under 125 characters — screen readers cut off longer text.',
      'For decorative images (borders, spacers, backgrounds), use empty alt text: alt="" — this tells screen readers to skip them.',
      'Never start with "image of" or "picture of" — screen readers already announce it as an image.',
    ],
    commonMistakes: [
      'Leaving alt text blank on every image — the most common SEO mistake on the web.',
      'Using the filename as alt text: "IMG_4523.jpg" tells nobody anything.',
      'Keyword stuffing: "pizza pizza delivery best pizza oromocto pizza" — Google will flag this as spam.',
      'Using the same alt text for every image on the page.',
    ],
    timelineExpectation: 'Alt text changes are indexed within 1-4 weeks. Google Image Search traffic improvements can appear within 2-8 weeks.',
    benchmarks: { good: '100% of content images have specific, descriptive alt text', average: '50-90% coverage with some generic descriptions', poor: 'Under 50% coverage or no alt text at all' },
  },
  {
    id: 'schema-markup',
    term: 'Schema Markup (Structured Data)',
    category: 'seo',
    shortDesc: 'Special code that helps search engines understand your content and display rich results like star ratings and FAQs.',
    fullDesc: 'Schema markup is a standardized vocabulary (from schema.org) that you add to your website\'s HTML to help search engines understand the meaning of your content. Without schema, Google reads your page as plain text and has to guess what it means. With schema, you\'re explicitly telling Google: "This is a restaurant. Here\'s the address, phone number, hours, and menu." Schema enables rich results in Google — star ratings, FAQ dropdowns, recipe cards, event listings, product prices with availability — which dramatically stand out in search results.',
    whyItMatters: 'Pages with rich results (enabled by schema) get up to 58% more clicks than standard results. Schema is also critical for AI engines — ChatGPT, Perplexity, and Gemini use structured data to understand and cite your content accurately. Without schema, AI has to parse your unstructured text and may get details wrong or skip you entirely. For local businesses, LocalBusiness schema is what powers the knowledge panel that appears when someone searches your business name.',
    tips: [
      'Start with Organization schema: your business name, logo, URL, phone, and social profiles. This is the foundation.',
      'Add the most specific schema type for your business: Restaurant (not just LocalBusiness), Dentist, Plumber, LegalService, etc.',
      'Use JSON-LD format (recommended by Google). It goes in a <script> tag in your page\'s <head> section.',
      'Add FAQPage schema if you have an FAQ section — this can get your questions displayed directly in Google results.',
      'Validate your schema at search.google.com/test/rich-results before publishing.',
      'WordPress users: install Yoast SEO or RankMath — they add schema automatically. Shopify: use "JSON-LD for SEO" app.',
    ],
    commonMistakes: [
      'Not having any schema at all — this is the most common missed opportunity in SEO.',
      'Using the wrong schema type: a restaurant using generic "WebPage" schema instead of "Restaurant" schema.',
      'Having schema that doesn\'t match the visible content on the page — Google considers this deceptive.',
      'Adding schema but never validating it. Invalid schema is ignored by Google.',
    ],
    timelineExpectation: 'Google typically processes new schema within 1-4 weeks. Rich results can start appearing within 2-6 weeks after validation. Some rich result types (like FAQ) can appear within days.',
    benchmarks: { good: 'Multiple relevant schema types implemented, validated, and generating rich results', average: 'Basic Organization schema only', poor: 'No schema markup at all' },
  },
  {
    id: 'open-graph',
    term: 'Open Graph Tags',
    category: 'seo',
    shortDesc: 'Tags that control how your page looks when shared on Facebook, LinkedIn, Twitter, and other social platforms.',
    fullDesc: 'Open Graph (OG) tags are HTML meta tags that control the title, description, and image that appear when someone shares your page on social media. Without them, Facebook, LinkedIn, and Twitter guess what to show — often picking the wrong image, a truncated title, or a random paragraph as the description. With proper OG tags, every share of your content looks professional and clickable.',
    whyItMatters: 'Social media shares are free advertising. When someone shares your page and it looks broken (wrong image, no description, generic title), people don\'t click. When it looks polished with a compelling image and clear title, click-through rates from social shares increase significantly. OG tags also influence how your content appears in messaging apps like WhatsApp, Slack, and iMessage.',
    tips: [
      'Add three essential tags to every page: og:title, og:description, and og:image.',
      'Use a high-quality image at least 1200x630 pixels for og:image — this is the most important OG tag visually.',
      'Keep og:title under 60 characters and og:description under 200 characters.',
      'Test your OG tags with Facebook\'s Sharing Debugger (developers.facebook.com/tools/debug/) before sharing.',
      'Add Twitter Card tags (twitter:card, twitter:title, twitter:image) for Twitter-specific previews.',
    ],
    commonMistakes: [
      'Not having an og:image — shares without images get dramatically fewer clicks.',
      'Using a tiny or low-quality image that looks blurry in the preview card.',
      'Having OG tags on the homepage but not on inner pages.',
    ],
    benchmarks: { good: 'All three OG tags present on every page with quality 1200x630 image', average: 'OG tags on homepage only or missing og:image', poor: 'No OG tags at all' },
  },

  // ═══════════════════════════════════════════════════════════════
  // TECHNICAL SEO
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'core-web-vitals',
    term: 'Core Web Vitals',
    category: 'technical',
    shortDesc: 'Google\'s speed and experience metrics — they measure how fast and smooth your site feels to visitors.',
    fullDesc: 'Core Web Vitals are three specific metrics Google uses to measure real-world user experience: LCP (Largest Contentful Paint) measures how fast your main content loads — the moment a visitor can actually see your page. INP (Interaction to Next Paint) measures how fast your site responds when someone clicks a button or link. CLS (Cumulative Layout Shift) measures how much your page layout jumps around while loading — like when a button moves just as you\'re about to click it.',
    whyItMatters: 'Core Web Vitals are a confirmed Google ranking factor since 2021. Pages that take longer than 3 seconds to load lose 53% of mobile visitors — they just hit the back button. Slow sites have higher bounce rates, lower conversion rates, and worse rankings. Google specifically measures these three metrics and uses them to decide who ranks higher when content quality is similar between competing pages.',
    tips: [
      'Target LCP under 2.5 seconds. The biggest culprit is usually large, uncompressed images. Convert to WebP format and keep images under 100KB.',
      'Target INP under 200ms. If your site feels sluggish when clicking, you likely have too much JavaScript running. Defer non-critical scripts.',
      'Target CLS under 0.1. Always set width and height on images and ads so the browser reserves space before they load.',
      'Use Google PageSpeed Insights (pagespeed.web.dev) to test your specific pages and get actionable recommendations.',
      'Enable a CDN like Cloudflare (free tier) — it serves your content from servers closer to your visitors, reducing load time.',
      'Compress images before uploading. TinyPNG.com is free and can reduce image sizes by 50-80% without visible quality loss.',
    ],
    commonMistakes: [
      'Only testing on desktop with fast internet. Most of your visitors are on mobile with slower connections — always test mobile.',
      'Adding too many plugins/apps. Each one adds JavaScript that slows your site. Audit and remove unused ones.',
      'Using huge hero images (5MB+) that take seconds to load. Compress them.',
      'Ignoring CLS because "my site looks fine to me." Layout shifts happen during loading — you might not notice them on a fast connection.',
    ],
    timelineExpectation: 'Speed improvements are reflected in Google\'s data within 28 days (they use a rolling 28-day average). Ranking improvements from better CWV typically appear within 1-3 months.',
    benchmarks: { good: 'LCP < 2.5s, INP < 200ms, CLS < 0.1 (all green)', average: 'One or two metrics in yellow (needs improvement)', poor: 'Any metric in red (poor) — especially LCP over 4 seconds' },
  },
  {
    id: 'https',
    term: 'HTTPS / SSL Certificate',
    category: 'technical',
    shortDesc: 'The padlock icon in your browser — encryption that secures your site and is required for ranking.',
    fullDesc: 'HTTPS encrypts the connection between your website and your visitors\' browsers, protecting sensitive data like passwords, payment info, and personal details. It\'s indicated by the padlock icon in the browser address bar. Without HTTPS, browsers display a prominent "Not Secure" warning that scares visitors away. An SSL certificate is what enables HTTPS — it\'s a digital certificate that proves your site\'s identity and enables encryption.',
    whyItMatters: 'HTTPS has been a confirmed Google ranking signal since 2014. But the bigger impact is on user trust: 85% of online shoppers avoid websites marked "Not Secure." Chrome, Firefox, and Safari all display warnings on non-HTTPS sites. For any site that collects information (contact forms, logins, payments), HTTPS isn\'t optional — it\'s a legal and practical necessity.',
    tips: [
      'Most hosting providers offer free SSL certificates via Let\'s Encrypt. Check your hosting control panel — it\'s usually a one-click setup.',
      'After enabling SSL, set up 301 redirects from http:// to https:// so old links still work.',
      'Update all internal links to use https:// — mixed content (some http, some https) causes browser warnings.',
      'Update your Google Search Console and Google Business Profile to use your https:// URL.',
      'WordPress: install "Really Simple SSL" plugin for automatic HTTPS migration.',
    ],
    commonMistakes: [
      'Enabling SSL but not redirecting http to https — visitors on old links still see the insecure version.',
      'Having "mixed content" — your page loads over HTTPS but some images or scripts load over HTTP.',
      'Letting your SSL certificate expire. Set a calendar reminder to renew it (or use auto-renewal).',
    ],
    timelineExpectation: 'HTTPS migration is immediate once configured. Google recognizes the change within 1-2 weeks. The "Not Secure" warning disappears instantly.',
    benchmarks: { good: 'HTTPS enabled with valid certificate and proper redirects', average: 'HTTPS enabled but with mixed content warnings', poor: 'No HTTPS — site shows "Not Secure" warning' },
  },
  {
    id: 'site-speed',
    term: 'Site Speed / Page Load Time',
    category: 'technical',
    shortDesc: 'How fast your website loads — every second of delay costs you visitors and rankings.',
    fullDesc: 'Site speed measures how quickly your web pages load for visitors. It\'s affected by your hosting server, image sizes, amount of code, number of external resources, and whether you use caching and compression. The average website takes 3.5 seconds to load on mobile, but the top-performing sites load in under 2 seconds. Every additional second of load time reduces conversions by approximately 7%.',
    whyItMatters: 'Speed is money. Amazon found that every 100ms of latency cost them 1% in sales. For a small business, a 5-second load time means 90% of mobile visitors leave before seeing your content. Google explicitly uses speed as a ranking factor, and AI engines also prefer fast-loading sources because they can crawl and index them more efficiently.',
    tips: [
      'Test your speed at pagespeed.web.dev — it gives you a score and specific recommendations.',
      'Compress all images before uploading. Use WebP format. Keep each image under 100KB. This alone can cut load time in half.',
      'Enable browser caching so returning visitors don\'t re-download everything.',
      'Use a CDN (Cloudflare free tier is excellent) to serve content from servers near your visitors.',
      'Minify CSS and JavaScript — remove whitespace and comments from code files.',
      'Remove unused plugins, widgets, and scripts. Each one adds load time.',
    ],
    commonMistakes: [
      'Using a cheap shared hosting plan that\'s overloaded with other sites. Your server response time should be under 200ms.',
      'Uploading photos directly from your phone (3-5MB each) without compressing them first.',
      'Adding 15 WordPress plugins when you only need 5. Each plugin adds code that runs on every page load.',
      'Not testing on mobile. Your site might load fast on your office WiFi but crawl on a phone with 4G.',
    ],
    timelineExpectation: 'Speed improvements are immediate for visitors. Google\'s speed data updates on a 28-day rolling average, so ranking improvements from speed fixes typically appear within 1-3 months.',
    benchmarks: { good: 'Under 2 seconds on mobile', average: '2-4 seconds', poor: 'Over 4 seconds (losing significant traffic)' },
  },
  {
    id: 'robots-txt',
    term: 'Robots.txt',
    category: 'technical',
    shortDesc: 'A file that tells search engines which pages they can and can\'t crawl on your site.',
    fullDesc: 'Robots.txt is a plain text file at the root of your website (yoursite.com/robots.txt) that gives instructions to search engine crawlers about which pages or sections they\'re allowed to visit. It\'s like a "staff only" sign for search engines. You can use it to block crawlers from admin pages, duplicate content, or staging areas while allowing them to crawl your important public pages.',
    whyItMatters: 'A missing or misconfigured robots.txt can either block Google from crawling your important pages (killing your rankings) or waste your crawl budget on unimportant pages. For small sites this matters less, but for larger sites with hundreds of pages, proper robots.txt configuration ensures Google spends its time on your most important content.',
    tips: [
      'Check if you have one: visit yoursite.com/robots.txt in your browser.',
      'At minimum, include a link to your sitemap: Sitemap: https://yoursite.com/sitemap.xml',
      'Block admin/login pages, staging environments, and internal search results.',
      'Never block your CSS or JavaScript files — Google needs them to render your pages.',
      'Test your robots.txt in Google Search Console under "robots.txt Tester."',
    ],
    commonMistakes: [
      'Accidentally blocking your entire site with "Disallow: /" — this removes you from Google completely.',
      'Blocking CSS/JS files, which prevents Google from rendering your pages properly.',
      'Not having a robots.txt at all (minor issue but easy to fix).',
    ],
    benchmarks: { good: 'Present with sitemap reference and sensible rules', average: 'Present but empty or default', poor: 'Missing or accidentally blocking important pages' },
  },
  {
    id: 'xml-sitemap',
    term: 'XML Sitemap',
    category: 'technical',
    shortDesc: 'A file that lists all your important pages so search engines can find and crawl them efficiently.',
    fullDesc: 'An XML sitemap is a file (usually at yoursite.com/sitemap.xml) that lists every important page on your website along with metadata like when it was last updated and how important it is relative to other pages. It\'s like giving Google a map of your entire site so it doesn\'t have to discover pages by following links alone.',
    whyItMatters: 'Without a sitemap, Google discovers your pages by following links — which means orphaned pages (pages with no links pointing to them) may never be found. A sitemap ensures every important page gets crawled and indexed. It\'s especially important for new sites, large sites, and sites that add content frequently.',
    tips: [
      'Most CMS platforms generate sitemaps automatically (WordPress with Yoast, Shopify built-in, etc.).',
      'Submit your sitemap to Google Search Console under "Sitemaps."',
      'Only include pages you want indexed — don\'t include admin pages, thank-you pages, or duplicate content.',
      'Keep your sitemap updated when you add or remove pages.',
      'Reference your sitemap in your robots.txt file.',
    ],
    benchmarks: { good: 'Auto-generated, submitted to Search Console, and up to date', average: 'Present but not submitted or outdated', poor: 'No sitemap at all' },
  },
  {
    id: 'semantic-html',
    term: 'Semantic HTML',
    category: 'technical',
    shortDesc: 'HTML tags that describe the purpose of content — helping search engines understand your page structure.',
    fullDesc: 'Semantic HTML uses meaningful tags like <main>, <nav>, <article>, <header>, <footer>, and <section> instead of generic <div> tags for everything. These tags tell search engines and AI systems what role each part of your page plays. A <nav> tag says "this is navigation." An <article> tag says "this is a standalone piece of content." Without semantic tags, your page is just a flat collection of text with no structural meaning.',
    whyItMatters: 'Search engines and AI use semantic HTML to understand your page structure, which influences how they index and display your content. Semantic markup can influence featured snippet selection — Google is more likely to pull content from a properly structured <article> than from a random <div>. It also improves accessibility for screen readers.',
    tips: [
      'Wrap your main content area in <main> — there should be one per page.',
      'Use <nav> for navigation menus (header nav, footer nav, sidebar nav).',
      'Use <article> for blog posts, news articles, and standalone content pieces.',
      'Use <header> and <footer> for page-level and section-level headers/footers.',
      'Use <section> to group related content that has its own heading.',
    ],
    benchmarks: { good: 'Multiple semantic tags used correctly throughout', average: 'Some semantic tags present', poor: 'All <div> tags with no semantic structure' },
  },
  {
    id: 'mobile-responsiveness',
    term: 'Mobile Responsiveness',
    category: 'technical',
    shortDesc: 'Whether your site works properly on phones and tablets — over 60% of searches happen on mobile.',
    fullDesc: 'Mobile responsiveness means your website automatically adjusts its layout, text size, images, and navigation to work well on any screen size — from a large desktop monitor to a small phone screen. Google uses "mobile-first indexing," meaning it primarily evaluates the mobile version of your site for ranking purposes. If your site doesn\'t work well on mobile, Google ranks the mobile version — which means your desktop-only site is being judged by its worst version.',
    whyItMatters: 'Over 60% of all Google searches happen on mobile devices. If your site is hard to use on a phone — tiny text, buttons too close together, horizontal scrolling — visitors leave immediately. Google has confirmed that mobile-friendliness is a ranking factor, and with mobile-first indexing, a non-responsive site is at a severe disadvantage.',
    tips: [
      'Test your site on your own phone. Can you read the text without zooming? Can you tap buttons easily?',
      'Use Google\'s Mobile-Friendly Test: search.google.com/test/mobile-friendly',
      'Ensure you have the viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
      'Make buttons and links at least 44x44 pixels — the minimum comfortable tap target.',
      'Avoid pop-ups that cover the entire screen on mobile — Google penalizes "intrusive interstitials."',
    ],
    benchmarks: { good: 'Fully responsive, passes Google\'s mobile-friendly test', average: 'Mostly responsive with minor issues', poor: 'Not mobile-friendly — requires zooming and horizontal scrolling' },
  },
  {
    id: 'duplicate-content',
    term: 'Duplicate Content',
    category: 'technical',
    shortDesc: 'When the same content appears on multiple pages — confuses Google about which version to rank.',
    fullDesc: 'Duplicate content occurs when substantially similar content appears at more than one URL on your site (or across different sites). This can happen unintentionally — for example, if your site is accessible at both www.yoursite.com and yoursite.com, or if product pages have multiple URL variations. Google doesn\'t penalize duplicate content directly, but it does have to choose which version to show in search results, and it might pick the wrong one.',
    whyItMatters: 'When Google finds duplicate content, it picks one version to index and ignores the others. If it picks the wrong version, your preferred page may not rank at all. Duplicate content also dilutes your backlinks — if people link to different versions of the same page, the authority is split instead of concentrated.',
    tips: [
      'Use canonical tags (<link rel="canonical">) to tell Google which version of a page is the "official" one.',
      'Set up 301 redirects from www to non-www (or vice versa) so there\'s only one version of your site.',
      'Avoid publishing the same blog post or product description on multiple pages.',
      'If you syndicate content to other sites, make sure they use a canonical tag pointing back to your original.',
    ],
    benchmarks: { good: 'Canonical tags on all pages, no duplicate URLs', average: 'Some duplicate URLs but canonical tags in place', poor: 'Multiple versions of pages accessible with no canonicals' },
  },

  // ═══════════════════════════════════════════════════════════════
  // AEO (Answer Engine Optimization)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'aeo',
    term: 'AEO (Answer Engine Optimization)',
    category: 'aeo',
    shortDesc: 'Optimizing your content so AI assistants like ChatGPT and Perplexity cite your website.',
    fullDesc: 'AEO is the practice of structuring your content so that AI-powered answer engines recognize your site as an authoritative source and cite it in their responses. When someone asks ChatGPT "who\'s the best plumber in Toronto?" or asks Perplexity "what restaurant has the best pizza in Oromocto?", the AI reads hundreds of websites and decides which ones to recommend. AEO is about making sure your site is one of them. It focuses on clear definitions, Q&A formatting, structured data, and entity density — the signals AI systems use to determine which sources to trust and cite.',
    whyItMatters: 'AI search is growing rapidly. Millions of people now ask AI assistants for recommendations instead of scrolling through Google results. If your content isn\'t structured for AI to understand and cite, you\'re invisible to this growing audience. Sites optimized for AEO get recommended when users ask AI for advice, products, or services — and these recommendations carry enormous trust because users treat AI answers as curated, not advertised.',
    tips: [
      'Add clear definitions at the top of your content: "[Your Business] is a [category] in [location] that [key differentiator]."',
      'Create an FAQ section with 5-10 common questions and direct, concise answers. AI loves Q&A format.',
      'Use structured data (schema markup) so AI can parse your content programmatically — not just read it as text.',
      'Include specific facts, numbers, and named entities. "Serving Oromocto since 2005" is citable. "We\'ve been around for a while" is not.',
      'Structure content with clear headings that match common questions people ask about your business or industry.',
    ],
    timelineExpectation: 'AEO improvements take effect as AI engines recrawl your site, which varies by platform. Some changes are reflected within weeks, others may take 1-3 months.',
    learnMoreUrl: '/blog/what-is-aeo',
  },
  {
    id: 'entity-density',
    term: 'Entity Density',
    category: 'aeo',
    shortDesc: 'How many specific, verifiable facts are in your content — AI needs concrete details to cite you.',
    fullDesc: 'Entity density measures the concentration of named entities in your content — specific people, organizations, places, products, dates, prices, statistics, and measurements. AI systems use entities to verify facts and determine content authority. Content with high entity density gives AI concrete, citable information. Content with low entity density ("we\'ve been in business for many years") gives AI nothing specific to reference.',
    whyItMatters: 'AI engines are fundamentally fact-checking machines. When they need to answer a question, they look for content with verifiable, specific information. "Our restaurant has served Oromocto since 2005, with over 50,000 pizzas delivered" is infinitely more citable than "We\'re a popular local restaurant." Every vague statement is a missed opportunity for AI citation.',
    tips: [
      'Replace every vague term with a specific one: "since 2005" not "for many years", "$2.4 million" not "millions of dollars."',
      'Name specific products, people, places, and organizations. "We use San Marzano tomatoes imported from Italy" not "we use quality ingredients."',
      'Include exact statistics: "47% increase" not "significant increase."',
      'Cite sources with dates: "According to Moz (2025), the average small business DA is 15-25."',
      'Add specific pricing, hours, addresses, and service areas — these are all entities AI can extract and cite.',
    ],
    benchmarks: { good: 'Multiple specific entities per paragraph with verifiable facts', average: 'Some specifics mixed with vague language', poor: 'Mostly vague, generic content with no specific data points' },
  },
  {
    id: 'question-answering',
    term: 'Q&A Content / FAQ Sections',
    category: 'aeo',
    shortDesc: 'Content structured as questions and answers — the format AI is specifically designed to find and cite.',
    fullDesc: 'Q&A content is structured in a question-and-answer format that AI systems can easily parse and cite. This includes FAQ sections, "How does X work?" explanations, and direct answers to common queries. AI assistants are fundamentally question-answering machines — when someone asks ChatGPT a question, it actively searches for content that directly answers that question in a clear, concise format. Pages with Q&A formatting are 2-3x more likely to be cited.',
    whyItMatters: 'When someone asks an AI "What\'s the best pizza place in Oromocto?", the AI looks for pages that directly answer that question. A page with an FAQ section that says "Q: What makes our pizza different? A: We use a 72-hour cold-fermented dough and wood-fired oven at 900°F" gives the AI a perfect, citable answer. A page that just says "Welcome to our restaurant" gives it nothing.',
    tips: [
      'Create a dedicated FAQ section with 5-10 questions your customers actually ask.',
      'Start each answer with a direct response (1-2 sentences), then expand with details.',
      'Use H2 or H3 tags for each question — this helps both Google and AI parse the Q&A structure.',
      'Add FAQPage schema markup — this can get your questions displayed directly in Google search results as rich snippets.',
      'Write questions in the same language your customers use: "How much does a large pizza cost?" not "What is the pricing structure for our premium offerings?"',
    ],
    commonMistakes: [
      'Writing FAQ questions nobody actually asks. Use your real customer questions, not marketing-speak.',
      'Giving vague answers: "Contact us for pricing" instead of actually listing prices.',
      'Having an FAQ section but not adding FAQPage schema — you\'re missing the rich result opportunity.',
    ],
    benchmarks: { good: 'Dedicated FAQ section with 5-10 real questions, direct answers, and FAQPage schema', average: 'Some Q&A content but no schema markup', poor: 'No Q&A formatted content anywhere on the site' },
  },

  // ═══════════════════════════════════════════════════════════════
  // GEO (Generative Engine Optimization)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'geo',
    term: 'GEO (Generative Engine Optimization)',
    category: 'geo',
    shortDesc: 'Optimizing for AI-generated search results — the new frontier of search visibility.',
    fullDesc: 'GEO measures how well your content performs in AI-generated search results — Google AI Overviews, ChatGPT web search, Perplexity answers, and similar systems. Unlike traditional SEO which optimizes for a list of 10 blue links, GEO optimizes for AI systems that read your content and decide whether to include it in a synthesized answer. GEO evaluates expertise signals, factual density, tone objectivity, and citation likelihood. The key difference: in traditional search, you compete for a click. In AI search, you compete for a citation.',
    whyItMatters: 'AI search is replacing traditional "10 blue links" for an increasing number of queries. Google AI Overviews now appear for over 30% of searches. When AI generates an answer, it typically cites 3-5 sources — if you\'re not one of them, you\'re invisible for that query. The businesses that optimize for GEO now will have a massive advantage as AI search continues to grow.',
    tips: [
      'Write with a factual, objective tone. AI engines deprioritize content that reads like advertising.',
      'Include author credentials and expertise signals — AI trusts content from demonstrably qualified sources.',
      'Support every claim with data or a citation. "According to [source]..." is citable. "We believe..." is not.',
      'Use third-person perspective where possible. "Research shows..." carries more weight than "We think..."',
      'Focus on being informative rather than selling. The most-cited pages are educational, not promotional.',
    ],
    timelineExpectation: 'GEO improvements take effect as AI engines recrawl and re-evaluate your content. This varies by platform but typically 2-8 weeks for major AI engines.',
    learnMoreUrl: '/blog/seo-vs-aeo-vs-geo',
  },
  {
    id: 'expertise-signals',
    term: 'Expertise Signals (E-E-A-T)',
    category: 'geo',
    shortDesc: 'Proof that your content is written by qualified people — AI and Google both check for this.',
    fullDesc: 'Expertise signals demonstrate to search engines and AI that your content is created by knowledgeable, trustworthy people. Google\'s E-E-A-T framework (Experience, Expertise, Authoritativeness, Trustworthiness) evaluates these signals to determine content quality. This includes author bios with credentials, professional profile links, certifications, years of experience, and peer recognition. For "Your Money or Your Life" (YMYL) topics like health, finance, and legal advice, expertise signals are especially critical.',
    whyItMatters: 'AI systems prioritize content from demonstrably expert sources. A health article written by "Dr. Sarah Chen, MD, Board-Certified Dermatologist with 15 years of experience" will be cited over an identical article with no author attribution. Without expertise signals, your content competes with millions of generic pages. With them, AI recognizes you as an authority worth citing.',
    tips: [
      'Add an "About the Author" section to every content page with real credentials, experience, and qualifications.',
      'Link to the author\'s LinkedIn, professional website, or industry profile.',
      'Add Person schema markup with sameAs links to professional profiles.',
      'For service businesses: mention years of experience, certifications, licenses, and number of customers served.',
      'Include "Reviewed by [Expert Name], [Credentials]" for content in sensitive areas (health, finance, legal).',
      'Show real testimonials and case studies — social proof is an expertise signal.',
    ],
    benchmarks: { good: 'Author bio with credentials, professional links, and Person schema', average: 'Author name mentioned but no credentials or links', poor: 'No author attribution at all — anonymous content' },
  },
  {
    id: 'content-tone',
    term: 'Content Tone / Objectivity',
    category: 'geo',
    shortDesc: 'How factual your writing is — AI trusts informative content and ignores sales copy.',
    fullDesc: 'Content tone refers to whether your writing is informative and objective versus promotional and salesy. AI systems are trained on high-quality, factual content and have learned to deprioritize marketing language. Words like "best ever," "amazing," "revolutionary," and "world-class" are red flags that signal promotional content. Factual statements like "serves 500 customers per week" or "established in 2005" signal trustworthy, citable content.',
    whyItMatters: 'AI engines actively deprioritize content that reads like advertising. If your page is full of superlatives and sales language, AI will cite a competitor\'s more objective page instead — even if your information is better. This is one of the most common reasons businesses with great products get overlooked by AI: their website reads like a brochure instead of an information source.',
    tips: [
      'Remove superlatives: replace "best," "amazing," "revolutionary," "world-class" with factual statements.',
      'Replace "we offer the best service" with "our average response time is 30 minutes."',
      'Use data instead of adjectives: "serves 10,000 customers annually" not "loved by everyone."',
      'Write to inform, not to sell. The most-cited pages read like Wikipedia articles, not advertisements.',
      'Let customer reviews and testimonials do the selling — they\'re third-party validation, not self-promotion.',
    ],
    commonMistakes: [
      'Writing your entire website in marketing-speak. Your homepage can be promotional, but service/product pages should be informative.',
      'Using "we" and "our" in every sentence. Third-person perspective ("the service includes...") reads as more objective.',
      'Making claims without evidence. "Best pizza in town" means nothing. "Voted #1 by Oromocto Times readers 3 years running" is citable.',
    ],
    benchmarks: { good: 'Factual, objective tone with data-backed statements throughout', average: 'Mostly informative with some promotional language', poor: 'Heavily promotional / reads like a sales brochure' },
  },

  // ═══════════════════════════════════════════════════════════════
  // LOCAL SEO
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'google-business-profile',
    term: 'Google Business Profile',
    category: 'local',
    shortDesc: 'Your free Google listing — for local businesses, this is often more important than your website.',
    fullDesc: 'Google Business Profile (GBP, formerly Google My Business) is a free tool that controls how your business appears on Google Search and Google Maps. It displays your business name, address, phone number, hours, reviews, photos, posts, and more directly in search results. For local searches like "pizza near me" or "plumber in Toronto," the Google Map Pack (powered by GBP) appears above all organic results — meaning your GBP listing gets seen before any website.',
    whyItMatters: '46% of all Google searches have local intent. The Map Pack (top 3 local results) gets 42% of all clicks for local searches. If you\'re not in the Map Pack, you\'re invisible for local queries — even if your website ranks well in organic results below it. Your GBP listing is often the first impression a potential customer has of your business. Businesses with complete GBP profiles are 70% more likely to attract location visits.',
    tips: [
      'Claim and verify your profile at business.google.com if you haven\'t already. Verification usually takes 1-2 weeks via postcard.',
      'Fill out EVERY field: business name, address, phone, hours (including holiday hours), categories (pick the most specific primary category), description, and attributes.',
      'Add at least 10 high-quality photos. Businesses with photos get 42% more direction requests and 35% more website clicks.',
      'Respond to EVERY review — positive and negative — within 24-48 hours. Response rate is a ranking factor.',
      'Post updates weekly: new menu items, promotions, events, tips. Active profiles rank higher.',
      'Add your products or services with descriptions and prices. This gives Google more content to match against searches.',
    ],
    commonMistakes: [
      'Not claiming your profile at all — Google may auto-generate one with incorrect information.',
      'Choosing a broad category ("Restaurant") instead of a specific one ("Pizza Restaurant"). Specific categories rank better for specific searches.',
      'Ignoring negative reviews. Unanswered negative reviews hurt both your ranking and customer trust.',
      'Having different hours on your GBP vs your website. Inconsistency confuses Google and frustrates customers.',
      'Not adding photos. Profiles without photos look abandoned and get significantly fewer clicks.',
    ],
    timelineExpectation: 'GBP changes are usually reflected within 1-3 days. Ranking improvements in the Map Pack from a fully optimized profile can take 2-8 weeks. Review accumulation is ongoing.',
    benchmarks: { good: 'Fully optimized with 20+ photos, 50+ reviews, weekly posts, and all fields complete', average: 'Claimed and verified with basic info but incomplete', poor: 'Not claimed, or claimed but mostly empty' },
  },
  {
    id: 'local-citations',
    term: 'Local Citations / NAP Consistency',
    category: 'local',
    shortDesc: 'Your business name, address, and phone number listed consistently across the web.',
    fullDesc: 'Local citations are online mentions of your business\'s Name, Address, and Phone number (NAP) on directories, social platforms, review sites, and other websites. Google cross-references these citations to verify your business exists, is located where you say it is, and is legitimate. The key word is "consistent" — your NAP must be identical everywhere. "123 Main St" on one site and "123 Main Street" on another is an inconsistency that confuses Google.',
    whyItMatters: 'Consistent citations across 30+ directories build trust with Google and directly influence your Map Pack ranking. Inconsistent information (different phone numbers, old addresses, misspelled business names) confuses Google and can drop you out of local results entirely. Citation consistency is one of the top 5 local ranking factors.',
    tips: [
      'Pick ONE exact format for your NAP and use it everywhere: same abbreviations, same phone format, same suite number format.',
      'Get listed on the big directories first: Google Business Profile, Yelp, Yellow Pages, BBB, Facebook, Apple Maps, Bing Places.',
      'Add industry-specific directories: TripAdvisor for restaurants, Healthgrades for doctors, Avvo for lawyers, HomeAdvisor for contractors.',
      'Use a tool like Moz Local or BrightLocal to scan for inconsistencies and fix them.',
      'When you change your address or phone number, update EVERY listing immediately. Old information is worse than no listing.',
    ],
    commonMistakes: [
      'Having your old address on some directories after moving. This is the #1 citation problem.',
      'Using different phone numbers (cell vs office vs tracking number) on different directories.',
      'Abbreviating inconsistently: "St" on one site, "Street" on another, "St." on a third.',
      'Creating duplicate listings on the same directory — this confuses Google and can get both listings suppressed.',
    ],
    timelineExpectation: 'New citations are typically discovered by Google within 2-8 weeks. Fixing inconsistencies can take 4-12 weeks to fully propagate. Building 30+ consistent citations typically shows Map Pack improvements within 2-3 months.',
    benchmarks: { good: '30+ consistent citations across major and industry directories', average: '10-30 citations with some inconsistencies', poor: 'Under 10 citations or major NAP inconsistencies' },
  },
  {
    id: 'local-schema',
    term: 'LocalBusiness Schema',
    category: 'local',
    shortDesc: 'Structured data that tells search engines your exact business details for local results.',
    fullDesc: 'LocalBusiness schema is a specific type of structured data markup that provides search engines with machine-readable information about your local business — name, address, phone, hours, price range, geographic coordinates, and more. Use the most specific type available: Restaurant, Dentist, Plumber, LegalService, etc. This is what powers the knowledge panel that appears when someone searches your business name, and it helps Google match your business to relevant local searches.',
    whyItMatters: 'Without LocalBusiness schema, Google has to guess your business details from unstructured text on your page. With it, you\'re giving Google verified, structured data it can confidently display. For restaurants, Restaurant schema with menu, hours, and cuisine type can trigger rich results showing your hours and price range directly in search results — before anyone even clicks.',
    tips: [
      'Use the most specific schema type: "Restaurant" not "LocalBusiness", "Dentist" not "MedicalBusiness."',
      'Include: name, address (full PostalAddress), telephone, openingHoursSpecification, priceRange, and geo coordinates.',
      'For restaurants: add servesCuisine, menu URL, and acceptsReservations.',
      'Keep schema data consistent with your Google Business Profile — mismatches cause confusion.',
      'Validate at search.google.com/test/rich-results before publishing.',
    ],
    benchmarks: { good: 'Specific business type schema with complete data, validated', average: 'Generic LocalBusiness schema with partial data', poor: 'No local schema at all' },
  },
  {
    id: 'review-signals',
    term: 'Online Reviews',
    category: 'local',
    shortDesc: 'Customer reviews on Google, Yelp, and other platforms — a major local ranking factor.',
    fullDesc: 'Online reviews are customer ratings and written feedback on platforms like Google, Yelp, Facebook, TripAdvisor, and industry-specific review sites. Google considers review quantity, quality (star rating), recency, and your response rate as ranking factors for local search. Reviews also heavily influence whether a potential customer chooses your business over a competitor.',
    whyItMatters: 'Reviews are one of the top 3 local ranking factors. Businesses with more reviews and higher ratings rank higher in the Map Pack. 87% of consumers read online reviews before visiting a local business. A business with 50 reviews at 4.5 stars will almost always outrank a business with 5 reviews at 5 stars — volume matters.',
    tips: [
      'Ask every satisfied customer for a review. The easiest way: send a follow-up email or text with a direct link to your Google review page.',
      'Respond to every review within 24-48 hours — positive and negative. Google tracks response rate.',
      'For negative reviews: acknowledge the issue, apologize, offer to make it right, and take the conversation offline.',
      'Never buy fake reviews. Google detects them and may suspend your profile entirely.',
      'Aim for a steady stream of reviews over time — 2-4 per month is better than 20 in one week (which looks suspicious).',
    ],
    commonMistakes: [
      'Ignoring negative reviews. An unanswered negative review is worse than the review itself.',
      'Asking for reviews only when things go well. A natural mix of ratings looks more authentic.',
      'Buying fake reviews or incentivizing reviews with discounts (violates Google\'s policies).',
      'Only focusing on Google reviews and ignoring Yelp, Facebook, and industry-specific platforms.',
    ],
    benchmarks: { good: '50+ Google reviews, 4.0+ stars, responding to all reviews', average: '10-50 reviews with decent rating', poor: 'Under 10 reviews or below 3.5 stars' },
  },

  // ═══════════════════════════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'content-depth',
    term: 'Content Depth / Word Count',
    category: 'content',
    shortDesc: 'How comprehensive your page content is — but quality matters more than raw word count.',
    fullDesc: 'Content depth refers to how thoroughly a page covers its topic. Top-ranking pages average 1,400+ words, but the right length depends entirely on the topic and user intent. A restaurant homepage doesn\'t need 1,000 words — it needs a menu, hours, location, and 200-300 words of compelling description. A blog post about "how to choose a plumber" might need 1,500+ words to be comprehensive. The key is covering the topic completely, not hitting an arbitrary word count.',
    whyItMatters: 'Pages under 300 words are considered "thin content" by search engines and AI — they provide insufficient material to rank or cite. But more words doesn\'t automatically mean better. A 500-word page that perfectly answers a question will outrank a 2,000-word page full of fluff. For AI citation, depth matters because AI needs enough content to extract meaningful, citable information.',
    tips: [
      'For service/product pages: 500-800 words covering what you offer, who it\'s for, pricing, and FAQs.',
      'For blog posts: 1,000-2,000 words with comprehensive coverage, subheadings, and examples.',
      'For local business homepages: 300-500 words with complete business info, plus schema markup.',
      'For restaurants: focus on menu, hours, location, and atmosphere — word count is less important than completeness.',
      'Structure with H2 subheadings every 200-300 words to break up content and improve readability.',
      'Add an FAQ section to any page — it naturally adds depth while answering real customer questions.',
    ],
    commonMistakes: [
      'Padding content with filler to hit a word count. Google can detect low-quality padding.',
      'Having a homepage with just a logo and a phone number — no content for Google to index.',
      'Writing 3,000 words when 800 would cover the topic completely. Respect your reader\'s time.',
      'Applying blog-length expectations to every page type. A contact page doesn\'t need 1,000 words.',
    ],
    benchmarks: { good: '800+ words for content pages, or complete business info for local pages', average: '300-800 words', poor: 'Under 300 words (thin content — rarely ranks)' },
  },
  {
    id: 'heading-structure',
    term: 'Heading Structure (H1-H6)',
    category: 'content',
    shortDesc: 'How your content is organized with headings — like a table of contents for search engines.',
    fullDesc: 'Heading structure is the hierarchy of H1-H6 tags that organize your content into sections and subsections. Think of it like a book: H1 is the book title (one per page), H2s are chapter titles, H3s are section titles within chapters. This hierarchy helps both users scan your content quickly and search engines understand the relationship between topics. Well-structured headings can also trigger featured snippets in Google.',
    whyItMatters: 'Google and AI systems use headings to understand what each section of your page covers. A page with 8 well-organized H2 headings gives Google 8 clear topics to potentially rank for. A page with no headings is a wall of text that\'s harder to parse, harder to read, and harder to rank. Pages with clear heading structure are also more likely to be selected for featured snippets.',
    tips: [
      'Use exactly one H1 for the main page topic.',
      'Use 4-8 H2s for major sections — each should cover a distinct subtopic.',
      'Use H3s for subsections within H2s when needed.',
      'Include keywords in headings naturally — don\'t force them.',
      'Make headings descriptive enough to understand without reading the content below them.',
      'Think of your headings as a table of contents — if someone only read the headings, would they understand what the page covers?',
    ],
    benchmarks: { good: '1 H1 + 4-8 descriptive H2s with clear hierarchy', average: 'H1 present with 1-3 H2s', poor: 'No heading structure, multiple H1s, or headings used for styling only' },
  },
  {
    id: 'content-freshness',
    term: 'Content Freshness',
    category: 'content',
    shortDesc: 'How recently your content was updated — Google favors current, maintained content.',
    fullDesc: 'Content freshness refers to how recently your content was created or updated. Google uses freshness as a ranking signal, especially for time-sensitive queries. A page about "best SEO practices" from 2020 is less relevant than one updated in 2026. Adding a visible "Last Updated" date, refreshing statistics, fixing broken links, and adding new sections all signal to Google that your content is actively maintained.',
    whyItMatters: 'Outdated content with old statistics, broken links, or references to discontinued products loses rankings over time. Google interprets stale content as potentially unreliable. Regularly updated content signals that your site is active, authoritative, and trustworthy. For AI citation, freshness is critical — AI engines prefer recent sources.',
    tips: [
      'Add a visible "Last Updated: [date]" near the top of content pages.',
      'Review and update your most important pages quarterly.',
      'Replace outdated statistics with current data.',
      'Fix broken links — they signal neglect to search engines.',
      'Add new sections covering recent developments in your industry.',
      'Update your dateModified property in Article schema when you refresh content.',
    ],
    benchmarks: { good: 'Key pages updated within the last 6 months with visible dates', average: 'Content updated within the last year', poor: 'Content over 2 years old with no updates' },
  },

  // ═══════════════════════════════════════════════════════════════
  // COMPETITIVE & PLATFORM
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'competitive-gap',
    term: 'Competitive Gap Analysis',
    category: 'seo',
    shortDesc: 'Finding the specific areas where competitors outperform you — so you know exactly what to fix.',
    fullDesc: 'Competitive gap analysis compares your site against competitors across multiple dimensions: content depth, schema markup, backlinks/DA, site speed, heading structure, alt text coverage, and more. Instead of trying to improve everything at once, gap analysis identifies the specific areas where competitors have an advantage and prioritizes which gaps to close first for maximum ranking improvement.',
    whyItMatters: 'You don\'t need to be perfect at everything — you need to be better than your competitors at the things that matter most for your target keywords. A competitor with schema markup and you without it is a bigger gap than a competitor with 1,000 words and you with 800. Gap analysis turns a vague "improve your SEO" into a specific, prioritized action plan.',
    tips: [
      'Focus on closing the biggest gaps first — they have the most ranking impact.',
      'Schema gaps are usually the highest-ROI fix: if competitors have it and you don\'t, adding schema can show results in weeks.',
      'Content depth gaps are relatively easy to close — add sections, FAQs, and details.',
      'DA gaps require a long-term backlink strategy. Start now because it takes months.',
      'Re-run your competitive analysis quarterly to track progress and find new gaps.',
    ],
  },
  {
    id: 'google-rank-vs-ai-rank',
    term: 'Google Rank vs AI Rank',
    category: 'seo',
    shortDesc: 'Where Google ranks you vs where AI would rank you — they often don\'t match, and the gap tells a story.',
    fullDesc: 'Google Rank is your position in traditional search results, heavily influenced by backlinks, domain authority, and brand recognition. AI Rank is your position based on on-page content quality, structure, schema, and AI readiness. These often don\'t match. A site can rank #1 on Google (strong DA, lots of backlinks) but #5 in AI readiness (poor content structure, no schema). Or a site can be #8 on Google but #2 in AI readiness (great content, weak authority).',
    whyItMatters: 'The gap between your Google rank and AI rank reveals your biggest opportunity. If your AI rank is better than your Google rank, your content is strong but you need more authority (backlinks). If your AI rank is worse, your authority is carrying you but competitors with better content could overtake you as AI search grows. Understanding this gap helps you prioritize the right strategy.',
    tips: [
      'If AI rank is better than Google rank: your content is ready for the future. Focus on backlink building to match your content quality with authority.',
      'If AI rank is worse than Google rank: your brand/authority is carrying you. Invest in content quality, schema, and AI readiness before competitors catch up.',
      'If they match: you\'re well-balanced. Maintain both content quality and authority building.',
      'Track both ranks over time. As AI search grows, AI rank becomes increasingly important.',
    ],
    learnMoreUrl: '/blog/google-rank-vs-ai-rank',
  },
  {
    id: 'platform-detection',
    term: 'Platform Detection',
    category: 'platform',
    shortDesc: 'Identifying what your website is built with so fix instructions are specific to your actual tools.',
    fullDesc: 'Platform detection identifies the technology your website is built on — WordPress, Shopify, Wix, Squarespace, Next.js, and many others. This is critical because "add schema markup to your site" means completely different things depending on your platform. On WordPress, it means installing a plugin. On Shopify, it means editing theme.liquid. On Wix, it means using the SEO dashboard. Generic "edit your HTML" advice is useless if you don\'t have direct HTML access.',
    whyItMatters: 'The #1 reason people don\'t implement SEO fixes is that the instructions don\'t match their platform. Telling a Wix user to "edit your header.php file" is meaningless. Platform-specific instructions that say "Go to Wix Dashboard > Marketing & SEO > SEO Tools > select your page > Advanced SEO" are actionable. This is the difference between advice that gets implemented and advice that gets ignored.',
    tips: [
      'WordPress: Install Yoast SEO or RankMath for automated SEO. They handle title tags, meta descriptions, schema, and sitemaps.',
      'Shopify: Use the built-in SEO fields in product/page editors. Install "JSON-LD for SEO" app for schema.',
      'Wix: Use the SEO Wiz and structured data tools in the Marketing & SEO dashboard.',
      'Squarespace: Use the SEO panel in page settings (gear icon > SEO tab).',
      'Custom/Next.js: Implement SEO manually using metadata API, JSON-LD scripts, and next-sitemap.',
    ],
    benchmarks: { good: 'Platform detected with appropriate SEO tools/plugins installed', average: 'Platform detected but no SEO tools configured', poor: 'Custom platform with no SEO infrastructure' },
  },
]

// ═══════════════════════════════════════════════════════════════
// LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const KNOWLEDGE_MAP = new Map(KNOWLEDGE_BASE.map(e => [e.id, e]))

export function getKnowledge(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_MAP.get(id)
}

export function getAllKnowledge(): KnowledgeEntry[] {
  return KNOWLEDGE_BASE
}

export function getKnowledgeByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
  return KNOWLEDGE_BASE.filter(e => e.category === category)
}

export function getAllTermIds(): string[] {
  return KNOWLEDGE_BASE.map(e => e.id)
}

export function searchKnowledge(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase()
  return KNOWLEDGE_BASE.filter(e =>
    e.term.toLowerCase().includes(q) ||
    e.shortDesc.toLowerCase().includes(q) ||
    e.id.includes(q)
  )
}
