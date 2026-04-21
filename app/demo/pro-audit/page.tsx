'use client'

import { useState } from 'react'
import { Zap, Search, Sparkles, Bot, Copy, Filter } from 'lucide-react'
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
import { FixInstructionCard } from '@/components/dashboard/fix-instruction-card'
import { LinkBuildingIntelligence } from '@/components/dashboard/link-building-intelligence'
import { WhatsNextCard, NEXT_STEPS } from '@/components/dashboard/whats-next-card'
import { ExpertAnalysis } from '@/components/dashboard/expert-analysis'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ─── Hardcoded Demo Data ───────────────────────────────────────────────────────

const DEMO_URL = 'www.sunrise-bakery.com'

const DEMO_SCORES = { seo: 52, aeo: 38, geo: 27 }

const DEMO_SITE_TYPE = { primaryType: 'local-business', secondaryTypes: ['food-beverage'], confidence: 92 }

const DEMO_PLATFORM = { platform: 'wordpress', label: 'WordPress', confidence: 'high' as const }

const DEMO_CWV = {
  performanceScore: 42,
  lcp: { value: 3200, category: 'AVERAGE', displayValue: '3.2s', score: 0.4 },
  inp: { value: 180, category: 'FAST', displayValue: '180ms', score: 0.9 },
  cls: { value: 0.15, category: 'AVERAGE', displayValue: '0.15', score: 0.5 },
  overallCategory: 'AVERAGE',
}

const DEMO_STRUCTURAL_DATA = {
  wordCount: 487,
  links: { internal: 3, external: 0 },
  media: { totalImages: 6, imagesWithAlt: 2 },
  semanticTags: { article: 0, main: 1, nav: 1, aside: 0, headers: 2, h1Count: 0 },
}

const DEMO_TECHNICAL = { isHttps: true, responseTimeMs: 890, status: 200 }

const DEMO_PAGE_DATA = {
  title: 'Sunrise Bakery - Fresh Baked Goods Daily',
  description: 'Sunrise Bakery offers fresh bread, pastries, and custom cakes in downtown Portland. Visit us for artisan baked goods made with local ingredients.',
  schemas: [] as string[],
}

