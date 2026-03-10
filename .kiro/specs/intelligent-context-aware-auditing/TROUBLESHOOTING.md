# Troubleshooting Guide

## Common Issues and Solutions

### Crawling Issues

#### Issue: Crawl times out before completing
**Symptoms:**
- "Crawl timeout exceeded" error
- Partial results returned
- Progress stops at certain page

**Solutions:**
1. Reduce `maxPages` count
2. Check target site's response times
3. Verify network connectivity
4. Check if site is blocking crawlers

```typescript
// Increase timeout for slow sites
const result = await crawlMultiplePages({
  url: 'https://slow-site.com',
  maxPages: 10,
  timeout: 120000 // 2 minutes instead of 1
});
```

#### Issue: "Blocked by robots.txt"
**Symptoms:**
- Crawl fails immediately
- Error mentions robots.txt

**Solutions:**
1. Set `respectRobotsTxt: false` (use responsibly)
2. Check robots.txt file manually
3. Contact site owner for permission

```typescript
const result = await crawlMultiplePages({
  url: 'https://example.com',
  maxPages: 20,
  respectRobotsTxt: false // Override robots.txt
});
```

#### Issue: High failure rate on pages
**Symptoms:**
- Many pages fail to crawl
- `crawlStats.failedPages` is high

**Solutions:**
1. Check if site requires authentication
2. Verify site is publicly accessible
3. Check for JavaScript-heavy pages
4. Reduce parallel batch size

```typescript
// In multi-page-crawler.ts, reduce batch size
const BATCH_SIZE = 2; // Instead of 3
```

---

### Site Type Detection Issues

#### Issue: Wrong site type detected
**Symptoms:**
- Confidence is high but type is incorrect
- Recommended schemas don't match site

**Solutions:**
1. Check if site has misleading schema markup
2. Manually override site type
3. Provide feedback to improve detection

```typescript
// Manual override in UI
<SiteTypeBadge
  siteType={result}
  onManualSelect={(type) => {
    // Override detected type
    setSiteType(type);
  }}
/>
```

#### Issue: Low confidence score
**Symptoms:**
- Confidence < 40%
- Multiple possible types

**Solutions:**
1. This is expected for ambiguous sites
2. Use manual selection UI
3. Add more schema markup to site

**Best Practice:**
- Low confidence triggers manual selection UI
- Don't auto-apply recommendations with low confidence

---

### Performance Issues

#### Issue: Crawl is very slow
**Symptoms:**
- Takes >3 minutes for 20 pages
- Progress updates are infrequent

**Solutions:**
1. Check target site's response times
2. Verify network speed
3. Check if running in development mode
4. Optimize parallel processing

```typescript
// Profile crawl performance
console.time('crawl');
const result = await crawlMultiplePages(config);
console.timeEnd('crawl');

// Check individual page times
result.pages.forEach(page => {
  if (page.responseTimeMs > 5000) {
    console.warn(`Slow page: ${page.url} (${page.responseTimeMs}ms)`);
  }
});
```

#### Issue: High memory usage
**Symptoms:**
- Memory grows during crawl
- Browser crashes or freezes

**Solutions:**
1. Reduce `maxPages` count
2. Clear cache periodically
3. Implement streaming for large sites

```typescript
// Clear cache after crawl
const cache = PageCache.getInstance();
cache.cleanup(); // Remove expired entries
// or
cache.clear(); // Remove all entries
```

---

### API Issues

#### Issue: Gemini API rate limit errors
**Symptoms:**
- "Rate limit exceeded" errors
- 429 HTTP status codes

**Solutions:**
1. Implement exponential backoff (already built-in)
2. Reduce concurrent requests
3. Check API quota limits
4. Use caching to reduce API calls

```typescript
// Exponential backoff is automatic, but you can adjust
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

async function callWithRetry(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const delay = INITIAL_DELAY * Math.pow(2, MAX_RETRIES - retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1);
    }
    throw error;
  }
}
```

#### Issue: Gemini API returns empty/invalid responses
**Symptoms:**
- Missing recommendations
- Incomplete analysis

