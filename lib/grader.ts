import { PENALTY_DICTIONARY } from "./scoring-config";

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
    descriptionLength: number
) {
    let seoScore = 100;
    let aeoScore = 100;
    let geoScore = 100;

    const penaltyLedger: Array<{ category: "seo" | "aeo" | "geo"; penalty: string; pointsDeducted: number }> = [];

    const penalize = (category: "seo" | "aeo" | "geo", key: string) => {
        // @ts-ignore
        const rule = PENALTY_DICTIONARY[category][key];
        if (!rule) return;

        if (category === "seo") seoScore -= rule.points;
        if (category === "aeo") aeoScore -= rule.points;
        if (category === "geo") geoScore -= rule.points;

        penaltyLedger.push({
            category,
            penalty: rule.description,
            pointsDeducted: -rule.points
        });
    };

    // --- 1. SEO EVALUATION ---
    if (titleLength === 0) penalize("seo", "missingTitle");
    else if (titleLength < 30) penalize("seo", "titleTooShort");
    else if (titleLength > 60) penalize("seo", "titleTooLong");

    if (descriptionLength === 0) penalize("seo", "missingMetaDescription");
    else if (descriptionLength < 50 || descriptionLength > 160) penalize("seo", "metaDescriptionPoorLength");

    if (structuralData.semanticTags.h1Count === 0) penalize("seo", "missingH1");
    if (structuralData.semanticTags.h1Count > 1) penalize("seo", "multipleH1s");
    if (structuralData.semanticTags.main === 0) penalize("seo", "missingMain");
    if (structuralData.semanticTags.article === 0) penalize("seo", "missingArticle");
    if (structuralData.semanticTags.nav === 0) penalize("seo", "missingNav");

    if (structuralData.wordCount < 300) penalize("seo", "lowWordCount");

    if (structuralData.links.internal === 0) penalize("seo", "noInternalLinks");
    if (structuralData.links.external === 0) penalize("seo", "noExternalLinks");

    // if not all images have alts
    if (structuralData.media.totalImages > 0 && structuralData.media.imagesWithAlt < structuralData.media.totalImages) {
        penalize("seo", "missingImageAlts");
    }

    if (semanticFlags.topicMisalignment) penalize("seo", "topicMisalignment");
    if (semanticFlags.keywordStuffing) penalize("seo", "keywordStuffing");
    if (semanticFlags.poorReadability) penalize("seo", "poorReadability");

    // --- 2. AEO EVALUATION ---
    const schemaTypes = schemas.map(s => s['@type'] || '');
    if (schemas.length === 0) {
        penalize("aeo", "noSchema");
    } else {
        if (!schemaTypes.includes("FAQPage")) penalize("aeo", "missingFAQSchema");
        if (!schemaTypes.includes("Organization") && !schemaTypes.includes("LocalBusiness")) penalize("aeo", "missingOrganizationSchema");
        if (!schemaTypes.includes("HowTo")) penalize("aeo", "missingHowToSchema");
    }

    if (semanticFlags.noDirectQnAMatching) penalize("aeo", "noDirectQnAMatching");
    if (semanticFlags.lowEntityDensity) penalize("aeo", "lowEntityDensity");
    if (semanticFlags.poorFormattingConciseness) penalize("aeo", "poorFormattingConciseness");
    if (semanticFlags.lackOfDefinitionStatements) penalize("aeo", "lackOfDefinitionStatements");

    // --- 3. GEO EVALUATION ---
    if (structuralData.media.totalImages > 0) {
        const blindspotRatio = (structuralData.media.totalImages - structuralData.media.imagesWithAlt) / structuralData.media.totalImages;
        if (blindspotRatio > 0.5) penalize("geo", "highAiBlindspot");
    }

    if (structuralData.links.socialLinksCount === 0) penalize("geo", "noSocialProofLinks");

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
