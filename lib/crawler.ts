import { chromium as playwright, type Browser, type Page } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import * as cheerio from 'cheerio';
import { thinHtml, extractSchema } from './utils/cleaner';
import { summarizeContent, formatSummaryForAI } from './utils/content-summarizer';
import { getCrawlerErrorMessage } from './utils/crawler-errors';
import { detectPlatform, type PlatformResult } from './platform-detector';

const CRAWL_WORKER_URL = process.env.CRAWL_WORKER_URL || '';
const CRAWL_WORKER_SECRET = process.env.CRAWL_WORKER_SECRET || '';

export interface ScanResult {
    url: string;
    title: string;
    description: string;
    thinnedText: string; // Kept for backward compatibility
    summarizedContent: string; // NEW: Optimized content summary
    schemas: any[];
    structuralData: {
        semanticTags: { article: number, main: number, nav: number, aside: number, headers: number, h1Count: number, h2Count: number, h3Count: number };
        links: { internal: number, external: number, socialLinksCount: number };
        media: { totalImages: number, imagesWithAlt: number };
        wordCount: number;
    };
    technical: {
        responseTimeMs: number;
        isHttps: boolean;
        status: number;
    };
    metaChecks: {
        titleLength: number;
        descriptionLength: number;
        hasCanonical: boolean;
        canonicalUrl: string;
        hasViewport: boolean;
        hasOgTitle: boolean;
        hasOgDescription: boolean;
        hasOgImage: boolean;
        hasTwitterCard: boolean;
    };
    platformDetection?: PlatformResult;
    /** Detected if the page returned a bot protection challenge instead of real content */
    botProtection?: { detected: boolean; type: string };
}

/**
 * Core extraction logic — extracts all page data from an already-navigated Playwright Page.
 * Used by both performScan (single page) and deep scan (multi-page).
 */
