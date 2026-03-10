/**
 * Deterministic Schema Validator
 * Validates schema against schema.org requirements without AI variability
 */

interface SchemaValidationResult {
  score: number; // 0-100
  hasSchema: boolean;
  schemaTypes: string[];
  issues: Array<{
    severity: 'critical' | 'high' | 'medium';
    message: string;
    affectedType: string;
  }>;
  strengths: string[];
}

/**
 * Required properties per schema type (schema.org spec)
 */
const REQUIRED_PROPERTIES: Record<string, string[]> = {
  'Organization': ['name', 'url'],
  'LocalBusiness': ['name', 'address', 'telephone'],
  'Person': ['name'],
  'Product': ['name', 'image', 'description'],
  'Article': ['headline', 'author', 'datePublished'],
  'FAQPage': ['mainEntity'],
  'HowTo': ['name', 'step'],
  'BreadcrumbList': ['itemListElement'],
  'WebSite': ['name', 'url'],
  'WebPage': ['name', 'url']
};

/**
 * Placeholder patterns to detect fake data
 */
const PLACEHOLDER_PATTERNS = [
  /000-0000/,
  /555-5555/,
  /123-4567/,
  /example\.com/,
  /example@/,
  /test@/,
  /placeholder/i,
  /lorem ipsum/i,
  /123 main st/i,
  /your (company|business|name)/i
];

/**
 * Validate a single schema object
 */
function validateSchemaObject(schema: any): {
  type: string;
  issues: Array<{ severity: 'critical' | 'high' | 'medium'; message: string }>;
  score: number;
} {
  const type = schema['@type'] || 'Unknown';
  const issues: Array<{ severity: 'critical' | 'high' | 'medium'; message: string }> = [];
  let score = 100;

  // Check required properties
  const requiredProps = REQUIRED_PROPERTIES[type] || [];
  requiredProps.forEach(prop => {
    if (!schema[prop]) {
      issues.push({
        severity: 'critical',
        message: `Missing required property: ${prop}`
      });
      score -= 20;
    }
  });

  // Check for placeholder data
  const schemaString = JSON.stringify(schema);
  PLACEHOLDER_PATTERNS.forEach(pattern => {
    if (pattern.test(schemaString)) {
      issues.push({
        severity: 'high',
        message: `Placeholder data detected (${pattern.source})`
      });
      score -= 15;
    }
  });

  // Specific validations per type
  if (type === 'LocalBusiness' && schema.address) {
    const addr = schema.address;
    if (!addr.streetAddress || !addr.addressLocality || !addr.postalCode) {
      issues.push({
        severity: 'high',
        message: 'Incomplete address (missing street, city, or postal code)'
      });
      score -= 10;
    }
  }

  if (type === 'Organization' || type === 'LocalBusiness') {
    if (schema.telephone && !/^\+?[\d\s\-\(\)]+$/.test(schema.telephone)) {
      issues.push({
        severity: 'medium',
        message: 'Invalid telephone format'
      });
      score -= 5;
    }
  }

  return { type, issues, score: Math.max(0, score) };
}

/**
 * Validate all schemas on a page
 */
export function validateSchemas(schemas: any[]): SchemaValidationResult {
  if (!schemas || schemas.length === 0) {
    return {
      score: 0,
      hasSchema: false,
      schemaTypes: [],
      issues: [{
        severity: 'critical',
        message: 'No schema markup found',
        affectedType: 'None'
      }],
      strengths: []
    };
  }

  const results = schemas.map(validateSchemaObject);
  const schemaTypes = results.map(r => r.type);
  const allIssues = results.flatMap(r => 
    r.issues.map(issue => ({
      ...issue,
      affectedType: r.type
    }))
  );

  // Calculate overall score (average of individual schema scores)
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  // Identify strengths
  const strengths: string[] = [];
  if (schemas.length > 1) strengths.push(`Multiple schema types implemented (${schemas.length})`);
  if (schemaTypes.includes('Organization') || schemaTypes.includes('LocalBusiness')) {
    strengths.push('Entity schema present (Organization/LocalBusiness)');
  }
  if (schemaTypes.includes('FAQPage')) strengths.push('FAQ schema for answer engines');
  if (allIssues.length === 0) strengths.push('No validation errors found');

  return {
    score: Math.round(avgScore),
    hasSchema: true,
    schemaTypes,
    issues: allIssues,
    strengths
  };
}

