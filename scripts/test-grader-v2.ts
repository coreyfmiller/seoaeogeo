/**
 * Test script for Grader V2
 * Compares old vs new scoring on sample data
 */

import { calculateDeterministicScores } from '../lib/grader';
import { calculateScoresV2 } from '../lib/grader-v2';

// Sample test data representing different site quality levels
const testCases = [
    {
        name: "Old Pizza Site (12 years old, basic SEO)",
        data: {
            url: "http://pizzatwice.com",
            title: "Pizza Restaurant In Oromocto | Home | Pizza Twice",
            description: "Best pizza in town",
            titleLength: 51,
            descriptionLength: 20,
            structuralData: {
                wordCount: 250,
                semanticTags: {
                    h1Count: 1,
                    main: 0,
                    nav: 1,
                    article: 0,
                    header: 0,
                    footer: 0
                },
                links: {
                    internal: 5,
                    external: 0
                },
                media: {
                    totalImages: 8,
                    imagesWithAlt: 3
                },
                hasViewport: false
            },
            schemas: [],
            semanticFlags: {
                topicMisalignment: false,
                keywordStuffing: false,
                poorReadability: true,
                noDirectQnAMatching: true,
                lowEntityDensity: false,
                poorFormattingConciseness: false,
                lackOfDefinitionStatements: true,
                promotionalTone: false,
                lackOfExpertiseSignals: true,
                lackOfHardData: true,
                heavyFirstPersonUsage: false,
                unsubstantiatedClaims: false
            },
            schemaQuality: undefined,
            responseTimeMs: 1200
        },
        expectedRange: { min: 50, max: 65 }
    },
    {
        name: "Modern SaaS Site (well-optimized)",
        data: {
            url: "https://example-saas.com",
            title: "Modern SaaS Platform - Streamline Your Workflow",
            description: "Discover how our SaaS platform helps teams collaborate better with real-time updates, powerful integrations, and enterprise security.",
            titleLength: 52,
            descriptionLength: 135,
            structuralData: {
                wordCount: 1200,
                semanticTags: {
                    h1Count: 1,
                    main: 1,
                    nav: 1,
                    article: 1,
                    header: 1,
                    footer: 1
                },
                links: {
                    internal: 15,
                    external: 5
                },
                media: {
                    totalImages: 12,
                    imagesWithAlt: 12
                },
                hasViewport: true
            },
            schemas: [
                { type: 'Organization' },
                { type: 'WebSite' },
                { type: 'SoftwareApplication' }
            ],
            semanticFlags: {
                topicMisalignment: false,
                keywordStuffing: false,
                poorReadability: false,
                noDirectQnAMatching: false,
                lowEntityDensity: false,
                poorFormattingConciseness: false,
                lackOfDefinitionStatements: false,
                promotionalTone: false,
                lackOfExpertiseSignals: false,
                lackOfHardData: false,
                heavyFirstPersonUsage: false,
                unsubstantiatedClaims: false
            },
            schemaQuality: {
                score: 85,
                hasSchema: true,
                issues: []
            },
            responseTimeMs: 800
        },
        expectedRange: { min: 85, max: 95 }
    },
    {
        name: "Spam/Low-Quality Site",
        data: {
            url: "http://cheap-stuff.biz",
            title: "Buy Now!!!",
            description: "",
            titleLength: 12,
            descriptionLength: 0,
            structuralData: {
                wordCount: 150,
                semanticTags: {
                    h1Count: 0,
                    main: 0,
                    nav: 0,
                    article: 0,
                    header: 0,
                    footer: 0
                },
                links: {
                    internal: 0,
                    external: 0
                },
                media: {
                    totalImages: 20,
                    imagesWithAlt: 0
                },
                hasViewport: false
            },
            schemas: [],
            semanticFlags: {
                topicMisalignment: true,
                keywordStuffing: true,
                poorReadability: true,
                noDirectQnAMatching: true,
                lowEntityDensity: true,
                poorFormattingConciseness: true,
                lackOfDefinitionStatements: true,
                promotionalTone: true,
                lackOfExpertiseSignals: true,
                lackOfHardData: true,
                heavyFirstPersonUsage: false,
                unsubstantiatedClaims: true
            },
            schemaQuality: undefined,
            responseTimeMs: 4500
        },
        expectedRange: { min: 15, max: 35 }
    },
    {
        name: "Average Blog Post",
        data: {
            url: "https://blog.example.com/post",
            title: "How to Improve Your SEO: A Complete Guide",
            description: "Learn the essential SEO strategies that will help your website rank higher in search results. Includes actionable tips and best practices.",
            titleLength: 46,
            descriptionLength: 130,
            structuralData: {
                wordCount: 850,
                semanticTags: {
                    h1Count: 1,
                    main: 1,
                    nav: 1,
                    article: 1,
                    header: 1,
                    footer: 1
                },
                links: {
                    internal: 8,
                    external: 3
                },
                media: {
                    totalImages: 5,
                    imagesWithAlt: 4
                },
                hasViewport: true
            },
            schemas: [
                { type: 'Article' },
                { type: 'Person' }
            ],
            semanticFlags: {
                topicMisalignment: false,
                keywordStuffing: false,
                poorReadability: false,
                noDirectQnAMatching: false,
                lowEntityDensity: false,
                poorFormattingConciseness: false,
                lackOfDefinitionStatements: false,
                promotionalTone: false,
                lackOfExpertiseSignals: false,
                lackOfHardData: false,
                heavyFirstPersonUsage: false,
                unsubstantiatedClaims: false
            },
            schemaQuality: {
                score: 70,
                hasSchema: true,
                issues: ['Missing datePublished']
            },
            responseTimeMs: 1100
        },
        expectedRange: { min: 75, max: 85 }
    }
];

