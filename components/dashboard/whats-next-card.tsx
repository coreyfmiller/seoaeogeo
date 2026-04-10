"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Layers, Trophy, Swords, Bot, FlaskConical } from "lucide-react"

interface NextStep {
  href: string
  icon: React.ReactNode
  title: string
  reason: string
  credits: number
}

interface WhatsNextCardProps {
  steps: NextStep[]
}

export function WhatsNextCard({ steps }: WhatsNextCardProps) {
  if (steps.length === 0) return null
  return (
    <Card className="border-white/[0.06] bg-white/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base">What&apos;s Next?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step, i) => (
          <Link key={i} href={step.href}
            className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:border-[#00e5ff]/30 hover:bg-[#00e5ff]/[0.03] transition-all group">
            <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] shrink-0">
              {step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-[#00e5ff] transition-colors">{step.title}</p>
              <p className="text-xs text-white/40 leading-relaxed">{step.reason}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-white/20">{step.credits} credits</span>
              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#00e5ff] group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

// Pre-built step configs for each tool
export const NEXT_STEPS = {
  deepScan: (url?: string) => ({
    href: '/deep-scan',
    icon: <Layers className="h-4 w-4" />,
    title: 'Deep Scan',
    reason: url ? `Scan all pages on ${new URL(url.startsWith('http') ? url : 'https://' + url).hostname} for site-wide issues` : 'Scan your entire site for issues across all pages',
    credits: 15,
  }),
  keywordArena: (context?: string) => ({
    href: '/keyword-arena',
    icon: <Trophy className="h-4 w-4" />,
    title: 'Keyword Arena',
    reason: context || 'See how your scores compare against the top Google competitors',
    credits: 10,
  }),
  competitorDuel: (rival?: string) => ({
    href: '/battle-mode',
    icon: <Swords className="h-4 w-4" />,
    title: 'Competitor Duel',
    reason: rival ? `Go head-to-head against ${rival}` : 'Pick a rival and compare every metric side by side',
    credits: 10,
  }),
  proAudit: (context?: string) => ({
    href: '/pro-audit',
    icon: <Bot className="h-4 w-4" />,
    title: 'Pro Audit',
    reason: context || 'Get a full SEO, AEO, and GEO breakdown with fix instructions',
    credits: 10,
  }),
  aiVisibility: (keyword?: string) => ({
    href: '/ai-test',
    icon: <FlaskConical className="h-4 w-4" />,
    title: 'AI Visibility',
    reason: keyword ? `Check if AI engines recommend you for "${keyword}"` : 'See if Google, Gemini, ChatGPT, and Perplexity can find you',
    credits: 5,
  }),
}
