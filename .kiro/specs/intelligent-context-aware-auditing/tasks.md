# Implementation Tasks

## Phase 1: Foundation (Weeks 1-2)

### 1. Extend Data Models and Interfaces

- [ ] 1.1 Extend PageScan interface in lib/crawler-deep.ts with new fields (orphanScore, duplicateContentHash, platformDetection, linkDepth, schemaQuality)
- [ ] 1.2 Create SiteTypeResult interface in new file lib/site-type-detector.ts
- [ ] 1.3 Create MultiPageScanResult interface in new file lib/multi-page-crawler.ts
- [ ] 1.4 Create FixInstruction interface in new file lib/fix-generator.ts
- [ ] 1.5 Create GapAnalysis interface in new file lib/gap-analyzer.ts
- [ ] 1.6 Create PriorityRecommendation interface in new file lib/priority-scorer.ts
- [ ] 1.7 Create AuditResult interface in new file lib/types/audit.ts

### 2. Implement Site Type Detection

- [ ] 2.1 Create lib/site-type-detector.ts with detectSiteType() function
- [ ] 2.2 Implement schema-based classification (40% weight)
- [ ] 2.3 Implement content pattern matching (30% weight)
- [ ] 2.4 Implement structural analysis (20% weight)
- [ ] 2.5 Implement URL structure analysis (10% weight)
- [ ] 2.6 Implement confidence scoring algorithm
- [ ] 2.7 Create getRecommendedSchemas() helper function for each site type
- [ ] 2.8 Add unit tests for site type detection with known examples
- [ ] 2.9 Add property test for Property 1 (Site Type Classification Validity)
- [ ] 2.10 Add property test for Property 3 (Low Confidence Triggers Manual Selection)

### 3. Update Scoring System for Site Type Context

- [ ] 3.1 Create lib/scoring-config-site-types.ts with site-type-specific penalty weights
- [ ] 3.2 Update lib/grader.ts to accept siteType parameter in calculateDeterministicScores()
- [ ] 3.3 Implement site-type-specific penalty weight application in grader
- [ ] 3.4 Update lib/schema-validator.ts to add validateSchemaForSiteType() function
- [ ] 3.5 Add unit tests for site-type-specific scoring
- [ ] 3.6 Add property test for Property 2 (Site Type Influences Scoring)

### 4. Enhance Gemini Prompts with Site Type Context

- [ ] 4.1 Update lib/gemini-sitewide.ts to accept siteType parameter
- [ ] 4.2 Create buildGeminiPrompt() helper function with site type injection
- [ ] 4.3 Update all Gemini API calls to include site type context
- [ ] 4.4 Add unit tests for prompt generation with different site types
- [ ] 4.5 Add property test for Property 33 (Site Type Context in Gemini Prompts)

## Phase 2: Multi-Page Crawling (Weeks 3-4)

### 5. Implement Multi-Page Crawler Core

- [ ] 5.1 Create lib/multi-page-crawler.ts with crawlMultiplePages() function
- [ ] 5.2 Implement link discovery from homepage
- [ ] 5.3 Implement page prioritization algorithm (prioritizePages function)
- [ ] 5.4 Implement parallel batch processing (batches of 3)
- [ ] 5.5 Integrate with existing performDeepScan() from lib/crawler-deep.ts
- [ ] 5.6 Implement crawl timeout protection (60s for 10 pages, 180s for 50 pages)
- [ ] 5.7 Add error handling for failed pages (log and continue)
- [ ] 5.8 Implement robots.txt compliance checking
- [ ] 5.9 Add unit tests for link discovery and prioritization
- [ ] 5.10 Add property test for Property 4 (Multi-Page Crawl Respects Configuration)
- [ ] 5.11 Add property test for Property 5 (Homepage is Always First)

### 6. Implement Link Graph Analysis

