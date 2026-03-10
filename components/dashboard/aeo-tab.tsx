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
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts"
import { InfoTooltip } from "@/components/ui/info-tooltip"

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

interface AEOTabProps {
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
      aeoAnalysis: {
        questionsAnswered: { who: number, what: number, where: number, why: number, how: number },
        missingSchemas: string[],
        snippetEligibilityScore: number,
        topOpportunities: string[]
      }
    }
  }
}

export function AEOTab({ data }: AEOTabProps) {
  const aeoData = data?.ai?.aeoAnalysis
  const penaltyLedger = (data?.ai?.penaltyLedger || []).filter(p => p.category === "aeo")
  const struct = data?.structuralData

  const schemaHealthScore = aeoData?.snippetEligibilityScore ?? 85

  const displayQuestionAnalysis = aeoData ? [
    { type: "Who", questions: 10, answered: aeoData.questionsAnswered.who, examples: [] },
    { type: "What", questions: 10, answered: aeoData.questionsAnswered.what, examples: [] },
    { type: "Where", questions: 10, answered: aeoData.questionsAnswered.where, examples: [] },
    { type: "Why", questions: 10, answered: aeoData.questionsAnswered.why, examples: [] },
    { type: "How", questions: 10, answered: aeoData.questionsAnswered.how, examples: [] },
  ] : questionAnalysis

  return (
    <div className="grid gap-6">
      {/* Penalty Ledger Header (Only shows if AEO penalties exist) */}
      {penaltyLedger.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 mb-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Answer Engine Penalty Ledger
            </CardTitle>
            <p className="text-sm text-muted-foreground">The AI explicitly deducted points from this site for the following Answer Engine failures:</p>
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

      {/* Extracted Schema & QA Readiness Modules */}
      <h2 className="text-xl font-bold mt-2 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-aeo" />
        Answer Engine Readiness
      </h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* QA Content Depth module */}
        <Card className="border-aeo/20 bg-aeo-muted/10 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Code2 className="h-5 w-5 text-aeo" />
              Content QA Depth
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
              <span className="text-sm font-medium text-muted-foreground">Conversational Headers</span>
              <span className="font-mono font-bold text-aeo">{struct?.semanticTags?.headers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
              <span className="text-sm font-medium text-muted-foreground">Total Answer Corpus</span>
              <span className="font-mono font-bold">{struct?.wordCount || 0} words</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              LLMs rely on deep header hierarchy to instantly index Answers.
            </p>
          </CardContent>
        </Card>

        <Card className="border-aeo/20 bg-aeo-muted/10 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Code2 className="h-5 w-5 text-aeo" />
              Real-time Schema Audit
              <InfoTooltip content="Schema markup (structured data) helps search engines and AI understand your content. Different schema types enable different rich results like FAQs, products, recipes, etc." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {aeoData?.missingSchemas && aeoData.missingSchemas.length > 0 ? (
                aeoData.missingSchemas.map((schema: string) => (
                  <div key={schema} className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-foreground">{schema}</span>
                    <Badge variant="outline" className="ml-auto border-destructive/20 text-destructive text-[10px]">MISSING</Badge>
                  </div>
                ))
              ) : (
                schemaTypes.map((schema) => (
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
                        {schema.name === "Product Schema" && schema.status === "warning" && (
                          <InfoTooltip content="Product schema is incomplete. Ensure all required fields are present: name, image, description, offers (price, availability). This enables rich product cards in search results." />
                        )}
                        {schema.name === "BreadcrumbList" && schema.status === "error" && (
                          <InfoTooltip content="BreadcrumbList schema is missing or invalid. Add breadcrumb navigation with proper schema markup to show your site hierarchy in search results. This improves navigation and SEO." />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
            <InfoTooltip content="Measures how well your content answers common question types (Who, What, Where, Why, How). Answer engines like ChatGPT and Google's AI Overviews prioritize content that directly answers questions. Higher percentages = better AI visibility." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {displayQuestionAnalysis.map((qa) => {
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
          <div className="mt-4 p-3 rounded-lg bg-aeo/10 border border-aeo/20">
            <p className="text-xs text-muted-foreground">
              <strong>How to improve:</strong> Add FAQ sections, use question-format headings (H2/H3), provide direct answers in the first sentence, and structure content with clear "Who/What/Where/Why/How" sections.
            </p>
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
            {aeoData?.topOpportunities && aeoData.topOpportunities.length > 0 ? (
              aeoData.topOpportunities.map((opp: string) => (
                <div
                  key={opp}
                  className="flex items-start gap-3 rounded-lg border border-aeo/40 bg-aeo-muted/30 p-4"
                >
                  <Sparkles className="h-5 w-5 mt-0.5 shrink-0 text-aeo" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {opp}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="border-aeo/50 text-aeo bg-aeo/10">AI RECOMMENDATION</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredSnippets.map((snippet) => (
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
                    <p className="text-sm font-medium text-foreground">
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
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
