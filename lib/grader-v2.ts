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
    siteType?: SiteType;
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

    const finalScore = Math.min(Math.round(totalScore), 100);

    return {
        score: finalScore,
        breakdown: categoryScores
    };
}

/**
 * Wrapper function to adapt ScanResult to V2 grader format
 */
export function calculateScoresFromScanResult(scanResult: any) {
    return calculateScoresV2(
        scanResult.structuralData,
        scanResult.schemas || [],
        scanResult.semanticFlags || {},
        scanResult.title?.length || 0,
        scanResult.description?.length || 0,
        scanResult.url,
        scanResult.title || '',
        scanResult.description || '',
        scanResult.schemaQuality,
        scanResult.technical?.responseTimeMs,
        scanResult.siteType
    );
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
    const overallFeedback = generateOverallFeedback(seoResult.score, criticalIssues.length, siteType);

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
        version: 'v2',
        siteType
    };
}

/**
 * Normalize a semantic flag value to 0-100 severity score.
 * Handles both legacy boolean format and new graduated 0-100 format.
 */
function normalizeFlagSeverity(value: any): number {
    if (typeof value === 'boolean') return value ? 100 : 0;
    if (typeof value === 'number') return Math.max(0, Math.min(100, value));
    return 0;
}

/**
 * Calculate graduated penalty from a 0-100 severity score.
 * Returns points to deduct (0 to maxPoints).
 */
function graduatedPenalty(severity: number, maxPoints: number): number {
    return Math.round((severity / 100) * maxPoints);
}

/**
 * Calculate AEO score based on semantic flags and schema quality
 */
function calculateAEOScore(data: any): { score: number; breakdown: CategoryScore[] } {
    console.log('[Grader V2] Calculating AEO score...')
    console.log('[Grader V2] Word count:', data.structuralData?.wordCount)
    console.log('[Grader V2] Semantic flags:', JSON.stringify(data.semanticFlags, null, 2))
    
    let score = 100;
    const components: ComponentResult[] = [];

    // Content depth (20 points)
    const wordCount = data.structuralData?.wordCount || 0;
    if (wordCount < 300) {
        score -= 20;
        components.push({
            score: 0,
            maxScore: 20,
            status: 'critical',
            feedback: 'Content Depth',
            issues: [`Only ${wordCount} words - thin content is invisible to AI (need 800+ words)`]
        });
    } else if (wordCount < 800) {
        const partialScore = Math.round((wordCount / 800) * 20);
        score -= (20 - partialScore);
        components.push({
            score: partialScore,
            maxScore: 20,
            status: 'warning',
            feedback: 'Content Depth',
            issues: [`${wordCount} words - aim for 800+ for comprehensive coverage`]
        });
    } else {
        components.push({
            score: 20,
            maxScore: 20,
            status: 'good',
            feedback: 'Content Depth'
        });
    }

    // Schema presence and quality (30 points)
    if (data.schemaQuality) {
        if (!data.schemaQuality.hasSchema) {
            score -= 30;
            components.push({
                score: 0,
                maxScore: 30,
                status: 'critical',
                feedback: 'Schema Markup',
                issues: ['No structured data found - critical for AI understanding']
            });
        } else {
            const schemaScore = Math.round((data.schemaQuality.score / 100) * 30);
            score -= (30 - schemaScore);
            components.push({
                score: schemaScore,
                maxScore: 30,
                status: schemaScore >= 22 ? 'good' : schemaScore >= 15 ? 'warning' : 'critical',
                feedback: 'Schema Quality',
                issues: data.schemaQuality.issues || []
            });
        }
    } else if (data.schemas?.length === 0 || !data.schemas) {
        score -= 30;
        components.push({
            score: 0,
            maxScore: 30,
            status: 'critical',
            feedback: 'Schema Markup',
            issues: ['No structured data found']
        });
    }

    // Q&A matching (20 points) - graduated
    const qnaSeverity = normalizeFlagSeverity(data.semanticFlags?.noDirectQnAMatching);
    const qnaPenalty = graduatedPenalty(qnaSeverity, 20);
    score -= qnaPenalty;
    components.push({
        score: 20 - qnaPenalty,
        maxScore: 20,
        status: qnaPenalty >= 15 ? 'warning' : qnaPenalty >= 8 ? 'warning' : 'good',
        feedback: 'Question Answering',
        issues: qnaPenalty > 0 ? [`Q&A coverage needs improvement (severity: ${qnaSeverity}/100)`] : undefined
    });

    // Entity density (15 points) - graduated
    const entitySeverity = normalizeFlagSeverity(data.semanticFlags?.lowEntityDensity);
    const entityPenalty = graduatedPenalty(entitySeverity, 15);
    score -= entityPenalty;
    components.push({
        score: 15 - entityPenalty,
        maxScore: 15,
        status: entityPenalty >= 10 ? 'warning' : entityPenalty >= 5 ? 'warning' : 'good',
        feedback: 'Entity Density',
        issues: entityPenalty > 0 ? [`Low density of named entities and specific facts (severity: ${entitySeverity}/100)`] : undefined
    });

    // Formatting and conciseness (15 points) - graduated
    const formatSeverity = normalizeFlagSeverity(data.semanticFlags?.poorFormattingConciseness);
    const formatPenalty = graduatedPenalty(formatSeverity, 15);
    score -= formatPenalty;
    components.push({
        score: 15 - formatPenalty,
        maxScore: 15,
        status: formatPenalty >= 10 ? 'warning' : formatPenalty >= 5 ? 'warning' : 'good',
        feedback: 'Formatting',
        issues: formatPenalty > 0 ? [`Formatting needs improvement (severity: ${formatSeverity}/100)`] : undefined
    });

    // Definition statements (10 points) - graduated
    const defSeverity = normalizeFlagSeverity(data.semanticFlags?.lackOfDefinitionStatements);
    const defPenalty = graduatedPenalty(defSeverity, 10);
    score -= defPenalty;
    components.push({
        score: 10 - defPenalty,
        maxScore: 10,
        status: defPenalty >= 7 ? 'warning' : defPenalty >= 3 ? 'warning' : 'good',
        feedback: 'Definitions',
        issues: defPenalty > 0 ? [`Missing clear definition statements (severity: ${defSeverity}/100)`] : undefined
    });

    // Floor boost: if raw score < 50, ensure minimum of 10
    let finalAeoScore = Math.min(Math.max(0, score), 100);
    if (finalAeoScore < 50) {
        finalAeoScore = Math.max(finalAeoScore, 10);
    }

    const breakdown: CategoryScore[] = [{
        name: 'AEO Readiness',
        score: finalAeoScore,
        maxScore: 100,
        percentage: finalAeoScore,
        components
    }];

    return {
        score: finalAeoScore,
        breakdown
    };
}

