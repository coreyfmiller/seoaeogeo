"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  MessageSquareQuote,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts"

const schemaTypes = [
  { name: "FAQ Schema", status: "valid", coverage: 95 },
  { name: "HowTo Schema", status: "valid", coverage: 88 },
  { name: "Product Schema", status: "warning", coverage: 72 },
  { name: "Article Schema", status: "valid", coverage: 100 },
  { name: "Organization Schema", status: "valid", coverage: 100 },
  { name: "BreadcrumbList", status: "error", coverage: 45 },
]

const questionAnalysis = [
  {
    type: "Who",
    questions: 24,
    answered: 22,
    examples: ["Who founded the company?", "Who is the target audience?"],
  },
  {
    type: "What",
    questions: 45,
    answered: 41,
    examples: ["What is search intelligence?", "What features are included?"],
  },
  {
    type: "Where",
    questions: 12,
    answered: 10,
    examples: ["Where is the company located?", "Where can I find pricing?"],
  },
  {
    type: "Why",
    questions: 18,
    answered: 15,
    examples: ["Why use this platform?", "Why is AEO important?"],
  },
  {
    type: "How",
    questions: 38,
    answered: 35,
    examples: ["How to get started?", "How does pricing work?"],
  },
]

const featuredSnippets = [
  {
    query: "What is answer engine optimization?",
    status: "featured",
    position: 0,
  },
  {
    query: "How to optimize for AI search?",
    status: "eligible",
    position: 3,
  },
  {
    query: "Best SEO tools for 2024",
    status: "featured",
    position: 0,
  },
  {
    query: "Search intelligence explained",
    status: "eligible",
    position: 2,
  },
]

export function AEOTab() {
  const schemaHealthScore = 85

  return (
    <div className="grid gap-6">
      {/* Schema Health Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-aeo/20 bg-aeo-muted/10 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Code2 className="h-5 w-5 text-aeo" />
              Schema Health Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={12}
                  data={[{ value: schemaHealthScore, fill: "oklch(0.65 0.25 300)" }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: "oklch(0.2 0.01 260)" }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{schemaHealthScore}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Your structured data is well-optimized for AI extraction
            </p>
          </CardContent>
        </Card>

        <Card className="border-aeo/20 bg-aeo-muted/10 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Code2 className="h-5 w-5 text-aeo" />
              Schema Validation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {schemaTypes.map((schema) => (
                <div
                  key={schema.name}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3",
                    schema.status === "valid" && "border-geo/30 bg-geo-muted/10",
                    schema.status === "warning" && "border-yellow-500/30 bg-yellow-500/10",
                    schema.status === "error" && "border-destructive/30 bg-destructive/10"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {schema.status === "valid" && (
                        <CheckCircle2 className="h-4 w-4 text-geo" />
                      )}
                      {schema.status === "warning" && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      {schema.status === "error" && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium text-foreground">{schema.name}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress
                        value={schema.coverage}
                        className="h-1.5 flex-1 bg-muted"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        {schema.coverage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question-Based Content Analysis */}
      <Card className="border-aeo/20 bg-aeo-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <HelpCircle className="h-5 w-5 text-aeo" />
            Question-Based Content Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {questionAnalysis.map((qa) => {
              const percentage = Math.round((qa.answered / qa.questions) * 100)
              return (
                <div
                  key={qa.type}
                  className="rounded-lg border border-aeo/20 bg-aeo-muted/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-aeo">{qa.type}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-aeo/50 font-mono",
                        percentage >= 90 ? "text-geo" : "text-aeo"
                      )}
                    >
                      {percentage}%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Questions</span>
                      <span className="text-foreground font-medium">{qa.questions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Answered</span>
                      <span className="text-geo font-medium">{qa.answered}</span>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="mt-3 h-1.5 bg-muted"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Featured Snippets */}
      <Card className="border-aeo/20 bg-aeo-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-aeo" />
            Featured Snippet Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredSnippets.map((snippet) => (
              <div
                key={snippet.query}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4",
                  snippet.status === "featured"
                    ? "border-aeo/40 bg-aeo-muted/30"
                    : "border-border/50 bg-muted/20"
                )}
              >
                <MessageSquareQuote
                  className={cn(
                    "h-5 w-5 mt-0.5 shrink-0",
                    snippet.status === "featured" ? "text-aeo" : "text-muted-foreground"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {snippet.query}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        snippet.status === "featured"
                          ? "border-aeo/50 text-aeo bg-aeo/10"
                          : "border-muted-foreground/50 text-muted-foreground"
                      )}
                    >
                      {snippet.status === "featured" ? "Featured" : "Eligible"}
                    </Badge>
                    {snippet.position > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Position #{snippet.position}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
