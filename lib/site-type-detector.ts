import type { PageScan } from './crawler-deep';
import type { SiteType, SiteTypeResult, ClassificationSignal } from './types/audit';

/**
 * Site Type Detector
 * Classifies websites into business categories to enable context-aware recommendations.
 * Uses 4 signals: schema types (40%), content patterns (30%), structure (20%), URL patterns (10%)
 */

export function detectSiteType(homePage: PageScan, allPages: PageScan[] = []): SiteTypeResult {
  const signals: ClassificationSignal[] = [];
  const scores = new Map<SiteType, number>();
  
  // Signal 1: Schema Type Analysis (40% weight)
  const schemaTypes = new Set(homePage.schemas.map(s => s['@type']).flat().filter(Boolean));
  
  if (schemaTypes.has('LocalBusiness') || schemaTypes.has('Place')) {
    addScore(scores, 'local-business', 40, 'LocalBusiness schema detected');
  }
  if (schemaTypes.has('Restaurant') || schemaTypes.has('FoodEstablishment')) {
    addScore(scores, 'restaurant', 40, 'Restaurant schema detected');
  }
  if (schemaTypes.has('Product') || schemaTypes.has('Offer') || schemaTypes.has('Store')) {
    addScore(scores, 'e-commerce', 40, 'Product/Offer schema detected');
  }
  if (schemaTypes.has('SoftwareApplication') || schemaTypes.has('WebApplication')) {
    addScore(scores, 'saas', 40, 'SoftwareApplication schema detected');
  }
  if (schemaTypes.has('Article') || schemaTypes.has('BlogPosting') || schemaTypes.has('NewsArticle')) {
    addScore(scores, 'blog', 40, 'Article/BlogPosting schema detected');
  }
  if (schemaTypes.has('ProfessionalService') || schemaTypes.has('Attorney') || schemaTypes.has('Dentist')) {
    addScore(scores, 'professional-services', 40, 'ProfessionalService schema detected');
  }
  if (schemaTypes.has('EducationalOrganization') || schemaTypes.has('Course')) {
    addScore(scores, 'educational', 40, 'Educational schema detected');
  }
  
  // Signal 2: Content Pattern Matching (30% weight)
  const contentPatterns: Record<SiteType, RegExp> = {
    'e-commerce': /add to cart|shopping cart|checkout|buy now|price|\$\d+|shop|store/i,
    'local-business': /hours|location|directions|call us|visit us|address|phone|contact/i,
    'saas': /pricing|plans|free trial|demo|sign up|subscribe|features|api/i,
    'blog': /posted on|by author|read more|comments|categories|tags|archive/i,
    'restaurant': /menu|reservations|order online|delivery|takeout|dine in/i,
    'contractor': /free estimate|licensed|insured|years of experience|service area|emergency/i,
    'professional-services': /consultation|expertise|certified|professional|practice|clients/i,
    'portfolio': /portfolio|projects|work|case studies|gallery|showcase/i,
    'news-media': /breaking|latest news|headlines|reporter|journalist|press/i,
    'educational': /courses|learning|students|education|training|curriculum/i,
    'general': /about|services|contact|home/i
  };
  
  Object.entries(contentPatterns).forEach(([type, pattern]) => {
    if (pattern.test(homePage.thinnedText)) {
      addScore(scores, type as SiteType, 30, `Content pattern matched: ${type}`);
    }
  });
  
  // Signal 3: Structural Analysis (20% weight)
  if (allPages.length > 0) {
    const hasProductPages = allPages.some(p => /product|item|shop|store/i.test(p.url));
    const hasBlogPages = allPages.some(p => /blog|article|post|news/i.test(p.url));
    const hasLocationPages = allPages.some(p => /location|contact|about|directions/i.test(p.url));
    const hasPortfolioPages = allPages.some(p => /portfolio|work|project|case-stud/i.test(p.url));
    const hasPricingPages = allPages.some(p => /pricing|plans|subscribe/i.test(p.url));
    const hasMenuPages = allPages.some(p => /menu|food|drink/i.test(p.url));
    
    if (hasProductPages) addScore(scores, 'e-commerce', 20, 'Product pages detected');
    if (hasBlogPages) addScore(scores, 'blog', 20, 'Blog pages detected');
    if (hasLocationPages) addScore(scores, 'local-business', 20, 'Location pages detected');
    if (hasPortfolioPages) addScore(scores, 'portfolio', 20, 'Portfolio pages detected');
    if (hasPricingPages) addScore(scores, 'saas', 20, 'Pricing pages detected');
    if (hasMenuPages) addScore(scores, 'restaurant', 20, 'Menu pages detected');
  }
  
  // Signal 4: URL Structure (10% weight)
  const url = homePage.url.toLowerCase();
  if (/\/products?\/|\/shop\/|\/store\//i.test(url)) {
    addScore(scores, 'e-commerce', 10, 'E-commerce URL pattern');
  }
  if (/\/blog\/|\/articles?\/|\/posts?\//i.test(url)) {
    addScore(scores, 'blog', 10, 'Blog URL pattern');
  }
  if (/\/menu\/|\/food\//i.test(url)) {
    addScore(scores, 'restaurant', 10, 'Restaurant URL pattern');
  }
  
  // Select primary type (highest score)
  const sortedTypes = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  const primaryType = sortedTypes[0]?.[0] || 'general';
  const confidence = sortedTypes[0]?.[1] || 0;
  
  // Identify secondary types (score >= 50)
  const secondaryTypes = sortedTypes.slice(1).filter(([_, score]) => score >= 50).map(([type]) => type);
  
  // Build signals array
  const signalsArray: ClassificationSignal[] = Array.from(scores.entries()).map(([type, score]) => ({
    type,
    score,
    evidence: `Detected via schema, content, and structure analysis`
  }));
  
  // Get recommended schemas for this site type
  const recommendedSchemas = getRecommendedSchemas(primaryType);
  
  return {
    primaryType,
    secondaryTypes,
    confidence,
    signals: signalsArray,
    recommendedSchemas
  };
}

