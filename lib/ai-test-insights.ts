/**
 * AI Test Insights Generator
 * Analyzes combined results from all engines to produce actionable insights.
 * Only runs when user provides their URL.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiModel } from './gemini-model-resolver'
import { safeJsonParse } from './utils/json-sanitizer'

interface InsightsInput {
  keyword: string
  userUrl: string
  googleFound: boolean
  googleRank: number | null // position in Google results, null if not found
  aiEnginesFound: number // 0-3
  aiEngineNames: string[] // which engines found the user
  topCompetitors: string[] // names of sites that appear across multiple engines
  consensus: { name: string; engines: string[] }[]
}

export interface AITestInsights {
  visibility: string // one-liner about current visibility
  competitors: string // who's beating them and why
  actions: string[] // 2-3 specific actions
  nextTool: { name: string; reason: string } // which Duelly tool to use next
}

export async function generateAITestInsights(input: InsightsInput): Promise<AITestInsights | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
    const modelName = await getGeminiModel()
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
    })

    const hasUserUrl = !!input.userUrl
    const prompt = hasUserUrl
      ? `You are an SEO and AI visibility expert. Analyze these search results and give actionable advice.

Keyword: "${input.keyword}"
User's website: ${input.userUrl}

Google Search: ${input.googleFound ? `Found at position #${input.googleRank}` : 'NOT found in top results'}
AI Engines that recommend the user's site: ${input.aiEnginesFound}/3 (${input.aiEngineNames.length > 0 ? input.aiEngineNames.join(', ') : 'none'})

Top competitors appearing across multiple engines:
${input.consensus.map(c => `- ${c.name} (found by: ${c.engines.join(', ')})`).join('\n') || 'None identified'}

Return a JSON object with:
{
  "visibility": "One sentence summary of their current visibility status",
  "competitors": "One sentence about who's outranking them and what those sites likely have",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "nextTool": { "name": "pro-audit OR keyword-arena OR battle-mode", "reason": "Why this tool would help" }
}

Rules for nextTool:
- If not found on Google at all → "pro-audit"
- If found on Google but not by AI → "pro-audit"
- If found by some but want to compare → "keyword-arena"
- If found everywhere → "battle-mode"

Keep actions specific to the keyword. No generic advice. Max 15 words per action.
Return ONLY the JSON object.`
      : `You are an SEO and AI visibility expert. Analyze these search results for the keyword "${input.keyword}".

Top sites appearing across multiple AI engines and Google:
${input.consensus.map(c => `- ${c.name} (found by: ${c.engines.join(', ')})`).join('\n') || 'No consensus yet'}

What makes these sites rank well for "${input.keyword}"? Give 3 specific, actionable tips for any business wanting to rank for this keyword.

Return a JSON object with:
{
  "visibility": "One sentence about what it takes to rank for this keyword",
  "competitors": "One sentence about what the top-ranking sites have in common",
  "actions": ["Tip 1", "Tip 2", "Tip 3"],
  "nextTool": { "name": "pro-audit", "reason": "Run a Pro Audit to see how your site compares" }
}

Keep tips specific to this keyword type. Max 15 words per tip.
Return ONLY the JSON object.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = safeJsonParse(match[0])
    if (!parsed || !parsed.visibility) return null

    return {
      visibility: parsed.visibility || '',
      competitors: parsed.competitors || '',
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : [],
      nextTool: parsed.nextTool || { name: 'pro-audit', reason: 'Run a full audit to identify issues' },
    }
  } catch (err) {
    console.error('[AI Test Insights] Failed:', err instanceof Error ? err.message : err)
    return null
  }
}
