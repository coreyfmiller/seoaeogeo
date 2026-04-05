"use client"

/**
 * Parses fix/instruction text that contains numbered steps and renders
 * them as a properly formatted list instead of a wall of text.
 *
 * Handles patterns like:
 *   "1) step one. 2) step two."
 *   "1. step one 2. step two"
 *   "In Shopify: 1) ... General best practice: 1) ..."
 */

interface FormattedFixTextProps {
  text: string
  className?: string
  /** Text size class — defaults to "text-sm" */
  size?: "text-xs" | "text-sm"
}

export function FormattedFixText({ text, className, size = "text-sm" }: FormattedFixTextProps) {
  // Split into sections on platform/general prefixes
  const sections = text
    .split(/(?=(?:General best practice|Target:|In (?:Shopify|WordPress|Wix|Squarespace|Next\.js|Custom))[^:]*:)/i)
    .filter(s => s.trim())

  const hasMultipleSections = sections.length > 1
  const hasNumberedSteps = /\d+[.)]\s/.test(text)

  // Simple text with no structure — render as-is
  if (!hasMultipleSections && !hasNumberedSteps) {
    return <p className={`${size} text-foreground/90 leading-relaxed ${className || ""}`}>{text}</p>
  }

  return (
    <div className={`space-y-2.5 ${className || ""}`}>
      {sections.map((section, sIdx) => {
        // Extract label prefix like "In Shopify:" or "General best practice:"
        const labelMatch = section.match(
          /^((?:General best practice|Target:|In (?:Shopify|WordPress|Wix|Squarespace|Next\.js|Custom))[^:]*:)\s*/i
        )
        const label = labelMatch ? labelMatch[1] : null
        const body = label ? section.slice(labelMatch![0].length).trim() : section.trim()

        const steps = extractSteps(body)

        if (steps.length > 1) {
          return (
            <div key={sIdx}>
              {label && (
                <p className={`${size} font-semibold text-[#00e5ff] mb-1.5`}>{label}</p>
              )}
              <ol className="space-y-1 list-none">
                {steps.map((step, i) => (
                  <li key={i} className={`flex items-start gap-2 ${size} text-foreground/90 leading-relaxed`}>
                    <span className={`inline-flex items-center justify-center rounded-full bg-[#00e5ff]/15 text-[#00e5ff] font-bold shrink-0 mt-0.5 ${size === "text-xs" ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[10px]"}`}>
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )
        }

        // No numbered steps in this section
        return (
          <div key={sIdx}>
            {label && (
              <p className={`${size} font-semibold text-[#00e5ff] mb-1`}>{label}</p>
            )}
            <p className={`${size} text-foreground/90 leading-relaxed`}>{body}</p>
          </div>
        )
      })}
    </div>
  )
}

/** Extract numbered steps from text, trying parenthesis then dot patterns. */
function extractSteps(text: string): string[] {
  // Try parenthesis pattern: 1) 2) 3)
  const parenParts = text.split(/\s*\d+\)\s+/).filter(Boolean)
  if (parenParts.length > 1) {
    return parenParts.map(s => s.replace(/\.\s*$/, "").trim())
  }

  // Try dot pattern: 1. 2. 3. — only if 2+ numbered items
  const dotMatches = text.match(/\d+\.\s+/g)
  if (dotMatches && dotMatches.length >= 2) {
    const dotParts = text.split(/\s*\d+\.\s+/).filter(Boolean)
    if (dotParts.length > 1) {
      return dotParts.map(s => s.replace(/\.\s*$/, "").trim())
    }
  }

  return [text]
}
