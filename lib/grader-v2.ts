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
 * Main grader function - calculates SEO, AEO, and GEO scores
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

    // Calculate AEO score
    const aeoResult = calculateAEOScore(evaluationData);

    // Calculate GEO score
    const geoResult = calculateGEOScore(evaluationData);

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

    return {
        seoScore: seoResult.score,
        aeoScore: aeoResult.score,
        geoScore: geoResult.score,
        breakdown: {
            seo: seoResult.breakdown,
            aeo: aeoResult.breakdown,
            geo: geoResult.breakdown
        },
        overallFeedback,
        criticalIssues,
        version: 'v2'
    };
}

/**
 * Calculate AEO score based on semantic flags and schema quality
 */
function calculateAEOScore(data: any): { score: number; breakdown: CategoryScore[] } {
    let score = 100;
    const components: ComponentResult[] = [];

    // Schema presence and quality (40 points)
    if (data.schemaQuality) {
        if (!data.schemaQuality.hasSchema) {
            score -= 40;
            components.push({
                name: 'Schema Markup',
                score: 0,
                maxScore: 40,
                status: 'critical',
                issues: ['No structured data found - critical for AI understanding']
            });
        } else {
            const schemaScore = Math.round((data.schemaQuality.score / 100) * 40);
            score -= (40 - schemaScore);
            components.push({
                name: 'Schema Quality',
                score: schemaScore,
                maxScore: 40,
                status: schemaScore >= 30 ? 'good' : schemaScore >= 20 ? 'warning' : 'critical',
                issues: data.schemaQuality.issues || []
            });
        }
    } else if (data.schemas.length === 0) {
        score -= 40;
        components.push({
            name: 'Schema Markup',
            score: 0,
            maxScore: 40,
            status: 'critical',
            issues: ['No structured data found']
        });
    }

    // Q&A matching (20 points)
    if (data.semanticFlags?.noDirectQnAMatching) {
        score -= 20;
        components.push({
            name: 'Question Answering',
            score: 0,
            maxScore: 20,
            status: 'warning',
            issues: ['Content does not directly answer common questions']
        });
    } else {
        components.push({
            name: 'Question Answering',
            score: 20,
            maxScore: 20,
            status: 'good'
        });
    }

    // Entity density (15 points)
    if (data.semanticFlags?.lowEntityDensity) {
        score -= 15;
        components.push({
            name: 'Entity Density',
            score: 0,
            maxScore: 15,
            status: 'warning',
            issues: ['Low density of named entities and specific facts']
        });
    } else {
        components.push({
            name: 'Entity Density',
            score: 15,
            maxScore: 15,
            status: 'good'
        });
    }

    // Formatting and conciseness (15 points)
    if (data.semanticFlags?.poorFormattingConciseness) {
        score -= 15;
        components.push({
            name: 'Formatting',
            score: 0,
            maxScore: 15,
            status: 'warning',
            issues: ['Poor formatting or lack of conciseness']
        });
    } else {
        components.push({
            name: 'Formatting',
            score: 15,
            maxScore: 15,
            status: 'good'
        });
    }

    // Definition statements (10 points)
    if (data.semanticFlags?.lackOfDefinitionStatements) {
        score -= 10;
        components.push({
            name: 'Definitions',
            score: 0,
            maxScore: 10,
            status: 'warning',
            issues: ['Missing clear definition statements']
        });
    } else {
        components.push({
            name: 'Definitions',
            score: 10,
            maxScore: 10,
            status: 'good'
        });
    }

    const breakdown: CategoryScore[] = [{
        name: 'AEO Readiness',
        score: Math.max(0, score),
        maxScore: 100,
        percentage: Math.max(0, score),
        components
    }];

    return {
        score: Math.max(0, score),
        breakdown
    };
}

/**
 * Calculate GEO score based on AI perception factors
 */
function calculateGEOScore(data: any): { score: number; breakdown: CategoryScore[] } {
    let score = 100;
    const components: ComponentResult[] = [];

    // Image alt text coverage (25 points)
    if (data.structuralData?.media?.totalImages > 0) {
        const altCoverage = data.structuralData.media.imagesWithAlt / data.structuralData.media.totalImages;
        if (altCoverage < 0.5) {
            score -= 25;
            components.push({
                name: 'Image Accessibility',
                score: 0,
                maxScore: 25,
                status: 'critical',
                issues: [`Only ${Math.round(altCoverage * 100)}% of images have alt text - AI cannot understand images`]
            });
        } else if (altCoverage < 0.9) {
            const partialScore = Math.round(altCoverage * 25);
            score -= (25 - partialScore);
            components.push({
                name: 'Image Accessibility',
                score: partialScore,
                maxScore: 25,
                status: 'warning',
                issues: [`${Math.round(altCoverage * 100)}% alt text coverage - aim for 100%`]
            });
        } else {
            components.push({
                name: 'Image Accessibility',
                score: 25,
                maxScore: 25,
                status: 'good'
            });
        }
    } else {
        components.push({
            name: 'Image Accessibility',
            score: 25,
            maxScore: 25,
            status: 'good'
        });
    }

    // Promotional tone (20 points)
    if (data.semanticFlags?.promotionalTone) {
        score -= 20;
        components.push({
            name: 'Tone',
            score: 0,
            maxScore: 20,
            status: 'warning',
            issues: ['Overly promotional tone reduces AI trust']
        });
    } else {
        components.push({
            name: 'Tone',
            score: 20,
            maxScore: 20,
            status: 'good'
        });
    }

    // Expertise signals (20 points)
    if (data.semanticFlags?.lackOfExpertiseSignals) {
        score -= 20;
        components.push({
            name: 'Expertise',
            score: 0,
            maxScore: 20,
            status: 'warning',
            issues: ['Missing expertise signals and credentials']
        });
    } else {
        components.push({
            name: 'Expertise',
            score: 20,
            maxScore: 20,
            status: 'good'
        });
    }

    // Hard data and facts (15 points)
    if (data.semanticFlags?.lackOfHardData) {
        score -= 15;
        components.push({
            name: 'Data & Facts',
            score: 0,
            maxScore: 15,
            status: 'warning',
            issues: ['Lacks specific data, statistics, and facts']
        });
    } else {
        components.push({
            name: 'Data & Facts',
            score: 15,
            maxScore: 15,
            status: 'good'
        });
    }

    // First person usage (10 points)
    if (data.semanticFlags?.heavyFirstPersonUsage) {
        score -= 10;
        components.push({
            name: 'Objectivity',
            score: 0,
            maxScore: 10,
            status: 'warning',
            issues: ['Heavy first-person usage reduces perceived objectivity']
        });
    } else {
        components.push({
            name: 'Objectivity',
            score: 10,
            maxScore: 10,
            status: 'good'
        });
    }

    // Unsubstantiated claims (10 points)
    if (data.semanticFlags?.unsubstantiatedClaims) {
        score -= 10;
        components.push({
            name: 'Claims',
            score: 0,
            maxScore: 10,
            status: 'warning',
            issues: ['Contains unsubstantiated claims']
        });
    } else {
        components.push({
            name: 'Claims',
            score: 10,
            maxScore: 10,
            status: 'good'
        });
    }

    const breakdown: CategoryScore[] = [{
        name: 'GEO Visibility',
        score: Math.max(0, score),
        maxScore: 100,
        percentage: Math.max(0, score),
        components
    }];

    return {
        score: Math.max(0, score),
        breakdown
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
