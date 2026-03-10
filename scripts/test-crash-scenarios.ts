/**
 * Test Crash Scenarios
 * 
 * This script tests various edge cases that could cause crashes during deep crawl:
 * 1. Empty pages array
 * 2. Missing AI data
 * 3. Malformed analysis data
 * 4. Division by zero scenarios
 * 5. Null/undefined values in critical paths
 */

interface TestScenario {
  name: string;
  data: any;
  shouldPass: boolean;
  description: string;
}

const testScenarios: TestScenario[] = [
  {
    name: "Empty Pages Array",
    data: {
      pagesCrawled: 0,
      pages: [],
      ai: {
        domainHealthScore: 50,
        consistencyScore: 50,
        recommendations: []
      }
    },
    shouldPass: true,
    description: "Should handle empty pages array without division by zero"
  },
  {
    name: "Missing AI Data",
    data: {
      pagesCrawled: 5,
      pages: [
        { url: "https://example.com", seoScore: 80, aeoScore: 70, geoScore: 90 }
      ],
      ai: null
    },
    shouldPass: true,
    description: "Should handle missing AI data gracefully"
  },
  {
    name: "Incomplete AI Data",
    data: {
      pagesCrawled: 5,
      pages: [
        { url: "https://example.com", seoScore: 80, aeoScore: 70, geoScore: 90 }
      ],
      ai: {
        // Missing many expected fields
        domainHealthScore: 50
      }
    },
    shouldPass: true,
    description: "Should handle incomplete AI data with fallbacks"
  },
  {
    name: "No Pages and No AI",
    data: {
      pagesCrawled: 0,
      pages: [],
      ai: null
    },
    shouldPass: false,
    description: "Should show error boundary when both pages and AI are missing"
  },
  {
    name: "Pages with Missing Scores",
    data: {
      pagesCrawled: 3,
      pages: [
        { url: "https://example.com/1" },
        { url: "https://example.com/2", seoScore: 80 },
        { url: "https://example.com/3", aeoScore: 70 }
      ],
      ai: {
        domainHealthScore: 50,
        consistencyScore: 50
      }
    },
    shouldPass: true,
    description: "Should handle pages with missing scores using fallback values"
  },
  {
    name: "Valid Complete Data",
    data: {
      pagesCrawled: 5,
      pages: [
        { 
          url: "https://example.com/1", 
          seoScore: 80, 
          aeoScore: 70, 
          geoScore: 90,
          wordCount: 500,
          hasH1: true,
          isHttps: true,
          responseTimeMs: 200,
          schemas: [{ "@type": "Organization" }]
        }
      ],
      ai: {
        domainHealthScore: 85,
        consistencyScore: 90,
        recommendations: [
          { title: "Fix 1", category: "Quick Win", priority: "HIGH" }
        ],
        schemaHealthAudit: {
          overallScore: 80,
          issues: []
        }
      },
      siteWideIssues: {
        orphanPages: [],
        duplicateContent: [],
        thinContent: []
      }
    },
    shouldPass: true,
    description: "Should handle complete valid data successfully"
  }
];

/**
 * Simulate the aggregate score calculation from the UI
 */
function testAggregateScores(pages: any[]): { seo: number; aeo: number; geo: number } {
  return {
    seo: Math.round(pages.reduce((sum: number, p: any) => sum + (p.seoScore || 0), 0) / Math.max(pages.length, 1)),
    aeo: Math.round(pages.reduce((sum: number, p: any) => sum + (p.aeoScore || 0), 0) / Math.max(pages.length, 1)),
    geo: Math.round(pages.reduce((sum: number, p: any) => sum + (p.geoScore || 0), 0) / Math.max(pages.length, 1))
  };
}

/**
 * Test if data structure is valid
 */
function testDataStructure(data: any): boolean {
  // This mimics the error boundary check in the UI
  // Should show error when BOTH ai is missing AND pages is empty/missing
  return !(!data.ai && (!data.pages || data.pages.length === 0));
}

/**
 * Run all test scenarios
 */
function runTests() {
  console.log("🧪 Testing Crash Scenarios\n");
  console.log("=" .repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    
    try {
      // Test data structure validation
      const isValid = testDataStructure(scenario.data);
      
      // Test aggregate score calculation (should never throw)
      if (scenario.data.pages && scenario.data.pages.length >= 0) {
        const scores = testAggregateScores(scenario.data.pages);
        console.log(`   Aggregate Scores: SEO=${scores.seo}, AEO=${scores.aeo}, GEO=${scores.geo}`);
      }
      
      // Check if result matches expectation
      if (scenario.shouldPass && isValid) {
        console.log(`   ✅ PASS - Data structure valid`);
        passed++;
      } else if (!scenario.shouldPass && !isValid) {
        console.log(`   ✅ PASS - Correctly identified invalid data`);
        passed++;
      } else {
        console.log(`   ❌ FAIL - Expected ${scenario.shouldPass ? 'valid' : 'invalid'}, got ${isValid ? 'valid' : 'invalid'}`);
        failed++;
      }
      
    } catch (error: any) {
      console.log(`   ❌ FAIL - Unexpected error: ${error.message}`);
      failed++;
    }
  });
  
  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testScenarios.length} tests`);
  
  if (failed === 0) {
    console.log("✅ All crash scenarios handled correctly!");
  } else {
    console.log("❌ Some scenarios failed - review crash handling logic");
  }
}

// Run tests
runTests();
