'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function ChatMount() {
  const [ChatProvider, setChatProvider] = useState<React.ComponentType<{ children?: React.ReactNode }> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    import('./duelly-chat-provider').then(m => {
      setChatProvider(() => m.DuellyChatProvider)
    })
  }, [])

  if (!mounted || !ChatProvider) return null

  return createPortal(
    <ChatProvider />,
    document.body
  )
}
