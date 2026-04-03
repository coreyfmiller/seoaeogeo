"use client"

import { Zap, Target, Lightbulb } from "lucide-react"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface StructuredAnalysis {
  bottomLine: string
  keyInsight: string
  priorityAction: string
}

interface ExpertAnalysisProps {
  analysis: string | StructuredAnalysis
  label?: string
  tooltip?: string
}

function isStructured(a: string | StructuredAnalysis): a is StructuredAnalysis {
  return typeof a === 'object' && a !== null && 'bottomLine' in a
}

export function ExpertAnalysis({ analysis, label = "Expert Analysis", tooltip = "AI-powered analysis synthesizing your scores, site data, and competitive position into actionable insights." }: ExpertAnalysisProps) {
  if (!analysis) return null

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

  // Structured 3-section format
  const sections = [
    { icon: <Zap className="h-3.5 w-3.5" />, title: "Bottom Line", text: analysis.bottomLine, color: "text-[#00e5ff]", border: "border-[#00e5ff]/20", bg: "bg-[#00e5ff]/5" },
    { icon: <Lightbulb className="h-3.5 w-3.5" />, title: "Key Insight", text: analysis.keyInsight, color: "text-[#BC13FE]", border: "border-[#BC13FE]/20", bg: "bg-[#BC13FE]/5" },
    { icon: <Target className="h-3.5 w-3.5" />, title: "Priority Action", text: analysis.priorityAction, color: "text-[#22c55e]", border: "border-[#22c55e]/20", bg: "bg-[#22c55e]/5" },
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
