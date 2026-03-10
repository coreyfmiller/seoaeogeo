"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { ScoreCard } from "@/components/dashboard/score-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Search,
  Loader2,
  Activity,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react"

export default function FreeDashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "idle">("idle")
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = sessionStorage.getItem("free_dashboard_url")
      const savedData = sessionStorage.getItem("free_dashboard_data")
      if (savedUrl) setCurrentUrl(savedUrl)
      if (savedData) setAnalysisData(JSON.parse(savedData))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentUrl) sessionStorage.setItem("free_dashboard_url", currentUrl)
      if (analysisData) sessionStorage.setItem("free_dashboard_data", JSON.stringify(analysisData))
    }
  }, [currentUrl, analysisData])

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setApiStatus("idle")
    setCurrentUrl(url)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setAnalysisData(result.data)
        setApiStatus("healthy")
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed')
      setApiStatus("error")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getIssueCount = () => {
    if (!analysisData?.ai?.recommendations) return 0
    return analysisData.ai.recommendations.length
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          currentUrl={currentUrl}
          apiStatus={apiStatus}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Activity className="h-8 w-8 text-seo" />
                  Quick Audit
                </h1>
                {currentUrl && analysisData ? (
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Search className="h-4 w-4" />
                      {currentUrl}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-2">
                    Free single-page analysis with basic recommendations
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="bg-muted text-foreground border-border">
                FREE TIER
              </Badge>
            </div>

            {error && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </CardContent>
              </Card>
            )}

            {!analysisData && !isAnalyzing && !error && (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto h-16 w-16 bg-seo/10 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-seo" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Enter a URL to analyze</h2>
                  <p className="text-muted-foreground">
                    Get instant SEO, AEO, and GEO scores with basic recommendations
                  </p>
                </CardContent>
              </Card>
            )}

            {isAnalyzing && (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-12 w-12 text-seo animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Analyzing page...</h2>
                  <p className="text-muted-foreground">This usually takes 10-15 seconds</p>
                </CardContent>
              </Card>
            )}

            {analysisData && !isAnalyzing && (
              <>
                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScoreCard
                    title="SEO Score"
                    score={analysisData.ai?.scores?.seo ?? 0}
                    variant="seo"
                    description="Technical optimization"
                  />
                  <ScoreCard
                    title="AEO Score"
                    score={analysisData.ai?.scores?.aeo ?? 0}
                    variant="aeo"
                    description="AI engine readiness"
                  />
                  <ScoreCard
                    title="GEO Score"
                    score={analysisData.ai?.scores?.geo ?? 0}
                    variant="geo"
                    description="Generative engine optimization"
                  />
                </div>

                {/* Technical Metrics Overview */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Technical Metrics</CardTitle>
                    <CardDescription>Key indicators from your page analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* HTTPS */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">HTTPS</div>
                        <div className="flex items-center gap-2">
                          {analysisData.structuralData?.https ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-geo" />
                              <span className="text-sm font-medium">Secure</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-medium">Not Secure</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Response Time */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Response Time</div>
                        <div className="text-sm font-medium">
                          {analysisData.structuralData?.responseTime 
                            ? `${analysisData.structuralData.responseTime}ms`
                            : 'N/A'}
                        </div>
                      </div>

                      {/* H1 Coverage */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">H1 Tags</div>
                        <div className="flex items-center gap-2">
                          {analysisData.structuralData?.semanticTags?.h1Count === 1 ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-geo" />
                              <span className="text-sm font-medium">1 (Good)</span>
                            </>
                          ) : analysisData.structuralData?.semanticTags?.h1Count === 0 ? (
                            <>
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-medium">Missing</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium">{analysisData.structuralData?.semanticTags?.h1Count} (Multiple)</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Schema Coverage */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Schema Types</div>
                        <div className="flex items-center gap-2">
                          {analysisData.schemas?.length > 0 ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-geo" />
                              <span className="text-sm font-medium">{analysisData.schemas.length} Found</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-medium">None</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Schema Quality */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Schema Quality</div>
                        <div className="text-sm font-medium">
                          {analysisData.ai?.schemaQuality?.score 
                            ? `${analysisData.ai.schemaQuality.score}/100`
                            : 'N/A'}
                        </div>
                      </div>

                      {/* Metadata Health */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Meta Description</div>
                        <div className="flex items-center gap-2">
                          {analysisData.description && analysisData.description.length >= 50 && analysisData.description.length <= 160 ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-geo" />
                              <span className="text-sm font-medium">Good</span>
                            </>
                          ) : analysisData.description ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium">Needs Work</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-medium">Missing</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Word Count */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Word Count</div>
                        <div className="text-sm font-medium">
                          {analysisData.structuralData?.wordCount?.toLocaleString() ?? 'N/A'}
                        </div>
                      </div>

                      {/* Image Alt Coverage */}
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Image Alt Text</div>
                        <div className="flex items-center gap-2">
                          {analysisData.structuralData?.media?.totalImages > 0 ? (
                            <>
                              {analysisData.structuralData.media.imagesWithAlt === analysisData.structuralData.media.totalImages ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-geo" />
                                  <span className="text-sm font-medium">100%</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm font-medium">
                                    {Math.round((analysisData.structuralData.media.imagesWithAlt / analysisData.structuralData.media.totalImages) * 100)}%
                                  </span>
                                </>
                              )}
                            </>
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">No Images</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Issues Found - Free Tier (Generic) */}
                {getIssueCount() > 0 ? (
                  <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Issues Detected
                          </CardTitle>
                          <CardDescription>
                            {getIssueCount()} optimization opportunities found
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                    {/* Display only issue titles - no descriptions (teaser for Pro) */}
                    {analysisData.ai?.recommendations?.map((rec: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-center gap-3 group hover:border-yellow-500/30 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                          <XCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">Unlock Pro to see detailed fix instructions</p>
                        </div>
                        {rec.priority && (
                          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase shrink-0 ${
                            rec.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                            rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {rec.priority}
                          </span>
                        )}
                        <Lock className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:text-yellow-500/50 transition-colors" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                ) : (
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-geo mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No Critical Issues Found</h3>
                      <p className="text-muted-foreground">
                        Your page looks good! Upgrade to Pro for detailed optimization opportunities.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Upgrade CTA */}
                <Card className="border-geo/30 bg-gradient-to-br from-geo/10 to-aeo/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-geo/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="p-8 relative">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-geo/20 text-geo text-xs font-bold mb-3">
                          <Zap className="h-3 w-3" />
                          UPGRADE TO PRO
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          Get Step-by-Step Fix Instructions
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Stop guessing. Get exact implementation guides with copy-paste code for every issue.
                        </p>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span><strong>Detailed explanations</strong> of why each fix matters</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span><strong>Copy-paste code examples</strong> ready to implement</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span><strong>Platform-specific guides</strong> (WordPress, Shopify, custom)</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span><strong>ROI estimates</strong> and priority scoring</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo shrink-0" />
                            <span><strong>Multi-page deep crawl</strong> for site-wide analysis</span>
                          </li>
                        </ul>
                      </div>
                      <div className="shrink-0 text-center">
                        <Button
                          size="lg"
                          onClick={() => router.push('/')}
                          className="bg-geo hover:bg-geo/90 text-geo-foreground shadow-lg hover:shadow-xl transition-all"
                        >
                          View Pro Dashboard
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">
                          See detailed fixes for this URL
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
