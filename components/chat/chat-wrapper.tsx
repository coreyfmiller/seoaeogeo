'use client'

import { useState, useEffect } from 'react'
import { DuellyChatProvider } from './duelly-chat-provider'

export function ChatWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <DuellyChatProvider>{children}</DuellyChatProvider>
}
