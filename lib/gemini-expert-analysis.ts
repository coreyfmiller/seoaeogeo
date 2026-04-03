/**
 * AI-Powered Expert Analysis Generator
 * Uses Gemini to produce thorough, insightful analysis based on all scan data.
 * Called server-side in each API route, result passed to the frontend.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiModel } from './gemini-model-resolver'
import { safeJsonParse } from './utils/json-sanitizer'

export type AnalysisContext = 'pro-audit' | 'deep-scan' | 'competitor-duel' | 'keyword-arena'

interface ProAuditData {
  context: 'pro-audit'
  url: string
  scores: { seo: number; aeo: number; geo: number }
  siteType?: string
  platform?: string
  wordCount?: number
  schemaCount?: number
  criticalIssues?: string[]
  domainAuthority?: number
  totalBacklinks?: number
  spamScore?: number
  responseTimeMs?: number
  hasH1?: boolean
  altTextPct?: number
  internalLinks?: number
  externalLinks?: number
}

interface DeepScanData {
  context: 'deep-scan'
  url: string
  scores: { seo: number; aeo: number; geo: number }
  siteType?: string
  pagesCrawled?: number
  domainAuthority?: number
  totalBacklinks?: number
  avgResponseTime?: number
  totalWords?: number
  schemaCoverage?: string
  duplicateTitles?: number
  missingH1Count?: number
  thinContentCount?: number
}

interface DuelData {
  context: 'competitor-duel'
  siteAUrl: string
  siteBUrl: string
  scoresA: { seo: number; aeo: number; geo: number }
  scoresB: { seo: number; aeo: number; geo: number }
  siteTypeA?: string
  siteTypeB?: string
  platformA?: string
  platformB?: string
  daA?: number
  daB?: number
  backlinksA?: number
  backlinksB?: number
  wordCountA?: number
  wordCountB?: number
  schemaCountA?: number
  schemaCountB?: number
}

interface ArenaData {
  context: 'keyword-arena'
  keyword: string
  userSiteUrl: string
  userScores: { seo: number; aeo: number; geo: number }
  googleRank?: number | null
  arenaRank?: number | null
  totalSites?: number
  arenaAvg?: { seo: number; aeo: number; geo: number }
  domainAuthority?: number
  wordCount?: number
  schemaCount?: number
  topCompetitors?: Array<{ url: string; scores: { seo: number; aeo: number; geo: number }; googleRank?: number | null }>
}

export type ExpertAnalysisData = ProAuditData | DeepScanData | DuelData | ArenaData

function buildPrompt(data: ExpertAnalysisData): string {
  const base = `You are a search optimization analyst producing an expert assessment. Write like a professional consultant — factual, insightful, and direct. No cheerleading, no fluff, no exclamation marks. Respect the reader's intelligence.

VOICE: Professional analyst. Think Moz or Ahrefs audit reports. Informative, measured, and genuinely useful.

RULES:
- Do NOT repeat scores — the client can already see them. Explain what the data MEANS.
- Do NOT use phrases like "fantastic", "great job", "it's wonderful to see", or any cheerleader language.
- Explain cause and effect: why scores are what they are, and what the real-world impact is.
- Identify the single biggest bottleneck and explain why it matters most.
- If domain authority is low, explain how off-page signals limit ranking potential regardless of on-page quality.
- If there's a gap between SEO and AEO/GEO, explain what that indicates about the site's optimization maturity.
- End with a clear priority recommendation — what to address first and why.
- Write 2-3 paragraphs. Plain text, no markdown.

IMPORTANT: Return ONLY a JSON object: { "analysis": "your analysis text here" }`

  switch (data.context) {
    case 'pro-audit':
      return `${base}

CONTEXT: Single-page Pro Audit for a ${data.siteType || 'website'}.
URL: ${data.url}
Scores: SEO ${data.scores.seo}/100, AEO ${data.scores.aeo}/100, GEO ${data.scores.geo}/100
Platform: ${data.platform || 'Unknown'}
Word Count: ${data.wordCount ?? 'Unknown'}
Schema Count: ${data.schemaCount ?? 0}
Domain Authority: ${data.domainAuthority ?? 'Not available'}
Total Backlinks: ${data.totalBacklinks ?? 'Not available'}
Spam Score: ${data.spamScore ?? 'Not available'}%
Response Time: ${data.responseTimeMs ?? 'Unknown'}ms
Has H1: ${data.hasH1 ?? 'Unknown'}
Alt Text Coverage: ${data.altTextPct ?? 'Unknown'}%
Internal Links: ${data.internalLinks ?? 'Unknown'}
External Links: ${data.externalLinks ?? 'Unknown'}
Critical Issues: ${data.criticalIssues?.length ?? 0}${data.criticalIssues?.length ? ': ' + data.criticalIssues.slice(0, 5).join('; ') : ''}

ANALYZE:
- What the score spread reveals about optimization maturity (high SEO + low AEO = traditional optimization without AI readiness)
- The relationship between on-page quality and off-page authority — what this means for actual ranking potential
- The single biggest bottleneck holding this site back
- What content depth, schema implementation, and technical signals indicate about competitive readiness
- Clear priority: what to fix first and why`

    case 'deep-scan':
      return `${base}

CONTEXT: Multi-page Deep Scan
URL: ${data.url}
Pages Crawled: ${data.pagesCrawled ?? 'Unknown'}
Average Scores: SEO ${data.scores.seo}/100, AEO ${data.scores.aeo}/100, GEO ${data.scores.geo}/100
Site Type: ${data.siteType || 'Unknown'}
Domain Authority: ${data.domainAuthority ?? 'Not available'}
Total Backlinks: ${data.totalBacklinks ?? 'Not available'}
Avg Response Time: ${data.avgResponseTime ?? 'Unknown'}ms
Total Words (all pages): ${data.totalWords ?? 'Unknown'}
Schema Coverage: ${data.schemaCoverage ?? 'Unknown'}
Duplicate Titles: ${data.duplicateTitles ?? 0}
Pages Missing H1: ${data.missingH1Count ?? 0}
Thin Content Pages (<300 words): ${data.thinContentCount ?? 0}

ANALYZE:
- Site-wide patterns: are issues systemic or isolated to specific pages?
- How the weakest pages drag down the site-wide average
- Schema coverage gaps and what that means for rich results and AI citations
- Whether this is primarily a content depth problem or a technical problem
- The compound effect of fixing site-wide issues vs page-level issues
- Clear priority: the single highest-impact improvement`

    case 'competitor-duel':
      return `${base}

CONTEXT: Head-to-head competitive comparison. Use actual domain names throughout.

${extractDomain(data.siteAUrl)}:
  Scores: SEO ${data.scoresA.seo}/100, AEO ${data.scoresA.aeo}/100, GEO ${data.scoresA.geo}/100
  Site Type: ${data.siteTypeA || 'Unknown'}, Platform: ${data.platformA || 'Unknown'}
  Domain Authority: ${data.daA ?? 'N/A'}, Backlinks: ${data.backlinksA ?? 'N/A'}
  Word Count: ${data.wordCountA ?? 'Unknown'}, Schemas: ${data.schemaCountA ?? 0}

${extractDomain(data.siteBUrl)}:
  Scores: SEO ${data.scoresB.seo}/100, AEO ${data.scoresB.aeo}/100, GEO ${data.scoresB.geo}/100
  Site Type: ${data.siteTypeB || 'Unknown'}, Platform: ${data.platformB || 'Unknown'}
  Domain Authority: ${data.daB ?? 'N/A'}, Backlinks: ${data.backlinksB ?? 'N/A'}
  Word Count: ${data.wordCountB ?? 'Unknown'}, Schemas: ${data.schemaCountB ?? 0}

ANALYZE:
- Where each site has a genuine technical or content advantage, and why
- How domain authority and backlink profiles affect real-world ranking regardless of on-page scores
- Whether the on-page score difference translates to actual ranking difference, or if off-page factors dominate
- The specific, realistic areas where the weaker site can close the gap
- What each site should prioritize to gain competitive ground`

    case 'keyword-arena':
      return `${base}

CONTEXT: Keyword Arena — competitive ranking analysis for "${data.keyword}"

User's Site: ${data.userSiteUrl}
  Scores: SEO ${data.userScores.seo}/100, AEO ${data.userScores.aeo}/100, GEO ${data.userScores.geo}/100
  Google Rank: #${data.googleRank ?? 'N/A'}
  Arena Rank (by on-page optimization): #${data.arenaRank ?? 'N/A'} out of ${data.totalSites ?? '?'}
  Domain Authority: ${data.domainAuthority ?? 'N/A'}
  Word Count: ${data.wordCount ?? 'Unknown'}
  Schemas: ${data.schemaCount ?? 0}

Arena Averages: SEO ${data.arenaAvg?.seo ?? '?'}, AEO ${data.arenaAvg?.aeo ?? '?'}, GEO ${data.arenaAvg?.geo ?? '?'}

${data.topCompetitors?.length ? 'Top Competitors:\n' + data.topCompetitors.slice(0, 5).map(c => `  ${c.url} — SEO ${c.scores.seo}, AEO ${c.scores.aeo}, GEO ${c.scores.geo}, Google #${c.googleRank ?? '?'}`).join('\n') : ''}

ANALYZE (focused on the user's site):
- The disconnect or alignment between optimization rank and Google rank, and what drives it (off-page authority, backlinks, brand signals, site age)
- How the user's site compares to the arena average and the top 3 competitors
- Whether the gap to higher rankings is on-page (fixable with content/schema changes) or off-page (requires link building strategy)
- The single most impactful action to move up for this specific keyword
- If content is thin or schema is missing, explain the specific competitive disadvantage that creates`
  }
}

function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
}

export async function generateAIExpertAnalysis(data: ExpertAnalysisData): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
    const modelName = await getGeminiModel()
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3, topP: 0.4, maxOutputTokens: 1024 },
    })

    console.log(`[Expert Analysis] Generating for ${data.context}...`)

    // Race against a 15s timeout to avoid blocking the response
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => {
      console.error(`[Expert Analysis] Timed out after 15s for ${data.context}`)
      resolve(null)
    }, 15000))

    const analysisPromise = (async () => {
      const result = await model.generateContent(buildPrompt(data))
      const text = result.response.text()

      // Try to extract JSON, fall back to raw text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = safeJsonParse(jsonMatch[0])
          if (parsed?.analysis) {
            console.log(`[Expert Analysis] Success for ${data.context} (${parsed.analysis.length} chars)`)
            return parsed.analysis as string
          }
        } catch {}
      }

      // If JSON parsing fails, use the raw text (strip any markdown)
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').replace(/^\s*\{[\s\S]*?"analysis"\s*:\s*"/, '').replace(/"\s*\}\s*$/, '').trim()
      if (cleaned.length > 50) {
        console.log(`[Expert Analysis] Used raw text for ${data.context} (${cleaned.length} chars)`)
        return cleaned
      }

      console.error('[Expert Analysis] Could not extract analysis from response:', text.substring(0, 300))
      return null
    })()

    return await Promise.race([analysisPromise, timeoutPromise])
  } catch (err) {
    console.error('[Expert Analysis] Gemini call failed:', err instanceof Error ? err.message : err)
    return null
  }
}
