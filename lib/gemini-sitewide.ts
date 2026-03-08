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
    schemaTypes?: string[];
    wordCount?: number;
    internalLinks?: number;
    hasH1?: boolean;
    isHttps?: boolean;
    responseTimeMs?: number;
  }>;
}) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const pagesSummary = context.pages.map(p => `
  - URL: ${p.url}
  - Title: ${p.title}
  - Meta Description: ${p.description || "MISSING"}
  - Schema Types: ${p.schemaTypes && p.schemaTypes.length > 0 ? p.schemaTypes.join(', ') : "None"}
  - Word Count: ${p.wordCount ?? "Unknown"}
  - Internal Links: ${p.internalLinks ?? "Unknown"}
  - Has H1: ${p.hasH1 ? "Yes" : "No"}
  - HTTPS: ${p.isHttps ? "Yes" : "No"}
  - Response Time: ${p.responseTimeMs ? `${p.responseTimeMs}ms` : "Unknown"}
  `).join('\n');

  const prompt = `
    Perform a PRO Deep Site Audit for the domain: ${context.domain}.
    
    DATA FROM ${context.pages.length} PAGES:
    ${pagesSummary}
    
    Analyze the full dataset and return a JSON object exactly matching this structure. No markdown, pure JSON:
    {
      "domainHealthScore": number (0-100, aggregate health across all pages),
      "consistencyScore": number (0-100, how consistent brand/meta is across pages),
      "authorityMetrics": {
        "schemaCoverage": number (% of pages with any schema),
        "metadataOptimization": number (% of pages with title + meta desc),
        "h1Coverage": number (% of pages with an H1 tag),
        "httpsCompliance": number (% of pages on HTTPS)
      },
      "sitewideInsights": Array of up to 5 objects: {
        "title": string,
        "description": string,
        "impact": "critical" | "high" | "medium"
      },
      "contentGapAnalysis": Array of up to 4 objects: {
        "missingPage": string (e.g. "FAQ Page", "Case Studies", "Pricing"),
        "reason": string (why it matters for SEO/AEO)
      },
      "cannibalizationRisks": Array of up to 3 objects: {
        "pageA": string (URL),
        "pageB": string (URL),
        "conflictingTopic": string
      },
      "internalLinkLeaders": Array of up to 5 URLs that receive the most internal links (estimate from available data),
      "orphanPageRisks": Array of up to 3 URLs that appear to have low internal link equity,
      "navigationAnalysis": string (2-3 sentence summary of site architecture quality),
      "brandClarityVerdict": string (2-3 sentence expert brand verdict)
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
