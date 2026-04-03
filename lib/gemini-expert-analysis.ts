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
  const base = `You are a search optimization analyst. Write naturally but with authority. No filler, no fluff, no cheerleading.

BANNED WORDS/PHRASES — never use any of these:
Corporate: "demonstrates", "exhibits", "indicates", "evidenced by", "comprehensive", "significant", "substantial", "leveraging", "utilizing", "facilitates", "encompasses", "paramount", "robust", "holistic"
Directive: "must", "needs to", "should immediately", "it is imperative", "it is essential", "it is critical that", "requires immediate"
Cheerleader: "fantastic", "great job", "wonderful", "impressive", "exceptional", "outstanding", "remarkable", "stellar"
Filler openers: "Alright", "Let's talk", "So here's", "OK so", "Let's break this down", "Let's dive in", "It's worth noting", "It should be noted", "It's important to understand"

INSTEAD OF DIRECTIVES, USE ADVISORY LANGUAGE:
- "The highest-ROI move is..." not "must focus on..."
- "The fastest path forward would be..." not "needs to immediately..."
- "Consider prioritizing..." not "it is imperative to..."

DO NOT restate exact score numbers (like "100/100 SEO"). The user can see them. Reference indirectly if needed ("the strong SEO score" or "the gap between SEO and AEO").

Return a JSON object with exactly 3 fields. Each field is exactly 2 sentences. Be specific, use numbers from the data, connect to real-world outcomes.

{
  "bottomLine": "The single most important takeaway. What does this data mean for their business?",
  "keyInsight": "The non-obvious insight the data reveals. What's really happening under the hood?",
  "priorityAction": "One specific thing to do first, with a realistic timeline. Use advisory language."
}`

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

WRITE ABOUT (pick the most relevant based on the data):
- The hidden story: what the gap between SEO and AEO/GEO scores reveals. If SEO is high but AEO is low, the site is built for Google's old crawler but invisible to AI assistants like ChatGPT and Perplexity.
- If word count is under 300: explain that search engines and AI literally can't understand what the page is about — there's not enough content to work with.
- If DA is low: explain it in human terms — "Google sees X websites vouching for your competitors but only Y vouching for you. Even perfect on-page optimization can't overcome that trust gap."
- If schema is missing: explain what they're leaving on the table — rich results, FAQ dropdowns, star ratings that take up more screen real estate and get more clicks.
- If response time is over 1000ms: explain this is directly hurting Core Web Vitals and rankings, and suggest a quick fix based on their platform.
- End with ONE specific thing they can do this week, tailored to their platform if known.`

    case 'deep-scan':
      return `${base}

CONTEXT: Multi-page Deep Scan across ${data.pagesCrawled ?? '?'} pages.
URL: ${data.url}
Average Scores: SEO ${data.scores.seo}/100, AEO ${data.scores.aeo}/100, GEO ${data.scores.geo}/100
Site Type: ${data.siteType || 'Unknown'}
Domain Authority: ${data.domainAuthority ?? 'Not available'}
Total Backlinks: ${data.totalBacklinks ?? 'Not available'}
Avg Response Time: ${data.avgResponseTime ?? 'Unknown'}ms
Total Words (all pages): ${data.totalWords ?? 'Unknown'}
Schema Coverage: ${data.schemaCoverage ?? 'Unknown'} pages with schema
Duplicate Titles: ${data.duplicateTitles ?? 0}
Pages Missing H1: ${data.missingH1Count ?? 0}
Thin Content Pages (<300 words): ${data.thinContentCount ?? 0}

WRITE ABOUT (pick the most relevant):
- Are the issues systemic (affecting most pages) or isolated? Systemic issues like missing schema across all pages are higher priority than one page with thin content.
- If there are thin content pages: explain that these pages drag down the entire site's average and make the whole domain look less authoritative to Google.
- If schema coverage is low: explain what this means for rich results and AI citations across the whole site — every page without schema is a missed opportunity.
- If duplicate titles exist: explain that Google sees these as competing pages and may not rank either one well.
- The compound effect: fixing one systemic issue (like adding schema to all pages) has a multiplied impact vs fixing one page at a time.
- End with the single highest-impact action and a realistic timeline for seeing results.`

    case 'competitor-duel':
      return `${base}

CONTEXT: Head-to-head comparison. Use actual domain names, never "Site A" or "Site B".

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

