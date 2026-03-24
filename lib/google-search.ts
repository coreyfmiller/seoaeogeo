/**
 * Google Search via Gemini Grounding
 * Uses Gemini's Google Search tool to find top-ranking URLs for a keyword.
 * No additional API keys needed — uses the existing GOOGLE_GENERATIVE_AI_API_KEY.
 */

import { GoogleGenAI } from "@google/genai";
import { getGeminiModel } from "./gemini-model-resolver";

interface SearchResult {
  rank: number
  title: string
  url: string
  snippet: string
  displayLink: string
}

export async function searchGoogle(query: string, count: number = 10): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured.')
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `Search Google for: "${query}"

List the top ${count} organic search results. For each result, provide:
- The exact URL (full URL, not shortened)
- The page title
- A brief snippet/description

Return ONLY a JSON array with this exact format, no other text:
[
  { "rank": 1, "title": "Page Title", "url": "https://example.com/page", "snippet": "Brief description", "displayLink": "example.com" },
  ...
]

Important:
- Return exactly ${count} results if available
- Only include organic results (no ads, no Google properties like YouTube unless they genuinely rank)
- URLs must be real, complete URLs
- displayLink should be just the domain (e.g. "example.com")
- Return ONLY the JSON array, nothing else`

  const modelName = await getGeminiModel()

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  })

  const text = response.text || ''

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.error('[Google Search] Failed to parse response:', text)
    throw new Error('Failed to parse search results from Gemini')
  }

  let results: SearchResult[]
  try {
    results = JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('[Google Search] JSON parse error:', e, 'Raw:', jsonMatch[0])
    throw new Error('Failed to parse search results JSON')
  }

  // Validate and clean results
  results = results
    .filter(r => r.url && r.url.startsWith('http'))
    .map((r, i) => ({
      rank: i + 1,
      title: r.title || '',
      url: r.url,
      snippet: r.snippet || '',
      displayLink: r.displayLink || new URL(r.url).hostname,
    }))
    .slice(0, count)

  // If Gemini returned too few results, also try to extract URLs from grounding chunks
  if (results.length < count) {
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    for (const chunk of chunks) {
      const uri = (chunk as any)?.web?.uri
      const title = (chunk as any)?.web?.title
      if (uri && !results.find(r => r.url === uri)) {
        results.push({
          rank: results.length + 1,
          title: title || uri,
          url: uri,
          snippet: '',
          displayLink: title || new URL(uri).hostname,
        })
        if (results.length >= count) break
      }
    }
  }

  console.log(`[Google Search] Found ${results.length} results for "${query}"`)
  return results
}
