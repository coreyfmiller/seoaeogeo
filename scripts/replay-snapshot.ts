/**
 * Replay Snapshot Script
 * Re-runs validation logic on saved snapshot data
 * Useful for testing prompt/validation changes without re-crawling
 */

import { loadTestSnapshot, listTestSnapshots } from '../lib/test-data-store';
import { validateSchemas, calculateBrandConsistency } from '../lib/schema-validator';

async function replaySnapshot(filename: string) {
  console.log(`\n🔄 Replaying snapshot: ${filename}\n`);
  
  const snapshot = loadTestSnapshot(filename);
  if (!snapshot) {
    console.error('❌ Snapshot not found');
    return;
  }

  console.log(`📅 Original Timestamp: ${new Date(snapshot.timestamp).toLocaleString()}`);
  console.log(`🌐 Domain: ${snapshot.url}`);
  console.log(`📊 Type: ${snapshot.type}`);
  console.log(`📄 Pages: ${snapshot.crawlData.pages.length}\n`);

  // Re-run deterministic validations with CURRENT code
  console.log('🔬 Re-running deterministic validations with current code...\n');

  // 1. Schema Validation
  const schemaValidations = snapshot.crawlData.pages.map((p: any) => 
    validateSchemas(p.schemas || [])
  );
  const avgSchemaScore = schemaValidations.reduce((sum, v) => sum + v.score, 0) / schemaValidations.length;
  
  // 2. Brand Consistency
  const brandResult = calculateBrandConsistency(
    snapshot.crawlData.pages.map((p: any) => ({
      title: p.title || '',
      description: p.description || '',
      schemas: p.schemas || []
    }))
  );

  // Compare with original scores
  console.log('📊 SCORE COMPARISON:\n');
  
  console.log('Schema Quality:');
  console.log(`  Original: ${snapshot.scores.deterministic?.schemaQuality || 0}%`);
  console.log(`  Current:  ${Math.round(avgSchemaScore)}%`);
  const schemaDiff = Math.round(avgSchemaScore) - (snapshot.scores.deterministic?.schemaQuality || 0);
  console.log(`  Diff:     ${schemaDiff > 0 ? '+' : ''}${schemaDiff}% ${schemaDiff === 0 ? '✅' : '⚠️'}\n`);

  console.log('Brand Consistency:');
  console.log(`  Original: ${snapshot.scores.deterministic?.brandConsistency || 0}%`);
  console.log(`  Current:  ${brandResult.score}%`);
  const brandDiff = brandResult.score - (snapshot.scores.deterministic?.brandConsistency || 0);
  console.log(`  Diff:     ${brandDiff > 0 ? '+' : ''}${brandDiff}% ${brandDiff === 0 ? '✅' : '⚠️'}\n`);

  // Show detailed breakdown
  if (schemaDiff !== 0 || brandDiff !== 0) {
    console.log('⚠️  SCORES CHANGED - Validation logic may have been modified\n');
    
    if (schemaDiff !== 0) {
      console.log('📋 Current Schema Issues:');
      const allIssues = schemaValidations.flatMap(v => v.issues);
      const issueGroups = new Map<string, number>();
      allIssues.forEach(issue => {
        const key = issue.message;
        issueGroups.set(key, (issueGroups.get(key) || 0) + 1);
      });
      issueGroups.forEach((count, message) => {
        console.log(`  - ${message} (${count} pages)`);
      });
      console.log();
    }

    if (brandDiff !== 0) {
      console.log('📋 Current Brand Breakdown:');
      console.log(`  Schema Names: ${brandResult.breakdown.schemaNameConsistency.score}%`);
      console.log(`  Title Terms: ${brandResult.breakdown.titleConsistency.score}%`);
      console.log(`  Descriptions: ${brandResult.breakdown.descriptionConsistency.score}%`);
      console.log();
      
      if (brandResult.breakdown.schemaNameConsistency.issues.length > 0) {
        console.log('  Issues:');
        brandResult.breakdown.schemaNameConsistency.issues.forEach(i => console.log(`    - ${i}`));
        brandResult.breakdown.titleConsistency.issues.forEach(i => console.log(`    - ${i}`));
        brandResult.breakdown.descriptionConsistency.issues.forEach(i => console.log(`    - ${i}`));
      }
      console.log();
    }
  } else {
    console.log('✅ Scores match original - validation logic is consistent\n');
  }

  console.log('─'.repeat(60));
  console.log('✅ Replay complete\n');
}

// CLI interface
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n📋 Available snapshots:\n');
  const snapshots = listTestSnapshots();
  if (snapshots.length === 0) {
    console.log('No snapshots found. Run a scan with "Save test snapshot" enabled first.\n');
  } else {
    snapshots.forEach((filename, idx) => {
      console.log(`${idx + 1}. ${filename}`);
    });
    console.log('\nUsage: npm run replay <filename>');
    console.log('   or: npm run replay <number>\n');
  }
} else {
  const input = args[0];
  const snapshots = listTestSnapshots();
  
  // Check if input is a number (index)
  const index = parseInt(input);
  if (!isNaN(index) && index > 0 && index <= snapshots.length) {
    replaySnapshot(snapshots[index - 1]);
  } else {
    // Assume it's a filename
    replaySnapshot(input);
  }
}
