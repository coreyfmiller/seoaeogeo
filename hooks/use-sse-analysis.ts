import { useState, useCallback, useRef, useEffect } from 'react'

interface SSEAnalysisState<T = any> {
  isAnalyzing: boolean
  phase: string
  progress: number
  data: T | null
  error: string | null
  creditsRefunded: number
}

interface UseSSEAnalysisReturn<T = any> extends SSEAnalysisState<T> {
  startAnalysis: (url: string, body?: Record<string, unknown>) => Promise<void>
  reset: () => void
  setData: (data: T) => void
  checkPendingScan: () => Promise<{ found: boolean; url?: string }>
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
    creditsRefunded: 0,
  })
  const [displayProgress, setDisplayProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPollingRef = useRef(false)

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
        if (target >= 85) return target // Stop creeping past 85 — only server updates push higher
        // Slow logarithmic creep: smaller increments as we get higher
        const increment = prev < 30 ? 0.5 : prev < 60 ? 0.3 : 0.15
        return Math.min(target + increment, 85)
      })
    }, 2000)
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
      creditsRefunded: 0,
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

      // Credits were deducted server-side before the stream started — refresh header
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))

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
              // Refresh header credit balance
              if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))
            } else if (event.type === 'error') {
              setState((prev) => ({
                ...prev,
                error: event.error || 'Analysis failed',
                creditsRefunded: event.creditsRefunded || 0,
              }))
              // Refresh header credit balance (refund case)
              if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))
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
    if (pollTimerRef.current) { clearTimeout(pollTimerRef.current); pollTimerRef.current = null }
    isPollingRef.current = false
    setDisplayProgress(0)
    setState({
      isAnalyzing: false,
      phase: '',
      progress: 0,
      data: null,
      error: null,
      creditsRefunded: 0,
    })
  }, [])

  const setData = useCallback((data: T) => {
    setState({
      isAnalyzing: false,
      phase: 'Loaded from history',
      progress: 100,
      data,
      error: null,
      creditsRefunded: 0,
    })
  }, [])

  // Map API endpoint to scan type for the scan-status check
  const scanType = apiEndpoint.includes('deep') ? 'deep'
    : apiEndpoint.includes('competitive') ? 'competitive'
    : 'pro'

  /**
   * Check if there's a pending or completed scan job server-side.
   * Called on page mount to recover from navigation-away.
   * If running, polls every 3s until completed/failed.
   */
  const checkPendingScan = useCallback(async (): Promise<{ found: boolean; url?: string }> => {
    try {
      const res = await fetch(`/api/scan-status?type=${scanType}`)
      if (!res.ok) return { found: false }
      const { job } = await res.json()
      if (!job) return { found: false }

      if (job.status === 'completed' && job.result) {
        // Scan finished while user was away — load the result
        setState({
          isAnalyzing: false,
          phase: 'Loaded from server',
          progress: 100,
          data: job.result as T,
          error: null,
          creditsRefunded: 0,
        })
        setDisplayProgress(100)
        return { found: true, url: job.url }
      }

      if (job.status === 'running') {
        // Scan is still in progress — show polling state and wait
        const initialProgress = job.progress || 0
        setState({
          isAnalyzing: true,
          phase: job.phase || 'Scan in progress...',
          progress: initialProgress,
          data: null,
          error: null,
          creditsRefunded: 0,
        })
        setDisplayProgress(initialProgress)
        isPollingRef.current = true

        // Poll until done
        const poll = async () => {
          if (!isPollingRef.current) return
          try {
            const r = await fetch(`/api/scan-status?type=${scanType}`)
            if (!r.ok) return
            const { job: j } = await r.json()
            if (!j) {
              isPollingRef.current = false
              setState(prev => ({ ...prev, isAnalyzing: false, error: 'Scan job lost' }))
              return
            }
            if (j.status === 'completed' && j.result) {
              isPollingRef.current = false
              setState({
                isAnalyzing: false,
                phase: 'Complete!',
                progress: 100,
                data: j.result as T,
                error: null,
                creditsRefunded: 0,
              })
              setDisplayProgress(100)
              if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits-changed'))
              return
            }
            if (j.status === 'failed') {
              isPollingRef.current = false
              setState(prev => ({ ...prev, isAnalyzing: false, error: j.phase || 'Scan failed' }))
              return
            }
            // Still running — update progress (never go backwards)
            const serverProgress = j.progress || 0
            setState(prev => ({
              ...prev,
              phase: j.phase || prev.phase,
              progress: Math.max(prev.progress, serverProgress),
            }))
            setDisplayProgress(prev => Math.max(prev, serverProgress))
            if (isPollingRef.current) {
              pollTimerRef.current = setTimeout(poll, 3000)
            }
          } catch {
            isPollingRef.current = false
            setState(prev => ({ ...prev, isAnalyzing: false, error: 'Connection lost' }))
          }
        }
        pollTimerRef.current = setTimeout(poll, 3000)
        return { found: true, url: job.url }
      }

      // Failed or other status — don't load
      return { found: false }
    } catch {
      return { found: false }
    }
  }, [scanType])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      isPollingRef.current = false
      if (pollTimerRef.current) { clearTimeout(pollTimerRef.current); pollTimerRef.current = null }
    }
  }, [])

  return { ...state, progress: displayProgress, startAnalysis, reset, setData, checkPendingScan }
}
