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

export async function searchGoogle(query: string, count: number = 10, location?: string): Promise<SearchResult[]> {
  const serperKey = process.env.SERPER_API_KEY

  if (serperKey) {
    return searchWithSerper(query, count, serperKey, location)
  }

  // Fallback to Gemini grounding if no Serper key
  console.warn('[Google Search] No SERPER_API_KEY, falling back to Gemini grounding')
  return searchWithGemini(query, count)
}

/**
 * Country name → Serper gl (country code) and hl (language) mapping
 */
const COUNTRY_CODES: Record<string, { gl: string; hl: string }> = {
  'canada': { gl: 'ca', hl: 'en' },
  'united states': { gl: 'us', hl: 'en' },
  'united kingdom': { gl: 'uk', hl: 'en' },
  'australia': { gl: 'au', hl: 'en' },
  'france': { gl: 'fr', hl: 'fr' },
  'germany': { gl: 'de', hl: 'de' },
  'spain': { gl: 'es', hl: 'es' },
  'italy': { gl: 'it', hl: 'it' },
  'brazil': { gl: 'br', hl: 'pt' },
  'mexico': { gl: 'mx', hl: 'es' },
  'india': { gl: 'in', hl: 'en' },
  'japan': { gl: 'jp', hl: 'ja' },
  'netherlands': { gl: 'nl', hl: 'nl' },
  'new zealand': { gl: 'nz', hl: 'en' },
  'ireland': { gl: 'ie', hl: 'en' },
  'south africa': { gl: 'za', hl: 'en' },
  'sweden': { gl: 'se', hl: 'sv' },
  'norway': { gl: 'no', hl: 'no' },
  'denmark': { gl: 'dk', hl: 'da' },
  'finland': { gl: 'fi', hl: 'fi' },
  'portugal': { gl: 'pt', hl: 'pt' },
  'belgium': { gl: 'be', hl: 'nl' },
  'switzerland': { gl: 'ch', hl: 'de' },
  'austria': { gl: 'at', hl: 'de' },
  'singapore': { gl: 'sg', hl: 'en' },
  'philippines': { gl: 'ph', hl: 'en' },
}

function deriveGlHl(location: string): { gl?: string; hl?: string } {
  const lower = location.toLowerCase()
  for (const [country, codes] of Object.entries(COUNTRY_CODES)) {
    if (lower.includes(country)) return codes
  }
  return {}
}

/**
 * Primary: Serper.dev — fast, reliable, real Google results
 */
async function searchWithSerper(query: string, count: number, apiKey: string, location?: string): Promise<SearchResult[]> {
  const body: Record<string, any> = { q: query, num: 10 }

  if (location) {
    const { gl, hl } = deriveGlHl(location)
    if (gl) body.gl = gl
    if (hl) body.hl = hl
    console.log(`[Serper] gl: ${gl}, hl: ${hl} (from: ${location})`)
  }

  const headers = { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' }

  // Fetch page 1 and page 2 in parallel to get up to 20 organic results
  const [res1, res2] = await Promise.all([
    fetch('https://google.serper.dev/search', {
      method: 'POST', headers,
      body: JSON.stringify({ ...body, page: 1 }),
    }),
    count > 10 ? fetch('https://google.serper.dev/search', {
      method: 'POST', headers,
      body: JSON.stringify({ ...body, page: 2 }),
    }) : Promise.resolve(null),
  ])

  if (!res1.ok) {
    const err = await res1.text()
    console.error('[Serper] Error page 1:', res1.status, err)
    throw new Error(`Serper search failed: ${res1.status}`)
  }

  const data1 = await res1.json()
  const organic1 = data1.organic || []

  let organic2: any[] = []
  if (res2 && res2.ok) {
    const data2 = await res2.json()
    organic2 = data2.organic || []
  } else if (res2) {
    console.warn(`[Serper] Page 2 failed: ${res2.status}`)
  }

  // Merge and deduplicate by URL
  const seen = new Set<string>()
  const allOrganic: any[] = []
  for (const item of [...organic1, ...organic2]) {
    const url = item.link || ''
    if (!seen.has(url)) {
      seen.add(url)
      allOrganic.push(item)
    }
  }

  console.log(`[Serper] Page 1: ${organic1.length}, Page 2: ${organic2.length}, merged: ${allOrganic.length} for "${query}"`)

  const results: SearchResult[] = allOrganic.slice(0, count).map((item: any, i: number) => ({
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
