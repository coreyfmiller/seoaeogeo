import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAuthUser } from '@/lib/supabase/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkRateLimit, incrementUsage } from '@/lib/chat/rate-limiter'
import { sanitizeUserInput } from '@/lib/chat/input-sanitizer'
import { buildSystemPrompt } from '@/lib/chat/system-prompt-builder'
import { getGeminiModel } from '@/lib/gemini-model-resolver'
import type { ChatMessage, ScanContext } from '@/lib/chat/types'

export const maxDuration = 60

const MAX_MESSAGE_LENGTH = 2000
const MAX_HISTORY_MESSAGES = 10

export async function POST(request: NextRequest) {
  // 1. Parse request body
  let message: string
  let conversationHistory: ChatMessage[]
  let scanContext: ScanContext | null
  let currentPage: string | undefined

  try {
    const body = await request.json()
    message = body.message ?? ''
    conversationHistory = body.conversationHistory ?? []
    scanContext = body.scanContext ?? null
    currentPage = body.currentPage
    scanContext = body.scanContext ?? null
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 2. Authenticate
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // 3. Check credits > 0
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.credits ?? 0) <= 0) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 403 })
  }

  // 4. Check rate limit
  const rateLimit = await checkRateLimit(user.id)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Daily limit reached', resetsAt: rateLimit.resetsAt },
      { status: 429 }
    )
  }

  // 5. Validate message
  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  // 6. Sanitize input
  const sanitizedMessage = sanitizeUserInput(message)

  // 7. Build system prompt
  const systemPrompt = buildSystemPrompt(scanContext, currentPage)

  // 8. Truncate conversation history to last 10 messages
  const truncatedHistory = conversationHistory.slice(-MAX_HISTORY_MESSAGES)

  // 9. Call Gemini Flash with streaming
  // 10. Stream response back via SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendEvent = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Controller already closed
        }
      }

      try {
        const genAI = new GoogleGenerativeAI(
          process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
        )
        const modelName = await getGeminiModel()
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
          },
          systemInstruction: systemPrompt,
        })

        // Build Gemini content array from conversation history + current message
        const contents = truncatedHistory.map((msg: ChatMessage) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }))
        contents.push({
          role: 'user',
          parts: [{ text: sanitizedMessage }],
        })

        const result = await model.generateContentStream({ contents })

        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            sendEvent({ type: 'token', content: text })
          }
        }

        // 11. On completion, increment usage
        await incrementUsage(user.id)

        sendEvent({ type: 'done' })
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate response'
        sendEvent({ type: 'error', message: errorMessage })
      } finally {
        try {
          controller.close()
        } catch {
          // Already closed
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
