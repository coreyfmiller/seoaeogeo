import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { logUsage } from "./usage";

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
}) {

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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
      "recommendations": Array of exactly 6 objects: {
        "rank": number (1-6),
        "title": string (RUTHLESS ACTION - e.g. "Fix H1 Tag Hierarchy"),
        "description": string (THE WHY/IMPACT REASONING),
        "priority": "high" | "medium" | "low",
        "category": "Schema" | "Content" | "AEO" | "Trust",
        "impact": "High" | "Medium"
      }
    }
    
    IMPORTANT: 
    - You MUST generate EXACTLY 6 recommendations
    - Evaluate schema using modern 2026 standards (arrays and @graph are valid)
    - Only flag real problems, not implementation style choices
  `;


  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Log Usage
    if (result.response.usageMetadata) {
      logUsage({
        model: "gemini-2.5-flash",
        type: "Single Page Audit",
        inputTokens: result.response.usageMetadata.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata.candidatesTokenCount || 0,
        url: context.title
      });
    }

    // Extract JSON from potential markdown code blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
