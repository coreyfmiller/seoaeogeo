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
                score: 0,
                maxScore: 40,
                status: 'critical',
                feedback: 'Schema Markup',
                issues: ['No structured data found - critical for AI understanding']
            });
        } else {
            const schemaScore = Math.round((data.schemaQuality.score / 100) * 40);
            score -= (40 - schemaScore);
            components.push({
                score: schemaScore,
                maxScore: 40,
                status: schemaScore >= 30 ? 'good' : schemaScore >= 20 ? 'warning' : 'critical',
                feedback: 'Schema Quality',
                issues: data.schemaQuality.issues || []
            });
        }
    } else if (data.schemas.length === 0) {
        score -= 40;
        components.push({
            score: 0,
            maxScore: 40,
            status: 'critical',
            feedback: 'Schema Markup',
            issues: ['No structured data found']
        });
    }

    // Q&A matching (20 points)
    if (data.semanticFlags?.noDirectQnAMatching) {
        score -= 20;
        components.push({
            score: 0,
            maxScore: 20,
            status: 'warning',
            feedback: 'Question Answering',
            issues: ['Content does not directly answer common questions']
        });
    } else {
        components.push({
            score: 20,
            maxScore: 20,
            status: 'good',
            feedback: 'Question Answering'
        });
    }

    // Entity density (15 points)
    if (data.semanticFlags?.lowEntityDensity) {
        score -= 15;
        components.push({
            score: 0,
            maxScore: 15,
            status: 'warning',
            feedback: 'Entity Density',
            issues: ['Low density of named entities and specific facts']
        });
    } else {
        components.push({
            score: 15,
            maxScore: 15,
            status: 'good',
            feedback: 'Entity Density'
        });
    }

    // Formatting and conciseness (15 points)
    if (data.semanticFlags?.poorFormattingConciseness) {
        score -= 15;
        components.push({
            score: 0,
            maxScore: 15,
            status: 'warning',
            feedback: 'Formatting',
            issues: ['Poor formatting or lack of conciseness']
        });
    } else {
        components.push({
            score: 15,
            maxScore: 15,
            status: 'good',
            feedback: 'Formatting'
        });
    }

    // Definition statements (10 points)
    if (data.semanticFlags?.lackOfDefinitionStatements) {
        score -= 10;
        components.push({
            score: 0,
            maxScore: 10,
            status: 'warning',
            feedback: 'Definitions',
            issues: ['Missing clear definition statements']
        });
    } else {
        components.push({
            score: 10,
            maxScore: 10,
            status: 'good',
            feedback: 'Definitions'
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

    // Promotional tone (20 points)
    if (data.semanticFlags?.promotionalTone) {
        score -= 20;
        components.push({
            score: 0,
            maxScore: 20,
            status: 'warning',
            feedback: 'Tone',
            issues: ['Overly promotional tone reduces AI trust']
        });
    } else {
        components.push({
            score: 20,
            maxScore: 20,
            status: 'good',
            feedback: 'Tone'
        });
    }

    // Expertise signals (20 points)
    if (data.semanticFlags?.lackOfExpertiseSignals) {
        score -= 20;
        components.push({
            score: 0,
            maxScore: 20,
            status: 'warning',
            feedback: 'Expertise',
            issues: ['Missing expertise signals and credentials']
        });
    } else {
        components.push({
            score: 20,
            maxScore: 20,
            status: 'good',
            feedback: 'Expertise'
        });
    }

    // Hard data and facts (15 points)
    if (data.semanticFlags?.lackOfHardData) {
        score -= 15;
        components.push({
            score: 0,
            maxScore: 15,
            status: 'warning',
            feedback: 'Data & Facts',
            issues: ['Lacks specific data, statistics, and facts']
        });
    } else {
        components.push({
            score: 15,
            maxScore: 15,
            status: 'good',
            feedback: 'Data & Facts'
        });
    }

    // First person usage (10 points)
    if (data.semanticFlags?.heavyFirstPersonUsage) {
        score -= 10;
        components.push({
            score: 0,
            maxScore: 10,
            status: 'warning',
            feedback: 'Objectivity',
            issues: ['Heavy first-person usage reduces perceived objectivity']
        });
    } else {
        components.push({
            score: 10,
            maxScore: 10,
            status: 'good',
            feedback: 'Objectivity'
        });
    }

    // Unsubstantiated claims (10 points)
    if (data.semanticFlags?.unsubstantiatedClaims) {
        score -= 10;
        components.push({
            score: 0,
            maxScore: 10,
            status: 'warning',
            feedback: 'Claims',
            issues: ['Contains unsubstantiated claims']
        });
    } else {
        components.push({
            score: 10,
            maxScore: 10,
            status: 'good',
            feedback: 'Claims'
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
    geoBreakdown: CategoryScore[]
): EnhancedPenalty[] {
    const penalties: EnhancedPenalty[] = [];
    
    // Process SEO penalties
    for (const category of seoBreakdown) {
        for (const component of category.components) {
            const pointsLost = component.maxScore - component.score;
            if (pointsLost > 0) {
                // If there are explicit issues, use them
                const issueText = component.issues && component.issues.length > 0 
                    ? component.issues[0]
                    : `Lost ${pointsLost} points in ${component.feedback}`;
                    
                penalties.push({
                    category: 'SEO',
                    component: `SEO ${category.name} - ${component.feedback}`,
                    penalty: issueText,
                    explanation: getExplanation('SEO', component.feedback, issueText),
                    fix: getFix('SEO', component.feedback, issueText),
                    pointsDeducted: -pointsLost,
                    severity: component.status === 'critical' ? 'critical' : component.status === 'warning' ? 'warning' : 'info'
                });
            }
        }
    }
    
    // Process AEO penalties
    for (const category of aeoBreakdown) {
        for (const component of category.components) {
            const pointsLost = component.maxScore - component.score;
            if (pointsLost > 0) {
                const issueText = component.issues && component.issues.length > 0 
                    ? component.issues[0]
                    : `Lost ${pointsLost} points in ${component.feedback}`;
                    
                penalties.push({
                    category: 'AEO',
                    component: `AEO ${category.name} - ${component.feedback}`,
                    penalty: issueText,
                    explanation: getExplanation('AEO', component.feedback, issueText),
                    fix: getFix('AEO', component.feedback, issueText),
                    pointsDeducted: -pointsLost,
                    severity: component.status === 'critical' ? 'critical' : component.status === 'warning' ? 'warning' : 'info'
                });
            }
        }
    }
    
    // Process GEO penalties
    for (const category of geoBreakdown) {
        for (const component of category.components) {
            const pointsLost = component.maxScore - component.score;
            if (pointsLost > 0) {
                const issueText = component.issues && component.issues.length > 0 
                    ? component.issues[0]
                    : `Lost ${pointsLost} points in ${component.feedback}`;
                    
                penalties.push({
                    category: 'GEO',
                    component: `GEO ${category.name} - ${component.feedback}`,
                    penalty: issueText,
                    explanation: getExplanation('GEO', component.feedback, issueText),
                    fix: getFix('GEO', component.feedback, issueText),
                    pointsDeducted: -pointsLost,
                    severity: component.status === 'critical' ? 'critical' : component.status === 'warning' ? 'warning' : 'info'
                });
            }
        }
    }
    
    // Sort by severity and points lost
    return penalties.sort((a, b) => {
        // Critical first, then warning, then info
        if (a.severity !== b.severity) {
            const severityOrder = { critical: 0, warning: 1, info: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        }
        // Then by points lost (most first)
        return a.pointsDeducted - b.pointsDeducted;
    });
}

/**
 * Get detailed explanation for a penalty
 */
function getExplanation(category: string, component: string, issue: string): string {
    const explanations: Record<string, string> = {
        // SEO Explanations
        'Title Tag': 'Title tags are the first thing users see in search results and are a critical ranking factor. Search engines use them to understand page content.',
        'Meta Description': 'Meta descriptions appear in search results and influence click-through rates. While not a direct ranking factor, they significantly impact organic traffic.',
        'H1 Heading': 'H1 tags tell search engines and users what the page is about. Missing or multiple H1s confuse crawlers and hurt rankings.',
        'HTTPS': 'HTTPS is a confirmed ranking signal. Sites without SSL certificates are marked "Not Secure" in browsers, hurting trust and rankings.',
        'Mobile Responsive': 'Google uses mobile-first indexing. Sites that aren\'t mobile-friendly are penalized in mobile search results.',
        'Word Count': 'Thin content (under 300 words) rarely ranks. Search engines prefer comprehensive content that thoroughly covers topics.',
        'Readability': 'Content that\'s hard to read gets lower engagement metrics (time on page, bounce rate), which negatively impacts rankings.',
        'Internal Links': 'Internal linking distributes page authority and helps search engines discover and understand your site structure.',
        'Images': 'Images without alt text are invisible to search engines and screen readers, hurting both SEO and accessibility.',
        'Performance': 'Page speed is a confirmed ranking factor. Slow sites have higher bounce rates and lower rankings.',
        'Semantic HTML': 'Semantic tags (main, article, nav) help search engines understand page structure and content hierarchy.',
        'URL Structure': 'Clean, descriptive URLs help both users and search engines understand page content before visiting.',
        'Schema Markup (SEO)': 'Structured data helps search engines understand your content and can trigger rich results in search.',
        'External Links': 'Linking to authoritative sources signals that your content is well-researched and trustworthy.',
        'Content Freshness': 'Regularly updated content signals that your site is active and relevant, which can boost rankings.',
        
        // AEO Explanations
        'Schema Markup (AEO)': 'AI systems rely heavily on structured data to understand and cite content. Without schema, your content is invisible to AI.',
        'Schema Quality': 'Incomplete or incorrect schema markup confuses AI systems and prevents them from citing your content accurately.',
        'Question Answering': 'AI systems prioritize content that directly answers questions. Content without clear Q&A patterns gets ignored.',
        'Entity Density': 'AI systems look for specific entities (people, places, things, concepts). Low entity density suggests vague, unhelpful content.',
        'Formatting': 'AI systems prefer well-formatted, concise content. Walls of text or poor structure make content hard to parse and cite.',
        'Definitions': 'Clear definition statements help AI systems understand and explain concepts. Missing definitions reduce citation likelihood.',
        
        // GEO Explanations
        'Image Accessibility': 'AI systems cannot "see" images without alt text. Missing alt text creates blind spots in AI understanding of your content.',
        'Tone': 'Overly promotional content is flagged as biased by AI systems. Neutral, informative tone increases trust and citation likelihood.',
        'Expertise': 'AI systems look for expertise signals (credentials, experience, data). Content without these signals is considered less authoritative.',
        'Data & Facts': 'AI systems prioritize content with specific data, statistics, and facts. Vague claims without evidence are ignored.',
        'Objectivity': 'Heavy first-person usage suggests opinion rather than fact. AI systems prefer objective, third-person content for citations.',
        'Claims': 'Unsubstantiated claims reduce content credibility. AI systems require evidence and sources to consider content trustworthy.',
    };
    
    return explanations[component] || 'This issue impacts how search engines and AI systems understand and rank your content.';
}

/**
 * Get actionable fix for a penalty
 */
function getFix(category: string, component: string, issue: string): string {
    const fixes: Record<string, string> = {
        // SEO Fixes
        'Title Tag': 'Add a unique, descriptive title tag (50-60 characters) that includes your primary keyword near the beginning. Format: "Primary Keyword - Secondary Keyword | Brand"',
        'Meta Description': 'Write a compelling meta description (120-160 characters) that includes your primary keyword and a clear call-to-action. Make it unique for each page.',
        'H1 Heading': 'Add exactly one H1 tag per page that clearly describes the page content. Include your primary keyword naturally. Use H2-H6 for subheadings.',
        'HTTPS': 'Install an SSL certificate (free via Let\'s Encrypt or your hosting provider). Update all internal links to use https://. Set up 301 redirects from http to https.',
        'Mobile Responsive': 'Use responsive CSS (media queries) or a mobile-first framework. Test on real devices. Ensure text is readable without zooming and buttons are tap-friendly.',
        'Word Count': 'Expand content to at least 800 words. Add sections covering: what, why, how, benefits, examples, and FAQs. Focus on depth over length.',
        'Readability': 'Break up long paragraphs (3-4 sentences max). Use bullet points, subheadings, and short sentences. Aim for 8th-grade reading level or lower.',
        'Internal Links': 'Add 3-5 contextual internal links to related pages. Use descriptive anchor text (not "click here"). Link to both deeper pages and category pages.',
        'Images': 'Add descriptive alt text to all images. Format: "what the image shows + context". Example: "blue running shoes on wooden floor in gym"',
        'Performance': 'Optimize images (use WebP, compress to <100KB). Minify CSS/JS. Enable browser caching. Use a CDN. Aim for <2 second load time.',
        'Semantic HTML': 'Wrap main content in <main>, navigation in <nav>, articles in <article>. Use <aside> for sidebars. This helps crawlers understand page structure.',
        'URL Structure': 'Use clean URLs with hyphens: /category/product-name instead of /page?id=123. Keep URLs under 60 characters. Include primary keyword.',
        'Schema Markup': 'Add JSON-LD schema to <head>. Minimum: Organization schema with name, logo, url. For articles: add Article schema with headline, author, datePublished.',
        'External Links': 'Link to 2-3 authoritative sources (Wikipedia, .gov, .edu, industry leaders). Use rel="noopener" for security. Open in new tab.',
        'Content Freshness': 'Add "Last Updated" date. Update content quarterly. Add new sections, examples, or data. Update statistics and remove outdated information.',
        
        // AEO Fixes
        'Schema Markup (AEO)': 'Add JSON-LD schema to <head>. Start with Organization schema. For content pages, add Article, FAQPage, or HowTo schema as appropriate.',
        'Schema Quality': 'Validate schema at schema.org/validator. Fix all errors. Add required properties: name, description, image, url. Remove placeholder data.',
        'Question Answering': 'Add FAQ section with 5-10 common questions. Use <h3> for questions, <p> for answers. Start answers with direct responses (Yes/No, specific number).',
        'Entity Density': 'Add specific names, numbers, dates, and locations. Replace vague terms ("many", "some") with exact figures. Link to Wikipedia for key entities.',
        'Formatting': 'Use bullet points for lists. Keep paragraphs to 3-4 sentences. Add subheadings every 200-300 words. Use bold for key terms (sparingly).',
        'Definitions': 'Start with a clear definition: "X is [category] that [key characteristic]". Example: "SEO is a marketing strategy that improves website visibility in search results."',
        
        // GEO Fixes
        'Image Accessibility': 'Add alt text to all images. Be specific and descriptive. Include context and relevant keywords naturally. Format: "what + where + why"',
        'Tone': 'Remove promotional language ("best", "amazing", "revolutionary"). Use neutral, factual tone. Replace "we offer" with "this includes". Focus on information, not selling.',
        'Expertise': 'Add author bio with credentials. Include "About the Author" section. Link to LinkedIn/professional profiles. Cite experience and qualifications.',
        'Data & Facts': 'Add specific statistics, percentages, and numbers. Cite sources for all data. Include dates for time-sensitive information. Use "According to [source]" format.',
        'Objectivity': 'Replace first-person ("I think", "we believe") with third-person or passive voice. Use "research shows" instead of "I found". Focus on facts, not opinions.',
        'Claims': 'Add citations for all claims. Link to studies, reports, or authoritative sources. Use footnotes or inline citations. Format: "According to [Source], [claim]."',
    };
    
    return fixes[component] || 'Review and update this element following current best practices for search engines and AI systems.';
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
