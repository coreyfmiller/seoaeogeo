# Requirements Document

## Introduction

This document specifies requirements for the Intelligent Context-Aware Auditing system, a comprehensive enhancement to the existing SEO/AEO/GEO auditing product. The system will transform single-page analysis into intelligent multi-page site auditing with context-aware recommendations, actionable implementation guidance, competitive intelligence, and priority-based optimization strategies.

The current system analyzes individual pages using Gemini 2.5 Flash for AI analysis and deterministic scoring algorithms. This enhancement will add site type detection, multi-page crawling, actionable fix generation, competitor gap analysis, and ROI-based priority scoring to deliver a professional-grade auditing experience.

## Glossary

- **Auditing_System**: The complete SEO/AEO/GEO analysis platform
- **Site_Type_Detector**: Component that identifies website category from content and schema
- **Multi_Page_Crawler**: Component that discovers and analyzes multiple pages across a domain
- **Fix_Generator**: Component that produces implementation-ready code and instructions
- **Gap_Analyzer**: Component that identifies competitive differences and opportunities
- **Priority_Scorer**: Component that calculates ROI and effort-impact rankings
- **Gemini_Analyzer**: AI analysis component using Google Gemini 2.5 Flash
- **Deterministic_Grader**: Rule-based scoring component (lib/grader.ts)
- **Schema_Validator**: Component that validates structured data markup
- **Page_Scan**: Data structure containing metadata from a single crawled page
- **Site_Type**: Classification category (e-commerce, local business, blog, SaaS, portfolio, restaurant, contractor, etc.)
- **ROI_Score**: Return on investment calculation for optimization recommendations
- **Effort_Score**: Implementation difficulty rating (1-3 scale)
- **Impact_Score**: Expected traffic/ranking improvement from implementing a fix

## Requirements

### Requirement 1: Context-Aware Site Type Detection

**User Story:** As a website owner, I want the system to automatically detect my site type, so that I receive recommendations tailored to my specific business model.

#### Acceptance Criteria

1. WHEN a site is analyzed, THE Site_Type_Detector SHALL examine content, schema markup, and page structure to determine the Site_Type
2. THE Site_Type_Detector SHALL classify sites into one of the following categories: e-commerce, local business, blog, SaaS, portfolio, restaurant, contractor, professional services, news/media, educational, or general
3. THE Site_Type_Detector SHALL achieve 85% or higher classification accuracy based on schema types, content patterns, and structural signals
4. THE Auditing_System SHALL display the detected Site_Type prominently in the UI with a badge format (e.g., "Detected: Local Service Business")
5. WHEN the Site_Type is determined, THE Auditing_System SHALL adjust scoring weights for SEO, AEO, and GEO metrics according to site-type-specific expectations
6. THE Gemini_Analyzer SHALL receive Site_Type context and SHALL recommend only schema types relevant to that Site_Type
7. WHERE a site matches multiple Site_Type categories, THE Site_Type_Detector SHALL select the primary category and SHALL note secondary categories
8. THE Site_Type_Detector SHALL provide confidence scores for classification decisions
9. WHEN Site_Type cannot be determined with 70% or higher confidence, THE Auditing_System SHALL prompt the user to manually select the Site_Type

### Requirement 2: Multi-Page Site Crawling and Analysis

**User Story:** As a website owner, I want the system to analyze my entire site, so that I can identify site-wide issues and patterns.

#### Acceptance Criteria

