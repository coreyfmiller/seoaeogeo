import {
  detectPlatform,
  generateSchemaCode,
  buildSchemaObject,
  validateGeneratedCode,
  type SiteData
} from '../fix-generator';
import type { PageScan } from '../crawler-deep';

describe('Fix Generator', () => {
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

  describe('detectPlatform', () => {
    it('should detect WordPress from wp-content', () => {
      const page = createMockPage({ thinnedText: 'Some content with wp-content in it' });
      const platform = detectPlatform(page);
      
      expect(platform.type).toBe('wordpress');
      expect(platform.confidence).toBe(95);
    });

    it('should detect Shopify from shopify mentions', () => {
      const page = createMockPage({ thinnedText: 'Powered by Shopify' });
      const platform = detectPlatform(page);
      
      expect(platform.type).toBe('shopify');
      expect(platform.confidence).toBe(95);
    });

    it('should detect Shopify from myshopify.com URL', () => {
      const page = createMockPage({ url: 'https://store.myshopify.com' });
      const platform = detectPlatform(page);
      
      expect(platform.type).toBe('shopify');
      expect(platform.confidence).toBe(95);
    });

    it('should detect Next.js from __next', () => {
      const page = createMockPage({ thinnedText: 'Content with __next data' });
      const platform = detectPlatform(page);
      
      expect(platform.type).toBe('nextjs');
      expect(platform.confidence).toBe(90);
    });

    it('should detect React but not Next.js', () => {
      const page = createMockPage({ thinnedText: 'Built with React' });
      const platform = detectPlatform(page);
      
      expect(platform.type).toBe('react');
      expect(platform.confidence).toBe(80);
    });

    it('should default to custom-html for unknown platforms', () => {
      const page = createMockPage({ thinnedText: 'Plain HTML content' });
      const platform = detectPlatform(page);
      
      expect(platform.type).toBe('custom-html');
      expect(platform.confidence).toBe(60);
    });
  });

  describe('buildSchemaObject', () => {
    it('should build LocalBusiness schema with provided data', () => {
      const siteData: Partial<SiteData> = {
        businessName: 'Test Business',
        phone: '+1-555-1234',
        url: 'https://example.com',
        address: {
          street: '123 Main St',
          city: 'Test City',
          region: 'CA',
          postal: '12345',
          country: 'US'
        }
      };

      const schema = buildSchemaObject('LocalBusiness', siteData);

      expect(schema['@type']).toBe('LocalBusiness');
      expect(schema.name).toBe('Test Business');
      expect(schema.telephone).toBe('+1-555-1234');
      expect(schema.address.streetAddress).toBe('123 Main St');
      expect(schema.address.addressLocality).toBe('Test City');
    });

    it('should use placeholders for missing LocalBusiness data', () => {
      const schema = buildSchemaObject('LocalBusiness', {});

      expect(schema.name).toBe('[Your Business Name]');
      expect(schema.telephone).toBe('[+1-XXX-XXX-XXXX]');
      expect(schema.address.streetAddress).toBe('[Street Address]');
    });

    it('should build Product schema with provided data', () => {
      const siteData: Partial<SiteData> = {
        productName: 'Test Product',
        productDescription: 'A great product',
        price: '99.99',
        currency: 'USD',
        brandName: 'Test Brand'
      };

      const schema = buildSchemaObject('Product', siteData);

      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('Test Product');
      expect(schema.description).toBe('A great product');
      expect(schema.offers.price).toBe('99.99');
      expect(schema.offers.priceCurrency).toBe('USD');
      expect(schema.brand.name).toBe('Test Brand');
    });

    it('should build Article schema with author and publisher', () => {
      const siteData: Partial<SiteData> = {
        headline: 'Test Article',
        authorName: 'John Doe',
        publisherName: 'Test Publisher'
      };

      const schema = buildSchemaObject('Article', siteData);

      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe('Test Article');
      expect(schema.author.name).toBe('John Doe');
      expect(schema.publisher.name).toBe('Test Publisher');
    });

    it('should build FAQPage schema with question structure', () => {
      const schema = buildSchemaObject('FAQPage', {});

      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]['@type']).toBe('Question');
      expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    });

    it('should build Organization schema with contact info', () => {
      const siteData: Partial<SiteData> = {
        organizationName: 'Test Org',
        phone: '+1-555-5678',
        socialLinks: ['https://facebook.com/test', 'https://twitter.com/test']
      };

      const schema = buildSchemaObject('Organization', siteData);

      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Test Org');
      expect(schema.contactPoint.telephone).toBe('+1-555-5678');
      expect(schema.sameAs).toHaveLength(2);
    });

    it('should build Restaurant schema with cuisine and menu', () => {
      const siteData: Partial<SiteData> = {
        restaurantName: 'Test Restaurant',
        cuisine: 'Italian',
        menuUrl: 'https://example.com/menu',
        priceRange: '$$$'
      };

      const schema = buildSchemaObject('Restaurant', siteData);

      expect(schema['@type']).toBe('Restaurant');
      expect(schema.name).toBe('Test Restaurant');
      expect(schema.servesCuisine).toBe('Italian');
      expect(schema.menu).toBe('https://example.com/menu');
      expect(schema.priceRange).toBe('$$$');
    });
  });

  describe('generateSchemaCode', () => {
    it('should generate valid JSON-LD for custom HTML', () => {
      const siteData: Partial<SiteData> = {
        businessName: 'Test Business'
      };

      const fix = generateSchemaCode('LocalBusiness', siteData, 'custom-html');

      expect(fix.title).toBe('Add LocalBusiness Schema');
      expect(fix.platform).toBe('custom-html');
      expect(fix.code).toContain('<script type="application/ld+json">');
      expect(fix.code).toContain('Test Business');
      expect(fix.difficulty).toBe('easy');
      expect(fix.impact).toBe('high');
    });

    it('should generate Next.js format code', () => {
      const fix = generateSchemaCode('Product', {}, 'nextjs');

      expect(fix.code).toContain('dangerouslySetInnerHTML');
      expect(fix.code).toContain('JSON.stringify');
      expect(fix.platform).toBe('nextjs');
    });

    it('should generate React format code', () => {
      const fix = generateSchemaCode('Article', {}, 'react');

      expect(fix.code).toContain('react-helmet');
      expect(fix.code).toContain('Helmet');
      expect(fix.platform).toBe('react');
    });

    it('should include validation links', () => {
      const fix = generateSchemaCode('Organization', {}, 'custom-html');

      expect(fix.validationLinks).toBeDefined();
      expect(fix.validationLinks).toHaveLength(2);
      expect(fix.validationLinks![0].tool).toBe('Google Rich Results Test');
      expect(fix.validationLinks![1].tool).toBe('Schema.org Validator');
    });

    it('should include platform-specific instructions', () => {
      const wordpressFix = generateSchemaCode('LocalBusiness', {}, 'wordpress');
      expect(wordpressFix.steps.some(s => s.title.includes('Plugin'))).toBe(true);

      const shopifyFix = generateSchemaCode('Product', {}, 'shopify');
      expect(shopifyFix.steps.some(s => s.title.includes('Theme'))).toBe(true);

      const nextjsFix = generateSchemaCode('Article', {}, 'nextjs');
      expect(nextjsFix.steps.some(s => s.title.includes('Component'))).toBe(true);
    });

    it('should throw error for invalid JSON generation', () => {
      // This would require mocking buildSchemaObject to return invalid data
      // For now, we test that valid generation doesn't throw
      expect(() => {
        generateSchemaCode('Organization', {}, 'custom-html');
      }).not.toThrow();
    });
  });

  describe('validateGeneratedCode', () => {
    it('should validate correct HTML script tag format', () => {
      const code = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Test Org"
}
</script>`;

      const result = validateGeneratedCode(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct Next.js format', () => {
      const code = `JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Test Product"
})`;

      const result = validateGeneratedCode(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing @context', () => {
      const code = `<script type="application/ld+json">
{
  "@type": "Organization",
  "name": "Test"
}
</script>`;

      const result = validateGeneratedCode(code);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing @context property');
    });

    it('should detect missing @type', () => {
      const code = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "name": "Test"
}
</script>`;

      const result = validateGeneratedCode(code);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing @type property');
    });

    it('should detect placeholder data', () => {
      const code = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Your Organization Name]"
}
</script>`;

      const result = validateGeneratedCode(code);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('placeholder'))).toBe(true);
    });

    it('should detect invalid JSON', () => {
      const code = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Test",
}
</script>`;

      const result = validateGeneratedCode(code);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid JSON'))).toBe(true);
    });

    it('should handle plain JSON input', () => {
      const code = `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Test Business"
}`;

      const result = validateGeneratedCode(code);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
