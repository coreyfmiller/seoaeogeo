import { PageCache, getPageCache, resetPageCache } from '../page-cache';
import type { PageScan } from '../crawler-deep';

describe('PageCache', () => {
  let cache: PageCache;

  const createMockPage = (url: string): PageScan => ({
    url,
    title: 'Test Page',
    description: 'Test description',
    schemas: [],
    schemaTypes: [],
    thinnedText: 'Test content',
    status: 'success',
    wordCount: 500,
    internalLinks: 5,
    externalLinks: 2,
    hasH1: true,
    isHttps: true,
    responseTimeMs: 200,
    h2Count: 3,
    h3Count: 5,
    imgTotal: 10,
    imgWithAlt: 8,
    outboundLinks: []
  });

  beforeEach(() => {
    cache = new PageCache();
  });

  describe('set and get', () => {
    it('should store and retrieve page data', () => {
      const page = createMockPage('https://example.com');
      cache.set('https://example.com', page);

      const retrieved = cache.get('https://example.com');
      expect(retrieved).toEqual(page);
    });

    it('should return null for non-existent URLs', () => {
      const retrieved = cache.get('https://nonexistent.com');
      expect(retrieved).toBeNull();
    });

    it('should normalize URLs when storing and retrieving', () => {
      const page = createMockPage('https://example.com/page');
      
      cache.set('https://example.com/page/', page); // With trailing slash
      const retrieved = cache.get('https://example.com/page'); // Without trailing slash
      
      expect(retrieved).toEqual(page);
    });

    it('should handle URLs with fragments', () => {
      const page = createMockPage('https://example.com/page');
      
      cache.set('https://example.com/page#section', page);
      const retrieved = cache.get('https://example.com/page');
      
      expect(retrieved).toEqual(page);
    });
  });

  describe('expiration', () => {
    it('should return null for expired entries', () => {
      const page = createMockPage('https://example.com');
      const shortTTL = 100; // 100ms
      
      cache.set('https://example.com', page, shortTTL);
      
      // Should be available immediately
      expect(cache.get('https://example.com')).toEqual(page);
      
      // Wait for expiration
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.get('https://example.com')).toBeNull();
          resolve(undefined);
        }, 150);
      });
    });

    it('should not expire entries within TTL', () => {
      const page = createMockPage('https://example.com');
      const longTTL = 10000; // 10 seconds
      
      cache.set('https://example.com', page, longTTL);
      
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.get('https://example.com')).toEqual(page);
          resolve(undefined);
        }, 50);
      });
    });
  });

  describe('has', () => {
    it('should return true for cached URLs', () => {
      const page = createMockPage('https://example.com');
      cache.set('https://example.com', page);

      expect(cache.has('https://example.com')).toBe(true);
    });

    it('should return false for non-cached URLs', () => {
      expect(cache.has('https://nonexistent.com')).toBe(false);
    });

    it('should return false for expired entries', () => {
      const page = createMockPage('https://example.com');
      cache.set('https://example.com', page, 100);

      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.has('https://example.com')).toBe(false);
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe('delete', () => {
    it('should remove entries from cache', () => {
      const page = createMockPage('https://example.com');
      cache.set('https://example.com', page);

      expect(cache.has('https://example.com')).toBe(true);
      
      const deleted = cache.delete('https://example.com');
      expect(deleted).toBe(true);
      expect(cache.has('https://example.com')).toBe(false);
    });

    it('should return false when deleting non-existent entries', () => {
      const deleted = cache.delete('https://nonexistent.com');
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('https://example.com/page1', createMockPage('https://example.com/page1'));
      cache.set('https://example.com/page2', createMockPage('https://example.com/page2'));
      cache.set('https://example.com/page3', createMockPage('https://example.com/page3'));

      expect(cache.getStats().size).toBe(3);

      cache.clear();

      expect(cache.getStats().size).toBe(0);
      expect(cache.has('https://example.com/page1')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('https://example.com/page1', createMockPage('https://example.com/page1'));
      cache.set('https://example.com/page2', createMockPage('https://example.com/page2'));

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('url');
      expect(stats.entries[0]).toHaveProperty('age');
      expect(stats.entries[0]).toHaveProperty('ttl');
    });

    it('should show age and TTL correctly', () => {
      const page = createMockPage('https://example.com');
      cache.set('https://example.com', page, 10000);

      return new Promise(resolve => {
        setTimeout(() => {
          const stats = cache.getStats();
          expect(stats.entries[0].age).toBeGreaterThan(50);
          expect(stats.entries[0].ttl).toBeLessThan(10000);
          resolve(undefined);
        }, 100);
      });
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', () => {
      cache.set('https://example.com/page1', createMockPage('https://example.com/page1'), 100);
      cache.set('https://example.com/page2', createMockPage('https://example.com/page2'), 10000);

      return new Promise(resolve => {
        setTimeout(() => {
          const removed = cache.cleanup();
          
          expect(removed).toBe(1);
          expect(cache.has('https://example.com/page1')).toBe(false);
          expect(cache.has('https://example.com/page2')).toBe(true);
          resolve(undefined);
        }, 150);
      });
    });

    it('should return 0 when no entries are expired', () => {
      cache.set('https://example.com/page1', createMockPage('https://example.com/page1'), 10000);
      cache.set('https://example.com/page2', createMockPage('https://example.com/page2'), 10000);

      const removed = cache.cleanup();
      expect(removed).toBe(0);
    });
  });

  describe('global cache', () => {
    afterEach(() => {
      resetPageCache();
    });

    it('should return singleton instance', () => {
      const cache1 = getPageCache();
      const cache2 = getPageCache();

      expect(cache1).toBe(cache2);
    });

    it('should persist data across getInstance calls', () => {
      const cache1 = getPageCache();
      const page = createMockPage('https://example.com');
      cache1.set('https://example.com', page);

      const cache2 = getPageCache();
      expect(cache2.get('https://example.com')).toEqual(page);
    });

    it('should reset global cache', () => {
      const cache1 = getPageCache();
      cache1.set('https://example.com', createMockPage('https://example.com'));

      resetPageCache();

      const cache2 = getPageCache();
      expect(cache2.get('https://example.com')).toBeNull();
    });
  });
});