- [ ] 6.1 Create buildInternalLinkGraph() function in lib/multi-page-crawler.ts
- [ ] 6.2 Implement orphan page detection (detectOrphans function)
- [ ] 6.3 Implement duplicate content detection (detectDuplicates function)
- [ ] 6.4 Create simpleHash() utility for content hashing
- [ ] 6.5 Add unit tests for orphan detection with known link graphs
- [ ] 6.6 Add unit tests for duplicate detection with identical content
- [ ] 6.7 Add property test for Property 9 (Orphan Detection Correctness)
- [ ] 6.8 Add property test for Property 10 (Duplicate Content Detection)
- [ ] 6.9 Add property test for Property 11 (Link Graph Accuracy)

### 7. Implement Site-Wide Issue Aggregation

- [ ] 7.1 Create aggregateSiteWideIssues() function in lib/multi-page-crawler.ts
- [ ] 7.2 Implement missing H1 detection across all pages
- [ ] 7.3 Implement thin content detection (<300 words)
- [ ] 7.4 Implement missing meta description detection
- [ ] 7.5 Implement poor alt text coverage detection
- [ ] 7.6 Add severity classification for each issue type
- [ ] 7.7 Add unit tests for site-wide issue aggregation
- [ ] 7.8 Add property test for Property 8 (Site-Wide Issue Aggregation Accuracy)

### 8. Implement Page Caching

- [ ] 8.1 Create lib/page-cache.ts with PageCache class
- [ ] 8.2 Implement get() method with expiration checking
- [ ] 8.3 Implement set() method with TTL (24 hours default)
- [ ] 8.4 Implement normalizeUrl() helper for cache key generation
- [ ] 8.5 Add unit tests for cache behavior
- [ ] 8.6 Add property test for Property 38 (Cache Behavior)

## Phase 3: Fix Generation (Weeks 5-6)

### 9. Implement Platform Detection

- [ ] 9.1 Create lib/fix-generator.ts with detectPlatform() function
- [ ] 9.2 Implement WordPress detection logic
- [ ] 9.3 Implement Shopify detection logic
- [ ] 9.4 Implement Next.js detection logic
- [ ] 9.5 Implement React detection logic
- [ ] 9.6 Implement custom HTML fallback
- [ ] 9.7 Add unit tests for platform detection with known HTML patterns
- [ ] 9.8 Add property test for Property 15 (Platform-Specific Instructions)

### 10. Implement Schema Code Generation

- [ ] 10.1 Create generateSchemaCode() function in lib/fix-generator.ts
- [ ] 10.2 Create buildSchemaObject() helper for each schema type (LocalBusiness, Product, Article, etc.)
- [ ] 10.3 Implement pre-population with site data (name, address, phone, etc.)
- [ ] 10.4 Create generateHtmlSchemaTag() formatter
- [ ] 10.5 Create generateNextJsSchemaComponent() formatter
- [ ] 10.6 Implement JSON validation before returning code
- [ ] 10.7 Add unit tests for schema code generation for each schema type
- [ ] 10.8 Add property test for Property 13 (Schema Code Generation Validity)
- [ ] 10.9 Add property test for Property 14 (Schema Round-Trip Property)
- [ ] 10.10 Add property test for Property 16 (Schema Pre-Population)

### 11. Implement Fix Instruction Generation

- [ ] 11.1 Create generateInstructions() function in lib/fix-generator.ts
- [ ] 11.2 Create platform-specific instruction templates for WordPress
- [ ] 11.3 Create platform-specific instruction templates for Shopify
- [ ] 11.4 Create platform-specific instruction templates for Next.js
- [ ] 11.5 Create platform-specific instruction templates for React
- [ ] 11.6 Create platform-specific instruction templates for custom HTML
- [ ] 11.7 Implement validation link generation (Google Rich Results Test, Schema.org validator)
- [ ] 11.8 Implement estimated time calculation for each fix type
- [ ] 11.9 Add unit tests for instruction generation for each platform
- [ ] 11.10 Add property test for Property 12 (Fix Instructions Completeness)
- [ ] 11.11 Add property test for Property 17 (Validation Links Inclusion)

