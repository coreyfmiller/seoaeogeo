'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Trash2, MessageSquare, Sparkles, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateProactiveSuggestion } from '@/lib/chat/proactive-suggestions'
import { cn } from '@/lib/utils'
import type { ChatMessage, ScanContext } from '@/lib/chat/types'

// ---------------------------------------------------------------------------
// Markdown renderer (inline, no external deps)
// ---------------------------------------------------------------------------
function markdownToHtml(md: string): string {
  let html = md
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, _l, code) =>
    `<pre class="bg-black/40 rounded-md p-3 my-2 overflow-x-auto text-xs"><code>${code.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`)
  html = html.replace(/`([^`]+)`/g, (_m, c) =>
    `<code class="bg-black/30 rounded px-1.5 py-0.5 text-xs text-[#00e5ff]">${c.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</code>`)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#00e5ff] underline">$1</a>')
  html = html.replace(/^(?:[*-]) (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-1.5 space-y-0.5">$1</ul>')
  html = html.split(/\n{2,}/).map(b => {
    const t = b.trim()
    if (!t || t.startsWith('<pre') || t.startsWith('<ul')) return t
    return `<p class="mb-1.5 last:mb-0">${t.replace(/\n/g,'<br/>')}</p>`
  }).join('')
  return html
}

// ---------------------------------------------------------------------------
// Main Chat Page
// ---------------------------------------------------------------------------
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [scanContext, setScanContext] = useState<ScanContext | null>(null)
  const [proactiveSuggestion, setProactiveSuggestion] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; credits: number } | null>(null)
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isStreaming])

  // Load user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        supabase.from('profiles').select('credits').eq('id', u.id).single()
          .then(({ data }) => setUser({ id: u.id, credits: data?.credits ?? 0 }))
        // Fetch chat messages remaining from profile
        supabase.from('profiles').select('chat_messages_remaining').eq('id', u.id).single()
          .then(({ data }) => { if (data) setMessageCount(100 - (data.chat_messages_remaining ?? 100)) })
      }
    })
  }, [])

  // Listen for postMessage from parent (scan context, tutorial trigger)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'duelly-scan-context') {
        const ctx = e.data.payload as ScanContext | null
        setScanContext(ctx)
        if (ctx) setProactiveSuggestion(generateProactiveSuggestion(ctx))
        else setProactiveSuggestion(null)
      }
      if (e.data?.type === 'duelly-start-tutorial') {
        setMessages([])
        setError(null)
        setTimeout(() => sendMessage('Give me a walkthrough of the platform'), 100)
      }
      if (e.data?.type === 'duelly-page-context') {
        // Store current page path for system prompt
        setScanContext(prev => prev ? { ...prev, tool: e.data.payload } : null)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (isStreaming || !text.trim()) return
    setError(null)

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() }
    const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    const history = [...messages, userMsg].slice(-10)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationHistory: history, scanContext, currentPage: scanContext?.tool || '' }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? `Request failed (${res.status})`)
        setMessages(prev => prev.filter(m => m.id !== assistantMsg.id))
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { setError('No stream'); setIsStreaming(false); return }
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
          try {
            const event = JSON.parse(trimmed.slice(6))
            if (event.type === 'token' && event.content) {
              setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: m.content + event.content } : m))
            } else if (event.type === 'done') {
              setMessageCount(prev => prev + 1)
            } else if (event.type === 'error') {
              setError(event.message ?? 'Error')
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setError('Connection lost.')
        setMessages(prev => prev.filter(m => m.id !== assistantMsg.id || m.content.length > 0))
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [isStreaming, messages, scanContext])

  const handleSend = () => {
    const t = inputText.trim()
    if (!t || isStreaming) return
    setInputText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    sendMessage(t)
  }

  const isRateLimited = messageCount >= 100

  // Tell parent to close
  const handleClose = () => {
    window.parent.postMessage({ type: 'duelly-chat-close' }, '*')
  }

  // ── Render ──
  return (
    <div className="flex flex-col h-screen bg-[#0d0d14] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#00e5ff]" />
          <h2 className="text-sm font-semibold">Duelly AI</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 tabular-nums">{messageCount}/100</span>
          <button onClick={() => { setMessages([]); setError(null) }} className="text-white/40 hover:text-white h-7 w-7 inline-flex items-center justify-center rounded-md" aria-label="Clear">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleClose} className="text-white/40 hover:text-white h-7 w-7 inline-flex items-center justify-center rounded-md" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Gate checks */}
      {!user ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center space-y-3">
            <MessageSquare className="h-10 w-10 text-white/20 mx-auto" />
            <p className="text-sm text-white/40">Sign in to chat with Duelly AI</p>
            <a href="/login" target="_top" className="inline-block rounded-lg bg-[#00e5ff] px-4 py-2 text-sm font-semibold text-black">Sign in</a>
          </div>
        </div>
      ) : user.credits === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center space-y-3">
            <MessageSquare className="h-10 w-10 text-white/20 mx-auto" />
            <p className="text-sm text-white/40">Purchase credits to use Duelly AI</p>
            <a href="/pricing" target="_top" className="inline-block rounded-lg bg-[#BC13FE] px-4 py-2 text-sm font-semibold text-white">Get credits</a>
          </div>
        </div>
      ) : isRateLimited ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-white/40">You've used all your chat messages.</p>
            <p className="text-xs text-white/20">Refill 100 messages for 10 credits.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Welcome + quick actions */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#00e5ff]/5 border border-[#00e5ff]/15 px-3.5 py-3 text-sm text-gray-200">
                  <p className="font-semibold text-white mb-1.5">Hey, I'm Duelly AI.</p>
                  <p className="text-white/60 text-xs leading-relaxed">I can help you understand your scores, explain fixes, build a backlink strategy, or walk you through the platform.</p>
                </div>
                {proactiveSuggestion && (
                  <div className="rounded-xl bg-[#BC13FE]/10 border border-[#BC13FE]/20 px-3.5 py-2.5 text-sm text-gray-200">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-[#BC13FE] mt-0.5 shrink-0" />
                      <p>{proactiveSuggestion}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => sendMessage('Give me a walkthrough of the platform')} disabled={isStreaming}
                    className="px-3 py-1.5 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 text-xs font-medium text-[#00e5ff] hover:bg-[#00e5ff]/20 disabled:opacity-50">Take a tour</button>
                  <button onClick={() => sendMessage('What should I do first?')} disabled={isStreaming}
                    className="px-3 py-1.5 rounded-lg bg-[#BC13FE]/10 border border-[#BC13FE]/20 text-xs font-medium text-[#BC13FE] hover:bg-[#BC13FE]/20 disabled:opacity-50">What should I do first?</button>
                  <button onClick={() => sendMessage('Explain my current scores and what I should fix first')} disabled={isStreaming}
                    className="px-3 py-1.5 rounded-lg bg-[#fe3f8c]/10 border border-[#fe3f8c]/20 text-xs font-medium text-[#fe3f8c] hover:bg-[#fe3f8c]/20 disabled:opacity-50">Explain my scores</button>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user' ? 'bg-[#00e5ff]/15 text-white border border-[#00e5ff]/20' : 'bg-white/5 text-gray-200 border border-white/5')}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : (
                    <div className="prose-chat break-words [&_a]:break-all" dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }} />
                  )}
                </div>
              </div>
            ))}

            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">{error}</div>}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 bg-[#0d0d14]">
            {isStreaming && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/40">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#BC13FE] animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#fe3f8c] animate-pulse [animation-delay:300ms]" />
                </span>
                <span>Duelly is thinking…</span>
              </div>
            )}
            <div className="flex items-end gap-2 p-3">
              <textarea ref={textareaRef} value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                onInput={() => { const el = textareaRef.current; if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 120)}px` } }}
                disabled={isStreaming} placeholder={isStreaming ? 'Waiting…' : 'Ask Duelly AI…'} rows={1}
                className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00e5ff]/40 disabled:opacity-50 max-h-[120px]" />
              <button onClick={handleSend} disabled={!inputText.trim() || isStreaming}
                className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-md bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black disabled:opacity-30" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
