/**
 * Component-based scoring system for SEO/AEO/GEO
 * Each component has a max score and evaluation criteria
 */

import type { SiteType } from "./types/audit";
import { getPenaltyWeight } from "./scoring-config-site-types";

export interface ScoreComponent {
    name: string;
    maxPoints: number;
    description: string;
    evaluate: (data: any) => ComponentResult;
}

export interface ComponentResult {
    score: number;
    maxScore: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    feedback: string;
    issues?: string[];
}

export interface ComponentCategory {
    name: string;
    maxPoints: number;
    components: ScoreComponent[];
}

// ============================================================================
// SEO COMPONENTS (100 points total)
// ============================================================================

export const SEO_FOUNDATION_COMPONENTS: ScoreComponent[] = [
    {
        name: "Title Tag Optimization",
        maxPoints: 10,
        description: "Title tag exists, optimal length (30-60 chars), and descriptive",
        evaluate: (data) => {
            const { titleLength, title } = data;
            
            if (titleLength === 0) {
                return {
                    score: 0,
                    maxScore: 10,
                    status: 'critical',
                    feedback: "Missing title tag - critical SEO issue",
                    issues: ["No title tag found"]
                };
            }
            
            if (titleLength < 30) {
                return {
                    score: 5,
                    maxScore: 10,
                    status: 'warning',
                    feedback: "Title tag too short - should be 30-60 characters",
                    issues: [`Title is only ${titleLength} characters`]
                };
            }
            
            if (titleLength > 60) {
                return {
                    score: 7,
                    maxScore: 10,
                    status: 'warning',
                    feedback: "Title tag too long - may be truncated in search results",
                    issues: [`Title is ${titleLength} characters (recommended: 30-60)`]
                };
            }
            
            return {
                score: 10,
                maxScore: 10,
                status: 'excellent',
                feedback: "Title tag is well-optimized"
            };
        }
    },
    {
        name: "Meta Description",
        maxPoints: 8,
        description: "Meta description exists and is optimal length (120-160 chars)",
        evaluate: (data) => {
            const { descriptionLength } = data;
            
            if (descriptionLength === 0) {
                return {
                    score: 0,
                    maxScore: 8,
                    status: 'critical',
                    feedback: "Missing meta description",
                    issues: ["No meta description found"]
                };
            }
            
            if (descriptionLength < 50) {
                return {
                    score: 3,
                    maxScore: 8,
                    status: 'warning',
                    feedback: "Meta description too short",
                    issues: [`Only ${descriptionLength} characters (recommended: 120-160)`]
                };
            }
            
            if (descriptionLength > 160) {
                return {
                    score: 6,
                    maxScore: 8,
                    status: 'warning',
                    feedback: "Meta description too long - may be truncated",
                    issues: [`${descriptionLength} characters (recommended: 120-160)`]
                };
            }
            
            return {
                score: 8,
                maxScore: 8,
                status: 'excellent',
                feedback: "Meta description is well-optimized"
            };
        }
    },
    {
        name: "H1 Heading",
        maxPoints: 8,
        description: "Single H1 tag present and descriptive",
        evaluate: (data) => {
            const { h1Count } = data.structuralData?.semanticTags || {};
            
            if (h1Count === 0) {
                return {
                    score: 0,
                    maxScore: 8,
                    status: 'critical',
                    feedback: "Missing H1 heading",
                    issues: ["No H1 tag found on page"]
                };
            }
            
            if (h1Count > 1) {
                return {
                    score: 5,
                    maxScore: 8,
                    status: 'warning',
                    feedback: "Multiple H1 tags found",
                    issues: [`${h1Count} H1 tags found (should be exactly 1)`]
                };
            }
            
            return {
                score: 8,
                maxScore: 8,
                status: 'excellent',
                feedback: "H1 heading is properly implemented"
            };
        }
    },
    {
        name: "HTTPS Security",
        maxPoints: 7,
        description: "Site uses HTTPS protocol",
        evaluate: (data) => {
            const { url } = data;
            const isHttps = url?.startsWith('https://');
            
            if (!isHttps) {
                return {
                    score: 0,
                    maxScore: 7,
                    status: 'critical',
                    feedback: "Site not using HTTPS - major security and SEO issue",
                    issues: ["HTTPS not enabled"]
                };
            }
            
            return {
                score: 7,
                maxScore: 7,
                status: 'excellent',
                feedback: "HTTPS properly configured"
            };
        }
    },
    {
        name: "Mobile Responsiveness",
        maxPoints: 7,
        description: "Site is mobile-friendly (viewport meta tag present)",
        evaluate: (data) => {
            const { hasViewport } = data.structuralData || {};
            
            if (!hasViewport) {
                return {
                    score: 0,
                    maxScore: 7,
                    status: 'critical',
                    feedback: "Missing viewport meta tag - not mobile optimized",
                    issues: ["No viewport meta tag found"]
                };
            }
            
            return {
                score: 7,
                maxScore: 7,
                status: 'excellent',
                feedback: "Mobile viewport configured"
            };
        }
    }
];

