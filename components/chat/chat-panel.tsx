'use client'

import { useRef, useEffect } from 'react'
import { X, Trash2, MessageSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import type { ChatMessage } from '@/lib/chat/types'
import Link from 'next/link'

export interface ChatPanelProps {
  isOpen: boolean
  messages: ChatMessage[]
  isStreaming: boolean
  messageCount: number
  messageLimit: number
  error: string | null
  user: { id: string; credits: number } | null
  proactiveSuggestion: string | null
  onToggle: () => void
  onSend: (text: string) => Promise<void>
  onClear: () => void
}

/** Duelly AI icon for the toggle button */
function DuellyIcon() {
  return null // icon is inline in the button below
}

/** Sign-in gate */
function SignInGate() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="text-center space-y-3">
        <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">Sign in to chat with Duelly AI</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-[#00e5ff] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00e5ff]/80 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

/** No credits gate */
function NoCreditsGate() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="text-center space-y-3">
        <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">Purchase credits to use Duelly AI</p>
        <Link
          href="/pricing"
          className="inline-block rounded-lg bg-[#BC13FE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BC13FE]/80 transition-colors"
        >
          Get credits
        </Link>
      </div>
    </div>
  )
}

/** Rate limit gate */
function RateLimitGate() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="text-center space-y-2">
        <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">
          You&apos;ve used all 50 messages today.
        </p>
        <p className="text-xs text-muted-foreground/60">Resets at midnight UTC.</p>
      </div>
    </div>
  )
}

export function ChatPanel({
  isOpen,
  messages,
  isStreaming,
  messageCount,
  messageLimit,
  error,
  user,
  proactiveSuggestion,
  onToggle,
  onSend,
  onClear,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change or streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  const isRateLimited = messageCount >= messageLimit

  // Determine which access state to show
  const getAccessState = () => {
    if (!user) return 'sign-in'
    if (user.credits === 0) return 'no-credits'
    if (isRateLimited) return 'rate-limited'
    return 'normal'
  }

  const accessState = getAccessState()

  // --- Toggle button (visible when panel is collapsed) ---
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          'fixed right-5 bottom-5 z-50 group',
          'flex items-center gap-2 px-4 py-2.5',
          'rounded-full',
          'bg-gradient-to-r from-[#00e5ff] to-[#BC13FE]',
          'shadow-[0_0_20px_rgba(0,229,255,0.3),0_0_40px_rgba(188,19,254,0.15)]',
          'hover:shadow-[0_0_25px_rgba(0,229,255,0.5),0_0_50px_rgba(188,19,254,0.25)]',
          'hover:scale-105 active:scale-95',
          'transition-all duration-200'
        )}
        aria-label="Open Duelly AI chat"
      >
        <MessageSquare className="h-5 w-5 text-white" />
        <span className="text-sm font-black text-white tracking-wide">AI</span>
        {proactiveSuggestion && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#fe3f8c] border-2 border-[#0d0d14] animate-pulse" />
        )}
      </button>
    )
  }

  // --- Full panel ---
  return (
    <div
      style={{ height: '50vh' }}
      className={cn(
        'fixed right-0 bottom-0 w-[380px] z-50',
        'flex flex-col overflow-hidden',
        'bg-[#0d0d14] border-l border-t border-white/10',
        'shadow-2xl rounded-tl-2xl'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#00e5ff]" />
          <h2 className="text-sm font-semibold text-white">Duelly AI</h2>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {messageCount}/{messageLimit}
            </span>
          )}
          {user && messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-white h-7 w-7"
              aria-label="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-white h-7 w-7"
            aria-label="Close Duelly AI chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content area — access-gated */}
      {accessState === 'sign-in' && <SignInGate />}
      {accessState === 'no-credits' && <NoCreditsGate />}
      {accessState === 'rate-limited' && <RateLimitGate />}

      {accessState === 'normal' && (
        <>
          {/* Scrollable message area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Proactive suggestion */}
            {proactiveSuggestion && messages.length === 0 && (
              <div className="rounded-xl bg-[#BC13FE]/10 border border-[#BC13FE]/20 px-3.5 py-2.5 text-sm text-gray-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-[#BC13FE] mt-0.5 shrink-0" />
                  <p>{proactiveSuggestion}</p>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Error display */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Chat input — fixed at bottom */}
          <ChatInput isStreaming={isStreaming} onSend={onSend} />
        </>
      )}
    </div>
  )
}
