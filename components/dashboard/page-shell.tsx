"use client"

import { useState, useEffect, useRef } from "react"
import { AppSidebar } from "./app-sidebar"
import { Header } from "./header"
import { MobileSidebar } from "./mobile-sidebar"
import { MessageSquare } from "lucide-react"

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
  const [chatOpen, setChatOpen] = useState(false)
  const chatRef = useRef<HTMLIFrameElement>(null)

  // Listen for close message from chat iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'duelly-chat-close') setChatOpen(false)
    }
    window.addEventListener('message', handler)

    // Listen for open-chat event from sidebar Tutorial button
    const openHandler = () => setChatOpen(true)
    window.addEventListener('duelly-open-chat', openHandler)

    return () => {
      window.removeEventListener('message', handler)
      window.removeEventListener('duelly-open-chat', openHandler)
    }
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

      {/* Chat toggle button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed right-5 bottom-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#BC13FE] shadow-[0_0_20px_rgba(0,229,255,0.3),0_0_40px_rgba(188,19,254,0.15)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5),0_0_50px_rgba(188,19,254,0.25)] hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open Duelly AI chat"
        >
          <MessageSquare className="h-5 w-5 text-white" />
          <span className="text-sm font-black text-white tracking-wide">Ask Duelly</span>
        </button>
      )}

      {/* Chat iframe */}
      {chatOpen && (
        <iframe
          ref={chatRef}
          src="/chat"
          className="fixed right-0 bottom-0 w-[380px] z-50 border-l border-t border-white/10 rounded-tl-2xl shadow-2xl"
          style={{ height: '50vh' }}
          title="Duelly AI Chat"
        />
      )}
    </div>
  )
}
