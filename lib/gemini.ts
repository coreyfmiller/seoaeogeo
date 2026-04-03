import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { logUsage } from "./usage";
import { safeJsonParse } from "./utils/json-sanitizer";
import { getGeminiModel } from "./gemini-model-resolver";

/**
 * Prompt to analyze website data for SEO, AEO, and GEO using MODERN 2026 STANDARDS.
 * Returns a strictly typed JSON object.
 */
export async function analyzeWithGemini(context: {
  title: string;
  description: string;
  thinnedText: string; // Deprecated but kept for compatibility
  summarizedContent?: string; // NEW: Optimized content
  schemas: any[];
  structuralData?: any;
  platform?: string;
}) {

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const modelName = await getGeminiModel();
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.1,
      topP: 0.1,
      responseMimeType: "application/json"
    }
  });

  // Use full thinned text for now - summarized content causes score instability
  // TODO: Revisit optimization after stabilizing scoring algorithm
  const contentToAnalyze = context.thinnedText;

  const prompt = `
    You are a Search Intelligence Analyst evaluating a website using MODERN CRAWLER STANDARDS (Google 2026, Bing 2026).
    
    MODERN SCHEMA EVALUATION STANDARDS:
    - JSON-LD arrays at root level are VALID and PREFERRED
    - @graph structures are VALID and should be parsed correctly
    - Multiple schema blocks per page are VALID
    - Only penalize: missing required properties, placeholder data (000-0000, example@example.com), invalid JSON
    - DO NOT penalize: arrays, @graph, distributed schema patterns
    
    CRITICAL EXTRACTION RULES:
    1. You are a Semantic Data Extractor providing objective analysis
    2. Rate each semantic flag as a SEVERITY SCORE from 0-100 (0 = not present at all, 100 = extremely severe). Be precise and consistent.
    3. Evaluate schema quality using modern standards (not legacy parser rules)
    4. Generate qualitative analysis for dashboard UI
    
    Analyze the following extracted data:
    
    WEBSITE TITLE: ${context.title}
    METADATA: ${context.description}
    LD+JSON SCHEMAS (Normalized): ${JSON.stringify(context.schemas, null, 2)}
    
    STRUCTURAL DATA (Extracted from DOM):
    ${context.structuralData ? JSON.stringify(context.structuralData, null, 2) : "Not available"}
    
    CONTENT SUMMARY (Optimized Extract):
    ---
    ${contentToAnalyze}
    ---
${context.platform ? `
    DETECTED PLATFORM: ${context.platform}
    All fix instructions and recommendations MUST be tailored to ${context.platform}. Reference specific ${context.platform} admin paths, plugins/apps/extensions, template files, and platform-specific approaches. Do NOT give generic HTML fixes when a ${context.platform}-specific solution exists.
