'use client'

import { useState } from 'react'
import { Zap, Search, Sparkles, Bot, Copy, Filter, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CircularProgress } from '@/components/dashboard/circular-progress'
import { DemoShell } from '@/components/demo/demo-shell'
import { AuditPageHeader } from '@/components/dashboard/audit-page-header'
import { SEOTabEnhanced } from '@/components/dashboard/seo-tab-enhanced'
import { AEOTab } from '@/components/dashboard/aeo-tab'
import { GEOTab } from '@/components/dashboard/geo-tab'
import { LearnMore } from '@/components/ui/learn-more'
import { Badge } from '@/components/ui/badge'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { LinkBuildingIntelligence } from '@/components/dashboard/link-building-intelligence'
import { WhatsNextCard, NEXT_STEPS } from '@/components/dashboard/whats-next-card'
import { ExpertAnalysis } from '@/components/dashboard/expert-analysis'
import { PageComparisonTable } from '@/components/dashboard/page-comparison-table'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ─── Hardcoded Demo Data ───────────────────────────────────────────────────────

const DEMO_URL = 'www.sunrise-bakery.com'

const DEMO_SCORES = { seo: 48, aeo: 35, geo: 31 }

const DEMO_SITE_TYPE = { primaryType: 'local-business', secondaryTypes: ['food-beverage'], confidence: 92 }

const DEMO_PLATFORM = { platform: 'wordpress', label: 'WordPress', confidence: 'high' as const }

const DEMO_PAGES_CRAWLED = 5

const DEMO_CWV = {
  performanceScore: 42,
  lcp: { value: 3200, category: 'AVERAGE', displayValue: '3.2s', score: 0.4 },
  inp: { value: 180, category: 'FAST', displayValue: '180ms', score: 0.9 },
  cls: { value: 0.15, category: 'AVERAGE', displayValue: '0.15', score: 0.5 },
  overallCategory: 'AVERAGE',
}

const DEMO_AGGREGATE_METRICS = {
  totalWords: 2340,
  totalSchemas: 1,
  avgResponseTime: 720,
  totalImages: 24,
  totalImagesWithAlt: 10,
}

const DEMO_EXPERT_ANALYSIS = {
  bottomLine: 'This 5-page crawl reveals systemic issues across the entire site. No page scores above 60 in any dimension. The homepage is the strongest page but still lacks schema markup and has thin content. Inner pages like /contact and /catering are severely under-optimized.',
  keyInsight: 'The site has zero LocalBusiness schema across all 5 pages — this is the single biggest gap. For a local bakery, structured data is essential for Google Maps, AI assistants, and rich search results. Only 1 page has any schema at all (basic WebSite on homepage).',
  priorityAction: 'Add LocalBusiness schema to every page and expand content on /menu and /catering to 800+ words each',
}

const DEMO_BACKLINK_DATA = {
  metrics: {
    domain: 'sunrise-bakery.com',
    domainAuthority: 12,
    pageAuthority: 8,
    linkingDomains: 2,
    totalBacklinks: 3,
    spamScore: 5,
  },
  backlinks: [
    { sourceDomain: 'portlandfoodguide.com', sourceUrl: 'https://portlandfoodguide.com/best-bakeries', anchorText: 'Sunrise Bakery', domainAuthority: 35, isDofollow: true },
    { sourceDomain: 'yelp.com', sourceUrl: 'https://yelp.com/biz/sunrise-bakery-portland', anchorText: 'sunrise-bakery.com', domainAuthority: 94, isDofollow: false },
    { sourceDomain: 'localchamber.org', sourceUrl: 'https://localchamber.org/members', anchorText: 'Visit Website', domainAuthority: 28, isDofollow: true },
  ],
}

const DEMO_DUPLICATE_TITLES = [
  { title: 'Sunrise Bakery - Fresh Baked Goods', urls: ['https://www.sunrise-bakery.com/', 'https://www.sunrise-bakery.com/about'] },
  { title: 'Contact Us | Sunrise Bakery', urls: ['https://www.sunrise-bakery.com/contact', 'https://www.sunrise-bakery.com/catering'] },
]

const DEMO_DUPLICATE_DESCRIPTIONS = [
  { description: 'Sunrise Bakery offers fresh bread, pastries, and custom cakes in downtown Portland.', urls: ['https://www.sunrise-bakery.com/', 'https://www.sunrise-bakery.com/menu', 'https://www.sunrise-bakery.com/about'] },
]

