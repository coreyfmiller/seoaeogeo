import type { PageScan } from './crawler-deep';
import type { Platform, PlatformType, SiteType } from './types/audit';

/**
 * Fix Generator
 * Generates implementation-ready code snippets and step-by-step instructions
 * for every recommendation, with platform-specific guidance.
 */

export interface FixInstruction {
  title: string;
  steps: InstructionStep[];
  code?: string;
  platform: PlatformType;
  estimatedTime: string;
  difficulty: 'easy' | 'moderate' | 'difficult';
  impact: 'high' | 'medium' | 'low';
  beforeAfter?: {
    before: string;
    after: string;
  };
  validationLinks?: ValidationLink[];
}

export interface InstructionStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  screenshot?: string;
  validationUrl?: string;
}

export interface ValidationLink {
  tool: string;
  url: string;
  description: string;
}

/**
 * Detect platform from page HTML and URL patterns
 */
export function detectPlatform(page: PageScan): Platform {
  const html = page.thinnedText.toLowerCase();
  const url = page.url.toLowerCase();
  
  // WordPress detection
  if (html.includes('wp-content') || html.includes('wordpress') || html.includes('wp-includes')) {
    return { type: 'wordpress', confidence: 95 };
  }
  
  // Shopify detection
  if (html.includes('shopify') || url.includes('myshopify.com') || html.includes('cdn.shopify.com')) {
    return { type: 'shopify', confidence: 95 };
  }
  
  // Next.js detection
  if (html.includes('__next') || html.includes('_next/static') || html.includes('next.js')) {
    return { type: 'nextjs', confidence: 90 };
  }
  
  // React detection (but not Next.js)
  if (html.includes('react') && !html.includes('__next')) {
    return { type: 'react', confidence: 80 };
  }
  
  // Default to custom HTML
  return { type: 'custom-html', confidence: 60 };
}

/**
 * Generate schema code with platform-specific formatting
 */
