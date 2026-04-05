"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { getKnowledge, type KnowledgeEntry } from "@/lib/knowledge-base"
import { X, BookOpen, Lightbulb, Target, BarChart3, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LearnMoreProps {
  term: string
  className?: string
  /** Render as inline text link instead of icon */
  inline?: boolean
  /** Custom label for inline mode */
  label?: string
}

function LearnMoreModal({ entry, onClose }: { entry: KnowledgeEntry; onClose: () => void }) {
  const categoryColors: Record<string, string> = {
    seo: 'text-[#00e5ff] bg-[#00e5ff]/10 border-[#00e5ff]/30',
    aeo: 'text-[#BC13FE] bg-[#BC13FE]/10 border-[#BC13FE]/30',
    geo: 'text-[#fe3f8c] bg-[#fe3f8c]/10 border-[#fe3f8c]/30',
    technical: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    backlinks: 'text-green-400 bg-green-400/10 border-green-400/30',
    local: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    content: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    platform: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border/50 px-5 py-4 flex items-start justify-between z-10 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-block", categoryColors[entry.category] || 'text-muted-foreground')}>
              {entry.category}
            </span>
            <h3 className="text-lg font-bold mt-2">{entry.term}</h3>
            <p className="text-sm text-muted-foreground mt-1">{entry.shortDesc}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0 ml-3">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* What is it */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
              <BookOpen className="h-3.5 w-3.5" /> What is it?
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{entry.fullDesc}</p>
          </div>

          {/* Why it matters */}
          <div className="rounded-lg border border-[#fe3f8c]/20 bg-[#fe3f8c]/5 p-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#fe3f8c] flex items-center gap-1.5 mb-2">
              <Target className="h-3.5 w-3.5" /> Why it matters
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{entry.whyItMatters}</p>
          </div>

          {/* Tips */}
          {entry.tips.length > 0 && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-green-500 flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3.5 w-3.5" /> What you can do
              </h4>
              <ul className="space-y-1.5">
                {entry.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-green-500 font-bold shrink-0 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {entry.commonMistakes && entry.commonMistakes.length > 0 && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Common mistakes
              </h4>
              <ul className="space-y-1.5">
                {entry.commonMistakes.map((mistake, i) => (
                  <li key={i} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          {entry.timelineExpectation && (
            <div className="rounded-lg border border-[#00e5ff]/20 bg-[#00e5ff]/5 p-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#00e5ff] flex items-center gap-1.5 mb-2">
                <Clock className="h-3.5 w-3.5" /> Timeline
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{entry.timelineExpectation}</p>
            </div>
          )}

          {/* Benchmarks */}
          {entry.benchmarks && (
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                <BarChart3 className="h-3.5 w-3.5" /> Benchmarks
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-green-500 shrink-0" /> <span className="text-green-500 font-bold">Good:</span> <span className="text-foreground/70">{entry.benchmarks.good}</span></div>
                <div className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-yellow-500 shrink-0" /> <span className="text-yellow-500 font-bold">Average:</span> <span className="text-foreground/70">{entry.benchmarks.average}</span></div>
                <div className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-red-500 shrink-0" /> <span className="text-red-500 font-bold">Poor:</span> <span className="text-foreground/70">{entry.benchmarks.poor}</span></div>
              </div>
            </div>
          )}

          {/* Learn more link */}
          {entry.learnMoreUrl && (
            <Link href={entry.learnMoreUrl} className="block text-center text-sm font-bold text-[#00e5ff] hover:underline py-2">
              Read the full guide →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function LearnMore({ term, className, inline, label }: LearnMoreProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const entry = getKnowledge(term)

  useEffect(() => { setMounted(true) }, [])

  if (!entry) return null

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setOpen(true)
  }

  return (
    <>
      {inline ? (
        <button onClick={handleClick} className={cn("text-[#00e5ff] hover:underline text-xs font-semibold cursor-pointer", className)}>
          {label || 'Learn more'}
        </button>
      ) : (
        <button
          onClick={handleClick}
          className={cn(
            "inline-flex items-center justify-center h-4 w-4 rounded-full",
            "bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/30",
            "text-[9px] font-black leading-none transition-colors shrink-0",
            className
          )}
          title={entry.shortDesc}
        >
          ?
        </button>
      )}

      {open && mounted && createPortal(
        <LearnMoreModal entry={entry} onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  )
}
