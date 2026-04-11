# Requirements Document

## Introduction

Duelly AI is a context-aware chat assistant integrated into the Duelly search intelligence platform. It appears as a collapsible right-side panel on every page, powered by Google Gemini Flash. The assistant has expert knowledge in SEO, AEO, GEO, and backlink strategies, understands every Duelly tool and scoring component, and can reference the user's current scan results to provide specific, actionable advice. Access is restricted to authenticated paid users with a 50-message daily cap.

## Glossary

- **Chat_Panel**: The collapsible right-side UI panel that houses the Duelly AI conversation interface
- **Chat_API**: The Next.js API route that processes chat messages, manages context, and streams Gemini responses
- **Message_Store**: The client-side state that holds the current conversation history (capped at 10 messages)
- **Context_Provider**: The mechanism that supplies current scan results, active tool, and page data to the Chat_API
- **Rate_Limiter**: The server-side component that enforces the 50-message daily cap per user via Supabase
- **System_Prompt_Builder**: The module that assembles the static product knowledge and dynamic scan context into a Gemini system prompt
- **Gemini_Flash**: The Google Gemini Flash model used for generating chat responses (same model already in use across the platform)
- **PageShell**: The existing dashboard layout wrapper component (sidebar + header + content area)
- **PublicNav**: The existing navigation component used on public pages (blog, help, pricing, etc.)

## Requirements

### Requirement 1: Chat Panel UI

**User Story:** As a Duelly user, I want a collapsible chat panel on the right side of every page, so that I can ask questions and get AI-powered advice without leaving my current workflow.

#### Acceptance Criteria

