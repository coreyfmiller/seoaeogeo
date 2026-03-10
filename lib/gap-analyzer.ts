import type { MultiPageScanResult } from './multi-page-crawler';
import type { SiteType } from './types/audit';

/**
 * Gap Analyzer
 * Compares analyzed site against competitors to identify strategic opportunities
 */

export interface GapAnalysis {
  gaps: CompetitorGap[];
  advantageScore: number; // 0-100
  strengths: Strength[];
  quickWins: CompetitorGap[];
  competitorCount: number;
}

export interface CompetitorGap {
  type: 'schema' | 'content' | 'structural' | 'keyword';
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  examples: string[];
  recommendation: string;
  estimatedTrafficGain?: string;
}

export interface Strength {
  category: string;
  description: string;
  advantage: string;
  maintainStrategy: string;
}

/**
 * Analyze gaps between target site and competitors
 */
export async function analyzeCompetitorGaps(
  targetSite: MultiPageScanResult,
  competitors: MultiPageScanResult[],
  siteType?: SiteType
): Promise<GapAnalysis> {
  const gaps: CompetitorGap[] = [];
  
  // 1. Schema Gap Analysis
  const schemaGaps = identifySchemaGaps(targetSite, competitors, siteType);
  gaps.push(...schemaGaps);
  
  // 2. Content Gap Analysis
  const contentGaps = identifyContentGaps(targetSite, competitors);
  gaps.push(...contentGaps);
  
  // 3. Structural Gap Analysis
  const structuralGaps = identifyStructuralGaps(targetSite, competitors);
  gaps.push(...structuralGaps);
  
  // 4. Calculate Competitive Advantage Score
  const advantageScore = calculateAdvantageScore(targetSite, competitors, gaps);
  
  // 5. Identify Strengths (bidirectional comparison)
  const strengths = identifyStrengths(targetSite, competitors);
  
  // 6. Identify Quick Wins (high impact, common among competitors)
  const quickWins = gaps.filter(g => 
    g.impact === 'high' && 
    g.examples.length >= competitors.length * 0.5 // 50%+ of competitors have it
  );
  
  return {
    gaps,
    advantageScore,
    strengths,
    quickWins,
    competitorCount: competitors.length
  };
}

/**
 * Identify schema types present on competitors but missing from target
 */
export function identifySchemaGaps(
  targetSite: MultiPageScanResult,
  competitors: MultiPageScanResult[],
  siteType?: SiteType
): CompetitorGap[] {
  const gaps: CompetitorGap[] = [];
  
  // Get all schema types from target
  const targetSchemas = new Set(
    targetSite.pages.flatMap(p => p.schemaTypes)
  );
  
  // Track which competitors have which schemas
  const competitorSchemas = new Map<string, string[]>();
  
  competitors.forEach(comp => {
    const compSchemas = new Set(
      comp.pages.flatMap(p => p.schemaTypes)
    );
    
    compSchemas.forEach(schemaType => {
      if (!competitorSchemas.has(schemaType)) {
        competitorSchemas.set(schemaType, []);
      }
      competitorSchemas.get(schemaType)!.push(comp.domain);
    });
  });
  
  // Identify gaps
  competitorSchemas.forEach((domains, schemaType) => {
    if (!targetSchemas.has(schemaType)) {
      const impact = calculateSchemaImpact(schemaType, siteType);
      const competitorCount = domains.length;
      const percentage = Math.round((competitorCount / competitors.length) * 100);
      
      gaps.push({
        type: 'schema',
        category: schemaType,
        description: `${percentage}% of competitors (${competitorCount}/${competitors.length}) have ${schemaType} schema, you don't`,
        impact,
        examples: domains.slice(0, 3), // Show up to 3 examples
        recommendation: `Add ${schemaType} schema to relevant pages to match competitor rich results`,
        estimatedTrafficGain: impact === 'high' ? '10-20%' : impact === 'medium' ? '5-10%' : '2-5%'
      });
    }
  });
  
  return gaps.sort((a, b) => {
    // Sort by impact then by competitor count
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
    if (impactDiff !== 0) return impactDiff;
    return b.examples.length - a.examples.length;
  });
}

/**
 * Calculate impact of missing schema type based on site type
 */
