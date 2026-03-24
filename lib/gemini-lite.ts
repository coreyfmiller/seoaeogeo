import { GoogleGenerativeAI } from "@google/generative-ai";
import { logUsage } from "./usage";
import { safeJsonParse } from "./utils/json-sanitizer";
import { getGeminiModel } from "./gemini-model-resolver";
import { calculateBrandConsistency } from "./schema-validator";
import { formatSiteType } from "./site-type-detector";
import type { SiteType } from "./types/audit";

/**
 * Lite AI Analysis — minimal token usage for free tier.
 * Returns only Domain Health score + breakdown and Brand Consistency.
 * ~1,500-2,000 tokens total vs ~6,000-10,000 for full sitewide.
 */
export async function analyzeLiteIntelligence(context: {
  domain: string;
  title: string;
  description: string;
  wordCount: number;
  hasH1: boolean;
  isHttps: boolean;
  responseTimeMs: number;
  schemaCount: number;
  imgTotal: number;
  imgWithAlt: number;
  internalLinks: number;
  siteType?: SiteType;
}) {
  // Deterministic brand consistency (single page = 100% consistent)
  const brandConsistency = 100;

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const modelName = await getGeminiModel();
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are a concise SEO auditor. Analyze this single page and return a JSON object.
${context.siteType ? `Site type: ${formatSiteType(context.siteType)}.` : ''}

PAGE DATA:
- Domain: ${context.domain}
- Title: ${context.title || "MISSING"}
- Meta Description: ${context.description || "MISSING"}
- Word Count: ${context.wordCount}
- H1: ${context.hasH1 ? "Yes" : "No"}
- HTTPS: ${context.isHttps ? "Yes" : "No"}
- Response Time: ${context.responseTimeMs}ms
- Schema Markup: ${context.schemaCount} found
- Images: ${context.imgTotal} total, ${context.imgWithAlt} with alt
- Internal Links: ${context.internalLinks}

Return ONLY this JSON (no markdown):
{
  "domainHealthBreakdown": {
    "contentQuality": number (0-100),
    "schemaQuality": number (0-100),
    "metadataQuality": number (0-100),
    "technicalHealth": number (0-100),
    "architectureHealth": number (0-100)
  }
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (result.response.usageMetadata) {
      logUsage({
        model: modelName,
        type: "Lite Free Audit",
        inputTokens: result.response.usageMetadata.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata.candidatesTokenCount || 0,
        url: context.domain,
      });
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse lite AI response");

    const aiResult = safeJsonParse(jsonMatch[0]);

    // Calculate domain health score deterministically from breakdown (don't trust AI's math)
    const breakdown = aiResult.domainHealthBreakdown || {};
    const scores = [
      breakdown.contentQuality ?? 0,
      breakdown.schemaQuality ?? 0,
      breakdown.metadataQuality ?? 0,
      breakdown.technicalHealth ?? 0,
      breakdown.architectureHealth ?? 0,
    ];
    const calculatedHealthScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return {
      domainHealthScore: calculatedHealthScore,
      domainHealthBreakdown: breakdown,
      brandConsistency,
      _metadata: {
        inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
        outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
        model: modelName,
      },
    };
  } catch (error) {
    console.error("[GEMINI-LITE] Error:", error);
    return null;
  }
}
