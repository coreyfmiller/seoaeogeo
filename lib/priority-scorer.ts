import type { SiteType } from './types/audit';
import type { FixInstruction } from './fix-generator';

/**
 * Priority Scorer
 * Calculates ROI-based rankings to help users focus on high-impact improvements
 */

export interface PriorityRecommendation {
  id: string;
  recommendation: Recommendation;
  roiScore: number; // Impact / Effort
  effortScore: 1 | 2 | 3;
  impactScore: number; // 0-100
  estimatedImprovement: ScoreImprovement;
  category: 'Quick Win' | 'High Priority' | 'Medium Priority' | 'Long-term Investment' | 'Low Priority';
  reasoning: string;
  estimatedTime: string;
  affectedPages: number;
  fixInstructions?: FixInstruction;
  completed?: boolean;
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  affectsScore: 'seo' | 'aeo' | 'geo' | 'all';
  affectedPages: number;
  baseImpact: number;
  source: 'deterministic' | 'gemini' | 'gap-analysis';
}

export interface ScoreImprovement {
  seo: number;
  aeo: number;
  geo: number;
  total: number;
}

export interface CurrentScores {
  seo: number;
  aeo: number;
  geo: number;
}

/**
 * Calculate priority for all recommendations
 */
export function calculatePriority(
  recommendations: Recommendation[],
  siteType: SiteType,
  currentScores: CurrentScores
): PriorityRecommendation[] {
  return recommendations
    .map((rec, index) => {
      const impact = calculateImpact(rec, siteType, currentScores);
      const effort = calculateEffort(rec);
      const roi = impact / effort;
      const improvement = estimateScoreGain(rec, currentScores);
      
      return {
        id: `rec-${index}`,
        recommendation: rec,
        impactScore: impact,
        effortScore: effort,
        roiScore: roi,
        category: categorizeByROI(roi, effort),
        estimatedImprovement: improvement,
        reasoning: explainPriority(rec, impact, effort, siteType),
        estimatedTime: estimateTime(effort),
        affectedPages: rec.affectedPages,
        completed: false
      };
    })
    .sort((a, b) => b.roiScore - a.roiScore); // Sort by ROI descending
}

/**
 * Calculate impact score (0-100) based on site type and current state
 */
export function calculateImpact(
  rec: Recommendation,
  siteType: SiteType,
  currentScores: CurrentScores
): number {
  let impact = rec.baseImpact || 50;
  
  // Site-type-specific multipliers
  const siteTypeMultipliers: Record<string, Record<string, number>> = {
    'local-business': {
      'LocalBusiness schema': 1.5,
      'Review schema': 1.4,
      'Opening hours': 1.3,
      'NAP consistency': 1.3,
      'Google Maps integration': 1.4
    },
    'e-commerce': {
      'Product schema': 1.5,
      'Review schema': 1.4,
      'Breadcrumb schema': 1.2,
      'Image alt text': 1.3,
      'Product descriptions': 1.3
    },
    'blog': {
      'Article schema': 1.4,
      'Author schema': 1.2,
      'FAQ schema': 1.3,
      'Internal linking': 1.3,
      'Content depth': 1.4
    },
    'saas': {
      'SoftwareApplication schema': 1.5,
      'FAQ schema': 1.4,
      'HowTo schema': 1.3,
      'Pricing page': 1.2,
      'Feature documentation': 1.3
    },
    'restaurant': {
      'Restaurant schema': 1.5,
      'Menu schema': 1.4,
      'Review schema': 1.5,
      'Opening hours': 1.4,
      'Reservation system': 1.3
    },
    'contractor': {
      'LocalBusiness schema': 1.5,
      'Review schema': 1.5,
      'Service area': 1.3,
      'Before/after photos': 1.4,
      'License information': 1.2
    }
  };
  
  const multiplier = siteTypeMultipliers[siteType]?.[rec.type] || 1.0;
  impact *= multiplier;
  
  // Adjust based on current scores (bigger gaps = higher impact)
  if (rec.affectsScore === 'aeo' && currentScores.aeo < 70) impact *= 1.2;
  if (rec.affectsScore === 'seo' && currentScores.seo < 70) impact *= 1.2;
  if (rec.affectsScore === 'geo' && currentScores.geo < 70) impact *= 1.2;
  if (rec.affectsScore === 'all') {
    const avgScore = (currentScores.seo + currentScores.aeo + currentScores.geo) / 3;
    if (avgScore < 70) impact *= 1.15;
  }
  
  // Adjust based on affected page count
  if (rec.affectedPages > 10) impact *= 1.3;
  else if (rec.affectedPages > 5) impact *= 1.15;
  
  return Math.min(100, Math.round(impact));
}

