'use client'

import { useState } from 'react'
import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, message }),
      })
      if (res.ok) {
        setStatus('sent')
        setName(''); setEmail(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">Have a question, feedback, or need help? We&apos;d love to hear from you.</p>

        {status === 'sent' ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Message Sent</h2>
            <p className="text-muted-foreground">We&apos;ll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50 text-sm" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50 text-sm" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50 text-sm">
                <option value="general">General Question</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5}
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-seo/20 focus:border-seo/50 text-sm resize-none" placeholder="How can we help?" />
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
            )}
            <button type="submit" disabled={status === 'sending'}
              className="w-full px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </main>
      <PublicFooter />
    </div>
  )
}