export function calculateSchemaImpact(schemaType: string, siteType?: SiteType): 'high' | 'medium' | 'low' {
  // High impact schemas (enable rich results)
  const highImpact = ['Review', 'AggregateRating', 'Product', 'FAQPage', 'HowTo', 'Recipe', 'Event'];
  
  // Medium impact schemas (improve understanding)
  const mediumImpact = ['BreadcrumbList', 'Organization', 'Article', 'LocalBusiness', 'VideoObject'];
  
  // Site-type-specific adjustments
  if (siteType) {
    if (siteType === 'local-business' || siteType === 'restaurant' || siteType === 'contractor') {
      if (schemaType === 'Review' || schemaType === 'AggregateRating') return 'high';
      if (schemaType === 'LocalBusiness') return 'high';
    }
    
    if (siteType === 'e-commerce') {
      if (schemaType === 'Product' || schemaType === 'Review') return 'high';
      if (schemaType === 'BreadcrumbList') return 'medium';
    }
    
    if (siteType === 'blog' || siteType === 'news-media') {
      if (schemaType === 'Article' || schemaType === 'BlogPosting') return 'high';
      if (schemaType === 'FAQPage') return 'medium';
    }
    
    if (siteType === 'saas') {
      if (schemaType === 'FAQPage' || schemaType === 'HowTo') return 'high';
      if (schemaType === 'SoftwareApplication') return 'medium';
    }
  }
  
  if (highImpact.includes(schemaType)) return 'high';
  if (mediumImpact.includes(schemaType)) return 'medium';
  return 'low';
}

/**
 * Identify content gaps (topics, questions, depth)
 */
export function identifyContentGaps(
  targetSite: MultiPageScanResult,
  competitors: MultiPageScanResult[]
): CompetitorGap[] {
  const gaps: CompetitorGap[] = [];
  
  // Average word count comparison
  const targetAvgWords = targetSite.pages.length > 0 
    ? targetSite.pages.reduce((sum, p) => sum + p.wordCount, 0) / targetSite.pages.length 
    : 0;
  const competitorAvgWords = competitors.map(c => 
    c.pages.length > 0 ? c.pages.reduce((sum, p) => sum + p.wordCount, 0) / c.pages.length : 0
  );
  const avgCompetitorWords = competitors.length > 0 
    ? competitorAvgWords.reduce((sum, w) => sum + w, 0) / competitors.length 
    : 0;
  
  if (targetAvgWords < avgCompetitorWords * 0.7 && avgCompetitorWords > 0) {
    gaps.push({
      type: 'content',
      category: 'Content Depth',
      description: `Your average page has ${Math.round(targetAvgWords)} words, competitors average ${Math.round(avgCompetitorWords)} words`,
      impact: 'high',
      examples: competitors.map(c => c.domain),
      recommendation: 'Expand content depth on key pages to match or exceed competitor standards',
      estimatedTrafficGain: '15-25%'
    });
  }
  
  // FAQ/Question content comparison
  const targetFAQPages = targetSite.pages.filter(p => /faq|question/i.test(p.url)).length;
  const competitorFAQPages = competitors.map(c => 
    c.pages.filter(p => /faq|question/i.test(p.url)).length
  );
  const avgCompetitorFAQ = competitors.length > 0 
    ? competitorFAQPages.reduce((sum, n) => sum + n, 0) / competitors.length 
    : 0;
  
  if (targetFAQPages === 0 && avgCompetitorFAQ > 0) {
    gaps.push({
      type: 'content',
      category: 'FAQ Content',
      description: `${competitors.filter((_, i) => competitorFAQPages[i] > 0).length} competitors have FAQ pages, you don't`,
      impact: 'medium',
      examples: competitors.filter((_, i) => competitorFAQPages[i] > 0).map(c => c.domain),
      recommendation: 'Create an FAQ page answering common customer questions',
      estimatedTrafficGain: '5-10%'
    });
  }
  
  return gaps;
}

/**
 * Identify structural gaps (page types, features)
 */
export function identifyStructuralGaps(
  targetSite: MultiPageScanResult,
  competitors: MultiPageScanResult[]
): CompetitorGap[] {
  const gaps: CompetitorGap[] = [];
  
  // Detect common features across competitors
  const features = [
    { name: 'Blog', pattern: /blog|article|news/i, impact: 'medium' as const },
    { name: 'Case Studies', pattern: /case-stud|portfolio|work/i, impact: 'medium' as const },
    { name: 'Testimonials', pattern: /testimonial|review|feedback/i, impact: 'high' as const },
    { name: 'Resource Library', pattern: /resource|guide|download/i, impact: 'medium' as const },
    { name: 'About Page', pattern: /about|team|company/i, impact: 'low' as const },
    { name: 'Contact Page', pattern: /contact|get-in-touch/i, impact: 'low' as const }
  ];
  
  features.forEach(feature => {
    const targetHas = targetSite.pages.some(p => feature.pattern.test(p.url));
    const competitorsWithFeature = competitors.filter(c => 
      c.pages.some(p => feature.pattern.test(p.url))
    );
    
    if (!targetHas && competitorsWithFeature.length >= competitors.length * 0.5) {
      gaps.push({
        type: 'structural',
        category: feature.name,
        description: `${competitorsWithFeature.length}/${competitors.length} competitors have ${feature.name}, you don't`,
        impact: feature.impact,
        examples: competitorsWithFeature.map(c => c.domain),
        recommendation: `Add ${feature.name} to your site to match competitor offerings`,
        estimatedTrafficGain: feature.impact === 'high' ? '10-15%' : '5-10%'
      });
    }
  });
  
  return gaps;
}

