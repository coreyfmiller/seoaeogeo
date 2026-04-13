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


// ---------------------------------------------------------------------------
// Open Graph & Twitter Card Generator
// ---------------------------------------------------------------------------

export interface OgTwitterData {
  url: string;
  title: string;
  description: string;
  siteName?: string;
  imageUrl?: string;
  type?: 'website' | 'article' | 'product';
  twitterHandle?: string;
}

export function generateOgTwitterTags(
  data: OgTwitterData,
  platform: PlatformType
): FixInstruction {
  const ogType = data.type || 'website';
  const desc = data.description.length > 160
    ? data.description.slice(0, 157) + '...'
    : data.description;

  const tags = [
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${data.url}" />`,
    `<meta property="og:title" content="${data.title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    data.siteName ? `<meta property="og:site_name" content="${data.siteName}" />` : null,
    data.imageUrl ? `<meta property="og:image" content="${data.imageUrl}" />` : `<meta property="og:image" content="[URL to your social sharing image — 1200x630px recommended]" />`,
    '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${data.title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    data.imageUrl ? `<meta name="twitter:image" content="${data.imageUrl}" />` : `<meta name="twitter:image" content="[URL to your social sharing image]" />`,
    data.twitterHandle ? `<meta name="twitter:site" content="${data.twitterHandle}" />` : null,
  ].filter(Boolean).join('\n');

  let code = tags;
  if (platform === 'nextjs') {
    code = `// In your page.tsx or layout.tsx — use the Metadata API:
export const metadata = {
  openGraph: {
    type: '${ogType}',
    url: '${data.url}',
    title: '${data.title}',
    description: '${desc}',${data.siteName ? `\n    siteName: '${data.siteName}',` : ''}
    images: ['${data.imageUrl || '[Your OG image URL]'}'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '${data.title}',
    description: '${desc}',
    images: ['${data.imageUrl || '[Your Twitter image URL]'}'],${data.twitterHandle ? `\n    site: '${data.twitterHandle}',` : ''}
  },
};`;
  }

  const steps: InstructionStep[] = [];
  if (platform === 'wordpress') {
    steps.push({ step: 1, title: 'Use Yoast SEO or RankMath', description: 'Both plugins auto-generate OG and Twitter tags. Go to the page editor > SEO section > Social tab. Fill in the title, description, and upload a social sharing image (1200x630px).' });
    steps.push({ step: 2, title: 'Or add manually', description: 'If not using a plugin, paste the code below into your theme\'s header.php inside the <head> tag.' });
  } else if (platform === 'shopify') {
    steps.push({ step: 1, title: 'Edit theme.liquid', description: 'Go to Online Store > Themes > Edit Code > Layout > theme.liquid. Paste the tags inside <head> before </head>.' });
    steps.push({ step: 2, title: 'Use Liquid variables', description: 'For dynamic pages, replace hardcoded values with Liquid: {{ page.title }}, {{ page.description }}, {{ page.url }}.' });
  } else if (platform === 'nextjs') {
    steps.push({ step: 1, title: 'Add to your Metadata export', description: 'In your page.tsx or layout.tsx, add the openGraph and twitter fields to your metadata export as shown above.' });
  } else {
    steps.push({ step: 1, title: 'Add to <head>', description: 'Paste the meta tags below inside your <head> section, before the closing </head> tag.' });
  }
  steps.push({ step: steps.length + 1, title: 'Add a social sharing image', description: 'Create a 1200x630px image for social previews. This is what shows when your link is shared on Facebook, Twitter, LinkedIn, etc.' });
  steps.push({ step: steps.length + 1, title: 'Validate', description: 'Test your tags with the Facebook Sharing Debugger and Twitter Card Validator.', validationUrl: 'https://developers.facebook.com/tools/debug/' });

  return {
    title: 'Add Open Graph & Twitter Card Tags',
    steps,
    code,
    platform,
    estimatedTime: '5-10 minutes',
    difficulty: 'easy',
    impact: 'medium',
    validationLinks: [
      { tool: 'Facebook Sharing Debugger', url: 'https://developers.facebook.com/tools/debug/', description: 'Preview how your page appears when shared on Facebook' },
      { tool: 'Twitter Card Validator', url: 'https://cards-dev.twitter.com/validator', description: 'Preview your Twitter Card' },
    ],
  };
}

// ---------------------------------------------------------------------------
// Canonical Tag Generator
// ---------------------------------------------------------------------------

export function generateCanonicalTag(
  pageUrl: string,
  platform: PlatformType
): FixInstruction {
  // Normalize URL: ensure https, strip trailing slash for consistency
  const canonical = pageUrl.replace(/\/$/, '');

  let code = `<link rel="canonical" href="${canonical}" />`;

  if (platform === 'nextjs') {
    code = `// In your page.tsx or layout.tsx:
export const metadata = {
  alternates: {
    canonical: '${canonical}',
  },
};`;
  }

  const steps: InstructionStep[] = [];
  if (platform === 'wordpress') {
    steps.push({ step: 1, title: 'Use Yoast SEO or RankMath', description: 'Edit the page > scroll to the SEO section > Advanced tab > "Canonical URL" field. Enter the preferred URL for this page. The plugin handles the <link> tag automatically.' });
    steps.push({ step: 2, title: 'Or add manually', description: 'If not using a plugin, add the tag below to your theme\'s header.php inside <head>.' });
  } else if (platform === 'shopify') {
    steps.push({ step: 1, title: 'Shopify handles canonicals automatically', description: 'Shopify adds canonical tags by default. If you need to override, edit theme.liquid and add the tag in <head>. Remove the existing {{ canonical_tag }} Liquid tag first to avoid duplicates.' });
  } else if (platform === 'nextjs') {
    steps.push({ step: 1, title: 'Add to Metadata', description: 'Add the alternates.canonical field to your metadata export in page.tsx or layout.tsx as shown above.' });
  } else {
    steps.push({ step: 1, title: 'Add to <head>', description: 'Paste the canonical link tag inside your <head> section. Ensure only ONE canonical tag exists per page.' });
  }
  steps.push({ step: steps.length + 1, title: 'Verify', description: 'View page source and search for "canonical" to confirm the tag is present and points to the correct URL.' });

  return {
    title: 'Add Canonical Tag',
    steps,
    code,
    platform,
    estimatedTime: '2-5 minutes',
    difficulty: 'easy',
    impact: 'high',
    validationLinks: [
      { tool: 'Google Search Console', url: 'https://search.google.com/search-console', description: 'Check for canonical issues under Coverage > Excluded' },
    ],
  };
}

// ---------------------------------------------------------------------------
// robots.txt Generator
// ---------------------------------------------------------------------------

export function generateRobotsTxt(
  siteUrl: string,
  platform: PlatformType
): FixInstruction {
  const baseUrl = siteUrl.replace(/\/+$/, '');

  const robotsTxtByPlatform: Record<string, string> = {
    wordpress: `User-agent: *
Allow: /
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-json/
Disallow: /xmlrpc.php
Disallow: /?s=
Disallow: /search/
Allow: /wp-admin/admin-ajax.php

# Sitemaps
Sitemap: ${baseUrl}/sitemap_index.xml
Sitemap: ${baseUrl}/sitemap.xml`,

    shopify: `User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /account
Disallow: /*?variant=*
Disallow: /*?q=*
Disallow: /search

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`,

    nextjs: `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`,

    default: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /search
Disallow: /cart
Disallow: /checkout
Disallow: /account

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`,
  };

  const code = robotsTxtByPlatform[platform] || robotsTxtByPlatform.default;

  const steps: InstructionStep[] = [];
  if (platform === 'wordpress') {
    steps.push({ step: 1, title: 'Use Yoast SEO', description: 'Go to Yoast SEO > Tools > File Editor > robots.txt. Paste the content below. Yoast manages the file for you.' });
    steps.push({ step: 2, title: 'Or create manually', description: 'Create a file named robots.txt in your WordPress root directory (same folder as wp-config.php). Upload via FTP or your hosting file manager.' });
  } else if (platform === 'shopify') {
    steps.push({ step: 1, title: 'Edit robots.txt.liquid', description: 'Shopify auto-generates robots.txt. To customize: go to Online Store > Themes > Edit Code > Templates > add robots.txt.liquid. Paste the content below.' });
  } else if (platform === 'nextjs') {
    steps.push({ step: 1, title: 'Create robots.ts', description: 'Create app/robots.ts (App Router) and export a default function that returns the robots configuration. Or create a static public/robots.txt file.' });
  } else {
    steps.push({ step: 1, title: 'Create robots.txt', description: 'Create a file named robots.txt in your website\'s root directory. Paste the content below.' });
  }
  steps.push({ step: steps.length + 1, title: 'Verify', description: 'Visit yourdomain.com/robots.txt in a browser to confirm it\'s accessible.', validationUrl: `${baseUrl}/robots.txt` });
  steps.push({ step: steps.length + 1, title: 'Test in Search Console', description: 'Use Google Search Console > Settings > robots.txt to test your file.', validationUrl: 'https://search.google.com/search-console' });

  return {
    title: 'Create or Fix robots.txt',
    steps,
    code,
    platform,
    estimatedTime: '5 minutes',
    difficulty: 'easy',
    impact: 'high',
    validationLinks: [
      { tool: 'Google robots.txt Tester', url: 'https://search.google.com/search-console', description: 'Test your robots.txt in Google Search Console' },
    ],
  };
}

// ---------------------------------------------------------------------------
// Meta Robots / Noindex Fix
// ---------------------------------------------------------------------------

export function generateMetaRobots(
  shouldIndex: boolean,
  platform: PlatformType
): FixInstruction {
  const content = shouldIndex ? 'index, follow' : 'noindex, nofollow';
  let code = `<meta name="robots" content="${content}" />`;

  if (platform === 'nextjs') {
    code = `// In your page.tsx:
export const metadata = {
  robots: {
    index: ${shouldIndex},
    follow: ${shouldIndex},
  },
};`;
  }

  const steps: InstructionStep[] = [];
  if (shouldIndex) {
    steps.push({ step: 1, title: 'Remove noindex tag', description: 'Search your page source for <meta name="robots" content="noindex">. Remove it or change to "index, follow". This page should be indexed by search engines.' });
  } else {
    steps.push({ step: 1, title: 'Add noindex tag', description: 'Add the meta robots tag below to your <head> section. This tells search engines not to index this page (useful for admin pages, thank-you pages, etc.).' });
  }

  if (platform === 'wordpress') {
    steps.push({ step: 2, title: 'Check in Yoast/RankMath', description: 'Edit the page > SEO section > Advanced tab > look for "Allow search engines to show this page in search results?" — set to Yes (for index) or No (for noindex).' });
  }

  return {
    title: shouldIndex ? 'Fix Accidental Noindex' : 'Add Noindex Tag',
    steps,
    code,
    platform,
    estimatedTime: '2 minutes',
    difficulty: 'easy',
    impact: 'high',
  };
}
