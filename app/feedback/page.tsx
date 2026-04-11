'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('feedback')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null)
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
          .then(({ data }) => { if (data?.full_name) setUserName(data.full_name) })
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName || 'Dashboard User',
          email: userEmail || 'no-reply@duelly.ai',
          category,
          message,
        }),
      })
      if (res.ok) {
        setStatus('sent')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-[#00e5ff]" />
          </div>
          <h1 className="text-2xl font-black">Send Feedback</h1>
        </div>
        <p className="text-muted-foreground mb-8 ml-[52px]">
          Found a bug? Have an idea? Let us know — we read every message.
        </p>

        {status === 'sent' ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thanks for the feedback</h2>
            <p className="text-muted-foreground mb-4">We appreciate you taking the time.</p>
            <button onClick={() => setStatus('idle')}
              className="px-4 py-2 text-sm font-medium text-[#00e5ff] hover:underline">
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">Type</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/20 focus:border-[#00e5ff]/50 text-sm">
                <option value="feedback">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="support">Need Help</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6}
                placeholder="Tell us what's on your mind..."
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/20 focus:border-[#00e5ff]/50 text-sm resize-none" />
            </div>
            {userEmail && (
              <p className="text-xs text-muted-foreground">
                Sending as {userName || userEmail}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
            )}
            <button type="submit" disabled={status === 'sending' || !message.trim()}
              className="w-full px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {status === 'sending' ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