/**
 * Calculate effort score (1=easy, 2=moderate, 3=difficult)
 */
export function calculateEffort(rec: Recommendation): 1 | 2 | 3 {
  const effortMap: Record<string, number> = {
    // Easy (1) - Copy-paste, no dev needed
    'Add schema markup': 1,
    'Fix meta descriptions': 1,
    'Add alt text': 1,
    'Add H1 tags': 1,
    'Fix title tags': 1,
    'Add OpenGraph tags': 1,
    
    // Moderate (2) - Some customization, basic dev
    'Add FAQ schema': 2,
    'Improve internal linking': 2,
    'Add breadcrumbs': 2,
    'Create FAQ page': 2,
    'Add structured data': 2,
    'Optimize images': 2,
    'Add canonical tags': 2,
    
    // Difficult (3) - Significant dev work
    'Expand thin content': 3,
    'Restructure site architecture': 3,
    'Implement dynamic schema': 3,
    'Build resource library': 3,
    'Create content hub': 3,
    'Redesign navigation': 3
  };
  
  // Check for exact match
  if (effortMap[rec.type]) {
    return effortMap[rec.type] as 1 | 2 | 3;
  }
  
  // Check for partial match
  for (const [key, value] of Object.entries(effortMap)) {
    if (rec.type.toLowerCase().includes(key.toLowerCase())) {
      return value as 1 | 2 | 3;
    }
  }
  
  // Default to moderate
  return 2;
}

/**
 * Categorize recommendation by ROI and effort
 */
export function categorizeByROI(roiScore: number, effort: 1 | 2 | 3): PriorityRecommendation['category'] {
  if (roiScore > 50 && effort === 1) return 'Quick Win';
  if (roiScore > 40 && effort <= 2) return 'High Priority';
  if (roiScore > 30) return 'Medium Priority';
  if (effort === 3 && roiScore > 25) return 'Long-term Investment';
  return 'Low Priority';
}

/**
 * Estimate score improvements from implementing recommendation
 */
export function estimateScoreGain(rec: Recommendation, current: CurrentScores): ScoreImprovement {
  const gains: Record<string, Partial<CurrentScores>> = {
    'Add LocalBusiness schema': { aeo: 15, geo: 5 },
    'Add Product schema': { aeo: 20, seo: 5 },
    'Add Review schema': { aeo: 18, geo: 8 },
    'Fix meta descriptions': { seo: 10 },
    'Add FAQ schema': { aeo: 12, seo: 3 },
    'Improve internal linking': { seo: 8, aeo: 3 },
    'Add image alt text': { seo: 5, geo: 10 },
    'Add H1 tags': { seo: 8 },
    'Expand thin content': { seo: 12, aeo: 5 },
    'Add breadcrumbs': { seo: 6, aeo: 4 },
    'Add Article schema': { aeo: 15, seo: 3 }
  };
  
  // Find matching gain or use defaults
  let gain = gains[rec.type] || { seo: 5, aeo: 5, geo: 5 };
  
  // Check for partial matches
  if (!gains[rec.type]) {
    for (const [key, value] of Object.entries(gains)) {
      if (rec.type.toLowerCase().includes(key.toLowerCase())) {
        gain = value;
        break;
      }
    }
  }
  
  // Cap gains at remaining points to 100
  const seoGain = Math.min(100 - current.seo, gain.seo || 0);
  const aeoGain = Math.min(100 - current.aeo, gain.aeo || 0);
  const geoGain = Math.min(100 - current.geo, gain.geo || 0);
  
  return {
    seo: seoGain,
    aeo: aeoGain,
    geo: geoGain,
    total: seoGain + aeoGain + geoGain
  };
}

/**
 * Generate human-readable reasoning for priority
 */
