'use client'

import { useState, useEffect, type ReactNode } from 'react'

export function ChatWrapper({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null)

  useEffect(() => {
    import('./duelly-chat-provider').then(m => {
      setProvider(() => m.DuellyChatProvider)
    })
  }, [])

  if (!Provider) {
    return <>{children}</>
  }

  return <Provider>{children}</Provider>
}
