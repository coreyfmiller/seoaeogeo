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
  const base = `You are a supportive SEO/AEO/GEO strategist writing an expert analysis for a client. Your tone is warm, encouraging, and solution-oriented — like a trusted advisor who genuinely wants to help them succeed. Be specific and insightful, but always frame things positively.

RULES:
- Focus on the USER'S site — what they're doing well, where they can improve, and specific next steps
- Don't talk about competitors unless it directly helps the user understand their position
- Don't repeat scores — the client can see them. Explain what they MEAN for their business
- Always lead with strengths before addressing gaps
- Frame weaknesses as opportunities, not failures
- Give specific, actionable advice they can act on today
- If domain authority or backlinks are low, explain why that matters and how to improve it
- Be conversational but authoritative — like a knowledgeable friend, not a cold report

Write 2-3 paragraphs of genuine expert analysis.

IMPORTANT: Return ONLY a JSON object: { "analysis": "your analysis text here" }
Do NOT use markdown formatting in the analysis text. Use plain text only.`

  switch (data.context) {
    case 'pro-audit':
      return `${base}

CONTEXT: Single-page Pro Audit
URL: ${data.url}
Scores: SEO ${data.scores.seo}/100, AEO ${data.scores.aeo}/100, GEO ${data.scores.geo}/100
Site Type: ${data.siteType || 'Unknown'}
Platform: ${data.platform || 'Unknown'}
Word Count: ${data.wordCount ?? 'Unknown'}
Schema Count: ${data.schemaCount ?? 0}
Domain Authority: ${data.domainAuthority ?? 'Not available'}
Total Backlinks: ${data.totalBacklinks ?? 'Not available'}
Spam Score: ${data.spamScore ?? 'Not available'}
Response Time: ${data.responseTimeMs ?? 'Unknown'}ms
Has H1: ${data.hasH1 ?? 'Unknown'}
Alt Text Coverage: ${data.altTextPct ?? 'Unknown'}%
Internal Links: ${data.internalLinks ?? 'Unknown'}
External Links: ${data.externalLinks ?? 'Unknown'}
Critical Issues: ${data.criticalIssues?.length ?? 0} found${data.criticalIssues?.length ? ': ' + data.criticalIssues.slice(0, 5).join('; ') : ''}

Analyze what these scores mean for this ${data.siteType || 'site'}. If there's a big gap between SEO and AEO/GEO, explain why and what it means for AI-driven discovery. If domain authority is low, explain how that limits ranking potential regardless of on-page quality. Be specific about what to prioritize.`

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
Thin Content Pages: ${data.thinContentCount ?? 0}

Analyze the site-wide health. Focus on patterns across pages — are there systemic issues? How does the site perform as a whole vs individual page quality? What site-wide improvements would have the biggest compound effect?`

    case 'competitor-duel':
      return `${base}

CONTEXT: Competitor Duel (head-to-head comparison)
Site A: ${data.siteAUrl}
  Scores: SEO ${data.scoresA.seo}/100, AEO ${data.scoresA.aeo}/100, GEO ${data.scoresA.geo}/100
  Site Type: ${data.siteTypeA || 'Unknown'}, Platform: ${data.platformA || 'Unknown'}
  Domain Authority: ${data.daA ?? 'Not available'}, Backlinks: ${data.backlinksA ?? 'Not available'}
  Word Count: ${data.wordCountA ?? 'Unknown'}, Schemas: ${data.schemaCountA ?? 0}

Site B: ${data.siteBUrl}
  Scores: SEO ${data.scoresB.seo}/100, AEO ${data.scoresB.aeo}/100, GEO ${data.scoresB.geo}/100
  Site Type: ${data.siteTypeB || 'Unknown'}, Platform: ${data.platformB || 'Unknown'}
  Domain Authority: ${data.daB ?? 'Not available'}, Backlinks: ${data.backlinksB ?? 'Not available'}
  Word Count: ${data.wordCountB ?? 'Unknown'}, Schemas: ${data.schemaCountB ?? 0}

Provide a thorough competitive analysis. Don't just say who wins — explain WHY. If one site has better on-page scores but lower domain authority, explain how that plays out in real search results. Identify the specific areas where each site has an advantage and what the weaker site needs to do to close the gap. Use the actual domain names, not "Site A" and "Site B".`

    case 'keyword-arena':
      return `${base}

CONTEXT: Keyword Arena — the user searched "${data.keyword}" and we scored their site against ${data.totalSites ?? '?'} competitors.

YOUR SITE: ${data.userSiteUrl}
  Scores: SEO ${data.userScores.seo}/100, AEO ${data.userScores.aeo}/100, GEO ${data.userScores.geo}/100
  Google Rank: ${data.googleRank ?? 'Not available'}
  Arena Rank (by on-page optimization): ${data.arenaRank ?? 'Not available'} out of ${data.totalSites ?? '?'} sites
  Domain Authority: ${data.domainAuthority ?? 'Not available'}
  Word Count: ${data.wordCount ?? 'Unknown'}
  Schemas: ${data.schemaCount ?? 0}

Arena Averages: SEO ${data.arenaAvg?.seo ?? '?'}, AEO ${data.arenaAvg?.aeo ?? '?'}, GEO ${data.arenaAvg?.geo ?? '?'}

${data.topCompetitors?.length ? 'Top Competitors (for context only):\n' + data.topCompetitors.slice(0, 5).map(c => `  ${c.url} — SEO ${c.scores.seo}, AEO ${c.scores.aeo}, GEO ${c.scores.geo}, Google #${c.googleRank ?? '?'}`).join('\n') : ''}

FOCUS YOUR ANALYSIS ON THE USER'S SITE:
- Start by acknowledging what they're doing well relative to competitors
- If their on-page scores are strong but Google rank is lower, explain that this is normal — Google weighs off-page factors (domain authority, backlinks, brand recognition, site age) heavily. Frame this as an opportunity: their content is already competitive, and investing in link building will unlock ranking gains
- If content is thin (low word count), suggest specific content improvements
- If schema is missing, explain how adding it would help them stand out in both Google and AI search results
- Give them 2-3 specific, actionable things they can do to climb the rankings for this keyword
- Be encouraging — they're already taking the right step by analyzing their competition`
  }
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
