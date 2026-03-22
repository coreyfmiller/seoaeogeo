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
 * Improved: detects question-answer pairs, FAQ sections, heading questions,
 * and structured Q&A patterns — not just keyword presence.
 */
function measureQnAMatching(lowerText: string, wordCount: number): number {
  if (wordCount < 100) return 70;

  let score = 0;

  // 1. Question-answer PAIRS: question mark followed by substantive text (>20 chars)
  const qaPairMatches = lowerText.match(/\?[^?]{20,}/g) || [];
  score += Math.min(qaPairMatches.length * 3, 15);

  // 2. Explicit question words at start of sentences / headings
  const headingQuestions = (lowerText.match(/(?:^|\n)\s*(?:what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b[^.?]*\?/gm) || []).length;
  score += Math.min(headingQuestions * 4, 16);

  // 3. FAQ section indicators (strong signal)
  const faqIndicators = [/\bfaq\b/g, /\bfrequently asked/g, /\bcommon questions/g, /\bq\s*&\s*a\b/g, /\bq:/g, /\ba:/g];
  let faqCount = 0;
  for (const p of faqIndicators) { faqCount += (lowerText.match(p) || []).length; }
  score += Math.min(faqCount * 5, 15);

  // 4. Direct answer patterns (signals content actually answers, not just asks)
  const answerPatterns = [
    /\bthe answer is\b/g, /\bin short\b/g, /\bsimply put\b/g,
    /\bthis means\b/g, /\bhere's how\b/g, /\bhere is how\b/g,
    /\bthe reason\b/g, /\bto summarize\b/g, /\bin summary\b/g,
    /\bthe solution\b/g, /\byou can\b/g, /\byou should\b/g,
    /\bstep \d/g, /\bfirst,?\s/g, /\bnext,?\s/g, /\bfinally,?\s/g,
  ];
  let answerCount = 0;
  for (const p of answerPatterns) { answerCount += (lowerText.match(p) || []).length; }
  score += Math.min(answerCount * 2, 14);

  // 5. HTML structural Q&A signals (details/summary, dl/dt/dd patterns in raw text)
  const structuralQA = (lowerText.match(/<(?:details|summary|dt|dd)\b/g) || []).length;
  score += Math.min(structuralQA * 3, 10);

  // Normalize by content length — longer content needs more Q&A signals
  const lengthFactor = Math.max(0.5, Math.min(2.0, wordCount / 500));
  const normalizedScore = score / lengthFactor;

  // Map to severity: higher score = lower severity (better Q&A)
  if (normalizedScore >= 25) return 0;
  if (normalizedScore >= 18) return 15;
  if (normalizedScore >= 12) return 30;
  if (normalizedScore >= 6) return 50;
  if (normalizedScore >= 2) return 65;
  return 80;
}

/**
 * Low Entity Density: Are there specific names, places, things?
 * Improved: filters sentence-start capitals, detects proper noun sequences,
 * dates, currencies, emails, URLs, and multi-word entity names.
 */
function measureEntityDensity(originalText: string, words: string[], wordCount: number): number {
  if (wordCount < 100) return 60;

  // Split into sentences to filter sentence-start capitals
  const sentences = originalText.split(/[.!?]\s+/);
  const sentenceStarts = new Set<string>();
  for (const s of sentences) {
    const firstWord = s.trim().split(/\s+/)[0];
    if (firstWord) sentenceStarts.add(firstWord);
  }

  const originalWords = originalText.split(/\s+/).filter(w => w.length > 1);

  // Count mid-sentence capitalized words (real proper nouns, not sentence starters)
  let properNounCount = 0;
  for (let i = 0; i < originalWords.length; i++) {
    const w = originalWords[i];
    if (!/^[A-Z][a-z]/.test(w)) continue;
    if (sentenceStarts.has(w) && (i === 0 || /[.!?]\s*$/.test(originalWords[i - 1] || ''))) continue;
    properNounCount++;
  }

  // Bonus: multi-word proper noun sequences (e.g., "New York", "John Smith")
  const multiWordEntities = (originalText.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g) || []).length;

  // Specific data types that indicate entity richness
  const dates = (originalText.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s+\d{4})?|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi) || []).length;
  const currencies = (originalText.match(/\$[\d,]+(?:\.\d+)?|€[\d,]+|£[\d,]+|\b\d+(?:,\d{3})*\s*(?:dollars?|euros?|pounds?)\b/gi) || []).length;
  const percentages = (originalText.match(/\d+(?:\.\d+)?%/g) || []).length;
  const specificNumbers = (originalText.match(/\b\d{2,}\b/g) || []).length;
  const urls = (originalText.match(/https?:\/\/\S+/g) || []).length;

  // Weighted entity score
  const entityScore = properNounCount * 1.0
    + multiWordEntities * 2.0  // Multi-word entities are strong signals
    + dates * 1.5
    + currencies * 1.5
    + percentages * 1.0
    + specificNumbers * 0.5
    + urls * 0.5;

  const density = entityScore / Math.max(wordCount, 1);

  // Calibrated thresholds (more granular than before)
  if (density >= 0.10) return 0;
  if (density >= 0.07) return 10;
  if (density >= 0.05) return 20;
  if (density >= 0.035) return 35;
  if (density >= 0.02) return 50;
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
 * Improved: uses context-aware patterns to reduce false positives.
 * "X is a Y" only counts when X is capitalized or follows a heading/colon.
 * Strong definition patterns (refers to, defined as, known as) always count.
 */
function measureDefinitionStatements(lowerText: string, wordCount: number): number {
  if (wordCount < 100) return 50;

  let score = 0;

  // Strong definition patterns (always reliable, weighted higher)
  const strongPatterns = [
    /\brefers to\b/g, /\bdefined as\b/g, /\bknown as\b/g,
    /\bin other words\b/g, /\bsimply put\b/g,
    /\bthe term\b/g, /\bthe concept of\b/g,
    /\bthe definition of\b/g, /\bcan be described as\b/g,
    /\bis the process of\b/g, /\bis the practice of\b/g,
  ];
  for (const p of strongPatterns) { score += (lowerText.match(p) || []).length * 3; }

  // Medium patterns — "which is/are" (usually definitional in context)
  const mediumPatterns = [
    /\bwhich is\b/g, /\bwhich are\b/g, /\bwhich means\b/g,
    /\bcalled\b/g, /\balso known as\b/g,
  ];
  for (const p of mediumPatterns) { score += (lowerText.match(p) || []).length * 2; }

  // Weak patterns — "is a/are a/is an" only count in definitional contexts
  // Match: "Word is a ..." or "... : X is a ..." (after colon or at sentence start)
  const weakContextual = (lowerText.match(/(?:^|[.!?:]\s+)\w+\s+(?:is|are)\s+(?:a|an|the)\s+\w/gm) || []).length;
  score += weakContextual * 1;

  // Normalize by content length
  const normalizedScore = (score / wordCount) * 500;

  if (normalizedScore >= 12) return 0;
  if (normalizedScore >= 8) return 15;
  if (normalizedScore >= 5) return 30;
  if (normalizedScore >= 2) return 50;
  if (normalizedScore >= 1) return 60;
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
