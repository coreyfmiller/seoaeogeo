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
                <p className="text-muted-foreground mt-2">
                  Free single-page analysis with basic recommendations
                </p>
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
                    <CardContent className="space-y-4">
                    {/* Display all recommendations */}
                    {analysisData.ai?.recommendations?.map((rec: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{rec.title}</p>
                            {rec.priority && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                rec.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                                rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {rec.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                        <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
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
                <Card className="border-geo/30 bg-gradient-to-br from-geo/10 to-aeo/10">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          <Zap className="h-6 w-6 text-geo" />
                          Unlock Detailed Fixes
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Get step-by-step implementation guides, copy-paste code examples, platform-specific instructions, and priority scoring.
                        </p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo" />
                            <span>Exact code examples you can copy-paste</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo" />
                            <span>Platform-specific guides (WordPress, Shopify, etc.)</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo" />
                            <span>Priority scoring and ROI estimates</span>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-geo" />
                            <span>Validation links and testing tools</span>
                          </li>
                        </ul>
                      </div>
                      <div className="shrink-0">
                        <Button
                          size="lg"
                          onClick={() => router.push('/')}
                          className="bg-geo hover:bg-geo/90 text-geo-foreground"
                        >
                          View Pro Dashboard
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          See the difference
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
