import type { ScanContext } from '@/lib/chat/types'

/**
 * Generates a proactive suggestion based on scan context.
 * Pure client-side function — no API call.
 *
 * Uses both penalties (from grader) and criticalIssues (from grader breakdown)
 * to produce an accurate count that matches what the user sees on the page.
 */
export function generateProactiveSuggestion(
  scanContext: ScanContext
): string | null {
  const penalties = scanContext.penalties ?? []
  const criticalIssues = scanContext.criticalIssues ?? []

  // Count critical from both sources, deduplicated by taking the higher count
  const criticalPenalties = penalties.filter(p => p.severity === 'critical').length
  const criticalFromGrader = criticalIssues.length
  const criticalCount = Math.max(criticalPenalties, criticalFromGrader)

  const totalIssues = penalties.length

  if (criticalCount > 0) {
    return `I see ${criticalCount} critical issue${criticalCount === 1 ? '' : 's'} on your site. Want me to walk you through the most impactful fix first?`
  }

  if (totalIssues > 0) {
    return `Your site has ${totalIssues} area${totalIssues === 1 ? '' : 's'} to improve. Want me to prioritize them?`
  }

  return null
}