### 12. Implement Code Validation

- [ ] 12.1 Create validateGeneratedCode() function in lib/fix-generator.ts
- [ ] 12.2 Implement JSON syntax validation for schema code
- [ ] 12.3 Implement schema structure validation (required properties)
- [ ] 12.4 Add error handling for validation failures
- [ ] 12.5 Add unit tests for code validation
- [ ] 12.6 Add property test for Property 45 (Code Validation Before Display)

## Phase 4: Gap Analysis (Week 7)

### 13. Implement Competitor Crawling

- [ ] 13.1 Create analyzeCompetitorGaps() function in lib/gap-analyzer.ts
- [ ] 13.2 Implement competitor site crawling using Multi_Page_Crawler
- [ ] 13.3 Add error handling for competitor crawl failures
- [ ] 13.4 Add unit tests for competitor crawling

### 14. Implement Schema Gap Analysis

- [ ] 14.1 Create identifySchemaGaps() function in lib/gap-analyzer.ts
- [ ] 14.2 Implement set difference operation for schema types
- [ ] 14.3 Implement example extraction for each gap
- [ ] 14.4 Create calculateSchemaImpact() helper function
- [ ] 14.5 Add unit tests for schema gap identification
- [ ] 14.6 Add property test for Property 18 (Schema Gap Identification)

### 15. Implement Content and Structural Gap Analysis

- [ ] 15.1 Create extractTopics() function for content analysis
- [ ] 15.2 Create analyzeStructure() function for structural features
- [ ] 15.3 Implement content gap detection with similarity matching
- [ ] 15.4 Implement structural feature detection (FAQ pages, blog, case studies, etc.)
- [ ] 15.5 Create findCommonFeatures() helper function
- [ ] 15.6 Add unit tests for content and structural gap detection

### 16. Implement Competitive Advantage Scoring

- [ ] 16.1 Create calculateAdvantageScore() function in lib/gap-analyzer.ts
- [ ] 16.2 Create identifyStrengths() function for bidirectional comparison
- [ ] 16.3 Implement quick win identification logic
- [ ] 16.4 Add unit tests for advantage score calculation
- [ ] 16.5 Add property test for Property 19 (Gap Analysis Completeness)
- [ ] 16.6 Add property test for Property 20 (Competitive Advantage Score Bounds)
- [ ] 16.7 Add property test for Property 21 (Bidirectional Comparison)

## Phase 5: Priority Scoring (Week 8)

### 17. Implement ROI Calculation

- [ ] 17.1 Create calculatePriority() function in lib/priority-scorer.ts
- [ ] 17.2 Implement calculateImpact() with site-type-specific multipliers
- [ ] 17.3 Implement calculateEffort() with effort mapping
- [ ] 17.4 Implement ROI formula (Impact / Effort)
- [ ] 17.5 Add unit tests for ROI calculation
- [ ] 17.6 Add property test for Property 22 (ROI Score Calculation)
- [ ] 17.7 Add property test for Property 23 (Score Bounds Validation)

### 18. Implement Category Assignment and Ranking

- [ ] 18.1 Create categorizeByROI() function in lib/priority-scorer.ts
- [ ] 18.2 Implement category assignment logic (Quick Win, High Priority, etc.)
- [ ] 18.3 Implement top 3 selection algorithm
- [ ] 18.4 Create explainPriority() function for reasoning generation
- [ ] 18.5 Add unit tests for category assignment
- [ ] 18.6 Add property test for Property 24 (Top Priority Selection)
- [ ] 18.7 Add property test for Property 25 (Category Assignment Logic)

### 19. Implement Score Improvement Estimation

- [ ] 19.1 Create estimateScoreGain() function in lib/priority-scorer.ts
- [ ] 19.2 Define score gain mappings for each recommendation type
- [ ] 19.3 Implement cumulative impact calculation
- [ ] 19.4 Implement completed items exclusion logic
- [ ] 19.5 Add unit tests for score improvement estimation
- [ ] 19.6 Add property test for Property 26 (Cumulative Impact Calculation)
- [ ] 19.7 Add property test for Property 27 (Completed Items Exclusion)