1. THE Multi_Page_Crawler SHALL discover and analyze between 10 and 50 pages per site based on user configuration
2. WHEN crawling begins, THE Multi_Page_Crawler SHALL start from the homepage and SHALL extract all internal links
3. THE Multi_Page_Crawler SHALL prioritize pages based on link depth, with homepage at depth 0
4. THE Multi_Page_Crawler SHALL extract Page_Scan data for each crawled page including title, description, schema, word count, H1 presence, internal links, external links, and image alt text coverage
5. THE Multi_Page_Crawler SHALL process pages in parallel batches of 3 to optimize performance
6. THE Multi_Page_Crawler SHALL complete crawling within 60 seconds for 10 pages or 180 seconds for 50 pages
7. WHEN crawling encounters errors, THE Multi_Page_Crawler SHALL log the failure and SHALL continue with remaining pages
8. THE Auditing_System SHALL aggregate Page_Scan data to identify site-wide issues
9. THE Auditing_System SHALL display site-wide statistics including: "X pages missing H1 tags", "Y pages with thin content (<300 words)", "Z pages missing meta descriptions"
10. THE Auditing_System SHALL provide page-by-page comparison views with sortable columns for scores, word count, and issues
11. THE Multi_Page_Crawler SHALL detect orphaned pages (pages with zero or one internal link pointing to them)
12. THE Multi_Page_Crawler SHALL identify duplicate or near-duplicate content across pages using content similarity algorithms
13. THE Auditing_System SHALL generate an internal linking graph showing page relationships
14. THE Multi_Page_Crawler SHALL respect robots.txt directives and SHALL honor crawl-delay settings

### Requirement 3: Actionable Fix Instructions with Code Generation

**User Story:** As a website owner, I want step-by-step implementation instructions for every recommendation, so that I can quickly fix issues without researching how to implement them.

#### Acceptance Criteria

1. THE Fix_Generator SHALL produce implementation instructions for every recommendation in the audit report
2. THE Fix_Generator SHALL include step-by-step guides with numbered instructions
3. WHERE schema markup is recommended, THE Fix_Generator SHALL generate valid JSON-LD code ready for copy-paste
4. THE Fix_Generator SHALL detect the platform type (WordPress, Shopify, custom HTML, Next.js, React) from page structure and SHALL provide platform-specific instructions
5. THE Auditing_System SHALL provide a "Copy to clipboard" button for all generated code snippets
6. THE Fix_Generator SHALL include visual examples showing before and after states for UI-related fixes
7. THE Fix_Generator SHALL provide links to relevant validation tools (Google Rich Results Test, Schema.org validator, PageSpeed Insights)
8. WHEN generating schema code, THE Fix_Generator SHALL pre-populate fields with placeholder values that match the site's detected information
9. THE Fix_Generator SHALL include estimated implementation time for each fix (e.g., "5 minutes", "30 minutes", "2 hours")
10. WHERE multiple implementation approaches exist, THE Fix_Generator SHALL present the recommended approach first and SHALL note alternative methods
11. THE Fix_Generator SHALL validate generated schema code against schema.org specifications before presenting to users
12. THE Auditing_System SHALL provide downloadable implementation checklists in PDF format

### Requirement 4: Competitor Intelligence Gap Analysis

**User Story:** As a website owner, I want to see specific gaps between my site and competitors, so that I can prioritize improvements that will give me a competitive advantage.

#### Acceptance Criteria

1. WHEN competitor URLs are provided, THE Gap_Analyzer SHALL analyze competitor sites using the same Multi_Page_Crawler
2. THE Gap_Analyzer SHALL identify schema types present on competitor sites but missing from the analyzed site
3. THE Gap_Analyzer SHALL display schema gaps with examples (e.g., "Competitor has Review schema showing 4.8★ rating, you don't have Review schema")
4. THE Gap_Analyzer SHALL identify content gaps by comparing topic coverage, question answering, and content depth
5. THE Gap_Analyzer SHALL display content gaps with quantified differences (e.g., "Competitor answers 15 'How to' questions, you answer 3")
6. THE Gap_Analyzer SHALL perform keyword gap analysis by comparing title tags, headings, and content focus
7. THE Gap_Analyzer SHALL identify structural advantages such as FAQ pages, case studies, testimonials, or resource libraries present on competitor sites
8. THE Auditing_System SHALL transform comparison data into actionable strategy recommendations
9. THE Gap_Analyzer SHALL calculate a competitive advantage score (0-100) showing how the analyzed site compares to competitors
10. THE Auditing_System SHALL highlight quick wins where small changes can close significant gaps
11. THE Gap_Analyzer SHALL identify areas where the analyzed site outperforms competitors
12. WHEN multiple competitors are analyzed, THE Gap_Analyzer SHALL aggregate insights and SHALL identify common patterns across top-performing competitors

