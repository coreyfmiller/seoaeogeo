/**
 * Shared SSE (Server-Sent Events) helpers for streaming progress from API routes.
 */

export type SSEEvent = Record<string, unknown>

export type SSESender = (data: SSEEvent) => void

/**
 * Creates a ReadableStream that streams SSE events.
 * The `handler` receives a `send` function to emit progress events.
 */
export function createSSEStream(
  handler: (send: SSESender) => Promise<void>
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      let closed = false
      const send: SSESender = (data) => {
        if (closed) return
        try {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        } catch {
          // Controller already closed, ignore
        }
      }
      try {
        await handler(send)
      } finally {
        closed = true
        try { controller.close() } catch { /* already closed */ }
      }
    },
  })
}

/** Standard SSE Response headers */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
}

/**
 * Creates a progress ticker that bumps progress at a regular interval.
 * Returns a stop function. Automatically caps at `maxProgress`.
 */
export function createProgressTicker(
  send: SSESender,
  phase: string,
  startProgress: number,
  maxProgress: number,
  incrementBy = 4,
  intervalMs = 2000
): { stop: () => number } {
  let current = startProgress
  const timer = setInterval(() => {
    current = Math.min(current + incrementBy, maxProgress)
    send({ type: 'progress', phase, progress: current })
  }, intervalMs)

  return {
    stop: () => {
      clearInterval(timer)
      return current
    },
  }
}
