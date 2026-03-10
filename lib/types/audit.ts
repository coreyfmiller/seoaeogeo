// Core type definitions for the Intelligent Context-Aware Auditing system

export type SiteType = 
  | 'e-commerce'
  | 'local-business'
  | 'blog'
  | 'saas'
  | 'portfolio'
  | 'restaurant'
  | 'contractor'
  | 'professional-services'
  | 'news-media'
  | 'educational'
  | 'general';

export interface ClassificationSignal {
  type: SiteType;
  score: number;
  evidence: string;
}

export interface SiteTypeResult {
  primaryType: SiteType;
  secondaryTypes: SiteType[];
  confidence: number; // 0-100
  signals: ClassificationSignal[];
  recommendedSchemas: string[];
}

export type PlatformType = 'wordpress' | 'shopify' | 'nextjs' | 'react' | 'custom-html';

export interface Platform {
  type: PlatformType;
  confidence: number;
  version?: string;
}

// Extended PageScan fields (to be merged with existing interface)
export interface PageScanExtensions {
  orphanScore?: number; // 0-100, lower = more orphaned
  duplicateContentHash?: string;
  platformDetection?: Platform;
  linkDepth?: number; // Distance from homepage
}

export interface SiteWideIssue {
  type: 'missing-h1' | 'thin-content' | 'missing-meta' | 'poor-alt-coverage' | 'orphan-pages' | 'duplicate-content';
  affectedPages: string[];
  count: number;
  severity: 'critical' | 'high' | 'medium';
  description: string;
}

export interface OrphanPage {
  url: string;
  inboundCount: number;
  severity: 'critical' | 'medium';
}

export interface DuplicateGroup {
  pages: string[];
  similarity: 'high' | 'medium';
  recommendation: string;
}
