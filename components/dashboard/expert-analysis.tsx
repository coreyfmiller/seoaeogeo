"use client"

import { Zap } from "lucide-react"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface ExpertAnalysisProps {
  analysis: string
  label?: string
  tooltip?: string
}

export function ExpertAnalysis({ analysis, label = "Expert Analysis", tooltip = "AI-powered analysis synthesizing your scores, site data, and competitive position into actionable insights." }: ExpertAnalysisProps) {
  if (!analysis) return null

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