/**
 * Calculate brand consistency across multiple pages with detailed breakdown
 */
export function calculateBrandConsistency(pages: Array<{
  title: string;
  description: string;
  schemas: any[];
}>): {
  score: number;
  breakdown: {
    schemaNameConsistency: { score: number; issues: string[]; strengths: string[] };
    titleConsistency: { score: number; issues: string[]; strengths: string[] };
    descriptionConsistency: { score: number; issues: string[]; strengths: string[] };
  };
} {
  if (pages.length < 2) {
    return {
      score: 100,
      breakdown: {
        schemaNameConsistency: { score: 100, issues: [], strengths: ['Only one page analyzed - consistency check requires multiple pages'] },
        titleConsistency: { score: 100, issues: [], strengths: ['Only one page analyzed'] },
        descriptionConsistency: { score: 100, issues: [], strengths: ['Only one page analyzed'] }
      }
    };
  }

  // 1. SCHEMA NAME CONSISTENCY (40% weight)
  const brandNames = new Map<string, number>();
  const pagesWithSchema = pages.filter(p => p.schemas.length > 0);
  
  pagesWithSchema.forEach(page => {
    page.schemas.forEach(schema => {
      if (schema['@type'] === 'Organization' || schema['@type'] === 'LocalBusiness') {
        if (schema.name) {
          const normalized = schema.name.toLowerCase().trim();
          brandNames.set(normalized, (brandNames.get(normalized) || 0) + 1);
        }
      }
    });
  });

  let schemaNameScore = 0;
  const schemaNameIssues: string[] = [];
  const schemaNameStrengths: string[] = [];

  if (brandNames.size === 0) {
    schemaNameScore = 0;
    schemaNameIssues.push('No Organization or LocalBusiness schema found with name property');
  } else if (brandNames.size === 1) {
    schemaNameScore = 100;
    schemaNameStrengths.push(`Consistent brand name across all pages: "${Array.from(brandNames.keys())[0]}"`);
  } else {
    schemaNameScore = Math.max(0, 100 - (brandNames.size - 1) * 30);
    schemaNameIssues.push(`Multiple brand names found in schema: ${Array.from(brandNames.keys()).join(', ')}`);
    schemaNameIssues.push('Use the same exact brand name in all Organization/LocalBusiness schemas');
  }

  // 2. TITLE CONSISTENCY (30% weight)
  const titleWords = pages.map(p => 
    p.title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['http', 'https', 'www'].includes(w))
  );
  
  // Find words that appear in at least 50% of titles
  const wordFrequency = new Map<string, number>();
  titleWords.forEach(words => {
    const uniqueWords = new Set(words);
    uniqueWords.forEach(word => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });
  });

  const commonWords = Array.from(wordFrequency.entries())
    .filter(([_, count]) => count >= pages.length * 0.5)
    .map(([word]) => word);

  // Check if brand name appears in 80%+ of titles (industry standard)
  const brandNameInMostTitles = commonWords.some(word => {
    const frequency = wordFrequency.get(word) || 0;
    return frequency >= pages.length * 0.8; // 80% threshold
  });

  let titleScore = 0;
  const titleIssues: string[] = [];
  const titleStrengths: string[] = [];

  if (commonWords.length === 0) {
    titleScore = 30;
    titleIssues.push('No common brand terms found across page titles');
    titleIssues.push('RECOMMENDATION: Include your brand name (e.g., "FundyLogic") in all page titles');
    titleIssues.push('EXAMPLE: "Services | FundyLogic" instead of just "Services"');
    titleIssues.push('IMPACT: Search engines use consistent brand terms to build domain authority and brand recognition');
  } else if (brandNameInMostTitles) {
    // If brand name appears in 80%+ of titles, that's PERFECT - industry standard
    titleScore = 100;
    titleStrengths.push(`Excellent brand consistency: "${commonWords[0]}" appears in ${Math.round((wordFrequency.get(commonWords[0]) || 0) / pages.length * 100)}% of titles`);
    titleStrengths.push('This follows SEO best practices - brand name in all titles without keyword stuffing');
  } else if (commonWords.length >= 2) {
    titleScore = 100;
    titleStrengths.push(`Consistent brand terms in titles: ${commonWords.slice(0, 3).join(', ')}`);
    titleStrengths.push('Strong brand consistency helps search engines associate content with your business');
  } else {
    // Only 1 common term AND it's not in 80%+ of titles
    const frequency = wordFrequency.get(commonWords[0]) || 0;
    const percentage = Math.round((frequency / pages.length) * 100);
    
    if (percentage >= 60) {
      // Good enough - don't penalize
      titleScore = 90;
      titleStrengths.push(`Brand term "${commonWords[0]}" appears in ${percentage}% of titles`);
      titleStrengths.push('Good brand consistency - consider adding to remaining pages for maximum impact');
    } else {
      titleScore = 70;
      titleIssues.push(`Brand term "${commonWords[0]}" only appears in ${percentage}% of titles`);
      titleIssues.push(`RECOMMENDATION: Add "${commonWords[0]}" to all page titles for consistent branding`);
      titleIssues.push(`EXAMPLE: "Services | ${commonWords[0]}" instead of just "Services"`);
      titleIssues.push('IMPACT: Consistent brand terms in all titles strengthen domain authority');
    }
  }

  // 3. DESCRIPTION CONSISTENCY (30% weight)
  const descLengths = pages.map(p => p.description.length).filter(l => l > 0);
  
  let descScore = 0;
  const descIssues: string[] = [];
  const descStrengths: string[] = [];

  if (descLengths.length === 0) {
    descScore = 0;
    descIssues.push('No meta descriptions found on any pages');
  } else if (descLengths.length < pages.length) {
    const missingCount = pages.length - descLengths.length;
    descScore = 50;
    descIssues.push(`${missingCount} page(s) missing meta descriptions`);
  } else {
    const avgLength = descLengths.reduce((a, b) => a + b, 0) / descLengths.length;
    const variance = descLengths.reduce((sum, len) => 
      sum + Math.abs(len - avgLength), 0
    ) / descLengths.length;
    
    // Good variance is < 30 characters
    if (variance < 30) {
      descScore = 100;
      descStrengths.push(`Consistent description lengths (avg: ${Math.round(avgLength)} chars)`);
    } else if (variance < 60) {
      descScore = 70;
      descStrengths.push('Description lengths are reasonably consistent');
    } else {
      descScore = 40;
      descIssues.push(`High variance in description lengths (${Math.round(variance)} chars difference)`);
      descIssues.push('Aim for consistent description lengths (120-160 characters)');
    }
  }

  // Calculate weighted score
  const finalScore = Math.round(
    (schemaNameScore * 0.4) + 
    (titleScore * 0.3) + 
    (descScore * 0.3)
  );

  return {
    score: finalScore,
    breakdown: {
      schemaNameConsistency: { 
        score: schemaNameScore, 
        issues: schemaNameIssues, 
        strengths: schemaNameStrengths 
      },
      titleConsistency: { 
        score: titleScore, 
        issues: titleIssues, 
        strengths: titleStrengths 
      },
      descriptionConsistency: { 
        score: descScore, 
        issues: descIssues, 
        strengths: descStrengths 
      }
    }
  };
}
