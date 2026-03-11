/**
 * Grader V2 - Component-based scoring system
 * More accurate, transparent, and calibrated scoring
 */

import { SEO_CATEGORIES, type ComponentResult, type ComponentCategory } from "./scoring-components";
import type { SiteType } from "./types/audit";

export interface CategoryScore {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    components: ComponentResult[];
}

export interface GraderV2Result {
    seoScore: number;
    aeoScore: number; // Placeholder for future implementation
    geoScore: number; // Placeholder for future implementation
    breakdown: {
        seo: CategoryScore[];
        aeo: CategoryScore[];
        geo: CategoryScore[];
    };
    overallFeedback: string;
    criticalIssues: string[];
    version: 'v2';
}

/**
 * Calculate SEO score using component-based system
 */
export function calculateSEOScore(data: {
    url: string;
    title: string;
    description: string;
    titleLength: number;
    descriptionLength: number;
    structuralData: any;
    schemas: any[];
    semanticFlags: any;
    schemaQuality?: any;
    responseTimeMs?: number;
    siteType?: SiteType;
}): { score: number; breakdown: CategoryScore[] } {
    
    const categoryScores: CategoryScore[] = [];
    let totalScore = 0;
    let totalMaxScore = 0;

    // Evaluate each category
    for (const category of SEO_CATEGORIES) {
        const componentResults: ComponentResult[] = [];
        let categoryScore = 0;
        let categoryMaxScore = 0;

        // Evaluate each component in the category
        for (const component of category.components) {
            const result = component.evaluate(data);
            componentResults.push(result);
            categoryScore += result.score;
            categoryMaxScore += result.maxScore;
        }

        const categoryPercentage = categoryMaxScore > 0 
            ? Math.round((categoryScore / categoryMaxScore) * 100) 
            : 0;

        categoryScores.push({
            name: category.name,
            score: Math.round(categoryScore),
            maxScore: category.maxPoints,
            percentage: categoryPercentage,
            components: componentResults
        });

        totalScore += categoryScore;
        totalMaxScore += categoryMaxScore;
    }

    const finalScore = Math.round(totalScore);

    return {
        score: finalScore,
        breakdown: categoryScores
    };
}

/**
 * Main grader function - currently only implements SEO
 * AEO and GEO will be added in future iterations
 */
export function calculateScoresV2(
    structuralData: any,
    schemas: any[],
    semanticFlags: any,
    titleLength: number,
    descriptionLength: number,
    url: string,
    title: string,
    description: string,
    schemaQuality?: any,
    responseTimeMs?: number,
    siteType?: SiteType
): GraderV2Result {
    
    // Prepare data object for component evaluation
    const evaluationData = {
        url,
        title,
        description,
        titleLength,
        descriptionLength,
        structuralData,
        schemas,
        semanticFlags,
        schemaQuality,
        responseTimeMs,
        siteType
    };

    // Calculate SEO score with breakdown
    const seoResult = calculateSEOScore(evaluationData);

    // Collect critical issues
    const criticalIssues: string[] = [];
    for (const category of seoResult.breakdown) {
        for (const component of category.components) {
            if (component.status === 'critical' && component.issues) {
                criticalIssues.push(...component.issues);
            }
        }
    }

    // Generate overall feedback
    const overallFeedback = generateOverallFeedback(seoResult.score, criticalIssues.length);

    // Placeholder scores for AEO and GEO (will be implemented later)
    const aeoScore = 50; // Placeholder
    const geoScore = 50; // Placeholder

    return {
        seoScore: seoResult.score,
        aeoScore,
        geoScore,
        breakdown: {
            seo: seoResult.breakdown,
            aeo: [], // Placeholder
            geo: []  // Placeholder
        },
        overallFeedback,
        criticalIssues,
        version: 'v2'
    };
}

/**
 * Generate human-readable feedback based on score
 */
function generateOverallFeedback(score: number, criticalIssueCount: number): string {
    if (score >= 90) {
        return "Exceptional SEO - Your site follows modern best practices and is well-optimized for search engines.";
    }
    
    if (score >= 75) {
        return "Good SEO foundation - Your site has solid optimization with room for minor improvements.";
    }
    
    if (score >= 60) {
        return "Average SEO - Basic elements are in place, but significant improvements are needed to compete effectively.";
    }
    
    if (score >= 40) {
        return "Poor SEO - Major issues are holding your site back. Focus on addressing critical problems first.";
    }
    
    if (score >= 20) {
        return "Critical SEO issues - Your site has fundamental problems that severely impact search visibility.";
    }
    
    return "Severe SEO problems - Your site is not properly optimized for search engines and needs immediate attention.";
}

/**
 * Compare V1 and V2 scores for calibration
 */
export function compareScores(v1Score: number, v2Score: number): {
    difference: number;
    percentageChange: number;
    interpretation: string;
} {
    const difference = v2Score - v1Score;
    const percentageChange = v1Score > 0 ? Math.round((difference / v1Score) * 100) : 0;
    
    let interpretation = '';
    if (Math.abs(difference) < 5) {
        interpretation = 'Scores are very similar';
    } else if (difference > 0) {
        interpretation = `V2 is ${difference} points higher (more lenient)`;
    } else {
        interpretation = `V2 is ${Math.abs(difference)} points lower (more strict)`;
    }
    
    return {
        difference,
        percentageChange,
        interpretation
    };
}


/**
 * Convert V2 breakdown to V1-style penalty ledger for backwards compatibility
 */
export function convertBreakdownToPenaltyLedger(breakdown: CategoryScore[]): Array<{
    category: string;
    penalty: string;
    pointsDeducted: number;
}> {
    const penalties: Array<{ category: string; penalty: string; pointsDeducted: number }> = [];
    
    for (const category of breakdown) {
        for (const component of category.components) {
            // Only include components that lost points
            const pointsLost = component.maxScore - component.score;
            if (pointsLost > 0 && component.issues && component.issues.length > 0) {
                penalties.push({
                    category: category.name.toUpperCase(),
                    penalty: component.issues.join('; '),
                    pointsDeducted: -pointsLost
                });
            }
        }
    }
    
    return penalties;
}
