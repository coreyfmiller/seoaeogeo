'use client'

import { useState, Suspense } from 'react'
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'

function PayTestContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const checkoutResult = searchParams.get('checkout')

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'test' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error === 'Not authenticated') {
        setError('You need to be logged in. Go to /login first.')
      } else {
        setError(data.error || 'Checkout failed')
      }
    } catch {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Payment Test</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">$5.00 for 50 credits — test the full payment flow</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkoutResult === 'success' && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-green-500">Payment successful!</p>
            <p className="text-xs text-muted-foreground mt-1">50 credits should be added to your account.</p>
          </div>
        )}
        {checkoutResult === 'cancelled' && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4 text-center">
            <p className="text-sm font-bold text-yellow-500">Payment cancelled</p>
            <p className="text-xs text-muted-foreground mt-1">No charges were made.</p>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
          {loading ? 'Redirecting to Stripe...' : 'Pay $5.00 — Get 50 Credits'}
        </button>
        <p className="text-[10px] text-muted-foreground text-center">Uses Stripe test mode if configured. Real charge if in live mode.</p>
      </CardContent>
    </Card>
  )
}

export default function PayTestPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <PayTestContent />
      </Suspense>
    </div>
  )
}
