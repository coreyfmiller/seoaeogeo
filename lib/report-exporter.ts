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
  try {
    const isDeep = !!(data as any).deepScan;
    const report = isDeep ? generateDeepScanReport((data as any).deepScan) : generateTextReport(data);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Safe filename generation
    let hostname = 'report';
    try {
      hostname = new URL(data.url.startsWith('http') ? data.url : `https://${data.url}`).hostname;
    } catch {
      hostname = data.url.replace(/[^a-z0-9]/gi, '-').substring(0, 50);
    }
    
    a.download = `seo-audit-${hostname}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Copy report to clipboard
 */
export async function copyReportToClipboard(data: ExportData): Promise<boolean> {
  try {
    const isDeep = !!(data as any).deepScan;
    const report = isDeep ? generateDeepScanReport((data as any).deepScan) : generateTextReport(data);
    await navigator.clipboard.writeText(report);
    return true;
  } catch (err) {
    console.error('Failed to copy report:', err);
    return false;
  }
}

/**
 * Generate a formatted text report for Deep Scan results
 */
function generateDeepScanReport(data: any): string {
  const lines: string[] = [];
  const ai = data.sitewideIntelligence || {};

  // Header
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('           DEEP SCAN AUDIT REPORT');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Domain: ${data.url}`);
  lines.push(`Pages Crawled: ${data.pagesCrawled}`);
  lines.push(`Site Type: ${data.siteTypeResult?.primaryType || 'Unknown'} (${data.siteTypeResult?.confidence || 0}% confidence)`);
  lines.push(`Generated: ${data.analyzedAt || new Date().toLocaleString()}`);
  lines.push('');

  // Aggregate Scores
  lines.push('───────────────────────────────────────────────────────────');
  lines.push('AGGREGATE SCORES');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push(`Avg SEO Score: ${data.scores?.seo ?? 0}/100`);
  lines.push(`Avg AEO Score: ${data.scores?.aeo ?? 0}/100`);
  lines.push(`Avg GEO Score: ${data.scores?.geo ?? 0}/100`);
  lines.push('');

  // Key Metrics
  lines.push('───────────────────────────────────────────────────────────');
  lines.push('KEY METRICS');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push(`Domain Health: ${ai.domainHealthScore ?? '–'}/100`);
  lines.push(`Brand Consistency: ${ai.consistencyScore ?? '–'}%`);
  lines.push(`Schema Coverage: ${ai.authorityMetrics?.schemaCoverage ?? '–'}%`);
  lines.push(`Avg Response Time: ${data.aggregateMetrics?.avgResponseTime ?? '–'}ms`);
  lines.push(`Robots.txt: ${data.robotsTxt ? 'Found' : 'Missing'}`);
  lines.push(`Sitemap: ${data.sitemapFound ? 'Found' : 'Missing'}`);
  const totalImg = data.aggregateMetrics?.totalImages || 0;
  const altImg = data.aggregateMetrics?.totalImagesWithAlt || 0;
  lines.push(`Alt Text Coverage: ${totalImg > 0 ? Math.round((altImg / totalImg) * 100) : 100}%`);
  lines.push('');

  // Prioritized Site Improvements
  if (ai.recommendations?.length > 0) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`PRIORITIZED SITE IMPROVEMENTS (${ai.recommendations.length})`);
    lines.push('═══════════════════════════════════════════════════════════');
    ai.recommendations.forEach((rec: any, i: number) => {
      lines.push('');
      lines.push(`${i + 1}. ${rec.title}`);
      lines.push(`   Priority: ${rec.priority || 'MEDIUM'} | Impact: ${rec.impact || 'Medium'} | Effort: ${rec.effort || '–'}/3`);
      lines.push(`   Category: ${rec.category || '–'} | Affects: ${rec.impactedScores || '–'}`);
      lines.push(`   ${rec.description}`);
    });
    lines.push('');
  }

  // Page-by-Page Scores
  if (data.pages?.length > 0) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`PAGE-BY-PAGE SCORES (${data.pages.length} pages)`);
    lines.push('═══════════════════════════════════════════════════════════');
    data.pages.forEach((p: any) => {
      lines.push('');
      lines.push(`  ${p.url}`);
      lines.push(`  Title: ${p.title || 'Untitled'}`);
      lines.push(`  SEO: ${p.scores?.seo?.score ?? '–'} | AEO: ${p.scores?.aeo?.score ?? '–'} | GEO: ${p.scores?.geo?.score ?? '–'}`);
      lines.push(`  Words: ${p.wordCount || 0} | H1: ${p.hasH1 ? 'Yes' : 'No'} | Schema: ${p.schemaCount || 0} types`);
      if (p.enhancedPenalties?.length > 0) {
        lines.push(`  Issues (${p.enhancedPenalties.length}):`);
        p.enhancedPenalties.slice(0, 5).forEach((pen: any) => {
          lines.push(`    • [${pen.severity}] ${pen.component}: ${pen.penalty}`);
          if (pen.fix) lines.push(`      Fix: ${pen.fix}`);
        });
      }
    });
    lines.push('');
  }

  // Domain Health Breakdown
  if (ai.domainHealthBreakdown) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('DOMAIN HEALTH BREAKDOWN');
    lines.push('═══════════════════════════════════════════════════════════');
    const b = ai.domainHealthBreakdown;
    lines.push(`  Content Quality: ${b.contentQuality ?? 0}/100`);
    lines.push(`  Schema Quality:  ${b.schemaQuality ?? 0}/100`);
    lines.push(`  Metadata:        ${b.metadataQuality ?? 0}/100`);
    lines.push(`  Technical:       ${b.technicalHealth ?? 0}/100`);
    lines.push(`  Architecture:    ${b.architectureHealth ?? 0}/100`);
    if (ai.domainHealthExplanations) {
      Object.entries(ai.domainHealthExplanations).forEach(([key, d]: [string, any]) => {
        lines.push('');
        lines.push(`  ${key.replace(/([A-Z])/g, ' $1').trim()} (${d.score}/100):`);
        d.issues?.slice(0, 3).forEach((issue: string) => {
          lines.push(`    ⚠ ${issue}`);
        });
        d.recommendations?.slice(0, 3).forEach((rec: string) => {
          lines.push(`    → ${rec}`);
        });
      });
    }
    lines.push('');
  }

  // Schema Health Audit
  if (ai.schemaHealthAudit) {
    const s = ai.schemaHealthAudit;
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`SCHEMA HEALTH AUDIT (${s.overallScore}/100)`);
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`  Coverage: ${s.breakdown?.coverage ?? 0}% | Quality: ${s.breakdown?.quality ?? 0}% | Diversity: ${s.breakdown?.diversity ?? 0}%`);
    if (s.issues?.length > 0) {
      lines.push('');
      s.issues.slice(0, 5).forEach((issue: any) => {
        lines.push(`  [${issue.severity}] ${issue.issue} (${issue.affectedCount} pages, -${issue.pointsDeducted} pts)`);
        if (issue.howToFix) lines.push(`    Fix: ${issue.howToFix}`);
      });
    }
    lines.push('');
  }

  // Duplicate Content
  if (data.duplicateTitles?.length > 0 || data.duplicateDescriptions?.length > 0) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('DUPLICATE CONTENT DETECTION');
    lines.push('═══════════════════════════════════════════════════════════');
    data.duplicateTitles?.forEach((dup: any) => {
      lines.push('');
      lines.push(`  Duplicate Title (${dup.urls.length} pages): ${dup.title}`);
      dup.urls.forEach((u: string) => lines.push(`    - ${u}`));
      lines.push('    Fix: Write a unique, descriptive title for each page.');
    });
    data.duplicateDescriptions?.forEach((dup: any) => {
      lines.push('');
      lines.push(`  Duplicate Description (${dup.urls.length} pages): ${dup.description}`);
      dup.urls.forEach((u: string) => lines.push(`    - ${u}`));
      lines.push('    Fix: Write a unique meta description (120-160 chars) for each page.');
    });
    lines.push('');
  }

  // AEO Readiness
  if (ai.aeoReadiness) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`AEO READINESS (${ai.aeoReadiness.score}/100)`);
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`  ${ai.aeoReadiness.verdict}`);
    lines.push('');
    const fixes: Record<string, string> = {
      'AboutPage': 'Create a detailed About page with team bios and expertise signals.',
      'FaqContent': 'Add an FAQ section with structured Q&A using FAQPage schema.',
      'StructuredQa': 'Implement FAQPage or QAPage schema for Q&A content.',
      'AuthorOrExpertSignals': 'Add author bios with credentials to establish E-E-A-T.',
      'ClearTopicFocus': 'Tighten content around core topics.',
      'SchemaForAi': 'Add JSON-LD schema to help AI engines understand your site.',
      'LongformContent': 'Create in-depth content (1000+ words) on key topics.',
    };
    if (ai.aeoReadiness.signals) {
      Object.entries(ai.aeoReadiness.signals).forEach(([key, val]) => {
        const label = key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim();
        const fixKey = key.replace(/^has/, '');
        lines.push(`  ${val ? '✓' : '✗'} ${label}`);
        if (!val && fixes[fixKey]) lines.push(`    Fix: ${fixes[fixKey]}`);
      });
    }
    lines.push('');
  }

  // Footer
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('Report generated by Citatom Intelligence Platform — Deep Scan');
  lines.push('═══════════════════════════════════════════════════════════');

  return lines.join('\n');
}
