import { chromium, Browser, Page } from 'playwright';
import { thinHtml, extractSchema } from './utils/cleaner';

interface PageScan {
    url: string;
    title: string;
    description: string;
    schemas: any[];
    thinnedText: string;
    status: 'success' | 'failed';
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
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SearchIQ-Bot/1.0'
        });

        // 1. DISCOVERY PHASE
        const page = await context.newPage();
        console.log(`[Deep Crawler] Discovering links on: ${baseUrl}`);
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const homeData = await extractPageData(page);
        results.push(homeData);
        visited.add(baseUrl);

        // Extract internal links
        const rawLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => (a as HTMLAnchorElement).href)
                .filter(href => href.startsWith(window.location.origin) || href.startsWith('/'));
        });

        // Clean and queue links
        for (let link of rawLinks) {
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
        console.log(`[Deep Crawler] Queue established: ${targetLinks.length} internal pages found.`);

        // Process in chunks of 3 to avoid overloading
        const chunkSize = 3;
        for (let i = 0; i < targetLinks.length; i += chunkSize) {
            const chunk = targetLinks.slice(i, i + chunkSize);
            console.log(`[Deep Crawler] Processing chunk: ${i / chunkSize + 1}`);

            const chunkResults = await Promise.all(chunk.map(async (url) => {
                if (visited.has(url)) return null;
                visited.add(url);

                const p = await context.newPage();
                try {
                    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
                    const data = await extractPageData(p);
                    await p.close();
                    return data;
                } catch (err) {
                    console.error(`[Deep Crawler] Failed to crawl ${url}:`, err);
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

async function extractPageData(page: Page): Promise<PageScan> {
    const url = page.url();
    const title = await page.title();

    let description = '';
    try {
        description = await page.$eval('meta[name="description"]', el => el.getAttribute('content') || '') || "";
    } catch (e) { }

    const html = await page.content();

    return {
        url,
        title,
        description,
        schemas: extractSchema(html),
        thinnedText: thinHtml(html).substring(0, 3000), // Only need first 3k tokens for sitewide analysis
        status: 'success'
    };
}