` : ''}
    Return a JSON object exactly matching this structure:
    {
      "semanticFlags": {
        "topicMisalignment": number (0-100 severity, 0=perfectly aligned, 100=completely off-topic),
        "keywordStuffing": number (0-100 severity, 0=natural keyword usage, 100=extreme stuffing),
        "poorReadability": number (0-100 severity, 0=crystal clear, 100=incomprehensible),
        "noDirectQnAMatching": number (0-100 severity, 0=excellent Q&A coverage, 100=no questions answered),
        "lowEntityDensity": number (0-100 severity, 0=rich in entities, 100=no specific entities),
        "poorFormattingConciseness": number (0-100 severity, 0=well formatted, 100=wall of text),
        "lackOfDefinitionStatements": number (0-100 severity, 0=clear definitions present, 100=no definitions),
        "promotionalTone": number (0-100 severity, 0=neutral/informative, 100=pure advertisement),
        "lackOfExpertiseSignals": number (0-100 severity, 0=strong expertise shown, 100=no expertise signals),
        "lackOfHardData": number (0-100 severity, 0=data-rich content, 100=no facts or data),
        "heavyFirstPersonUsage": number (0-100 severity, 0=objective third-person, 100=entirely first-person),
        "unsubstantiatedClaims": number (0-100 severity, 0=all claims backed, 100=all claims unsubstantiated)
      },
      "schemaQuality": {
        "score": number (0-100, quality of schema implementation using modern standards),
        "hasSchema": boolean,
        "schemaTypes": string[] (types found, e.g. ["Organization", "LocalBusiness"]),
        "issues": string[] (specific problems found, e.g. "Missing required 'address' property in LocalBusiness"),
        "strengths": string[] (what's implemented well)
      },
      "seoAnalysis": {
        "onPageIssues": string[],
        "keywordOpportunities": string[],
        "contentQuality": "excellent" | "good" | "fair" | "poor" | "unacceptable",
        "metaAnalysis": string
      },
      "aeoAnalysis": {
        "questionsAnswered": { "who": number, "what": number, "where": number, "why": number, "how": number },
        "missingSchemas": string[],
        "snippetEligibilityScore": number,
        "topOpportunities": string[]
      },
      "geoAnalysis": {
        "sentimentScore": number (percentage -100 to 100),
        "brandPerception": "positive" | "neutral" | "negative",
        "citationLikelihood": number (0-100),
        "llmContextClarity": number (0-100),
        "visibilityGaps": string[]
      },
      "recommendations": Array of up to 15 objects: {
        "rank": number (1-15),
        "title": string (RUTHLESS ACTION - e.g. "Fix H1 Tag Hierarchy"),
        "description": string (THE WHY/IMPACT REASONING),
        "howToFix": string (STEP-BY-STEP fix instructions, platform-specific if platform detected. Be thorough — include exact menu paths, file locations, plugin names, or code changes needed.),
        "codeSnippet": string (Before/after code example if applicable, or empty string if not code-related),
        "affectedElement": string (What specific element on the page is the problem, e.g. "Second <h1> tag: About Us"),
        "priority": "CRITICAL" | "HIGH" | "MEDIUM" (CRITICAL = urgent fix needed now, HIGH = important to address soon, MEDIUM = moderate improvement),
        "effort": 1 | 2 | 3,
        "domain": "SEO" | "AEO" | "GEO" (which score domain this recommendation primarily improves. SEO = traditional search ranking factors like meta tags, content, internal linking, technical SEO. AEO = AI engine optimization like schema markup, structured data, FAQ content, entity clarity. GEO = generative engine optimization like brand authority, trust signals, social proof, citations, E-E-A-T signals.),
        "impact": "High" | "Medium",
        "impactedScores": string (comma-separated list of specific scores and metrics this fix improves, e.g. "SEO Score, AEO Score, Rich Results, Brand Authority, Long-Tail Traffic")
      }
    }
    
    IMPORTANT: 
    - You MUST generate up to 15 recommendations, prioritized by impact. Include every actionable issue you find — do not artificially limit.
    - Aim for at least 3 CRITICAL, at least 3 HIGH, and at least 3 MEDIUM priority recommendations. Don't force a priority level if it's not warranted, but try hard to find issues at each level.
    - Evaluate schema using modern 2026 standards (arrays and @graph are valid)
    - Only flag real problems, not implementation style choices
  `;


  try {
    // Run 2 parallel Gemini calls and average semanticFlags for scoring stability
    const [result1, result2] = await Promise.all([
      model.generateContent(prompt),
      model.generateContent(prompt),
    ]);

    const responseText1 = result1.response.text();
    const responseText2 = result2.response.text();

    // Log combined usage
    const totalInput = (result1.response.usageMetadata?.promptTokenCount || 0) +
                       (result2.response.usageMetadata?.promptTokenCount || 0);
    const totalOutput = (result1.response.usageMetadata?.candidatesTokenCount || 0) +
                        (result2.response.usageMetadata?.candidatesTokenCount || 0);
    if (totalInput > 0) {
      logUsage({
        model: modelName,
        type: "Single Page Audit (2-call avg)",
        inputTokens: totalInput,
        outputTokens: totalOutput,
        url: context.title
      });
    }

    const jsonMatch1 = responseText1.match(/\{[\s\S]*\}/);
    const jsonMatch2 = responseText2.match(/\{[\s\S]*\}/);
    if (!jsonMatch1) throw new Error("Could not parse AI response 1 as JSON");

    const parsed1 = safeJsonParse(jsonMatch1[0]);

    // If second call failed, just use first result
    if (!jsonMatch2) {
      console.warn("[Gemini] Second call failed to parse, using single result");
      return parsed1;
    }

    const parsed2 = safeJsonParse(jsonMatch2[0]);

    // Average the semanticFlags severity scores for stability
    const flags1 = parsed1.semanticFlags || {};
    const flags2 = parsed2.semanticFlags || {};
    const flagKeys = [
      'topicMisalignment', 'keywordStuffing', 'poorReadability',
      'noDirectQnAMatching', 'lowEntityDensity', 'poorFormattingConciseness',
      'lackOfDefinitionStatements', 'promotionalTone', 'lackOfExpertiseSignals',
      'lackOfHardData', 'heavyFirstPersonUsage', 'unsubstantiatedClaims'
    ];

    const averagedFlags: Record<string, number> = {};
    for (const key of flagKeys) {
      const v1 = typeof flags1[key] === 'number' ? flags1[key] : (flags1[key] ? 100 : 0);
      const v2 = typeof flags2[key] === 'number' ? flags2[key] : (flags2[key] ? 100 : 0);
      averagedFlags[key] = Math.round((v1 + v2) / 2);
    }

    // Average schemaQuality score too
    const sq1 = parsed1.schemaQuality?.score || 0;
    const sq2 = parsed2.schemaQuality?.score || 0;

    // Use first result as base, override with averaged values
    const merged = {
      ...parsed1,
      semanticFlags: averagedFlags,
      schemaQuality: {
        ...parsed1.schemaQuality,
        score: Math.round((sq1 + sq2) / 2),
      },
    };

    console.log('[Gemini] Averaged semanticFlags from 2 calls:', JSON.stringify(averagedFlags));
    return merged;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

/**
 * Single-call variant of analyzeWithGemini for batch/arena use.
 * Same prompt, same model, same output — but only 1 Gemini call instead of 2.
 * Trades scoring stability for lower cost and rate-limit friendliness.
 */
export async function analyzeWithGeminiSingle(context: {
  title: string;
  description: string;
  thinnedText: string;
  summarizedContent?: string;
  schemas: any[];
  structuralData?: any;
  platform?: string;
}) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const modelName = await getGeminiModel();
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.1,
      topP: 0.1,
      responseMimeType: "application/json"
    }
  });

  const contentToAnalyze = context.thinnedText;

  const prompt = `
    You are a Search Intelligence Analyst evaluating a website using MODERN CRAWLER STANDARDS (Google 2026, Bing 2026).
    
    MODERN SCHEMA EVALUATION STANDARDS:
    - JSON-LD arrays at root level are VALID and PREFERRED
    - @graph structures are VALID and should be parsed correctly
    - Multiple schema blocks per page are VALID
    - Only penalize: missing required properties, placeholder data (000-0000, example@example.com), invalid JSON
    - DO NOT penalize: arrays, @graph, distributed schema patterns
    
    CRITICAL EXTRACTION RULES:
    1. You are a Semantic Data Extractor providing objective analysis
    2. Rate each semantic flag as a SEVERITY SCORE from 0-100 (0 = not present at all, 100 = extremely severe). Be precise and consistent.
    3. Evaluate schema quality using modern standards (not legacy parser rules)
    4. Generate qualitative analysis for dashboard UI
    
    Analyze the following extracted data:
    
    WEBSITE TITLE: ${context.title}
    METADATA: ${context.description}
    LD+JSON SCHEMAS (Normalized): ${JSON.stringify(context.schemas, null, 2)}
    
    STRUCTURAL DATA (Extracted from DOM):
    ${context.structuralData ? JSON.stringify(context.structuralData, null, 2) : "Not available"}
    
    CONTENT SUMMARY (Optimized Extract):
    ---
    ${contentToAnalyze}
    ---
${context.platform ? `
    DETECTED PLATFORM: ${context.platform}
    All fix instructions and recommendations MUST be tailored to ${context.platform}.
