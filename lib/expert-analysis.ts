/**
 * Expert Analysis Generator
 * Produces rich, contextual expert analysis text based on scores, site data, and tool context.
 * Used across Pro Audit, Deep Scan, Competitor Duel, and Keyword Arena.
 */

export type ToolContext = 'pro-audit' | 'deep-scan' | 'competitor-duel' | 'keyword-arena'

interface ExpertAnalysisInput {
  tool: ToolContext
  url: string
  scores: { seo: number; aeo: number; geo: number }
  siteType?: string
  platform?: string
  wordCount?: number
  schemaCount?: number
  criticalIssues?: string[]
  // Deep scan specific
  pagesCrawled?: number
  avgScores?: { seo: number; aeo: number; geo: number }
  // Competitor duel specific
  competitorUrl?: string
  competitorScores?: { seo: number; aeo: number; geo: number }
  verdict?: string
  // Keyword arena specific
  keyword?: string
  googleRank?: number | null
  arenaRank?: number | null
  totalSites?: number
  arenaAvg?: { seo: number; aeo: number; geo: number }
  // Backlink data
  domainAuthority?: number
  totalBacklinks?: number
}

export function generateExpertAnalysis(input: ExpertAnalysisInput): string {
  switch (input.tool) {
    case 'pro-audit': return generateProAuditAnalysis(input)
    case 'deep-scan': return generateDeepScanAnalysis(input)
    case 'competitor-duel': return generateDuelAnalysis(input)
    case 'keyword-arena': return generateArenaAnalysis(input)
    default: return ''
  }
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'strong'
  if (score >= 60) return 'moderate'
  if (score >= 40) return 'weak'
  return 'critical'
}

function generateProAuditAnalysis(input: ExpertAnalysisInput): string {
  const { scores, siteType, platform, wordCount, schemaCount, criticalIssues, domainAuthority } = input
  const avg = Math.round((scores.seo + scores.aeo + scores.geo) / 3)
  const weakest = scores.seo <= scores.aeo && scores.seo <= scores.geo ? 'SEO'
    : scores.aeo <= scores.geo ? 'AEO' : 'GEO'
  const strongest = scores.seo >= scores.aeo && scores.seo >= scores.geo ? 'SEO'
    : scores.aeo >= scores.geo ? 'AEO' : 'GEO'

  let analysis = ''

  // Opening assessment
  if (avg >= 85) {
    analysis += `This ${siteType || 'site'} is performing at an elite level across all three dimensions of modern search optimization. `
  } else if (avg >= 70) {
    analysis += `This ${siteType || 'site'} has a solid foundation but there are clear opportunities to gain a competitive edge. `
  } else if (avg >= 50) {
    analysis += `This ${siteType || 'site'} has fundamental gaps that are likely costing visibility in both traditional search and AI-powered discovery. `
  } else {
    analysis += `This ${siteType || 'site'} needs significant work across multiple areas to compete effectively in modern search. `
  }

  // Score spread analysis
  const spread = Math.max(scores.seo, scores.aeo, scores.geo) - Math.min(scores.seo, scores.aeo, scores.geo)
  if (spread > 30) {
    analysis += `There's a ${spread}-point gap between your ${scoreLabel(Math.max(scores.seo, scores.aeo, scores.geo))} ${strongest} (${Math.max(scores.seo, scores.aeo, scores.geo)}) and ${scoreLabel(Math.min(scores.seo, scores.aeo, scores.geo))} ${weakest} (${Math.min(scores.seo, scores.aeo, scores.geo)}), which suggests the site was optimized for traditional search but hasn't adapted to AI-driven discovery. `
  } else if (spread > 15) {
    analysis += `Your ${weakest} score (${Math.min(scores.seo, scores.aeo, scores.geo)}) is dragging down an otherwise ${scoreLabel(Math.max(scores.seo, scores.aeo, scores.geo))} profile. Closing this gap should be the priority. `
  } else {
    analysis += `Scores are well-balanced across SEO, AEO, and GEO, which is a good sign — improvements in any area will compound. `
  }

  // Content depth
  if (wordCount && wordCount < 300) {
    analysis += `At only ${wordCount} words, the page is too thin for AI engines to extract meaningful answers from. `
  } else if (wordCount && wordCount < 800) {
    analysis += `With ${wordCount} words, the content is adequate but won't compete against deeper pages for AI citations. `
  }

  // Schema
  if (schemaCount === 0) {
    analysis += `No structured data was found — this is a major blind spot for both Google's rich results and AI answer engines. `
  } else if (schemaCount && schemaCount >= 3) {
    analysis += `${schemaCount} schema types detected, which gives search engines and AI systems strong signals about your content. `
  }

  // Domain authority
  if (domainAuthority !== undefined && domainAuthority < 20) {
    analysis += `Domain Authority of ${domainAuthority} is low — even with perfect on-page optimization, you'll struggle to outrank sites with stronger backlink profiles. Link building should be a parallel priority. `
  }

  // Platform-specific note
  if (platform) {
    analysis += `Built on ${platform}, which means fixes can be implemented through ${platform === 'WordPress' ? 'plugins and theme settings' : platform === 'Shopify' ? 'the theme editor and apps' : 'platform-specific tools'}. `
  }

  // Critical issues
  if (criticalIssues && criticalIssues.length > 0) {
    analysis += `${criticalIssues.length} critical issue${criticalIssues.length > 1 ? 's were' : ' was'} identified that should be addressed first.`
  }

  return analysis.trim()
}