export const SEO_CONTENT_COMPONENTS: ScoreComponent[] = [
    {
        name: "Content Depth",
        maxPoints: 15,
        description: "Adequate word count for topic coverage",
        evaluate: (data) => {
            const { wordCount } = data.structuralData || {};
            const siteType = data.siteType || 'general';
            
            // Get site-type-specific weight for thin content penalty
            const penaltyWeight = getPenaltyWeight(siteType, 'thinContent');
            
            if (wordCount < 300) {
                // Apply site-type-specific penalty
                const basePenalty = 15;
                const adjustedPenalty = Math.round(basePenalty * penaltyWeight);
                const adjustedScore = 15 - adjustedPenalty;
                
                return {
                    score: Math.max(0, adjustedScore),
                    maxScore: 15,
                    status: adjustedPenalty >= 12 ? 'critical' : 'warning',
                    feedback: "Thin content - needs substantial expansion",
                    issues: [`Only ${wordCount} words (recommended: 800+)`]
                };
            }
            
            if (wordCount < 500) {
                const basePenalty = 9;
                const adjustedPenalty = Math.round(basePenalty * penaltyWeight);
                const adjustedScore = 15 - adjustedPenalty;
                
                return {
                    score: Math.max(0, adjustedScore),
                    maxScore: 15,
                    status: 'warning',
                    feedback: "Content is minimal - consider expanding",
                    issues: [`${wordCount} words (recommended: 800+)`]
                };
            }
            
            if (wordCount < 800) {
                const basePenalty = 4;
                const adjustedPenalty = Math.round(basePenalty * penaltyWeight);
                const adjustedScore = 15 - adjustedPenalty;
                
                return {
                    score: Math.max(0, adjustedScore),
                    maxScore: 15,
                    status: 'good',
                    feedback: "Decent content length",
                    issues: [`${wordCount} words (optimal: 800+)`]
                };
            }
            
            return {
                score: 15,
                maxScore: 15,
                status: 'excellent',
                feedback: `Strong content depth (${wordCount} words)`
            };
        }
    },
    {
        name: "Readability",
        maxPoints: 7,
        description: "Content is clear and easy to read",
        evaluate: (data) => {
            const { poorReadability } = data.semanticFlags || {};
            const { wordCount } = data.structuralData || {};
            
            // Thin content can't be properly evaluated for readability
            if (wordCount < 300) {
                return {
                    score: 0,
                    maxScore: 7,
                    status: 'critical',
                    feedback: "Insufficient content to evaluate readability",
                    issues: ["Need at least 300 words for meaningful content"]
                };
            }
            
            if (poorReadability) {
                return {
                    score: 2,
                    maxScore: 7,
                    status: 'warning',
                    feedback: "Content readability needs improvement",
                    issues: ["Complex sentences or poor structure detected"]
                };
            }
            
            return {
                score: 7,
                maxScore: 7,
                status: 'excellent',
                feedback: "Content is clear and readable"
            };
        }
    },
    {
        name: "Internal Linking",
        maxPoints: 10,
        description: "Internal links present for site navigation and architecture",
        evaluate: (data) => {
            const { internal } = data.structuralData?.links || {};
            const { wordCount } = data.structuralData || {};
            
            if (internal === 0) {
                return {
                    score: 0,
                    maxScore: 10,
                    status: 'critical',
                    feedback: "No internal links found",
                    issues: ["Add internal links to improve site structure"]
                };
            }
            
            // Check for link spam: too many links for content length
            // Good ratio: 1 link per 50-100 words
            // Spam ratio: >1 link per 20 words
            if (wordCount > 0) {
                const linkDensity = internal / wordCount;
                if (linkDensity > 0.05) { // More than 1 link per 20 words
                    return {
                        score: 2,
                        maxScore: 10,
                        status: 'warning',
                        feedback: "Excessive internal linking - appears spammy",
                        issues: [`${internal} links in ${wordCount} words (${Math.round(linkDensity * 100)}% link density)`]
                    };
                }
            }
            
            if (internal < 5) {
                return {
                    score: 3,
                    maxScore: 10,
                    status: 'warning',
                    feedback: "Minimal internal linking - poor site architecture",
                    issues: [`Only ${internal} internal links (recommended: 10+)`]
                };
            }
            
            if (internal < 10) {
                return {
                    score: 6,
                    maxScore: 10,
                    status: 'good',
                    feedback: "Decent internal linking",
                    issues: [`${internal} internal links (optimal: 10+)`]
                };
            }
            
            if (internal < 20) {
                return {
                    score: 8,
                    maxScore: 10,
                    status: 'excellent',
                    feedback: `Good internal linking (${internal} links)`
                };
            }
            
            return {
                score: 10,
                maxScore: 10,
                status: 'excellent',
                feedback: `Strong internal linking architecture (${internal} links)`
            };
        }
    },
    {
        name: "Image Optimization",
        maxPoints: 10,
        description: "Images have alt text for accessibility and SEO",
        evaluate: (data) => {
            const { totalImages, imagesWithAlt } = data.structuralData?.media || {};
            
            if (totalImages === 0) {
                return {
                    score: 10,
                    maxScore: 10,
                    status: 'excellent',
                    feedback: "No images to optimize"
                };
            }
            
            const altCoverage = (imagesWithAlt / totalImages) * 100;
            const missingCount = totalImages - imagesWithAlt;
            
            if (altCoverage === 0) {
                return {
                    score: 0,
                    maxScore: 10,
                    status: 'critical',
                    feedback: "No images have alt text - major accessibility issue",
                    issues: [`All ${totalImages} images missing alt text`]
                };
            }
            
            if (altCoverage < 50) {
                return {
                    score: 2,
                    maxScore: 10,
                    status: 'critical',
                    feedback: "Most images missing alt text",
                    issues: [`${missingCount} of ${totalImages} images missing alt text (${Math.round(altCoverage)}% coverage)`]
                };
            }
            
            if (altCoverage < 80) {
                return {
                    score: 5,
                    maxScore: 10,
                    status: 'warning',
                    feedback: "Many images missing alt text",
                    issues: [`${missingCount} of ${totalImages} images missing alt text (${Math.round(altCoverage)}% coverage)`]
                };
            }
            
            if (altCoverage < 100) {
                return {
                    score: 8,
                    maxScore: 10,
                    status: 'good',
                    feedback: "Most images have alt text",
                    issues: [`${missingCount} image${missingCount > 1 ? 's' : ''} still need alt text`]
                };
            }
            
            return {
                score: 10,
                maxScore: 10,
                status: 'excellent',
                feedback: "All images have alt text - excellent accessibility"
            };
        }
    }
];

