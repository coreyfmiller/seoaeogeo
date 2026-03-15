/**
 * Test script to verify enhanced penalties generation
 */

import { calculateScoresFromScanResult, convertBreakdownToEnhancedPenalties } from '../lib/grader-v2';

// Simulate PizzaTwice scan result
const pizzaTwiceScanResult = {
  url: 'https://pizzatwice.com',
  title: 'Pizza Twice - Oromocto Pizza',
  description: 'Pizza delivery in Oromocto',
  structuralData: {
    wordCount: 282,
    media: {
      totalImages: 12,
      imagesWithAlt: 5
    }
  },
  schemas: [
    { '@type': 'Organization' },
    { '@type': 'LocalBusiness' }
  ],
  semanticFlags: {
    noDirectQnAMatching: true,
    lowEntityDensity: true,
    poorFormattingConciseness: true,
    lackOfDefinitionStatements: true,
    promotionalTone: false,
    lackOfExpertiseSignals: true,
    lackOfHardData: true,
    heavyFirstPersonUsage: false,
    unsubstantiatedClaims: false,
  },
  schemaQuality: {
    hasSchema: true,
    score: 60,
    issues: ['Missing required properties']
  },
  technical: {
    responseTimeMs: 980
  }
};

console.log('Testing enhanced penalties generation...\n');

try {
  const result = calculateScoresFromScanResult(pizzaTwiceScanResult);
  
  console.log('Grader result generated successfully');
  console.log('Scores:', result.seoScore, result.aeoScore, result.geoScore);
  
  console.log('\nGenerating enhanced penalties...');
  const enhancedPenalties = convertBreakdownToEnhancedPenalties(
    result.breakdown.seo,
    result.breakdown.aeo,
    result.breakdown.geo
  );
  
  console.log(`\nGenerated ${enhancedPenalties.length} enhanced penalties\n`);
  
  // Show first 3 penalties
  enhancedPenalties.slice(0, 3).forEach((penalty, idx) => {
    console.log(`${idx + 1}. [${penalty.category}] [${penalty.severity.toUpperCase()}] ${penalty.component}`);
    console.log(`   Points: ${penalty.pointsDeducted}`);
    console.log(`   Issue: ${penalty.penalty}`);
    console.log(`   Explanation: ${penalty.explanation.substring(0, 100)}...`);
    console.log(`   Fix: ${penalty.fix.substring(0, 100)}...`);
    console.log('');
  });
  
  console.log('✅ Enhanced penalties generated successfully!');
  
} catch (error: any) {
  console.error('❌ Error generating enhanced penalties:');
  console.error(error.message);
  console.error(error.stack);
}
