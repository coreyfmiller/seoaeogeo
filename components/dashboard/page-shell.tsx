"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "./app-sidebar"
import { Header } from "./header"
import { MobileSidebar } from "./mobile-sidebar"

interface PageShellProps {
  children: React.ReactNode
  onAnalyze?: (url: string) => void
  isAnalyzing?: boolean
  currentUrl?: string
  apiStatus?: "healthy" | "error" | "idle"
  hideSearch?: boolean
  placeholder?: string
  buttonLabel?: string
}

export function PageShell({
  children,
  onAnalyze,
  isAnalyzing,
  currentUrl,
  apiStatus = "idle",
  hideSearch,
  placeholder,
  buttonLabel,
}: PageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ChatComponent, setChatComponent] = useState<React.ComponentType<{ children?: React.ReactNode }> | null>(null)

  useEffect(() => {
    import('@/components/chat/duelly-chat-provider').then(m => {
      setChatComponent(() => m.DuellyChatProvider)
    })
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <AppSidebar mobile />
      </MobileSidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onAnalyze={onAnalyze}
          isAnalyzing={isAnalyzing}
          currentUrl={currentUrl}
          apiStatus={apiStatus}
          hideSearch={hideSearch}
          placeholder={placeholder}
          buttonLabel={buttonLabel}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        {children}
      </div>
      {ChatComponent && <ChatComponent />}
    </div>
  )
}
