/**
 * Test Data Storage System
 * Stores crawl data and AI responses for testing variance and debugging
 */

import fs from 'fs';
import path from 'path';

const TEST_DATA_DIR = path.join(process.cwd(), 'test-data');

export interface TestSnapshot {
  timestamp: string;
  url: string;
  type: 'single-page' | 'deep-site' | 'competitive';
  crawlData: {
    pages: any[];
    totalWords?: number;
    schemaCount?: number;
    avgResponseTime?: number;
    pagesCrawled?: number;
  };
  aiResponses: {
    raw: string; // Raw AI response text
    parsed: any; // Parsed JSON
    model: string;
    inputTokens: number;
    outputTokens: number;
  };
  scores: {
    deterministic?: {
      schemaQuality: number;
      brandConsistency: number;
      schemaValidation: any;
      brandBreakdown: any;
    };
    final?: any; // Final merged scores
  };
}

/**
 * Save a test snapshot to disk
 */
export function saveTestSnapshot(snapshot: TestSnapshot): string {
  // Ensure test-data directory exists
  if (!fs.existsSync(TEST_DATA_DIR)) {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  }

  // Create filename: YYYY-MM-DD_HH-MM-SS_domain_type.json
  const date = new Date(snapshot.timestamp);
  const dateStr = date.toISOString().replace(/:/g, '-').split('.')[0];
  const domain = snapshot.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_');
  const filename = `${dateStr}_${domain}_${snapshot.type}.json`;
  const filepath = path.join(TEST_DATA_DIR, filename);

  // Write snapshot
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  
  console.log(`[TestDataStore] Saved snapshot: ${filename}`);
  return filepath;
}

/**
 * Load a test snapshot from disk
 */
export function loadTestSnapshot(filename: string): TestSnapshot | null {
  const filepath = path.join(TEST_DATA_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    console.error(`[TestDataStore] Snapshot not found: ${filename}`);
    return null;
  }

  const data = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(data);
}

/**
 * List all available test snapshots
 */
export function listTestSnapshots(): string[] {
  if (!fs.existsSync(TEST_DATA_DIR)) {
    return [];
  }

  return fs.readdirSync(TEST_DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse(); // Most recent first
}

/**
 * Get the most recent snapshot for a URL
 */
export function getLatestSnapshot(url: string, type?: 'single-page' | 'deep-site' | 'competitive'): TestSnapshot | null {
  const snapshots = listTestSnapshots();
  const domain = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_');
  
  for (const filename of snapshots) {
    if (filename.includes(domain)) {
      if (type && !filename.includes(type)) continue;
      return loadTestSnapshot(filename);
    }
  }
  
  return null;
}

/**
 * Compare two snapshots to detect variance
 */
export function compareSnapshots(snapshot1: TestSnapshot, snapshot2: TestSnapshot) {
  return {
    sameInput: JSON.stringify(snapshot1.crawlData) === JSON.stringify(snapshot2.crawlData),
    deterministicScoresMatch: {
      schemaQuality: snapshot1.scores.deterministic?.schemaQuality === snapshot2.scores.deterministic?.schemaQuality,
      brandConsistency: snapshot1.scores.deterministic?.brandConsistency === snapshot2.scores.deterministic?.brandConsistency,
    },
    aiResponsesDiffer: snapshot1.aiResponses.raw !== snapshot2.aiResponses.raw,
    tokenUsage: {
      snapshot1: {
        input: snapshot1.aiResponses.inputTokens,
        output: snapshot1.aiResponses.outputTokens,
      },
      snapshot2: {
        input: snapshot2.aiResponses.inputTokens,
        output: snapshot2.aiResponses.outputTokens,
      },
    },
  };
}
