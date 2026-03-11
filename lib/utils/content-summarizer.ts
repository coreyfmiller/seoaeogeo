import * as cheerio from 'cheerio';

/**
 * Token-Optimized Content Summarizer
 * 
 * Extracts only the essential content needed for AI analysis,
 * dramatically reducing input tokens while maintaining quality.
 * 
 * Target: Reduce content from ~2000-3000 tokens to ~700-1000 tokens
 * Increased from 300 to 500 words to preserve semantic analysis accuracy
 */

export interface SummarizedContent {
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  mainContent: string; // First 500 words of main content (increased for semantic analysis)
  lists: string[]; // Key bullet points/lists (max 10 items)
  emphasis: string[]; // Bold/strong text (key points)
  metaKeywords: string[]; // If present
  paragraphs: string[]; // First 3 full paragraphs for tone/style analysis
}

/**
 * Summarize HTML content for AI analysis
 * Extracts structure and key content without bloat
 */
export function summarizeContent(html: string): SummarizedContent {
  const $ = cheerio.load(html);

  // Remove noise
  $('script, style, svg, iframe, nav, footer, noscript, link, head, header, aside').remove();

  // Extract headings (structure is important for SEO/AEO)
  const h1 = $('h1').map((_, el) => $(el).text().trim()).get().slice(0, 3);
  const h2 = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 5);
  const h3 = $('h3').map((_, el) => $(el).text().trim()).get().slice(0, 5);

  // Extract main content area (prioritize semantic tags)
  let mainText = '';
  const mainElement = $('main, article, [role="main"]').first();
  
  if (mainElement.length > 0) {
    mainText = mainElement.text();
  } else {
    // Fallback to body
    mainText = $('body').text();
  }

  // Clean and limit to first 500 words (increased from 300 for better semantic analysis)
  const words = mainText
    .replace(/\s\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, 500); // Increased to capture more tone/style signals
  
  const mainContent = words.join(' ');

  // Extract lists (often contain key information)
  const lists: string[] = [];
  $('ul li, ol li').each((i, el) => {
    if (i < 10) { // Limit to 10 items
      const text = $(el).text().trim();
      if (text.length > 10 && text.length < 150) {
        lists.push(text);
      }
    }
  });

  // Extract emphasized text (strong, b, em) - often key points
  const emphasis: string[] = [];
  $('strong, b, em').each((i, el) => {
    if (i < 15) { // Limit to 15 items
      const text = $(el).text().trim();
      if (text.length > 5 && text.length < 100) {
        emphasis.push(text);
      }
    }
  });

  // Extract meta keywords if present
  const metaKeywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];

  // Extract first 3 paragraphs for tone/style analysis (important for GEO scoring)
  const paragraphs: string[] = [];
  $('p').each((i, el) => {
    if (i < 3) {
      const text = $(el).text().trim();
      if (text.length > 50) { // Only substantial paragraphs
        paragraphs.push(text);
      }
    }
  });

  return {
    headings: { h1, h2, h3 },
    mainContent,
    lists: lists.slice(0, 10),
    emphasis: emphasis.slice(0, 15),
    metaKeywords: metaKeywords.slice(0, 10),
    paragraphs: paragraphs.slice(0, 3)
  };
}

/**
 * Convert summarized content to compact string for AI prompt
 * Optimized format that's easy for AI to parse
 */
export function formatSummaryForAI(summary: SummarizedContent): string {
  const parts: string[] = [];

  // Headings (structure)
  if (summary.headings.h1.length > 0) {
    parts.push(`H1: ${summary.headings.h1.join(' | ')}`);
  }
  if (summary.headings.h2.length > 0) {
    parts.push(`H2: ${summary.headings.h2.join(' | ')}`);
  }
  if (summary.headings.h3.length > 0) {
    parts.push(`H3: ${summary.headings.h3.join(' | ')}`);
  }

  // Main content (first 500 words)
  parts.push(`\nCONTENT: ${summary.mainContent}`);

  // Sample paragraphs for tone analysis
  if (summary.paragraphs && summary.paragraphs.length > 0) {
    parts.push(`\nSAMPLE PARAGRAPHS (for tone/style analysis):\n${summary.paragraphs.join('\n\n')}`);
  }

  // Key points from lists
  if (summary.lists.length > 0) {
    parts.push(`\nKEY POINTS:\n- ${summary.lists.join('\n- ')}`);
  }

  // Emphasized content
  if (summary.emphasis.length > 0) {
    parts.push(`\nEMPHASIS: ${summary.emphasis.join(' • ')}`);
  }

  // Keywords
  if (summary.metaKeywords.length > 0) {
    parts.push(`\nKEYWORDS: ${summary.metaKeywords.join(', ')}`);
  }

  return parts.join('\n');
}