export async function extractPageDataFromPage(page: Page, targetUrl: string, startTime: number, statusCode: number, options?: { lightweight?: boolean }): Promise<ScanResult> {
    const html = await page.content();
    const title = await page.title();

    let description = '';
    try {
        description = await page.locator('meta[name="description"]').getAttribute('content', { timeout: 2000 }) || '';
    } catch (e) {
        // Description is optional
    }

    const responseTimeMs = Date.now() - startTime;
    const isHttps = targetUrl.startsWith('https://');

    const structuralData = await page.evaluate(() => {
        const currentHostname = window.location.hostname;
        const links = Array.from(document.querySelectorAll('a'));

        let internalLinks = 0;
        let externalLinks = 0;
        let socialLinksCount = 0;
        const socialDomains = ['linkedin.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'github.com', 'youtube.com'];

        links.forEach(link => {
            if (link.href.includes(currentHostname) || link.href.startsWith('/')) {
                internalLinks++;
            } else if (link.href && link.href.startsWith('http')) {
                externalLinks++;
                if (socialDomains.some(domain => link.href.toLowerCase().includes(domain))) {
                    socialLinksCount++;
                }
            }
        });

        const images = Array.from(document.querySelectorAll('img'));
        const imagesWithAlt = images.filter(img => img.hasAttribute('alt') && img.getAttribute('alt')!.trim().length > 0).length;

        const bodyText = document.body.innerText || '';
        const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;

        return {
            semanticTags: {
                article: document.querySelectorAll('article').length,
                main: document.querySelectorAll('main').length,
                nav: document.querySelectorAll('nav').length,
                aside: document.querySelectorAll('aside').length,
                headers: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
                h1Count: document.querySelectorAll('h1').length,
                h2Count: document.querySelectorAll('h2').length,
                h3Count: document.querySelectorAll('h3').length
            },
            links: {
                internal: internalLinks,
                external: externalLinks,
                socialLinksCount: socialLinksCount
            },
            media: {
                totalImages: images.length,
                imagesWithAlt: imagesWithAlt
            },
            wordCount
        };
    });

    const metaChecks = await page.evaluate(() => {
        const canonical = document.querySelector('link[rel="canonical"]');
        const viewport = document.querySelector('meta[name="viewport"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.querySelector('meta[property="twitter:card"]');
        return {
            hasCanonical: !!canonical,
            canonicalUrl: canonical?.getAttribute('href') || '',
            hasViewport: !!viewport,
            hasOgTitle: !!ogTitle && !!(ogTitle as HTMLMetaElement).content,
            hasOgDescription: !!ogDesc && !!(ogDesc as HTMLMetaElement).content,
            hasOgImage: !!ogImage && !!(ogImage as HTMLMetaElement).content,
            hasTwitterCard: !!twitterCard,
        };
    });

    const contentSummary = options?.lightweight ? null : summarizeContent(html);
    const summarizedContent = contentSummary ? formatSummaryForAI(contentSummary) : '';

    // Detect platform/CMS from HTML
    const platformDetection = detectPlatform(html);

    // Detect bot protection / Cloudflare challenges
    const botProtection = detectBotProtection(title, html);

    return {
        url: targetUrl,
        title,
        description,
        thinnedText: thinHtml(html),
        summarizedContent,
        schemas: extractSchema(html),
        structuralData,
        technical: {
            responseTimeMs,
            isHttps,
            status: statusCode
        },
        metaChecks: {
            titleLength: title.length,
            descriptionLength: description.length,
            ...metaChecks
        },
        platformDetection,
        botProtection,
    };
}

/**
 * Detect if the page returned a bot protection challenge instead of real content.
 * Checks for Cloudflare, Sucuri, Akamai, and other common WAF challenge pages.
 */
function detectBotProtection(title: string, html: string): { detected: boolean; type: string } | undefined {
  const t = title.toLowerCase()
  const h = html.toLowerCase()

  // Cloudflare "Just a moment..." / "Attention Required"
  if (
    t.includes('just a moment') ||
    t.includes('attention required') ||
    h.includes('cf-browser-verification') ||
    h.includes('cf_chl_opt') ||
    h.includes('cloudflare-static/rocket-loader') ||
    (h.includes('challenge-platform') && h.includes('cloudflare'))
  ) {
    return { detected: true, type: 'Cloudflare' }
  }

  // Sucuri WAF
  if (h.includes('sucuri-firewall') || t.includes('sucuri website firewall')) {
    return { detected: true, type: 'Sucuri' }
  }

  // Akamai Bot Manager
  if (h.includes('akamai') && (h.includes('bot manager') || h.includes('access denied'))) {
    return { detected: true, type: 'Akamai' }
  }

  // Generic CAPTCHA / access denied
  if (
    (t.includes('access denied') && h.includes('captcha')) ||
    (t === 'robot or human?' || t.includes('are you a robot'))
  ) {
    return { detected: true, type: 'Bot Protection' }
  }

  return undefined
}

/**
 * Scan via the Railway crawl worker (dedicated Playwright service).
 * Used in production to avoid Vercel serverless memory exhaustion.
 */
async function performScanRemote(targetUrl: string, options?: { lightweight?: boolean }): Promise<ScanResult> {
    console.log(`[Crawler] Remote scan via worker: ${targetUrl}`);
    console.log(`[Crawler] Worker URL: ${CRAWL_WORKER_URL}, Secret length: ${CRAWL_WORKER_SECRET.length}`);
    const start = Date.now();

    try {
        const res = await fetch(`${CRAWL_WORKER_URL}/crawl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CRAWL_WORKER_SECRET}`,
            },
            body: JSON.stringify({ url: targetUrl, lightweight: options?.lightweight }),
            signal: AbortSignal.timeout(90_000), // 90s timeout for remote crawl
        });

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            console.error(`[Crawler] Remote failed (${res.status}): ${targetUrl} (${elapsed}s):`, JSON.stringify(body));
            const err = new Error(body.error || 'Remote crawl failed');
            (err as any).technicalMessage = body.technicalMessage;
            (err as any).suggestion = body.suggestion;
            (err as any).category = body.category;
            throw err;
        }

        const { data } = await res.json();
        console.log(`[Crawler] Remote done: ${targetUrl} (${elapsed}s)`);
        return data as ScanResult;
    } catch (fetchError: any) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.error(`[Crawler] Remote fetch error for ${targetUrl} (${elapsed}s):`, fetchError.message, fetchError.cause || '');
        throw fetchError;
    }
}

