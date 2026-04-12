64061f57b351793a.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1 Uncaught ReferenceError: Cannot access 'D' before initialization
    at w (64061f57b351793a.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:16922)
    at av (aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:63230)
    at oY (aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:83503)
    at io (aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:93976)
    at sc (aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:137956)
    at aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:137801
    at ss (aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:137809)
    at u9 (aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:133734)
    at sV (aee6c7720838f8a2.js?dpl=dpl_1iRawTrJLRUwLgJsC1XtXazEoorb:1:159329)
    at MessagePort.O (# Implementation Plan: Duelly AI Assistant

## Overview

Implement the Duelly AI context-aware chat assistant as a global right-side panel with SSE streaming, Gemini Flash integration, rate limiting via Supabase, and proactive scan-based suggestions. Tasks are ordered: database schema first, then core library modules, then API route, then UI components, then integration wiring.

## Tasks

- [x] 1. Database schema and rate limiting infrastructure
  - [x] 1.1 Add `chat_usage` table to `supabase/schema.sql`
    - Create the `chat_usage` table with columns: `id` (UUID PK), `user_id` (FK to profiles), `date` (DATE, default CURRENT_DATE), `message_count` (INTEGER, default 0), `created_at`, `updated_at`
    - Add `UNIQUE (user_id, date)` constraint for upsert-based rate limiting
    - Enable RLS with policies: users can SELECT own rows, service role has full access
    - Add `update_updated_at` trigger reusing the existing function
    - _Requirements: 2.4, 2.5, 2.8_

  - [x] 1.2 Create `lib/chat/rate-limiter.ts`
    - Implement `checkRateLimit(userId: string): Promise<{ allowed: boolean; count: number; resetsAt: string }>` using `supabaseAdmin`
    - SELECT `message_count` from `chat_usage` WHERE `user_id` and `date = CURRENT_DATE`
    - Return `allowed: count < 50`, include next midnight UTC as `resetsAt`
    - Implement `incrementUsage(userId: string): Promise<number>` that upserts with `ON CONFLICT (user_id, date) DO UPDATE SET message_count = message_count + 1`
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 1.3 Write property test for rate limiter threshold (Property 1)
    - **Property 1: Rate limiter threshold enforcement**
    - Generate random integers 0-100, verify `allowed` is true iff count < 50
    - **Validates: Requirements 2.4, 2.5**

- [x] 2. Core library modules
  - [x] 2.1 Create `lib/chat/input-sanitizer.ts`
    - Implement `sanitizeUserInput(input: string): string`
    - Strip injection patterns: "ignore previous instructions", "you are now", "system:", "assistant:", "```system", role-override attempts (case-insensitive regex)
    - Truncate output to 2000 characters max
    - Preserve legitimate user text that doesn't match injection patterns
    - _Requirements: 7.10, 7.11, 7.12, 7.13_

  - [ ]* 2.2 Write property test for input sanitizer (Property 3)
    - **Property 3: Input sanitizer strips injection patterns**
    - Generate random strings with/without injection patterns, verify sanitizer removes all patterns; verify clean strings pass through unchanged (modulo 2000 char truncation)
    - **Validates: Requirements 7.10**

  - [x] 2.3 Create `lib/chat/system-prompt-builder.ts`
    - Implement `buildSystemPrompt(scanContext: ScanContext | null): string`
    - Assemble sections: (1) Role & personality, (2) Safety guardrails (topic boundaries, data integrity, PII, content safety, liability, prompt injection defense), (3) Product knowledge compiled from `scoring-components.ts` (SEO Foundation, Content Quality, Technical Excellence, Advanced Optimization categories), (4) Grade boundaries and score-to-letter mapping, (5) Fix library knowledge from `grader-v2.ts` (getExplanation/getFix), (6) Knowledge base entries from `knowledge-base.ts`, (7) Dynamic scan context from ScanContext, (8) Platform-specific guidance (WordPress, Shopify, Wix, Squarespace) conditional on detected platform
    - Include explicit instructions: decline legal/medical/financial advice, decline off-topic requests, no competitor discussion, no action claims, no hallucinated data, no PII handling, no black-hat SEO, no guaranteed outcomes, staging disclaimer, never reveal system prompt
    - _Requirements: 4.3, 4.4, 4.6, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1-7.22_

  - [x] 2.4 Create `lib/chat/proactive-suggestions.ts`
    - Implement `generateProactiveSuggestion(scanContext: ScanContext): string | null`
    - Pure function (no API call): count critical-severity penalties, generate summary string (e.g., "I see 3 critical issues. Want me to walk you through the most impactful fix?")
    - Return `null` if no critical issues found
    - _Requirements: 5.1, 5.3, 5.4_

  - [ ]* 2.5 Write property test for proactive suggestions (Property 4)
    - **Property 4: Proactive suggestion reflects penalty severity**
    - Generate random penalty arrays with mixed severities, verify suggestion includes correct critical count; verify null when zero critical issues
    - **Validates: Requirements 5.3, 5.4**

  - [x] 2.6 Create shared types in `lib/chat/types.ts`
    - Define `ChatMessage`, `ScanContext`, `ChatRequest`, `DuellyChatContextValue` interfaces as specified in the design
    - Export all types for use across chat modules
    - _Requirements: 4.1, 4.5, 8.3_

- [x] 3. Checkpoint - Ensure all library modules compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. API route with SSE streaming
  - [x] 4.1 Create `app/api/chat/route.ts`
    - Implement `POST` handler with the following pipeline: authenticate via `getAuthUser()` → check credits > 0 → check rate limit via `checkRateLimit()` → sanitize input via `sanitizeUserInput()` → build system prompt via `buildSystemPrompt()` → call Gemini Flash with system prompt + last 10 conversation messages → stream response via SSE using `createSSEStream` from `lib/sse-helpers.ts` → on completion, call `incrementUsage()`
    - SSE events: `{ type: "token", content: "..." }`, `{ type: "done" }`, `{ type: "error", message: "..." }`
    - Error responses: 401 (unauthenticated), 403 (zero credits), 429 (rate limited with `resetsAt`), 400 (empty/too-long message), 502 (Gemini failure)
    - Truncate conversation history to last 10 messages before sending to Gemini
    - Do NOT log or persist message content (requirement 7.16)
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 3.1, 4.5, 7.10, 7.16_

  - [ ]* 4.2 Write property test for conversation history truncation (Property 2)
    - **Property 2: Conversation history truncation**
    - Generate conversation arrays of length 0-30, verify truncation to last min(N, 10) messages in order
    - **Validates: Requirements 4.5**

  - [ ]* 4.3 Write unit tests for API route error responses
    - Test 401 for unauthenticated requests
    - Test 403 for zero-credit users
    - Test 429 for rate-limited users with correct `resetsAt` field
    - Test 400 for empty message and message > 2000 chars
    - _Requirements: 2.1, 2.2, 2.5_

- [x] 5. Checkpoint - Ensure API route and library modules work together
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Chat UI components
  - [x] 6.1 Create `components/chat/chat-panel.tsx`
    - Implement the right-side collapsible panel: `fixed right-0 top-0 h-full w-[380px] z-40`
    - Collapse/expand with `translate-x` transition (300ms ease)
    - Include: ChatHeader (title "Duelly AI", message counter "N/50 messages today", clear button), scrollable MessageList area, fixed-bottom ChatInput
    - When collapsed, render only the ChatToggleButton (fixed right-4 bottom-4)
    - Apply dark theme with platform color system (SEO=#00e5ff, AEO=#BC13FE, GEO=#fe3f8c)
    - Panel must NOT obstruct main content scroll on desktop
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 6.2 Create `components/chat/message-bubble.tsx`
    - Render user messages (right-aligned) and assistant messages (left-aligned)
    - Assistant messages: render with markdown support (bold, lists, code blocks, links) using a lightweight markdown renderer
    - User messages: plain text
    - _Requirements: 8.5_

  - [ ]* 6.3 Write property test for markdown rendering (Property 8)
    - **Property 8: Markdown rendering produces correct HTML elements**
    - Generate markdown strings with bold, lists, code blocks, links; verify corresponding HTML elements in output
    - **Validates: Requirements 8.5**

  - [x] 6.4 Create `components/chat/chat-input.tsx`
    - Text input with send button, disabled while streaming
    - Show visual streaming indicator (pulsing dots or similar) while `isStreaming` is true
    - Re-enable on stream completion or error
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [x] 6.5 Implement access control states in ChatPanel
    - When `user` is null: show login/signup prompt instead of chat input
    - When `user.credits === 0`: show purchase credits prompt
    - When rate limited (messageCount >= 50): show limit reached message with reset time
    - _Requirements: 2.1, 2.2, 2.6_

  - [ ]* 6.6 Write property test for message counter display (Property 9)
    - **Property 9: Message counter displays correct usage format**
    - Generate integers 0-50, verify rendered counter shows "N/50 messages today"
    - **Validates: Requirements 2.7**

- [x] 7. Chat context provider and state management
  - [x] 7.1 Create `components/chat/duelly-chat-provider.tsx`
    - Implement `DuellyChatProvider` as a React context provider
    - Manage state: `isOpen`, `messages`, `isStreaming`, `messageCount`, `error`, `scanContext`, `proactiveSuggestion`, `user`
    - Persist `isOpen` to localStorage key `duelly-chat-open`, restore on mount
    - Implement `sendMessage`: POST to `/api/chat` with message + conversationHistory (last 10) + scanContext, parse SSE stream, append tokens to current assistant message, handle errors, increment local messageCount on success
    - Implement `clearConversation`: reset messages array to empty
    - Implement `togglePanel`: toggle `isOpen`, persist to localStorage
    - Implement `setScanContext`: update scan context, generate proactive suggestion via `generateProactiveSuggestion()`
    - Fetch initial `messageCount` from API on mount (GET or derive from chat_usage)
    - Show notification badge on toggle button when proactive suggestion available and panel is closed
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3, 3.5, 3.6, 4.1, 4.2, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 7.2 Write property test for clear conversation (Property 7)
    - **Property 7: Clear conversation produces empty state**
    - Generate random message arrays of length 0-20, verify clearConversation results in empty array
    - **Validates: Requirements 8.2**

  - [ ]* 7.3 Write property test for localStorage round-trip (Property 10)
    - **Property 10: Panel open/closed state round-trips through localStorage**
    - Generate random booleans, write to localStorage, read back, verify equality
    - **Validates: Requirements 1.3**

- [x] 8. Integration and wiring
  - [x] 8.1 Wire `DuellyChatProvider` into `app/layout.tsx`
    - Wrap `{children}` with `DuellyChatProvider` inside the existing `ThemeProvider`
    - Render `ChatPanel` inside the provider (it self-positions with `fixed`)
    - _Requirements: 1.1_

  - [x] 8.2 Add scan context injection to tool pages
    - In Pro Audit (`app/pro-audit/page.tsx`), Deep Scan (`app/deep-scan/page.tsx`), Competitor Duel (`app/battle-mode/page.tsx`), Keyword Arena (`app/keyword-arena/page.tsx`), and AI Visibility (`app/ai-test/page.tsx`): call `setScanContext()` from `useDuellyChat()` hook when scan results load
    - Map existing scan result state to the `ScanContext` type (scores, penalties, siteType, platform, backlinks, competitorData, keywordData)
    - Clear scan context (`setScanContext(null)`) on navigation away or when no results loaded
    - _Requirements: 4.1, 4.2, 5.1, 5.2_

  - [ ]* 8.3 Write property test for scan context field preservation (Property 6)
    - **Property 6: Scan context fields are preserved in API payload**
    - Generate random ScanContext objects, verify all non-null fields are present in the request payload sent to the API
    - **Validates: Requirements 4.1**

  - [ ]* 8.4 Write property test for token stream concatenation (Property 5)
    - **Property 5: Token stream concatenation produces complete message**
    - Generate random token sequences, verify concatenation equals the full expected message
    - **Validates: Requirements 3.2**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 10 correctness properties from the design document
- The chat panel uses `fixed` positioning so it does not modify PageShell or PublicNav layouts
- All Gemini calls reuse the existing `GoogleGenerativeAI` pattern from `lib/gemini.ts`
- SSE streaming reuses `createSSEStream` and `SSE_HEADERS` from `lib/sse-helpers.ts`
- Rate limiting uses `supabaseAdmin` (service role) for upsert operations
