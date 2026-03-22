import { useState, useCallback, useRef, useEffect } from 'react'

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
  setData: (data: T) => void
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
  const [displayProgress, setDisplayProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // Client-side progress creep: slowly walks up when server goes quiet, caps at 99
  useEffect(() => {
    if (!state.isAnalyzing) {
      // Not analyzing — don't touch displayProgress (it stays where it was)
      return
    }
    // If server sent 100, snap immediately
    if (state.progress >= 100) {
      setDisplayProgress(100)
      return
    }
    // Jump to server progress if it's ahead
    setDisplayProgress(prev => Math.max(prev, state.progress))
    const timer = setInterval(() => {
      setDisplayProgress(prev => {
        const target = Math.max(prev, state.progress)
        if (target >= 99) return 99
        return Math.min(target + 1, 99)
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [state.isAnalyzing, state.progress])

  const startAnalysis = useCallback(async (url: string, body?: Record<string, unknown>) => {
    // Abort any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setDisplayProgress(0)
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

      if (!response.ok) {
        // Handle non-SSE error responses (401, 402, etc.)
        try {
          const errBody = await response.json()
          throw new Error(errBody.error || `Request failed (${response.status})`)
        } catch (e: any) {
          if (e.message && e.message !== 'Unexpected end of JSON input') throw e
          throw new Error(`Request failed (${response.status})`)
        }
      }

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
    setDisplayProgress(0)
    setState({
      isAnalyzing: false,
      phase: '',
      progress: 0,
      data: null,
      error: null,
    })
  }, [])

  const setData = useCallback((data: T) => {
    setState({
      isAnalyzing: false,
      phase: 'Loaded from history',
      progress: 100,
      data,
      error: null,
    })
  }, [])

  return { ...state, progress: displayProgress, startAnalysis, reset, setData }
}