function generateDeepScanAnalysis(input: ExpertAnalysisInput): string {
  const { scores, siteType, pagesCrawled, schemaCount, domainAuthority } = input
  const avg = Math.round((scores.seo + scores.aeo + scores.geo) / 3)

  let analysis = ''

  analysis += `Across ${pagesCrawled || 'multiple'} pages, this ${siteType || 'site'} averages ${avg}/100 overall. `

  if (scores.seo >= 80 && scores.aeo < 60) {
    analysis += `Traditional SEO is solid (${scores.seo}), but the site is underperforming for AI answer engines (AEO: ${scores.aeo}). This means Google may rank you, but ChatGPT, Perplexity, and Google SGE are less likely to cite your content. Adding FAQ sections, clear definitions, and Q&A-style content would close this gap. `
  } else if (scores.geo < 50) {
    analysis += `GEO score of ${scores.geo} indicates the site lacks the authority signals that generative AI systems look for when deciding who to cite. Focus on expertise markers, data-backed claims, and reducing promotional language. `
  } else if (avg >= 80) {
    analysis += `The site is well-optimized across all dimensions. Focus on maintaining consistency across pages and addressing any outlier pages that score below the average. `
  } else {
    analysis += `There's room for improvement across the board. The most impactful changes will come from addressing the lowest-scoring pages first, as they drag down the site-wide average. `
  }

  if (domainAuthority !== undefined) {
    if (domainAuthority < 15) {
      analysis += `With a Domain Authority of ${domainAuthority}, off-page signals are the biggest bottleneck. No amount of on-page optimization will overcome a weak backlink profile. `
    } else if (domainAuthority >= 40) {
      analysis += `Domain Authority of ${domainAuthority} provides a strong foundation — on-page improvements will translate directly into ranking gains. `
    }
  }

  return analysis.trim()
}