export function explainPriority(
  rec: Recommendation,
  impact: number,
  effort: 1 | 2 | 3,
  siteType: SiteType
): string {
  const reasons: string[] = [];
  
  if (impact > 80) {
    reasons.push('High impact on search visibility');
  } else if (impact > 60) {
    reasons.push('Moderate impact on search visibility');
  }
  
  if (effort === 1) {
    reasons.push('Quick to implement (< 30 minutes)');
  } else if (effort === 2) {
    reasons.push('Moderate implementation time (30-120 minutes)');
  } else {
    reasons.push('Requires significant development time (> 2 hours)');
  }
  
  if (rec.affectedPages > 10) {
    reasons.push(`Affects ${rec.affectedPages} pages site-wide`);
  } else if (rec.affectedPages > 1) {
    reasons.push(`Affects ${rec.affectedPages} pages`);
  }
  
  // Site-type-specific reasoning
  const siteTypeReasons: Record<string, Record<string, string>> = {
    'local-business': {
      'Review schema': 'Critical for local trust and Google Maps visibility',
      'LocalBusiness schema': 'Enables rich local search results',
      'Opening hours': 'Helps customers find you when you\'re open'
    },
    'e-commerce': {
      'Product schema': 'Enables rich product cards in search results',
      'Review schema': 'Shows star ratings in search, increases click-through',
      'Breadcrumb schema': 'Improves navigation and search appearance'
    },
    'blog': {
      'Article schema': 'Enables article rich results and Top Stories',
      'FAQ schema': 'Captures featured snippet opportunities',
      'Internal linking': 'Improves content discovery and authority flow'
    },
    'saas': {
      'FAQ schema': 'Answers common questions directly in search',
      'HowTo schema': 'Provides step-by-step guidance in search results',
      'SoftwareApplication schema': 'Enables app rich results'
    }
  };
  
  const siteTypeReason = siteTypeReasons[siteType]?.[rec.type];
  if (siteTypeReason) {
    reasons.push(siteTypeReason);
  }
  
  return reasons.join('. ') + '.';
}

/**
 * Estimate implementation time based on effort
 */
export function estimateTime(effort: 1 | 2 | 3): string {
  if (effort === 1) return '5-30 minutes';
  if (effort === 2) return '30-120 minutes';
  return '2-8 hours';
}

/**
 * Calculate cumulative impact of multiple recommendations
 */
export function calculateCumulativeImpact(
  recommendations: PriorityRecommendation[]
): ScoreImprovement {
  return recommendations
    .filter(r => !r.completed)
    .reduce((total, rec) => ({
      seo: total.seo + rec.estimatedImprovement.seo,
      aeo: total.aeo + rec.estimatedImprovement.aeo,
      geo: total.geo + rec.estimatedImprovement.geo,
      total: total.total + rec.estimatedImprovement.total
    }), { seo: 0, aeo: 0, geo: 0, total: 0 });
}

/**
 * Get top N recommendations by ROI
 */
export function getTopRecommendations(
  recommendations: PriorityRecommendation[],
  count: number = 3
): PriorityRecommendation[] {
  return recommendations
    .filter(r => !r.completed)
    .sort((a, b) => b.roiScore - a.roiScore)
    .slice(0, count);
}

/**
 * Recalculate priorities after marking items complete
 */
export function recalculatePriorities(
  recommendations: PriorityRecommendation[],
  completedIds: string[],
  siteType: SiteType,
  currentScores: CurrentScores
): PriorityRecommendation[] {
  // Mark completed items
  const updated = recommendations.map(rec => ({
    ...rec,
    completed: completedIds.includes(rec.id) || rec.completed
  }));
  
  // Recalculate for incomplete items
  return updated.map(rec => {
    if (rec.completed) return rec;
    
    // Recalculate with updated scores
    const impact = calculateImpact(rec.recommendation, siteType, currentScores);
    const roi = impact / rec.effortScore;
    
    return {
      ...rec,
      impactScore: impact,
      roiScore: roi,
      category: categorizeByROI(roi, rec.effortScore),
      reasoning: explainPriority(rec.recommendation, impact, rec.effortScore, siteType)
    };
  }).sort((a, b) => {
    // Completed items go to bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    // Sort incomplete by ROI
    return b.roiScore - a.roiScore;
  });
}
