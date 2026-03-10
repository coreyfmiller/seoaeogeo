// Script to copy all sections from deep crawler to merged dashboard
const fs = require('fs');

// Read both files
const deepCrawler = fs.readFileSync('app/site-analysis/page.tsx', 'utf8');
const merged = fs.readFileSync('app/merged/page.tsx', 'utf8');

// Find where to insert in merged (after the Keyword Cannibalization section)
const insertMarker = '                          )}';
const insertIndex = merged.lastIndexOf(insertMarker);

if (insertIndex === -1) {
  console.error('Could not find insertion point in merged page');
  process.exit(1);
}

// Extract all sections from deep crawler (after Page Comparison Table)
// Find the Brand Consistency Audit section and everything after
const brandConsistencyStart = deepCrawler.indexOf('{/* ── Brand Health Audit ── */}');

if (brandConsistencyStart === -1) {
  console.error('Could not find Brand Consistency section in deep crawler');
  process.exit(1);
}

// Find the end of the content (before the closing divs and export)
const contentEnd = deepCrawler.lastIndexOf('</main>');

// Extract the sections
const sectionsToAdd = deepCrawler.substring(brandConsistencyStart, contentEnd);

// Insert into merged page
const before = merged.substring(0, insertIndex + insertMarker.length);
const after = merged.substring(insertIndex + insertMarker.length);

const newMerged = before + '\n\n' + sectionsToAdd + after;

// Write the new merged file
fs.writeFileSync('app/merged/page.tsx', newMerged, 'utf8');

console.log('✓ Successfully added all sections to merged dashboard');
console.log(`✓ Added ${sectionsToAdd.split('\n').length} lines of content`);
