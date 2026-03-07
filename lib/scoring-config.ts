/**
 * Deterministic Scoring Configuration
 * This file contains the master dictionary of all possible objective penalties 
 * corresponding to the Data Extraction and Semantic evaluation layers.
 */

export const PENALTY_DICTIONARY = {
    seo: {
        missingTitle: { points: 15, description: "Missing <title> tag, a critical ranking factor." },
        titleTooShort: { points: 5, description: "Title tag is under 30 characters, wasting valuable optimization space." },
        titleTooLong: { points: 5, description: "Title tag exceeds 60 characters and will likely be truncated." },
        missingMetaDescription: { points: 15, description: "Missing meta description, reducing click-through rate in search results." },
        metaDescriptionPoorLength: { points: 5, description: "Meta description implies poor context (should be 50-160 characters)." },
        missingH1: { points: 15, description: "Missing <h1> tag, hindering structural understanding of the page's core topic." },
        multipleH1s: { points: 5, description: "Multiple <h1> tags detected. While valid HTML5, it can dilute core topical focus." },
        missingMain: { points: 10, description: "Missing <main> semantic tag, harming accessibility and crawler segmentation." },
        missingArticle: { points: 5, description: "Absence of <article> tags for distinct content blocks." },
        missingNav: { points: 5, description: "Missing <nav> semantic tag, potentially reducing crawler efficiency for site architecture." },
        lowWordCount: { points: 10, description: "Thin content (under 300 words). Highly unlikely to rank for competitive terms." },
        noInternalLinks: { points: 15, description: "Zero internal links detected. Pages should connect to others within the site architecture." },
        noExternalLinks: { points: 5, description: "No outbound links to authoritative sources, which can limit trust signals." },
        missingImageAlts: { points: 10, description: "Images present without alt attributes, harming accessibility and image search." },
        topicMisalignment: { points: 10, description: "Semantic Warning: The title tag does not align well with the core body content." },
        keywordStuffing: { points: 15, description: "Semantic Warning: High repetition of core terms indicating potential keyword stuffing." },
        poorReadability: { points: 5, description: "Semantic Warning: Content is unusually complex or unreadable for general audiences, introducing context friction." }
    },
    aeo: {
        noSchema: { points: 20, description: "Critical: No LD+JSON schema detected. Answer engines rely heavily on schema for extraction." },
        missingFAQSchema: { points: 15, description: "Missing FAQPage schema, a missed opportunity for direct PAA (People Also Ask) snippets." },
        missingOrganizationSchema: { points: 10, description: "Missing Organization/LocalBusiness schema, reducing entity trust." },
        missingHowToSchema: { points: 5, description: "Missing HowTo schema for instructional content snippets." },
        noDirectQnAMatching: { points: 15, description: "Semantic Warning: Content does not explicitly ask and directly answer questions concisely." },
        lowEntityDensity: { points: 10, description: "Semantic Warning: Vague language (pronouns) used over explicit nouns (Entities)." },
        poorFormattingConciseness: { points: 10, description: "Semantic Warning: Answers buried in long paragraphs instead of punchy sentences/bullets." },
        lackOfDefinitionStatements: { points: 5, description: "Semantic Warning: Content lacks clear 'is' definition statements for core concepts." }
    },
    geo: {
        highAiBlindspot: { points: 15, description: "High AI Image Blindspot Ratio. Multi-modal LLMs cannot 'see' what your images represent." },
        noSocialProofLinks: { points: 10, description: "No external social proof links (LinkedIn, Twitter) found in DOM to validate the entity." },
        promotionalTone: { points: 5, description: "Generative Friction: While natural for marketing, highly promotional language can deter LLMs from extracting objective facts. Balance sales copy with hard data." },
        lackOfExpertiseSignals: { points: 15, description: "Semantic Warning: No verifiable claims, quotes, or author bylines to establish E-E-A-T." },
        lackOfHardData: { points: 15, description: "Semantic Warning: Content lacks specific metrics, numbers, or unique hard data for LLMs to cite." },
        heavyFirstPersonUsage: { points: 5, description: "Semantic Warning: Heavy use of first-person pronouns (We/Our/I) generally introduces subjective bias against encyclopedia-trained AIs." },
        unsubstantiatedClaims: { points: 5, description: "Semantic Warning: Entity makes claims without providing external/internal substantiating references or data." }
    }
};
