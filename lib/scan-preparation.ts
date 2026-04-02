/**
 * Shared scan preparation pipeline.
 * Ensures consistent scoring across all routes (Pro Audit, Arena, Competitive Intel, etc.)
 *
 * Call this AFTER performScan() and BEFORE calculateScoresFromScanResult().
 * Sets schemaQuality, semanticFlags, and siteType on the scan result.
 *
 * Semantic flags use graduated 0-100 severities (matching Gemini's output format)
 * so the grader produces consistent scores regardless of whether AI analysis ran.
 */

import { detectSiteType } from './site-type-detector'

/**
 * Prepare a scan result for grading by setting schema quality,
 * semantic flags, and site type. Mutates the scan object in place.
 */
export function prepareScanForGrading(scan: any): { primaryType: string; confidence: number } {
  // 1. Site type detection
  const siteTypeResult = detectSiteType(scan, [])
  scan.siteType = siteTypeResult.primaryType

  // 2. Schema quality (graduated)
  if (scan.schemas?.length > 0) {
    const types = scan.schemas.map((s: any) => s['@type']).filter(Boolean)
    const hasRequiredProps = scan.schemas.some((s: any) => s.name || s.headline || s['@type'])
    const hasMultipleTypes = new Set(types).size > 1
    const score = hasRequiredProps ? (hasMultipleTypes ? 80 : 70) : 40
    scan.schemaQuality = {
      hasSchema: true,
      score,
      issues: hasRequiredProps ? [] : ['Missing required properties'],
    }
  } else {
    scan.schemaQuality = {
      hasSchema: false,
      score: 0,
      issues: ['No structured data found'],
    }
  }

  // 3. Graduated semantic flags (0-100 severity, matching Gemini format)
  const sd = scan.structuralData || {}
  const wordCount = sd.wordCount || 0
  const h2Count = sd.semanticTags?.h2Count || 0
  const h3Count = sd.semanticTags?.h3Count || 0
  const headingCount = h2Count + h3Count
  const internalLinks = sd.links?.internal || 0
  const externalLinks = sd.links?.external || 0
  const totalImages = sd.media?.totalImages || 0
  const imagesWithAlt = sd.media?.imagesWithAlt || 0
  const hasDescription = !!(scan.description && scan.description.length > 50)

  // Q&A matching: penalize thin content and lack of structure
  // 800+ words with headings = likely has Q&A-style content
  const qnaSeverity = wordCount >= 800 ? (headingCount >= 3 ? 10 : 25)
    : wordCount >= 500 ? (headingCount >= 2 ? 30 : 50)
    : wordCount >= 300 ? 65
    : 80

  // Entity density: more words + external links + schemas = more entities
  const entitySeverity = wordCount >= 800 ? (externalLinks >= 2 ? 10 : 20)
    : wordCount >= 500 ? (externalLinks >= 1 ? 30 : 45)
    : wordCount >= 300 ? 60
    : 80

  // Formatting: headings, lists, structure
  const formatSeverity = headingCount >= 4 ? 5
    : headingCount >= 2 ? 15
    : headingCount >= 1 ? 35
    : wordCount < 300 ? 75
    : 55

  // Definition statements: correlated with word count and heading structure
  const defSeverity = wordCount >= 800 ? (headingCount >= 3 ? 10 : 25)
    : wordCount >= 500 ? 35
    : wordCount >= 300 ? 55
    : 75

  // Promotional tone: short pages with few external links tend to be promotional
  const promoSeverity = wordCount < 200 ? 40
    : (externalLinks === 0 && wordCount < 500) ? 30
    : externalLinks === 0 ? 15
    : 5

  // Expertise signals: schemas, external links, word depth
  const expertSeverity = wordCount >= 800 ? (scan.schemas?.length > 0 ? 5 : 20)
    : wordCount >= 500 ? (scan.schemas?.length > 0 ? 20 : 40)
    : wordCount >= 300 ? 55
    : 75

  // Hard data: longer content with external references more likely has data
  const dataSeverity = wordCount >= 800 ? (externalLinks >= 3 ? 5 : 20)
    : wordCount >= 500 ? (externalLinks >= 1 ? 25 : 45)
    : wordCount >= 300 ? 55
    : 75

  // First person: can't detect without AI, assume moderate for short content
  const fpSeverity = wordCount < 300 ? 20 : 10

  // Unsubstantiated claims: short content without data backing
  const claimsSeverity = wordCount < 300 ? 30
    : (externalLinks === 0 && wordCount < 500) ? 20
    : 5

  scan.semanticFlags = {
    noDirectQnAMatching: qnaSeverity,
    lowEntityDensity: entitySeverity,
    poorFormattingConciseness: formatSeverity,
    lackOfDefinitionStatements: defSeverity,
    promotionalTone: promoSeverity,
    lackOfExpertiseSignals: expertSeverity,
    lackOfHardData: dataSeverity,
    heavyFirstPersonUsage: fpSeverity,
    unsubstantiatedClaims: claimsSeverity,
  }

  return siteTypeResult
}