export const SEO_TECHNICAL_COMPONENTS: ScoreComponent[] = [
    {
        name: "Page Performance",
        maxPoints: 10,
        description: "Page loads quickly (response time)",
        evaluate: (data) => {
            const { responseTimeMs } = data;
            
            if (!responseTimeMs) {
                return {
                    score: 10,
                    maxScore: 10,
                    status: 'excellent',
                    feedback: "Performance measurement unavailable"
                };
            }
            
            // Use broader buckets to reduce score variance from network fluctuations
            if (responseTimeMs > 3000) {
                return {
                    score: 0,
                    maxScore: 10,
                    status: 'critical',
                    feedback: "Very slow page load time - critical performance issue",
                    issues: [`${responseTimeMs}ms response time (target: <1500ms)`]
                };
            }
            
            if (responseTimeMs > 2000) {
                return {
                    score: 3,
                    maxScore: 10,
                    status: 'warning',
                    feedback: "Slow page load time",
                    issues: [`${responseTimeMs}ms response time (target: <1500ms)`]
                };
            }
            
            if (responseTimeMs > 1500) {
                return {
                    score: 7,
                    maxScore: 10,
                    status: 'good',
                    feedback: "Acceptable page load time",
                    issues: [`${responseTimeMs}ms response time (optimal: <1500ms)`]
                };
            }
            
            return {
                score: 10,
                maxScore: 10,
                status: 'excellent',
                feedback: `Fast page load (${responseTimeMs}ms)`
            };
        }
    },
    {
        name: "Semantic HTML Structure",
        maxPoints: 6,
        description: "Modern HTML5 semantic tags used",
        evaluate: (data) => {
            const { main, nav, article, header, footer } = data.structuralData?.semanticTags || {};
            const { wordCount } = data.structuralData || {};
            
            // Only penalize if page has substantial content
            if (wordCount < 300) {
                return {
                    score: 6,
                    maxScore: 6,
                    status: 'excellent',
                    feedback: "Semantic structure not critical for short pages"
                };
            }
            
            const semanticScore = (main ? 2 : 0) + (nav ? 1 : 0) + (article ? 1 : 0) + 
                                 (header ? 1 : 0) + (footer ? 1 : 0);
            
            if (semanticScore === 0) {
                return {
                    score: 0,
                    maxScore: 6,
                    status: 'warning',
                    feedback: "No semantic HTML5 tags found",
                    issues: ["Consider using <main>, <nav>, <article>, <header>, <footer>"]
                };
            }
            
            if (semanticScore < 3) {
                return {
                    score: 3,
                    maxScore: 6,
                    status: 'warning',
                    feedback: "Limited semantic structure",
                    issues: ["Add more HTML5 semantic tags for better structure"]
                };
            }
            
            return {
                score: 6,
                maxScore: 6,
                status: 'excellent',
                feedback: "Good semantic HTML structure"
            };
        }
    },
    {
        name: "URL Structure",
        maxPoints: 6,
        description: "Clean, descriptive URLs",
        evaluate: (data) => {
            const { url } = data;
            
            if (!url) {
                return {
                    score: 3,
                    maxScore: 6,
                    status: 'warning',
                    feedback: "Unable to evaluate URL"
                };
            }
            
            // Check for URL issues
            const hasQueryParams = url.includes('?');
            const hasSessionId = /sessionid|sid=|jsessionid/i.test(url);
            const hasManyParams = (url.match(/&/g) || []).length > 3;
            
            if (hasSessionId) {
                return {
                    score: 2,
                    maxScore: 6,
                    status: 'warning',
                    feedback: "URL contains session IDs",
                    issues: ["Remove session IDs from URLs"]
                };
            }
            
            if (hasManyParams) {
                return {
                    score: 3,
                    maxScore: 6,
                    status: 'warning',
                    feedback: "URL has many parameters",
                    issues: ["Simplify URL structure"]
                };
            }
            
            if (hasQueryParams) {
                return {
                    score: 5,
                    maxScore: 6,
                    status: 'good',
                    feedback: "URL structure is acceptable"
                };
            }
            
            return {
                score: 6,
                maxScore: 6,
                status: 'excellent',
                feedback: "Clean URL structure"
            };
        }
    }
];

