"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, Target, Lightbulb, Loader2, RefreshCw } from "lucide-react"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface StructuredAnalysis {
  bottomLine: string
  keyInsight: string
  priorityAction: string
  priorityActions?: string[]
}

interface ExpertAnalysisProps {
  analysis?: string | StructuredAnalysis | null
  label?: string
  tooltip?: string
  /** Data to send to /api/expert-analysis for on-demand generation */
  generateData?: Record<string, any>
  /** Auto-generate on mount when analysis is null */
  autoGenerate?: boolean
}

function isStructured(a: string | StructuredAnalysis): a is StructuredAnalysis {
  return typeof a === 'object' && a !== null && 'bottomLine' in a
}

export function ExpertAnalysis({
  analysis: initialAnalysis,
  label = "Expert Analysis",
  tooltip = "AI-powered analysis synthesizing your scores, site data, and competitive position into actionable insights.",
  generateData,
  autoGenerate = false,
}: ExpertAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | StructuredAnalysis | null | undefined>(initialAnalysis)
  const [isGenerating, setIsGenerating] = useState(false)
  const [failed, setFailed] = useState(false)
  const autoFired = useRef(false)

  // Sync with prop changes (new scan results)
  if (initialAnalysis && initialAnalysis !== analysis) {
    setAnalysis(initialAnalysis)
    setFailed(false)
    autoFired.current = false
  }

  const handleGenerate = async () => {
    if (!generateData || isGenerating) return
    setIsGenerating(true)
    setFailed(false)
    try {
      const res = await fetch('/api/expert-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateData),
      })
      const data = await res.json()
      if (data.success && data.analysis) {
        setAnalysis(data.analysis)
      } else {
        setFailed(true)
      }
    } catch {
      setFailed(true)
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-generate when analysis is null/missing and generateData is available
  useEffect(() => {
    if (!initialAnalysis && generateData && !autoFired.current && !isGenerating) {
      autoFired.current = true
      // Small delay to let the page render first
      const timer = setTimeout(() => handleGenerate(), 500)
      return () => clearTimeout(timer)
    }
  }, [initialAnalysis, generateData]) // eslint-disable-line react-hooks/exhaustive-deps

  // Empty state — show generate button
  if (!analysis || (typeof analysis === 'string' && (analysis.trim().startsWith('{') || analysis.trim().startsWith('"bottomLine"')))) {
    if (!generateData) return null

    return (
      <div className="rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/[0.02] backdrop-blur-xl p-5 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-[#00e5ff]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-[#00e5ff] tracking-widest flex items-center gap-1.5">
                {label} <InfoTooltip content={tooltip} />
              </h4>
              <p className="text-xs text-white/40 mt-0.5">
                {failed ? 'Analysis generation failed. Try again.' : 'AI analysis not yet generated for this scan.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isGenerating ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
            ) : (
              <><RefreshCw className="h-3.5 w-3.5" /> Generate Analysis</>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Handle legacy single-string format
  if (typeof analysis === 'string') {
    return (
      <div className="rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/[0.03] backdrop-blur-xl p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00e5ff]/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-[#00e5ff]" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-[#00e5ff] tracking-widest mb-1 flex items-center gap-1.5">
              {label} <InfoTooltip content={tooltip} />
            </h4>
            <p className="text-sm font-medium text-white/80 leading-relaxed">{analysis}</p>
          </div>
        </div>
      </div>
    )
  }

  // Structured sections format
  const priorityActions = analysis.priorityActions || (analysis.priorityAction ? [analysis.priorityAction] : [])
  const sections = [
    { icon: <Zap className="h-3.5 w-3.5" />, title: "Bottom Line", text: analysis.bottomLine, color: "text-[#00e5ff]", border: "border-[#00e5ff]/20", bg: "bg-[#00e5ff]/5" },
    { icon: <Lightbulb className="h-3.5 w-3.5" />, title: "Key Insight", text: analysis.keyInsight, color: "text-[#BC13FE]", border: "border-[#BC13FE]/20", bg: "bg-[#BC13FE]/5" },
    ...priorityActions.map((action, i) => ({
      icon: <Target className="h-3.5 w-3.5" />,
      title: priorityActions.length > 1 ? `Priority Action ${i + 1}` : "Priority Action",
      text: action,
      color: i === 0 ? "text-[#22c55e]" : "text-[#f59e0b]",
      border: i === 0 ? "border-[#22c55e]/20" : "border-[#f59e0b]/20",
      bg: i === 0 ? "bg-[#22c55e]/5" : "bg-[#f59e0b]/5",
    })),
  ].filter(s => s.text)

  if (sections.length === 0) return null

  return (
    <div className="rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/[0.03] backdrop-blur-xl p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00e5ff]/5 rounded-full blur-[60px] pointer-events-none" />
      <div className="relative z-10">
        <h4 className="text-xs font-black uppercase text-[#00e5ff] tracking-widest mb-4 flex items-center gap-1.5">
          {label} <InfoTooltip content={tooltip} />
        </h4>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg border ${s.border} ${s.bg} p-3`}>
              <div className={`h-7 w-7 rounded-md ${s.bg} border ${s.border} flex items-center justify-center shrink-0 ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${s.color} mb-0.5`}>{s.title}</p>
                <p className="text-sm text-white/80 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
