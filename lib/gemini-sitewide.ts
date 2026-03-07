import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Sitewide Analysis: Analyzes aggregate data from multiple pages.
 */
export async function analyzeSitewideIntelligence(context: {
    domain: string;
    pages: Array<{
        url: string;
        title: string;
        description: string;
        schemas: any[];
    }>;
}) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Perform a PRO Deep Site Audit for the domain: ${context.domain}.
    
    DATA FROM ${context.pages.length} PAGES:
    ${context.pages.map(p => `
    - URL: ${p.url}
    - Title: ${p.title}
    - Meta: ${p.description}
    - Schemas Found: ${p.schemas.length > 0 ? "Yes" : "None"}
    `).join('\n')}
    
    Your goal is to provide a "Macro" view of the site's Search Intelligence.
    Focus on:
    1. Brand Consistency: Does every page align with the core brand message?
    2. Architecture Gaps: Are they missing key pages (About, FAQ, Services)?
    3. Structural Authority: Is JSON-LD schema applied consistently across all pages or just the home?
    4. Opportunity Map: Identify the top 3 high-impact sitewide changes.

    Return a JSON object exactly matching this structure:
    {
      "domainHealthScore": number (0-100),
      "consistencyScore": number (0-100),
      "authorityMetrics": {
        "schemaCoverage": number (percentage of pages with schema),
        "metadataOptimization": number (percentage of optimized pages)
      },
      "sitewideInsights": Array<{
        "title": string,
        "description": string,
        "impact": "critical" | "high" | "medium"
      }>,
      "navigationAnalysis": string,
      "brandClarityVerdict": string
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Sitewide Analysis Error:", error);
        throw error;
    }
}
