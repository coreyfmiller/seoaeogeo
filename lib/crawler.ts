import { chromium as playwright, type Browser, type Page } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { thinHtml, extractSchema } from './utils/cleaner';
import { summarizeContent, formatSummaryForAI } from './utils/content-summarizer';
import { getCrawlerErrorMessage } from './utils/crawler-errors';

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
}

/**
 * Core extraction logic — extracts all page data from an already-navigated Playwright Page.
 * Used by both performScan (single page) and deep scan (multi-page).
 */
export async function extractPageDataFromPage(page: Page, targetUrl: string, startTime: number, statusCode: number): Promise<ScanResult> {
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

    const contentSummary = summarizeContent(html);
    const summarizedContent = formatSummaryForAI(contentSummary);

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
        }
    };
}

/**
 * Scan a website using a headless browser to render 
 * JS and extract relevant search/AI intelligence.
 */
export async function performScan(targetUrl: string): Promise<ScanResult> {
    // 0. Sanitize URL (ensure protocol)
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

        const page: Page = await browser.newPage();

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

        return await extractPageDataFromPage(page, targetUrl, startTime, response.status());
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
