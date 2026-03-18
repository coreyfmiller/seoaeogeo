/**
 * Deterministic Semantic Heuristics
 * 
 * Replaces AI-generated semanticFlags with text-analysis heuristics.
 * Same input = same output, every time. Zero AI cost.
 * 
 * Each function returns a severity score 0-100:
 *   0 = no issue detected
 *   100 = severe issue
 */

export interface SemanticSeverityFlags {
  topicMisalignment: number;
  keywordStuffing: number;
  poorReadability: number;
  noDirectQnAMatching: number;
  lowEntityDensity: number;
  poorFormattingConciseness: number;
  lackOfDefinitionStatements: number;
  promotionalTone: number;
  lackOfExpertiseSignals: number;
  lackOfHardData: number;
  heavyFirstPersonUsage: number;
  unsubstantiatedClaims: number;
}

/**
 * Compute all 12 semantic severity flags from crawled text + metadata.
 * Fully deterministic — no AI calls.
 */
export function computeSemanticFlags(
  text: string,
  title: string,
  description: string,
  wordCount: number
): SemanticSeverityFlags {
  // Normalize text once for all heuristics
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const effectiveWordCount = wordCount || words.length;

  return {
    topicMisalignment: measureTopicMisalignment(title, lowerText, words),
    keywordStuffing: measureKeywordStuffing(words),
    poorReadability: measurePoorReadability(words, sentences),
    noDirectQnAMatching: measureQnAMatching(lowerText, effectiveWordCount),
    lowEntityDensity: measureEntityDensity(text, words, effectiveWordCount),
    poorFormattingConciseness: measureFormattingConciseness(text, sentences, effectiveWordCount),
    lackOfDefinitionStatements: measureDefinitionStatements(lowerText, effectiveWordCount),
    promotionalTone: measurePromotionalTone(lowerText, words),
    lackOfExpertiseSignals: measureExpertiseSignals(lowerText),
    lackOfHardData: measureHardData(text, effectiveWordCount),
    heavyFirstPersonUsage: measureFirstPersonUsage(words),
    unsubstantiatedClaims: measureUnsubstantiatedClaims(lowerText, text, effectiveWordCount),
  };
}


// ============================================================================
// Individual heuristic functions
// ============================================================================

/**
 * Topic Misalignment: Do title keywords appear in the body?
 */
function measureTopicMisalignment(title: string, lowerText: string, words: string[]): number {
  if (!title || title.length < 3) return 50;
  
  const titleWords = title.toLowerCase()
    .split(/[\s\-|:,]+/)
    .filter(w => w.length > 3) // Skip short words like "the", "and"
    .filter(w => !STOP_WORDS.has(w));
  
  if (titleWords.length === 0) return 30;
  
  const matchCount = titleWords.filter(tw => lowerText.includes(tw)).length;
  const matchRatio = matchCount / titleWords.length;
  
  // 100% match = 0 severity, 0% match = 80 severity
  return Math.round((1 - matchRatio) * 80);
}

/**
 * Keyword Stuffing: Is any single word repeated excessively?
 */
function measureKeywordStuffing(words: string[]): number {
  if (words.length < 50) return 0; // Too short to judge
  
  const freq = new Map<string, number>();
  const contentWords = words.filter(w => w.length > 3 && !STOP_WORDS.has(w));
  
  for (const w of contentWords) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  
  if (contentWords.length === 0) return 0;
  
  // Find the highest frequency ratio
  let maxRatio = 0;
  for (const count of freq.values()) {
    const ratio = count / contentWords.length;
    if (ratio > maxRatio) maxRatio = ratio;
  }
  
  // >8% of content words = severe stuffing, <2% = fine
  if (maxRatio < 0.02) return 0;
  if (maxRatio > 0.08) return 90;
  return Math.round(((maxRatio - 0.02) / 0.06) * 90);
}

/**
 * Poor Readability: Average sentence length and word complexity.
 */