const DEMO_SITEWIDE = {
  domainHealthScore: 34,
  consistencyScore: 41,
  authorityMetrics: {
    schemaCoverage: 20,
    metadataOptimization: 60,
  },
  domainHealthBreakdown: {
    contentQuality: 38,
    schemaQuality: 15,
    metadataQuality: 52,
    technicalHealth: 45,
    architectureHealth: 28,
  },
  domainHealthExplanations: {
    contentQuality: { score: 38, issues: ['3 of 5 pages have thin content (<600 words)', 'No FAQ or how-to content found'], recommendations: ['Expand page content to 800+ words', 'Add FAQ sections to key pages'] },
    schemaQuality: { score: 15, issues: ['Only 1 page has any schema markup', '4 pages have zero structured data'], recommendations: ['Add LocalBusiness schema to all pages', 'Add FAQPage schema to menu and about pages'] },
    metadataQuality: { score: 52, issues: ['2 duplicate title tags', '1 duplicate meta description group'], recommendations: ['Write unique titles for each page', 'Create unique descriptions per page'] },
    technicalHealth: { score: 45, issues: ['Average response time 720ms (target <300ms)', 'Performance score 42/100'], recommendations: ['Enable caching and image optimization', 'Defer non-critical JavaScript'] },
    architectureHealth: { score: 28, issues: ['2 orphan pages with no internal links', '3 pages missing H1 tags'], recommendations: ['Add internal links between related pages', 'Add H1 headings to every page'] },
  },
  aeoReadiness: {
    score: 28,
    verdict: 'This site is poorly prepared for AI engine optimization. AI assistants like ChatGPT and Google SGE will struggle to extract useful information due to missing structured data, no FAQ content, and weak topical authority.',
    signals: {
      hasAboutPage: true,
      hasFaqContent: false,
      hasStructuredQa: false,
      hasAuthorOrExpertSignals: false,
      hasClearTopicFocus: true,
      hasSchemaForAi: false,
      hasLongformContent: false,
    },
  },
  geoReadiness: {
    score: 24,
    verdict: 'Generative engine visibility is very low. The site lacks the authority signals, factual density, and citable content that AI engines need to confidently recommend this business.',
    signals: {
      hasSocialProof: false,
      hasAuthoritySignals: false,
      hasFactualDensity: false,
      hasObjectiveTone: true,
      hasCitableContent: false,
      hasBrandClarity: true,
      hasTopicalDepth: false,
    },
  },
  recommendations: [
    {
      title: 'Add LocalBusiness Schema to All Pages',
      domain: 'seo',
      priority: 'CRITICAL',
      description: 'None of your 5 pages have LocalBusiness schema. This is the #1 fix for local business visibility in search and AI engines.',
      howToFix: 'Install Rank Math or Yoast SEO plugin and configure LocalBusiness schema with your bakery details on every page.',
      platform: 'WordPress',
      effort: 1,
      steps: [
        { step: 1, title: 'Install Schema Plugin', description: 'Install Rank Math from the WordPress plugin directory.' },
        { step: 2, title: 'Configure Business Type', description: 'Set business type to Bakery under LocalBusiness.' },
        { step: 3, title: 'Add to All Pages', description: 'Enable schema output on all pages in the plugin settings.' },
      ],
      code: `<script type="application/ld+json">{\n  "@context": "https://schema.org",\n  "@type": "Bakery",\n  "name": "Sunrise Bakery",\n  "address": { "@type": "PostalAddress", "streetAddress": "123 Main St", "addressLocality": "Portland", "addressRegion": "OR" },\n  "openingHours": "Mo-Sa 06:00-18:00"\n}</script>`,
      impactedScores: ['seo', 'aeo'],
    },
    {
      title: 'Fix Duplicate Title Tags',
      domain: 'seo',
      priority: 'CRITICAL',
      description: '2 pairs of pages share identical titles, causing keyword cannibalization and confusing search engines.',
      howToFix: 'Write unique, descriptive title tags for each page reflecting its specific content.',
      platform: 'WordPress',
      effort: 1,
      steps: [
        { step: 1, title: 'Audit Titles', description: 'Review all 5 page titles in Yoast/Rank Math.' },
        { step: 2, title: 'Write Unique Titles', description: 'Create descriptive 50-60 character titles for each page.' },
      ],
      impactedScores: ['seo'],
    },
    {
      title: 'Add H1 Tags to 3 Missing Pages',
      domain: 'seo',
      priority: 'CRITICAL',
      description: '3 of 5 pages are missing H1 headings. Search engines use H1 to understand page topic.',
      howToFix: 'Add a single, descriptive H1 heading to /menu, /contact, and /catering pages.',
      platform: 'WordPress',
      effort: 1,
      steps: [
        { step: 1, title: 'Edit Each Page', description: 'Open each page in the WordPress editor.' },
        { step: 2, title: 'Add H1 Block', description: 'Add a Heading block set to H1 at the top of each page.' },
      ],
      impactedScores: ['seo', 'aeo'],
    },
    {
      title: 'Create FAQ Section with Schema',
      domain: 'aeo',
      priority: 'HIGH',
      description: 'No FAQ content found on any page. AI assistants heavily favor sites with structured Q&A content.',
      howToFix: 'Add FAQ sections to homepage and /menu with FAQPage schema markup.',
      platform: 'WordPress',
      effort: 2,
      steps: [
        { step: 1, title: 'Research Questions', description: 'Check Google "People Also Ask" for bakery-related queries.' },
        { step: 2, title: 'Write Q&A Pairs', description: 'Write 5-8 clear Q&A pairs per page.' },
        { step: 3, title: 'Add FAQPage Schema', description: 'Wrap FAQ content in FAQPage structured data.' },
      ],
      code: `<script type="application/ld+json">{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{ "@type": "Question", "name": "Do you offer gluten-free options?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! We offer daily gluten-free breads, muffins, and cookies." } }]\n}</script>`,
      impactedScores: ['aeo', 'seo'],
    },
    {
      title: 'Expand Thin Content on 3 Pages',
      domain: 'seo',
      priority: 'HIGH',
      description: '/menu (320 words), /contact (180 words), and /catering (290 words) are all thin content. Expand to 800+ words each.',
      howToFix: 'Add service descriptions, testimonials, local context, and detailed information to each page.',
      platform: 'WordPress',
      effort: 2,
      steps: [
        { step: 1, title: 'Expand /menu', description: 'Add descriptions for each menu category, ingredient sourcing, and seasonal specials.' },
        { step: 2, title: 'Expand /contact', description: 'Add directions, parking info, neighborhood description, and a mini FAQ.' },
        { step: 3, title: 'Expand /catering', description: 'Add package details, pricing tiers, testimonials, and ordering process.' },
      ],
      impactedScores: ['seo', 'aeo', 'geo'],
    },
    {
      title: 'Build Local Citation Profile',
      domain: 'geo',
      priority: 'HIGH',
      description: 'Only 3 backlinks from 2 domains. AI engines need more citation signals to assess authority.',
      howToFix: 'Create profiles on Google Business, Yelp, TripAdvisor, and local Portland directories.',
      platform: 'Any',
      effort: 3,
      steps: [
        { step: 1, title: 'Claim Google Business', description: 'Create or claim your Google Business Profile with complete info.' },
        { step: 2, title: 'Submit to Directories', description: 'Add to Yelp, TripAdvisor, Foursquare, and local food directories.' },
        { step: 3, title: 'Outreach to Bloggers', description: 'Contact Portland food bloggers for reviews and mentions.' },
      ],
      impactedScores: ['geo'],
    },
    {
      title: 'Fix Internal Linking & Orphan Pages',
      domain: 'seo',
      priority: 'MEDIUM',
      description: '2 pages (/catering and /about) have no internal links pointing to them, making them hard to discover.',
      howToFix: 'Add contextual internal links from the homepage and /menu to all other pages.',
      platform: 'WordPress',
      effort: 1,
      steps: [
        { step: 1, title: 'Add Navigation Links', description: 'Ensure all pages are in the main navigation menu.' },
        { step: 2, title: 'Add Contextual Links', description: 'Link from homepage content to /catering and /about pages.' },
      ],
      impactedScores: ['seo'],
    },
    {
      title: 'Improve Core Web Vitals',
      domain: 'seo',
      priority: 'MEDIUM',
      description: 'Performance score is 42/100 with LCP at 3.2s. Slow sites hurt rankings and user experience.',
      howToFix: 'Install a caching plugin, optimize images, and defer non-critical JavaScript.',
      platform: 'WordPress',
      effort: 2,
      steps: [
        { step: 1, title: 'Install Caching', description: 'Install WP Rocket or LiteSpeed Cache for page caching.' },
        { step: 2, title: 'Optimize Images', description: 'Install ShortPixel to compress and convert images to WebP.' },
        { step: 3, title: 'Defer JS', description: 'Use the caching plugin to delay non-essential JavaScript.' },
      ],
      impactedScores: ['seo'],
    },
  ],
}

