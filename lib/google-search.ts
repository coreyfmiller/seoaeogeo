/**
 * Google Search via Serper.dev
 * Returns real Google search results with actual URLs.
 * Requires SERPER_API_KEY env var.
 * Falls back to Gemini grounding if Serper is not configured.
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
  const serperKey = process.env.SERPER_API_KEY

  if (serperKey) {
    return searchWithSerper(query, count, serperKey)
  }

  // Fallback to Gemini grounding if no Serper key
  console.warn('[Google Search] No SERPER_API_KEY, falling back to Gemini grounding')
  return searchWithGemini(query, count)
}

/**
 * Primary: Serper.dev — fast, reliable, real Google results
 */
async function searchWithSerper(query: string, count: number, apiKey: string): Promise<SearchResult[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: count,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Serper] Error:', res.status, err)
    throw new Error(`Serper search failed: ${res.status}`)
  }

  const data = await res.json()
  const organic = data.organic || []

  const results: SearchResult[] = organic.slice(0, count).map((item: any, i: number) => ({
    rank: i + 1,
    title: item.title || '',
    url: item.link || '',
    snippet: item.snippet || '',
    displayLink: extractDomain(item.link || ''),
  }))

  console.log(`[Serper] Found ${results.length} results for "${query}"`)
  return results
}

/**
 * Fallback: Gemini with Google Search grounding
 */
async function searchWithGemini(query: string, count: number): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('Neither SERPER_API_KEY nor GOOGLE_GENERATIVE_AI_API_KEY is configured.')
  }

  const ai = new GoogleGenAI({ apiKey })
  const modelName = await getGeminiModel()

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
  const results: SearchResult[] = []
  const seen = new Set<string>()

  // Extract URLs from text
  const urlRegex = /https?:\/\/(?!vertexaisearch\.cloud\.google\.com)[^\s\])"',<>]+/g
  let match
  while ((match = urlRegex.exec(text)) !== null && results.length < count) {
    let url = match[0].replace(/[.)]+$/, '')
    const domain = extractDomain(url)
    if (domain.includes('google.com') || domain.includes('googleapis.com')) continue
    if (seen.has(domain)) continue
    seen.add(domain)

    const lineMatch = text.substring(Math.max(0, match.index - 200), match.index).match(/(?:\d+[\.\)]\s*)?([^\n]+)$/)
    const title = lineMatch?.[1]?.replace(/[\*\#\-]+/g, '').trim() || domain

    results.push({ rank: results.length + 1, title, url, snippet: '', displayLink: domain })
  }

  console.log(`[Google Search Gemini] Found ${results.length} results for "${query}"`)
  return results
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}
