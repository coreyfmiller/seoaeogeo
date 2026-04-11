'use client'

import { DuellyChatProvider } from './duelly-chat-provider'

export function ChatWrapper({ children }: { children: React.ReactNode }) {
  return <DuellyChatProvider>{children}</DuellyChatProvider>
}
