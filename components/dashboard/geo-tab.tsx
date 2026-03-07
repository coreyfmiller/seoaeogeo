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
  Shield,
  ImageIcon,
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

interface GEOTabProps {
  data?: {
    structuralData?: {
      semanticTags: { article: number, main: number, nav: number, aside: number, headers: number };
      links: { internal: number, external: number };
      media: { totalImages: number, imagesWithAlt: number };
      wordCount: number;
    },
    ai?: {
      penaltyLedger?: Array<{
        category: "seo" | "aeo" | "geo",
        penalty: string,
        pointsDeducted: number
      }>,
      geoAnalysis: {
        sentimentScore: number,
        brandPerception: "positive" | "neutral" | "negative",
        citationLikelihood: number,
        llmContextClarity: number,
        visibilityGaps: string[]
      },
      liveInterrogation?: {
        identifiedQuery: string,
        isRecommended: boolean,
        shareOfVoiceData: Array<{ competitor: string, share: number }>,
        aiCitations: Array<{ llm: string, query: string, context: string, sentiment: string, date: string }>
      }
    }
  }
}

export function GEOTab({ data }: GEOTabProps) {
  const geoData = data?.ai?.geoAnalysis
  const penaltyLedger = (data?.ai?.penaltyLedger || []).filter(p => p.category === "geo")
  const struct = data?.structuralData
  const liveInt = data?.ai?.liveInterrogation

  const displayShareOfVoice = liveInt?.shareOfVoiceData || shareOfVoiceData
  const displayAiCitations = liveInt?.aiCitations || aiCitations

  const displaySentiment = geoData ? [
    { name: "Positive", value: Math.max(0, geoData.sentimentScore), color: "oklch(0.7 0.2 160)" },
    { name: "Neutral", value: geoData.sentimentScore === 0 ? 100 : 0, color: "oklch(0.65 0 0)" },
    { name: "Negative", value: Math.max(0, -geoData.sentimentScore), color: "oklch(0.55 0.22 25)" },
  ] : sentimentData

  return (
    <div className="grid gap-6">
      {/* Penalty Ledger Header (Only shows if GEO penalties exist) */}
      {penaltyLedger.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 mb-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Generative Engine Penalty Ledger
            </CardTitle>
            <p className="text-sm text-muted-foreground">The AI explicitly deducted points from this site for the following Generative Engine failures:</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {penaltyLedger.map((penalty, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-background/50 p-3">
                  <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10 shrink-0">
                    {penalty.pointsDeducted} pts
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{penalty.category} Penalty</div>
                    <div className="text-sm font-medium text-foreground leading-tight">{penalty.penalty}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand Share of Voice */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-geo/20 bg-geo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-geo" />
              Live LLM Share of Voice {liveInt?.identifiedQuery && <span className="text-xs font-normal text-muted-foreground ml-2 p-1 bg-geo/10 rounded">Query: "{liveInt.identifiedQuery}"</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayShareOfVoice}
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
                    {displayShareOfVoice.map((entry, index) => (
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
              {displaySentiment.map((item) => (
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
              <p className="mt-2 text-3xl font-bold text-geo">{geoData ? (geoData.sentimentScore > 0 ? `+${geoData.sentimentScore}` : geoData.sentimentScore) : "+78"}%</p>
              <p className="text-sm text-muted-foreground">Positive perception across LLMs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Context & Entity Module */}
      <Card className="border-geo/20 bg-geo-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <ImageIcon className="h-5 w-5 text-geo" />
            Media Context & Brand Visiblity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-geo/20 bg-geo-muted/20 p-4">
              <span className="text-sm font-medium text-muted-foreground">Total Brand Images</span>
              <p className="mt-1 text-3xl font-bold font-mono">{struct?.media?.totalImages || 0}</p>
            </div>
            <div className="rounded-lg border border-geo/20 bg-geo-muted/20 p-4">
              <span className="text-sm font-medium text-muted-foreground">Images with AI Context (Alt text)</span>
              <p className="mt-1 text-3xl font-bold font-mono text-geo">{struct?.media?.imagesWithAlt || 0}</p>
            </div>
            <div className="rounded-lg border border-geo/20 bg-geo-muted/20 p-4">
              <span className="text-sm font-medium text-muted-foreground">AI Blindspot Ratio</span>
              <p className="mt-1 text-3xl font-bold font-mono text-destructive">
                {struct?.media?.totalImages ? Math.round(((struct.media.totalImages - struct.media.imagesWithAlt) / struct.media.totalImages) * 100) : 0}%
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Current multi-modal LLMs (like ChatGPT and Claude) rely heavily on image alt text to establish entity relationships. A high blindspot ratio means conversational AIs cannot "see" your brand.
          </p>
        </CardContent>
      </Card>


      {/* Visibility Gaps & Clarity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-geo/20 bg-geo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Bot className="h-5 w-5 text-geo" />
              AI Visibility Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geoData?.visibilityGaps && geoData.visibilityGaps.length > 0 ? (
                geoData.visibilityGaps.map((gap: string) => (
                  <div key={gap} className="flex items-start gap-2 text-sm text-foreground/80">
                    <TrendingUp className="h-4 w-4 text-geo mt-0.5 shrink-0" />
                    <span>{gap}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">Run an analysis to identify visibility gaps...</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-geo/20 bg-geo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-geo" />
              LLM Context Clarity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative h-24 w-full">
                <Progress value={geoData?.citationLikelihood ?? 70} className="h-4 bg-muted" />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground uppercase font-semibold">
                  <span>Likelihood of Citation</span>
                  <span className="text-geo">{geoData?.citationLikelihood ?? 70}%</span>
                </div>
              </div>
              <div className="mt-6 w-full p-4 rounded bg-geo-muted/30 border border-geo/10">
                <p className="text-sm text-foreground/70 text-center italic">
                  "Your site's context clarity is rated at {geoData?.citationLikelihood ?? 70}%. High clarity leads to more frequent and accurate AI citations."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            {displayAiCitations.map((citation, index) => (
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
                    <p className="mt-1 text-sm text-muted-foreground">
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
