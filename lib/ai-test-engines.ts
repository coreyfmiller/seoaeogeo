/**
 * AI Test — Query multiple AI engines for keyword recommendations.
 * Each engine is asked: "Recommend the top 5 businesses for [keyword]"
 * Returns structured results per engine.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiModel } from './gemini-model-resolver'
import { safeJsonParse } from './utils/json-sanitizer'
import { searchGoogle } from './google-search'

/**
 * Extract a JSON array from messy AI text responses.
 * Tries multiple strategies: direct match, code block extraction, 
 * individual object extraction, etc.
 */
function extractJsonArray(text: string): any[] | null {
  // Strategy 1: Match a JSON array directly
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    try {
      const parsed = safeJsonParse(arrayMatch[0])
      if (Array.isArray(parsed)) return parsed
    } catch {}
  }

  // Strategy 2: Extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      const parsed = safeJsonParse(codeBlockMatch[1].trim())
      if (Array.isArray(parsed)) return parsed
    } catch {}
  }

  // Strategy 3: Find individual JSON objects and collect them
  const objectMatches = text.match(/\{[^{}]*"name"\s*:\s*"[^"]*"[^{}]*\}/g)
  if (objectMatches && objectMatches.length > 0) {
    const items: any[] = []
    for (const objStr of objectMatches) {
      try {
        const obj = safeJsonParse(objStr)
        if (obj && obj.name) items.push(obj)
      } catch {}
    }
    if (items.length > 0) return items
  }

  // Strategy 4: Regex extraction of name/url/reason patterns from text
  const linePattern = /(?:^|\n)\s*\d+[\.\)]\s*(?:\*\*)?(.+?)(?:\*\*)?\s*[-–—]\s*(https?:\/\/\S+)?\s*[-–—:]\s*(.+)/gm
  const lineItems: any[] = []
  let lineMatch
  while ((lineMatch = linePattern.exec(text)) !== null) {
    lineItems.push({
      name: lineMatch[1]?.trim() || 'Unknown',
      url: lineMatch[2]?.trim() || '',
      reason: lineMatch[3]?.trim() || '',
    })
  }
  if (lineItems.length > 0) return lineItems

  return null
}

/** Validate a URL actually resolves to a real site (not parked/placeholder) */
async function validateUrl(url: string): Promise<'valid' | 'parked' | 'invalid'> {
  if (!url || url.trim() === '') return 'invalid'
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DuellyBot/1.0)' },
    })
    if (!res.ok && res.status !== 403) return 'invalid'

    const text = await res.text()
    const lower = text.toLowerCase()
    const parkedIndicators = [
      'domain is for sale', 'buy this domain', 'domain parking',
      'this domain may be for sale', 'parked free', 'godaddy',
      'sedoparking', 'hugedomains', 'afternic', 'dan.com',
      'this webpage is not available', 'domain expired',
      'namecheap', 'this domain is registered at',
    ]
    if (parkedIndicators.some(indicator => lower.includes(indicator))) return 'parked'
    if (text.length < 500) return 'parked'

    return 'valid'
  } catch {
    return 'invalid'
  }
}

/** Validate URLs in recommendations — flag bad ones instead of stripping */
async function validateRecommendationUrls(recs: AITestRecommendation[]): Promise<AITestRecommendation[]> {
  const validated = await Promise.all(
    recs.map(async (rec) => {
      if (!rec.url || rec.url.trim() === '') return rec
      const status = await validateUrl(rec.url)
      if (status === 'invalid') {
        console.log(`[AI Test] Invalid URL flagged: ${rec.url} for "${rec.name}"`)
        return { ...rec, urlStatus: 'invalid' as const }
      }
      if (status === 'parked') {
        console.log(`[AI Test] Parked domain flagged: ${rec.url} for "${rec.name}"`)
        return { ...rec, urlStatus: 'parked' as const }
      }
      return { ...rec, urlStatus: 'valid' as const }
    })
  )
  return validated
}

export interface AITestRecommendation {
  rank: number
  name: string
  url?: string
  urlStatus?: 'valid' | 'invalid' | 'parked'
  reason: string
}

export interface AITestEngineResult {
  engine: 'gemini' | 'chatgpt' | 'perplexity' | 'google'
  recommendations: AITestRecommendation[]
  rawResponse?: string
  error?: string
  durationMs: number
}

const NATURAL_PROMPT = (keyword: string) => `What are the top 5 businesses or websites for "${keyword}"? Search the web and tell me what you find. For each one, give me the name, their website URL if you know it, and a brief description of what they offer.`

/**
 * Parse a natural language AI response into structured recommendations.
 * Handles numbered lists, markdown bold names, and ChatGPT's Places-style format.
 */