function measurePoorReadability(words: string[], sentences: string[]): number {
  if (words.length < 50 || sentences.length < 3) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const complexWords = words.filter(w => w.length > 12).length;
  const complexRatio = complexWords / words.length;
  
  // Sentence length score: 15-20 words = ideal, >30 = poor
  let sentenceScore = 0;
  if (avgSentenceLength > 30) sentenceScore = 70;
  else if (avgSentenceLength > 25) sentenceScore = 50;
  else if (avgSentenceLength > 20) sentenceScore = 25;
  
  // Complex word score
  let complexScore = 0;
  if (complexRatio > 0.15) complexScore = 60;
  else if (complexRatio > 0.10) complexScore = 35;
  else if (complexRatio > 0.05) complexScore = 15;
  
  return Math.min(100, Math.round(sentenceScore * 0.6 + complexScore * 0.4));
}

/**
 * No Direct Q&A Matching: Does content answer questions?
 */
function measureQnAMatching(lowerText: string, wordCount: number): number {
  if (wordCount < 100) return 70; // Too thin to have Q&A
  
  const qnaPatterns = [
    /what is/g, /what are/g, /how to/g, /how do/g, /how does/g,
    /why is/g, /why do/g, /why does/g, /when to/g, /when should/g,
    /where to/g, /where can/g, /who is/g, /who are/g,
    /\?/g, // Question marks
    /the answer/g, /in short/g, /simply put/g, /this means/g,
    /here's how/g, /here is how/g, /the reason/g, /because/g,
    /faq/g, /frequently asked/g,
  ];
  
  let matchCount = 0;
  for (const pattern of qnaPatterns) {
    const matches = lowerText.match(pattern);
    if (matches) matchCount += matches.length;
  }
  
  // Normalize by content length (per 500 words)
  const normalizedCount = (matchCount / wordCount) * 500;
  
  // 8+ matches per 500 words = excellent, 0 = poor
  if (normalizedCount >= 8) return 0;
  if (normalizedCount >= 5) return 20;
  if (normalizedCount >= 3) return 40;
  if (normalizedCount >= 1) return 60;
  return 80;
}

/**
 * Low Entity Density: Are there specific names, places, things?
 */
function measureEntityDensity(originalText: string, words: string[], wordCount: number): number {
  if (wordCount < 100) return 60;
  
  // Count capitalized words (likely proper nouns/entities) in original text
  const originalWords = originalText.split(/\s+/).filter(w => w.length > 1);
  const capitalizedWords = originalWords.filter(w => /^[A-Z][a-z]/.test(w));
  
  // Count numbers and specific data points
  const numbers = originalText.match(/\d+/g) || [];
  
  // Entity density = (capitalized words + numbers) / total words
  const entityCount = capitalizedWords.length + numbers.length;
  const density = entityCount / Math.max(wordCount, 1);
  
  // >10% = rich, <2% = poor
  if (density >= 0.10) return 0;
  if (density >= 0.07) return 15;
  if (density >= 0.05) return 30;
  if (density >= 0.03) return 50;
  return 70;
}

/**
 * Poor Formatting/Conciseness: Long paragraphs, no structure.
 */
function measureFormattingConciseness(text: string, sentences: string[], wordCount: number): number {
  if (wordCount < 100) return 40;
  
  // Check for paragraph breaks (double newlines or <br> patterns)
  const paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/).filter(p => p.trim().length > 0);
  const avgParagraphLength = wordCount / Math.max(paragraphs.length, 1);
  
  // Check for list indicators
  const listPatterns = (text.match(/^[\s]*[-•*]\s/gm) || []).length;
  const numberedLists = (text.match(/^[\s]*\d+[.)]\s/gm) || []).length;
  const hasLists = listPatterns + numberedLists > 0;
  
  let score = 0;
  
  // Long paragraphs penalty
  if (avgParagraphLength > 200) score += 40;
  else if (avgParagraphLength > 150) score += 25;
  else if (avgParagraphLength > 100) score += 10;
  
  // No lists penalty (for content > 300 words)
  if (wordCount > 300 && !hasLists) score += 25;
  
  // Few paragraphs penalty
  if (paragraphs.length <= 2 && wordCount > 300) score += 25;
  
  return Math.min(100, score);
}


/**
 * Lack of Definition Statements: Does content define terms?
 */
