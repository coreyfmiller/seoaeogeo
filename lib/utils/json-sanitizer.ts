/**
 * Sanitize a JSON string from Gemini responses that may contain:
 * 1. Unescaped control characters (0x00-0x1F) inside string literals
 * 2. Invalid escape sequences (e.g. \x, \a, \', \0) that crash JSON.parse
 * 
 * Strategy: Walk through the string character by character, tracking whether
 * we're inside a JSON string literal, and fix issues as we go.
 */

const VALID_JSON_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'])

export function sanitizeJsonString(raw: string): string {
  let result = ''
  let inString = false
  let i = 0

  while (i < raw.length) {
    const ch = raw[i]
    const code = raw.charCodeAt(i)

    // Handle backslash inside string literals
    if (inString && ch === '\\') {
      const next = raw[i + 1]
      if (next === undefined) {
        // Trailing backslash — drop it
        i++
        continue
      }
      if (VALID_JSON_ESCAPES.has(next)) {
        // Valid JSON escape — keep as-is
        result += ch + next
        i += 2
        continue
      }
      // Invalid escape sequence — double the backslash to make it literal
      result += '\\\\' + next
      i += 2
      continue
    }

    // Toggle string state on unescaped quotes
    if (ch === '"') {
      inString = !inString
      result += ch
      i++
      continue
    }

    // Sanitize control chars inside string literals
    if (inString && code >= 0 && code <= 0x1F) {
      switch (ch) {
        case '\n': result += '\\n'; break
        case '\r': result += '\\r'; break
        case '\t': result += '\\t'; break
        default: result += ''; break // strip other control chars
      }
      i++
      continue
    }

    result += ch
    i++
  }

  return result
}

/**
 * Robust JSON parse with sanitization and retry.
 * First tries raw parse, then sanitized parse, then aggressive cleanup.
 */
export function safeJsonParse(raw: string): any {
  // Attempt 1: Direct parse
  try {
    return JSON.parse(raw)
  } catch {}

  // Attempt 2: Sanitized parse
  try {
    return JSON.parse(sanitizeJsonString(raw))
  } catch {}

  // Attempt 3: Aggressive cleanup — strip all backslashes that aren't valid escapes
  try {
    const aggressive = raw.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
    return JSON.parse(aggressive)
  } catch {}

  // Attempt 4: Remove all control characters globally, then try
  try {
    const stripped = raw.replace(/[\x00-\x1F]+/g, ' ')
    return JSON.parse(stripped)
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON after all repair attempts: ${(e as Error).message}`)
  }
}
