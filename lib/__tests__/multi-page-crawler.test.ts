import {
  buildInternalLinkGraph,
  detectOrphans,
  detectDuplicates,
  aggregateSiteWideIssues,
  simpleHash,
  normalizeUrl,
  prioritizePages
} from '../multi-page-crawler';
import type { PageScan } from '../crawler-deep';

describe('Multi-Page Crawler', () => {
  const createMockPage = (overrides: Partial<PageScan> = {}): PageScan => ({
    url: 'https://example.com',
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
    outboundLinks: [],
    ...overrides
  });

  describe('buildInternalLinkGraph', () => {
    it('should count inbound links correctly', () => {
      const pages: PageScan[] = [
        createMockPage({ 
          url: 'https://example.com/', 
          outboundLinks: ['https://example.com/about', 'https://example.com/contact']
        }),
        createMockPage({ 
          url: 'https://example.com/about', 
          outboundLinks: ['https://example.com/contact']
        }),
        createMockPage({ 
          url: 'https://example.com/contact', 
          outboundLinks: []
        })
      ];

      const linkGraph = buildInternalLinkGraph(pages);

      expect(linkGraph.get('https://example.com')).toBe(0); // Homepage has no inbound
      expect(linkGraph.get('https://example.com/about')).toBe(1); // One inbound from homepage
      expect(linkGraph.get('https://example.com/contact')).toBe(2); // Two inbound links
    });

    it('should handle pages with no outbound links', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/', outboundLinks: [] }),
        createMockPage({ url: 'https://example.com/page1', outboundLinks: [] })
      ];

      const linkGraph = buildInternalLinkGraph(pages);

      expect(linkGraph.get('https://example.com')).toBe(0);
      expect(linkGraph.get('https://example.com/page1')).toBe(0);
    });
  });

  describe('detectOrphans', () => {
    it('should identify pages with 0 inbound links as critical orphans', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/' }),
        createMockPage({ url: 'https://example.com/orphan' })
      ];

      const linkGraph = new Map([
        ['https://example.com', 0],
        ['https://example.com/orphan', 0]
      ]);

      const orphans = detectOrphans(pages, linkGraph);

      expect(orphans).toHaveLength(1);
      expect(orphans[0].url).toBe('https://example.com/orphan');
      expect(orphans[0].severity).toBe('critical');
      expect(orphans[0].inboundCount).toBe(0);
    });

    it('should identify pages with 1 inbound link as medium severity orphans', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/' }),
        createMockPage({ url: 'https://example.com/page1' })
      ];

      const linkGraph = new Map([
        ['https://example.com', 0],
        ['https://example.com/page1', 1]
      ]);

      const orphans = detectOrphans(pages, linkGraph);

      expect(orphans).toHaveLength(1);
      expect(orphans[0].severity).toBe('medium');
    });

    it('should not flag homepage as orphan', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/' })
      ];

      const linkGraph = new Map([
        ['https://example.com', 0]
      ]);

      const orphans = detectOrphans(pages, linkGraph);

      expect(orphans).toHaveLength(0);
    });

    it('should not flag well-linked pages as orphans', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/' }),
        createMockPage({ url: 'https://example.com/page1' })
      ];

      const linkGraph = new Map([
        ['https://example.com', 0],
        ['https://example.com/page1', 5]
      ]);

      const orphans = detectOrphans(pages, linkGraph);

      expect(orphans).toHaveLength(0);
    });
  });

  describe('detectDuplicates', () => {
    it('should detect pages with identical content', () => {
      const pages: PageScan[] = [
        createMockPage({ 
          url: 'https://example.com/page1', 
          thinnedText: 'This is the same content repeated'
        }),
        createMockPage({ 
          url: 'https://example.com/page2', 
          thinnedText: 'This is the same content repeated'
        })
      ];

      const duplicates = detectDuplicates(pages);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].pages).toHaveLength(2);
      expect(duplicates[0].pages).toContain('https://example.com/page1');
      expect(duplicates[0].pages).toContain('https://example.com/page2');
      expect(duplicates[0].similarity).toBe('high');
    });

    it('should not flag unique content as duplicates', () => {
      const pages: PageScan[] = [
        createMockPage({ 
          url: 'https://example.com/page1', 
          thinnedText: 'Unique content for page 1'
        }),
        createMockPage({ 
          url: 'https://example.com/page2', 
          thinnedText: 'Different content for page 2'
        })
      ];

      const duplicates = detectDuplicates(pages);

      expect(duplicates).toHaveLength(0);
    });

    it('should group multiple duplicates together', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/page1', thinnedText: 'Same' }),
        createMockPage({ url: 'https://example.com/page2', thinnedText: 'Same' }),
        createMockPage({ url: 'https://example.com/page3', thinnedText: 'Same' })
      ];

      const duplicates = detectDuplicates(pages);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].pages).toHaveLength(3);
    });
  });

  describe('aggregateSiteWideIssues', () => {
    it('should detect missing H1 tags', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/page1', hasH1: false }),
        createMockPage({ url: 'https://example.com/page2', hasH1: false }),
        createMockPage({ url: 'https://example.com/page3', hasH1: true })
      ];

      const issues = aggregateSiteWideIssues(pages, [], []);

      const h1Issue = issues.find(i => i.type === 'missing-h1');
      expect(h1Issue).toBeDefined();
      expect(h1Issue?.count).toBe(2);
      expect(h1Issue?.affectedPages).toHaveLength(2);
    });

    it('should detect thin content', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/page1', wordCount: 100 }),
        createMockPage({ url: 'https://example.com/page2', wordCount: 200 }),
        createMockPage({ url: 'https://example.com/page3', wordCount: 500 })
      ];

      const issues = aggregateSiteWideIssues(pages, [], []);

      const thinIssue = issues.find(i => i.type === 'thin-content');
      expect(thinIssue).toBeDefined();
      expect(thinIssue?.count).toBe(2);
    });

    it('should detect missing meta descriptions', () => {
      const pages: PageScan[] = [
        createMockPage({ url: 'https://example.com/page1', description: '' }),
        createMockPage({ url: 'https://example.com/page2', description: 'Has description' })
      ];

      const issues = aggregateSiteWideIssues(pages, [], []);

      const metaIssue = issues.find(i => i.type === 'missing-meta');
      expect(metaIssue).toBeDefined();
      expect(metaIssue?.count).toBe(1);
    });

    it('should detect poor image alt coverage', () => {
      const pages: PageScan[] = [
        createMockPage({ 
          url: 'https://example.com/page1', 
          imgTotal: 10, 
          imgWithAlt: 3 // 30% coverage
        }),
        createMockPage({ 
          url: 'https://example.com/page2', 
          imgTotal: 10, 
          imgWithAlt: 9 // 90% coverage
        })
      ];

      const issues = aggregateSiteWideIssues(pages, [], []);

      const altIssue = issues.find(i => i.type === 'poor-alt-coverage');
      expect(altIssue).toBeDefined();
      expect(altIssue?.count).toBe(1);
    });

    it('should include orphan pages in issues', () => {
      const pages: PageScan[] = [createMockPage()];
      const orphans = [
        { url: 'https://example.com/orphan', inboundCount: 0, severity: 'critical' as const }
      ];

      const issues = aggregateSiteWideIssues(pages, orphans, []);

      const orphanIssue = issues.find(i => i.type === 'orphan-pages');
      expect(orphanIssue).toBeDefined();
      expect(orphanIssue?.count).toBe(1);
      expect(orphanIssue?.severity).toBe('critical');
    });

    it('should include duplicate content in issues', () => {
      const pages: PageScan[] = [createMockPage()];
      const duplicates = [
        {
          pages: ['https://example.com/page1', 'https://example.com/page2'],
          similarity: 'high' as const,
          recommendation: 'Consolidate'
        }
      ];

      const issues = aggregateSiteWideIssues(pages, [], duplicates);

      const dupIssue = issues.find(i => i.type === 'duplicate-content');
      expect(dupIssue).toBeDefined();
      expect(dupIssue?.count).toBe(2);
    });
  });

  describe('simpleHash', () => {
    it('should generate same hash for identical content', () => {
      const text1 = 'This is test content';
      const text2 = 'This is test content';

      expect(simpleHash(text1)).toBe(simpleHash(text2));
    });

    it('should generate different hashes for different content', () => {
      const text1 = 'This is test content';
      const text2 = 'This is different content';

      expect(simpleHash(text1)).not.toBe(simpleHash(text2));
    });

    it('should ignore whitespace differences', () => {
      const text1 = 'This   is   test   content';
      const text2 = 'This is test content';

      expect(simpleHash(text1)).toBe(simpleHash(text2));
    });

    it('should be case-insensitive', () => {
      const text1 = 'This Is Test Content';
      const text2 = 'this is test content';

      expect(simpleHash(text1)).toBe(simpleHash(text2));
    });
  });

  describe('normalizeUrl', () => {
    it('should remove trailing slashes', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com/page/')).toBe('https://example.com/page');
    });

    it('should convert to lowercase', () => {
      expect(normalizeUrl('https://Example.COM/Page')).toBe('https://example.com/page');
    });

    it('should remove fragments', () => {
      expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
    });

    it('should handle invalid URLs gracefully', () => {
      expect(normalizeUrl('not-a-url')).toBe('not-a-url');
    });
  });

  describe('prioritizePages', () => {
    it('should prioritize important page types', () => {
      const links = [
        'https://example.com/privacy',
        'https://example.com/about',
        'https://example.com/random'
      ];

      const prioritized = prioritizePages(links, 'https://example.com');

      expect(prioritized[0]).toBe('https://example.com/about');
    });

    it('should prioritize shorter URLs', () => {
      const links = [
        'https://example.com/a/b/c/d/e',
        'https://example.com/page',
        'https://example.com/a/b/c'
      ];

      const prioritized = prioritizePages(links, 'https://example.com');

      expect(prioritized[0]).toBe('https://example.com/page');
    });

    it('should deprioritize legal pages', () => {
      const links = [
        'https://example.com/privacy',
        'https://example.com/terms',
        'https://example.com/page'
      ];

      const prioritized = prioritizePages(links, 'https://example.com');

      expect(prioritized[prioritized.length - 1]).toMatch(/privacy|terms/);
    });
  });
});