export function generateSchemaCode(
  schemaType: string,
  siteData: Partial<SiteData>,
  platform: PlatformType
): FixInstruction {
  const schema = buildSchemaObject(schemaType, siteData);
  const jsonLd = JSON.stringify(schema, null, 2);
  
  // Validate before returning
  try {
    JSON.parse(jsonLd);
  } catch (error) {
    throw new Error(`Generated invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  const code = formatCodeForPlatform(jsonLd, platform);
  const instructions = generateInstructions(schemaType, platform);
  
  return {
    title: `Add ${schemaType} Schema`,
    steps: instructions,
    code,
    platform,
    estimatedTime: '5-10 minutes',
    difficulty: 'easy',
    impact: 'high',
    validationLinks: [
      {
        tool: 'Google Rich Results Test',
        url: 'https://search.google.com/test/rich-results',
        description: 'Test your schema markup for rich results eligibility'
      },
      {
        tool: 'Schema.org Validator',
        url: 'https://validator.schema.org/',
        description: 'Validate your schema against schema.org specifications'
      }
    ]
  };
}

/**
 * Build schema object with pre-populated data
 */
export function buildSchemaObject(type: string, siteData: Partial<SiteData>): any {
  const base = {
    '@context': 'https://schema.org',
    '@type': type
  };
  
  if (type === 'LocalBusiness') {
    return {
      ...base,
      name: siteData.businessName || '[Your Business Name]',
      image: siteData.logoUrl || '[URL to your logo]',
      '@id': siteData.url || '[Your website URL]',
      url: siteData.url || '[Your website URL]',
      telephone: siteData.phone || '[+1-XXX-XXX-XXXX]',
      priceRange: siteData.priceRange || '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteData.address?.street || '[Street Address]',
        addressLocality: siteData.address?.city || '[City]',
        addressRegion: siteData.address?.region || '[State/Province]',
        postalCode: siteData.address?.postal || '[Postal Code]',
        addressCountry: siteData.address?.country || '[Country Code]'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: siteData.geo?.latitude || '[Latitude]',
        longitude: siteData.geo?.longitude || '[Longitude]'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '17:00'
        }
      ]
    };
  }
  
  if (type === 'Product') {
    return {
      ...base,
      name: siteData.productName || '[Product Name]',
      image: siteData.productImage || '[Product Image URL]',
      description: siteData.productDescription || '[Product Description]',
      sku: siteData.sku || '[SKU]',
      brand: {
        '@type': 'Brand',
        name: siteData.brandName || '[Brand Name]'
      },
      offers: {
        '@type': 'Offer',
        url: siteData.url || '[Product URL]',
        priceCurrency: siteData.currency || 'USD',
        price: siteData.price || '[Price]',
        availability: 'https://schema.org/InStock',
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
  }
  
  if (type === 'Article' || type === 'BlogPosting') {
    return {
      ...base,
      '@type': type,
      headline: siteData.headline || '[Article Headline]',
      image: siteData.articleImage || '[Article Image URL]',
      author: {
        '@type': 'Person',
        name: siteData.authorName || '[Author Name]',
        url: siteData.authorUrl || '[Author Profile URL]'
      },
      publisher: {
        '@type': 'Organization',
        name: siteData.publisherName || '[Publisher Name]',
        logo: {
          '@type': 'ImageObject',
          url: siteData.publisherLogo || '[Publisher Logo URL]'
        }
      },
      datePublished: siteData.datePublished || new Date().toISOString(),
      dateModified: siteData.dateModified || new Date().toISOString()
    };
  }
  
  if (type === 'FAQPage') {
    return {
      ...base,
      mainEntity: [
        {
          '@type': 'Question',
          name: '[Question 1]',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '[Answer 1]'
          }
        },
        {
          '@type': 'Question',
          name: '[Question 2]',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '[Answer 2]'
          }
        }
      ]
    };
  }
  
  if (type === 'Organization') {
    return {
      ...base,
      name: siteData.organizationName || '[Organization Name]',
      url: siteData.url || '[Website URL]',
      logo: siteData.logoUrl || '[Logo URL]',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: siteData.phone || '[Phone Number]',
        contactType: 'customer service',
        areaServed: siteData.areaServed || '[Country/Region]',
        availableLanguage: siteData.language || 'en'
      },
      sameAs: siteData.socialLinks || [
        '[Facebook URL]',
        '[Twitter URL]',
        '[LinkedIn URL]'
      ]
    };
  }
  
  if (type === 'Restaurant') {
    return {
      ...base,
      name: siteData.restaurantName || '[Restaurant Name]',
      image: siteData.restaurantImage || '[Restaurant Image URL]',
      '@id': siteData.url || '[Restaurant URL]',
      url: siteData.url || '[Restaurant URL]',
      telephone: siteData.phone || '[Phone Number]',
      priceRange: siteData.priceRange || '$$',
      servesCuisine: siteData.cuisine || '[Cuisine Type]',
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteData.address?.street || '[Street Address]',
        addressLocality: siteData.address?.city || '[City]',
        addressRegion: siteData.address?.region || '[State]',
        postalCode: siteData.address?.postal || '[Postal Code]',
        addressCountry: siteData.address?.country || '[Country]'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '11:00',
          closes: '22:00'
        }
      ],
      menu: siteData.menuUrl || '[Menu URL]'
    };
  }
  
  // Default fallback
  return base;
}

/**
 * Format code for specific platform
 */
function formatCodeForPlatform(jsonLd: string, platform: PlatformType): string {
  if (platform === 'nextjs') {
    return `// Add to your page.tsx or layout.tsx
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(${jsonLd})
        }}
      />
      {/* Your page content */}
    </>
  );
}`;
  }
  
  if (platform === 'react') {
    return `// Add to your component
import { Helmet } from 'react-helmet';

function YourComponent() {
  const schema = ${jsonLd};
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>
      {/* Your component content */}
    </>
  );
}`;
  }
  
  // WordPress, Shopify, and custom HTML all use the same format
  return `<script type="application/ld+json">