const DEMO_EXPERT_ANALYSIS = {
  bottomLine: 'This site needs significant work across all three scoring dimensions. The local business fundamentals are missing — no schema markup, thin content, and zero external link signals make it nearly invisible to both traditional search and AI engines.',
  keyInsight: 'Missing schema markup is the biggest gap — without LocalBusiness structured data, search engines and AI assistants cannot properly categorize or recommend this bakery to local searchers.',
  priorityAction: 'Add LocalBusiness schema and expand content to 800+ words',
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

const DEMO_ENHANCED_PENALTIES: Array<{
  category: 'SEO' | 'AEO' | 'GEO'
  component: string
  penalty: string
  explanation: string
  fix: string
  pointsDeducted: number
  severity: 'critical' | 'warning' | 'info'
}> = [
  { category: 'SEO', component: 'H1 Tag', penalty: 'Missing H1', explanation: 'No H1 heading found on the page. Search engines use H1 to understand page topic.', fix: 'Add a single, descriptive H1 tag containing your primary keyword.', pointsDeducted: -8, severity: 'critical' },
  { category: 'SEO', component: 'Schema Markup', penalty: 'No Schema Found', explanation: 'No structured data detected. LocalBusiness schema is essential for local businesses.', fix: 'Add LocalBusiness JSON-LD schema with name, address, hours, and contact info.', pointsDeducted: -12, severity: 'critical' },
  { category: 'SEO', component: 'Content Depth', penalty: 'Thin Content', explanation: 'Only 487 words detected. Pages with under 600 words rank significantly lower.', fix: 'Expand content to 800+ words with service descriptions, FAQs, and local context.', pointsDeducted: -6, severity: 'warning' },
  { category: 'AEO', component: 'FAQ Content', penalty: 'No FAQ Section', explanation: 'No FAQ or Q&A content found. AI assistants heavily favor pages with clear question-answer pairs.', fix: 'Add an FAQ section with 5-8 common questions about your bakery and products.', pointsDeducted: -10, severity: 'critical' },
  { category: 'AEO', component: 'Answer Clarity', penalty: 'Low Snippet Eligibility', explanation: 'Content lacks concise, direct answers that AI can extract for featured snippets.', fix: 'Structure content with clear definitions and direct answers in the first paragraph.', pointsDeducted: -5, severity: 'warning' },
  { category: 'GEO', component: 'Citation Signals', penalty: 'Weak Citation Profile', explanation: 'Only 3 backlinks from 2 domains. AI engines use citation signals to assess authority.', fix: 'Build citations on local directories, food blogs, and community sites.', pointsDeducted: -8, severity: 'critical' },
  { category: 'GEO', component: 'Brand Mentions', penalty: 'Low Brand Visibility', explanation: 'Minimal brand presence across the web reduces AI engine confidence in recommending this business.', fix: 'Create profiles on Google Business, Yelp, TripAdvisor, and local food directories.', pointsDeducted: -6, severity: 'warning' },
  { category: 'SEO', component: 'Alt Text', penalty: 'Missing Alt Text', explanation: 'Only 2 of 6 images have alt text. This hurts accessibility and image SEO.', fix: 'Add descriptive alt text to all images describing the baked goods shown.', pointsDeducted: -4, severity: 'warning' },
  { category: 'AEO', component: 'Structured Answers', penalty: 'No How-To Content', explanation: 'No how-to or instructional content found. This content type is highly favored by AI assistants.', fix: 'Add recipe snippets or "how to order" guides with step-by-step instructions.', pointsDeducted: -3, severity: 'info' },
]

const DEMO_RECOMMENDATIONS: Array<{
  title: string
  domain: 'seo' | 'aeo' | 'geo'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  steps: Array<{ step: number; title: string; description: string; code?: string }>
  code?: string
  platform: string
  estimatedTime: string
  difficulty: 'easy' | 'moderate' | 'difficult'
  impact: 'high' | 'medium' | 'low'
  whyItMatters: string
}> = [
  {
    title: 'Add LocalBusiness Schema Markup',
    domain: 'seo',
    priority: 'CRITICAL',
    platform: 'WordPress',
    estimatedTime: '30min',
    difficulty: 'easy',
    impact: 'high',
    whyItMatters: 'Without LocalBusiness schema, search engines and AI assistants cannot properly identify your business type, location, hours, or services. This is the single highest-impact fix for local businesses.',
    steps: [
      { step: 1, title: 'Install Schema Plugin', description: 'Install and activate the "Rank Math" or "Yoast SEO" plugin from the WordPress plugin directory.' },
      { step: 2, title: 'Configure Local Business', description: 'Navigate to the schema settings and select "LocalBusiness" > "Bakery" as your business type.' },
      { step: 3, title: 'Add Business Details', description: 'Fill in your business name, address, phone, hours, and price range. Add your logo and a photo.' },
    ],
    code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Bakery",
  "name": "Sunrise Bakery",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Portland",
    "addressRegion": "OR"
  },
  "openingHours": "Mo-Sa 06:00-18:00",
  "telephone": "+1-503-555-0123"
}</script>`,
  },
  {
    title: 'Add H1 Heading with Primary Keyword',
    domain: 'seo',
    priority: 'CRITICAL',
    platform: 'WordPress',
    estimatedTime: '10min',
    difficulty: 'easy',
    impact: 'high',
    whyItMatters: 'The H1 tag is the most important on-page SEO signal. Without it, search engines struggle to determine the primary topic of your page.',
    steps: [
      { step: 1, title: 'Edit Page in WordPress', description: 'Open your homepage in the WordPress editor (Pages > Home > Edit).' },
      { step: 2, title: 'Add H1 Block', description: 'Add a Heading block at the top of the content area and set it to H1.' },
      { step: 3, title: 'Write Keyword-Rich H1', description: 'Write a descriptive H1 like "Artisan Bakery in Portland — Fresh Bread, Pastries & Custom Cakes".' },
    ],
  },
  {
    title: 'Create FAQ Section for AI Visibility',
    domain: 'aeo',
    priority: 'CRITICAL',
    platform: 'WordPress',
    estimatedTime: '1h',
    difficulty: 'moderate',
    impact: 'high',
    whyItMatters: 'AI assistants like ChatGPT and Google SGE extract answers from FAQ sections. Without one, your bakery is invisible to conversational AI queries like "best bakery near me".',
    steps: [
      { step: 1, title: 'Research Common Questions', description: 'Check Google "People Also Ask" for queries like "best bakery Portland", "custom cake ordering", "gluten-free bakery".' },
      { step: 2, title: 'Write 5-8 Q&A Pairs', description: 'Write clear, concise answers (2-3 sentences each) for the most common questions about your bakery.' },
      { step: 3, title: 'Add FAQPage Schema', description: 'Wrap your FAQ section in FAQPage structured data so search engines can display it as rich results.' },
    ],
    code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Do you offer gluten-free options?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes! We offer a daily selection of gluten-free breads, muffins, and cookies."
    }
  }]
}</script>`,
  },
  {
    title: 'Expand Page Content to 800+ Words',
    domain: 'seo',
    priority: 'HIGH',
    platform: 'WordPress',
    estimatedTime: '2h',
    difficulty: 'moderate',
    impact: 'medium',
    whyItMatters: 'At 487 words, your page is considered thin content. Pages ranking in the top 10 for local business queries average 800-1200 words. More content gives search engines and AI more to work with.',
    steps: [
      { step: 1, title: 'Add Service Descriptions', description: 'Write 150-200 words describing each service: custom cakes, daily bread, catering, wholesale.' },
      { step: 2, title: 'Add Local Context', description: 'Mention your neighborhood, nearby landmarks, and community involvement to boost local relevance.' },
      { step: 3, title: 'Include Testimonials', description: 'Add 3-5 customer testimonials with names and specific products mentioned.' },
    ],
  },
  {
    title: 'Fix Missing Image Alt Text',
    domain: 'seo',
    priority: 'HIGH',
    platform: 'WordPress',
    estimatedTime: '20min',
    difficulty: 'easy',
    impact: 'medium',
    whyItMatters: 'Only 2 of 6 images have alt text. Alt text helps search engines understand your images and improves accessibility. Image search drives significant traffic for bakeries.',
    steps: [
      { step: 1, title: 'Open Media Library', description: 'Go to Media > Library in WordPress and switch to list view.' },
      { step: 2, title: 'Add Descriptive Alt Text', description: 'Click each image and add alt text describing what is shown, e.g., "Fresh sourdough bread loaves on wooden shelf at Sunrise Bakery".' },
    ],
  },
  {
    title: 'Build Local Citation Profile',
    domain: 'geo',
    priority: 'HIGH',
    platform: 'Any',
    estimatedTime: '3h',
    difficulty: 'moderate',
    impact: 'medium',
    whyItMatters: 'With only 3 backlinks from 2 domains, AI engines have very little signal to assess your authority. Local citations from directories and review sites dramatically improve AI visibility.',
    steps: [
      { step: 1, title: 'Claim Google Business Profile', description: 'Create or claim your Google Business Profile with complete info, photos, and regular posts.' },
      { step: 2, title: 'Submit to Local Directories', description: 'Add your bakery to Yelp, TripAdvisor, Foursquare, and local Portland food directories.' },
      { step: 3, title: 'Reach Out to Food Bloggers', description: 'Contact 5-10 Portland food bloggers and invite them for a tasting in exchange for a review.' },
    ],
  },
  {
    title: 'Improve Core Web Vitals Performance',
    domain: 'seo',
    priority: 'MEDIUM',
    platform: 'WordPress',
    estimatedTime: '2h',
    difficulty: 'moderate',
    impact: 'low',
    whyItMatters: 'Your performance score is 42/100 with LCP at 3.2s. Google uses Core Web Vitals as a ranking signal. Faster sites also convert better — especially on mobile.',
    steps: [
      { step: 1, title: 'Install Caching Plugin', description: 'Install WP Rocket or LiteSpeed Cache to enable page caching and minification.' },
      { step: 2, title: 'Optimize Images', description: 'Install ShortPixel or Imagify to compress and convert images to WebP format.' },
      { step: 3, title: 'Defer Non-Critical JS', description: 'Use the caching plugin\'s "Delay JavaScript" feature to defer non-essential scripts.' },
    ],
  },
  {
    title: 'Add How-To Content for AI Assistants',
    domain: 'aeo',
    priority: 'MEDIUM',
    platform: 'WordPress',
    estimatedTime: '1h',
    difficulty: 'easy',
    impact: 'low',
    whyItMatters: 'How-to content is one of the most commonly cited content types by AI assistants. Adding ordering guides or simple recipes positions your bakery as a helpful resource.',
    steps: [
      { step: 1, title: 'Create How-To Page', description: 'Add a new page or section titled "How to Order a Custom Cake" with step-by-step instructions.' },
      { step: 2, title: 'Add HowTo Schema', description: 'Wrap the content in HowTo structured data for rich result eligibility.' },
    ],
    code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Order a Custom Cake",
  "step": [{
    "@type": "HowToStep",
    "name": "Choose Your Flavor",
    "text": "Browse our menu and select from 12 cake flavors."
  }]
}</script>`,
  },
]

const DEMO_GRADER_BREAKDOWN = {
  seo: [
    { name: 'Technical Foundation', score: 14, maxScore: 20, percentage: 70, components: [
      { score: 5, maxScore: 5, status: 'good' as const, feedback: 'HTTPS is enabled and working correctly.' },
      { score: 3, maxScore: 5, status: 'warning' as const, feedback: 'Response time of 890ms is acceptable but could be faster.', issues: ['Response time above 500ms target'] },
      { score: 3, maxScore: 5, status: 'warning' as const, feedback: 'Only 2 of 6 images have alt text.', issues: ['4 images missing alt text'] },
      { score: 3, maxScore: 5, status: 'warning' as const, feedback: 'Title tag present at 42 characters.', issues: ['Consider expanding to 50-60 characters'] },
    ]},
    { name: 'Content Quality', score: 8, maxScore: 20, percentage: 40, components: [
      { score: 0, maxScore: 5, status: 'critical' as const, feedback: 'No H1 heading found on the page.', issues: ['Missing H1 tag'] },
      { score: 3, maxScore: 5, status: 'warning' as const, feedback: 'Word count of 487 is below the 800-word threshold for competitive ranking.', issues: ['Thin content — expand to 800+ words'] },
      { score: 3, maxScore: 5, status: 'warning' as const, feedback: 'Internal linking is minimal with only 3 links.', issues: ['Add more internal links to key pages'] },
      { score: 2, maxScore: 5, status: 'warning' as const, feedback: 'No external links found. Linking to authoritative sources builds trust.', issues: ['Add 2-3 relevant external links'] },
    ]},
    { name: 'Schema & Structured Data', score: 2, maxScore: 20, percentage: 10, components: [
      { score: 0, maxScore: 10, status: 'critical' as const, feedback: 'No schema markup detected. LocalBusiness schema is essential.', issues: ['No JSON-LD or microdata found'] },
      { score: 2, maxScore: 10, status: 'critical' as const, feedback: 'Meta description present but no Open Graph or Twitter Card tags.', issues: ['Missing OG tags', 'Missing Twitter Card'] },
    ]},
  ],
  aeo: [
    { name: 'Answer Readiness', score: 6, maxScore: 25, percentage: 24, components: [
      { score: 0, maxScore: 10, status: 'critical' as const, feedback: 'No FAQ or Q&A content found on the page.', issues: ['Add FAQ section with common questions'] },
      { score: 3, maxScore: 8, status: 'warning' as const, feedback: 'Content lacks concise, extractable answers for AI snippets.', issues: ['Structure content with direct answers'] },
      { score: 3, maxScore: 7, status: 'warning' as const, feedback: 'No how-to or instructional content detected.', issues: ['Add step-by-step guides'] },
    ]},
    { name: 'Content Structure', score: 10, maxScore: 25, percentage: 40, components: [
      { score: 4, maxScore: 8, status: 'warning' as const, feedback: 'Basic heading structure present but not optimized for AI extraction.' },
      { score: 3, maxScore: 8, status: 'warning' as const, feedback: 'Content is not organized in a question-answer format.' },
      { score: 3, maxScore: 9, status: 'warning' as const, feedback: 'Lists and tables are minimal — AI assistants prefer structured content.' },
    ]},
  ],
  geo: [
    { name: 'Authority Signals', score: 5, maxScore: 25, percentage: 20, components: [
      { score: 2, maxScore: 10, status: 'critical' as const, feedback: 'Domain authority of 12 is very low. Need more quality backlinks.', issues: ['DA 12 — target 30+ for competitive local ranking'] },
      { score: 3, maxScore: 15, status: 'critical' as const, feedback: 'Only 3 backlinks from 2 domains. AI engines need more citation signals.', issues: ['Build citations on 10+ local directories'] },
    ]},
    { name: 'Brand & Reputation', score: 8, maxScore: 25, percentage: 32, components: [
      { score: 4, maxScore: 12, status: 'warning' as const, feedback: 'Minimal brand presence across the web.', issues: ['Create profiles on major review platforms'] },
      { score: 4, maxScore: 13, status: 'warning' as const, feedback: 'No clear expertise signals or author attribution.', issues: ['Add author bios and credentials'] },
    ]},
  ],
}

const DEMO_TAB_DATA = {
  technical: DEMO_TECHNICAL,
  structuralData: DEMO_STRUCTURAL_DATA,
  ai: {
    scores: DEMO_SCORES,
    enhancedPenalties: DEMO_ENHANCED_PENALTIES,
    seoAnalysis: {
      onPageIssues: ['Missing H1 tag', 'Thin content (487 words)', '4 images missing alt text', 'No external links'],
      keywordOpportunities: ['portland bakery', 'artisan bread portland', 'custom cakes portland', 'gluten-free bakery'],
      contentQuality: 'fair' as const,
      metaAnalysis: 'Title tag is 42 characters — acceptable but could be more descriptive. Meta description at 128 characters is good.',
    },
    aeoAnalysis: {
      questionsAnswered: { who: 1, what: 1, where: 1, why: 0, how: 0 },
      missingSchemas: ['FAQPage', 'HowTo', 'LocalBusiness'],
      snippetEligibilityScore: 15,
      topOpportunities: ['Add FAQ section', 'Create how-to content', 'Structure answers for AI extraction'],
    },
    geoAnalysis: {
      sentimentScore: 0.6,
      brandPerception: 'neutral' as const,
      citationLikelihood: 18,
      llmContextClarity: 22,
      visibilityGaps: ['Low domain authority', 'Few backlinks', 'No brand mentions in AI training data'],
    },
  },
}

// ─── Demo Page Component ───────────────────────────────────────────────────────

export default function DemoProAuditPage() {
  const [activeTab, setActiveTab] = useState('seo')
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL')

  const recs = DEMO_RECOMMENDATIONS
  const normPriority = (r: typeof recs[number]) => r.priority
  const normDomain = (r: typeof recs[number]) => r.domain

  const criticalCount = recs.filter(r => normPriority(r) === 'CRITICAL').length
  const highCount = recs.filter(r => normPriority(r) === 'HIGH').length
  const mediumCount = recs.filter(r => normPriority(r) === 'MEDIUM').length
  const filtered = priorityFilter === 'ALL' ? recs : recs.filter(r => normPriority(r) === priorityFilter)

  // Key metrics strip data
  const hasSchema = false
  const hasH1 = false
  const isHttps = true
  const hasMeta = true
  const responseTime = 890
  const imgTotal = 6
  const imgWithAlt = 2
  const altPct = Math.round((imgWithAlt / imgTotal) * 100)
  const wordCount = 487

  const metrics = [
    { label: 'Schema', value: 'None', color: 'text-red-500', bad: true, knowledgeId: 'schema-markup' },
    { label: 'Metadata', value: 'Complete', color: 'text-green-500', bad: false, knowledgeId: 'metadata' },
    { label: 'H1 Tag', value: 'Missing', color: 'text-red-500', bad: true, knowledgeId: 'h1-tag' },
    { label: 'HTTPS', value: 'Secure', color: 'text-green-500', bad: false, knowledgeId: 'https' },
    { label: 'Response', value: '890ms', color: 'text-yellow-500', bad: false, knowledgeId: 'response-time' },
    { label: 'Alt Text', value: `${altPct}%`, color: 'text-red-500', bad: true, knowledgeId: 'alt-text' },
    { label: 'Words', value: '487', color: 'text-yellow-500', bad: false, knowledgeId: 'word-count' },
    { label: 'Int. Links', value: '3', color: 'text-green-500', bad: false, knowledgeId: 'internal-linking' },
    { label: 'Ext. Links', value: '0', color: 'text-foreground', bad: false, knowledgeId: 'external-links' },
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

          <AuditPageHeader
            title="Pro Audit"
            description="AI-powered scoring with site-type-specific analysis for 95% accuracy."
            currentUrl={DEMO_URL}
            hasResults={true}
            isAnalyzing={false}
            onNewAudit={() => {}}
            onRefreshAnalysis={() => {}}
            analysisData={{}}
            pageCount={1}
            siteType={{ primaryType: DEMO_SITE_TYPE.primaryType, confidence: DEMO_SITE_TYPE.confidence }}
            platformDetection={DEMO_PLATFORM}
            onSiteTypeConfirm={() => {}}
            onSiteTypeChange={() => {}}
            onPlatformChange={() => {}}
          />

          {/* Results Display */}
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-1">
                  <CircularProgress value={DEMO_SCORES.seo} variant="seo" label="SEO Score" size={140} strokeWidth={10} />
                  <LearnMore term="seo-score" />
                </div>
              </Card>
              <Card className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-1">
                  <CircularProgress value={DEMO_SCORES.aeo} variant="aeo" label="AEO Score" size={140} strokeWidth={10} />
                  <LearnMore term="aeo-score" />
                </div>
              </Card>
              <Card className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-1">
                  <CircularProgress value={DEMO_SCORES.geo} variant="geo" label="GEO Score" size={140} strokeWidth={10} />
                  <LearnMore term="geo-score" />
                </div>
              </Card>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
              {metrics.map(m => (
                <div key={m.label} className={`rounded-lg border px-2.5 py-2 ${m.bad ? 'border-red-500/40 bg-red-500/5' : 'border-border/50 bg-card/50'}`}>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold leading-tight truncate">{m.label}</p>
                    <LearnMore term={m.knowledgeId} className="h-3 w-3 text-[7px]" />
                  </div>
                  <p className={`text-sm font-black ${m.color} truncate`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* ═══ EXPERT ANALYSIS ═══ */}
            <ExpertAnalysis analysis={DEMO_EXPERT_ANALYSIS} />

            {/* ═══ ROADMAP TO 100 ═══ */}
            <Card className="border-[#00e5ff]/30 bg-gradient-to-br from-[#00e5ff]/5 to-[#BC13FE]/5">
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Zap className="h-5 w-5 text-[#00e5ff]" />
                  <CardTitle>Roadmap to 100 - Prioritized Site Improvements</CardTitle>
                  <button onClick={() => {
                    const text = recs.map((r, i) => `${i + 1}. [${r.priority}] [${r.domain.toUpperCase()}] ${r.title}\n   ${r.whyItMatters}`).join('\n\n')
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
                  {filtered.map((rec, i) => (
                    <FixInstructionCard
                      key={i}
                      title={rec.title}
                      domain={normDomain(rec)}
                      priority={normPriority(rec)}
                      steps={rec.steps}
                      code={rec.code}
                      platform={rec.platform}
                      estimatedTime={rec.estimatedTime}
                      difficulty={rec.difficulty}
                      impact={rec.impact}
                      whyItMatters={rec.whyItMatters}
                    />
                  ))}
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

            {/* Link Building Intelligence */}
            <LinkBuildingIntelligence metrics={DEMO_BACKLINK_DATA.metrics} backlinks={DEMO_BACKLINK_DATA.backlinks} />

            {/* Core Web Vitals */}
            <Card className="border-[#BC13FE]/20 bg-[#BC13FE]/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5 text-[#BC13FE]" /> Core Web Vitals
                  <LearnMore term="core-web-vitals" />
                  <span className="ml-auto text-sm font-black text-[#BC13FE]">{DEMO_CWV.performanceScore}/100</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { data: DEMO_CWV.lcp, label: 'LCP' },
                    { data: DEMO_CWV.inp, label: 'INP' },
                    { data: DEMO_CWV.cls, label: 'CLS' },
                  ].map(({ data: d, label }) => (
                    <div key={label} className={`rounded-lg border p-4 text-center ${d.category === 'FAST' ? 'border-green-500/30 bg-green-500/5' : d.category === 'SLOW' ? 'border-red-500/30 bg-red-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">{label}<LearnMore term="core-web-vitals" /></p>
                      <p className={`text-2xl font-black ${d.category === 'FAST' ? 'text-green-600' : d.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'}`}>{d.displayValue}</p>
                      <p className={`text-[10px] font-bold uppercase mt-1 ${d.category === 'FAST' ? 'text-green-600' : d.category === 'SLOW' ? 'text-red-600' : 'text-yellow-600'}`}>{d.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What's Next */}
          <WhatsNextCard steps={[
            { ...NEXT_STEPS.deepScan(DEMO_URL), href: '/demo/deep-scan' },
            { ...NEXT_STEPS.keywordArena(`Your SEO score is ${DEMO_SCORES.seo} — see how that compares against competitors`), href: '/demo/ai-test' },
            { ...NEXT_STEPS.competitorDuel(), href: '/demo/battle-mode' },
          ]} />
        </div>
      </main>
    </DemoShell>
  )
}
