"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, X, RefreshCw, Coins } from "lucide-react"

interface ScanErrorDialogProps {
  error: string | null
  onClose: () => void
  onRetry?: () => void
  creditsRefunded?: number
}

function getTitle(error: string) {
  const lower = error.toLowerCase()
  if (lower.includes("invalid") || lower.includes("url")) return "Invalid URL"
  if (lower.includes("403") || lower.includes("forbidden") || lower.includes("blocked")) return "Access Blocked"
  if (lower.includes("timeout") || lower.includes("timed out")) return "Request Timed Out"
  if (lower.includes("404") || lower.includes("not found")) return "Page Not Found"
  if (lower.includes("ssl") || lower.includes("certificate")) return "SSL Error"
  return "Scan Failed"
}

export function ScanErrorDialog({ error, onClose, onRetry, creditsRefunded }: ScanErrorDialogProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setVisible(true)
      const timer = setTimeout(() => { setVisible(false); onClose() }, creditsRefunded ? 12000 : 8000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [error, onClose])

  if (!error || !visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm w-full">
      <div className="rounded-xl border-2 border-red-500/50 bg-red-950/80 backdrop-blur-md shadow-2xl shadow-red-500/20 p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-red-500/10 shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{getTitle(error)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{error}</p>
            {creditsRefunded && creditsRefunded > 0 ? (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
                <Coins className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <p className="text-xs font-semibold text-green-500">{creditsRefunded} credits refunded to your account</p>
              </div>
            ) : null}
            {onRetry && (
              <button
                onClick={() => { setVisible(false); onClose(); onRetry() }}
                className="inline-flex items-center gap-1 mt-2 text-xs text-seo hover:underline font-medium"
              >
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            )}
          </div>
          <button
            onClick={() => { setVisible(false); onClose() }}
            className="shrink-0 p-1 rounded hover:bg-muted/50 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
