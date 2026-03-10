import type { SiteType } from './types/audit';

/**
 * Site-Type-Specific Penalty Weight Adjustments
 * 
 * These multipliers adjust penalty severity based on site type.
 * - 1.0 = standard penalty (no adjustment)
 * - >1.0 = more severe penalty for this site type
 * - <1.0 = less severe penalty for this site type
 * - 0.0 = penalty doesn't apply to this site type
 */

export interface SiteTypePenaltyWeights {
  // Schema-related penalties
  missingLocalBusinessSchema: number;
  missingProductSchema: number;
  missingReviewSchema: number;
  missingFAQSchema: number;
  missingArticleSchema: number;
  missingBreadcrumbSchema: number;
  
  // Content penalties
  thinContent: number; // <300 words
  missingH1: number;
  poorQuestionAnswering: number;
  
  // Technical penalties
  missingMetaDescription: number;
  poorImageAltCoverage: number;
  weakInternalLinking: number;
  
  // Structural penalties
  noExternalLinks: number;
  missingSemanticTags: number;
}

export const SITE_TYPE_PENALTY_WEIGHTS: Record<SiteType, SiteTypePenaltyWeights> = {
  'local-business': {
    missingLocalBusinessSchema: 2.0,  // Critical for local businesses
    missingProductSchema: 0.5,         // Less important
    missingReviewSchema: 1.8,          // Very important for local trust
    missingFAQSchema: 1.2,
    missingArticleSchema: 0.3,         // Not relevant
    missingBreadcrumbSchema: 0.8,
    thinContent: 0.7,                  // Short pages OK for contact/location
    missingH1: 1.0,
    poorQuestionAnswering: 1.3,
    missingMetaDescription: 1.2,
    poorImageAltCoverage: 1.5,         // Important for local visibility
    weakInternalLinking: 0.8,
    noExternalLinks: 0.3,              // Not critical
    missingSemanticTags: 0.7
  },
  
  'e-commerce': {
    missingLocalBusinessSchema: 0.3,
    missingProductSchema: 2.0,         // Critical for e-commerce
    missingReviewSchema: 1.8,          // Very important for conversions
    missingFAQSchema: 1.3,
    missingArticleSchema: 0.5,
    missingBreadcrumbSchema: 1.5,      // Important for navigation
    thinContent: 1.2,                  // Product descriptions should be detailed
    missingH1: 1.3,
    poorQuestionAnswering: 1.0,
    missingMetaDescription: 1.5,       // Critical for product pages
    poorImageAltCoverage: 1.8,         // Critical for product images
    weakInternalLinking: 1.3,          // Important for product discovery
    noExternalLinks: 0.2,
    missingSemanticTags: 0.8
  },
  
  'blog': {
    missingLocalBusinessSchema: 0.0,
    missingProductSchema: 0.0,
    missingReviewSchema: 0.5,
    missingFAQSchema: 1.2,
    missingArticleSchema: 2.0,         // Critical for blogs
    missingBreadcrumbSchema: 1.2,
    thinContent: 1.8,                  // Blog posts should be substantial
    missingH1: 1.5,                    // Very important for articles
    poorQuestionAnswering: 1.7,        // Critical for content sites
    missingMetaDescription: 1.5,
    poorImageAltCoverage: 1.2,
    weakInternalLinking: 1.5,          // Important for content discovery
    noExternalLinks: 1.3,              // Important for authority
    missingSemanticTags: 1.2
  },
  
  'saas': {
    missingLocalBusinessSchema: 0.0,
    missingProductSchema: 0.8,
    missingReviewSchema: 1.5,          // Important for trust
    missingFAQSchema: 1.8,             // Very important for SaaS
    missingArticleSchema: 0.7,
    missingBreadcrumbSchema: 1.0,
    thinContent: 1.0,
    missingH1: 1.2,
    poorQuestionAnswering: 1.8,        // Critical for explaining product
    missingMetaDescription: 1.3,
    poorImageAltCoverage: 1.0,
    weakInternalLinking: 1.2,
    noExternalLinks: 0.5,
    missingSemanticTags: 0.8
  },
  
  'restaurant': {
    missingLocalBusinessSchema: 1.8,   // Restaurant is a LocalBusiness subtype
    missingProductSchema: 0.3,
    missingReviewSchema: 2.0,          // Critical for restaurants
    missingFAQSchema: 1.0,
    missingArticleSchema: 0.2,
    missingBreadcrumbSchema: 0.7,
    thinContent: 0.5,                  // Menu pages can be short
    missingH1: 1.0,
    poorQuestionAnswering: 0.8,
    missingMetaDescription: 1.2,
    poorImageAltCoverage: 1.7,         // Food photos are critical
    weakInternalLinking: 0.7,
    noExternalLinks: 0.2,
    missingSemanticTags: 0.6
  },
  
  'contractor': {
    missingLocalBusinessSchema: 1.8,
    missingProductSchema: 0.5,
    missingReviewSchema: 2.0,          // Critical for contractor trust
    missingFAQSchema: 1.5,
    missingArticleSchema: 0.5,
    missingBreadcrumbSchema: 0.8,
    thinContent: 0.8,
    missingH1: 1.0,
    poorQuestionAnswering: 1.5,        // Important for service explanation
    missingMetaDescription: 1.2,
    poorImageAltCoverage: 1.5,         // Project photos important
    weakInternalLinking: 0.8,
    noExternalLinks: 0.3,
    missingSemanticTags: 0.7
  },
  
  'professional-services': {
    missingLocalBusinessSchema: 1.5,
    missingProductSchema: 0.3,
    missingReviewSchema: 1.7,
    missingFAQSchema: 1.5,
    missingArticleSchema: 1.0,
    missingBreadcrumbSchema: 1.0,
    thinContent: 1.2,
    missingH1: 1.2,
    poorQuestionAnswering: 1.5,
    missingMetaDescription: 1.3,
    poorImageAltCoverage: 1.0,
    weakInternalLinking: 1.0,
    noExternalLinks: 0.8,
    missingSemanticTags: 0.9
  },
  
  'portfolio': {
    missingLocalBusinessSchema: 0.0,
    missingProductSchema: 0.0,
    missingReviewSchema: 0.5,
    missingFAQSchema: 0.5,
    missingArticleSchema: 0.7,
    missingBreadcrumbSchema: 0.8,
    thinContent: 0.5,                  // Portfolio pages can be visual
    missingH1: 1.0,
    poorQuestionAnswering: 0.5,
    missingMetaDescription: 1.0,
    poorImageAltCoverage: 2.0,         // Critical for portfolio images
    weakInternalLinking: 1.0,
    noExternalLinks: 0.5,
    missingSemanticTags: 0.8
  },
  
  'news-media': {
    missingLocalBusinessSchema: 0.0,
    missingProductSchema: 0.0,
    missingReviewSchema: 0.3,
    missingFAQSchema: 0.7,
    missingArticleSchema: 2.0,         // Critical for news
    missingBreadcrumbSchema: 1.3,
    thinContent: 1.5,
    missingH1: 1.5,
    poorQuestionAnswering: 1.3,
    missingMetaDescription: 1.5,
    poorImageAltCoverage: 1.5,
    weakInternalLinking: 1.3,
    noExternalLinks: 1.5,              // Important for news credibility
    missingSemanticTags: 1.2
  },
  
  'educational': {
    missingLocalBusinessSchema: 0.5,
    missingProductSchema: 0.3,
    missingReviewSchema: 1.0,
    missingFAQSchema: 1.5,
    missingArticleSchema: 1.3,
    missingBreadcrumbSchema: 1.2,
    thinContent: 1.5,                  // Educational content should be detailed
    missingH1: 1.3,
    poorQuestionAnswering: 1.8,        // Critical for educational sites
    missingMetaDescription: 1.3,
    poorImageAltCoverage: 1.2,
    weakInternalLinking: 1.3,
    noExternalLinks: 1.2,              // Important for educational resources
    missingSemanticTags: 1.0
  },
  
  'general': {
    // Standard weights (no adjustments)
    missingLocalBusinessSchema: 1.0,
    missingProductSchema: 1.0,
    missingReviewSchema: 1.0,
    missingFAQSchema: 1.0,
    missingArticleSchema: 1.0,
    missingBreadcrumbSchema: 1.0,
    thinContent: 1.0,
    missingH1: 1.0,
    poorQuestionAnswering: 1.0,
    missingMetaDescription: 1.0,
    poorImageAltCoverage: 1.0,
    weakInternalLinking: 1.0,
    noExternalLinks: 1.0,
    missingSemanticTags: 1.0
  }
};

export function getPenaltyWeight(siteType: SiteType, penaltyType: keyof SiteTypePenaltyWeights): number {
  return SITE_TYPE_PENALTY_WEIGHTS[siteType]?.[penaltyType] ?? 1.0;
}
