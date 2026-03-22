import { chromium as playwright, type Browser, type Page } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { thinHtml, extractSchema } from './utils/cleaner';
import { summarizeContent, formatSummaryForAI } from './utils/content-summarizer';

export interface PageScan {
    url: string;
    title: string;
    description: string;
    schemas: any[];
    schemaTypes: string[];
    thinnedText: string;
    summarizedContent: string;
    status: 'success' | 'failed';
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    hasH1: boolean;
    isHttps: boolean;
    responseTimeMs: number;
    h2Count: number;
    h3Count: number;
    imgTotal: number;
    imgWithAlt: number;
    outboundLinks: string[]; // Actual internal URLs found on this page
    // Fields matching Pro Audit's ScanResult shape for grader parity
    semanticTags: { article: number; main: number; nav: number; aside: number; headers: number; h1Count: number; h2Count: number; h3Count: number };
    socialLinksCount: number;
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

interface DeepSiteScanResult {
    domain: string;
    pagesCrawled: number;
    pages: PageScan[];
    sitemapFound: boolean;
}

/**
 * Deep Multi-Page Crawler:
 * 1. Discover internal links from homepage.
 * 2. Parallel crawl up to maxPages.
 * 3. Extract core metadata and thin content for aggregate analysis.
 */
export async function performDeepScan(baseUrl: string, maxPages: number = 10): Promise<DeepSiteScanResult> {
    let browser: Browser | null = null;
    const visited = new Set<string>();
    const queue: string[] = [];
    const results: PageScan[] = [];

    // Protocol enforcement
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    let domain: string;
    try {
        domain = new URL(baseUrl).hostname;
    } catch (e) {
        throw new Error("Invalid URL provided");
    }

    try {
        const isLocal = process.env.NODE_ENV === 'development';

        browser = await playwright.launch({
            args: isLocal ? [] : chromium.args,
            executablePath: isLocal ? undefined : await chromium.executablePath(),
            headless: true,
            channel: isLocal ? 'chrome' : undefined,
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Duelly-Bot/1.0'
        });

        // 1. DISCOVERY PHASE
        const page = await context.newPage();
        console.log(`[Deep Crawler] Discovering links on: ${baseUrl}`);
        const t0 = Date.now();
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const homeData = await extractPageData(page, domain, Date.now() - t0);
        results.push(homeData);
        visited.add(baseUrl);

        // Extract internal links for queue
        const rawLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => (a as HTMLAnchorElement).href)
                .filter(href => href.startsWith(window.location.origin) || href.startsWith('/'));
        });

        // Clean and queue links
        for (const link of rawLinks) {
            try {
                const fullLink = new URL(link, baseUrl).href.split('#')[0].replace(/\/$/, "");
                if (
                    fullLink.includes(domain) &&
                    !visited.has(fullLink) &&
                    !fullLink.match(/\.(jpg|jpeg|png|gif|pdf|zip|css|js)$/i)
                ) {
                    queue.push(fullLink);
                }
            } catch (e) { }
        }
        await page.close();

        // 2. CRAWLING PHASE (Parallel Chunking)
        const targetLinks = [...new Set(queue)].slice(0, maxPages - 1);
        console.log(`[Deep Crawler] Queue: ${targetLinks.length} internal pages found.`);

        const chunkSize = 3;
        for (let i = 0; i < targetLinks.length; i += chunkSize) {
            const chunk = targetLinks.slice(i, i + chunkSize);
            console.log(`[Deep Crawler] Processing chunk ${i / chunkSize + 1}`);

            const chunkResults = await Promise.all(chunk.map(async (url) => {
                if (visited.has(url)) return null;
                visited.add(url);

                const p = await context.newPage();
                try {
                    const start = Date.now();
                    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
                    const data = await extractPageData(p, domain, Date.now() - start);
                    await p.close();
                    return data;
                } catch (err) {
                    console.error(`[Deep Crawler] Failed: ${url}`);
                    await p.close();
                    return null;
                }
            }));

            chunkResults.forEach(r => { if (r) results.push(r); });
        }

        return {
            domain,
            pagesCrawled: results.length,
            pages: results,
            sitemapFound: false
        };

    } catch (error) {
        console.error('[Deep Crawler] Error:', error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

async function extractPageData(page: Page, domain: string, responseTimeMs: number): Promise<PageScan> {
    const url = page.url();
    const title = await page.title();

    let description = '';
    try {
        description = await page.$eval('meta[name="description"]', (el: Element) => el.getAttribute('content') || '') || "";
    } catch (e) { }

    const html = await page.content();
    const schemas = extractSchema(html);
    const schemaTypes: string[] = schemas.map((s: any) => s['@type'] || 'Unknown').filter(Boolean);

    // Extract structural signals in-browser
    const pageSignals = await page.evaluate((domainStr: string) => {
        const bodyText = (document.body as HTMLElement)?.innerText || '';
        const words = bodyText.trim().split(/\s+/).filter((w: string) => w.length > 0);
        const allLinks = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        const internalLinks = allLinks.filter(a => a.href.includes(domainStr) || a.href.startsWith('/')).length;
        const externalLinks = allLinks.filter(a => a.href.startsWith('http') && !a.href.includes(domainStr)).length;
        const hasH1 = !!document.querySelector('h1');
        const h2Count = document.querySelectorAll('h2').length;
        const h3Count = document.querySelectorAll('h3').length;
        const allImgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
        const imgTotal = allImgs.length;
        const imgWithAlt = allImgs.filter(img => img.alt && img.alt.trim().length > 0).length;

        // Semantic tags (matching Pro Audit crawler)
        const semanticTags = {
            article: document.querySelectorAll('article').length,
            main: document.querySelectorAll('main').length,
            nav: document.querySelectorAll('nav').length,
            aside: document.querySelectorAll('aside').length,
            headers: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
            h1Count: document.querySelectorAll('h1').length,
            h2Count: document.querySelectorAll('h2').length,
            h3Count: document.querySelectorAll('h3').length,
        };

        // Social links count
        const socialDomains = ['linkedin.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'github.com', 'youtube.com'];
        const socialLinksCount = allLinks.filter(a => a.href.startsWith('http') && !a.href.includes(domainStr) && socialDomains.some(d => a.href.toLowerCase().includes(d))).length;

        // Meta checks (matching Pro Audit crawler)
        const canonical = document.querySelector('link[rel="canonical"]');
        const viewport = document.querySelector('meta[name="viewport"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.querySelector('meta[property="twitter:card"]');
        const metaChecks = {
            hasCanonical: !!canonical,
            canonicalUrl: canonical?.getAttribute('href') || '',
            hasViewport: !!viewport,
            hasOgTitle: !!ogTitle && !!(ogTitle as HTMLMetaElement).content,
            hasOgDescription: !!ogDesc && !!(ogDesc as HTMLMetaElement).content,
            hasOgImage: !!ogImage && !!(ogImage as HTMLMetaElement).content,
            hasTwitterCard: !!twitterCard,
        };

        // NEW: Get actual internal URLs for mapping
        const internalUrls = Array.from(new Set(
            allLinks
                .map(a => a.href.split('#')[0].replace(/\/$/, ""))
                .filter(href => href.includes(domainStr) && !href.match(/\.(jpg|jpeg|png|gif|pdf|zip|css|js)$/i))
        ));

        return { wordCount: words.length, internalLinks, externalLinks, hasH1, h2Count, h3Count, imgTotal, imgWithAlt, internalUrls, semanticTags, socialLinksCount, metaChecks };
    }, domain);

    // Generate summarized content (matching Pro Audit's content-summarizer pipeline)
    const contentSummary = summarizeContent(html);
    const summarizedContent = formatSummaryForAI(contentSummary);

    return {
        url,
        title,
        description,
        schemas,
        schemaTypes,
        thinnedText: thinHtml(html),
        summarizedContent,
        status: 'success',
        wordCount: pageSignals.wordCount,
        internalLinks: pageSignals.internalLinks,
        externalLinks: pageSignals.externalLinks,
        hasH1: pageSignals.hasH1,
        h2Count: pageSignals.h2Count,
        h3Count: pageSignals.h3Count,
        imgTotal: pageSignals.imgTotal,
        imgWithAlt: pageSignals.imgWithAlt,
        outboundLinks: pageSignals.internalUrls,
        isHttps: url.startsWith('https://'),
        responseTimeMs,
        semanticTags: pageSignals.semanticTags,
        socialLinksCount: pageSignals.socialLinksCount,
        metaChecks: {
            titleLength: title.length,
            descriptionLength: description.length,
            ...pageSignals.metaChecks,
        },
    };
}
