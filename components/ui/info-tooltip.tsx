"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: string
  className?: string
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/30 text-[9px] font-black leading-none transition-colors shrink-0 ${className || ''}`}
          onClick={(e) => e.preventDefault()}
        >
          ?
          <span className="sr-only">More information</span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={4}
        className="max-w-xs text-sm leading-relaxed bg-popover text-popover-foreground border border-border shadow-lg z-[100]"
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
