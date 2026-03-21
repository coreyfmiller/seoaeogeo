"use client"

import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  sublabel?: string
  variant?: "seo" | "aeo" | "geo"
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  label,
  sublabel,
  variant = "seo",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percent = Math.min(value / max, 1)
  const offset = circumference - percent * circumference

  const colorMap = {
    seo: "stroke-seo",
    aeo: "stroke-aeo",
    geo: "stroke-[#fe3f8c]",
  }

  const glowMap = {
    seo: "drop-shadow-[0_0_8px_oklch(0.7_0.2_250)]",
    aeo: "drop-shadow-[0_0_8px_oklch(0.65_0.25_300)]",
    geo: "drop-shadow-[0_0_8px_#fe3f8c]",
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className={cn("transform -rotate-90", glowMap[variant])}
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn(colorMap[variant], "transition-all duration-500")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {Math.round(value)}
          </span>
          {sublabel && (
            <span className="text-xs text-muted-foreground">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </div>
  )
}