console.log('='.repeat(80));
console.log('GRADER V2 TEST SUITE');
console.log('='.repeat(80));
console.log('');

for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`TEST: ${testCase.name}`);
    console.log(`${'─'.repeat(80)}`);
    
    const { data, expectedRange } = testCase;
    
    // Calculate V1 score (old system)
    const v1Result = calculateDeterministicScores(
        data.structuralData,
        data.schemas,
        data.semanticFlags,
        data.titleLength,
        data.descriptionLength,
        data.schemaQuality
    );
    
    // Calculate V2 score (new system)
    const v2Result = calculateScoresV2(
        data.structuralData,
        data.schemas,
        data.semanticFlags,
        data.titleLength,
        data.descriptionLength,
        data.url,
        data.title,
        data.description,
        data.schemaQuality,
        data.responseTimeMs
    );
    
    console.log(`\nURL: ${data.url}`);
    console.log(`Title: ${data.title}`);
    console.log(`Word Count: ${data.structuralData.wordCount}`);
    console.log(`HTTPS: ${data.url.startsWith('https://') ? 'Yes' : 'No'}`);
    console.log(`Schema: ${data.schemas.length > 0 ? `Yes (${data.schemas.length} types)` : 'No'}`);
    
    console.log(`\n📊 SCORES:`);
    console.log(`  V1 (Old): ${v1Result.seoScore}/100`);
    console.log(`  V2 (New): ${v2Result.seoScore}/100`);
    console.log(`  Expected: ${expectedRange.min}-${expectedRange.max}`);
    
    const difference = v2Result.seoScore - v1Result.seoScore;
    const diffSymbol = difference > 0 ? '↑' : difference < 0 ? '↓' : '→';
    console.log(`  Difference: ${diffSymbol} ${Math.abs(difference)} points`);
    
    // Check if V2 score is in expected range
    const inRange = v2Result.seoScore >= expectedRange.min && v2Result.seoScore <= expectedRange.max;
    const rangeStatus = inRange ? '✅ IN RANGE' : '⚠️  OUT OF RANGE';
    console.log(`  Status: ${rangeStatus}`);
    
    console.log(`\n💬 Feedback: ${v2Result.overallFeedback}`);
    
    if (v2Result.criticalIssues.length > 0) {
        console.log(`\n🚨 Critical Issues (${v2Result.criticalIssues.length}):`);
        v2Result.criticalIssues.forEach(issue => {
            console.log(`  • ${issue}`);
        });
    }
    
    console.log(`\n📋 Category Breakdown:`);
    for (const category of v2Result.breakdown.seo) {
        const statusEmoji = category.percentage >= 80 ? '✅' : 
                           category.percentage >= 60 ? '⚠️' : '❌';
        console.log(`  ${statusEmoji} ${category.name}: ${category.score}/${category.maxScore} (${category.percentage}%)`);
        
        // Show component details
        for (const component of category.components) {
            const compEmoji = component.status === 'excellent' ? '  ✓' :
                            component.status === 'good' ? '  ○' :
                            component.status === 'warning' ? '  ⚠' : '  ✗';
            console.log(`    ${compEmoji} ${component.score}/${component.maxScore} - ${component.feedback}`);
        }
    }
}

console.log(`\n${'='.repeat(80)}`);
console.log('TEST SUITE COMPLETE');
console.log('='.repeat(80));
console.log('\nNext Steps:');
console.log('1. Review scores - are they in expected ranges?');
console.log('2. Adjust component weights in scoring-components.ts if needed');
console.log('3. Test with real sites using: npm run test:grader-v2');
console.log('4. Once calibrated, integrate into API with feature flag');
