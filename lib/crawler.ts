import { chromium, type Browser, type Page } from 'playwright';
import { thinHtml, extractSchema } from './utils/cleaner';

export interface ScanResult {
    url: string;
    title: string;
    description: string;
    thinnedText: string;
    schemas: any[];
    structuralData: {
        semanticTags: { article: number, main: number, nav: number, aside: number, headers: number };
        links: { internal: number, external: number };
        media: { totalImages: number, imagesWithAlt: number };
        wordCount: number;
    };
    technical: {
        responseTimeMs: number;
        isHttps: boolean;
        status: number;
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
        browser = await chromium.launch({ headless: true });
        const page: Page = await browser.newPage();

        console.log(`[Crawler] Navigating to: ${targetUrl}`);
        // 1. Visit URL (domcontentloaded is faster and less prone to hanging than networkidle)
        const response = await page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        if (!response) {
            console.error(`[Crawler] No response object returned for ${targetUrl}`);
            throw new Error(`Failed to retrieve response for ${targetUrl}`);
        }

        console.log(`[Crawler] Successfully loaded ${targetUrl} (Status: ${response.status()})`);

        const html = await page.content();
        const title = await page.title();

        let description = '';
        try {
            description = await page.locator('meta[name="description"]').getAttribute('content', { timeout: 2000 }) || '';
        } catch (e) {
            // Description is optional
        }

        // 3. Technical Metrics
        const responseTimeMs = Date.now() - startTime;
        const isHttps = targetUrl.startsWith('https://');

        // 4. Extract Deep Semantic Structure
        const structuralData = await page.evaluate(() => {
            const currentHostname = window.location.hostname;
            const links = Array.from(document.querySelectorAll('a'));

            let internalLinks = 0;
            let externalLinks = 0;

            links.forEach(link => {
                if (link.href.includes(currentHostname) || link.href.startsWith('/')) {
                    internalLinks++;
                } else if (link.href && link.href.startsWith('http')) {
                    externalLinks++;
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
                    headers: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
                },
                links: {
                    internal: internalLinks,
                    external: externalLinks
                },
                media: {
                    totalImages: images.length,
                    imagesWithAlt: imagesWithAlt
                },
                wordCount
            };
        });


        return {
            url: targetUrl,
            title,
            description,
            thinnedText: thinHtml(html),
            schemas: extractSchema(html),
            structuralData,
            technical: {
                responseTimeMs,
                isHttps,
                status: response.status()
            }
        };
    } catch (error: any) {
        console.error(`Crawler failed for ${targetUrl}:`, error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}
