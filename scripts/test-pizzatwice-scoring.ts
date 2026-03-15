/**
 * Test script to verify PizzaTwice scoring
 */

import { calculateScoresFromScanResult } from '../lib/grader-v2';

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

console.log('Testing PizzaTwice scoring...\n');
console.log('Word Count:', pizzaTwiceScanResult.structuralData.wordCount);
console.log('Semantic Flags:', pizzaTwiceScanResult.semanticFlags);
console.log('\n---\n');

const result = calculateScoresFromScanResult(pizzaTwiceScanResult);

console.log('SCORES:');
console.log('SEO:', result.seoScore);
console.log('AEO:', result.aeoScore);
console.log('GEO:', result.geoScore);
console.log('\n---\n');

console.log('AEO BREAKDOWN:');
for (const category of result.breakdown.aeo) {
  console.log(`\n${category.name}: ${category.score}/${category.maxScore}`);
  for (const component of category.components) {
    console.log(`  - ${component.feedback}: ${component.score}/${component.maxScore} (${component.status})`);
    if (component.issues) {
      component.issues.forEach(issue => console.log(`    ⚠ ${issue}`));
    }
  }
}

console.log('\n---\n');

console.log('GEO BREAKDOWN:');
for (const category of result.breakdown.geo) {
  console.log(`\n${category.name}: ${category.score}/${category.maxScore}`);
  for (const component of category.components) {
    console.log(`  - ${component.feedback}: ${component.score}/${component.maxScore} (${component.status})`);
    if (component.issues) {
      component.issues.forEach(issue => console.log(`    ⚠ ${issue}`));
    }
  }
}
