/**
 * Google Custom Search API wrapper
 * Requires GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID env vars
 */

interface SearchResult {
  rank: number
  title: string
  url: string
  snippet: string
  displayLink: string
}

export async function searchGoogle(query: string, count: number = 10): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    throw new Error('Google Custom Search API not configured. Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID.')
  }

  const results: SearchResult[] = []

  // Google CSE returns max 10 per request. For 10 results, one call. For >10, need pagination.
  const numRequests = Math.ceil(count / 10)

  for (let i = 0; i < numRequests; i++) {
    const start = i * 10 + 1
    const num = Math.min(10, count - results.length)
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${num}&start=${start}`

    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.text()
      console.error('[Google CSE] Error:', err)
      throw new Error(`Google Search API error: ${res.status}`)
    }

    const data = await res.json()
    const items = data.items || []

    for (const item of items) {
      results.push({
        rank: results.length + 1,
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
        displayLink: item.displayLink || '',
      })
    }
  }

  return results.slice(0, count)
}