WRITE ABOUT (pick the most relevant):
- If one site has better scores but lower DA: explain that on-page quality and real-world ranking are different things. "Site A is technically better optimized, but Site B has X backlinks from Y domains — Google trusts them more. In a head-to-head for competitive keywords, DA often wins."
- If there's a big content depth difference: explain what that means practically — the site with more content gives Google and AI engines more to work with.
- If one site has schema and the other doesn't: explain the concrete advantage — rich results, FAQ dropdowns, higher click-through rates.
- What the weaker site should focus on first to close the gap — be specific and realistic.
- If both sites have low DA: note that this is a competitive opportunity — neither has strong off-page authority, so on-page improvements will have outsized impact.`

    case 'keyword-arena':
      return `${base}

CONTEXT: Keyword Arena for "${data.keyword}" — user's site scored against ${data.totalSites ?? '?'} competitors.

User's Site: ${data.userSiteUrl}
  Scores: SEO ${data.userScores.seo}/100, AEO ${data.userScores.aeo}/100, GEO ${data.userScores.geo}/100
  Google Rank: #${data.googleRank ?? 'N/A'}
  Arena Rank (by on-page optimization): #${data.arenaRank ?? 'N/A'} out of ${data.totalSites ?? '?'}
  Domain Authority: ${data.domainAuthority ?? 'N/A'}
  Word Count: ${data.wordCount ?? 'Unknown'}
  Schemas: ${data.schemaCount ?? 0}

Arena Averages: SEO ${data.arenaAvg?.seo ?? '?'}, AEO ${data.arenaAvg?.aeo ?? '?'}, GEO ${data.arenaAvg?.geo ?? '?'}

${data.topCompetitors?.length ? 'Top Competitors:\n' + data.topCompetitors.slice(0, 5).map(c => `  ${c.url} — SEO ${c.scores.seo}, AEO ${c.scores.aeo}, GEO ${c.scores.geo}, Google #${c.googleRank ?? '?'}`).join('\n') : ''}

WRITE ABOUT (focused on the user's site):
- If arena rank is better than Google rank: this is the key insight. Explain that their content is technically better than their ranking suggests. The gap is almost certainly off-page — domain authority, backlinks, brand recognition. "You're doing the on-page work right, but Google needs to see other websites vouching for you before it'll rank you higher."
- If arena rank is worse than Google rank: explain that their brand/authority is carrying them, but competitors with better on-page optimization could overtake them.
- If content is thin compared to top competitors: use specific numbers. "The top 3 sites average X words. Your page has Y. Google and AI engines both need substance to rank confidently."
- If schema is missing but competitors have it: explain the specific disadvantage — they're missing rich results that competitors are getting.
- End with the single most impactful action to move up for this specific keyword, with a realistic timeline.
- For local businesses: mention Google Business Profile optimization as a parallel priority since Maps results often dominate local searches.`
  }
}

function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
}

export async function generateAIExpertAnalysis(data: ExpertAnalysisData): Promise<string | { bottomLine: string; keyInsight: string; priorityAction: string } | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
    const modelName = await getGeminiModel()
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3, topP: 0.4, maxOutputTokens: 2048 },
    })

    console.log(`[Expert Analysis] Generating for ${data.context}...`)

    // Race against a 20s timeout to avoid blocking the response
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => {
      console.error(`[Expert Analysis] Timed out after 20s for ${data.context}`)
      resolve(null)
    }, 20000))

    const analysisPromise = (async () => {
      const result = await model.generateContent(buildPrompt(data))
      const text = result.response.text()
      console.log(`[Expert Analysis] Raw response length: ${text.length} chars`)

      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = safeJsonParse(jsonMatch[0])

          // New structured format: { bottomLine, keyInsight, priorityAction }
          if (parsed?.bottomLine && parsed?.keyInsight && parsed?.priorityAction) {
            console.log(`[Expert Analysis] Structured format success for ${data.context}`)
            return parsed as { bottomLine: string; keyInsight: string; priorityAction: string }
          }

          // Legacy format: { analysis: "..." }
          if (parsed?.analysis && typeof parsed.analysis === 'string' && parsed.analysis.length > 50) {
            console.log(`[Expert Analysis] Legacy format for ${data.context} (${parsed.analysis.length} chars)`)
            return parsed.analysis
          }
        } catch (e) {
          console.log(`[Expert Analysis] JSON parse failed for ${data.context}`)
        }
      }

      // Fallback: raw text — but never return raw JSON
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      if (cleaned.length > 50 && !cleaned.startsWith('{') && !cleaned.startsWith('"')) {
        console.log(`[Expert Analysis] Raw text fallback for ${data.context} (${cleaned.length} chars)`)
        return cleaned
      }

      console.error(`[Expert Analysis] All extraction failed. Raw: ${text.substring(0, 500)}`)
      return null
    })()

    return await Promise.race([analysisPromise, timeoutPromise])
  } catch (err) {
    console.error('[Expert Analysis] Gemini call failed:', err instanceof Error ? err.message : err)
    return null
  }
}