// Per-page data for PageComparisonTable
const DEMO_PAGES: Array<{
  url: string
  title: string
  seoScore: number
  aeoScore: number
  geoScore: number
  wordCount: number
  hasH1: boolean
  hasMetaDescription: boolean
  schemaCount: number
  issueCount: number
  issues: Array<{ type: string; severity: 'high' | 'medium' | 'low'; fix: string }>
  responseTimeMs: number
}> = [
  {
    url: 'https://www.sunrise-bakery.com/',
    title: 'Sunrise Bakery - Fresh Baked Goods Daily',
    seoScore: 58, aeoScore: 42, geoScore: 38,
    wordCount: 650, hasH1: true, hasMetaDescription: true, schemaCount: 1,
    issueCount: 4, responseTimeMs: 680,
    issues: [
      { type: 'Content Depth', severity: 'medium', fix: 'Expand content to 800+ words with service descriptions and local context.' },
      { type: 'Alt Text', severity: 'medium', fix: 'Add descriptive alt text to 4 missing images.' },
      { type: 'External Links', severity: 'low', fix: 'Add 2-3 relevant external links to authoritative sources.' },
    ],
  },
  {
    url: 'https://www.sunrise-bakery.com/menu',
    title: 'Our Menu | Sunrise Bakery',
    seoScore: 51, aeoScore: 38, geoScore: 33,
    wordCount: 320, hasH1: false, hasMetaDescription: true, schemaCount: 0,
    issueCount: 6, responseTimeMs: 750,
    issues: [
      { type: 'H1 Tag', severity: 'high', fix: 'Add an H1 heading like "Artisan Bakery Menu — Breads, Pastries & Cakes".' },
      { type: 'Schema Markup', severity: 'high', fix: 'Add Menu or LocalBusiness schema with menu items.' },
      { type: 'Content Depth', severity: 'high', fix: 'Expand from 320 to 800+ words with item descriptions.' },
    ],
  },
  {
    url: 'https://www.sunrise-bakery.com/about',
    title: 'Sunrise Bakery - Fresh Baked Goods',
    seoScore: 47, aeoScore: 35, geoScore: 30,
    wordCount: 580, hasH1: true, hasMetaDescription: false, schemaCount: 0,
    issueCount: 5, responseTimeMs: 690,
    issues: [
      { type: 'Meta Description', severity: 'high', fix: 'Add a unique meta description summarizing the bakery story.' },
      { type: 'Schema Markup', severity: 'high', fix: 'Add Organization or LocalBusiness schema.' },
      { type: 'Duplicate Title', severity: 'medium', fix: 'Change title to something unique like "About Sunrise Bakery — Our Story".' },
    ],
  },
  {
    url: 'https://www.sunrise-bakery.com/contact',
    title: 'Contact Us | Sunrise Bakery',
    seoScore: 38, aeoScore: 28, geoScore: 25,
    wordCount: 180, hasH1: false, hasMetaDescription: true, schemaCount: 0,
    issueCount: 7, responseTimeMs: 820,
    issues: [
      { type: 'H1 Tag', severity: 'high', fix: 'Add an H1 heading like "Contact Sunrise Bakery".' },
      { type: 'Content Depth', severity: 'high', fix: 'Expand from 180 to 600+ words with directions, hours, and FAQ.' },
      { type: 'Schema Markup', severity: 'high', fix: 'Add LocalBusiness schema with address and contact info.' },
    ],
  },
  {
    url: 'https://www.sunrise-bakery.com/catering',
    title: 'Contact Us | Sunrise Bakery',
    seoScore: 42, aeoScore: 30, geoScore: 28,
    wordCount: 290, hasH1: false, hasMetaDescription: false, schemaCount: 0,
    issueCount: 8, responseTimeMs: 780,
    issues: [
      { type: 'H1 Tag', severity: 'high', fix: 'Add an H1 heading like "Catering Services — Sunrise Bakery".' },
      { type: 'Duplicate Title', severity: 'high', fix: 'Change title — currently identical to /contact page.' },
      { type: 'Meta Description', severity: 'high', fix: 'Add a unique meta description for catering services.' },
    ],
  },
]

