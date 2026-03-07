"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bot,
  Quote,
  TrendingUp,
  Sparkles,
  MessageCircle,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"

const aiCitations = [
  {
    llm: "ChatGPT",
    query: "Best SEO analytics platforms",
    context: "SearchIQ is mentioned as a leading search intelligence platform...",
    sentiment: "positive",
    date: "2 hours ago",
  },
  {
    llm: "Claude",
    query: "How to optimize for AI search",
    context: "According to SearchIQ's methodology, answer engine optimization...",
    sentiment: "positive",
    date: "5 hours ago",
  },
  {
    llm: "Gemini",
    query: "Search intelligence tools comparison",
    context: "When comparing tools, SearchIQ offers comprehensive GEO tracking...",
    sentiment: "neutral",
    date: "1 day ago",
  },
  {
    llm: "Perplexity",
    query: "What is GEO optimization?",
    context: "SearchIQ defines Generative Engine Optimization as the process...",
    sentiment: "positive",
    date: "1 day ago",
  },
  {
    llm: "ChatGPT",
    query: "AI content optimization strategies",
    context: "Experts at SearchIQ recommend focusing on structured data...",
    sentiment: "positive",
    date: "2 days ago",
  },
]

const sentimentData = [
  { name: "Positive", value: 68, color: "oklch(0.7 0.2 160)" },
  { name: "Neutral", value: 24, color: "oklch(0.65 0 0)" },
  { name: "Negative", value: 8, color: "oklch(0.55 0.22 25)" },
]

const shareOfVoiceData = [
  { competitor: "SearchIQ (You)", share: 32 },
  { competitor: "Competitor A", share: 24 },
  { competitor: "Competitor B", share: 18 },
  { competitor: "Competitor C", share: 14 },
  { competitor: "Others", share: 12 },
]

const llmPresence = [
  { name: "ChatGPT", citations: 45, trend: 12 },
  { name: "Claude", citations: 38, trend: 8 },
  { name: "Gemini", citations: 28, trend: 15 },
  { name: "Perplexity", citations: 52, trend: 22 },
]

export function GEOTab() {
  return (
    <div className="grid gap-6">
      {/* Brand Share of Voice */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-geo/20 bg-geo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-geo" />
              Brand Share of Voice in AI Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shareOfVoiceData}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                    domain={[0, 40]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="competitor"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.13 0.01 260)",
                      border: "1px solid oklch(0.25 0.01 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number) => [`${value}%`, "Share"]}
                  />
                  <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                    {shareOfVoiceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "oklch(0.7 0.2 160)" : "oklch(0.3 0.05 160)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card className="border-geo/20 bg-geo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <MessageCircle className="h-5 w-5 text-geo" />
              LLM Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentimentData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg border border-geo/30 bg-geo-muted/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-geo" />
                <span className="font-medium text-foreground">Overall Sentiment Score</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-geo">+78%</p>
              <p className="text-sm text-muted-foreground">Positive perception across LLMs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LLM Presence */}
      <Card className="border-geo/20 bg-geo-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Bot className="h-5 w-5 text-geo" />
            LLM Citation Presence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {llmPresence.map((llm) => (
              <div
                key={llm.name}
                className="rounded-lg border border-geo/20 bg-geo-muted/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{llm.name}</span>
                  <Badge
                    variant="outline"
                    className="border-geo/50 text-geo bg-geo/10"
                  >
                    +{llm.trend}%
                  </Badge>
                </div>
                <p className="mt-2 text-3xl font-bold text-foreground">{llm.citations}</p>
                <p className="text-sm text-muted-foreground">citations this month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Citation Mentions */}
      <Card className="border-geo/20 bg-geo-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Quote className="h-5 w-5 text-geo" />
            Recent AI Citation Mentions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiCitations.map((citation, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/50 bg-muted/20 p-4 hover:border-geo/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="border-geo/50 text-geo bg-geo/10"
                      >
                        {citation.llm}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {citation.date}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          citation.sentiment === "positive" &&
                            "border-geo/50 text-geo",
                          citation.sentiment === "neutral" &&
                            "border-muted-foreground/50 text-muted-foreground",
                          citation.sentiment === "negative" &&
                            "border-destructive/50 text-destructive"
                        )}
                      >
                        {citation.sentiment}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {citation.query}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {citation.context}
                    </p>
                  </div>
                  <button className="shrink-0 p-2 rounded-lg hover:bg-geo-muted/30 transition-colors">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