function generateDuelAnalysis(input: ExpertAnalysisInput): string {
  const { url, scores, competitorUrl, competitorScores, domainAuthority, verdict } = input

  // If Gemini already provided a verdict, use it
  if (verdict) return verdict

  if (!competitorScores) return ''

  const yourAvg = Math.round((scores.seo + scores.aeo + scores.geo) / 3)
  const theirAvg = Math.round((competitorScores.seo + competitorScores.aeo + competitorScores.geo) / 3)
  const diff = yourAvg - theirAvg
  const domain = (u: string) => u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')

  let analysis = ''

  if (diff > 15) {
    analysis += `${domain(url)} has a clear technical advantage over ${domain(competitorUrl || '')} with an overall score ${diff} points higher. `
  } else if (diff > 0) {
    analysis += `${domain(url)} edges out ${domain(competitorUrl || '')} by ${diff} points overall, but the margin is thin enough that the competitor could close the gap quickly. `
  } else if (diff > -15) {
    analysis += `${domain(competitorUrl || '')} leads by ${Math.abs(diff)} points overall. The gap is closable with focused improvements. `
  } else {
    analysis += `${domain(competitorUrl || '')} has a significant ${Math.abs(diff)}-point lead. Catching up will require sustained effort across multiple areas. `
  }

  // Identify where each site wins
  const wins: string[] = []
  const losses: string[] = []
  if (scores.seo > competitorScores.seo) wins.push(`SEO (+${scores.seo - competitorScores.seo})`); else if (scores.seo < competitorScores.seo) losses.push(`SEO (-${competitorScores.seo - scores.seo})`)
  if (scores.aeo > competitorScores.aeo) wins.push(`AEO (+${scores.aeo - competitorScores.aeo})`); else if (scores.aeo < competitorScores.aeo) losses.push(`AEO (-${competitorScores.aeo - scores.aeo})`)
  if (scores.geo > competitorScores.geo) wins.push(`GEO (+${scores.geo - competitorScores.geo})`); else if (scores.geo < competitorScores.geo) losses.push(`GEO (-${competitorScores.geo - scores.geo})`)

  if (wins.length > 0) analysis += `You lead in ${wins.join(', ')}. `
  if (losses.length > 0) analysis += `They lead in ${losses.join(', ')}. `

  return analysis.trim()
}

function generateArenaAnalysis(input: ExpertAnalysisInput): string {
  const { scores, keyword, googleRank, arenaRank, totalSites, arenaAvg, domainAuthority } = input

  let analysis = ''

  if (arenaRank === 1) {
    analysis += `You rank #1 in the arena for "${keyword}" across SEO, AEO, and GEO optimization. `
  } else if (arenaRank && arenaRank <= 3) {
    analysis += `You're in the top 3 for "${keyword}" based on on-page optimization. `
  } else if (arenaRank) {
    analysis += `You rank #${arenaRank} out of ${totalSites || '?'} sites for "${keyword}". `
  }

  // The key insight: Google rank vs optimization rank discrepancy
  if (googleRank && arenaRank && googleRank > arenaRank + 3) {
    analysis += `Here's the critical insight: your on-page optimization ranks you #${arenaRank}, but Google has you at position #${googleRank}. This ${googleRank - arenaRank}-position gap is almost certainly driven by off-page factors — domain authority${domainAuthority !== undefined ? ` (yours is ${domainAuthority})` : ''}, backlink quality, site age, and brand recognition. `
    analysis += `Your content is technically superior to sites ranking above you, but Google weighs authority signals heavily. `
    if (domainAuthority !== undefined && domainAuthority < 20) {
      analysis += `With a DA of ${domainAuthority}, link building is the single highest-ROI activity you can pursue right now. `
    } else {
      analysis += `Focused link building and brand mentions would close this gap over time. `
    }
  } else if (googleRank && arenaRank && arenaRank > googleRank + 3) {
    analysis += `Interestingly, Google ranks you higher (#${googleRank}) than your on-page scores suggest (#${arenaRank} in the arena). This means your domain authority and backlink profile are compensating for on-page weaknesses. Improving your content optimization would solidify and extend your ranking advantage. `
  } else if (googleRank && arenaRank) {
    analysis += `Your Google rank (#${googleRank}) aligns closely with your optimization rank (#${arenaRank}), which means on-page improvements should translate directly into ranking gains. `
  }

  // Compare to arena average
  if (arenaAvg) {
    const yourAvg = Math.round((scores.seo + scores.aeo + scores.geo) / 3)
    const avgAvg = Math.round((arenaAvg.seo + arenaAvg.aeo + arenaAvg.geo) / 3)
    if (yourAvg > avgAvg + 10) {
      analysis += `You're ${yourAvg - avgAvg} points above the arena average — your on-page game is strong relative to competitors. `
    } else if (yourAvg < avgAvg - 10) {
      analysis += `You're ${avgAvg - yourAvg} points below the arena average, which means competitors are out-optimizing you on-page. `
    }
  }

  return analysis.trim()
}
