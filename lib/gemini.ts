import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

/**
 * Prompt to analyze website data for SEO, AEO, and GEO.
 * Returns a strictly typed JSON object.
 */
export async function analyzeWithGemini(context: {
  title: string;
  description: string;
  thinnedText: string;
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

  const prompt = `
    You are a ruthless, highly-critical Search Intelligence Analyst evaluating a website for SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization).
    
    CRITICAL GRADING RULES - DO NOT IGNORE:
    1. Base Score is ZERO. Sites must EARN points. Do not give "benefit of the doubt" scores.
    2. Any site with under 500 words of body text should not exceed 40/100 in any category.
    3. Sites with NO LD+JSON schema MUST be heavily penalized in AEO/GEO (Max score 30).
    4. If there is little to no internal linking, penalize SEO heavily.
    5. Be brutal but accurate. A 15-year old local business site with generic copy should score below 30.

    Analyze the following extracted data:
    
    WEBSITE TITLE: ${context.title}
    METADATA: ${context.description}
    LD+JSON SCHEMAS: ${JSON.stringify(context.schemas)}
    
    STRUCTURAL DATA (Extracted from DOM):
    ${context.structuralData ? JSON.stringify(context.structuralData, null, 2) : "Not available"}
    
    BODY CONTENT (THINNED): 
    ---
    ${context.thinnedText}
    ---

    Return a JSON object exactly matching this structure:
    {
      "scores": {
        "seo": number (0-100),
        "aeo": number (0-100),
        "geo": number (0-100)
      },
      "penaltyLedger": Array<{
        "category": "seo" | "aeo" | "geo",
        "penalty": string,
        "pointsDeducted": number (e.g., -20)
      }>,
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
      "recommendations": Array<{
        "title": string,
        "description": string,
        "priority": "high" | "medium" | "low",
        "category": "seo" | "aeo" | "geo",
        "impact": string
      }>
    }
  `;


  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from potential markdown code blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