// Tab data for SEO/AEO/GEO tabs (aggregated from homepage as representative)
const DEMO_TAB_DATA = {
  technical: { isHttps: true, responseTimeMs: 720, status: 200 },
  structuralData: {
    wordCount: 650,
    links: { internal: 8, external: 0 },
    media: { totalImages: 24, imagesWithAlt: 10 },
    semanticTags: { article: 0, main: 1, nav: 1, aside: 0, headers: 4, h1Count: 1 },
  },
  ai: {
    scores: DEMO_SCORES,
    enhancedPenalties: [
      { category: 'SEO' as const, component: 'Schema Markup', penalty: 'No LocalBusiness Schema', explanation: '4 of 5 pages have zero schema markup. Only homepage has basic WebSite schema.', fix: 'Add LocalBusiness JSON-LD schema to all pages.', pointsDeducted: -12, severity: 'critical' as const },
      { category: 'SEO' as const, component: 'H1 Tag', penalty: 'Missing H1 on 3 Pages', explanation: '/menu, /contact, and /catering are all missing H1 headings.', fix: 'Add descriptive H1 tags to each page.', pointsDeducted: -8, severity: 'critical' as const },
      { category: 'SEO' as const, component: 'Duplicate Titles', penalty: '2 Duplicate Title Groups', explanation: 'Homepage/about share a title. Contact/catering share a title.', fix: 'Write unique titles for every page.', pointsDeducted: -6, severity: 'critical' as const },
      { category: 'AEO' as const, component: 'FAQ Content', penalty: 'No FAQ on Any Page', explanation: 'Zero FAQ or Q&A content across all 5 pages.', fix: 'Add FAQ sections with FAQPage schema to homepage and /menu.', pointsDeducted: -10, severity: 'critical' as const },
      { category: 'SEO' as const, component: 'Content Depth', penalty: 'Thin Content', explanation: '3 pages have under 400 words. /contact has only 180 words.', fix: 'Expand thin pages to 800+ words with detailed content.', pointsDeducted: -6, severity: 'warning' as const },
      { category: 'AEO' as const, component: 'Answer Clarity', penalty: 'Low Snippet Eligibility', explanation: 'Content lacks concise, direct answers that AI can extract.', fix: 'Structure content with clear definitions and direct answers.', pointsDeducted: -5, severity: 'warning' as const },
      { category: 'GEO' as const, component: 'Citation Signals', penalty: 'Weak Citation Profile', explanation: 'Only 3 backlinks from 2 domains across the entire site.', fix: 'Build citations on local directories and food blogs.', pointsDeducted: -8, severity: 'critical' as const },
      { category: 'GEO' as const, component: 'Brand Mentions', penalty: 'Low Brand Visibility', explanation: 'Minimal brand presence across the web.', fix: 'Create profiles on Google Business, Yelp, and TripAdvisor.', pointsDeducted: -6, severity: 'warning' as const },
      { category: 'SEO' as const, component: 'Alt Text', penalty: 'Missing Alt Text', explanation: 'Only 10 of 24 images across all pages have alt text.', fix: 'Add descriptive alt text to all images.', pointsDeducted: -4, severity: 'warning' as const },
      { category: 'AEO' as const, component: 'Structured Answers', penalty: 'No How-To Content', explanation: 'No instructional content found on any page.', fix: 'Add ordering guides or recipe snippets with HowTo schema.', pointsDeducted: -3, severity: 'info' as const },
    ],
    seoAnalysis: {
      onPageIssues: ['3 pages missing H1 tags', '2 duplicate title groups', '4 pages missing schema', 'Thin content on 3 pages', '14 images missing alt text'],
      keywordOpportunities: ['portland bakery', 'artisan bread portland', 'custom cakes portland', 'bakery catering portland', 'gluten-free bakery portland'],
      contentQuality: 'fair' as const,
      metaAnalysis: 'Only 3 of 5 pages have meta descriptions. 2 pairs of pages share duplicate titles, causing keyword cannibalization.',
    },
    aeoAnalysis: {
      questionsAnswered: { who: 1, what: 1, where: 1, why: 0, how: 0 },
      missingSchemas: ['FAQPage', 'HowTo', 'LocalBusiness', 'Menu'],
      snippetEligibilityScore: 12,
      topOpportunities: ['Add FAQ sections to all pages', 'Create how-to ordering guide', 'Add structured Q&A content'],
    },
    geoAnalysis: {
      sentimentScore: 0.5,
      brandPerception: 'neutral' as const,
      citationLikelihood: 14,
      llmContextClarity: 18,
      visibilityGaps: ['Very low domain authority (12)', 'Only 3 backlinks from 2 domains', 'No brand mentions in AI training data', 'Missing authority signals across all pages'],
    },
  },
}

