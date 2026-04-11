'use client'

import { createContext, useContext } from 'react'
import type { DuellyChatContextValue } from '@/lib/chat/types'

export const DuellyChatContext = createContext<DuellyChatContextValue | null>(null)

const noopContext: DuellyChatContextValue = {
  isOpen: false,
  messages: [],
  isStreaming: false,
  messageCount: 0,
  messageLimit: 50,
  error: null,
  scanContext: null,
  setScanContext: () => {},
  togglePanel: () => {},
  sendMessage: async () => {},
  clearConversation: () => {},
  startTutorial: () => {},
  user: null,
  proactiveSuggestion: null,
}

export function useDuellyChat(): DuellyChatContextValue {
  const ctx = useContext(DuellyChatContext)
  return ctx ?? noopContext
}
