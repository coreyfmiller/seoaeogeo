/**
 * AI Test — Query multiple AI engines for keyword recommendations.
 * Each engine is asked: "Recommend the top 5 businesses for [keyword]"
 * Returns structured results per engine.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiModel } from './gemini-model-resolver'
import { safeJsonParse } from './utils/json-sanitizer'

export interface AITestRecommendation {
  rank: number
  name: string
  url?: string
  reason: string
}

export interface AITestEngineResult {
  engine: 'gemini' | 'chatgpt' | 'perplexity'
  recommendations: AITestRecommendation[]
  rawResponse?: string
  error?: string
  durationMs: number
}

const PROMPT_TEMPLATE = (keyword: string) => `You are a helpful assistant. A user is searching for: "${keyword}"

Recommend the top 5 most relevant businesses or websites for this search query. For each recommendation, provide:
1. The business/website name
2. The website URL if you know it (or empty string if unknown)
3. A brief reason why you'd recommend it (1-2 sentences)

Return ONLY a JSON array with exactly 5 objects:
[
  { "rank": 1, "name": "Business Name", "url": "https://example.com", "reason": "Why this is recommended" },
  ...
]

IMPORTANT: Return ONLY the JSON array. No markdown, no explanation, no code blocks. Just the raw JSON array.`

/** Query Google Gemini */
async function queryGemini(keyword: string): Promise<AITestEngineResult> {
  const start = Date.now()
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
    const modelName = await getGeminiModel()
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
    })
    const result = await model.generateContent(PROMPT_TEMPLATE(keyword))
    const text = result.response.text()
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in response')
    const parsed = safeJsonParse(match[0])
    return {
      engine: 'gemini',
      recommendations: Array.isArray(parsed) ? parsed.slice(0, 5).map((r: any, i: number) => ({
        rank: r.rank || i + 1, name: r.name || 'Unknown', url: r.url || '', reason: r.reason || '',
      })) : [],
      durationMs: Date.now() - start,
    }
  } catch (err: any) {
    return { engine: 'gemini', recommendations: [], error: err.message, durationMs: Date.now() - start }
  }
}

/** Query OpenAI ChatGPT */
async function queryChatGPT(keyword: string): Promise<AITestEngineResult> {
  const start = Date.now()
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { engine: 'chatgpt', recommendations: [], error: 'OpenAI API key not configured', durationMs: 0 }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: PROMPT_TEMPLATE(keyword) }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in response')
    const parsed = safeJsonParse(match[0])
    return {
      engine: 'chatgpt',
      recommendations: Array.isArray(parsed) ? parsed.slice(0, 5).map((r: any, i: number) => ({
        rank: r.rank || i + 1, name: r.name || 'Unknown', url: r.url || '', reason: r.reason || '',
      })) : [],
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
        messages: [{ role: 'user', content: PROMPT_TEMPLATE(keyword) }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`Perplexity API error: ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in response')
    const parsed = safeJsonParse(match[0])
    return {
      engine: 'perplexity',
      recommendations: Array.isArray(parsed) ? parsed.slice(0, 5).map((r: any, i: number) => ({
        rank: r.rank || i + 1, name: r.name || 'Unknown', url: r.url || '', reason: r.reason || '',
      })) : [],
      durationMs: Date.now() - start,
    }
  } catch (err: any) {
    return { engine: 'perplexity', recommendations: [], error: err.message, durationMs: Date.now() - start }
  }
}

/** Run all 3 engines in parallel */
export async function runAITest(keyword: string): Promise<AITestEngineResult[]> {
  const results = await Promise.all([
    queryGemini(keyword),
    queryChatGPT(keyword),
    queryPerplexity(keyword),
  ])
  return results
}
