"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Play, Square, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

const PHASES = [
  "Crawling page and extracting content...",
  "Analyzing schemas and structure...",
  "Running AI semantic analysis...",
  "Calculating SEO, AEO, and GEO scores...",
  "Finalizing audit report...",
]

export default function AnimationPage() {
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (running) {
      setPhaseIndex(0)
      intervalRef.current = setInterval(() => {
        setPhaseIndex((prev) => {
          if (prev >= PHASES.length - 1) return prev
          return prev + 1
        })
      }, 4000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const handleStart = () => {
    setPhaseIndex(0)
    setRunning(true)
  }

  const handleStop = () => setRunning(false)

  const handleReset = () => {
    setRunning(false)
    setPhaseIndex(0)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold text-foreground">Loading Animation Sandbox</h1>

      {/* Controls */}
      <div className="flex gap-3">
        <Button onClick={handleStart} disabled={running} variant="default" className="gap-2">
          <Play className="h-4 w-4" /> Start
        </Button>
        <Button onClick={handleStop} disabled={!running} variant="destructive" className="gap-2">
          <Square className="h-4 w-4" /> Stop
        </Button>
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>

      {/* Animation Preview */}
      <div className="relative w-full max-w-lg">
        <div
          className={cn(
            "bg-card/90 border border-seo/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 transition-all duration-300",
            running ? "animate-in fade-in zoom-in-95" : "opacity-60"
          )}
        >
          <div
            className={cn(
              "h-12 w-12 rounded-full border-2 border-t-seo border-r-aeo border-b-geo border-l-transparent",
              running && "animate-spin"
            )}
          />
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">Pro Audit in Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {running ? PHASES[phaseIndex] : "Click Start to simulate a scan"}
            </p>
          </div>
          <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
            {running && (
              <div className="h-full bg-gradient-to-r from-seo via-aeo to-geo animate-progress-slow" />
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Phase {phaseIndex + 1} of {PHASES.length}</p>
    </div>
  )
}
