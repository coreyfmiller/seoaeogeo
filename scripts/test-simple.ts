import { performScan } from './lib/crawler';

async function testCrawler() {
  const url = 'https://example.com';
  console.log(' Starting test scan for: ' + url);
  try {
    const result = await performScan(url);
    console.log(' Scan Successful!');
    console.log('Title: ' + result.title);
  } catch (error) {
    console.error(' Scan Failed:', error);
  }
}
testCrawler();