## Phase 6: UI Integration (Weeks 9-10)

### 20. Create Crawl Configuration UI

- [x] 20.1 Update app/site-analysis/page.tsx with crawl configuration section
- [x] 20.2 Add page count selector (1, 10, 20, 50 pages)
- [x] 20.3 Add competitor URL input fields (dynamic add/remove)
- [x] 20.4 Add robots.txt respect checkbox
- [x] 20.5 Add estimated time display based on page count
- [x] 20.6 Add input validation for URLs and page counts
- [ ] 20.7 Add unit tests for configuration UI

### 21. Create Site Type Badge Component

- [x] 21.1 Create components/dashboard/site-type-badge.tsx
- [x] 21.2 Implement badge display with icon and text
- [x] 21.3 Implement confidence-based visual states (green/yellow/red)
- [x] 21.4 Add manual confirmation button for medium confidence
- [x] 21.5 Add site type dropdown for low confidence
- [ ] 21.6 Add unit tests for badge component

### 22. Create Multi-Page Results Dashboard

- [x] 22.1 Create components/dashboard/multi-page-dashboard.tsx
- [x] 22.2 Implement site overview section with aggregate scores
- [x] 22.3 Implement site-wide issues section with issue counts
- [x] 22.4 Add expandable issue details
- [ ] 22.5 Add unit tests for dashboard component

### 23. Create Page-by-Page Comparison Table

- [x] 23.1 Create components/dashboard/page-comparison-table.tsx
- [x] 23.2 Implement sortable columns (URL, SEO, AEO, GEO, word count, issues)
- [x] 23.3 Implement color-coded score cells
- [x] 23.4 Add expandable issue details per page
- [x] 23.5 Add copy URL button
- [x] 23.6 Add pagination for large page counts
- [ ] 23.7 Add unit tests for table component

### 24. Create Priority Matrix Visualization

- [x] 24.1 Create components/dashboard/priority-matrix.tsx
- [x] 24.2 Implement effort vs impact grid layout
- [x] 24.3 Implement recommendation point plotting
- [x] 24.4 Add hover tooltips for each point
- [x] 24.5 Add category color coding
- [x] 24.6 Add legend
- [ ] 24.7 Add unit tests for matrix component

### 25. Create Expandable Fix Instruction Cards

- [x] 25.1 Create components/dashboard/fix-instruction-card.tsx
- [x] 25.2 Implement collapsible card header with priority badge
- [x] 25.3 Implement step-by-step instruction display
- [x] 25.4 Add code block with syntax highlighting
- [x] 25.5 Add copy-to-clipboard button for code snippets
- [x] 25.6 Add validation links section
- [x] 25.7 Add mark-as-complete button
- [ ] 25.8 Add unit tests for card component

### 26. Create Competitor Gap Comparison View

- [x] 26.1 Create components/dashboard/competitor-gap-view.tsx
- [x] 26.2 Implement side-by-side comparison table
- [x] 26.3 Implement competitive advantage score display
- [x] 26.4 Add quick wins section
- [x] 26.5 Add strengths section
- [ ] 26.6 Add unit tests for gap view component

### 27. Create Progress Indicators

- [x] 27.1 Create components/dashboard/crawl-progress.tsx
- [x] 27.2 Implement progress bar with percentage
- [x] 27.3 Implement current page / total pages display
- [x] 27.4 Add estimated time remaining calculation
- [x] 27.5 Create analysis stages component with checkmarks
- [ ] 27.6 Add unit tests for progress components

### 28. Integrate New Components into Existing Pages

