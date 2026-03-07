"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  ArrowRight,
  Zap,
  AlertTriangle,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Priority = "high" | "medium" | "low"

interface Recommendation {
  id: string
  title: string
  description: string
  priority: Priority
  category: "seo" | "aeo" | "geo"
  impact: string
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "Fix Core Web Vitals Issues",
    description:
      "Your LCP score is above 2.5s on mobile. Optimize images and lazy load below-the-fold content.",
    priority: "high",
    category: "seo",
    impact: "+15% visibility",
  },
  {
    id: "2",
    title: "Add FAQ Schema to Top Pages",
    description:
      "Your top 5 traffic pages lack FAQ structured data. Add schema to capture featured snippets.",
    priority: "high",
    category: "aeo",
    impact: "+25% snippets",
  },
  {
    id: "3",
    title: "Improve Brand Entity Definition",
    description:
      "Strengthen your Knowledge Graph presence by adding Organization schema and consistent NAP data.",
    priority: "medium",
    category: "geo",
    impact: "+20% citations",
  },
  {
    id: "4",
    title: "Optimize Question-Based Content",
    description:
      "Create content targeting 'How' and 'Why' queries to improve AI extraction rates.",
    priority: "medium",
    category: "aeo",
    impact: "+18% coverage",
  },
  {
    id: "5",
    title: "Build Topical Authority",
    description:
      "Create cluster content around your primary topics to strengthen semantic relevance.",
    priority: "low",
    category: "seo",
    impact: "+12% rankings",
  },
  {
    id: "6",
    title: "Monitor Competitor Citations",
    description:
      "Set up tracking for competitor brand mentions in LLM responses to identify opportunities.",
    priority: "low",
    category: "geo",
    impact: "+8% share",
  },
]

const priorityConfig = {
  high: {
    icon: Zap,
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    badgeColor: "bg-destructive/20 text-destructive border-destructive/50",
    iconColor: "text-destructive",
  },
  medium: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    badgeColor: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    iconColor: "text-yellow-500",
  },
  low: {
    icon: Info,
    bgColor: "bg-seo/10",
    borderColor: "border-seo/30",
    badgeColor: "bg-seo/20 text-seo border-seo/50",
    iconColor: "text-seo",
  },
}

const categoryColors = {
  seo: "text-seo",
  aeo: "text-aeo",
  geo: "text-geo",
}

interface RecommendationsProps {
  data?: Recommendation[]
}

export function Recommendations({ data }: RecommendationsProps) {
  const displayRecommendations = data && data.length > 0 ? data : recommendations

  return (
    <Card className="border-border/50 bg-card/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Optimization Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayRecommendations.map((rec) => {
          const config = priorityConfig[rec.priority]
          const PriorityIcon = config.icon
          return (
            <div
              key={rec.id}
              className={cn(
                "rounded-lg border p-3 transition-all hover:scale-[1.01]",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-3">
                <PriorityIcon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-medium text-foreground">{rec.title}</h4>
                    <Badge variant="outline" className={cn("text-xs", config.badgeColor)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {rec.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border-transparent",
                        categoryColors[rec.category]
                      )}
                    >
                      {rec.category.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-medium text-geo">{rec.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <Button
          variant="outline"
          className="w-full mt-4 border-border/50 text-muted-foreground hover:text-foreground hover:border-seo/50"
        >
          View All Recommendations
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
