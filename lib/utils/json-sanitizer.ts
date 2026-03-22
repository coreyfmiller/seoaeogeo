/**
 * Sanitize a JSON string from Gemini responses that may contain
 * unescaped control characters (0x00-0x1F) which crash JSON.parse.
 * 
 * Strategy: Walk through the string and only sanitize control characters
 * that appear inside JSON string literals (between unescaped quotes).
 */
export function sanitizeJsonString(raw: string): string {
  let result = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    const code = raw.charCodeAt(i)

    if (escaped) {
      result += ch
      escaped = false
      continue
    }

    if (ch === '\\' && inString) {
      result += ch
      escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      result += ch
      continue
    }

    // Only sanitize control chars inside string literals
    if (inString && code >= 0 && code <= 0x1F) {
      switch (ch) {
        case '\n': result += '\\n'; break
        case '\r': result += '\\r'; break
        case '\t': result += '\\t'; break
        default: result += ''; break // strip other control chars
      }
      continue
    }

    result += ch
  }

  return result
}