- [x] 28.1 Update app/site-analysis/page.tsx to conditionally show multi-page results
- [x] 28.2 Add site type badge to results header
- [x] 28.3 Add multi-page dashboard when crawl depth > 1
- [x] 28.4 Add page comparison table when crawl depth > 1
- [x] 28.5 Add priority matrix to recommendations section
- [x] 28.6 Replace existing recommendation cards with new fix instruction cards
- [x] 28.7 Add competitor gap view when competitor URLs provided
- [x] 28.8 Add progress indicators during crawling

## Phase 7: Testing & Optimization (Weeks 11-12)

### 29. Complete Property-Based Test Suite

- [ ] 29.1 Set up fast-check library and test infrastructure
- [ ] 29.2 Create test data generators (arbitrarySiteData, arbitraryPageScan, arbitrarySchema)
- [ ] 29.3 Implement all 48 property tests with 100 iterations each
- [ ] 29.4 Add property test tags referencing design document properties
- [ ] 29.5 Configure extended property tests for nightly runs (1000 iterations)

### 30. Performance Optimization

- [ ] 30.1 Profile multi-page crawling performance
- [ ] 30.2 Optimize parallel batch processing
- [ ] 30.3 Implement early termination for time-constrained crawls
- [ ] 30.4 Optimize Gemini API batching
- [ ] 30.5 Implement resource pooling for browser instances
- [ ] 30.6 Add performance tests (10 pages < 60s, 50 pages < 180s)
- [ ] 30.7 Optimize cache hit rates

### 31. Error Handling Refinement

- [ ] 31.1 Review all error handling paths
- [ ] 31.2 Implement exponential backoff for rate limits
- [ ] 31.3 Implement Gemini API fallback logic
- [ ] 31.4 Implement graceful degradation for crawl failures
- [ ] 31.5 Implement partial results preservation
- [ ] 31.6 Add comprehensive error logging
- [ ] 31.7 Add user-friendly error messages
- [ ] 31.8 Add property test for Property 41 (Exponential Backoff on Rate Limits)
- [ ] 31.9 Add property test for Property 42 (Gemini Fallback)
- [ ] 31.10 Add property test for Property 48 (User-Friendly Error Messages)

### 32. Integration Testing

- [ ] 32.1 Create end-to-end test for complete audit flow
- [ ] 32.2 Test single-page mode backward compatibility
- [ ] 32.3 Test multi-page mode with 10, 20, and 50 pages
- [ ] 32.4 Test competitor gap analysis with multiple competitors
- [ ] 32.5 Test error scenarios (network failures, API failures, invalid inputs)
- [ ] 32.6 Test cache behavior with repeated crawls
- [ ] 32.7 Test partial results on interruption
- [ ] 32.8 Add property test for Property 36 (Backward Compatibility)
- [ ] 32.9 Add property test for Property 40 (Graceful Degradation)

### 33. Documentation and Examples

- [ ] 33.1 Create API documentation for all new functions
- [ ] 33.2 Create usage examples for each major component
- [ ] 33.3 Document property-based testing approach
- [ ] 33.4 Create troubleshooting guide
- [ ] 33.5 Document performance optimization strategies
- [ ] 33.6 Create migration guide for existing users

### 34. Beta Testing and Bug Fixes

- [ ] 34.1 Deploy to staging environment
- [ ] 34.2 Conduct beta testing with 10 real websites
- [ ] 34.3 Collect user feedback on recommendations and priorities
- [ ] 34.4 Fix bugs identified during beta testing
- [ ] 34.5 Refine site type detection based on real-world data
- [ ] 34.6 Refine priority scoring based on user feedback
- [ ] 34.7 Polish UI/UX based on usability testing

### 35. Final Polish and Launch Preparation

- [ ] 35.1 Code review and refactoring
- [ ] 35.2 Security audit (input validation, rate limiting, content sanitization)
- [ ] 35.3 Performance benchmarking
- [ ] 35.4 Accessibility audit for new UI components
- [ ] 35.5 Cross-browser testing
- [ ] 35.6 Mobile responsiveness testing
- [ ] 35.7 Create release notes
- [ ] 35.8 Prepare launch announcement
