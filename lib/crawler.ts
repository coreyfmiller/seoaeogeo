import { chromium, type Browser, type Page } from 'playwright';
import { thinHtml, extractSchema } from './utils/cleaner';

export interface ScanResult {
    url: string;
    title: string;
    description: string;
    thinnedText: string;
    schemas: any[];
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

        // 1. Visit URL
        const response = await page.goto(targetUrl, {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        if (!response) {
            throw new Error(`Failed to retrieve response for ${targetUrl}`);
        }

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

        return {
            url: targetUrl,
            title,
            description,
            thinnedText: thinHtml(html),
            schemas: extractSchema(html),
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
