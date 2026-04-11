'use client'

import { useState, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  isStreaming: boolean
  onSend: (text: string) => Promise<void>
}

function StreamingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#BC13FE] animate-pulse [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#fe3f8c] animate-pulse [animation-delay:300ms]" />
      </span>
      <span>Duelly is thinking…</span>
    </div>
  )
}

export function ChatInput({ isStreaming, onSend }: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await onSend(trimmed)
  }, [text, isStreaming, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="border-t border-white/10 bg-[#0d0d14]">
      {isStreaming && <StreamingIndicator />}
      <div className="flex items-end gap-2 p-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isStreaming}
          placeholder={isStreaming ? 'Waiting for response…' : 'Ask Duelly AI…'}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
            'placeholder:text-muted-foreground/60 outline-none',
            'focus:border-[#00e5ff]/40 focus:ring-1 focus:ring-[#00e5ff]/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'max-h-[120px]'
          )}
        />
        <Button
          size="icon-sm"
          onClick={handleSend}
          disabled={!text.trim() || isStreaming}
          className="shrink-0 bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black disabled:opacity-30"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
