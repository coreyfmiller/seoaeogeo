import type { ScanContext } from '@/lib/chat/types'

/**
 * Generates a proactive suggestion based on scan context penalties.
 * Pure client-side function — no API call.
 *
 * Returns a summary string highlighting critical or warning issues,
 * or null if there are no penalties.
 */
export function generateProactiveSuggestion(
  scanContext: ScanContext
): string | null {
  const penalties = scanContext.penalties ?? []

  if (penalties.length === 0) {
    return null
  }

  const criticalCount = penalties.filter(
    (p) => p.severity === 'critical'
  ).length

  if (criticalCount > 0) {
    return `I see ${criticalCount} critical issue${criticalCount === 1 ? '' : 's'} on your site. Want me to walk you through the most impactful fix first?`
  }

  const warningCount = penalties.filter(
    (p) => p.severity === 'warning'
  ).length

  if (warningCount > 0) {
    return `Your site looks decent, but I found ${warningCount} area${warningCount === 1 ? '' : 's'} to improve. Want me to prioritize them?`
  }

  // Only info-level penalties — nothing actionable to surface
  return null
}
