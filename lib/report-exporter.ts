/**
 * Report Exporter - Generate downloadable audit reports
 */

interface ExportData {
  url: string;
  timestamp: string;
  scores: {
    seo: number;
    aeo: number;
    geo: number;
  };
  penalties: Array<{
    category: string;
    component: string;
    penalty: string;
    explanation: string;
    fix: string;
    pointsDeducted: number;
    severity: string;
  }>;
  technical?: {
    isHttps: boolean;
    status: number;
    responseTimeMs: number;
  };
  structuralData?: {
    wordCount: number;
    links: { internal: number; external: number };
    media: { totalImages: number; imagesWithAlt: number };
  };
}

/**
 * Generate a formatted text report
 */
export function generateTextReport(data: ExportData): string {
  const lines: string[] = [];
  
  // Header
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('           SEO/AEO/GEO INTELLIGENCE AUDIT REPORT');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`URL: ${data.url}`);
  lines.push(`Generated: ${data.timestamp}`);
  lines.push('');
  
  // Scores
  lines.push('───────────────────────────────────────────────────────────');
  lines.push('OVERALL SCORES');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push(`SEO Score: ${data.scores.seo}/100`);
  lines.push(`AEO Score: ${data.scores.aeo}/100`);
  lines.push(`GEO Score: ${data.scores.geo}/100`);
  lines.push('');
  
  // Technical Overview
  if (data.technical) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('TECHNICAL OVERVIEW');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`HTTPS: ${data.technical.isHttps ? '✓ Enabled' : '✗ Not Enabled'}`);
    lines.push(`Status Code: ${data.technical.status}`);
    lines.push(`Response Time: ${data.technical.responseTimeMs}ms`);
    lines.push('');
  }
  
  // Structural Data
  if (data.structuralData) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('CONTENT STRUCTURE');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`Word Count: ${data.structuralData.wordCount}`);
    lines.push(`Internal Links: ${data.structuralData.links.internal}`);
    lines.push(`External Links: ${data.structuralData.links.external}`);
    lines.push(`Images: ${data.structuralData.media.totalImages} (${data.structuralData.media.imagesWithAlt} with alt text)`);
    lines.push('');
  }
  
  // Penalties by Category
  const seoP = data.penalties.filter(p => p.category === 'SEO');
  const aeoP = data.penalties.filter(p => p.category === 'AEO');
  const geoP = data.penalties.filter(p => p.category === 'GEO');
  
  if (seoP.length > 0) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`SEO ISSUES (${seoP.length})`);
    lines.push('═══════════════════════════════════════════════════════════');
    seoP.forEach((p, i) => {
      lines.push('');
      lines.push(`${i + 1}. ${p.component} [${p.pointsDeducted} points]`);
      lines.push(`   Severity: ${p.severity.toUpperCase()}`);
      lines.push(`   Issue: ${p.penalty}`);
      lines.push('');
      lines.push(`   Why This Matters:`);
      lines.push(`   ${p.explanation}`);
      lines.push('');
      lines.push(`   How To Fix:`);
      lines.push(`   ${p.fix}`);
      lines.push('');
    });
  }
  
  if (aeoP.length > 0) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`AEO ISSUES (${aeoP.length})`);
    lines.push('═══════════════════════════════════════════════════════════');
    aeoP.forEach((p, i) => {
      lines.push('');
      lines.push(`${i + 1}. ${p.component} [${p.pointsDeducted} points]`);
      lines.push(`   Severity: ${p.severity.toUpperCase()}`);
      lines.push(`   Issue: ${p.penalty}`);
      lines.push('');
      lines.push(`   Why This Matters:`);
      lines.push(`   ${p.explanation}`);
      lines.push('');
      lines.push(`   How To Fix:`);
      lines.push(`   ${p.fix}`);
      lines.push('');
    });
  }
  
  if (geoP.length > 0) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`GEO ISSUES (${geoP.length})`);
    lines.push('═══════════════════════════════════════════════════════════');
    geoP.forEach((p, i) => {
      lines.push('');
      lines.push(`${i + 1}. ${p.component} [${p.pointsDeducted} points]`);
      lines.push(`   Severity: ${p.severity.toUpperCase()}`);
      lines.push(`   Issue: ${p.penalty}`);
      lines.push('');
      lines.push(`   Why This Matters:`);
      lines.push(`   ${p.explanation}`);
      lines.push('');
      lines.push(`   How To Fix:`);
      lines.push(`   ${p.fix}`);
      lines.push('');
    });
  }
  
  // Footer
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('Report generated by Pro Audit');
  lines.push('For more information, visit your dashboard');
  lines.push('═══════════════════════════════════════════════════════════');
  
  return lines.join('\n');
}

/**
 * Download report as text file
 */
export function downloadReport(data: ExportData) {
  const report = generateTextReport(data);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seo-audit-${new URL(data.url).hostname}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy report to clipboard
 */
export async function copyReportToClipboard(data: ExportData): Promise<boolean> {
  try {
    const report = generateTextReport(data);
    await navigator.clipboard.writeText(report);
    return true;
  } catch (err) {
    console.error('Failed to copy report:', err);
    return false;
  }
}
