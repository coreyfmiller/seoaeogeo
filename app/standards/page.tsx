"use client"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export default function StandardsPage() {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onAnalyze={(url) => router.push(`/?url=${encodeURIComponent(url)}`)}
          apiStatus="idle"
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-seo/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-seo" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Our Standards</h1>
                  <p className="text-muted-foreground">Comprehensive audit methodology for 2026</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="bg-card/50 border border-border/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">Citatom Audit Standards & Methodology</h2>
                <p className="text-muted-foreground mb-6">
                  Our comprehensive testing framework evaluates websites against modern search intelligence standards 
                  that reflect the evolving landscape of how content is discovered, understood, and recommended in 2026.
                </p>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-bold mb-3 text-seo">The Three Pillars</h3>
                    <div className="grid gap-4">
                      <div className="p-4 bg-seo/5 border border-seo/20 rounded-lg">
                        <h4 className="font-bold text-seo mb-2">SEO (Search Engine Optimization)</h4>
                        <p className="text-sm text-muted-foreground">
                          Maximize visibility in traditional search engine results (Google, Bing, DuckDuckGo). 
                          Focus on crawlability, technical performance, on-page optimization, and link architecture.
                        </p>
                      </div>
                      <div className="p-4 bg-aeo/5 border border-aeo/20 rounded-lg">
                        <h4 className="font-bold text-aeo mb-2">AEO (Answer Engine Optimization)</h4>
                        <p className="text-sm text-muted-foreground">
                          Optimize for featured snippets, knowledge panels, and direct answer formats. 
                          Focus on question-answer matching, structured data, and content formatting.
                        </p>
                      </div>
                      <div className="p-4 bg-geo/5 border border-geo/20 rounded-lg">
                        <h4 className="font-bold text-geo mb-2">GEO (Generative Engine Optimization)</h4>
                        <p className="text-sm text-muted-foreground">
                          Maximize citation likelihood in AI-generated responses (ChatGPT, Gemini, Perplexity). 
                          Focus on trustworthiness, expertise signals, factual accuracy, and neutral tone.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-3">Key Testing Areas</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-seo mt-1">•</span>
                        <span><strong>Technical Foundation:</strong> HTTPS, response time, mobile responsiveness, Core Web Vitals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-seo mt-1">•</span>
                        <span><strong>On-Page Optimization:</strong> Title tags, meta descriptions, heading structure, content quality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-aeo mt-1">•</span>
                        <span><strong>Structured Data:</strong> Schema.org markup (JSON-LD), completeness, modern 2026 standards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-aeo mt-1">•</span>
                        <span><strong>Question Coverage:</strong> Who, what, where, when, why, how - direct answer formats</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-geo mt-1">•</span>
                        <span><strong>Content Trustworthiness:</strong> Expertise signals, citations, factual accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-geo mt-1">•</span>
                        <span><strong>Tone & Objectivity:</strong> Neutral voice, minimal promotional language, professional writing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-geo mt-1">•</span>
                        <span><strong>Image Accessibility:</strong> Alt text coverage for AI understanding</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-3">Modern Schema Standards (2026)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      We follow current best practices and don't penalize modern implementation patterns:
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-geo/5 border border-geo/20 rounded">
                        <p className="font-bold text-geo mb-1">✓ Accepted</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• Root-level arrays</li>
                          <li>• @graph structures</li>
                          <li>• Multiple schema blocks</li>
                          <li>• Distributed patterns</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-destructive/5 border border-destructive/20 rounded">
                        <p className="font-bold text-destructive mb-1">✗ Penalized</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• Missing required properties</li>
                          <li>• Placeholder data</li>
                          <li>• Invalid JSON syntax</li>
                          <li>• Wrong schema types</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold mb-3">Scoring Methodology</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Each pillar is scored out of 100 points using a component-based system:
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="font-bold text-sm mb-2">Grade Boundaries</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div className="text-center p-2 bg-geo/10 rounded">
                            <div className="font-bold text-geo">A</div>
                            <div className="text-muted-foreground">90-100</div>
                          </div>
                          <div className="text-center p-2 bg-geo/10 rounded">
                            <div className="font-bold text-geo">B</div>
                            <div className="text-muted-foreground">80-89</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-500/10 rounded">
                            <div className="font-bold text-yellow-600">C</div>
                            <div className="text-muted-foreground">70-79</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-500/10 rounded">
                            <div className="font-bold text-yellow-600">D</div>
                            <div className="text-muted-foreground">60-69</div>
                          </div>
                          <div className="text-center p-2 bg-destructive/10 rounded">
                            <div className="font-bold text-destructive">F</div>
                            <div className="text-muted-foreground">&lt;60</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="pt-6 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Last Updated: March 2026 • Next Review: June 2026
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
