"use client"

import { Lock, Zap, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProLockScreenProps {
  featureName: string
  description: string
}

export function ProLockScreen({ featureName, description }: ProLockScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <Card className="max-w-2xl w-full border-geo/30 bg-gradient-to-br from-geo/10 to-aeo/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-geo/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-12 relative text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-geo/20 border-2 border-geo mb-6">
            <Lock className="h-10 w-10 text-geo" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3">{featureName}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {description}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-geo/20 text-geo text-sm font-bold mb-8">
            <Zap className="h-4 w-4" />
            PRO FEATURE
          </div>

          <div className="text-left max-w-md mx-auto mb-8 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-geo shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                <strong>Detailed fix instructions</strong> with schema code generation
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-geo shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                <strong>Multi-page deep crawls</strong> for comprehensive analysis
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-geo shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                <strong>Competitive intelligence</strong> and gap analysis
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-geo shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                <strong>Priority scoring</strong> and ROI estimates
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="bg-geo hover:bg-geo/90 text-geo-foreground shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              onClick={() => window.location.href = '/free-audit'}
            >
              Try Free Scan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Packs starting at $79.99
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
