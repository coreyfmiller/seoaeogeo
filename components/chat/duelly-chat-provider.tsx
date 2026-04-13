'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateProactiveSuggestion } from '@/lib/chat/proactive-suggestions'
import { ChatPanel } from './chat-panel'
import type {
  ChatMessage,
  ScanContext,
  UserProfile,
  DuellyChatContextValue,
} from '@/lib/chat/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MESSAGE_LIMIT = 100
const MAX_HISTORY = 10

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DuellyChatProvider({ children }: { children: ReactNode }) {
  // --- State ---
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [scanContext, setScanContextState] = useState<ScanContext | null>(null)
  const [proactiveSuggestion, setProactiveSuggestion] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)

  // Abort controller ref for cancelling in-flight streams
  const abortRef = useRef<AbortController | null>(null)

  // -----------------------------------------------------------------------
  // Fetch user profile + listen for auth changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits, plan, full_name, chat_messages_remaining')
          .eq('id', authUser.id)
          .single()

        setUser({
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: profile?.full_name ?? null,
          plan: profile?.plan ?? 'free',
          is_admin: false,
          credits: profile?.credits ?? 0,
        })

        // Set remaining chat messages from profile pool
        setMessageCount(MESSAGE_LIMIT - (profile?.chat_messages_remaining ?? MESSAGE_LIMIT))
      } else {
        setUser(null)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser()
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // -----------------------------------------------------------------------
  // setScanContext (defined before its consumers)
  // -----------------------------------------------------------------------
  const setScanContext = useCallback((ctx: ScanContext | null) => {
    setScanContextState(ctx)
    if (ctx) {
      setProactiveSuggestion(generateProactiveSuggestion(ctx))
    } else {
      setProactiveSuggestion(null)
    }
  }, [])

  // -----------------------------------------------------------------------
  // sendMessage (defined before startTutorial which depends on it)
  // -----------------------------------------------------------------------
  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming) return

      setError(null)

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsStreaming(true)

      const history = [...messages, userMsg].slice(-MAX_HISTORY)

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationHistory: history,
            scanContext: scanContext,
            currentPage: pathname,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          const errMsg = body.error ?? `Request failed (${response.status})`
          setError(errMsg)
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id))
          setIsStreaming(false)
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          setError('No response stream available')
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id))
          setIsStreaming(false)
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data: ')) continue

            const jsonStr = trimmed.slice(6)
            try {
              const event = JSON.parse(jsonStr)

              if (event.type === 'token' && event.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: m.content + event.content }
                      : m
                  )
                )
              } else if (event.type === 'done') {
                setMessageCount((prev) => prev + 1)
              } else if (event.type === 'error') {
                setError(event.message ?? 'An error occurred')
              }
            } catch {
              // Ignore malformed JSON lines
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          setError('Connection lost. Please try again.')
          setMessages((prev) =>
            prev.filter(
              (m) => m.id !== assistantMsg.id || m.content.length > 0
            )
          )
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [isStreaming, messages, scanContext, pathname]
  )

  // -----------------------------------------------------------------------
  // togglePanel
  // -----------------------------------------------------------------------
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => {
      const willClose = prev
      if (willClose) {
        setMessages([])
        setError(null)
      }
      return !prev
    })
  }, [])

  // -----------------------------------------------------------------------
  // clearConversation
  // -----------------------------------------------------------------------
  const clearConversation = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  // -----------------------------------------------------------------------
  // startTutorial (sendMessage is now defined above)
  // -----------------------------------------------------------------------
  const startTutorial = useCallback(() => {
    setMessages([])
    setError(null)
    setIsOpen(true)
    setTimeout(() => {
      sendMessage('Give me a walkthrough of the platform')
    }, 100)
  }, [sendMessage])

  // -----------------------------------------------------------------------
  // Event listeners
  // -----------------------------------------------------------------------

  // Listen for tutorial trigger from sidebar
  useEffect(() => {
    const handler = () => startTutorial()
    window.addEventListener('duelly-start-tutorial', handler)
    return () => window.removeEventListener('duelly-start-tutorial', handler)
  }, [startTutorial])

  // Listen for scan context from tool pages
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setScanContext(detail)
    }
    window.addEventListener('duelly-scan-context', handler)
    return () => window.removeEventListener('duelly-scan-context', handler)
  }, [setScanContext])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <>
      {children}
      <ChatPanel
        isOpen={isOpen}
        messages={messages}
        isStreaming={isStreaming}
        messageCount={messageCount}
        messageLimit={MESSAGE_LIMIT}
        error={error}
        user={user ? { id: user.id, credits: user.credits } : null}
        proactiveSuggestion={proactiveSuggestion}
        onToggle={togglePanel}
        onSend={sendMessage}
      />
    </>
  )
}
