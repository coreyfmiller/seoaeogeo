/**
 * System Validation Script
 * Tests core functionality to ensure production readiness
 */

import { detectSiteType } from '../lib/site-type-detector';
import { PageCache } from '../lib/page-cache';
import { validateSchema } from '../lib/schema-validator';
import { calculatePriority } from '../lib/priority-scorer';

console.log('🔍 Starting System Validation...\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => boolean | Promise<boolean>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(r => {
        if (r) {
          console.log(`✅ ${name}`);
          passed++;
        } else {
          console.log(`❌ ${name}`);
          failed++;
        }
      });
    } else {
      if (result) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.log(`❌ ${name}`);
        failed++;
      }
    }
  } catch (error: any) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Test 1: Site Type Detection
test('Site Type Detection - E-commerce', () => {
  const result = detectSiteType({
    schemas: [{ '@type': 'Product' }],
    content: 'Buy now add to cart checkout',
    structure: { hasProductPages: true },
    url: 'https://shop.example.com'
  });
  return result.primaryType === 'e-commerce' && result.confidence > 40;
});

// Test 2: Site Type Detection - Local Business
test('Site Type Detection - Local Business', () => {
  const result = detectSiteType({
    schemas: [{ '@type': 'LocalBusiness' }],
    content: 'Visit our location open hours',
    structure: { hasContactPage: true },
    url: 'https://business.example.com'
  });
  return result.primaryType === 'local-business' && result.confidence > 40;
});

// Test 3: Page Cache
test('Page Cache - Set and Get', () => {
  const cache = PageCache.getInstance();
  const testData = {
    url: 'https://test.com',
    title: 'Test',
    description: 'Test',
    schemas: [],
    seoScore: 85,
    aeoScore: 75,
    geoScore: 80
  };
  
  cache.set('https://test.com', testData);
  const retrieved = cache.get('https://test.com');
  
  return retrieved !== null && retrieved.url === testData.url;
});

// Test 4: Page Cache - URL Normalization
test('Page Cache - URL Normalization', () => {
  const cache = PageCache.getInstance();
  const testData = {
    url: 'https://test.com',
    title: 'Test',
    description: 'Test',
    schemas: [],
    seoScore: 85,
    aeoScore: 75,
    geoScore: 80
  };
  
  cache.set('https://test.com/', testData);
  const retrieved = cache.get('https://test.com'); // No trailing slash
  
  return retrieved !== null;
});

// Test 5: Schema Validation - Valid Schema
test('Schema Validation - Valid LocalBusiness', () => {
  const schema = {
    '@type': 'LocalBusiness',
    'name': 'Test Business',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '123 Main St',
      'addressLocality': 'City',
      'addressRegion': 'State',
      'postalCode': '12345'
    }
  };
  
  const result = validateSchema(schema);
  return result.isValid && result.score > 50;
});

// Test 6: Schema Validation - Invalid Schema
test('Schema Validation - Detects Missing Required', () => {
  const schema = {
    '@type': 'LocalBusiness',
    'name': 'Test Business'
    // Missing address
  };
  
  const result = validateSchema(schema);
  return !result.isValid && result.missingRequired.length > 0;
});

// Test 7: Priority Scoring
test('Priority Scoring - ROI Calculation', () => {
  const recommendations = [
    {
      id: '1',
      title: 'Quick Win',
      description: 'Easy fix',
      type: 'schema',
      impact: 8,
      effort: 2
    },
    {
      id: '2',
      title: 'High Effort',
      description: 'Hard fix',
      type: 'content',
      impact: 5,
      effort: 9
    }
  ];
  
  const prioritized = calculatePriority(recommendations);
  
  // Quick win should have higher ROI
  return prioritized[0].roi > prioritized[1].roi;
});

// Test 8: Priority Scoring - Category Assignment
test('Priority Scoring - Category Assignment', () => {
  const recommendations = [
    {
      id: '1',
      title: 'Quick Win',
      description: 'Easy fix',
      type: 'schema',
      impact: 9,
      effort: 2
    }
  ];
  
  const prioritized = calculatePriority(recommendations);
  
  // High impact, low effort should be Quick Win
  return prioritized[0].category === 'Quick Win';
});