function parseNaturalResponse(text: string, groundingUrls?: Map<string, string>): AITestRecommendation[] {
  // Strategy 1: Try JSON first (some engines still return it)
  const jsonArray = extractJsonArray(text)
  if (jsonArray && jsonArray.length >= 3) {
    return jsonArray.slice(0, 5).map((r: any, i: number) => ({
      rank: r.rank || i + 1,
      name: r.name || 'Unknown',
      url: r.url || '',
      reason: r.reason || r.description || '',
    }))
  }

  const recs: AITestRecommendation[] = []

  // Strategy 2: Parse numbered list items — handles ChatGPT's format:
  // "1. **Business Name**\nClosed · Pizza restaurant · CA$10–20 · 3.9 (165 reviews)\n270 Restigouche Rd..."
  // Also handles: "1. **Business Name** - description"
  const lines = text.split('\n')
  let i = 0
  while (i < lines.length && recs.length < 5) {
    const line = lines[i].trim()
    // Match numbered item: "1." or "1)" optionally followed by bold name
    const numMatch = line.match(/^(\d+)[\.\)]\s*(?:\*{1,2})?(.+?)(?:\*{1,2})?$/)
    if (numMatch) {
      let name = numMatch[2].trim()
      // Skip if name looks like metadata (contains ·, ratings, addresses)
      if (name.includes('·') || name.match(/^\d+\.\d+\s*\(/) || name.match(/^\d+\s+\w+\s+\w+,/)) {
        i++
        continue
      }
      // Clean up markdown
      name = name.replace(/\*+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
      if (name.length < 2 || name.length > 100) { i++; continue }

      // Collect the next 1-3 lines as the description/metadata
      const descLines: string[] = []
      let j = i + 1
      while (j < lines.length && j < i + 4) {
        const nextLine = lines[j].trim()
        if (!nextLine || nextLine.match(/^\d+[\.\)]/)) break
        descLines.push(nextLine.replace(/\*+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))
        j++
      }
      const description = descLines.join(' ').trim()

      // Extract URL from description or name
      const urlMatch = description.match(/https?:\/\/[^\s\)]+/) || name.match(/https?:\/\/[^\s\)]+/)
      let url = urlMatch ? urlMatch[0].replace(/[.,;)]+$/, '') : ''

      // Try grounding chunks for URL
      if (!url && groundingUrls) {
        const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, '')
        for (const [groundTitle, groundUrl] of groundingUrls) {
          if (nameKey && (groundTitle.includes(nameKey) || nameKey.includes(groundTitle))) {
            url = groundUrl
            break
          }
        }
      }

      const reason = description.replace(/https?:\/\/[^\s\)]+/g, '').trim()
      recs.push({ rank: recs.length + 1, name, url, reason: reason.substring(0, 300) })
      i = j
      continue
    }
    i++
  }

  // Strategy 3: If grounding chunks available and we got nothing, use them directly
  if (recs.length === 0 && groundingUrls && groundingUrls.size > 0) {
    let rank = 1
    for (const [title, url] of groundingUrls) {
      if (rank > 5) break
      recs.push({ rank: rank++, name: title, url, reason: '' })
    }
  }

  return recs
}

/** Query Google Gemini with Google Search grounding */
async function queryGemini(keyword: string): Promise<AITestEngineResult> {
  const start = Date.now()
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
    const modelName = await getGeminiModel()
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
      tools: [{ googleSearch: {} } as any],
    })
    const result = await model.generateContent(NATURAL_PROMPT(keyword))
    const response = result.response
    const text = response.text()

    // Extract grounding metadata — real URLs from Google Search
    const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata
    const groundingChunks = groundingMetadata?.groundingChunks || []
    const groundingUrls = new Map<string, string>()
    for (const chunk of groundingChunks) {
      if (chunk.web?.uri && chunk.web?.title) {
        const title = chunk.web.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        groundingUrls.set(title, chunk.web.uri)
      }
    }

    console.log(`[AI Test] Gemini grounding chunks: ${groundingChunks.length}, text length: ${text.length}`)

    const recs = parseNaturalResponse(text, groundingUrls)
    if (recs.length === 0) throw new Error('Could not extract recommendations from response')

    return {
      engine: 'gemini',
      recommendations: await validateRecommendationUrls(recs),
      durationMs: Date.now() - start,
    }
  } catch (err: any) {
    return { engine: 'gemini', recommendations: [], error: err.message, durationMs: Date.now() - start }
  }
}

