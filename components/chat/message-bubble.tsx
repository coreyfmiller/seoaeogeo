'use client'

import type { ChatMessage } from '@/lib/chat/types'
import { cn } from '@/lib/utils'

/** Lightweight markdown-to-HTML converter for assistant messages */
function markdownToHtml(md: string): string {
  let html = md

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-black/40 rounded-md p-3 my-2 overflow-x-auto text-xs"><code>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code (`...`)
  html = html.replace(/`([^`]+)`/g, (_match, code) => {
    return `<code class="bg-black/30 rounded px-1.5 py-0.5 text-xs text-[#00e5ff]">${escapeHtml(code)}</code>`
  })

  // Bold (**...**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#00e5ff] underline underline-offset-2 hover:text-[#00e5ff]/80">$1</a>'
  )

  // Unordered lists (lines starting with - or *)
  html = html.replace(/^(?:[*-]) (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-1.5 space-y-0.5">$1</ul>')

  // Paragraphs — split on double newlines
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('<pre') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) return trimmed
      return `<p class="mb-1.5 last:mb-0">${trimmed.replace(/\n/g, '<br/>')}</p>`
    })
    .join('')

  return html
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#00e5ff]/15 text-white border border-[#00e5ff]/20'
            : 'bg-white/5 text-gray-200 border border-white/5'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div
            className="prose-chat break-words [&_a]:break-all"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(message.content) }}
          />
        )}
      </div>
    </div>
  )
}
