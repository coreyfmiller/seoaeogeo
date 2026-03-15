import { useState, useCallback, useRef } from 'react'

interface SSEAnalysisState<T = any> {
  isAnalyzing: boolean
  phase: string
  progress: number
  data: T | null
  error: string | null
}

interface UseSSEAnalysisReturn<T = any> extends SSEAnalysisState<T> {
  startAnalysis: (url: string, body?: Record<string, unknown>) => Promise<void>
  reset: () => void
}

/**
 * Hook for consuming SSE progress streams from API routes.
 * Replaces the old fetch + fake timer pattern.
 */
export function useSSEAnalysis<T = any>(apiEndpoint: string): UseSSEAnalysisReturn<T> {
  const [state, setState] = useState<SSEAnalysisState<T>>({
    isAnalyzing: false,
    phase: '',
    progress: 0,
    data: null,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const startAnalysis = useCallback(async (url: string, body?: Record<string, unknown>) => {
    // Abort any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({
      isAnalyzing: true,
      phase: 'Initializing analysis...',
      progress: 0,
      data: null,
      error: null,
    })

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...body }),
        signal: controller.signal,
      })

      if (!response.body) {
        throw new Error('No response stream')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, '').trim()
          if (!dataLine) continue

          try {
            const event = JSON.parse(dataLine)

            if (event.type === 'progress') {
              setState((prev) => ({
                ...prev,
                phase: event.phase,
                progress: event.progress,
              }))
            } else if (event.type === 'result') {
              const resultData = event.success !== undefined
                ? (event.data ?? event)
                : event
              setState((prev) => ({
                ...prev,
                data: resultData as T,
                phase: 'Complete!',
                progress: 100,
              }))
            } else if (event.type === 'error') {
              setState((prev) => ({
                ...prev,
                error: event.error || 'Analysis failed',
              }))
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setState((prev) => ({
          ...prev,
          error: err.message || 'Connection failed',
        }))
      }
    } finally {
      setState((prev) => ({ ...prev, isAnalyzing: false, phase: '', progress: 0 }))
    }
  }, [apiEndpoint])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState({
      isAnalyzing: false,
      phase: '',
      progress: 0,
      data: null,
      error: null,
    })
  }, [])

  return { ...state, startAnalysis, reset }
}