**Solutions:**
1. Check API key is valid
2. Verify input data is complete
3. Check API response format
4. Implement fallback logic

```typescript
// Fallback to deterministic analysis
if (!geminiResponse || !geminiResponse.recommendations) {
  console.warn('Gemini API failed, using fallback');
  return generateDeterministicRecommendations(pageData);
}
```

---

### Schema Validation Issues

#### Issue: Valid schema marked as invalid
**Symptoms:**
- Schema passes Google's validator but fails ours
- False positive errors

**Solutions:**
1. Check schema version compatibility
2. Verify required properties list
3. Update validation rules

```typescript
// Debug validation
const result = validateSchema(schema);
console.log('Validation result:', result);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

#### Issue: Generated schema code doesn't work
**Symptoms:**
- Schema doesn't appear in Google's test tool
- Syntax errors in generated code

**Solutions:**
1. Verify platform detection is correct
2. Check for special characters in data
3. Validate JSON structure

```typescript
// Test generated schema
const code = generateSchemaCode('LocalBusiness', pageData, 'html');
try {
  JSON.parse(code.match(/<script[^>]*>(.*?)<\/script>/s)[1]);
  console.log('Valid JSON');
} catch (e) {
  console.error('Invalid JSON:', e);
}
```

---

### Cache Issues

#### Issue: Stale data being returned
**Symptoms:**
- Old results shown after site changes
- Cache hit rate too high

**Solutions:**
1. Reduce TTL
2. Clear cache manually
3. Implement cache invalidation

```typescript
// Force fresh crawl
const cache = PageCache.getInstance();
cache.delete(url); // Remove specific URL
// or
cache.clear(); // Clear all

const result = await crawlMultiplePages({ url, maxPages: 20 });
```

#### Issue: Cache not working
**Symptoms:**
- Every request crawls from scratch
- Cache stats show size: 0

**Solutions:**
1. Check cache is initialized
2. Verify URL normalization
3. Check TTL isn't too short

```typescript
// Debug cache
const cache = PageCache.getInstance();
console.log('Cache stats:', cache.getStats());

// Test cache
cache.set('https://example.com', testData);
console.log('Has entry:', cache.has('https://example.com'));
console.log('Get entry:', cache.get('https://example.com'));
```

---

### UI Component Issues

#### Issue: Components not rendering
**Symptoms:**
- Blank sections in UI
- Console errors about props

**Solutions:**
1. Check data structure matches prop types
2. Verify conditional rendering logic
3. Check for null/undefined data

```typescript
// Safe rendering with fallbacks
{analysisData?.siteType && (
  <SiteTypeBadge
    siteType={{
      primaryType: analysisData.siteType.type || 'general',
      confidence: analysisData.siteType.confidence * 100 || 0
    }}
  />
)}
```

#### Issue: Progress indicator not updating
**Symptoms:**
- Progress stuck at 0%
- No stage changes

**Solutions:**
1. Verify progress callbacks are called
2. Check state updates
3. Ensure crawl is actually running

```typescript
// Debug progress
const [progress, setProgress] = useState({ current: 0, total: 0 });

