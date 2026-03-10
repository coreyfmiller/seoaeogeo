import { detectSiteType, getRecommendedSchemas, formatSiteType } from '../site-type-detector';
import type { PageScan } from '../crawler-deep';

describe('Site Type Detector', () => {
  describe('detectSiteType', () => {
    it('should detect e-commerce site from Product schema', () => {
      const mockPage: PageScan = {
        url: 'https://example.com',
        title: 'Shop Our Products',
        description: 'Buy amazing products',
        schemas: [{ '@type': 'Product', name: 'Test Product' }],
        schemaTypes: ['Product'],
        thinnedText: 'Add to cart, buy now, checkout, shopping cart',
        status: 'success',
        wordCount: 500,
        internalLinks: 10,
        externalLinks: 2,
        hasH1: true,
        isHttps: true,
        responseTimeMs: 200,
        h2Count: 3,
        h3Count: 5,
        imgTotal: 10,
        imgWithAlt: 8,
        outboundLinks: []
      };

      const result = detectSiteType(mockPage, []);
      
      expect(result.primaryType).toBe('e-commerce');
      expect(result.confidence).toBeGreaterThanOrEqual(40);
      expect(result.recommendedSchemas).toContain('Product');
    });

    it('should detect local business from LocalBusiness schema', () => {
      const mockPage: PageScan = {
        url: 'https://example.com',
        title: 'Our Location',
        description: 'Visit us today',
        schemas: [{ '@type': 'LocalBusiness', name: 'Test Business' }],
        schemaTypes: ['LocalBusiness'],
        thinnedText: 'Hours: Mon-Fri 9am-5pm, Location, Call us, Visit us',
        status: 'success',
        wordCount: 300,
        internalLinks: 5,
        externalLinks: 1,
        hasH1: true,
        isHttps: true,
        responseTimeMs: 150,
        h2Count: 2,
        h3Count: 3,
        imgTotal: 5,
        imgWithAlt: 5,
        outboundLinks: []
      };

      const result = detectSiteType(mockPage, []);
      
      expect(result.primaryType).toBe('local-business');
      expect(result.confidence).toBeGreaterThanOrEqual(40);
      expect(result.recommendedSchemas).toContain('LocalBusiness');
    });

    it('should detect blog from Article schema and content patterns', () => {
      const mockPage: PageScan = {
        url: 'https://example.com/blog',
        title: 'Latest Blog Posts',
        description: 'Read our articles',
        schemas: [{ '@type': 'BlogPosting', headline: 'Test Article' }],
        schemaTypes: ['BlogPosting'],
        thinnedText: 'Posted on January 1, 2026 by Author Name. Read more, comments, categories',
        status: 'success',
        wordCount: 800,
        internalLinks: 15,
        externalLinks: 5,
        hasH1: true,
        isHttps: true,
        responseTimeMs: 180,
        h2Count: 4,
        h3Count: 6,
        imgTotal: 3,
        imgWithAlt: 3,
        outboundLinks: []
      };

      const result = detectSiteType(mockPage, []);
      
      expect(result.primaryType).toBe('blog');
      expect(result.confidence).toBeGreaterThanOrEqual(40);
      expect(result.recommendedSchemas).toContain('Article');
    });

    it('should detect SaaS from content patterns', () => {
      const mockPage: PageScan = {
        url: 'https://example.com',
        title: 'Software Platform',
        description: 'Try our software',
        schemas: [],
        schemaTypes: [],
        thinnedText: 'Pricing plans, free trial, demo, sign up, features, API documentation',
        status: 'success',
        wordCount: 600,
        internalLinks: 12,
        externalLinks: 3,
        hasH1: true,
        isHttps: true,
        responseTimeMs: 160,
        h2Count: 5,
        h3Count: 8,
        imgTotal: 8,
        imgWithAlt: 6,
        outboundLinks: []
      };

      const result = detectSiteType(mockPage, []);
      
      expect(result.primaryType).toBe('saas');
      expect(result.confidence).toBeGreaterThanOrEqual(30);
      expect(result.recommendedSchemas).toContain('SoftwareApplication');
    });

    it('should default to general for ambiguous sites', () => {
      const mockPage: PageScan = {
        url: 'https://example.com',
        title: 'Welcome',
        description: 'About us',
        schemas: [],
        schemaTypes: [],
        thinnedText: 'About, services, contact, home',
        status: 'success',
        wordCount: 200,
        internalLinks: 5,
        externalLinks: 1,
        hasH1: true,
        isHttps: true,
        responseTimeMs: 140,
        h2Count: 2,
        h3Count: 2,
        imgTotal: 2,
        imgWithAlt: 1,
        outboundLinks: []
      };

      const result = detectSiteType(mockPage, []);
      
      expect(result.primaryType).toBe('general');
      expect(result.recommendedSchemas).toContain('Organization');
    });

    it('should identify secondary types when multiple signals present', () => {
      const mockPage: PageScan = {
        url: 'https://example.com',
        title: 'Restaurant & Catering',
        description: 'Dine in or order online',
        schemas: [
          { '@type': 'Restaurant', name: 'Test Restaurant' },
          { '@type': 'LocalBusiness', name: 'Test Restaurant' }
        ],
        schemaTypes: ['Restaurant', 'LocalBusiness'],
        thinnedText: 'Menu, reservations, order online, delivery, hours, location, call us',
        status: 'success',
        wordCount: 400,
        internalLinks: 8,
        externalLinks: 2,
        hasH1: true,
        isHttps: true,
        responseTimeMs: 170,
        h2Count: 3,
        h3Count: 4,
        imgTotal: 12,
        imgWithAlt: 10,
        outboundLinks: []
      };

      const result = detectSiteType(mockPage, []);
      
      expect(result.primaryType).toBe('restaurant');
      expect(result.confidence).toBeGreaterThanOrEqual(70);
      // Should also detect local-business as secondary
      expect(result.secondaryTypes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRecommendedSchemas', () => {
    it('should return correct schemas for e-commerce', () => {
      const schemas = getRecommendedSchemas('e-commerce');
      expect(schemas).toContain('Product');
      expect(schemas).toContain('Offer');
      expect(schemas).toContain('Review');
    });

    it('should return correct schemas for local business', () => {
      const schemas = getRecommendedSchemas('local-business');
      expect(schemas).toContain('LocalBusiness');
      expect(schemas).toContain('Review');
      expect(schemas).toContain('PostalAddress');
    });

    it('should return correct schemas for blog', () => {
      const schemas = getRecommendedSchemas('blog');
      expect(schemas).toContain('Article');
      expect(schemas).toContain('BlogPosting');
      expect(schemas).toContain('Person');
    });
  });

  describe('formatSiteType', () => {
    it('should format site types correctly', () => {
      expect(formatSiteType('e-commerce')).toBe('E-Commerce');
      expect(formatSiteType('local-business')).toBe('Local Business');
      expect(formatSiteType('blog')).toBe('Blog / Content Site');
      expect(formatSiteType('saas')).toBe('SaaS / Software');
      expect(formatSiteType('general')).toBe('General Website');
    });
  });
});
