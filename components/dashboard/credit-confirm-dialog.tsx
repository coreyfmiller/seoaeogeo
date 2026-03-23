"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Coins, AlertTriangle, Loader2, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const DEEP_SCAN_PAGE_OPTIONS = [5, 10, 20, 30, 40, 50] as const

interface CreditConfirmDialogProps {
  open: boolean
  onConfirm: (pageCount?: number) => void
  onCancel: () => void
  creditCost: number
  scanType: string
  costBreakdown?: string
  /** Show page count selector (Deep Scan only) */
  showPageSelector?: boolean
  defaultPageCount?: number
}

export function CreditConfirmDialog({
  open,
  onConfirm,
  onCancel,
  creditCost,
  scanType,
  costBreakdown,
  showPageSelector,
  defaultPageCount = 5,
}: CreditConfirmDialogProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPages, setSelectedPages] = useState(defaultPageCount)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (open) setSelectedPages(defaultPageCount)
  }, [open, defaultPageCount])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setBalance(null)
        setLoading(false)
        return
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("credits, is_admin")
        .eq("id", user.id)
        .single()
      if (prof) {
        setBalance(prof.credits || 0)
        setIsAdmin(prof.is_admin || false)
      } else {
        setBalance(null)
      }
      setLoading(false)
    })()
  }, [open])

  if (!open) return null

  const effectiveCost = showPageSelector ? 10 + selectedPages : creditCost
  const effectiveBreakdown = showPageSelector
    ? `10 base + ${selectedPages} pages × 1 credit = ${effectiveCost} credits`
    : costBreakdown
  const hasEnough = balance !== null && balance >= effectiveCost
  const remaining = balance !== null ? balance - effectiveCost : 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#BC13FE]/10 flex items-center justify-center">
            <Coins className="h-5 w-5 text-[#BC13FE]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Confirm {scanType}</h3>
            <p className="text-xs text-muted-foreground">This action will use credits from your balance</p>
          </div>
        </div>

        {/* Page count selector for Deep Scan */}
        {showPageSelector && (
          <div className="mb-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Pages to Crawl
            </label>
            <div className="flex gap-1.5 mt-2">
              {DEEP_SCAN_PAGE_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSelectedPages(count)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                    selectedPages === count
                      ? "border-[#BC13FE] bg-[#BC13FE]/10 text-[#BC13FE] font-bold"
                      : "border-border/50 text-muted-foreground hover:border-[#BC13FE]/30 hover:bg-[#BC13FE]/5"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cost breakdown */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Credit Cost</span>
            <span className="text-lg font-black text-[#BC13FE]">{effectiveCost} credits</span>
          </div>
          {effectiveBreakdown && (
            <p className="text-xs text-muted-foreground/80 italic">{effectiveBreakdown}</p>
          )}
          <div className="border-t border-border/50 pt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : balance !== null ? (
              <span className={cn("text-lg font-black", hasEnough ? "text-green-500" : "text-red-500")}>
                {balance} credits
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Sign in required</span>
            )}
          </div>
          {!loading && hasEnough && (
            <div className="flex items-center justify-between text-xs text-muted-foreground/70">
              <span>After this scan</span>
              <span>{remaining} credits remaining</span>
            </div>
          )}
        </div>

        {/* Insufficient credits warning */}
        {!loading && !hasEnough && balance !== null && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-5">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-500">Insufficient credits</p>
              <p className="text-xs text-red-400 mt-0.5">
                You need {effectiveCost - balance} more credits.{" "}
                <a href="/pro" className="underline hover:text-red-300">Buy credits</a>
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(showPageSelector ? selectedPages : undefined)
            }}
            disabled={loading || !hasEnough}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
              "bg-[#BC13FE] text-white hover:bg-[#BC13FE]/90",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              `Use ${effectiveCost} Credits`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
