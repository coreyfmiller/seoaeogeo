/**
 * Grader Aggregator - Run Grader V2 on multiple pages and aggregate results
 * Used by Deep Crawler to get consistent per-page scores
 */

import { calculateScoresV2, type GraderV2Result } from './grader-v2';
import type { PageScan } from './crawler-deep';

export interface PageWithScores extends PageScan {
    graderScores: {
        seo: number;
        aeo: number;
        geo: number;
    };
    graderBreakdown: GraderV2Result['breakdown'];
    criticalIssues: string[];
}

export interface AggregatedScores {
    seo: number;
    aeo: number;
    geo: number;
    averages: {
        seo: number;
        aeo: number;
        geo: number;
    };
    median: {
        seo: number;
        aeo: number;
        geo: number;
    };
    range: {
        seo: { min: number; max: number };
        aeo: { min: number; max: number };
        geo: { min: number; max: number };
    };
}

/**
 * Run Grader V2 on a single page
 */
export function scorePageWithGraderV2(page: PageScan): PageWithScores {
    // Prepare structural data from page scan
    const structuralData = {
        hasH1: page.hasH1,
        h1Count: page.hasH1 ? 1 : 0,
        h2Count: page.h2Count,
        h3Count: page.h3Count,
        wordCount: page.wordCount,
        internalLinks: page.internalLinks,
        externalLinks: page.externalLinks,
        imgTotal: page.imgTotal,
        imgWithAlt: page.imgWithAlt,
        isHttps: page.isHttps,
    };

    // Run Grader V2
    const graderResult = calculateScoresV2(
        structuralData,
        page.schemas,
        {}, // semanticFlags - not available in deep scan
        page.title.length,
        page.description.length,
        page.url,
        page.title,
        page.description,
        undefined, // schemaQuality - will be calculated by grader
        page.responseTimeMs
    );

    return {
        ...page,
        graderScores: {
            seo: graderResult.seoScore,
            aeo: graderResult.aeoScore,
            geo: graderResult.geoScore,
        },
        graderBreakdown: graderResult.breakdown,
        criticalIssues: graderResult.criticalIssues,
    };
}

/**
 * Score all pages and aggregate results
 */
export function scoreAndAggregatePages(pages: PageScan[]): {
    pagesWithScores: PageWithScores[];
    aggregated: AggregatedScores;
} {
    if (pages.length === 0) {
        return {
            pagesWithScores: [],
            aggregated: {
                seo: 0,
                aeo: 0,
                geo: 0,
                averages: { seo: 0, aeo: 0, geo: 0 },
                median: { seo: 0, aeo: 0, geo: 0 },
                range: {
                    seo: { min: 0, max: 0 },
                    aeo: { min: 0, max: 0 },
                    geo: { min: 0, max: 0 },
                },
            },
        };
    }

    // Score each page
    const pagesWithScores = pages.map(page => scorePageWithGraderV2(page));

    // Extract scores
    const seoScores = pagesWithScores.map(p => p.graderScores.seo);
    const aeoScores = pagesWithScores.map(p => p.graderScores.aeo);
    const geoScores = pagesWithScores.map(p => p.graderScores.geo);

    // Calculate statistics
    const aggregated: AggregatedScores = {
        // Weighted average (homepage gets 2x weight)
        seo: calculateWeightedAverage(seoScores),
        aeo: calculateWeightedAverage(aeoScores),
        geo: calculateWeightedAverage(geoScores),
        
        // Simple averages
        averages: {
            seo: Math.round(average(seoScores)),
            aeo: Math.round(average(aeoScores)),
            geo: Math.round(average(geoScores)),
        },
        
        // Medians
        median: {
            seo: Math.round(median(seoScores)),
            aeo: Math.round(median(aeoScores)),
            geo: Math.round(median(geoScores)),
        },
        
        // Ranges
        range: {
            seo: { min: Math.min(...seoScores), max: Math.max(...seoScores) },
            aeo: { min: Math.min(...aeoScores), max: Math.max(...aeoScores) },
            geo: { min: Math.min(...geoScores), max: Math.max(...geoScores) },
        },
    };

    return {
        pagesWithScores,
        aggregated,
    };
}

/**
 * Calculate weighted average (homepage gets 2x weight)
 */
function calculateWeightedAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    if (scores.length === 1) return Math.round(scores[0]);
    
    // Homepage (first page) gets 2x weight
    const homepageWeight = 2;
    const otherWeight = 1;
    
    const homepageScore = scores[0] * homepageWeight;
    const otherScores = scores.slice(1).reduce((sum, score) => sum + (score * otherWeight), 0);
    const totalWeight = homepageWeight + (scores.length - 1) * otherWeight;
    
    return Math.round((homepageScore + otherScores) / totalWeight);
}

/**
 * Calculate average
 */
function average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Calculate median
 */
function median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}