// Test 9: Cache Expiration
test('Page Cache - Expiration', async () => {
  const cache = PageCache.getInstance();
  const testData = {
    url: 'https://expire-test.com',
    title: 'Test',
    description: 'Test',
    schemas: [],
    seoScore: 85,
    aeoScore: 75,
    geoScore: 80
  };
  
  // Set with 100ms TTL
  cache.set('https://expire-test.com', testData, 100);
  
  // Should exist immediately
  const immediate = cache.get('https://expire-test.com');
  if (!immediate) return false;
  
  // Wait for expiration
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Should be expired
  const expired = cache.get('https://expire-test.com');
  return expired === null;
});

// Test 10: Cache Cleanup
test('Page Cache - Cleanup', async () => {
  const cache = PageCache.getInstance();
  
  // Add expired entry
  cache.set('https://cleanup-test.com', {
    url: 'https://cleanup-test.com',
    title: 'Test',
    description: 'Test',
    schemas: [],
    seoScore: 85,
    aeoScore: 75,
    geoScore: 80
  }, 50);
  
  // Wait for expiration
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Cleanup should remove it
  const removed = cache.cleanup();
  
  return removed > 0;
});

// Run all tests
async function runTests() {
  console.log('Running validation tests...\n');
  
  // Run synchronous tests
  test('Site Type Detection - E-commerce', () => {
    const result = detectSiteType({
      schemas: [{ '@type': 'Product' }],
      content: 'Buy now add to cart checkout',
      structure: { hasProductPages: true },
      url: 'https://shop.example.com'
    });
    return result.primaryType === 'e-commerce' && result.confidence > 40;
  });
  
  test('Site Type Detection - Local Business', () => {
    const result = detectSiteType({
      schemas: [{ '@type': 'LocalBusiness' }],
      content: 'Visit our location open hours',
      structure: { hasContactPage: true },
      url: 'https://business.example.com'
    });
    return result.primaryType === 'local-business' && result.confidence > 40;
  });
  
  test('Page Cache - Set and Get', () => {
    const cache = PageCache.getInstance();
    cache.clear(); // Clear before test
    const testData = {
      url: 'https://test.com',
      title: 'Test',
      description: 'Test',
      schemas: [],
      seoScore: 85,
      aeoScore: 75,
      geoScore: 80
    };
    
    cache.set('https://test.com', testData);
    const retrieved = cache.get('https://test.com');
    
    return retrieved !== null && retrieved.url === testData.url;
  });
  
  test('Schema Validation - Valid LocalBusiness', () => {
    const schema = {
      '@type': 'LocalBusiness',
      'name': 'Test Business',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '123 Main St',
        'addressLocality': 'City',
        'addressRegion': 'State',
        'postalCode': '12345'
      }
    };
    
    const result = validateSchema(schema);
    return result.isValid && result.score > 50;
  });
  
  test('Priority Scoring - ROI Calculation', () => {
    const recommendations = [
      {
        id: '1',
        title: 'Quick Win',
        description: 'Easy fix',
        type: 'schema',
        impact: 8,
        effort: 2
      },
      {
        id: '2',
        title: 'High Effort',
        description: 'Hard fix',
        type: 'content',
        impact: 5,
        effort: 9
      }
    ];
    
    const prioritized = calculatePriority(recommendations);
    return prioritized[0].roi > prioritized[1].roi;
  });
  
  // Run async tests
  await test('Page Cache - Expiration', async () => {
    const cache = PageCache.getInstance();
    const testData = {
      url: 'https://expire-test.com',
      title: 'Test',
      description: 'Test',
      schemas: [],
      seoScore: 85,
      aeoScore: 75,
      geoScore: 80
    };
    
    cache.set('https://expire-test.com', testData, 100);
    const immediate = cache.get('https://expire-test.com');
    if (!immediate) return false;
    
    await new Promise(resolve => setTimeout(resolve, 150));
    const expired = cache.get('https://expire-test.com');
    return expired === null;
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! System is ready for production.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review before deploying.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
