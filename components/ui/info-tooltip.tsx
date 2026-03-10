import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: string
  className?: string
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors ${className || ''}`}
            onClick={(e) => e.preventDefault()}
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            <span className="sr-only">More information</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-sm leading-relaxed bg-popover border-border shadow-lg"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