` : ''}
    Return a JSON object exactly matching this structure:
    {
      "semanticFlags": {
        "topicMisalignment": number (0-100),
        "keywordStuffing": number (0-100),
        "poorReadability": number (0-100),
        "noDirectQnAMatching": number (0-100),
        "lowEntityDensity": number (0-100),
        "poorFormattingConciseness": number (0-100),
        "lackOfDefinitionStatements": number (0-100),
        "promotionalTone": number (0-100),
        "lackOfExpertiseSignals": number (0-100),
        "lackOfHardData": number (0-100),
        "heavyFirstPersonUsage": number (0-100),
        "unsubstantiatedClaims": number (0-100)
      },
      "schemaQuality": {
        "score": number (0-100),
        "hasSchema": boolean,
        "schemaTypes": string[],
        "issues": string[],
        "strengths": string[]
      }
    }
    
    IMPORTANT: Return ONLY semanticFlags and schemaQuality. No recommendations, no analysis sections.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (result.response.usageMetadata) {
      logUsage({
        model: modelName,
        type: "Arena Single-Call Audit",
        inputTokens: result.response.usageMetadata.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata.candidatesTokenCount || 0,
        url: context.title
      });
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    return safeJsonParse(jsonMatch[0]);
  } catch (error) {
    console.error("[Gemini Single] Error:", error);
    throw error;
  }
}