function addScore(scores: Map<SiteType, number>, type: SiteType, points: number, evidence: string): void {
  scores.set(type, (scores.get(type) || 0) + points);
}

export function getRecommendedSchemas(siteType: SiteType): string[] {
  const schemaMap: Record<SiteType, string[]> = {
    'local-business': ['LocalBusiness', 'Review', 'OpeningHoursSpecification', 'PostalAddress', 'GeoCoordinates'],
    'e-commerce': ['Product', 'Offer', 'Review', 'AggregateRating', 'BreadcrumbList', 'Organization'],
    'blog': ['Article', 'BlogPosting', 'Person', 'Organization', 'WebSite', 'BreadcrumbList'],
    'saas': ['SoftwareApplication', 'FAQPage', 'HowTo', 'Organization', 'WebSite', 'Review'],
    'restaurant': ['Restaurant', 'Menu', 'MenuItem', 'Review', 'AggregateRating', 'OpeningHoursSpecification'],
    'contractor': ['LocalBusiness', 'Service', 'Review', 'AggregateRating', 'PostalAddress', 'Offer'],
    'professional-services': ['ProfessionalService', 'Person', 'Review', 'Service', 'Organization'],
    'portfolio': ['Person', 'CreativeWork', 'Organization', 'WebSite'],
    'news-media': ['NewsArticle', 'Article', 'Organization', 'Person', 'WebSite'],
    'educational': ['EducationalOrganization', 'Course', 'LearningResource', 'Organization'],
    'general': ['Organization', 'WebSite', 'BreadcrumbList']
  };
  
  return schemaMap[siteType] || schemaMap['general'];
}

export function formatSiteType(siteType: SiteType): string {
  const formatMap: Record<SiteType, string> = {
    'e-commerce': 'E-Commerce',
    'local-business': 'Local Business',
    'blog': 'Blog / Content Site',
    'saas': 'SaaS / Software',
    'portfolio': 'Portfolio',
    'restaurant': 'Restaurant',
    'contractor': 'Contractor / Service Provider',
    'professional-services': 'Professional Services',
    'news-media': 'News / Media',
    'educational': 'Educational',
    'general': 'General Website'
  };
  
  return formatMap[siteType] || 'General Website';
}
