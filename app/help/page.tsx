"use client"

import { useState, useRef } from "react"
import { PublicNav } from "@/components/public-nav"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  HelpCircle,
  Search,
  Sparkles,
  Bot,
  Layers,
  Globe,
  ChevronDown,
  ChevronRight,
  Zap,
  BookOpen,
  MessageSquare,
  Mail,
  ExternalLink,
  ArrowRight,
  Shield,
  BarChart3,
  FileText,
  Download,
  Send,
  CheckCircle2,
  User,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "What is Duelly?",
    answer: "Duelly is a search intelligence platform that audits your website across three pillars: SEO (Search Engine Optimization), AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization). We help you optimize for traditional search, featured snippets, and AI-generated responses."
  },
  {
    category: "Getting Started",
    question: "What's the difference between Free and Pro audits?",
    answer: "Free Audit runs a comprehensive rule-based analysis checking 50+ technical and content signals — no AI involved. Pro Audit adds AI-powered analysis using Gemini to generate specific fix instructions, deeper content evaluation, and actionable recommendations tailored to your site type."
  },
  {
    category: "Getting Started",
    question: "What does Deep Scan do?",
    answer: "Deep Scan crawls multiple pages across your site (up to 50 pages depending on your plan) and provides a site-wide analysis. It identifies patterns, inconsistencies, and opportunities across your entire domain rather than just a single page."
  },
  {
    category: "Getting Started",
    question: "What is Competitor Duel?",
    answer: "Competitor Duel lets you compare your page against a competitor's page side-by-side. It identifies stolen opportunities, strategic gaps, and provides counter-strategies to help you outperform the competition across all three pillars."
  },
  {
    category: "Scoring",
    question: "How are scores calculated?",
    answer: "Each pillar (SEO, AEO, GEO) is scored out of 100 using a component-based system. Scores are weighted based on your detected site type (e-commerce, blog, SaaS, etc.) to ensure relevant factors matter most. Grade boundaries: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)."
  },
  {
    category: "Scoring",
    question: "Why do my scores differ between audit types?",
    answer: "Free audits use rule-based analysis only, while Pro audits incorporate AI evaluation for deeper content and quality assessment. The underlying scoring components are the same, but Pro audits can detect nuances that rule-based checks miss."
  },
  {
    category: "Scoring",
    question: "Why did my score change slightly between scans?",
    answer: "Pro and Deep Scan audits use AI to evaluate your content the same way answer engines and generative search actually read your site. Just like ChatGPT or Perplexity re-evaluates content every time it encounters it, our AI analysis produces a fresh assessment each scan. Minor variations of ±3 points are normal and reflect how AI perception genuinely works. Your technical checks (meta tags, schema, HTTPS, H1s) are always 100% consistent — it's only the AI quality signals that can shift slightly. This isn't a flaw — it's an honest representation of how your content will be judged in the real world."
  },
  {
    category: "Scoring",
    question: "What are site types and why do they matter?",
    answer: "Duelly automatically detects your site type (e-commerce, blog, portfolio, SaaS, news, local business, etc.) and adjusts scoring weights accordingly. An e-commerce site is evaluated differently than a blog because different signals matter for each. This ensures fair, relevant scoring."
  },
  {
    category: "Data & Privacy",
    question: "Where is my scan data stored?",
    answer: "Scan results are stored in your Supabase account and retained for 1 year. After 12 months, scan data is automatically deleted. You'll see an 'expiring soon' notice on scans approaching their 1-year mark. Download PDF reports for any scans you want to keep permanently."
  },
  {
    category: "Data & Privacy",
    question: "Can I export my scan history?",
    answer: "Yes. On the Dashboard, you'll find Export and Import buttons next to Recent Scans. Export downloads a JSON file with all your scan history and full results. You can import this file on another device or after clearing your browser data."
  },
  {
    category: "Data & Privacy",
    question: "What data do you collect during a scan?",
    answer: "We fetch the publicly available HTML of the URL you provide, analyze it, and return the results. For Pro and Deep scans, the page content is sent to Google's Gemini API for AI analysis. We don't store your page content after analysis is complete."
  },
  {
    category: "Plans & Limits",
    question: "What are the plan limits?",
    answer: "Credits are one-time purchases — buy more when you need them. Pro Analysis costs 10 credits. Deep Scan costs 30 credits (5 pages). Competitor Duel costs 10 credits. Keyword Arena costs 10 credits per site. Free audits don't count against your credits."
  },
  {
    category: "Plans & Limits",
    question: "Do free audits count against my plan?",
    answer: "No. Free audits are unlimited and don't use any AI credits. Only Pro Audits, Deep Scans, and Competitor Duel analyses count against your monthly quota."
  },
  {
    category: "Keyword Arena",
    question: "Why don't Keyword Arena rankings match what I see when I search Google?",
    answer: "Google personalizes results for every user based on search history, location, device, and logged-in activity — so no two people see the exact same rankings. The Keyword Arena checks rankings from a neutral, standardized perspective (similar to a datacenter query) which won't match any individual's personal Google bubble. Local intent keywords are especially affected — searching 'plumber' in Halifax vs. Toronto returns completely different results. Even incognito mode isn't truly neutral since Google still uses your IP for location. Think of Arena rankings as a lab measurement: they give you a consistent, repeatable benchmark to track trends and compare competitors on a level playing field, even though the number won't match what you personally see in your browser."
  },
  {
    category: "Troubleshooting",
    question: "My scan is stuck or failed — what should I do?",
    answer: "First, check the API status indicator in the top header bar. If it shows 'error', our analysis service may be temporarily unavailable. Try again in a few minutes. If the URL is behind authentication or a firewall, we won't be able to access it. Make sure the URL is publicly accessible."
  },
  {
    category: "Troubleshooting",
    question: "Why does my site score lower than expected?",
    answer: "Common reasons: missing meta descriptions, no structured data (Schema.org), thin content, missing alt text on images, no FAQ or Q&A content for AEO, and lack of expertise signals (author info, citations) for GEO. Check the detailed breakdown in your audit results for specific recommendations."
  },
  {
    category: "Troubleshooting",
    question: "The page looks different than what was analyzed",
    answer: "Duelly fetches the server-rendered HTML of your page. If your site relies heavily on client-side JavaScript rendering, some content may not be visible to our crawler. This is also how search engines see your page — if we can't see it, neither can Google."
  },
]

