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
    console.log(`[AI Test Insights] Gemini response length: ${text.length}`)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      console.log('[AI Test Insights] No JSON object found in response, using fallback')
      return buildFallbackInsights(input)
    }
    const parsed = safeJsonParse(match[0])
    if (!parsed || !parsed.visibility) {
      console.log('[AI Test Insights] Parsed object missing visibility, using fallback')
      return buildFallbackInsights(input)
    }

    return {
      visibility: parsed.visibility || '',
      competitors: parsed.competitors || '',
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : [],
      nextTool: parsed.nextTool || { name: 'pro-audit', reason: 'Run a full audit to identify issues' },
    }
  } catch (err) {
    console.error('[AI Test Insights] Failed:', err instanceof Error ? err.message : err)
    return buildFallbackInsights(input)
  }
}

/** Build deterministic insights from the data when Gemini fails */
function buildFallbackInsights(input: InsightsInput): AITestInsights {
  const hasUserUrl = !!input.userUrl
  const topCompetitor = input.consensus[0]?.name || 'your competitors'

  if (hasUserUrl) {
    const found = input.aiEnginesFound
    const googleFound = input.googleFound
    const visibility = googleFound
      ? found > 0
        ? `Your site appears in Google Search and ${found} AI engine${found > 1 ? 's' : ''} for "${input.keyword}".`
        : `Your site appears in Google Search but no AI engines recommend it for "${input.keyword}".`
      : `Your site is not appearing in Google Search or AI results for "${input.keyword}".`

    const competitors = input.consensus.length > 0
      ? `${topCompetitor} is consistently recommended across multiple engines for this keyword.`
      : `No clear consensus competitor identified — results vary across engines.`

    const actions = googleFound && found === 0
      ? ['Add structured data (schema markup) to help AI engines understand your business', 'Create content that directly answers questions about ' + input.keyword, 'Ensure your Google Business Profile is complete and up to date']
      : !googleFound
        ? ['Optimize your page title and meta description for "' + input.keyword + '"', 'Build local citations and directory listings for your area', 'Add location-specific content to your website']
        : ['Run a Pro Audit to identify technical issues holding you back', 'Compare your site against top competitors in Keyword Arena', 'Review your AEO score to improve AI engine visibility']

    const nextTool = !googleFound
      ? { name: 'pro-audit', reason: 'Fix the fundamentals — your site needs SEO work before AI can find it' }
      : found < 2
        ? { name: 'pro-audit', reason: 'Improve your AEO score to get recommended by more AI engines' }
        : { name: 'keyword-arena', reason: 'See how your scores compare against the top competitors' }

    return { visibility, competitors, actions, nextTool }
  }

  // No user URL — general keyword insights
  const visibility = input.consensus.length > 0
    ? `For "${input.keyword}", ${topCompetitor} leads across multiple search engines.`
    : `Results for "${input.keyword}" vary significantly across different AI engines.`

  const competitors = input.consensus.length > 0
    ? `Sites like ${input.consensus.slice(0, 2).map(c => c.name).join(' and ')} appear consistently — they likely have strong local signals and reviews.`
    : `No single site dominates — this keyword has an opportunity for a well-optimized local business.`

  return {
    visibility,
    competitors,
    actions: [
      'Ensure your Google Business Profile is fully optimized with photos and reviews',
      'Add LocalBusiness schema markup to your website',
      'Create content that mentions your city and service type together',
    ],
    nextTool: { name: 'pro-audit', reason: 'Run a Pro Audit on your site to see how it compares' },
  }
}
