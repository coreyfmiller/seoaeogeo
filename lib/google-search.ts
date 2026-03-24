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
  const modelName = await getGeminiModel()

  // Ask Gemini to search and list top results with real URLs
  const prompt = `Search Google for: "${query}"

List the top ${count} organic search results with their REAL website URLs (not Google redirect URLs).
For each result provide the rank number, page title, full URL, and a one-line description.`

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  })

  const text = response.text || ''
  console.log('[Google Search] Raw response length:', text.length)

  // Strategy 1: Try to parse JSON from the response text
  let results = parseJsonResults(text, count)

  // Strategy 2: Extract URLs from the text using regex
  if (results.length < count) {
    const textResults = extractUrlsFromText(text, count)
    for (const tr of textResults) {
      if (!results.find(r => r.url === tr.url)) {
        results.push(tr)
      }
    }
  }

  // Strategy 3: Use grounding chunks as fallback, resolving proxy URLs
  if (results.length < count) {
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    for (const chunk of chunks) {
      const uri = (chunk as any)?.web?.uri || ''
      const title = (chunk as any)?.web?.title || ''
      // Resolve vertexaisearch proxy URLs to real URLs
      const realUrl = await resolveProxyUrl(uri)
      if (realUrl && !results.find(r => r.url === realUrl)) {
        let displayLink = title
        try { displayLink = new URL(realUrl).hostname } catch {}
        results.push({
          rank: results.length + 1,
          title: title || realUrl,
          url: realUrl,
          snippet: '',
          displayLink,
        })
      }
      if (results.length >= count) break
    }
  }

  // Re-rank and cap
  results = results.slice(0, count).map((r, i) => ({ ...r, rank: i + 1 }))

  console.log(`[Google Search] Found ${results.length} results for "${query}"`)
  if (results.length > 0) {
    console.log('[Google Search] Sample URL:', results[0].url)
  }
  return results
}

/**
 * Try to parse a JSON array of results from the response text
 */
function parseJsonResults(text: string, count: number): SearchResult[] {
  const jsonMatch = text.match(/\[[\s\S]*?\]/)
  if (!jsonMatch) return []

  try {
    const parsed = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((r: any) => r.url && r.url.startsWith('http') && !r.url.includes('vertexaisearch.cloud.google.com'))
      .slice(0, count)
      .map((r: any, i: number) => ({
        rank: i + 1,
        title: r.title || '',
        url: r.url,
        snippet: r.snippet || r.description || '',
        displayLink: r.displayLink || extractDomain(r.url),
      }))
  } catch {
    return []
  }
}

/**
 * Extract real URLs from plain text response using regex
 */
function extractUrlsFromText(text: string, count: number): SearchResult[] {
  const results: SearchResult[] = []
  // Match URLs that are NOT Google proxy URLs
  const urlRegex = /https?:\/\/(?!vertexaisearch\.cloud\.google\.com)[^\s\])"',<>]+/g
  const seen = new Set<string>()
  let match

  while ((match = urlRegex.exec(text)) !== null && results.length < count) {
    let url = match[0].replace(/[.)]+$/, '') // trim trailing punctuation
    const domain = extractDomain(url)
    // Skip Google internal URLs
    if (domain.includes('google.com') || domain.includes('googleapis.com')) continue
    // Deduplicate by domain
    if (seen.has(domain)) continue
    seen.add(domain)

    // Try to extract a title from nearby text (line containing the URL)
    const lineMatch = text.substring(Math.max(0, match.index - 200), match.index).match(/(?:\d+[\.\)]\s*)?([^\n]+)$/)
    const title = lineMatch?.[1]?.replace(/[\*\#\-]+/g, '').trim() || domain

    results.push({
      rank: results.length + 1,
      title,
      url,
      snippet: '',
      displayLink: domain,
    })
  }

  return results
}

/**
 * Resolve a vertexaisearch proxy URL to the real destination URL.
 * These proxy URLs redirect to the actual page.
 */
async function resolveProxyUrl(proxyUrl: string): Promise<string | null> {
  if (!proxyUrl) return null
  // If it's already a real URL, return as-is
  if (!proxyUrl.includes('vertexaisearch.cloud.google.com')) return proxyUrl

  try {
    // Follow the redirect to get the real URL
    const res = await fetch(proxyUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    const finalUrl = res.url
    // Make sure we actually got a real URL
    if (finalUrl && !finalUrl.includes('vertexaisearch.cloud.google.com')) {
      return finalUrl
    }
    // Try manual redirect header
    if (res.headers.get('location')) {
      return res.headers.get('location')
    }
    return null
  } catch {
    // If HEAD fails, try GET
    try {
      const res = await fetch(proxyUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
      })
      return res.headers.get('location') || null
    } catch {
      return null
    }
  }
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}