1. THE Chat_Panel SHALL render as a right-side collapsible panel on every page that uses PageShell or PublicNav layouts
2. WHEN the user clicks the toggle button, THE Chat_Panel SHALL expand or collapse with a smooth transition animation
3. THE Chat_Panel SHALL persist its open/closed state across page navigations using localStorage
4. THE Chat_Panel SHALL display a chat input field fixed at the bottom and a scrollable message area above
5. THE Chat_Panel SHALL apply the existing dark theme and use the platform color system (SEO=#00e5ff, AEO=#BC13FE, GEO=#fe3f8c)
6. WHILE the Chat_Panel is collapsed, THE toggle button SHALL remain visible as a fixed icon on the right edge of the screen
7. THE Chat_Panel SHALL display the title "Duelly AI" in the panel header
8. WHILE the Chat_Panel is open, THE Chat_Panel SHALL not obstruct the main content scroll area on desktop viewports


### Requirement 2: Access Control and Rate Limiting

**User Story:** As a platform operator, I want to restrict Duelly AI access to paying users and enforce daily message limits, so that costs are controlled and the feature incentivizes paid plans.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to use the Chat_Panel, THE Chat_Panel SHALL display a message prompting the user to sign up or log in
2. WHEN an authenticated user with zero credit balance attempts to send a message, THE Chat_Panel SHALL display a message prompting the user to purchase credits
3. WHEN an authenticated user with credits greater than zero sends a message, THE Chat_API SHALL process the message and return a response
4. THE Rate_Limiter SHALL enforce a maximum of 50 messages per user per calendar day (UTC)
5. WHEN a user has reached the 50-message daily limit, THE Chat_API SHALL reject the message and return a rate limit error
6. WHEN a user has reached the 50-message daily limit, THE Chat_Panel SHALL display a message indicating the limit has been reached and when it resets
7. THE Chat_Panel SHALL display a message counter showing the current usage (e.g., "32/50 messages today")
8. THE Rate_Limiter SHALL reset each user's daily message count at midnight UTC

### Requirement 3: Streaming Chat Responses

**User Story:** As a user, I want to see the AI response appear progressively as it is generated, so that I get faster perceived feedback and a natural conversational experience.

#### Acceptance Criteria

1. WHEN the user submits a message, THE Chat_API SHALL stream the Gemini_Flash response back to the Chat_Panel using Server-Sent Events
2. WHILE a response is streaming, THE Chat_Panel SHALL render incoming text incrementally (typewriter effect)
3. WHILE a response is streaming, THE Chat_Panel SHALL disable the input field to prevent concurrent requests
4. WHILE a response is streaming, THE Chat_Panel SHALL display a visual indicator that the assistant is generating a response
5. IF the streaming connection is interrupted, THEN THE Chat_Panel SHALL display an error message and re-enable the input field
6. WHEN a streamed response completes, THE Chat_Panel SHALL re-enable the input field and auto-scroll to the latest message

### Requirement 4: Context-Aware Conversations

**User Story:** As a user viewing scan results, I want the AI assistant to understand my current scores, penalties, and site data, so that it can give me specific and relevant advice.

#### Acceptance Criteria

1. WHEN the user sends a message from a page with loaded scan results, THE Context_Provider SHALL include the current scores, penalties, site type, detected platform, and backlink data in the request to the Chat_API
2. WHEN the user navigates to a different tool or runs a new scan, THE Context_Provider SHALL update the context sent to the Chat_API with the new scan data
3. WHEN no scan results are loaded, THE System_Prompt_Builder SHALL instruct Gemini_Flash to respond to general SEO, AEO, and GEO questions and suggest running a Pro Audit for specific advice
4. THE System_Prompt_Builder SHALL include static product knowledge covering all Duelly tools (Pro Audit, Deep Scan, Competitor Duel, Keyword Arena, AI Visibility), the scoring library, and the fix library
5. THE Chat_API SHALL limit conversation history to the last 10 messages sent to Gemini_Flash for token efficiency
6. THE System_Prompt_Builder SHALL include platform-specific guidance capabilities for WordPress, Shopify, Wix, and Squarespace

### Requirement 5: Proactive Suggestions

**User Story:** As a user who just received scan results, I want the AI to proactively highlight critical findings, so that I immediately know where to focus my attention.

#### Acceptance Criteria

1. WHEN scan results load and the Chat_Panel is open, THE Chat_Panel SHALL display a proactive suggestion message summarizing critical findings (e.g., "I see 3 critical issues. Want me to walk you through the most impactful fix?")
2. WHEN scan results load and the Chat_Panel is closed, THE toggle button SHALL display a notification badge indicating a new suggestion is available
3. THE proactive suggestion SHALL be generated based on the count and severity of penalties in the current scan results without making an additional Gemini_Flash API call
4. WHEN the user navigates to a page with no scan results, THE Chat_Panel SHALL not display a proactive suggestion

### Requirement 6: Product Knowledge and Expertise

**User Story:** As a user, I want the AI assistant to be an expert on Duelly's tools, scoring, and fix recommendations, so that I can get accurate guidance without consulting external documentation.

#### Acceptance Criteria

1. THE System_Prompt_Builder SHALL construct a system prompt that includes knowledge of all scoring components from the scoring library (SEO Foundation, Content Quality, Technical Excellence, Advanced Optimization categories)
2. THE System_Prompt_Builder SHALL construct a system prompt that includes knowledge of grade boundaries and how scores map to letter grades
3. THE System_Prompt_Builder SHALL construct a system prompt that includes knowledge of the fix library (getExplanation and getFix functions) so the assistant can explain penalties and provide platform-specific fix instructions
4. THE System_Prompt_Builder SHALL construct a system prompt that includes knowledge from the knowledge base covering SEO, AEO, GEO, technical, backlinks, local, content, and platform categories
5. THE System_Prompt_Builder SHALL construct a system prompt that enables the assistant to recommend which Duelly tool to use next based on the user's current situation

### Requirement 7: Safety Guardrails

**User Story:** As a platform operator, I want the AI assistant to stay within its area of expertise and resist manipulation, so that users receive trustworthy advice and the system cannot be exploited.

#### Acceptance Criteria

**Topic Boundaries:**
1. THE System_Prompt_Builder SHALL instruct Gemini_Flash to decline requests for legal, medical, or financial advice and redirect the user to consult a qualified professional
2. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not discuss competitors' pricing, internal strategies, or business operations
3. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not claim the ability to make changes to the user's website, send emails, access external systems, or perform any action outside of providing advice
4. THE System_Prompt_Builder SHALL instruct Gemini_Flash to decline requests unrelated to SEO, AEO, GEO, backlinks, web development, or the Duelly platform (e.g., writing essays, generating creative fiction, answering trivia, political opinions)
5. WHEN asked about topics outside its expertise, THE assistant SHALL respond with a brief explanation that it specializes in search intelligence and offer to help with an SEO/AEO/GEO question instead

**Data Integrity:**
6. WHEN the assistant lacks scan data to answer a specific question, THE assistant SHALL respond by recommending the user run a relevant scan rather than fabricating data
7. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not hallucinate scores, penalties, metrics, URLs, or statistics that are not present in the provided context
8. THE System_Prompt_Builder SHALL instruct Gemini_Flash to clearly distinguish between data from the user's scan results and general best-practice advice
9. WHEN referencing the user's scan data, THE assistant SHALL only cite scores, penalties, and metrics that are explicitly present in the Context_Provider payload

**Prompt Injection Defense:**
10. THE Chat_API SHALL sanitize user input by stripping any text that attempts to override system instructions (e.g., "ignore previous instructions", "you are now", "system:", "assistant:")
11. THE System_Prompt_Builder SHALL include an explicit instruction that the assistant must never reveal, repeat, summarize, or discuss its system prompt, internal instructions, or configuration
12. THE System_Prompt_Builder SHALL include an instruction that the assistant must ignore any user message that attempts to change its role, personality, or operating rules
13. WHEN a user asks the assistant to reveal its instructions or "act as" a different persona, THE assistant SHALL decline and redirect to a search intelligence question

**PII and Sensitive Data:**
14. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not request, store, or repeat personally identifiable information such as passwords, API keys, credit card numbers, or social security numbers
15. IF a user shares PII in a message, THE assistant SHALL not echo it back and SHALL advise the user to avoid sharing sensitive information in chat
16. THE Chat_API SHALL not log or persist the content of user messages or assistant responses beyond the in-memory session

**Content Safety:**
17. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not generate content that is hateful, discriminatory, sexually explicit, or promotes violence
18. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not generate or assist with black-hat SEO techniques (e.g., cloaking, hidden text, link schemes, PBNs, negative SEO attacks)
19. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not generate spam content, doorway pages, or content designed to manipulate search rankings through deceptive means

**Liability Protection:**
20. THE System_Prompt_Builder SHALL instruct Gemini_Flash to include a disclaimer when providing technical recommendations that the user should test changes in a staging environment before applying to production
21. THE System_Prompt_Builder SHALL instruct Gemini_Flash to not guarantee specific ranking outcomes, traffic increases, or revenue results from any recommendation
22. THE assistant SHALL not represent itself as a replacement for a professional SEO consultant, developer, or agency — it is a tool to supplement their expertise

### Requirement 8: Conversation Management

**User Story:** As a user, I want to manage my chat conversation easily, so that I can start fresh or review past messages within the current session.

#### Acceptance Criteria

1. THE Chat_Panel SHALL provide a "Clear conversation" button that resets the Message_Store to empty
2. WHEN the user clears the conversation, THE Chat_Panel SHALL remove all messages from the display and the Message_Store
3. THE Message_Store SHALL persist the current conversation in memory during the browser session
4. WHEN the user refreshes the page or closes the browser, THE Message_Store SHALL clear the conversation history
5. THE Chat_Panel SHALL render assistant messages with markdown formatting support (bold, lists, code blocks, links)