/**
 * Calculate competitive advantage score (0-100)
 */
export function calculateAdvantageScore(
  targetSite: MultiPageScanResult,
  competitors: MultiPageScanResult[],
  gaps: CompetitorGap[]
): number {
  let score = 50; // Start at neutral
  
  // Deduct points for gaps
  gaps.forEach(gap => {
    if (gap.impact === 'high') score -= 10;
    else if (gap.impact === 'medium') score -= 5;
    else score -= 2;
  });
  
  // Add points for advantages
  const targetSchemaCount = new Set(targetSite.pages.flatMap(p => p.schemaTypes)).size;
  const avgCompetitorSchemaCount = competitors.reduce((sum, c) => 
    sum + new Set(c.pages.flatMap(p => p.schemaTypes)).size, 0
  ) / competitors.length;
  
  if (targetSchemaCount > avgCompetitorSchemaCount) {
    score += 10;
  }
  
  // Page count advantage
  const avgCompetitorPages = competitors.length > 0 
    ? competitors.reduce((sum, c) => sum + c.pagesCrawled, 0) / competitors.length 
    : 0;
  if (targetSite.pagesCrawled > avgCompetitorPages) {
    score += 5;
  }
  
  // Content depth advantage
  const targetAvgWords = targetSite.pages.length > 0 
    ? targetSite.pages.reduce((sum, p) => sum + p.wordCount, 0) / targetSite.pages.length 
    : 0;
  const avgCompetitorWords = competitors.length > 0 
    ? competitors.reduce((sum, c) => 
        c.pages.length > 0 ? c.pages.reduce((s, p) => s + p.wordCount, 0) / c.pages.length : 0, 0
      ) / competitors.length 
    : 0;
  
  if (targetAvgWords > avgCompetitorWords * 1.2 && avgCompetitorWords > 0) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Identify areas where target site outperforms competitors
 */
export function identifyStrengths(
  targetSite: MultiPageScanResult,
  competitors: MultiPageScanResult[]
): Strength[] {
  const strengths: Strength[] = [];
  
  // Schema diversity strength
  const targetSchemaTypes = new Set(targetSite.pages.flatMap(p => p.schemaTypes));
  const avgCompetitorSchemaTypes = competitors.length > 0 
    ? competitors.reduce((sum, c) => 
        sum + new Set(c.pages.flatMap(p => p.schemaTypes)).size, 0
      ) / competitors.length 
    : 0;
  
  if (targetSchemaTypes.size > avgCompetitorSchemaTypes * 1.2 && avgCompetitorSchemaTypes > 0) {
    strengths.push({
      category: 'Schema Diversity',
      description: `You have ${targetSchemaTypes.size} schema types, competitors average ${Math.round(avgCompetitorSchemaTypes)}`,
      advantage: 'Better structured data coverage enables more rich result opportunities',
      maintainStrategy: 'Continue implementing comprehensive schema markup across all page types'
    });
  }
  
  // Content depth strength
  const targetAvgWords = targetSite.pages.length > 0 
    ? targetSite.pages.reduce((sum, p) => sum + p.wordCount, 0) / targetSite.pages.length 
    : 0;
  const avgCompetitorWords = competitors.length > 0 
    ? competitors.reduce((sum, c) => 
        c.pages.length > 0 ? c.pages.reduce((s, p) => s + p.wordCount, 0) / c.pages.length : 0, 0
      ) / competitors.length 
    : 0;
  
  if (targetAvgWords > avgCompetitorWords * 1.2) {
    strengths.push({
      category: 'Content Depth',
      description: `Your pages average ${Math.round(targetAvgWords)} words, competitors average ${Math.round(avgCompetitorWords)}`,
      advantage: 'More comprehensive content signals expertise and authority',
      maintainStrategy: 'Maintain high content quality standards and continue providing in-depth information'
    });
  }
  
  // Image optimization strength
  const targetAltCoverage = targetSite.pages.reduce((sum, p) => 
    p.imgTotal > 0 ? sum + (p.imgWithAlt / p.imgTotal) : sum, 0
  ) / targetSite.pages.filter(p => p.imgTotal > 0).length;
  
  const avgCompetitorAltCoverage = competitors.reduce((sum, c) => {
    const coverage = c.pages.reduce((s, p) => 
      p.imgTotal > 0 ? s + (p.imgWithAlt / p.imgTotal) : s, 0
    ) / c.pages.filter(p => p.imgTotal > 0).length;
    return sum + coverage;
  }, 0) / competitors.length;
  
  if (targetAltCoverage > avgCompetitorAltCoverage * 1.2) {
    strengths.push({
      category: 'Image Accessibility',
      description: `${Math.round(targetAltCoverage * 100)}% of your images have alt text, competitors average ${Math.round(avgCompetitorAltCoverage * 100)}%`,
      advantage: 'Better accessibility and AI understanding of visual content',
      maintainStrategy: 'Continue providing descriptive alt text for all images'
    });
  }
  
  return strengths;
}
