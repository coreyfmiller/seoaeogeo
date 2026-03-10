import { PENALTY_DICTIONARY } from "./scoring-config";
import { getPenaltyWeight, type SiteTypePenaltyWeights } from "./scoring-config-site-types";
import type { SiteType } from "./types/audit";

export interface SemanticFlags {
    topicMisalignment: boolean;
    keywordStuffing: boolean;
    poorReadability: boolean;
    noDirectQnAMatching: boolean;
    lowEntityDensity: boolean;
    poorFormattingConciseness: boolean;
    lackOfDefinitionStatements: boolean;
    promotionalTone: boolean;
    lackOfExpertiseSignals: boolean;
    lackOfHardData: boolean;
    heavyFirstPersonUsage: boolean;
    unsubstantiatedClaims: boolean;
}

export function calculateDeterministicScores(
    structuralData: any,
    schemas: any[],
    semanticFlags: SemanticFlags,
    titleLength: number,
    descriptionLength: number,
    schemaQuality?: { score: number; hasSchema: boolean; issues: string[] }, // NEW: Gemini's schema evaluation
    siteType?: SiteType // NEW: Site type for context-aware penalties
) {
    let seoScore = 100;
    let aeoScore = 100;
    let geoScore = 100;

    const penaltyLedger: Array<{ category: "seo" | "aeo" | "geo"; penalty: string; pointsDeducted: number }> = [];

    // Helper function to apply site-type-aware penalties
    const penalize = (category: "seo" | "aeo" | "geo", key: string, penaltyWeightKey?: keyof SiteTypePenaltyWeights) => {
        // @ts-ignore
        const rule = PENALTY_DICTIONARY[category][key];
        if (!rule) return;

        // Apply site-type-specific weight if provided
        let weight = 1.0;
        if (siteType && penaltyWeightKey) {
            weight = getPenaltyWeight(siteType, penaltyWeightKey);
            // If weight is 0, skip this penalty entirely
            if (weight === 0) return;
        }

        const adjustedPoints = Math.round(rule.points * weight);

        if (category === "seo") seoScore -= adjustedPoints;
        if (category === "aeo") aeoScore -= adjustedPoints;
        if (category === "geo") geoScore -= adjustedPoints;

        penaltyLedger.push({
            category,
            penalty: rule.description,
            pointsDeducted: -adjustedPoints
        });
    };

    // --- 1. SEO EVALUATION ---
    if (titleLength === 0) penalize("seo", "missingTitle");
    else if (titleLength < 30) penalize("seo", "titleTooShort");
    else if (titleLength > 60) penalize("seo", "titleTooLong");

    if (descriptionLength === 0) penalize("seo", "missingMetaDescription", "missingMetaDescription");
    else if (descriptionLength < 50 || descriptionLength > 160) penalize("seo", "metaDescriptionPoorLength");

    if (structuralData.semanticTags.h1Count === 0) penalize("seo", "missingH1", "missingH1");
    if (structuralData.semanticTags.h1Count > 1) penalize("seo", "multipleH1s");
    
    // MODERN 2026 STANDARDS: Semantic tags are good but not always required
    // Only penalize if page has substantial content (300+ words) but missing semantic structure
    if (structuralData.wordCount >= 300) {
        if (structuralData.semanticTags.main === 0) penalize("seo", "missingMain", "missingSemanticTags");
        // Article tag only matters for blog/news content - don't penalize universally
        // Nav tag only matters if site has navigation - don't penalize universally
    }

    if (structuralData.wordCount < 300) penalize("seo", "lowWordCount", "thinContent");

    if (structuralData.links.internal === 0) penalize("seo", "noInternalLinks", "weakInternalLinking");
    
    // MODERN 2026 STANDARDS: External links are good for content pages but not required for all pages
    // Only penalize if page has substantial content (500+ words) but no external references
    if (structuralData.wordCount >= 500 && structuralData.links.external === 0) {
        penalize("seo", "noExternalLinks", "noExternalLinks");
    }

    // if not all images have alts
    if (structuralData.media.totalImages > 0 && structuralData.media.imagesWithAlt < structuralData.media.totalImages) {
        penalize("seo", "missingImageAlts", "poorImageAltCoverage");
    }

    if (semanticFlags.topicMisalignment) penalize("seo", "topicMisalignment");
    if (semanticFlags.keywordStuffing) penalize("seo", "keywordStuffing");
    if (semanticFlags.poorReadability) penalize("seo", "poorReadability");

    // --- 2. AEO EVALUATION (Using Gemini's schema quality if available) ---
    if (schemaQuality) {
        // Modern approach: Use Gemini's schema quality score
        if (!schemaQuality.hasSchema) {
            penalize("aeo", "noSchema");
        } else {
            // Deduct points based on schema quality score
            // 100 = perfect, 0 = terrible
            // Convert to penalty: (100 - score) / 5 = points to deduct
            const schemaQualityPenalty = Math.round((100 - schemaQuality.score) / 5);
            if (schemaQualityPenalty > 0) {
                aeoScore -= schemaQualityPenalty;
                penaltyLedger.push({
                    category: "aeo",
                    penalty: `Schema quality issues detected: ${schemaQuality.issues.join(', ')}`,
                    pointsDeducted: -schemaQualityPenalty
                });
            }
        }
    } else {
        // Fallback: Legacy simple presence checks
        // MODERN 2026 STANDARDS: Don't penalize for missing specific schema types
        // Only penalize if NO schema exists at all
        if (schemas.length === 0) {
            penalize("aeo", "noSchema");
        }
        // Note: Specific schema recommendations (FAQ, HowTo, etc.) should come from Gemini analysis
        // Not from deterministic penalties - context matters!
    }

    if (semanticFlags.noDirectQnAMatching) penalize("aeo", "noDirectQnAMatching", "poorQuestionAnswering");
    if (semanticFlags.lowEntityDensity) penalize("aeo", "lowEntityDensity");
    if (semanticFlags.poorFormattingConciseness) penalize("aeo", "poorFormattingConciseness");
    if (semanticFlags.lackOfDefinitionStatements) penalize("aeo", "lackOfDefinitionStatements");

    // --- 3. GEO EVALUATION ---
    if (structuralData.media.totalImages > 0) {
        const blindspotRatio = (structuralData.media.totalImages - structuralData.media.imagesWithAlt) / structuralData.media.totalImages;
        // MODERN 2026 STANDARDS: Only penalize if >50% of images lack alt text
        if (blindspotRatio > 0.5) penalize("geo", "highAiBlindspot", "poorImageAltCoverage");
    }

    // MODERN 2026 STANDARDS: Social links are nice but not critical for all sites
    // Only penalize if site appears to be a business (has Organization/LocalBusiness schema)
    const hasBusinessSchema = schemas.some(s => 
        s['@type'] === 'Organization' || 
        s['@type'] === 'LocalBusiness' ||
        (Array.isArray(s['@type']) && (s['@type'].includes('Organization') || s['@type'].includes('LocalBusiness')))
    );
    if (hasBusinessSchema && structuralData.links.socialLinksCount === 0) {
        penalize("geo", "noSocialProofLinks");
    }

    if (semanticFlags.promotionalTone) penalize("geo", "promotionalTone");
    if (semanticFlags.lackOfExpertiseSignals) penalize("geo", "lackOfExpertiseSignals");
    if (semanticFlags.lackOfHardData) penalize("geo", "lackOfHardData");
    if (semanticFlags.heavyFirstPersonUsage) penalize("geo", "heavyFirstPersonUsage");
    if (semanticFlags.unsubstantiatedClaims) penalize("geo", "unsubstantiatedClaims");


    // Floor scores at 0
    seoScore = Math.max(0, seoScore);
    aeoScore = Math.max(0, aeoScore);
    geoScore = Math.max(0, geoScore);

    return {
        scores: {
            seo: seoScore,
            aeo: aeoScore,
            geo: geoScore
        },
        penaltyLedger
    };
}