/** Query OpenAI ChatGPT with web search */
async function queryChatGPT(keyword: string): Promise<AITestEngineResult> {
  const start = Date.now()
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { engine: 'chatgpt', recommendations: [], error: 'OpenAI API key not configured', durationMs: 0 }

  try {
    // Use Responses API with web_search_preview tool for live search
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        tools: [{ type: 'web_search_preview' }],
        input: NATURAL_PROMPT(keyword),
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      // Fallback to regular chat completions without search
      console.log('[AI Test] ChatGPT web search failed, falling back to standard')
      const fallbackRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: NATURAL_PROMPT(keyword) }],
          temperature: 0.3,
          max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (!fallbackRes.ok) throw new Error(`OpenAI API error: ${fallbackRes.status}`)
      const fallbackData = await fallbackRes.json()
      const fallbackText = fallbackData.choices?.[0]?.message?.content || ''
      const fallbackRecs = parseNaturalResponse(fallbackText)
      if (fallbackRecs.length === 0) throw new Error('No recommendations in response')
      return {
        engine: 'chatgpt',
        recommendations: await validateRecommendationUrls(fallbackRecs),
        durationMs: Date.now() - start,
      }
    }
    const data = await res.json()
    // Responses API can return output in various structures — try multiple extraction paths
    let textOutput = ''
    // Path 1: Standard message output
    textOutput = data.output?.find((o: any) => o.type === 'message')?.content?.find((c: any) => c.type === 'output_text')?.text || ''
    // Path 2: Try all text content from all output items
    if (!textOutput) {
      for (const item of (data.output || [])) {
        if (item.type === 'message' && item.content) {
          for (const c of item.content) {
            if (c.text) textOutput += c.text + '\n'
            if (c.type === 'output_text' && c.text) textOutput += c.text + '\n'
          }
        }
      }
    }
    // Path 3: Check for direct text field
    if (!textOutput && data.output_text) textOutput = data.output_text
    // Path 4: Stringify the whole response as last resort
    if (!textOutput) {
      console.log('[AI Test] ChatGPT response structure:', JSON.stringify(data).substring(0, 500))
      textOutput = JSON.stringify(data)
    }

    console.log(`[AI Test] ChatGPT text length: ${textOutput.length}`)
    const chatRecs = parseNaturalResponse(textOutput)
    if (chatRecs.length === 0) throw new Error('No recommendations in response')
    return {
      engine: 'chatgpt',
      recommendations: await validateRecommendationUrls(chatRecs),
      durationMs: Date.now() - start,
    }
  } catch (err: any) {
    return { engine: 'chatgpt', recommendations: [], error: err.message, durationMs: Date.now() - start }
  }
}

/** Query Perplexity (with online search) */
async function queryPerplexity(keyword: string): Promise<AITestEngineResult> {
  const start = Date.now()
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) return { engine: 'perplexity', recommendations: [], error: 'Perplexity API key not configured', durationMs: 0 }

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: NATURAL_PROMPT(keyword) }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`Perplexity API error: ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    const perplexityRecs = parseNaturalResponse(text)
    if (perplexityRecs.length === 0) throw new Error('No recommendations in response')
    return {
      engine: 'perplexity',
      recommendations: await validateRecommendationUrls(perplexityRecs),
      durationMs: Date.now() - start,
    }
  } catch (err: any) {
    return { engine: 'perplexity', recommendations: [], error: err.message, durationMs: Date.now() - start }
  }
}

/** Query Google Search via Serper — real search results, no AI hallucination */
async function queryGoogleSearch(keyword: string): Promise<AITestEngineResult> {
  const start = Date.now()
  try {
    const rawResults = await searchGoogle(keyword, 10)
    // No aggregator filtering for AI Test — show what Google actually returns
    const top5 = rawResults.slice(0, 5)
    const recs: AITestRecommendation[] = top5.map((r, i) => ({
      rank: i + 1,
      name: r.title || r.displayLink,
      url: r.url,
      urlStatus: 'valid' as const,
      reason: r.snippet || '',
    }))
    console.log(`[AI Test] Google Search: ${rawResults.length} results, showing top ${recs.length}`)
    return { engine: 'google', recommendations: recs, durationMs: Date.now() - start }
  } catch (err: any) {
    return { engine: 'google', recommendations: [], error: err.message, durationMs: Date.now() - start }
  }
}

/** Wrap an engine query with 1 automatic retry on failure */
async function withRetry(fn: () => Promise<AITestEngineResult>): Promise<AITestEngineResult> {
  const first = await fn()
  if (first.error && first.recommendations.length === 0) {
    console.log(`[AI Test] ${first.engine} failed, retrying once...`)
    const second = await fn()
    return second
  }
  return first
}

/** Run all 4 engines in parallel (Google Search + 3 AI engines, with auto-retry) */
export async function runAITest(keyword: string): Promise<AITestEngineResult[]> {
  const results = await Promise.all([
    queryGoogleSearch(keyword),
    withRetry(() => queryGemini(keyword)),
    withRetry(() => queryChatGPT(keyword)),
    withRetry(() => queryPerplexity(keyword)),
  ])
  return results
}

/** Retry a single engine by name — used by the retry API endpoint */
export async function retrySingleEngine(engine: string, keyword: string): Promise<AITestEngineResult> {
  switch (engine) {
    case 'gemini': return queryGemini(keyword)
    case 'chatgpt': return queryChatGPT(keyword)
    case 'perplexity': return queryPerplexity(keyword)
    case 'google': return queryGoogleSearch(keyword)
    default: return { engine: engine as any, recommendations: [], error: 'Unknown engine', durationMs: 0 }
  }
}
