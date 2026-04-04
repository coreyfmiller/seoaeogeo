import { GoogleGenerativeAI } from "@google/generative-ai";
import { logUsage } from "./usage";
import { safeJsonParse } from "./utils/json-sanitizer";
import { getGeminiModel } from "./gemini-model-resolver";
import { validateSchemas, calculateBrandConsistency } from "./schema-validator";
import { getRecommendedSchemas, formatSiteType } from "./site-type-detector";
import type { SiteType } from "./types/audit";
import { debugLog } from "./debug-logger";

/**
 * Sitewide Analysis: Analyzes aggregate data from multiple pages.
 * Now includes site type context for personalized recommendations.
 */
export async function analyzeSitewideIntelligence(context: {
  domain: string;
  pages: Array<{
    url: string;
    title: string;
    description: string;
    schemas: any[];
    schemaTypes?: string[];
    wordCount?: number;
    internalLinks?: number;
    hasH1?: boolean;
    isHttps?: boolean;
    responseTimeMs?: number;
    h2Count?: number;
    h3Count?: number;
    imgTotal?: number;
    imgWithAlt?: number;
    outboundLinks?: string[];
  }>;
  siteType?: SiteType;
  platform?: string;
  currentScores?: { seo: number; aeo: number; geo: number };
  backlinkContext?: string;
}) {
  // DETERMINISTIC CALCULATIONS (run before AI to ensure consistency)
  
  // 1. Schema Quality (deterministic validation)
  const schemaValidations = context.pages.map(p => validateSchemas(p.schemas));
  const avgSchemaScore = context.pages.length > 0 
    ? schemaValidations.reduce((sum, v) => sum + v.score, 0) / context.pages.length 
    : 0;
  const schemaCoverage = context.pages.length > 0 
    ? (schemaValidations.filter(v => v.hasSchema).length / context.pages.length) * 100 
    : 0;
  
  // Aggregate all schema issues
  const allSchemaIssues = schemaValidations.flatMap((v, idx) => 
    v.issues.map(issue => ({
      ...issue,
      url: context.pages[idx].url
    }))
  );
  
  // Group issues by type for reporting
  const groupedIssues = new Map<string, typeof allSchemaIssues>();
  allSchemaIssues.forEach(issue => {
    const key = `${issue.severity}:${issue.message}`;
    if (!groupedIssues.has(key)) {
      groupedIssues.set(key, []);
    }
    groupedIssues.get(key)!.push(issue);
  });
  
  const schemaHealthAudit = {
    overallScore: Math.round(avgSchemaScore),
    issues: Array.from(groupedIssues.values()).map(issues => ({
      severity: issues[0].severity,
      issue: issues[0].message,
      affectedPages: issues.map(i => i.url).slice(0, 5),
      affectedCount: issues.length,
      pointsDeducted: issues[0].severity === 'critical' ? 20 : issues[0].severity === 'high' ? 15 : 10,
      explanation: `This affects ${issues.length} page(s) and impacts schema.org compliance`,
      howToFix: getFixInstructions(issues[0].message, issues[0].affectedType),
      modernCrawlerImpact: issues[0].severity === 'critical' ? 'high' : issues[0].severity === 'high' ? 'medium' : 'low'
    })),
    breakdown: {
      coverage: Math.round(schemaCoverage),
      quality: Math.round(avgSchemaScore),
      diversity: Math.min(100, (new Set(schemaValidations.flatMap(v => v.schemaTypes)).size / 5) * 100)
    }
  };
  
  // 2. Brand Consistency (deterministic calculation with breakdown)
  const brandConsistencyResult = calculateBrandConsistency(context.pages);
  const brandConsistency = brandConsistencyResult.score;

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const modelName = await getGeminiModel();
  const model = genAI.getGenerativeModel({ model: modelName });

  debugLog('[GEMINI-SITEWIDE] Starting AI analysis', { domain: context.domain, pageCount: context.pages.length });
  debugLog('[GEMINI-SITEWIDE] Schema health score', { score: schemaHealthAudit.overallScore });
  debugLog('[GEMINI-SITEWIDE] Brand consistency score', { score: brandConsistency });
  
  console.log('[GEMINI-SITEWIDE] Starting AI analysis for:', context.domain);
  console.log('[GEMINI-SITEWIDE] Analyzing', context.pages.length, 'pages');
  console.log('[GEMINI-SITEWIDE] Schema health score:', schemaHealthAudit.overallScore);
  console.log('[GEMINI-SITEWIDE] Brand consistency score:', brandConsistency);

  const pagesSummary = context.pages.map(p => {
    // Optimize schema data - only send type and key properties, not full JSON
    const schemasSummary = p.schemas && p.schemas.length > 0 
      ? p.schemas.map(s => {
          const type = s['@type'] || 'Unknown';
          const name = s.name || s.legalName || '';
          const id = s['@id'] || '';
          return `${type}${name ? ` (${name})` : ''}${id ? ` [id: ${id}]` : ''}`;
        }).join(', ')
      : "None";
    
    return `
  - URL: ${p.url}
  - Title: ${p.title || "MISSING"}
  - Meta Description: ${p.description || "MISSING"}
  - Schema Types: ${schemasSummary}
  - Word Count: ${p.wordCount ?? "Unknown"}
  - Internal Links: ${p.internalLinks ?? "Unknown"}
  - H1: ${p.hasH1 ? "Yes" : "No"} | H2s: ${p.h2Count ?? 0} | H3s: ${p.h3Count ?? 0}
  - Images: ${p.imgTotal ?? 0} total, ${p.imgWithAlt ?? 0} with alt text
  - HTTPS: ${p.isHttps ? "Yes" : "No"}
  - Response Time: ${p.responseTimeMs ? `${p.responseTimeMs}ms` : "Unknown"}
  - Outbound Internal Links: ${p.outboundLinks?.slice(0, 5).join(', ') || "None"}${p.outboundLinks && p.outboundLinks.length > 5 ? ` (+${p.outboundLinks.length - 5} more)` : ''}
  `;
  }).join('\n');

  const prompt = `
    You are performing a PRO Deep Site Audit using MODERN CRAWLER STANDARDS (Google 2026, Bing 2026).
    
    ${context.siteType ? `
    SITE TYPE DETECTED: ${formatSiteType(context.siteType)}
    
    RECOMMENDED SCHEMA TYPES FOR THIS SITE TYPE: ${getRecommendedSchemas(context.siteType).join(', ')}
    
    IMPORTANT: Tailor your recommendations to this specific site type. Focus on schema types and optimizations 
    that are most relevant for ${formatSiteType(context.siteType)} businesses. Do not recommend schema types 
    that are irrelevant to this industry.
    ` : ''}
${context.platform ? `
    DETECTED PLATFORM: ${context.platform}
    All fix instructions and recommendations MUST be tailored to ${context.platform}. Reference specific ${context.platform} admin paths, plugins/apps/extensions, template files, and platform-specific approaches. Do NOT give generic HTML fixes when a ${context.platform}-specific solution exists.
` : ''}
${context.currentScores ? `
    CURRENT AVERAGE SCORES ACROSS ALL PAGES:
    - SEO Score: ${context.currentScores.seo}/100
    - AEO Score: ${context.currentScores.aeo}/100
    - GEO Score: ${context.currentScores.geo}/100
    
    SCORE-GAP PRIORITIZATION RULE:
    The LOWEST scoring domain needs the MOST recommendations. Distribute your 15 recommendations proportionally to the score gaps.
    For example, if GEO is 52, SEO is 77, AEO is 85:
    - GEO should get ~6-7 recommendations (biggest gap from 100)
    - SEO should get ~4-5 recommendations (moderate gap)
    - AEO should get ~2-3 recommendations (smallest gap)
    Recommendations for the weakest domain should also be ranked HIGHER in priority.
` : ''}
    
    IMPORTANT: Schema quality and brand consistency are calculated deterministically. 
    Focus on qualitative analysis (insights, gaps, recommendations).
    
    CRITICAL AUDITING STANDARDS:
    
    1. SCHEMA PARSING CAPABILITIES (Modern Crawlers):
       - JSON-LD arrays at root level are VALID and PREFERRED
       - @graph structures are VALID and should be parsed correctly
       - @id references should be followed within the same domain
       - Multiple <script type="application/ld+json"> tags per page are VALID
       - Distributed schema (layout + page-specific) is VALID if @id references are correct
    
    2. PROTOCOL & CANONICALIZATION:
       - www vs non-www variations are acceptable if canonical tags are consistent
       - Only penalize if schema @id directly conflicts with canonical tag
       - Modern crawlers understand protocol variations
    
    3. SCORING PHILOSOPHY - ONLY PENALIZE ISSUES THAT HARM 2026 SEO/AEO:
       
       CRITICAL SEVERITY (-30 to -50 points):
       - Completely missing schema on pages that require it (e.g., no LocalBusiness on location pages)
       - Invalid JSON that breaks parsing
       - Required properties missing (per schema.org specification)
       - Broken @id references that return 404 errors
       
       HIGH SEVERITY (-10 to -25 points):
       - Obvious placeholder data (000-0000, example@example.com, 123 Main St)
       - Missing recommended properties that enable rich results
       - Incomplete address data for LocalBusiness (missing street, city, or postal code)
       
       MEDIUM SEVERITY (-5 to -10 points):
       - Missing optional but beneficial properties
       - Could add more schema types for better coverage
       - Minor data quality issues
       
       LOW SEVERITY (0 to -5 points):
       - Minor optimization opportunities
       - Edge case improvements
       
       ZERO PENALTY (0 points) - DO NOT FLAG THESE:
       - Using JSON-LD arrays (this is valid per specification)
       - Using @graph structures (this is best practice)
       - Protocol variations if canonical tags are correct
       - Distributing schema across layout + page files
       - Organization schema in layout appearing on all pages
       - Phone numbers that appear realistic (even if not externally verified)
    
    4. DO NOT PENALIZE:
       - Using arrays (this is valid JSON-LD per specification)
       - Using @graph structures (this is best practice for entity relationships)
       - Protocol mismatches if canonical tags are present and correct
       - Distributing schema across multiple script tags or files
       - Modern Next.js patterns (layout schema + page schema)
    
    5. SCHEMA EVALUATION RULES:
       - Parse ALL schema objects on a page (arrays, @graph, multiple scripts)
       - Follow @id references within the same domain
       - Aggregate Organization schema from layout if present on all pages
       - Validate against current schema.org specifications
       - Consider context: LocalBusiness schema belongs on location pages, not blog posts
    
    DOMAIN: ${context.domain}
    DATA FROM ${context.pages.length} PAGES:
    ${pagesSummary}
    ${context.backlinkContext || ''}
    
    Analyze the full dataset using MODERN CRAWLER STANDARDS and return a JSON object exactly matching this structure. No markdown, pure JSON:
    {
      "domainHealthScore": number (0-100, aggregate health across all pages),
      "domainHealthBreakdown": {
        "contentQuality": number (0-100, quality of content depth and substance),
        "schemaQuality": number (0-100, quality and completeness of schema implementation),
        "metadataQuality": number (0-100, quality of titles and descriptions),
        "technicalHealth": number (0-100, H1 tags, HTTPS, response times),
        "architectureHealth": number (0-100, internal linking and navigation)
      },
      "domainHealthExplanations": {
        "contentQuality": {
          "score": number,
          "issues": Array of strings (specific problems found, e.g. "12 pages have <300 words"),
          "recommendations": Array of strings (how to fix, e.g. "Expand thin content pages to 500+ words"),
          "impact": string (why this matters for SEO/AEO)
        },
        "schemaQuality": {
          "score": number,
          "issues": Array of strings,
          "recommendations": Array of strings,
          "impact": string
        },
        "metadataQuality": {
          "score": number,
          "issues": Array of strings,
          "recommendations": Array of strings,
          "impact": string
        },
        "technicalHealth": {
          "score": number,
          "issues": Array of strings,
          "recommendations": Array of strings,
          "impact": string
        },
        "architectureHealth": {
          "score": number,
          "issues": Array of strings,
          "recommendations": Array of strings,
          "impact": string
        }
      },
      "authorityMetrics": {
        "metadataOptimization": number (% of pages with title + meta desc)
      },
      "sitewideInsights": Array of up to 5 objects: {
        "title": string,
        "description": string,
        "impact": "critical" | "high" | "medium"
      },
      "aeoReadiness": {
        "score": number (0-100, how ready this domain is to be cited by ChatGPT, Perplexity, Gemini),
        "signals": {
          "hasAboutPage": boolean,
          "hasFaqContent": boolean,
          "hasStructuredQa": boolean,
          "hasAuthorOrExpertSignals": boolean,
          "hasClearTopicFocus": boolean,
          "hasSchemaForAi": boolean,
          "hasLongformContent": boolean
        },
        "verdict": string (2-3 sentences on AEO citation readiness)
      },
      "geoReadiness": {
        "score": number (0-100, how ready this domain is to appear in AI-generated search results like Google SGE, Bing Copilot),
        "signals": {
          "hasSocialProof": boolean (testimonials, reviews, case studies, client logos),
          "hasAuthoritySignals": boolean (certifications, awards, partnerships, media mentions),
          "hasFactualDensity": boolean (statistics, data points, specific numbers in content),
          "hasObjectiveTone": boolean (neutral, informative writing vs pure promotional),
          "hasCitableContent": boolean (unique research, original data, expert opinions),
          "hasBrandClarity": boolean (consistent brand identity, clear value proposition),
          "hasTopicalDepth": boolean (comprehensive coverage of core topics, not surface-level)
        },
        "verdict": string (2-3 sentences on GEO readiness for generative search)
      },
      "recommendations": Array of up to 15 objects: {
        "rank": number (1 through 15),
        "title": string (RUTHLESS ACTION - e.g. "Deploy Product Schema Sitewide"),
        "description": string (THE WHY/IMPACT REASONING),
        "howToFix": string (STEP-BY-STEP fix instructions, platform-specific if platform detected. Be thorough — include exact menu paths, file locations, plugin names, or code changes needed.),
        "codeSnippet": string (Before/after code example if applicable, or empty string if not code-related),
        "affectedElement": string (What specific element or pages are affected),
        "impact": "High" | "Medium",
        "priority": "CRITICAL" | "HIGH" | "MEDIUM" (CRITICAL = urgent fix needed now, HIGH = important to address soon, MEDIUM = moderate improvement),
        "effort": 1 | 2 | 3,
        "domain": "SEO" | "AEO" | "GEO" (which score domain this recommendation primarily improves. SEO = traditional search ranking factors like meta tags, content, internal linking, technical SEO. AEO = AI engine optimization like schema markup, structured data, FAQ content, entity clarity. GEO = generative engine optimization like brand authority, trust signals, social proof, citations, E-E-A-T signals.),
        "impactedScores": string (comma-separated list of specific scores and metrics this fix improves, e.g. "SEO Score, AEO Score, Rich Results, Brand Authority, Long-Tail Traffic")
      }
    }

    IMPORTANT FINAL INSTRUCTIONS:
    - You MUST generate up to 15 recommendations, prioritized by impact.
    - Aim for at least 3 CRITICAL, at least 3 HIGH, and at least 3 MEDIUM priority recommendations. Don't force a priority level if it's not warranted, but try hard to find issues at each level.
    - For schemaHealthAudit.issues, identify ONLY problems that would harm modern SEO/AEO (Google 2026, Bing 2026).
    - DO NOT flag valid JSON-LD patterns (arrays, @graph) as issues.
    - DO NOT penalize modern implementation patterns (distributed schema, multiple scripts).
    - Focus on ACTUAL problems: missing data, placeholder values, broken references, mismatched content.
    
    SCORING TRANSPARENCY:
    - When calculating pointsDeducted, consider the ACTUAL impact on Google's ability to parse and use the schema
    - Consider the ACTUAL impact on rich result eligibility
    - DO NOT deduct points for implementation style choices
    - DO NOT deduct points for valid JSON-LD patterns
    - BE CONSERVATIVE with penalties - only deduct for real problems
    - The overallScore should reflect: "How well will Google understand and use this schema?" NOT "Does this match legacy parser expectations?"
    
    MODERN CRAWLER IMPACT GUIDELINES:
    - modernCrawlerImpact: "high" = Google will penalize or fail to parse (missing required data, invalid JSON)
    - modernCrawlerImpact: "medium" = Limits rich results but schema still works (missing recommended properties)
    - modernCrawlerImpact: "low" = Optimization only, no real SEO impact (minor improvements)
    
    Be fair and accurate - this audit guides real business decisions.
    `;

  try {
    debugLog('[GEMINI-SITEWIDE] Calling Gemini API');
    console.log('[GEMINI-SITEWIDE] Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    debugLog('[GEMINI-SITEWIDE] Received response', { length: responseText.length, preview: responseText.substring(0, 200) });
    console.log('[GEMINI-SITEWIDE] Received response, length:', responseText.length);

    // Log Usage
    if (result.response.usageMetadata) {
      logUsage({
        model: modelName,
        type: "Sitewide Pro Audit",
        inputTokens: result.response.usageMetadata.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata.candidatesTokenCount || 0,
        url: context.domain
      });
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      debugLog('[GEMINI-SITEWIDE] ERROR: Failed to extract JSON from response', { responseText });
      console.error('[GEMINI-SITEWIDE] Failed to extract JSON from response');
      throw new Error("Could not parse AI response as JSON");
    }

    const aiResult = safeJsonParse(jsonMatch[0]);
    debugLog('[GEMINI-SITEWIDE] Parsed AI result', { 
      domainHealthScore: aiResult.domainHealthScore,
      recommendationsCount: aiResult.recommendations?.length,
      keys: Object.keys(aiResult)
    });
    console.log('[GEMINI-SITEWIDE] Parsed AI result, domainHealthScore:', aiResult.domainHealthScore);
    console.log('[GEMINI-SITEWIDE] AI recommendations count:', aiResult.recommendations?.length || 0);
    
    // Merge deterministic calculations with AI analysis
    const finalResult = {
      ...aiResult,
      consistencyScore: brandConsistency, // Override AI's brand consistency with deterministic value
      brandConsistencyBreakdown: brandConsistencyResult.breakdown, // Add detailed breakdown
      schemaHealthAudit, // Override AI's schema audit with deterministic validation
      domainHealthBreakdown: {
        ...aiResult.domainHealthBreakdown,
        schemaQuality: Math.round(avgSchemaScore) // Override with deterministic schema quality score
      },
      authorityMetrics: {
        schemaCoverage: Math.round(schemaCoverage),
        metadataOptimization: aiResult.authorityMetrics?.metadataOptimization || 0
      },
      _metadata: {
        inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
        model: modelName
      }
    };
    
    debugLog('[GEMINI-SITEWIDE] Final result assembled', { 
      domainHealthScore: finalResult.domainHealthScore,
      consistencyScore: finalResult.consistencyScore,
      schemaScore: finalResult.schemaHealthAudit.overallScore
    });
    console.log('[GEMINI-SITEWIDE] Final result assembled, returning to API');
    return finalResult;
  } catch (error) {
    debugLog('[GEMINI-SITEWIDE] ERROR', { error: error instanceof Error ? error.message : String(error) });
    console.error("[GEMINI-SITEWIDE] Error:", error);
    throw error;
  }
}

/**
 * Get fix instructions for common schema issues
 */
function getFixInstructions(issue: string, affectedType: string): string {
  if (issue.includes('Missing required property: name')) {
    return `Add the "name" property to your ${affectedType} schema with your business/organization name.`;
  }
  if (issue.includes('Missing required property: address')) {
    return `Add a complete "address" object with streetAddress, addressLocality, addressRegion, postalCode, and addressCountry.`;
  }
  if (issue.includes('Missing required property: telephone')) {
    return `Add the "telephone" property with your business phone number in international format (e.g., "+1-506-123-4567").`;
  }
  if (issue.includes('Placeholder data detected')) {
    return `Replace placeholder values (000-0000, example.com, etc.) with actual business information.`;
  }
  if (issue.includes('Incomplete address')) {
    return `Complete the address object with all required fields: streetAddress, addressLocality, postalCode.`;
  }
  if (issue.includes('No schema markup found')) {
    return `Add JSON-LD schema markup to your pages. Start with Organization or LocalBusiness schema in your layout.`;
  }
  return `Review schema.org documentation for ${affectedType} and ensure all required properties are present with valid data.`;
}
