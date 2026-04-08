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
  } catch {}

  // Attempt 5: Fix unescaped quotes inside string values
  // This handles the common case where Gemini puts HTML attributes or code with quotes inside JSON strings
  try {
    const fixed = repairUnescapedQuotes(raw)
    return JSON.parse(fixed)
  } catch {}

  // Attempt 6: Nuclear option — extract key-value pairs with regex
  try {
    const stripped = raw.replace(/[\x00-\x1F]+/g, ' ')
    const fixed = repairUnescapedQuotes(stripped)
    return JSON.parse(fixed)
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON after all repair attempts: ${(e as Error).message}`)
  }
}

/**
 * Attempt to fix unescaped double quotes inside JSON string values.
 * Walks through the string tracking JSON structure depth and escapes
 * quotes that appear inside string values but aren't at string boundaries.
 */
function repairUnescapedQuotes(raw: string): string {
  const result: string[] = []
  let i = 0
  let inString = false
  let prevChar = ''

  while (i < raw.length) {
    const ch = raw[i]

    if (ch === '"' && prevChar !== '\\') {
      if (!inString) {
        // Opening a string
        inString = true
        result.push(ch)
      } else {
        // Could be closing the string or an unescaped quote inside
        // Look ahead to see if this looks like a string boundary
        const after = raw.substring(i + 1, i + 20).trimStart()
        const isStringBoundary = !after || 
          after[0] === ':' || after[0] === ',' || after[0] === '}' || 
          after[0] === ']' || after.startsWith('//') || after[0] === '\n'
        
        if (isStringBoundary) {
          // This is a real string boundary
          inString = false
          result.push(ch)
        } else {
          // This is an unescaped quote inside a string — escape it
          result.push('\\"')
        }
      }
    } else {
      result.push(ch)
    }

    prevChar = ch
    i++
  }

  return result.join('')
}