/**
 * Calculate GEO score based on AI perception factors
 */
function calculateGEOScore(data: any): { score: number; breakdown: CategoryScore[] } {
    let score = 100;
    const components: ComponentResult[] = [];

    // Image alt text coverage (25 points) - deterministic, no change needed
    if (data.structuralData?.media?.totalImages > 0) {
        const altCoverage = data.structuralData.media.imagesWithAlt / data.structuralData.media.totalImages;
        if (altCoverage < 0.5) {
            score -= 25;
            components.push({
                score: 0,
                maxScore: 25,
                status: 'critical',
                feedback: 'Image Accessibility',
                issues: [`Only ${Math.round(altCoverage * 100)}% of images have alt text - AI cannot understand images`]
            });
        } else if (altCoverage < 0.9) {
            const partialScore = Math.round(altCoverage * 25);
            score -= (25 - partialScore);
            components.push({
                score: partialScore,
                maxScore: 25,
                status: 'warning',
                feedback: 'Image Accessibility',
                issues: [`${Math.round(altCoverage * 100)}% alt text coverage - aim for 100%`]
            });
        } else {
            components.push({
                score: 25,
                maxScore: 25,
                status: 'good',
                feedback: 'Image Accessibility'
            });
        }
    } else {
        components.push({
            score: 25,
            maxScore: 25,
            status: 'good',
            feedback: 'Image Accessibility'
        });
    }

    // Promotional tone (20 points) - graduated
    const promoSeverity = normalizeFlagSeverity(data.semanticFlags?.promotionalTone);
    const promoPenalty = graduatedPenalty(promoSeverity, 20);
    score -= promoPenalty;
    components.push({
        score: 20 - promoPenalty,
        maxScore: 20,
        status: promoPenalty >= 14 ? 'warning' : promoPenalty >= 6 ? 'warning' : 'good',
        feedback: 'Tone',
        issues: promoPenalty > 0 ? [`Promotional tone detected (severity: ${promoSeverity}/100)`] : undefined
    });

    // Expertise signals (20 points) - graduated
    const expertSeverity = normalizeFlagSeverity(data.semanticFlags?.lackOfExpertiseSignals);
    const expertPenalty = graduatedPenalty(expertSeverity, 20);
    score -= expertPenalty;
    components.push({
        score: 20 - expertPenalty,
        maxScore: 20,
        status: expertPenalty >= 14 ? 'warning' : expertPenalty >= 6 ? 'warning' : 'good',
        feedback: 'Expertise',
        issues: expertPenalty > 0 ? [`Missing expertise signals (severity: ${expertSeverity}/100)`] : undefined
    });

    // Hard data and facts (15 points) - graduated
    const dataSeverity = normalizeFlagSeverity(data.semanticFlags?.lackOfHardData);
    const dataPenalty = graduatedPenalty(dataSeverity, 15);
    score -= dataPenalty;
    components.push({
        score: 15 - dataPenalty,
        maxScore: 15,
        status: dataPenalty >= 10 ? 'warning' : dataPenalty >= 5 ? 'warning' : 'good',
        feedback: 'Data & Facts',
        issues: dataPenalty > 0 ? [`Lacks specific data and statistics (severity: ${dataSeverity}/100)`] : undefined
    });

    // First person usage (10 points) - graduated
    const fpSeverity = normalizeFlagSeverity(data.semanticFlags?.heavyFirstPersonUsage);
    const fpPenalty = graduatedPenalty(fpSeverity, 10);
    score -= fpPenalty;
    components.push({
        score: 10 - fpPenalty,
        maxScore: 10,
        status: fpPenalty >= 7 ? 'warning' : fpPenalty >= 3 ? 'warning' : 'good',
        feedback: 'Objectivity',
        issues: fpPenalty > 0 ? [`First-person usage detected (severity: ${fpSeverity}/100)`] : undefined
    });

    // Unsubstantiated claims (10 points) - graduated
    const claimsSeverity = normalizeFlagSeverity(data.semanticFlags?.unsubstantiatedClaims);
    const claimsPenalty = graduatedPenalty(claimsSeverity, 10);
    score -= claimsPenalty;
    components.push({
        score: 10 - claimsPenalty,
        maxScore: 10,
        status: claimsPenalty >= 7 ? 'warning' : claimsPenalty >= 3 ? 'warning' : 'good',
        feedback: 'Claims',
        issues: claimsPenalty > 0 ? [`Unsubstantiated claims detected (severity: ${claimsSeverity}/100)`] : undefined
    });

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
function generateOverallFeedback(score: number, criticalIssueCount: number, siteType?: SiteType): string {
    const siteTypeLabel = siteType ? ` for a ${formatSiteType(siteType)}` : '';
    
    if (score >= 90) {
        return `Exceptional SEO${siteTypeLabel} - Your site follows modern best practices and is well-optimized for search engines.`;
    }
    
    if (score >= 75) {
        return `Good SEO foundation${siteTypeLabel} - Your site has solid optimization with room for minor improvements.`;
    }
    
    if (score >= 60) {
        return `Average SEO${siteTypeLabel} - Basic elements are in place, but significant improvements are needed to compete effectively.`;
    }
    
    if (score >= 40) {
        return `Poor SEO${siteTypeLabel} - Major issues are holding your site back. Focus on addressing critical problems first.`;
    }
    
    if (score >= 20) {
        return `Critical SEO issues${siteTypeLabel} - Your site has fundamental problems that severely impact search visibility.`;
    }
    
    return `Severe SEO problems${siteTypeLabel} - Your site is not properly optimized for search engines and needs immediate attention.`;
}

function formatSiteType(siteType: SiteType): string {
    const formatMap: Record<SiteType, string> = {
        'e-commerce': 'e-commerce site',
        'local-business': 'local business',
        'blog': 'blog/content site',
        'saas': 'SaaS product',
        'portfolio': 'portfolio site',
        'restaurant': 'restaurant',
        'contractor': 'contractor/service provider',
        'professional-services': 'professional services firm',
        'news-media': 'news/media site',
        'educational': 'educational site',
        'general': 'website'
    };
    
    return formatMap[siteType] || 'website';
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
 * Enhanced penalty with explanation and fix
 */
export interface EnhancedPenalty {
    category: 'SEO' | 'AEO' | 'GEO';
    component: string;
    penalty: string;
    explanation: string;
    fix: string;
    pointsDeducted: number;
    severity: 'critical' | 'warning' | 'info';
}

/**
 * Convert V2 breakdown to enhanced penalty ledger with explanations and fixes
 */
export function convertBreakdownToEnhancedPenalties(
    seoBreakdown: CategoryScore[],
    aeoBreakdown: CategoryScore[],
    geoBreakdown: CategoryScore[],
    platform?: string
): EnhancedPenalty[] {
    const penalties: EnhancedPenalty[] = [];
    const plat = platform || 'custom';

    const processBreakdown = (breakdown: CategoryScore[], cat: 'SEO' | 'AEO' | 'GEO') => {
        for (const category of breakdown) {
            for (const component of category.components) {
                const pointsLost = component.maxScore - component.score;
                if (pointsLost > 0) {
                    const issueText = component.issues && component.issues.length > 0
                        ? component.issues[0]
                        : `Lost ${pointsLost} points in ${component.feedback}`;
                    const key = resolveComponentKey(component.feedback, cat);
                    penalties.push({
                        category: cat,
                        component: `${cat} ${category.name} - ${component.feedback}`,
                        penalty: issueText,
                        explanation: getExplanation(key, cat),
                        fix: getFix(key, cat, plat),
                        pointsDeducted: -pointsLost,
                        severity: component.status === 'critical' ? 'critical' : component.status === 'warning' ? 'warning' : 'info'
                    });
                }
            }
        }
    };

    processBreakdown(seoBreakdown, 'SEO');
    processBreakdown(aeoBreakdown, 'AEO');
    processBreakdown(geoBreakdown, 'GEO');

    return penalties.sort((a, b) => {
        if (a.severity !== b.severity) {
            const severityOrder = { critical: 0, warning: 1, info: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return a.pointsDeducted - b.pointsDeducted;
    });
}


/**
 * Resolve a feedback string from scoring components to a canonical component key.
 * SEO components use descriptive feedback like "Missing title tag - critical SEO issue"
 * while AEO/GEO use clean names like "Content Depth". This maps both to canonical keys.
 */
function resolveComponentKey(feedback: string, category: string): string {
    const fb = feedback.toLowerCase();

    // SEO keyword matching (scoring-components.ts uses descriptive feedback strings)
    if (fb.includes('title')) return 'title';
    if (fb.includes('meta description')) return 'meta_description';
    if (fb.includes('h1')) return 'h1';
    if (fb.includes('https') || fb.includes('ssl')) return 'https';
    if (fb.includes('viewport') || fb.includes('mobile')) return 'viewport';
    if (fb.includes('thin content') || fb.includes('content') && fb.includes('word')) return 'word_count';
    if (fb.includes('readability') || fb.includes('insufficient content to evaluate')) return 'readability';
    if (fb.includes('internal link')) return 'internal_links';
    if (fb.includes('alt text') || fb.includes('image')) return 'images';
    if (fb.includes('performance') || fb.includes('load time') || fb.includes('slow')) return 'performance';
    if (fb.includes('semantic')) return 'semantic_html';
    if (fb.includes('url') || fb.includes('session')) return 'url_structure';
    if (fb.includes('schema')) return 'schema';
    if (fb.includes('external link') || fb.includes('authority')) return 'external_links';
    if (fb.includes('freshness') || fb.includes('updated')) return 'content_freshness';

    // AEO clean name matching
    if (fb === 'content depth') return 'content_depth';
    if (fb === 'schema markup' || fb === 'schema quality') return 'schema';
    if (fb === 'question answering') return 'question_answering';
    if (fb === 'entity density') return 'entity_density';
    if (fb === 'formatting') return 'formatting';
    if (fb === 'definitions') return 'definitions';

    // GEO clean name matching
    if (fb === 'image accessibility') return 'image_accessibility';
    if (fb === 'tone') return 'tone';
    if (fb === 'expertise') return 'expertise';
    if (fb === 'data & facts') return 'data_facts';
    if (fb === 'objectivity') return 'objectivity';
    if (fb === 'claims') return 'claims';

    return 'unknown';
}

/**
 * Get detailed, specific explanation for why a penalty matters
 */
function getExplanation(key: string, category: string): string {
    const explanations: Record<string, string> = {
        // SEO
        title: 'Title tags are the single most important on-page SEO element. They appear as the clickable headline in search results and browser tabs. Google uses them as a primary ranking signal to understand what your page is about. A missing or poorly optimized title means search engines cannot properly index your page, and users have no reason to click your result.',
        meta_description: 'Meta descriptions appear as the snippet text below your title in search results. While not a direct ranking factor, they are the primary driver of click-through rate (CTR). A compelling meta description can increase clicks by 5-10%. Without one, Google auto-generates a snippet that may not represent your page well, leading to lower CTR and fewer visitors.',
        h1: 'The H1 tag is the main heading of your page and tells both users and search engines what the page is about. Google uses H1 as a strong relevance signal. Missing H1 means crawlers cannot determine your page topic. Multiple H1s dilute the signal and confuse the content hierarchy. This directly impacts your ability to rank for target keywords.',
        https: 'HTTPS is a confirmed Google ranking signal since 2014. Sites without SSL are marked "Not Secure" in Chrome and other browsers, which destroys user trust. HTTPS also protects user data in transit. Google has stated that HTTPS is a lightweight ranking factor, but the trust impact on users is massive — 85% of users will not continue browsing on an insecure site.',
        viewport: 'Google uses mobile-first indexing, meaning it primarily uses the mobile version of your site for ranking. Without a viewport meta tag, your site renders at desktop width on mobile devices, making text unreadable and buttons untappable. This results in a poor mobile experience, higher bounce rates, and significantly lower rankings in mobile search results, which account for over 60% of all searches.',
        word_count: 'Content depth is a strong ranking signal. Pages with fewer than 300 words are considered "thin content" by search engines and rarely rank for competitive terms. Studies show that top-ranking pages average 1,400+ words. Thin content also provides insufficient material for AI systems like ChatGPT and Perplexity to cite, making your page invisible in AI-generated answers.',
        readability: 'Content readability directly impacts user engagement metrics that Google tracks — time on page, bounce rate, and scroll depth. Hard-to-read content causes users to leave quickly, sending negative signals to search engines. The average web reader reads at an 8th-grade level. Content written above this level loses a significant portion of your potential audience.',
        internal_links: 'Internal links are how search engines discover and understand your site architecture. They distribute "link equity" (ranking power) across your pages. Pages with no internal links are orphaned — search engines may never find them. Good internal linking also keeps users on your site longer, reducing bounce rate and increasing the chance of conversion.',
        images: 'Images without alt text are completely invisible to search engines and screen readers. Google Image Search drives 22% of all web searches. Missing alt text means you lose this traffic entirely. Alt text also provides context to search engines about your page content, and is legally required for accessibility compliance (WCAG 2.1 AA).',
        performance: 'Page speed is a confirmed Google ranking factor (Core Web Vitals). Pages that take longer than 3 seconds to load lose 53% of mobile visitors. Slow sites have higher bounce rates, lower conversion rates, and worse rankings. Google specifically measures Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS).',
        semantic_html: 'Semantic HTML5 tags (<main>, <nav>, <article>, <header>, <footer>) help search engines understand your page structure and content hierarchy. Without them, crawlers see a flat document with no structural meaning. Semantic markup also improves accessibility for screen readers and can influence how Google generates featured snippets.',
        url_structure: 'Clean, descriptive URLs help both users and search engines understand page content before visiting. URLs with excessive parameters, session IDs, or random strings look spammy and reduce click-through rates. Google has confirmed that words in URLs are a minor ranking factor. Clean URLs are also easier to share and link to.',
        schema: category === 'AEO'
            ? 'Structured data (schema.org markup) is how AI systems like ChatGPT, Gemini, and Perplexity understand your content programmatically. Without schema, AI cannot reliably parse your page type, author, dates, or key facts. Sites with proper schema are 2-3x more likely to be cited in AI-generated answers. Schema also enables rich results in Google (stars, FAQs, breadcrumbs).'
            : 'Structured data (schema.org markup) helps search engines understand your content beyond plain text. It enables rich results in Google — star ratings, FAQ dropdowns, breadcrumbs, product prices — which dramatically increase click-through rates. Pages with rich results get 58% more clicks than standard results.',
        external_links: 'Linking to authoritative external sources signals to search engines that your content is well-researched and trustworthy. Pages that cite credible sources rank higher because they demonstrate expertise and provide additional value. Not linking out can make your content appear isolated and less credible.',
        content_freshness: 'Google uses content freshness as a ranking signal, especially for time-sensitive queries. Outdated content with old statistics or broken references loses rankings over time. Regularly updated content signals that your site is active and authoritative. Adding "Last Updated" dates also builds user trust.',

        // AEO
        content_depth: 'AI systems like ChatGPT, Gemini, and Perplexity need substantial, well-structured content to cite and reference. Pages with fewer than 300 words provide insufficient material for AI to extract meaningful answers. When users ask AI assistants questions, the AI looks for comprehensive pages that thoroughly cover the topic. Thin content is essentially invisible to AI search.',
        question_answering: 'AI systems are fundamentally designed to answer questions. They actively seek content that directly addresses common queries in a clear Q&A format. Pages without explicit question-answer patterns get bypassed in favor of pages that do. Adding FAQ sections and direct-answer paragraphs dramatically increases your chances of being cited in AI responses.',
        entity_density: 'AI systems identify and index specific entities — people, places, organizations, products, dates, and statistics. Content with low entity density (vague language like "many years" or "some people") gives AI nothing concrete to reference. High entity density makes your content a reliable source of specific, citable facts.',
        formatting: 'AI systems parse content structure to extract relevant information. Walls of text, inconsistent formatting, and poor hierarchy make it harder for AI to identify key points. Well-formatted content with clear headings, bullet points, and concise paragraphs is significantly easier for AI to process, understand, and cite.',
        definitions: 'AI systems frequently need to define concepts for users. Content that starts with clear, concise definitions (e.g., "SEO is a marketing strategy that...") is highly likely to be pulled directly into AI responses. Missing definitions force AI to look elsewhere for explanations, reducing your citation likelihood.',

        // GEO
        image_accessibility: 'AI systems cannot interpret images without alt text. Every image missing alt text is a blind spot in AI understanding of your content. Alt text provides the textual context AI needs to understand visual content. This is also critical for accessibility — screen readers rely entirely on alt text to describe images to visually impaired users.',
        tone: 'AI systems are trained to identify and deprioritize promotional or biased content. Overly sales-oriented language ("best in class", "amazing results", "revolutionary") triggers bias detection, causing AI to prefer more neutral, informative sources. Factual, balanced tone increases trust scores and citation likelihood across all major AI platforms.',
        expertise: 'AI systems evaluate E-E-A-T signals (Experience, Expertise, Authoritativeness, Trust) to determine source credibility. Content without author credentials, professional experience, or expertise indicators is considered less authoritative. Adding author bios, credentials, and experience signals significantly increases the likelihood of AI citation.',
        data_facts: 'AI systems prioritize content with specific, verifiable data — statistics, percentages, dates, measurements, and cited research. Vague claims without supporting evidence are deprioritized. Content rich in specific data points becomes a preferred citation source because AI can confidently reference concrete facts.',
        objectivity: 'Heavy first-person usage ("I think", "we believe", "in my opinion") signals subjective opinion rather than objective fact. AI systems prefer third-person, evidence-based content for citations because it appears more authoritative and unbiased. Reducing first-person language and replacing opinions with data-backed statements improves AI citation rates.',
        claims: 'Unsubstantiated claims are a red flag for AI credibility assessment. Every claim without a citation, source, or supporting evidence reduces your content trustworthiness score. AI systems cross-reference claims against known facts — unsupported statements cause your entire page to be rated as less reliable.',
    };

    return explanations[key] || `This issue impacts how search engines and AI systems understand and rank your content. The ${category} scoring system detected a problem that reduces your visibility.`;
}

/**
 * Platform-specific fix instructions for each component.
 * Returns comprehensive, actionable steps tailored to the detected platform.
 */
function getFix(key: string, category: string, platform: string): string {
    const plat = platform.toLowerCase();

    // Platform-specific prefixes for common operations
    const platformTips: Record<string, Record<string, string>> = {
        wordpress: {
            title: 'In WordPress: Go to Pages/Posts > Edit > scroll to "SEO" section (Yoast/RankMath). Enter your title in the "SEO Title" field. If no SEO plugin: install Yoast SEO or RankMath (free). Alternatively, edit the <title> in your theme\'s header.php or use the wp_title filter.',
            meta_description: 'In WordPress: Use Yoast SEO or RankMath plugin > Edit page > "SEO" meta box > "Meta Description" field. Without a plugin: add to functions.php or use "All in One SEO" plugin. Each page needs a unique description.',
            h1: 'In WordPress: The page/post title automatically becomes the H1. If missing, check your theme — some themes use <div> instead of <h1> for titles. Edit in Appearance > Theme Editor > single.php/page.php. Ensure only one <h1> exists per page.',
            https: 'In WordPress: 1) Get SSL from your host (most offer free Let\'s Encrypt). 2) Install "Really Simple SSL" plugin — it handles redirects automatically. 3) Update WordPress Address and Site Address in Settings > General to https://. 4) Run "Better Search Replace" plugin to update all http:// URLs in your database.',
            viewport: 'In WordPress: Most modern themes include viewport meta. If missing, add to your theme\'s header.php inside <head>: <meta name="viewport" content="width=device-width, initial-scale=1">. Better: switch to a responsive theme (Astra, GeneratePress, Kadence). Check with Theme > Customize > verify mobile preview.',
            schema: 'In WordPress: Install "Schema Pro" or "Yoast SEO" (both add JSON-LD automatically). For manual control: use "WP Schema Plugin" or add JSON-LD to header.php. Minimum: Organization + WebPage schema. For blog posts: Article schema with author, datePublished, headline.',
            images: 'In WordPress: Go to Media Library > click each image > fill in "Alt Text" field. For bulk editing: use "Auto Image Alt Text" plugin. When uploading new images, always fill the alt text field. Format: descriptive text of what the image shows.',
            performance: 'In WordPress: 1) Install WP Rocket or LiteSpeed Cache for caching. 2) Use ShortPixel or Imagify for image compression. 3) Install Autoptimize to minify CSS/JS. 4) Use a CDN (Cloudflare free tier). 5) Remove unused plugins. Target: <2s load time.',
            internal_links: 'In WordPress: Use "Link Whisper" plugin for AI-suggested internal links. Manually: when editing a post, highlight text > click link icon > search for related posts. Add "Related Posts" section using Yoast or a related posts plugin. Aim for 3-5 contextual links per page.',
            word_count: 'In WordPress: Edit the page/post and expand the content. Use the block editor to add sections: Introduction, Main Content (with H2 subheadings), FAQ section (use the FAQ block), and Conclusion. Aim for 800+ words. Use Yoast\'s content analysis to track word count.',
        },
        shopify: {
            title: 'In Shopify: Go to the page/product > scroll to "Search engine listing preview" > click "Edit website SEO" > enter your title in "Page title". For the homepage: Online Store > Preferences > "Homepage title". Keep it 50-60 characters with your primary keyword first.',
            meta_description: 'In Shopify: Edit any page/product > "Search engine listing preview" > "Edit website SEO" > "Meta description" field. For homepage: Online Store > Preferences > "Homepage meta description". Write 120-160 characters with a clear call-to-action.',
            h1: 'In Shopify: The page/product title is automatically the H1. If you need to change it without affecting the visible title, edit your theme\'s Liquid template. Go to Online Store > Themes > Edit Code > find the relevant template (product.liquid, page.liquid) and ensure there\'s exactly one <h1> tag.',
            https: 'Shopify includes SSL/HTTPS automatically for all stores — no action needed. If you\'re seeing HTTP issues, go to Online Store > Domains and ensure your primary domain has "SSL certificate" showing as active. Force HTTPS redirect is enabled by default.',
            viewport: 'Shopify themes include viewport meta by default. If missing, go to Online Store > Themes > Edit Code > theme.liquid > add inside <head>: <meta name="viewport" content="width=device-width, initial-scale=1">. All official Shopify themes are mobile-responsive.',
            schema: 'In Shopify: Install "JSON-LD for SEO" app (by Ilana Davis) or "Smart SEO" app. These automatically add Product, Organization, BreadcrumbList, and Article schema. For manual: edit theme.liquid to add JSON-LD scripts. Product pages should have Product schema with price, availability, reviews.',
            images: 'In Shopify: Go to Products > edit product > click each image > fill "Alt text" field. For pages: edit the page > click images in the content editor > add alt text. For theme images: Online Store > Themes > Customize > click image sections > fill alt text.',
            performance: 'In Shopify: 1) Compress images before uploading (use TinyPNG). 2) Remove unused apps — each adds JavaScript. 3) Use Shopify\'s built-in lazy loading. 4) Minimize custom Liquid code. 5) Use system fonts instead of custom fonts. 6) Enable Shopify\'s built-in CDN (automatic).',
        },
        wix: {
            title: 'In Wix: Click the page in the editor > "Page SEO (Google)" or go to Site Dashboard > Marketing & SEO > SEO Tools > click the page > "SEO Basics" tab > "Title tag". Keep it 50-60 characters. For the homepage: same process, select the Home page.',
            meta_description: 'In Wix: Site Dashboard > Marketing & SEO > SEO Tools > select page > "SEO Basics" > "Meta description". Or in the editor: click page > "Page SEO (Google)" > "What\'s this page about?". Write 120-160 characters.',
            h1: 'In Wix: The main heading you add to your page becomes the H1. In the editor, click your main title text > change the style to "Heading 1" in the text settings. Ensure only one Heading 1 exists per page. Other headings should be Heading 2-6.',
            viewport: 'Wix automatically handles viewport and mobile responsiveness. Use the mobile editor (phone icon in the editor) to verify your mobile layout. Adjust element positions and sizes for mobile view. Wix sites are responsive by default.',
            schema: 'In Wix: Go to Marketing & SEO > SEO Tools > select page > "Advanced SEO" tab > "Structured Data Markup". Add JSON-LD code here. Wix also auto-generates some schema. For more control, use Wix\'s "Structured Data" feature or add custom code via "Custom Code" in site settings.',
            images: 'In Wix: Click any image in the editor > "Settings" icon > fill in the "Alt text" field. For gallery images: click gallery > "Manage Media" > click each image > add alt text. Describe what the image shows specifically.',
            performance: 'In Wix: 1) Compress images before uploading. 2) Reduce the number of elements on each page. 3) Remove unused apps. 4) Use Wix\'s built-in image optimization. 5) Minimize animations and videos. 6) Wix handles CDN and caching automatically.',
        },
        squarespace: {
            title: 'In Squarespace: Edit page > Settings (gear icon) > "SEO" tab > "SEO Title". For the homepage: Home > Settings > SEO. If the SEO title is empty, Squarespace uses the page title. Keep it 50-60 characters with your primary keyword.',
            meta_description: 'In Squarespace: Edit page > Settings (gear icon) > "SEO" tab > "SEO Description". Write 120-160 characters. For site-wide default: Settings > SEO > "SEO Description". Each page should have a unique description.',
            h1: 'In Squarespace: The page title or first heading block is typically the H1. In the editor, add a "Text" block and set it to "Heading 1" format. Check your template — some Squarespace templates use the page title as H1 automatically. Ensure only one H1 per page.',
            schema: 'In Squarespace: Go to Settings > Advanced > Code Injection > "Header" section. Paste your JSON-LD schema code here. Squarespace auto-generates basic schema for products and blog posts. For custom schema, use the code injection feature. Validate at schema.org/validator.',
            images: 'In Squarespace: Click any image > "Edit" > "Image" tab > fill in the "Alt Text" field (under "Filename"). For gallery images: click gallery > edit each image > add alt text. For background images: section settings > "Alt Text" field.',
            performance: 'In Squarespace: 1) Use "Image Loader" setting (Settings > Design > Image Loading) set to "Lazy". 2) Compress images before uploading. 3) Minimize custom CSS/JavaScript. 4) Reduce page sections. Squarespace handles CDN, caching, and minification automatically.',
        },
        webflow: {
            title: 'In Webflow: Select the page in the Pages panel > Settings tab > "SEO Title". Use dynamic fields for CMS pages: click the purple dot to bind to a CMS field. Keep it 50-60 characters. For the homepage: select Home page > Settings > SEO Title.',
            meta_description: 'In Webflow: Pages panel > select page > Settings > "SEO Meta Description". For CMS pages, bind to a CMS field for dynamic descriptions. Write 120-160 characters per page.',
            h1: 'In Webflow: Select your main heading element > in the Settings panel (right side), change the tag from "Heading" to "H1" if needed. Check the HTML tag dropdown. Ensure only one H1 per page. Use H2-H6 for subheadings in the hierarchy.',
            schema: 'In Webflow: Go to Pages > page settings > "Custom Code" > "Inside <head> tag". Paste JSON-LD schema here. For site-wide schema: Project Settings > Custom Code > "Head Code". Webflow doesn\'t auto-generate schema, so you need to add it manually or use a third-party tool like Schema App.',
            images: 'In Webflow: Select any image element > Settings panel (right side) > "Alt Text" field. For background images: you\'ll need to add aria-label to the div. For CMS images: bind alt text to a CMS text field. Always describe what the image shows.',
            performance: 'In Webflow: 1) Enable "Lazy Load" on images (element settings > Loading > Lazy). 2) Use WebP format for images. 3) Minimize interactions and animations. 4) Reduce custom code. 5) Webflow handles CDN, minification, and caching automatically. 6) Use Webflow\'s built-in image compression.',
        },
        nextjs: {
            title: 'In Next.js: Use the Metadata API. In your page.tsx/page.js, export a metadata object: export const metadata = { title: "Your Title Here" }. For dynamic titles, use generateMetadata(). For the app router, this goes in layout.tsx or page.tsx. For pages router, use <Head> from next/head.',
            meta_description: 'In Next.js: Add to your metadata export: export const metadata = { title: "...", description: "Your 120-160 char description" }. For dynamic pages, use generateMetadata() async function. For pages router: <Head><meta name="description" content="..." /></Head>.',
            h1: 'In Next.js: Add an <h1> tag in your page component JSX. Ensure only one <h1> per page. Example: <h1 className="text-3xl font-bold">Your Page Title</h1>. Check that layout components don\'t add additional H1s.',
            schema: 'In Next.js: Add JSON-LD in your page component using a <script> tag: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />. Or use the next-seo package for structured schema helpers. Place in your page.tsx or layout.tsx.',
            performance: 'In Next.js: 1) Use next/image for automatic image optimization. 2) Enable ISR or SSG for static pages. 3) Use dynamic imports for heavy components: dynamic(() => import("./Heavy")). 4) Analyze bundle with @next/bundle-analyzer. 5) Use next/font for font optimization. 6) Enable compression in next.config.js.',
        },
        gatsby: {
            title: 'In Gatsby: Use gatsby-plugin-react-helmet or the Head API (Gatsby 4.19+). In your page component: export const Head = () => <title>Your Title</title>. Or with Helmet: <Helmet><title>Your Title</title></Helmet>. For dynamic pages, pass title via pageContext.',
            meta_description: 'In Gatsby: Using Head API: export const Head = () => (<><title>...</title><meta name="description" content="Your description" /></>). Or with gatsby-plugin-react-helmet: <Helmet><meta name="description" content="..." /></Helmet>.',
            schema: 'In Gatsby: Add JSON-LD using the Head API or gatsby-plugin-react-helmet. Install gatsby-plugin-schema-snapshot for automatic schema. Or manually add <script type="application/ld+json"> in your Head export. Use gatsby-plugin-sitemap for additional SEO.',
        },
        drupal: {
            title: 'In Drupal: Install the "Metatag" module (drupal.org/project/metatag). Go to Configuration > Search and metadata > Metatag. Set title patterns per content type. For individual pages: edit the node > "Meta tags" fieldset > "Page title". Use token replacements like [node:title].',
            meta_description: 'In Drupal: With Metatag module installed: edit any node > "Meta tags" section > "Description" field. For defaults: Configuration > Metatag > edit content type defaults. Use [node:summary] token for automatic descriptions from the body summary.',
            schema: 'In Drupal: Install the "Schema.org Metatag" module (drupal.org/project/schema_metatag). Configure at Configuration > Search and metadata > Metatag. This adds JSON-LD automatically based on content type. For custom schema, use the "JSON-LD" module.',
        },
    };

    // Generic (non-platform-specific) comprehensive fixes
    const genericFixes: Record<string, string> = {
        title: 'Add a <title> tag inside your <head> section. Keep it 50-60 characters. Include your primary keyword near the beginning. Format: "Primary Keyword - Secondary Info | Brand Name". Make each page title unique. Example: <title>Best Running Shoes for Beginners - 2026 Guide | YourBrand</title>',
        meta_description: 'Add a <meta name="description" content="..."> tag inside <head>. Write 120-160 characters that summarize the page and include a call-to-action. Include your primary keyword naturally. Make it unique per page. Example: <meta name="description" content="Find the best running shoes for beginners. Compare top brands, read expert reviews, and get fitted today. Free shipping available.">',
        h1: 'Add exactly one <h1> tag per page containing your main topic keyword. Place it at the top of your main content area. Use H2-H6 for subheadings to create a clear hierarchy. Example: <h1>Best Running Shoes for Beginners in 2026</h1>. Never use more than one H1 — it confuses search engines about your page topic.',
        https: 'Install an SSL certificate: 1) Check if your host offers free SSL (most do via Let\'s Encrypt). 2) Enable SSL in your hosting control panel. 3) Update your site URL to https://. 4) Set up 301 redirects from http:// to https://. 5) Update all internal links to use https://. 6) Update your sitemap and Google Search Console.',
        viewport: 'Add this tag inside your <head> section: <meta name="viewport" content="width=device-width, initial-scale=1">. This tells mobile browsers to render the page at the device width instead of a desktop viewport. Then ensure your CSS uses responsive design: use relative units (%, rem, vw), media queries, and flexible layouts. Test on real mobile devices.',
        word_count: 'Expand your content to at least 800 words. Add these sections: 1) Introduction explaining the topic. 2) Main content with H2 subheadings covering different aspects. 3) Step-by-step instructions or how-to guide. 4) Benefits or advantages section. 5) FAQ section with 5-10 common questions and direct answers. 6) Conclusion with next steps. Focus on providing genuine value, not padding.',
        readability: 'Improve readability: 1) Keep paragraphs to 3-4 sentences max. 2) Use bullet points and numbered lists for steps or features. 3) Add subheadings (H2, H3) every 200-300 words. 4) Use short sentences (under 20 words). 5) Write at an 8th-grade reading level — use simple words. 6) Bold key terms sparingly for scanning. 7) Use transition words between paragraphs.',
        internal_links: 'Add 3-5 contextual internal links per page: 1) Link to related content pages using descriptive anchor text (not "click here"). 2) Link to category/pillar pages from detail pages. 3) Add a "Related Articles" or "You May Also Like" section. 4) Use breadcrumb navigation. 5) Ensure every important page is reachable within 3 clicks from the homepage.',
        images: 'Add descriptive alt text to every image: 1) Describe what the image shows specifically. 2) Include relevant keywords naturally. 3) Keep alt text under 125 characters. 4) Format: "[subject] [action/context] [location/setting]". Example: alt="woman running in blue Nike shoes on a forest trail". 5) For decorative images, use alt="" (empty). 6) Never start with "image of" or "picture of".',
        performance: 'Improve page speed: 1) Compress images to WebP format, keep under 100KB each. 2) Minify CSS and JavaScript files. 3) Enable browser caching with proper Cache-Control headers. 4) Use a CDN (Cloudflare free tier works well). 5) Defer non-critical JavaScript with async/defer attributes. 6) Reduce server response time to under 200ms. 7) Remove unused CSS/JS. Target: under 2 second total load time.',
        semantic_html: 'Add HTML5 semantic tags to your page structure: 1) Wrap your main content in <main>. 2) Use <nav> for navigation menus. 3) Wrap blog posts/articles in <article>. 4) Use <header> for page/section headers. 5) Use <footer> for page/section footers. 6) Use <aside> for sidebars and related content. 7) Use <section> to group related content with headings.',
        url_structure: 'Clean up your URLs: 1) Use hyphens to separate words: /running-shoes-guide instead of /running_shoes_guide. 2) Keep URLs under 60 characters. 3) Include your primary keyword. 4) Remove unnecessary parameters (?id=123&session=abc). 5) Use lowercase only. 6) Avoid stop words (the, and, of). Example: /best-running-shoes-beginners instead of /page?cat=shoes&id=42.',
        schema: category === 'AEO'
            ? 'Add JSON-LD structured data to help AI systems understand your content: 1) Add Organization schema with name, logo, url, sameAs (social profiles). 2) For articles: add Article schema with headline, author, datePublished, dateModified, image. 3) For products: add Product schema with name, price, availability, reviews. 4) For FAQs: add FAQPage schema with question/answer pairs. 5) Validate at search.google.com/test/rich-results. Place the <script type="application/ld+json"> tag in your <head> section.'
            : 'Add JSON-LD structured data inside <head>: 1) Start with Organization schema: {"@context":"https://schema.org","@type":"Organization","name":"...","url":"...","logo":"..."}. 2) Add WebPage schema for each page. 3) For blog posts: Article schema with headline, author, datePublished. 4) For products: Product schema with price, availability. 5) For FAQs: FAQPage schema. 6) Validate at search.google.com/test/rich-results.',
        external_links: 'Add 2-3 outbound links to authoritative sources: 1) Link to .gov, .edu, Wikipedia, or recognized industry leaders. 2) Use descriptive anchor text that tells users what they\'ll find. 3) Add rel="noopener noreferrer" and target="_blank" for security. 4) Only link to relevant, high-quality sources. 5) Avoid linking to competitors\' product pages.',
        content_freshness: 'Keep content current: 1) Add a visible "Last Updated: [date]" near the top of the page. 2) Review and update content quarterly. 3) Replace outdated statistics with current data. 4) Add new sections covering recent developments. 5) Fix broken links. 6) Update screenshots and examples. 7) Add a dateModified property to your Article schema.',

        // AEO-specific
        content_depth: 'Expand content for AI visibility: 1) Write at least 800 words of substantive content. 2) Structure with clear H2/H3 subheadings. 3) Add a "What is [topic]?" definition section. 4) Include a "How does [topic] work?" explanation. 5) Add a "Benefits of [topic]" section. 6) Create an FAQ with 5-10 questions and direct answers. 7) Include specific examples, data, and case studies. AI systems need comprehensive content to cite.',
        question_answering: 'Add Q&A content that AI can cite: 1) Create an FAQ section with 5-10 common questions. 2) Use <h3> or <h2> for each question. 3) Start each answer with a direct response (yes/no, a number, a definition). 4) Keep answers concise (2-4 sentences for the direct answer, then expand). 5) Add FAQPage schema markup. 6) Use question formats like "What is...", "How do I...", "Why does...".',
        entity_density: 'Increase entity density for AI: 1) Replace vague terms with specifics — "many years" becomes "since 2008", "some people" becomes "42% of users". 2) Name specific products, people, places, and organizations. 3) Include exact dates, prices, measurements, and statistics. 4) Link to Wikipedia for key entities. 5) Use proper nouns instead of pronouns where possible.',
        formatting: 'Improve content formatting for AI parsing: 1) Break paragraphs to 3-4 sentences max. 2) Use bullet points for lists of items or features. 3) Use numbered lists for sequential steps. 4) Add H2/H3 subheadings every 200-300 words. 5) Bold key terms and definitions (sparingly). 6) Use tables for comparative data. 7) Keep sentences under 20 words.',
        definitions: 'Add clear definitions AI can extract: 1) Start your content with a clear definition: "[Topic] is [category] that [key characteristic]." 2) Example: "SEO is a digital marketing strategy that improves website visibility in search engine results." 3) Define technical terms when first used. 4) Use "is defined as", "refers to", or "means" for clarity. 5) Add a glossary section for pages with many technical terms.',

        // GEO-specific
        image_accessibility: 'Fix image accessibility for AI and users: 1) Add alt text to every image — describe what it shows specifically. 2) Include context: "chef preparing sushi in a Tokyo restaurant kitchen" not just "food". 3) For infographics, describe the key data points in alt text. 4) For decorative images, use alt="" (empty string). 5) Keep alt text under 125 characters. 6) Never use "image of" or "photo of" as a prefix.',
        tone: 'Reduce promotional tone for AI trust: 1) Remove superlatives: "best", "amazing", "revolutionary", "world-class". 2) Replace "we offer the best" with "this service includes". 3) Use factual statements instead of claims: "serves 10,000 customers" not "loved by everyone". 4) Write in third person where possible. 5) Let data and facts speak instead of adjectives. 6) Focus on informing, not selling.',
        expertise: 'Add expertise signals for AI credibility: 1) Add an "About the Author" section with credentials, experience, and qualifications. 2) Link to the author\'s LinkedIn or professional profile. 3) Mention relevant certifications, degrees, or years of experience. 4) Include "Reviewed by [Expert Name], [Credentials]" for medical/legal/financial content. 5) Add author schema markup with sameAs links.',
        data_facts: 'Add specific data for AI citation: 1) Include exact statistics: "increased by 47%" not "increased significantly". 2) Cite sources: "According to [Source Name] (2025)..." 3) Add dates to time-sensitive data. 4) Use specific numbers: "$2.4 million" not "millions of dollars". 5) Include research findings with study names. 6) Add a "Sources" or "References" section at the bottom.',
        objectivity: 'Improve objectivity for AI trust: 1) Replace "I think" with "research indicates" or "data shows". 2) Replace "we believe" with "evidence suggests". 3) Use third-person perspective: "users report" instead of "we found". 4) Support opinions with data: "this approach is effective, as shown by a 34% improvement in [study]". 5) Present multiple viewpoints on debatable topics.',
        claims: 'Substantiate all claims for AI credibility: 1) Add inline citations: "According to [Source], [claim]." 2) Link to studies, reports, or authoritative sources for every factual claim. 3) Use footnotes or a references section. 4) Replace unsupported claims with data-backed statements. 5) Remove claims you cannot verify. 6) Use hedging language for uncertain claims: "research suggests" rather than "this proves".',
    };

    // Try platform-specific fix first, fall back to generic
    const platformFix = platformTips[plat]?.[key];
    const genericFix = genericFixes[key];

    if (platformFix && genericFix) {
        return `${platformFix}\n\nGeneral best practice: ${genericFix}`;
    }

    return genericFix || platformFix || `Review and address this ${category} issue. Check your page source code and update the relevant element following current best practices. If you are unsure how to fix this on your platform, search for "[your platform name] + ${key.replace(/_/g, ' ')}" for specific tutorials.`;
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