function measureDefinitionStatements(lowerText: string, wordCount: number): number {
  if (wordCount < 100) return 50;
  
  const definitionPatterns = [
    /\bis a\b/g, /\bare a\b/g, /\bis an\b/g,
    /\brefers to\b/g, /\bmeans\b/g, /\bdefined as\b/g,
    /\bknown as\b/g, /\bcalled\b/g,
    /\bin other words\b/g, /\bsimply put\b/g,
    /\bthis is\b/g, /\bthese are\b/g,
    /\bwhich is\b/g, /\bwhich are\b/g,
    /\bthe term\b/g, /\bthe concept\b/g,
  ];
  
  let matchCount = 0;
  for (const pattern of definitionPatterns) {
    const matches = lowerText.match(pattern);
    if (matches) matchCount += matches.length;
  }
  
  const normalizedCount = (matchCount / wordCount) * 500;
  
  if (normalizedCount >= 6) return 0;
  if (normalizedCount >= 4) return 15;
  if (normalizedCount >= 2) return 35;
  if (normalizedCount >= 1) return 55;
  return 75;
}

/**
 * Promotional Tone: Sales language, superlatives, CTAs.
 */
function measurePromotionalTone(lowerText: string, words: string[]): number {
  if (words.length < 50) return 0;
  
  const promoPatterns = [
    /\bbest\b/g, /\b#1\b/g, /\bnumber one\b/g, /\btop rated\b/g,
    /\bamazing\b/g, /\bincredible\b/g, /\bunbelievable\b/g, /\bfantastic\b/g,
    /\bguaranteed?\b/g, /\brisk.?free\b/g, /\bmoney.?back\b/g,
    /\bbuy now\b/g, /\border now\b/g, /\bact now\b/g, /\blimited time\b/g,
    /\bdon't miss\b/g, /\bhurry\b/g, /\bexclusive\b/g, /\bspecial offer\b/g,
    /\bfree shipping\b/g, /\bdiscount\b/g, /\bsale\b/g, /\bsave \d/g,
    /\bcall now\b/g, /\bsign up\b/g, /\bget started\b/g,
    /\bunmatched\b/g, /\bunrivaled\b/g, /\bworld.?class\b/g,
    /\bpremium\b/g, /\bsuperior\b/g, /\bultimate\b/g,
    /\btransform\b/g, /\brevolutionary\b/g, /\bgame.?changer\b/g,
  ];
  
  let matchCount = 0;
  for (const pattern of promoPatterns) {
    const matches = lowerText.match(pattern);
    if (matches) matchCount += matches.length;
  }
  
  const normalizedCount = (matchCount / words.length) * 100;
  
  // >5% promotional words = very promotional, <0.5% = neutral
  if (normalizedCount < 0.5) return 0;
  if (normalizedCount < 1.0) return 15;
  if (normalizedCount < 2.0) return 35;
  if (normalizedCount < 3.5) return 55;
  if (normalizedCount < 5.0) return 75;
  return 90;
}

/**
 * Lack of Expertise Signals: Credentials, experience, authority.
 */
function measureExpertiseSignals(lowerText: string): number {
  const expertisePatterns = [
    /\byears?\s+(of\s+)?experience\b/g,
    /\bcertified\b/g, /\blicensed\b/g, /\baccredited\b/g,
    /\bphd\b/g, /\bmaster'?s?\b/g, /\bdegree\b/g, /\bdiploma\b/g,
    /\bexpert\b/g, /\bspecialist\b/g, /\bprofessional\b/g,
    /\baward.?winning\b/g, /\brecognized\b/g,
    /\bpublished\b/g, /\bresearch\b/g, /\bstudy\b/g, /\bstudies\b/g,
    /\baccording to\b/g, /\bsource\b/g, /\bcitation\b/g,
    /\bindustry\b/g, /\bauthority\b/g, /\btrusted\b/g,
    /\bfounded\b/g, /\bestablished\b/g, /\bsince \d{4}\b/g,
    /\bboard.?certified\b/g, /\bfellow\b/g,
    /\breviewed\b/g, /\bpeer.?reviewed\b/g,
    /\btrained\b/g, /\bqualified\b/g,
  ];
  
  let matchCount = 0;
  for (const pattern of expertisePatterns) {
    const matches = lowerText.match(pattern);
    if (matches) matchCount += matches.length;
  }
  
  // 5+ signals = strong expertise, 0 = none
  if (matchCount >= 5) return 0;
  if (matchCount >= 3) return 20;
  if (matchCount >= 2) return 40;
  if (matchCount >= 1) return 55;
  return 75;
}

