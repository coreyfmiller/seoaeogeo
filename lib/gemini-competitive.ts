import { GoogleGenerativeAI } from "@google/generative-ai";
import { logUsage } from "./usage";

/**
 * Comparative Analysis: Compares two sites and identifies competitive gaps.
 */
export async function analyzeCompetitive(siteA: {
  title: string;
  description: string;
  thinnedText: string;
  schemas: any[];
}, siteB: {
  title: string;
  description: string;
  thinnedText: string;
  schemas: any[];
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
    Perform a Detailed Competitive Search Intelligence Analysis between two websites using MODERN 2026 STANDARDS.
    
    MODERN EVALUATION STANDARDS:
    - JSON-LD arrays and @graph structures are VALID (don't penalize)
    - Evaluate schema quality, not just presence
    - Focus on actual competitive advantages, not implementation style
    
    SITE A (TARGET):
    - TITLE: ${siteA.title}
    - CONTENT: ${siteA.thinnedText.substring(0, 5000)}
    - SCHEMAS (Normalized): ${JSON.stringify(siteA.schemas)}
    
    SITE B (COMPETITOR):
    - TITLE: ${siteB.title}
    - CONTENT: ${siteB.thinnedText.substring(0, 5000)}
    - SCHEMAS (Normalized): ${JSON.stringify(siteB.schemas)}
    
    Compare them across SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization).
    Identify specific "Stolen Opportunities" where Site B is outperforming Site A in LLM citations or Answer Box presence.
    
    Return a JSON object exactly matching this structure:
    {
      "comparison": {
        "seo": { "siteA": number (0-100), "siteB": number (0-100), "winner": "siteA" | "siteB" },
        "aeo": { "siteA": number (0-100), "siteB": number (0-100), "winner": "siteA" | "siteB" },
        "geo": { "siteA": number (0-100), "siteB": number (0-100), "winner": "siteA" | "siteB" }
      },
      "stolenOpportunities": Array<{
        "title": string,
        "description": string,
        "priority": "high" | "medium" | "low",
        "category": "seo" | "aeo" | "geo"
      }>,
      "strategicGaps": string[],
      "winnerVerdict": string,
      "recommendations": Array<{
        "rank": number (1-6),
        "title": string (RUTHLESS ACTION - e.g. "Clone Competitor's FAQ Structure"),
        "description": string (THE WHY/IMPACT REASONING),
        "roi": "CRITICAL" | "HIGH" | "STEADY",
        "effort": 1 | 2 | 3,
        "impactedScores": string (e.g. "AEO Score, Brand Clarity, Trust"),
        "category": "Schema" | "Content" | "AEO" | "Trust",
        "impact": "High" | "Medium"
      }>
    }
    
    IMPORTANT: 
    - You MUST generate EXACTLY 6 recommendations
    - Use modern 2026 crawler standards (arrays and @graph are valid)
    - Focus on real competitive advantages, not implementation style
    `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Log Usage
    if (result.response.usageMetadata) {
      logUsage({
        model: "gemini-2.5-flash",
        type: "Competitive Battle",
        inputTokens: result.response.usageMetadata.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata.candidatesTokenCount || 0,
        url: `${siteA.title} vs ${siteB.title}`
      });
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Competitive Analysis Error:", error);
    throw error;
  }
}
