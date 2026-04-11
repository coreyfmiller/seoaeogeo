import type { UserProfile } from '@/lib/supabase/auth-helpers'

// Re-export for convenience
export type { UserProfile }

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ScanContext {
  tool: 'pro-audit' | 'deep-scan' | 'battle-mode' | 'keyword-arena' | 'ai-test' | null
  url?: string
  seoScore?: number
  aeoScore?: number
  geoScore?: number
  siteType?: string
  platform?: string
  criticalIssues?: string[]
  penalties?: Array<{
    component: string
    penalty: string
    severity: 'critical' | 'warning' | 'info'
    pointsDeducted: number
    explanation: string
    fix: string
  }>
  backlinks?: {
    domainAuthority: number
    totalBacklinks: number
    topBacklinks: Array<{ source: string; anchor: string }>
  }
  competitorData?: any
  keywordData?: any
}

export interface ChatRequest {
  message: string
  conversationHistory: ChatMessage[]
  scanContext: ScanContext | null
  currentPage?: string
}

export interface DuellyChatContextValue {
  // State
  isOpen: boolean
  messages: ChatMessage[]
  isStreaming: boolean
  messageCount: number
  messageLimit: number // 50
  error: string | null

  // Scan context
  scanContext: ScanContext | null
  setScanContext: (ctx: ScanContext | null) => void

  // Actions
  togglePanel: () => void
  sendMessage: (text: string) => Promise<void>
  clearConversation: () => void
  startTutorial: () => void

  // Auth state
  user: UserProfile | null

  // Proactive suggestions
  proactiveSuggestion: string | null
}
