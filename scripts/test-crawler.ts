import { performScan } from './lib/crawler';

async function testCrawler() {
    const url = 'https://example.com';
    console.log(`🚀 Starting test scan for: ${url}`);

    try {
        const result = await performScan(url);
        console.log('✅ Scan Successful!');
        console.log('--- Results ---');
        console.log('Title:', result.title);
        console.log('Response Time:', result.technical.responseTimeMs, 'ms');
        console.log('Text Length:', result.thinnedText.length, 'chars');
        console.log('Schemas Found:', result.schemas.length);
        console.log('---------------');
    } catch (error) {
        console.error('❌ Scan Failed:', error);
    }
}

testCrawler();