/**
 * Scan a website using a headless browser to render 
 * JS and extract relevant search/AI intelligence.
 * 
 * Routes to Railway worker in production when CRAWL_WORKER_URL is set.
 * Falls back to local Playwright for development.
 */
export async function performScan(targetUrl: string, options?: { lightweight?: boolean }): Promise<ScanResult> {
    // Use remote worker when configured (production)
    if (CRAWL_WORKER_URL) {
        try {
            return await performScanRemote(targetUrl, options);
        } catch (err: any) {
            const msg = (err.technicalMessage || err.message || '').toLowerCase();
            const isNavigationError = msg.includes('navigating') || msg.includes('navigation') || msg.includes('page.content');
            if (isNavigationError) {
                console.log(`[Crawler] Worker navigation error for ${targetUrl}, falling back to fetch+cheerio`);
                return performScanFetchFallback(targetUrl);
            }
            throw err;
        }
    }

    // Local Playwright fallback (development)
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
    }

    let browser: Browser | null = null;
    const startTime = Date.now();

    try {
        const isLocal = process.env.NODE_ENV === 'development';

        browser = await playwright.launch({
            args: isLocal ? [] : chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: isLocal ? undefined : await chromium.executablePath(),
            headless: isLocal ? true : chromium.headless,
            channel: isLocal ? 'chrome' : undefined,
        });

        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page: Page = await context.newPage();

        console.log(`[Crawler] Navigating to: ${targetUrl}`);
        const response = await page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        if (!response) {
            console.error(`[Crawler] No response object returned for ${targetUrl}`);
            throw new Error(`Failed to retrieve response for ${targetUrl}`);
        }

        console.log(`[Crawler] Successfully loaded ${targetUrl} (Status: ${response.status()})`);

        return await extractPageDataFromPage(page, targetUrl, startTime, response.status(), options);
    } catch (error: any) {
        console.error(`Crawler failed for ${targetUrl}:`, error);
        
        // Get user-friendly error message
        const crawlerError = getCrawlerErrorMessage(error);
        
        // Create enhanced error with user-friendly message
        const enhancedError = new Error(crawlerError.userMessage);
        (enhancedError as any).technicalMessage = crawlerError.technicalMessage;
        (enhancedError as any).suggestion = crawlerError.suggestion;
        (enhancedError as any).category = crawlerError.category;
        (enhancedError as any).originalError = error.message;
        
        throw enhancedError;
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Fetch + Cheerio fallback crawler.
 * Used when the Playwright worker fails due to navigation/redirect issues.
 * No JS rendering — parses raw HTML only.
 */
async function performScanFetchFallback(targetUrl: string): Promise<ScanResult> {
    if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
    const start = Date.now();

    let html = '';
    let finalUrl = targetUrl;
    let statusCode = 0;

    try {
        const res = await fetch(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            redirect: 'follow',
            signal: AbortSignal.timeout(20000),
        });
        html = await res.text();
        finalUrl = res.url;
        statusCode = res.status;
    } catch (err: any) {
        console.error(`[Crawler Fallback] Fetch failed for ${targetUrl}:`, err.message);
        throw new Error(`Could not reach ${targetUrl}`);
    }

    const responseTimeMs = Date.now() - start;
    const isHttps = finalUrl.startsWith('https');

    // Bot protection check
    const h = html.toLowerCase();
    if (h.includes('just a moment') || h.includes('cf-browser-verification') || h.includes('challenge-platform')) {
        return {
            url: finalUrl, title: '', description: '', thinnedText: '', summarizedContent: '',
            schemas: [], structuralData: { semanticTags: { article: 0, main: 0, nav: 0, aside: 0, headers: 0, h1Count: 0, h2Count: 0, h3Count: 0 }, links: { internal: 0, external: 0, socialLinksCount: 0 }, media: { totalImages: 0, imagesWithAlt: 0 }, wordCount: 0 },
            technical: { responseTimeMs, isHttps, status: statusCode },
            metaChecks: { titleLength: 0, descriptionLength: 0, hasCanonical: false, canonicalUrl: '', hasViewport: false, hasOgTitle: false, hasOgDescription: false, hasOgImage: false, hasTwitterCard: false },
            botProtection: { detected: true, type: 'Cloudflare' },
        };
    }

    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('title').first().text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';

    // Structural data
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;

    // Remove non-content elements for text extraction
    $('script, style, svg, iframe, noscript').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 1).length;

    // Thinned text (nav/footer removed)
    const $clean = cheerio.load(html);
    $clean('script, style, svg, iframe, noscript, nav, footer, header').remove();
    const thinnedText = $clean('body').text().replace(/\s\s+/g, ' ').trim();

    // Links
    const domain = new URL(finalUrl).hostname;
    let internal = 0, external = 0, socialLinksCount = 0;
    const socialDomains = ['linkedin.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'youtube.com'];
    const $links = cheerio.load(html);
    $links('a[href]').each((_, el) => {
        const href = $links(el).attr('href') || '';
        if (href.startsWith('/') || href.includes(domain)) internal++;
        else if (href.startsWith('http')) {
            external++;
            if (socialDomains.some(d => href.toLowerCase().includes(d))) socialLinksCount++;
        }
    });

    // Images
    const $imgs = cheerio.load(html);
    const totalImages = $imgs('img').length;
    let imagesWithAlt = 0;
    $imgs('img').each((_, el) => { if ($imgs(el).attr('alt')?.trim()) imagesWithAlt++; });

    // Schema
    const schemas: any[] = [];
    const $schema = cheerio.load(html);
    $schema('script[type="application/ld+json"]').each((_, el) => {
        try {
            const data = JSON.parse($schema(el).html() || '{}');
            if (Array.isArray(data)) schemas.push(...data);
            else if (data['@graph']) schemas.push(...data['@graph']);
            else schemas.push(data);
        } catch {}
    });

    // Platform detection
    const platformResult = detectPlatform(html);

    // Meta checks
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    const hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
    const hasOgDescription = /<meta[^>]*property=["']og:description["']/i.test(html);
    const hasOgImage = /<meta[^>]*property=["']og:image["']/i.test(html);
    const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(html);

    console.log(`[Crawler Fallback] Done: ${finalUrl} (${((Date.now() - start) / 1000).toFixed(1)}s, ${wordCount} words)`);

    return {
        url: finalUrl,
        title,
        description,
        thinnedText,
        summarizedContent: thinnedText.slice(0, 3000),
        schemas,
        structuralData: {
            semanticTags: { article: $('article').length, main: $('main').length, nav: cheerio.load(html)('nav').length, aside: cheerio.load(html)('aside').length, headers: h1Count + h2Count + h3Count, h1Count, h2Count, h3Count },
            links: { internal, external, socialLinksCount },
            media: { totalImages, imagesWithAlt },
            wordCount,
        },
        technical: { responseTimeMs, isHttps, status: statusCode },
        metaChecks: {
            titleLength: title.length,
            descriptionLength: description.length,
            hasCanonical: !!canonicalUrl,
            canonicalUrl,
            hasViewport,
            hasOgTitle,
            hasOgDescription,
            hasOgImage,
            hasTwitterCard,
        },
        platformDetection: platformResult ? { platform: platformResult.platform, label: platformResult.label, confidence: platformResult.confidence } as any : undefined,
    };
}
