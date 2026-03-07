import * as cheerio from 'cheerio';

/**
 * Data Thinning Utility:
 * Strips out excessive HTML boilerplate to reduce 
 * token counts before sending to Gemini.
 */
export function thinHtml(html: string): string {
  const $ = cheerio.load(html);

  // 1. Remove non-content tags
  $('script, style, svg, iframe, nav, footer, noscript, link, head').remove();

  // 2. Clear inline attributes (style, onclick, etc.) except for 'href' or 'src'
  $('*').each((_, el) => {
    const attributes = $(el).attr();
    if (attributes) {
      Object.keys(attributes).forEach((attr) => {
        if (!['href', 'src', 'alt', 'id', 'class'].includes(attr)) {
          $(el).removeAttr(attr);
        }
      });
    }
  });

  // 3. Return cleaned text or a more compressed HTML
  // Returning text-only is usually best for LLMs unless structure matters for AEO.
  return $('body').text().replace(/\s\s+/g, ' ').trim();
}

/**
 * Extract structured data (JSON-LD)
 */
export function extractSchema(html: string): any[] {
  const $ = cheerio.load(html);
  const schemas: any[] = [];
  
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      schemas.push(data);
    } catch (e) {
      // Ignore invalid JSON
    }
  });

  return schemas;
}