${jsonLd}
</script>`;
}

/**
 * Generate platform-specific instructions
 */
function generateInstructions(schemaType: string, platform: PlatformType): InstructionStep[] {
  const steps: InstructionStep[] = [];
  
  if (platform === 'wordpress') {
    steps.push({
      step: 1,
      title: 'Install a Schema Plugin',
      description: 'Install and activate a schema plugin like Yoast SEO, Rank Math, or Schema Pro from the WordPress plugin directory.',
      validationUrl: 'https://wordpress.org/plugins/search/schema/'
    });
    steps.push({
      step: 2,
      title: 'Navigate to Schema Settings',
      description: 'Go to your plugin\'s schema settings page (usually under SEO > Schema or similar).'
    });
    steps.push({
      step: 3,
      title: 'Add New Schema',
      description: 'Click "Add New Schema" or similar button, select the schema type, and paste the JSON-LD code from above.'
    });
  } else if (platform === 'shopify') {
    steps.push({
      step: 1,
      title: 'Access Theme Editor',
      description: 'Go to Online Store > Themes > Actions > Edit Code in your Shopify admin.'
    });
    steps.push({
      step: 2,
      title: 'Edit theme.liquid',
      description: 'Find and open the theme.liquid file in the Layout folder.'
    });
    steps.push({
      step: 3,
      title: 'Add Schema Code',
      description: 'Paste the schema code in the <head> section, just before the closing </head> tag.'
    });
  } else if (platform === 'nextjs') {
    steps.push({
      step: 1,
      title: 'Open Your Page Component',
      description: 'Navigate to the page file where you want to add the schema (e.g., app/page.tsx or pages/index.tsx).'
    });
    steps.push({
      step: 2,
      title: 'Add Schema Script',
      description: 'Copy the code above and paste it into your component\'s return statement.'
    });
    steps.push({
      step: 3,
      title: 'Replace Placeholder Data',
      description: 'Update all placeholder values (marked with [brackets]) with your actual data.'
    });
  } else if (platform === 'react') {
    steps.push({
      step: 1,
      title: 'Install react-helmet',
      description: 'Run: npm install react-helmet @types/react-helmet'
    });
    steps.push({
      step: 2,
      title: 'Add Schema to Component',
      description: 'Copy the code above and paste it into your component file.'
    });
    steps.push({
      step: 3,
      title: 'Update Placeholder Data',
      description: 'Replace all placeholder values with your actual data.'
    });
  } else {
    // custom-html
    steps.push({
      step: 1,
      title: 'Open Your HTML File',
      description: 'Open the HTML file you want to add schema to in your code editor.'
    });
    steps.push({
      step: 2,
      title: 'Add to <head> Section',
      description: 'Paste the schema code in the <head> section, just before the closing </head> tag.'
    });
    steps.push({
      step: 3,
      title: 'Replace Placeholder Data',
      description: 'Update all placeholder values (marked with [brackets]) with your actual information.'
    });
  }
  
  // Common final steps for all platforms
  steps.push({
    step: steps.length + 1,
    title: 'Save and Deploy',
    description: 'Save your changes and deploy/publish your site.'
  });
  
  steps.push({
    step: steps.length + 1,
    title: 'Validate Your Schema',
    description: 'Use Google Rich Results Test to verify your schema is working correctly.',
    validationUrl: 'https://search.google.com/test/rich-results'
  });
  
  return steps;
}

/**
 * Site data interface for schema generation
 */
export interface SiteData {
  url?: string;
  businessName?: string;
  organizationName?: string;
  restaurantName?: string;
  productName?: string;
  brandName?: string;
  headline?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  productImage?: string;
  articleImage?: string;
  restaurantImage?: string;
  productDescription?: string;
  priceRange?: string;
  currency?: string;
  price?: string;
  sku?: string;
  cuisine?: string;
  menuUrl?: string;
  authorName?: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
  datePublished?: string;
  dateModified?: string;
  areaServed?: string;
  language?: string;
  socialLinks?: string[];
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postal?: string;
    country?: string;
  };
  geo?: {
    latitude?: string;
    longitude?: string;
  };
}

/**
 * Validate generated schema code
 */
export function validateGeneratedCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Extract JSON from code
    let json = code;
    
    // For Next.js format, extract the JSON object
    if (code.includes('JSON.stringify(')) {
      const match = code.match(/JSON\.stringify\(([\s\S]*?)\)/);
      if (match) {
        json = match[1];
      }
    }
    
    // For HTML script tag format, extract content
    if (code.includes('<script type="application/ld+json">')) {
      const match = code.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
      if (match) {
        json = match[1];
      }
    }
    
    // Parse JSON
    const parsed = JSON.parse(json);
    
    // Validate required fields
    if (!parsed['@context']) {
      errors.push('Missing @context property');
    }
    if (!parsed['@type']) {
      errors.push('Missing @type property');
    }
    
    // Check for placeholder data
    const jsonString = JSON.stringify(parsed);
    if (jsonString.includes('[') && jsonString.includes(']')) {
      errors.push('Contains placeholder data - remember to replace values in [brackets]');
    }
    
  } catch (error) {
    errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