/**
 * Lack of Hard Data: Numbers, statistics, percentages.
 */
function measureHardData(originalText: string, wordCount: number): number {
  if (wordCount < 100) return 50;
  
  // Count various data patterns
  const percentages = (originalText.match(/\d+(\.\d+)?%/g) || []).length;
  const dollarAmounts = (originalText.match(/\$[\d,]+(\.\d+)?/g) || []).length;
  const specificNumbers = (originalText.match(/\b\d{2,}\b/g) || []).length; // Numbers with 2+ digits
  const years = (originalText.match(/\b(19|20)\d{2}\b/g) || []).length;
  const measurements = (originalText.match(/\d+\s*(kg|lb|oz|ml|cm|mm|ft|mph|mbps|gb|mb|kb)/gi) || []).length;
  
  const totalDataPoints = percentages + dollarAmounts + specificNumbers + years + measurements;
  const normalizedCount = (totalDataPoints / wordCount) * 500;
  
  // 10+ data points per 500 words = data-rich, 0 = no data
  if (normalizedCount >= 10) return 0;
  if (normalizedCount >= 6) return 15;
  if (normalizedCount >= 3) return 35;
  if (normalizedCount >= 1) return 55;
  return 75;
}

/**
 * Heavy First Person Usage: I, we, my, our, me, us.
 */
function measureFirstPersonUsage(words: string[]): number {
  if (words.length < 50) return 0;
  
  const firstPersonWords = new Set(['i', 'we', 'my', 'our', 'me', 'us', 'myself', 'ourselves', "i'm", "i've", "i'll", "we're", "we've", "we'll"]);
  const fpCount = words.filter(w => firstPersonWords.has(w)).length;
  const ratio = fpCount / words.length;
  
  // >5% = heavy, <1% = minimal
  if (ratio < 0.01) return 0;
  if (ratio < 0.02) return 15;
  if (ratio < 0.03) return 35;
  if (ratio < 0.05) return 55;
  return 80;
}

/**
 * Unsubstantiated Claims: Superlatives without evidence nearby.
 */
function measureUnsubstantiatedClaims(lowerText: string, originalText: string, wordCount: number): number {
  if (wordCount < 100) return 30;
  
  const claimPatterns = [
    /\bbest\b/g, /\bmost\b/g, /\bgreatest\b/g, /\bworst\b/g,
    /\balways\b/g, /\bnever\b/g, /\beveryone\b/g, /\bnobody\b/g,
    /\bproven\b/g, /\bguaranteed?\b/g,
    /\b100%\b/g, /\ball\b/g,
    /\bno one\b/g, /\bnothing\b/g,
  ];
  
  let claimCount = 0;
  for (const pattern of claimPatterns) {
    const matches = lowerText.match(pattern);
    if (matches) claimCount += matches.length;
  }
  
  // Check for evidence patterns nearby
  const evidencePatterns = (originalText.match(/\d+(\.\d+)?%|\$[\d,]+|\b(study|research|data|survey|report|according)\b/gi) || []).length;
  
  // Ratio of claims to evidence
  const claimRatio = (claimCount / Math.max(wordCount, 1)) * 500;
  const evidenceRatio = (evidencePatterns / Math.max(wordCount, 1)) * 500;
  
  // High claims + low evidence = unsubstantiated
  if (claimRatio < 2) return 0; // Few claims = fine
  if (evidenceRatio >= claimRatio * 0.5) return 10; // Good evidence backing
  if (evidenceRatio >= claimRatio * 0.25) return 35;
  if (claimRatio < 5) return 45;
  return 70;
}

// ============================================================================
// Utility
// ============================================================================

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
  'these', 'those', 'it', 'its', 'not', 'no', 'nor', 'so', 'if', 'then',
  'than', 'too', 'very', 'just', 'about', 'also', 'more', 'some', 'any',
  'each', 'every', 'all', 'both', 'few', 'most', 'other', 'into', 'over',
  'such', 'only', 'own', 'same', 'your', 'our', 'their', 'what', 'which',
  'who', 'whom', 'how', 'when', 'where', 'why', 'here', 'there',
]);
