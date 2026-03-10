/**
 * Test Variance Analysis Script
 * Compares multiple snapshots to detect scoring variance
 */

import { listTestSnapshots, loadTestSnapshot, compareSnapshots } from '../lib/test-data-store';

function analyzeVariance() {
  console.log('=== Test Snapshot Variance Analysis ===\n');
  
  const snapshots = listTestSnapshots();
  
  if (snapshots.length === 0) {
    console.log('No test snapshots found. Run a scan with saveSnapshot=true first.');
    return;
  }

  console.log(`Found ${snapshots.length} snapshot(s):\n`);
  
  // Group by domain
  const byDomain = new Map<string, string[]>();
  snapshots.forEach(filename => {
    const parts = filename.split('_');
    const domain = parts[1]; // Extract domain from filename
    if (!byDomain.has(domain)) {
      byDomain.set(domain, []);
    }
    byDomain.get(domain)!.push(filename);
  });

  // Analyze each domain
  byDomain.forEach((files, domain) => {
    console.log(`\n📊 Domain: ${domain}`);
    console.log(`   Snapshots: ${files.length}`);
    
    if (files.length < 2) {
      console.log('   ⚠️  Need at least 2 snapshots to compare variance\n');
      return;
    }

    // Load all snapshots for this domain
    const loaded = files.map(f => loadTestSnapshot(f)).filter(Boolean);
    
    // Compare deterministic scores
    const schemaScores = loaded.map(s => s!.scores.deterministic?.schemaQuality || 0);
    const brandScores = loaded.map(s => s!.scores.deterministic?.brandConsistency || 0);
    
    const schemaVariance = Math.max(...schemaScores) - Math.min(...schemaScores);
    const brandVariance = Math.max(...brandScores) - Math.min(...brandScores);
    
    console.log(`\n   📈 Deterministic Score Variance:`);
    console.log(`      Schema Quality: ${schemaVariance === 0 ? '✅ CONSISTENT' : `❌ VARIANCE: ${schemaVariance} points`}`);
    console.log(`      Brand Consistency: ${brandVariance === 0 ? '✅ CONSISTENT' : `❌ VARIANCE: ${brandVariance} points`}`);
    
    // Show individual scores
    console.log(`\n   📋 Individual Scores:`);
    loaded.forEach((snapshot, idx) => {
      const timestamp = new Date(snapshot!.timestamp).toLocaleString();
      console.log(`      ${idx + 1}. ${timestamp}`);
      console.log(`         Schema: ${snapshot!.scores.deterministic?.schemaQuality || 0}%`);
      console.log(`         Brand: ${snapshot!.scores.deterministic?.brandConsistency || 0}%`);
      console.log(`         Tokens: ${snapshot!.aiResponses.inputTokens} in / ${snapshot!.aiResponses.outputTokens} out`);
    });

    // Compare first two snapshots in detail
    if (loaded.length >= 2) {
      console.log(`\n   🔍 Detailed Comparison (First 2 Snapshots):`);
      const comparison = compareSnapshots(loaded[0]!, loaded[1]!);
      console.log(`      Same Input Data: ${comparison.sameInput ? '✅ YES' : '❌ NO'}`);
      console.log(`      Schema Scores Match: ${comparison.deterministicScoresMatch.schemaQuality ? '✅ YES' : '❌ NO'}`);
      console.log(`      Brand Scores Match: ${comparison.deterministicScoresMatch.brandConsistency ? '✅ YES' : '❌ NO'}`);
      console.log(`      AI Responses Differ: ${comparison.aiResponsesDiffer ? '⚠️  YES (expected)' : '✅ IDENTICAL'}`);
    }
    
    console.log('\n' + '─'.repeat(60));
  });

  console.log('\n✅ Analysis complete\n');
}

// Run analysis
analyzeVariance();
