/**
 * Shared scan preparation pipeline.
 * Ensures consistent scoring across all routes (Pro Audit, Arena, Competitive Intel, etc.)
 *
 * Call this AFTER performScan() and BEFORE calculateScoresFromScanResult().
 * Sets schemaQuality, semanticFlags, and siteType on the scan result.
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

  // 2. Schema quality
  if (scan.schemas?.length > 0) {
    const hasRequiredProps = scan.schemas.some((s: any) => s.name || s.headline || s['@type'])
    scan.schemaQuality = {
      hasSchema: true,
      score: hasRequiredProps ? 70 : 40,
      issues: hasRequiredProps ? [] : ['Missing required properties'],
    }
  } else {
    scan.schemaQuality = {
      hasSchema: false,
      score: 0,
      issues: ['No structured data found'],
    }
  }

  // 3. Semantic flags based on word count
  const wordCount = scan.structuralData?.wordCount || 0
  if (wordCount < 500) {
    scan.semanticFlags = {
      noDirectQnAMatching: true,
      lowEntityDensity: true,
      poorFormattingConciseness: wordCount < 300,
      lackOfDefinitionStatements: true,
      promotionalTone: false,
      lackOfExpertiseSignals: true,
      lackOfHardData: true,
      heavyFirstPersonUsage: false,
      unsubstantiatedClaims: false,
    }
  } else {
    scan.semanticFlags = {
      noDirectQnAMatching: false,
      lowEntityDensity: false,
      poorFormattingConciseness: false,
      lackOfDefinitionStatements: false,
      promotionalTone: false,
      lackOfExpertiseSignals: false,
      lackOfHardData: false,
      heavyFirstPersonUsage: false,
      unsubstantiatedClaims: false,
    }
  }

  return siteTypeResult
}
