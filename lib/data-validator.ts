/**
 * Data Validation and Sanitization Layer
 * 
 * Validates and sanitizes all AI-generated data before it reaches the UI.
 * Prevents crashes from malformed, missing, or unexpected data.
 */

interface PriorityRecommendation {
  id: string
  title: string
  category: 'Quick Win' | 'High Priority' | 'Medium Priority' | 'Long-term Investment' | 'Low Priority'
  effort?: number
  impact?: string
  roi?: string
  priority?: string
  roiScore?: number
  effortScore?: 1 | 2 | 3
  impactScore?: number
  affectedPages?: number
  estimatedTime?: string
  [key: string]: any
}

const VALID_CATEGORIES = ['Quick Win', 'High Priority', 'Medium Priority', 'Long-term Investment', 'Low Priority'] as const

/**
 * Validates and normalizes a single recommendation
 */
export function validateRecommendation(rec: any): PriorityRecommendation | null {
  if (!rec || typeof rec !== 'object') {
    console.warn('[DataValidator] Invalid recommendation object:', rec)
    return null
  }

  // Required fields
  if (!rec.title || typeof rec.title !== 'string') {
    console.warn('[DataValidator] Missing or invalid title:', rec)
    return null
  }

  // Generate ID if missing
  const id = rec.id || rec.rank?.toString() || Math.random().toString(36).substr(2, 9)

  // Normalize category
  let category: PriorityRecommendation['category'] = 'Medium Priority'
  if (rec.category && VALID_CATEGORIES.includes(rec.category)) {
    category = rec.category
  } else if (rec.priority) {
    // Map priority to category
    const priorityMap: Record<string, PriorityRecommendation['category']> = {
      'CRITICAL': 'Quick Win',
      'HIGH': 'High Priority',
      'MEDIUM': 'Medium Priority',
      'LOW': 'Low Priority'
    }
    category = priorityMap[rec.priority.toUpperCase()] || 'Medium Priority'
  }

  // Normalize effort (1-3 scale)
  let effortScore: 1 | 2 | 3 = 2
  if (rec.effortScore && [1, 2, 3].includes(rec.effortScore)) {
    effortScore = rec.effortScore
  } else if (rec.effort) {
    if (rec.effort === 1 || rec.effort === 'low') effortScore = 1
    else if (rec.effort === 3 || rec.effort === 'high') effortScore = 3
    else effortScore = 2
  }

  // Normalize impact (0-100 scale)
  let impactScore = 50
  if (typeof rec.impactScore === 'number' && rec.impactScore >= 0 && rec.impactScore <= 100) {
    impactScore = rec.impactScore
  } else if (rec.impact) {
    const impactMap: Record<string, number> = {
      'high': 80,
      'medium': 50,
      'low': 20
    }
    impactScore = impactMap[rec.impact.toLowerCase()] || 50
  }

  // Calculate ROI score if missing
  let roiScore = 50
  if (typeof rec.roiScore === 'number' && !isNaN(rec.roiScore)) {
    roiScore = rec.roiScore
  } else {
    // Simple ROI calculation: impact / effort
    roiScore = impactScore / effortScore
  }

  // Normalize affected pages
  const affectedPages = typeof rec.affectedPages === 'number' && rec.affectedPages > 0 
    ? rec.affectedPages 
    : 1

  // Normalize estimated time
  const estimatedTime = rec.estimatedTime || 
    (effortScore === 1 ? '15-30 min' : effortScore === 2 ? '1-2 hours' : '4-8 hours')

  return {
    id,
    title: rec.title,
    category,
    effortScore,
    impactScore,
    roiScore,
    affectedPages,
    estimatedTime,
    // Pass through other fields
    ...rec
  }
}

/**
 * Validates and normalizes an array of recommendations
 */
export function validateRecommendations(recommendations: any[]): PriorityRecommendation[] {
  if (!Array.isArray(recommendations)) {
    console.warn('[DataValidator] Recommendations is not an array:', recommendations)
    return []
  }

  return recommendations
    .map(validateRecommendation)
    .filter((rec): rec is PriorityRecommendation => rec !== null)
}

/**
 * Validates sitewide insights
 */
export function validateSitewideInsights(insights: any[]): any[] {
  if (!Array.isArray(insights)) {
    console.warn('[DataValidator] Insights is not an array:', insights)
    return []
  }

  return insights.filter(insight => {
    if (!insight || typeof insight !== 'object') return false
    if (!insight.title || !insight.description) return false
    if (!insight.impact || !['critical', 'high', 'medium', 'low'].includes(insight.impact)) {
      insight.impact = 'medium' // Default
    }
    return true
  })
}

/**
 * Validates schema issues
 */
export function validateSchemaIssues(issues: any[]): any[] {
  if (!Array.isArray(issues)) {
    console.warn('[DataValidator] Schema issues is not an array:', issues)
    return []
  }

  return issues.filter(issue => {
    if (!issue || typeof issue !== 'object') return false
    if (!issue.issue || !issue.severity) return false
    
    // Ensure severity is valid
    if (!['critical', 'high', 'medium'].includes(issue.severity)) {
      issue.severity = 'medium'
    }
    
    // Ensure modernCrawlerImpact is valid
    if (issue.modernCrawlerImpact && !['high', 'medium', 'low'].includes(issue.modernCrawlerImpact)) {
      issue.modernCrawlerImpact = 'medium'
    }
    
    return true
  })
}

/**
 * Validates entire analysis data structure
 */
export function validateAnalysisData(data: any): any {
  if (!data || typeof data !== 'object') {
    console.error('[DataValidator] Invalid analysis data structure')
    return null
  }

  // Validate AI section
  if (data.ai) {
    // Validate recommendations
    if (data.ai.recommendations) {
      data.ai.recommendations = validateRecommendations(data.ai.recommendations)
    }
    
    // Validate sitewide insights
    if (data.ai.sitewideInsights) {
      data.ai.sitewideInsights = validateSitewideInsights(data.ai.sitewideInsights)
    }
    
    // Validate schema issues
    if (data.ai.schemaHealthAudit?.issues) {
      data.ai.schemaHealthAudit.issues = validateSchemaIssues(data.ai.schemaHealthAudit.issues)
    }
  }

  return data
}