// ─── Demo Page Component ───────────────────────────────────────────────────────

export default function DemoDeepScanPage() {
  const [activeTab, setActiveTab] = useState('seo')
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL')

  const recs = DEMO_SITEWIDE.recommendations
  const normPriority = (r: any) => r.priority === 'STEADY' ? 'MEDIUM' : (r.priority || 'MEDIUM')
  const normDomain = (r: any) => (r.domain || 'SEO').toLowerCase()

  const criticalCount = recs.filter((r: any) => normPriority(r) === 'CRITICAL').length
  const highCount = recs.filter((r: any) => normPriority(r) === 'HIGH').length
  const mediumCount = recs.filter((r: any) => normPriority(r) === 'MEDIUM').length
  const filtered = priorityFilter === 'ALL' ? recs : recs.filter((r: any) => normPriority(r) === priorityFilter)

  // Key metrics strip
  const imgAltPct = Math.round((DEMO_AGGREGATE_METRICS.totalImagesWithAlt / DEMO_AGGREGATE_METRICS.totalImages) * 100)
  const h1Pct = Math.round((DEMO_PAGES.filter(p => p.hasH1).length / DEMO_PAGES.length) * 100)
  const httpsPct = 100
  const metaPct = Math.round((DEMO_PAGES.filter(p => p.hasMetaDescription).length / DEMO_PAGES.length) * 100)
  const pctColor = (v: number) => v >= 75 ? "text-green-500" : v >= 50 ? "text-yellow-500" : "text-red-500"
  const respColor = (ms: number) => ms <= 300 ? "text-green-500" : ms <= 600 ? "text-yellow-500" : "text-red-500"

  const metrics = [
    { label: "Domain Health", value: `${DEMO_SITEWIDE.domainHealthScore}%`, color: pctColor(DEMO_SITEWIDE.domainHealthScore), tip: "AI-powered aggregate domain quality score combining content quality, schema implementation, metadata completeness, technical performance, and site architecture across all crawled pages." },
    { label: "Brand", value: `${DEMO_SITEWIDE.consistencyScore}%`, color: pctColor(DEMO_SITEWIDE.consistencyScore), tip: "Brand consistency across all crawled pages — measures uniform tone, messaging, visual identity signals, and content voice." },
    { label: "Schema", value: `${DEMO_SITEWIDE.authorityMetrics.schemaCoverage}%`, color: pctColor(DEMO_SITEWIDE.authorityMetrics.schemaCoverage), tip: "Percentage of crawled pages with valid structured data (JSON-LD). Schema markup enables rich snippets and helps AI engines understand your content." },
    { label: "Metadata", value: `${metaPct}%`, color: pctColor(metaPct), tip: "Percentage of crawled pages with both a title tag and meta description." },
    { label: "H1 Tags", value: `${h1Pct}%`, color: pctColor(h1Pct), tip: "Percentage of crawled pages with an H1 heading tag. Every page should have exactly one." },
    { label: "HTTPS", value: `${httpsPct}%`, color: pctColor(httpsPct), tip: "Percentage of crawled pages served over HTTPS." },
    { label: "Response", value: `${DEMO_AGGREGATE_METRICS.avgResponseTime}ms`, color: respColor(DEMO_AGGREGATE_METRICS.avgResponseTime), tip: "Average server response time (TTFB) across all crawled pages. Under 300ms is good, over 600ms needs attention." },
    { label: "Robots.txt", value: "Found", color: "text-green-500", tip: "Whether a robots.txt file exists at the domain root." },
    { label: "Sitemap", value: "Missing", color: "text-red-500", tip: "Whether an XML sitemap was found at the domain root." },
    { label: "Alt Text", value: `${imgAltPct}%`, color: pctColor(imgAltPct), tip: "Percentage of images across all crawled pages with descriptive alt text." },
  ]

  return (
    <DemoShell>
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-6 overflow-hidden">

          {/* ═══ DEMO BANNER ═══ */}
          <div className="rounded-lg border-2 border-[#BC13FE]/40 bg-[#BC13FE]/5 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#BC13FE] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5">Interactive Demo</Badge>
              <p className="text-sm text-muted-foreground">This is a demo with sample data for <span className="font-bold text-foreground">{DEMO_URL}</span></p>
            </div>
            <Link href="/signup" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold text-xs transition-colors">
              Get Real Results <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Page Header */}
          <AuditPageHeader
            title="Deep Scan"
            description="Crawls your homepage and key inner pages to score your site across SEO, AEO, and GEO with AI-powered analysis."
            currentUrl={DEMO_URL}
            hasResults={true}
            isAnalyzing={false}
            onNewAudit={() => {}}
            onRefreshAnalysis={() => {}}
            analysisData={{}}
            pageCount={DEMO_PAGES_CRAWLED}
            siteType={{ primaryType: DEMO_SITE_TYPE.primaryType, confidence: DEMO_SITE_TYPE.confidence }}
            platformDetection={DEMO_PLATFORM}
            onSiteTypeConfirm={() => {}}
            onSiteTypeChange={() => {}}
            onPlatformChange={() => {}}
          />

          {/* Results Display */}
          <div className="space-y-6">
            {/* Aggregate Score Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-1">
                  <CircularProgress value={DEMO_SCORES.seo} variant="seo" label="Avg SEO Score" size={140} strokeWidth={10} />
                </div>
              </Card>
              <Card className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-1">
                  <CircularProgress value={DEMO_SCORES.aeo} variant="aeo" label="Avg AEO Score" size={140} strokeWidth={10} />
                </div>
              </Card>
              <Card className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-1">
                  <CircularProgress value={DEMO_SCORES.geo} variant="geo" label="Avg GEO Score" size={140} strokeWidth={10} />
                </div>
              </Card>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {metrics.map(m => (
                <div key={m.label} className="rounded-lg border border-border/50 bg-card/50 px-2.5 py-2">
                  <div className="flex items-center gap-0.5 mb-0.5">
                    <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-tight truncate">{m.label}</p>
                    <InfoTooltip content={m.tip} className="shrink-0 [&_svg]:h-2.5 [&_svg]:w-2.5" />
                  </div>
                  <p className={`text-sm font-black ${m.color} truncate`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Expert Analysis */}
            <ExpertAnalysis analysis={DEMO_EXPERT_ANALYSIS} />

            {/* Page Comparison Table */}
            <PageComparisonTable pages={DEMO_PAGES} />

            {/* Roadmap to 100 */}
            <Card className="border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5">
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Zap className="h-5 w-5 text-[#00e5ff]" />
                  <CardTitle>Roadmap to 100 - Prioritized Site Improvements</CardTitle>
                  <button onClick={() => {
                    const text = recs.map((r: any, i: number) => `${i + 1}. [${normPriority(r)}] [${(r.domain || 'SEO').toUpperCase()}] ${r.title}\n   ${r.description}`).join('\n\n')
                    navigator.clipboard.writeText(text)
                  }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-[#00e5ff]/50 transition-colors">
                    <Copy className="h-3.5 w-3.5" /> Copy All
                  </button>
                </div>
                {/* Priority Filter */}
                <div className="flex items-center gap-2 mt-3">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  {[
                    { key: 'ALL' as const, label: 'All', count: recs.length, activeColor: 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40', inactiveColor: 'bg-muted/30 text-muted-foreground border-border/30 hover:border-border/50' },
                    { key: 'CRITICAL' as const, label: 'Critical', count: criticalCount, activeColor: 'bg-destructive/20 text-destructive border-destructive/40', inactiveColor: 'bg-destructive/5 text-destructive/60 border-destructive/20 hover:bg-destructive/10' },
                    { key: 'HIGH' as const, label: 'High', count: highCount, activeColor: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40', inactiveColor: 'bg-[#f59e0b]/5 text-[#f59e0b]/60 border-[#f59e0b]/20 hover:bg-[#f59e0b]/10' },
                    { key: 'MEDIUM' as const, label: 'Medium', count: mediumCount, activeColor: 'bg-[#BC13FE]/20 text-[#BC13FE] border-[#BC13FE]/40', inactiveColor: 'bg-[#BC13FE]/5 text-[#BC13FE]/60 border-[#BC13FE]/20 hover:bg-[#BC13FE]/10' },
                  ].filter(f => f.key === 'ALL' || f.count > 0).map(f => (
                    <button key={f.key} onClick={() => setPriorityFilter(f.key)}
                      className={cn('px-3 py-1 rounded-lg text-xs font-bold transition-all border',
                        priorityFilter === f.key ? f.activeColor : f.inactiveColor
                      )}>
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((rec: any, i: number) => (
                    <FixInstructionCard
                      key={i}
                      title={rec.title}
                      domain={normDomain(rec) as any}
                      priority={normPriority(rec)}
                      steps={rec.steps || [{ step: 1, title: 'How To Fix', description: rec.howToFix || rec.description }]}
                      code={rec.code || rec.codeSnippet}
                      platform={rec.platform || 'Any'}
                      estimatedTime={rec.estimatedTime || `${rec.effort || 1}h`}
                      difficulty={rec.effort >= 3 ? 'difficult' : rec.effort >= 2 ? 'moderate' : 'easy'}
                      impact={rec.priority === 'CRITICAL' ? 'high' : rec.priority === 'HIGH' ? 'medium' : 'low'}
                      affectedPages={DEMO_PAGES_CRAWLED}
                      impactedScores={rec.impactedScores}
                      whyItMatters={rec.description}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Link Building Intelligence */}
            <LinkBuildingIntelligence metrics={DEMO_BACKLINK_DATA.metrics} backlinks={DEMO_BACKLINK_DATA.backlinks} />

            {/* Domain Health Breakdown */}
            <Card className="border-[#00e5ff]/20 bg-[#00e5ff]/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#00e5ff]" />
                  <CardTitle className="text-foreground">Domain Health Breakdown</CardTitle>
                  <Badge className="ml-auto bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30 text-xs font-black">{DEMO_SITEWIDE.domainHealthScore} / 100</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pb-4 border-b border-border/50 mb-4">
                  {[
                    { label: "Content", value: DEMO_SITEWIDE.domainHealthBreakdown.contentQuality },
                    { label: "Schema", value: DEMO_SITEWIDE.domainHealthBreakdown.schemaQuality },
                    { label: "Metadata", value: DEMO_SITEWIDE.domainHealthBreakdown.metadataQuality },
                    { label: "Technical", value: DEMO_SITEWIDE.domainHealthBreakdown.technicalHealth },
                    { label: "Architecture", value: DEMO_SITEWIDE.domainHealthBreakdown.architectureHealth },
                  ].map(item => {
                    const v = item.value ?? 0
                    const scoreColor = v >= 75 ? "text-green-500" : v >= 50 ? "text-yellow-500" : "text-red-500"
                    return (
                      <div key={item.label} className="text-center">
                        <p className={`text-2xl font-black ${scoreColor}`}>{v}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                      </div>
                    )
                  })}
                </div>
                {/* Health explanations */}
                <div className="space-y-3">
                  {Object.entries(DEMO_SITEWIDE.domainHealthExplanations).map(([key, data]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-xs text-muted-foreground">{data.score}/100</span>
                      </div>
                      {data.issues?.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                          {data.issues.slice(0, 3).map((issue, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-yellow-600 mt-0.5">⚠</span> {issue}
                            </li>
                          ))}
                        </ul>
                      )}
                      {data.recommendations?.length > 0 && (
                        <ul className="text-xs space-y-0.5 mt-2">
                          {data.recommendations.slice(0, 3).map((rec, i) => (
                            <li key={i} className="flex items-start gap-1 text-[#00e5ff]">
                              <Zap className="h-3 w-3 shrink-0 mt-0.5" /> <span className="text-foreground/80">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duplicate Content Detection */}
            <Card className="border-yellow-500/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <CardTitle>Duplicate Content Detection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_DUPLICATE_TITLES.map((dup, i) => (
                  <div key={`t-${i}`} className="p-3 border rounded-lg">
                    <p className="text-xs font-bold text-yellow-600 mb-1">Duplicate Title ({dup.urls.length} pages)</p>
                    <p className="text-sm font-medium mb-1 truncate">{dup.title}</p>
                    <div className="space-y-0.5">
                      {dup.urls.map((u, j) => <p key={j} className="text-xs text-muted-foreground truncate">{u}</p>)}
                    </div>
                    <div className="flex items-start gap-1.5 mt-2 p-1.5 rounded bg-[#00e5ff]/5 border border-[#00e5ff]/20">
                      <Zap className="h-3 w-3 text-[#00e5ff] shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80"><span className="font-semibold text-[#00e5ff]">Fix:</span> Write a unique, descriptive title for each page that reflects its specific content. Duplicate titles cause keyword cannibalization.</p>
                    </div>
                  </div>
                ))}
                {DEMO_DUPLICATE_DESCRIPTIONS.map((dup, i) => (
                  <div key={`d-${i}`} className="p-3 border rounded-lg">
                    <p className="text-xs font-bold text-yellow-600 mb-1">Duplicate Description ({dup.urls.length} pages)</p>
                    <p className="text-sm font-medium mb-1 truncate">{dup.description}</p>
                    <div className="space-y-0.5">
                      {dup.urls.map((u, j) => <p key={j} className="text-xs text-muted-foreground truncate">{u}</p>)}
                    </div>
                    <div className="flex items-start gap-1.5 mt-2 p-1.5 rounded bg-[#00e5ff]/5 border border-[#00e5ff]/20">
                      <Zap className="h-3 w-3 text-[#00e5ff] shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80"><span className="font-semibold text-[#00e5ff]">Fix:</span> Write a unique meta description (120-160 chars) for each page summarizing its specific value proposition.</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AEO Readiness */}
            <Card className="border-[#BC13FE]/20 bg-[#BC13FE]/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#BC13FE]" />
                  <CardTitle>AEO Readiness</CardTitle>
                  <LearnMore term="aeo" />
                  <Badge className="ml-auto bg-[#BC13FE]/10 text-[#BC13FE] border-[#BC13FE]/30 text-xs font-black">
                    {DEMO_SITEWIDE.aeoReadiness.score}/100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{DEMO_SITEWIDE.aeoReadiness.verdict}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(DEMO_SITEWIDE.aeoReadiness.signals).map(([key, val]) => {
                    const label = key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()
                    const fixes: Record<string, string> = {
                      'AboutPage': 'Create a detailed About page with team bios, company history, and expertise signals.',
                      'FaqContent': 'Add an FAQ section with structured Q&A using FAQPage schema markup.',
                      'StructuredQa': 'Implement FAQPage or QAPage schema to help AI engines parse your Q&A content.',
                      'AuthorOrExpertSignals': 'Add author bios with credentials, certifications, or experience to establish E-E-A-T.',
                      'ClearTopicFocus': 'Tighten your content around core topics. Avoid covering too many unrelated subjects.',
                      'SchemaForAi': 'Add JSON-LD schema (Organization, LocalBusiness, FAQPage) to help AI engines understand your site.',
                      'LongformContent': 'Create in-depth content (1000+ words) on key topics to demonstrate expertise.',
                    }
                    const fixKey = key.replace(/^has/, '')
                    return (
                      <div key={key} className={`p-2 rounded border text-xs ${val ? 'border-green-500/30 bg-green-500/5 text-green-600' : 'border-red-500/30 bg-red-500/5 text-red-600'}`}>
                        <p>{val ? '✓' : '✗'} {label}</p>
                        {!val && fixes[fixKey] && (
                          <p className="text-[10px] text-foreground/60 mt-1">💡 {fixes[fixKey]}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* GEO Readiness */}
            <Card className="border-[#22c55e]/20 bg-[#22c55e]/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#22c55e]" />
                  <CardTitle>GEO Readiness</CardTitle>
                  <LearnMore term="geo" />
                  <Badge className="ml-auto bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30 text-xs font-black">
                    {DEMO_SITEWIDE.geoReadiness.score}/100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{DEMO_SITEWIDE.geoReadiness.verdict}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(DEMO_SITEWIDE.geoReadiness.signals).map(([key, val]) => {
                    const label = key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()
                    const fixes: Record<string, string> = {
                      'SocialProof': 'Add testimonials, case studies, client logos, or review schema to build trust signals.',
                      'AuthoritySignals': 'Highlight certifications, awards, partnerships, or media mentions on your site.',
                      'FactualDensity': 'Include specific statistics, data points, and numbers in your content.',
                      'ObjectiveTone': 'Balance promotional content with informative, neutral writing that AI engines prefer.',
                      'CitableContent': 'Create original research, unique data, or expert analysis that others would reference.',
                      'BrandClarity': 'Ensure consistent brand messaging, clear value proposition, and unified identity across pages.',
                      'TopicalDepth': 'Create comprehensive, in-depth content on your core topics rather than surface-level pages.',
                    }
                    const fixKey = key.replace(/^has/, '')
                    return (
                      <div key={key} className={`p-2 rounded border text-xs ${val ? 'border-green-500/30 bg-green-500/5 text-green-600' : 'border-red-500/30 bg-red-500/5 text-red-600'}`}>
                        <p>{val ? '✓' : '✗'} {label}</p>
                        {!val && fixes[fixKey] && (
                          <p className="text-[10px] text-foreground/60 mt-1">💡 {fixes[fixKey]}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tabbed SEO / AEO / GEO Analysis */}
            <Tabs defaultValue="seo" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full sm:w-auto bg-muted/50 p-1">
                <TabsTrigger value="seo" className={cn("gap-2 border transition-all duration-200", "border-seo/10 bg-seo/5 text-seo/40 cursor-pointer", "hover:border-seo/30 hover:bg-seo/10 hover:text-seo/60", "data-[state=active]:!border-seo/50 data-[state=active]:!bg-seo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100")}>
                  <Search className="h-4 w-4" /><span className="hidden sm:inline">SEO Analysis</span><span className="sm:hidden">SEO</span>
                </TabsTrigger>
                <TabsTrigger value="aeo" className={cn("gap-2 border transition-all duration-200", "border-aeo/10 bg-aeo/5 text-aeo/40 cursor-pointer", "hover:border-aeo/30 hover:bg-aeo/10 hover:text-aeo/60", "data-[state=active]:!border-aeo/50 data-[state=active]:!bg-aeo data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100")}>
                  <Sparkles className="h-4 w-4" /><span className="hidden sm:inline">AEO Analysis</span><span className="sm:hidden">AEO</span>
                </TabsTrigger>
                <TabsTrigger value="geo" className={cn("gap-2 border transition-all duration-200", "border-[#fe3f8c]/10 bg-[#fe3f8c]/5 text-[#fe3f8c]/40 cursor-pointer", "hover:border-[#fe3f8c]/30 hover:bg-[#fe3f8c]/10 hover:text-[#fe3f8c]/60", "data-[state=active]:!border-[#fe3f8c]/50 data-[state=active]:!bg-[#fe3f8c] data-[state=active]:!text-white data-[state=active]:!shadow-lg data-[state=active]:!font-bold data-[state=active]:!opacity-100")}>
                  <Bot className="h-4 w-4" /><span className="hidden sm:inline">GEO Analysis</span><span className="sm:hidden">GEO</span>
                </TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="seo" className="mt-0"><SEOTabEnhanced data={DEMO_TAB_DATA} hideScoreDeductions /></TabsContent>
                <TabsContent value="aeo" className="mt-0"><AEOTab data={DEMO_TAB_DATA} hideScoreDeductions /></TabsContent>
                <TabsContent value="geo" className="mt-0"><GEOTab data={DEMO_TAB_DATA} hideScoreDeductions /></TabsContent>
              </div>
            </Tabs>

          </div>

          {/* What's Next */}
          <WhatsNextCard steps={[
            { ...NEXT_STEPS.keywordArena('You know your site-wide issues — now see how you rank against competitors'), href: '/demo/ai-test' },
            { ...NEXT_STEPS.competitorDuel(), href: '/demo/battle-mode' },
          ]} />
        </div>
      </main>
    </DemoShell>
  )
}