const categories = [...new Set(faqs.map(f => f.category))]

const quickStartGuides = [
  {
    title: "Free Audit",
    desc: "Quick rule-based analysis of any URL. No AI, no limits.",
    icon: Sparkles,
    color: "text-seo",
    bg: "bg-seo/10",
    href: "/free-audit",
    steps: ["Enter any URL", "Get instant SEO/AEO/GEO scores", "Review detailed metric breakdowns", "No account or credits needed"],
  },
  {
    title: "Pro Audit",
    desc: "AI-powered deep analysis with fix instructions.",
    icon: Bot,
    color: "text-geo",
    bg: "bg-geo/10",
    href: "/pro-audit",
    steps: ["Enter a URL to analyze", "AI evaluates content quality & structure", "Get specific fix instructions", "Prioritized recommendations by impact"],
  },
  {
    title: "Deep Scan",
    desc: "Crawl multiple pages for site-wide insights.",
    icon: Layers,
    color: "text-[#BC13FE]",
    bg: "bg-[#BC13FE]/10",
    href: "/deep-scan",
    steps: ["Enter your domain", "Configure crawl depth & page limit", "Review page-by-page comparison", "Identify site-wide patterns & issues"],
  },
  {
    title: "Competitor Duel",
    desc: "Compare your page against a competitor.",
    icon: Globe,
    color: "text-aeo",
    bg: "bg-aeo/10",
    href: "/competitive-intel",
    steps: ["Enter your URL and competitor URL", "Side-by-side score comparison", "Discover stolen opportunities", "Get counter-strategies to win"],
  },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [contactForm, setContactForm] = useState({ name: '', email: '', category: 'general', message: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const filteredFaqs = activeCategory === "all" ? faqs : faqs.filter(f => f.category === activeCategory)

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-background text-foreground">
      <PublicNav />
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-10">

            {/* Hero */}
            <div className="text-center space-y-3 pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-seo/10 mb-2">
                <HelpCircle className="h-8 w-8 text-seo" />
              </div>
              <h1 className="text-3xl font-bold">Help & Support</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Everything you need to get the most out of Duelly. Browse guides, FAQs, and tips below.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Quick Start", icon: Zap, color: "text-seo", anchor: "#quickstart" },
                { label: "FAQs", icon: MessageSquare, color: "text-aeo", anchor: "#faq" },
                { label: "Our Standards", icon: FileText, color: "text-geo", anchor: "/standards" },
                { label: "Contact Us", icon: Mail, color: "text-[#BC13FE]", anchor: "#contact" },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.anchor}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-seo/30 hover:shadow-md transition-all"
                >
                  <link.icon className={cn("h-5 w-5", link.color)} />
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>

            {/* Quick Start Guides */}
            <section id="quickstart">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-seo" />
                <h2 className="text-xl font-bold">Quick Start Guides</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {quickStartGuides.map(guide => (
                  <Card key={guide.title} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", guide.bg)}>
                          <guide.icon className={cn("h-5 w-5", guide.color)} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{guide.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{guide.desc}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ol className="space-y-2 mb-4">
                        {guide.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5", guide.bg, guide.color)}>
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <Link
                        href={guide.href}
                        className={cn("inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline", guide.color)}
                      >
                        Try it now <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Understanding Your Scores */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-aeo" />
                <h2 className="text-xl font-bold">Understanding Your Scores</h2>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {[
                      { name: "SEO", color: "text-seo", bg: "bg-seo/10", border: "border-seo/20", desc: "Traditional search engine visibility. Technical health, on-page optimization, crawlability." },
                      { name: "AEO", color: "text-aeo", bg: "bg-aeo/10", border: "border-aeo/20", desc: "Answer engine readiness. Featured snippets, structured data, question-answer coverage." },
                      { name: "GEO", color: "text-geo", bg: "bg-geo/10", border: "border-geo/20", desc: "AI citation likelihood. Trustworthiness, expertise signals, factual accuracy." },
                    ].map(pillar => (
                      <div key={pillar.name} className={cn("p-4 rounded-lg border", pillar.bg, pillar.border)}>
                        <h3 className={cn("font-bold text-lg mb-2", pillar.color)}>{pillar.name}</h3>
                        <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground mr-2">Grade scale:</span>
                    {[
                      { grade: "A", range: "90-100", color: "text-geo bg-geo/10" },
                      { grade: "B", range: "80-89", color: "text-geo bg-geo/10" },
                      { grade: "C", range: "70-79", color: "text-yellow-600 bg-yellow-500/10" },
                      { grade: "D", range: "60-69", color: "text-yellow-600 bg-yellow-500/10" },
                      { grade: "F", range: "<60", color: "text-destructive bg-destructive/10" },
                    ].map(g => (
                      <span key={g.grade} className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold", g.color)}>
                        {g.grade} <span className="font-normal opacity-70">{g.range}</span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* FAQ Section */}
            <section id="faq">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-geo" />
                <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    activeCategory === "all"
                      ? "bg-seo/10 text-seo border-seo/30"
                      : "text-muted-foreground border-border/50 hover:border-seo/20"
                  )}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                      activeCategory === cat
                        ? "bg-seo/10 text-seo border-seo/30"
                        : "text-muted-foreground border-border/50 hover:border-seo/20"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredFaqs.map((faq, i) => {
                  const globalIndex = faqs.indexOf(faq)
                  const isOpen = openFaq === globalIndex
                  return (
                    <button
                      key={globalIndex}
                      onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                      className="w-full text-left"
                    >
                      <div className={cn(
                        "rounded-lg border border-border/50 transition-all",
                        isOpen ? "bg-card shadow-sm" : "hover:bg-muted/30"
                      )}>
                        <div className="flex items-center gap-3 px-4 py-3">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-seo shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-sm font-medium flex-1">{faq.question}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded shrink-0">
                            {faq.category}
                          </span>
                        </div>
                        {isOpen && (
                          <div className="px-4 pb-4 pl-11">
                            <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Tips & Best Practices */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-[#BC13FE]" />
                <h2 className="text-xl font-bold">Tips & Best Practices</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Run Free first, then Pro", tip: "Start with a Free Audit to get baseline scores. If you need specific fix instructions, follow up with a Pro Audit. This saves your Pro credits for when you need them." },
                  { title: "Scan after making changes", tip: "After implementing fixes, run another audit to track your progress. Each scan is saved to your history so you can see improvement over time." },
                  { title: "Use Competitor Duel strategically", tip: "Compare against your top-ranking competitor for your target keyword. The counter-strategies are most valuable when you're competing for the same search intent." },
                  { title: "Export your data regularly", tip: "Since scan history is stored locally, use the Export button on the Dashboard to back up your data. This protects against browser data loss and lets you share results with your team." },
                  { title: "Check all three pillars", tip: "Don't just focus on SEO. AEO and GEO are increasingly important as AI search grows. A site that scores well across all three is future-proofed." },
                  { title: "Deep Scan for site-wide issues", tip: "Individual page audits are great, but Deep Scan reveals patterns. If every page is missing structured data, that's a site-wide fix — not a page-by-page one." },
                ].map(item => (
                  <div key={item.title} className="p-4 rounded-lg border border-border/50 bg-card/50">
                    <h4 className="text-sm font-bold mb-1.5">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section id="contact">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-seo" />
                <h2 className="text-xl font-bold">Contact & Feedback</h2>
              </div>
              <div className="grid md:grid-cols-5 gap-6">
                {/* Contact Form — 3 cols */}
                <Card className="md:col-span-3 border-seo/20">
                  <CardContent className="p-6">
                    {contactSubmitted ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-14 w-14 rounded-full bg-geo/10 flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-7 w-7 text-geo" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Message Sent</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Thanks for reaching out. We typically respond within 24 hours on business days.
                        </p>
                        <button
                          onClick={() => { setContactSubmitted(false); setContactForm({ name: '', email: '', category: 'general', message: '' }) }}
                          className="mt-4 text-sm text-seo hover:underline font-medium"
                        >
                          Send another message
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={async (e) => {
                        e.preventDefault()
                        try {
                          const res = await fetch('/api/contact', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(contactForm),
                          })
                          if (res.ok) {
                            setContactSubmitted(true)
                          } else {
                            alert('Failed to send message. Please try again or email support@duelly.ai directly.')
                          }
                        } catch {
                          alert('Failed to send message. Please try again or email support@duelly.ai directly.')
                        }
                      }} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <User className="h-3 w-3" /> Name
                            </label>
                            <input
                              id="contact-name"
                              type="text"
                              required
                              value={contactForm.name}
                              onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                              placeholder="Your name"
                              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Mail className="h-3 w-3" /> Email
                            </label>
                            <input
                              id="contact-email"
                              type="email"
                              required
                              value={contactForm.email}
                              onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                              placeholder="you@example.com"
                              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="contact-category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Tag className="h-3 w-3" /> Category
                          </label>
                          <select
                            id="contact-category"
                            value={contactForm.category}
                            onChange={(e) => setContactForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors"
                          >
                            <option value="general">General Question</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="billing">Billing & Plans</option>
                            <option value="scoring">Scoring Question</option>
                            <option value="partnership">Partnership Inquiry</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3" /> Message
                          </label>
                          <textarea
                            id="contact-message"
                            required
                            rows={5}
                            value={contactForm.message}
                            onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                            placeholder="Tell us what's on your mind..."
                            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-seo/30 focus:border-seo/50 transition-colors resize-none"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] text-muted-foreground">We typically respond within 24 hours.</p>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-seo hover:bg-seo/90 text-white font-medium text-sm shadow-lg hover:shadow-xl transition-all"
                          >
                            <Send className="h-4 w-4" />
                            Send Message
                          </button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Sidebar info — 2 cols */}
                <div className="md:col-span-2 space-y-4">
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-sm">Direct Email</h3>
                      <a href="/contact" className="flex items-center gap-2 text-sm text-seo hover:underline">
                        <Mail className="h-4 w-4" />
                        support@duelly.ai
                      </a>
                      <p className="text-xs text-muted-foreground">For urgent issues or account-specific questions.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-sm">Resources</h3>
                      <div className="space-y-2">
                        <Link href="/standards" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <FileText className="h-4 w-4" />
                          Audit Standards & Methodology
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Zap className="h-4 w-4" />
                          View Plans & Pricing
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Download className="h-4 w-4" />
                          Export Scan History
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Footer spacer */}
            <div className="h-8" />
          </div>
        </main>
      <PublicFooter />
    </div>
  )
}