export const SEO_ADVANCED_COMPONENTS: ScoreComponent[] = [
    {
        name: "Schema Markup Quality",
        maxPoints: 5,
        description: "Structured data implemented correctly",
        evaluate: (data) => {
            const { schemaQuality, schemas } = data;
            
            if (!schemas || schemas.length === 0) {
                return {
                    score: 0,
                    maxScore: 5,
                    status: 'warning',
                    feedback: "No schema markup found",
                    issues: ["Add schema.org structured data"]
                };
            }
            
            // Use AI's schema quality score if available
            if (schemaQuality?.score) {
                const normalizedScore = Math.round((schemaQuality.score / 100) * 5);
                return {
                    score: normalizedScore,
                    maxScore: 5,
                    status: normalizedScore >= 4 ? 'excellent' : normalizedScore >= 3 ? 'good' : 'warning',
                    feedback: schemaQuality.score >= 80 ? "High-quality schema implementation" : 
                             schemaQuality.score >= 60 ? "Schema present but needs improvement" :
                             "Schema quality is poor",
                    issues: schemaQuality.issues
                };
            }
            
            // Fallback: basic schema presence
            return {
                score: 3,
                maxScore: 5,
                status: 'good',
                feedback: `Schema markup present (${schemas.length} types)`
            };
        }
    },
    {
        name: "External Authority Links",
        maxPoints: 3,
        description: "Links to authoritative external sources",
        evaluate: (data) => {
            const { external } = data.structuralData?.links || {};
            const { wordCount } = data.structuralData || {};
            
            // Only relevant for content-heavy pages
            if (wordCount < 500) {
                return {
                    score: 3,
                    maxScore: 3,
                    status: 'excellent',
                    feedback: "External links not critical for short pages"
                };
            }
            
            if (external === 0) {
                return {
                    score: 0,
                    maxScore: 3,
                    status: 'warning',
                    feedback: "No external links found",
                    issues: ["Consider linking to authoritative sources"]
                };
            }
            
            return {
                score: 3,
                maxScore: 3,
                status: 'excellent',
                feedback: `External links present (${external})`
            };
        }
    },
    {
        name: "Content Freshness",
        maxPoints: 0,
        description: "Content appears current and up-to-date",
        evaluate: (data) => {
            // Removed penalty - this is a tool limitation, not a site issue
            return {
                score: 0,
                maxScore: 0,
                status: 'excellent',
                feedback: "Content freshness not evaluated"
            };
        }
    }
];

// Category definitions
export const SEO_CATEGORIES: ComponentCategory[] = [
    {
        name: "Foundation",
        maxPoints: 40,  // Fixed: matches actual component total (10+8+8+7+7)
        components: SEO_FOUNDATION_COMPONENTS
    },
    {
        name: "Content Quality",
        maxPoints: 42,  // Content Depth (15) + Readability (7) + Internal Linking (10) + Image Opt (10) = 42
        components: SEO_CONTENT_COMPONENTS
    },
    {
        name: "Technical Excellence",
        maxPoints: 22,  // Page Performance (10) + Semantic HTML (6) + URL Structure (6) = 22
        components: SEO_TECHNICAL_COMPONENTS
    },
    {
        name: "Advanced Optimization",
        maxPoints: 8,   // Schema Quality (5) + External Links (3) + Content Freshness (0) = 8
        components: SEO_ADVANCED_COMPONENTS
    }
];

// Total: 28 + 42 + 22 + 8 = 100 points
