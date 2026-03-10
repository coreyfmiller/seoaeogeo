import type { PageScan } from './crawler-deep';

/**
 * Page Cache
 * Caches PageScan results for 24 hours to avoid re-crawling recently analyzed pages
 */

interface CacheEntry {
  key: string;
  data: PageScan;
  timestamp: number;
  expiresAt: number;
}

export class PageCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  /**
   * Get cached page data if available and not expired
   */
  get(url: string): PageScan | null {
    const key = this.normalizeUrl(url);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Store page data in cache with TTL
   */
  set(url: string, data: PageScan, ttlMs?: number): void {
    const key = this.normalizeUrl(url);
    const ttl = ttlMs ?? this.defaultTTL;
    
    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });
  }
  
  /**
   * Check if URL is in cache and not expired
   */
  has(url: string): boolean {
    return this.get(url) !== null;
  }
  
  /**
   * Remove specific URL from cache
   */
  delete(url: string): boolean {
    const key = this.normalizeUrl(url);
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: Array<{ url: string; age: number; ttl: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.values()).map(entry => ({
      url: entry.data.url,
      age: now - entry.timestamp,
      ttl: entry.expiresAt - now
    }));
    
    return {
      size: this.cache.size,
      entries
    };
  }
  
  /**
   * Remove expired entries (garbage collection)
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
  
  /**
   * Normalize URL for cache key generation
   * Removes trailing slashes, fragments, and converts to lowercase
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove trailing slash and fragment
      const normalized = `${parsed.origin}${parsed.pathname}${parsed.search}`
        .replace(/\/$/, '')
        .toLowerCase();
      return normalized;
    } catch {
      // If URL parsing fails, just normalize the string
      return url.toLowerCase().replace(/\/$/, '').split('#')[0];
    }
  }
}

// Singleton instance for global cache
let globalCache: PageCache | null = null;

/**
 * Get the global page cache instance
 */
export function getPageCache(): PageCache {
  if (!globalCache) {
    globalCache = new PageCache();
  }
  return globalCache;
}

/**
 * Reset the global cache (useful for testing)
 */
export function resetPageCache(): void {
  globalCache = null;
}
