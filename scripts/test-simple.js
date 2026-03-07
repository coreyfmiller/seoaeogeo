const { chromium } = require('playwright');

async function testCrawler() {
  const url = 'https://www.google.com';
  console.log(' Starting scan for: ' + url);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    console.log(' Success! Page Title: ' + title);
  } catch (error) {
    console.error(' Failed:', error);
  } finally {
    if (browser) await browser.close();
  }
}
testCrawler();