await crawlMultiplePages({
  url,
  maxPages: 20,
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`);
    setProgress({ current, total });
  }
});
```

---

### Data Quality Issues

#### Issue: Inaccurate recommendations
**Symptoms:**
- Recommendations don't match site needs
- Priority scores seem wrong

**Solutions:**
1. Verify site type detection is correct
2. Check input data completeness
3. Review priority scoring weights

```typescript
// Debug priority scoring
const prioritized = calculatePriority(recommendations, siteType);
prioritized.forEach(rec => {
  console.log(`${rec.title}: Impact=${rec.impact}, Effort=${rec.effort}, ROI=${rec.roi}`);
});
```

#### Issue: Missing competitor gaps
**Symptoms:**
- No gaps found despite obvious differences
- Empty gap analysis

**Solutions:**
1. Verify competitor URLs are accessible
2. Check competitor crawl succeeded
3. Review gap detection thresholds

```typescript
// Debug gap analysis
const gaps = await analyzeCompetitorGaps(yourSite, competitors);
console.log('Schema gaps:', gaps.schemaGaps);
console.log('Content gaps:', gaps.contentGaps);
console.log('Structural gaps:', gaps.structuralGaps);
```

---

## Error Messages Reference

### TIMEOUT_ERROR
**Message:** "Crawl timeout exceeded"
**Cause:** Crawl took longer than allowed time
**Fix:** Reduce page count or increase timeout

### NETWORK_ERROR
**Message:** "Failed to connect to site"
**Cause:** Network connectivity issues
**Fix:** Check internet connection and site availability

### RATE_LIMIT_ERROR
**Message:** "API rate limit exceeded"
**Cause:** Too many API requests
**Fix:** Wait and retry, or reduce request frequency

### VALIDATION_ERROR
**Message:** "Invalid input parameters"
**Cause:** Missing or malformed input
**Fix:** Check required parameters and types

### ROBOTS_BLOCKED
**Message:** "Crawling blocked by robots.txt"
**Cause:** Site's robots.txt disallows crawling
**Fix:** Respect robots.txt or get permission

### PARSE_ERROR
**Message:** "Failed to parse page content"
**Cause:** Malformed HTML or encoding issues
**Fix:** Check page source and encoding

---

## Debugging Tips

### Enable Verbose Logging

```typescript
// In multi-page-crawler.ts
const DEBUG = true;

if (DEBUG) {
  console.log('[Crawler] Starting crawl:', config);
  console.log('[Crawler] Discovered links:', links);
  console.log('[Crawler] Prioritized pages:', prioritized);
}
```

### Inspect Crawl Results

```typescript
// After crawl completes
console.log('Crawl stats:', result.crawlStats);
console.log('Pages crawled:', result.pages.length);
console.log('Failed pages:', result.crawlStats.failedPages);
console.log('Orphan pages:', result.orphanPages);
console.log('Duplicate groups:', result.duplicateContent);
```

### Test Individual Components

```typescript
// Test site type detection
const siteType = detectSiteType(testPageData);
console.log('Detected type:', siteType);

// Test fix generation
const fix = generateFix(testIssue, testPageData);
console.log('Generated fix:', fix);

// Test priority scoring
const prioritized = calculatePriority([testRec]);
console.log('Priority:', prioritized[0]);
```

### Monitor Performance

```typescript
// Track crawl performance
const startTime = Date.now();
const result = await crawlMultiplePages(config);
const duration = Date.now() - startTime;

console.log(`Crawled ${result.pages.length} pages in ${duration}ms`);
console.log(`Average: ${duration / result.pages.length}ms per page`);
```

---

## Getting Help

If you encounter issues not covered here:

1. Check the API documentation for correct usage
2. Review the design document for expected behavior
3. Check GitHub issues for similar problems
4. Enable debug logging and inspect output
5. Create a minimal reproduction case
6. Report the issue with:
   - Error message
   - Input parameters
   - Expected vs actual behavior
   - Debug logs

---

## Performance Benchmarks

Expected performance targets:

- **10 pages**: < 60 seconds
- **20 pages**: < 90 seconds
- **50 pages**: < 180 seconds

If your crawls exceed these times:
1. Check target site response times
2. Verify network speed
3. Review parallel processing settings
4. Consider caching strategy

---

## Best Practices

1. **Always handle errors gracefully**
   - Use try-catch blocks
   - Provide fallback values
   - Show user-friendly messages

2. **Implement caching strategically**
   - Cache expensive operations
   - Set appropriate TTLs
   - Clean up expired entries

3. **Respect rate limits**
   - Use exponential backoff
   - Batch requests when possible
   - Monitor API usage

4. **Validate input data**
   - Check required fields
   - Sanitize user input
   - Provide clear error messages

5. **Monitor performance**
   - Track crawl times
   - Log slow operations
   - Optimize bottlenecks

6. **Test with real data**
   - Use diverse site types
   - Test edge cases
   - Verify recommendations quality
