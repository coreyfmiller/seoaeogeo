'use client'

import { useState, useEffect, type ReactNode } from 'react'
import dynamic from 'next/dynamic'

const DuellyChatProvider = dynamic(
  () => import('./duelly-chat-provider').then(m => ({ default: m.DuellyChatProvider })),
  { ssr: false }
)

export function ChatWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <DuellyChatProvider>{children}</DuellyChatProvider>
}
