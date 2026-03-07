import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Perform a Detailed Competitive Search Intelligence Analysis between two websites.
    
    SITE A (TARGET):
    - TITLE: ${siteA.title}
    - CONTENT: ${siteA.thinnedText.substring(0, 5000)}
    - SCHEMAS: ${JSON.stringify(siteA.schemas)}
    
    SITE B (COMPETITOR):
    - TITLE: ${siteB.title}
    - CONTENT: ${siteB.thinnedText.substring(0, 5000)}
    - SCHEMAS: ${JSON.stringify(siteB.schemas)}
    
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
      "winnerVerdict": string
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Competitive Analysis Error:", error);
        throw error;
    }
}
