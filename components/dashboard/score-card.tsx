"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CircularProgress } from "./circular-progress"
import { cn } from "@/lib/utils"

interface ScoreCardProps {
  title: string
  score: number
  change?: number
  variant: "seo" | "aeo" | "geo"
  description?: string
}

export function ScoreCard({
  title,
  score,
  change,
  variant,
  description,
}: ScoreCardProps) {
  const borderColorMap = {
    seo: "border-seo/30 hover:border-seo/50",
    aeo: "border-aeo/30 hover:border-aeo/50",
    geo: "border-geo/30 hover:border-geo/50",
  }

  const bgColorMap = {
    seo: "bg-seo-muted/30",
    aeo: "bg-aeo-muted/30",
    geo: "bg-geo-muted/30",
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        borderColorMap[variant],
        bgColorMap[variant]
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <CircularProgress
            value={score}
            variant={variant}
            sublabel="/100"
            size={100}
            strokeWidth={6}
          />
          <div className="text-center">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {change !== undefined && (
              <p
                className={cn(
                  "text-xs mt-2 font-medium",
                  change >= 0 ? "text-geo" : "text-destructive"
                )}
              >
                {change >= 0 ? "+" : ""}
                {change}% vs last month
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