### Requirement 5: Priority Scoring and ROI Calculation

**User Story:** As a website owner, I want to know which fixes will have the biggest impact, so that I can focus my limited time on high-value improvements.

#### Acceptance Criteria

1. THE Priority_Scorer SHALL calculate an ROI_Score for each recommendation based on estimated traffic impact and implementation effort
2. THE Priority_Scorer SHALL assign an Effort_Score (1=easy, 2=moderate, 3=difficult) to each recommendation
3. THE Priority_Scorer SHALL assign an Impact_Score (0-100) estimating the traffic or ranking improvement from implementing the fix
4. THE Auditing_System SHALL display an effort vs impact matrix visualization with recommendations plotted as points
5. THE Priority_Scorer SHALL identify the top 3 recommendations with the highest ROI_Score and SHALL label them as "Fix These First"
6. THE Auditing_System SHALL provide clear reasoning for priority rankings (e.g., "High priority because: missing schema affects 12 pages and enables rich results")
7. THE Priority_Scorer SHALL estimate potential score improvements for each fix (e.g., "+12 AEO points", "+8 SEO points")
8. THE Priority_Scorer SHALL categorize recommendations as "Quick Wins" (high impact, low effort) or "Long-term Investments" (high impact, high effort)
9. THE Priority_Scorer SHALL estimate implementation time for each recommendation
10. THE Auditing_System SHALL display cumulative impact projections (e.g., "Implementing top 5 recommendations: estimated +25% organic traffic")
11. THE Priority_Scorer SHALL consider Site_Type when calculating impact scores (e.g., Review schema has higher impact for local businesses than for blogs)
12. THE Auditing_System SHALL allow users to mark recommendations as "completed" and SHALL recalculate priorities based on remaining items

### Requirement 6: Schema Markup Parser and Pretty Printer

**User Story:** As a developer, I want to validate and format schema markup, so that I can ensure my structured data is correct and readable.

#### Acceptance Criteria

1. WHEN a page contains JSON-LD schema markup, THE Schema_Validator SHALL parse all script tags with type="application/ld+json"
2. THE Schema_Validator SHALL parse JSON-LD arrays at root level
3. THE Schema_Validator SHALL parse @graph structures and SHALL follow @id references within the same domain
4. THE Schema_Validator SHALL handle multiple script tags per page and SHALL aggregate all schema objects
5. WHEN schema parsing fails, THE Schema_Validator SHALL return a descriptive error message indicating the location and nature of the syntax error
6. THE Fix_Generator SHALL format schema objects into valid, indented JSON-LD code
7. FOR ALL valid schema objects, parsing the object then formatting it then parsing again SHALL produce an equivalent object (round-trip property)
8. THE Schema_Validator SHALL validate required properties according to schema.org specifications for each schema type
9. THE Schema_Validator SHALL detect placeholder data (e.g., "000-0000", "example@example.com", "123 Main St") and SHALL flag it as an issue
10. THE Fix_Generator SHALL preserve @context, @type, and @id properties when formatting schema markup

### Requirement 7: Integration with Existing Scoring System

**User Story:** As a system maintainer, I want the new features to integrate seamlessly with existing scoring logic, so that the system remains consistent and maintainable.

#### Acceptance Criteria

1. THE Auditing_System SHALL continue to use the Deterministic_Grader for calculating SEO, AEO, and GEO scores
2. WHEN Site_Type is detected, THE Deterministic_Grader SHALL apply site-type-specific penalty weights from a configuration file
3. THE Auditing_System SHALL pass Site_Type context to the Gemini_Analyzer in all analysis prompts
4. THE Schema_Validator SHALL provide schema quality scores to the Deterministic_Grader for AEO score calculation
5. THE Auditing_System SHALL maintain the existing penalty ledger system and SHALL add new penalty types for multi-page issues
6. THE Multi_Page_Crawler SHALL reuse the existing Page_Scan data structure from lib/crawler-deep.ts
7. THE Auditing_System SHALL preserve backward compatibility with single-page analysis mode
8. WHEN multi-page analysis is enabled, THE Auditing_System SHALL aggregate individual page scores into a site-wide score using weighted averaging
9. THE Auditing_System SHALL store multi-page analysis results in the existing snapshot system for testing and comparison

