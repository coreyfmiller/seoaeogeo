/**
 * Input sanitizer for Duelly AI chat.
 * Strips prompt injection patterns and enforces length limits.
 */

const MAX_INPUT_LENGTH = 2000;

/**
 * Case-insensitive injection patterns to strip from user input.
 * Covers role overrides, system prompt leaks, and common injection phrases.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+previous\s+instructions/gi,
  /ignore\s+all\s+instructions/gi,
  /ignore\s+above/gi,
  /you\s+are\s+now/gi,
  /act\s+as/gi,
  /pretend\s+you\s+are/gi,
  /```system/gi,
  /```assistant/gi,
  /\[system\]/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
  // Line-level patterns first (strip entire lines starting with these prefixes)
  /^system:\s*.*$/gim,
  /^assistant:\s*.*$/gim,
  // Then standalone occurrences (catches mid-line uses)
  /system\s*:/gi,
  /assistant\s*:/gi,
];

/**
 * Sanitizes user input by stripping prompt injection patterns,
 * trimming whitespace, and truncating to the max allowed length.
 *
 * @param input - Raw user input string
 * @returns Sanitized string safe for inclusion in chat requests
 */
export function sanitizeUserInput(input: string): string {
  let sanitized = input;

  for (const pattern of INJECTION_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    sanitized = sanitized.replace(pattern, '');
  }

  sanitized = sanitized.trim();

  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }

  return sanitized;
}