### Requirement 8: User Interface Enhancements

**User Story:** As a website owner, I want an intuitive interface that clearly presents multi-page results and priorities, so that I can quickly understand my site's health and take action.

#### Acceptance Criteria

1. THE Auditing_System SHALL display the detected Site_Type as a prominent badge in the results header
2. THE Auditing_System SHALL provide a site-wide dashboard showing aggregate scores and top issues
3. THE Auditing_System SHALL provide a page-by-page table view with sortable columns for URL, scores, word count, and issue count
4. THE Auditing_System SHALL provide an effort vs impact matrix visualization for recommendations
5. THE Auditing_System SHALL highlight the top 3 priority recommendations with visual emphasis (e.g., colored borders, icons)
6. THE Auditing_System SHALL provide expandable sections for each recommendation showing implementation instructions and code snippets
7. THE Auditing_System SHALL provide a "Copy to clipboard" button for all code snippets
8. THE Auditing_System SHALL display competitor gap analysis in a side-by-side comparison view
9. THE Auditing_System SHALL provide progress indicators during multi-page crawling (e.g., "Analyzing page 5 of 20...")
10. THE Auditing_System SHALL allow users to configure crawl depth (10, 20, or 50 pages) before starting analysis
11. THE Auditing_System SHALL provide export functionality for audit reports in PDF format
12. THE Auditing_System SHALL display estimated ROI and implementation time for each recommendation

### Requirement 9: Performance and Scalability

**User Story:** As a system operator, I want the system to handle multi-page analysis efficiently, so that users receive results quickly without overwhelming server resources.

#### Acceptance Criteria

1. THE Multi_Page_Crawler SHALL complete analysis of 10 pages within 60 seconds
2. THE Multi_Page_Crawler SHALL complete analysis of 50 pages within 180 seconds
3. THE Multi_Page_Crawler SHALL process pages in parallel batches of 3 to balance speed and resource usage
4. THE Auditing_System SHALL implement request queuing to prevent more than 5 concurrent multi-page analyses
5. THE Auditing_System SHALL cache Page_Scan results for 24 hours to avoid re-crawling recently analyzed pages
6. THE Gemini_Analyzer SHALL batch API calls where possible to minimize token usage
7. THE Auditing_System SHALL log token usage for all Gemini API calls to track costs
8. WHEN analysis exceeds 120 seconds, THE Auditing_System SHALL display a progress indicator to keep users informed
9. THE Auditing_System SHALL implement graceful degradation: if crawling fails, single-page analysis SHALL still complete
10. THE Multi_Page_Crawler SHALL respect rate limits and SHALL implement exponential backoff for retries

### Requirement 10: Error Handling and Reliability

**User Story:** As a website owner, I want the system to handle errors gracefully, so that I receive useful results even when some pages fail to load.

#### Acceptance Criteria

1. WHEN a page fails to load, THE Multi_Page_Crawler SHALL log the error and SHALL continue crawling remaining pages
2. THE Auditing_System SHALL display a summary of failed pages with error reasons (e.g., "3 pages returned 404 errors")
3. WHEN the Gemini_Analyzer API fails, THE Auditing_System SHALL fall back to deterministic scoring only and SHALL notify the user
4. WHEN schema parsing fails, THE Schema_Validator SHALL return a descriptive error message and SHALL continue analyzing other schema objects
5. THE Auditing_System SHALL validate all user inputs (URLs, crawl depth settings) and SHALL provide clear error messages for invalid inputs
6. WHEN crawling is interrupted, THE Auditing_System SHALL save partial results and SHALL allow users to resume or restart
7. THE Fix_Generator SHALL validate generated code before presenting it to users and SHALL handle validation failures gracefully
8. THE Auditing_System SHALL implement timeout protection: if any component exceeds its time limit, the system SHALL terminate that operation and SHALL continue with available data
9. THE Auditing_System SHALL log all errors to a centralized logging system for debugging and monitoring
10. WHEN critical errors occur, THE Auditing_System SHALL display user-friendly error messages without exposing technical details or stack traces
