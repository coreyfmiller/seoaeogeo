"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Link2,
  FileText,
  Shield,
  MapPin,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const keywordData = [
  {
    keyword: "search intelligence platform",
    position: 3,
    change: 2,
    volume: 2400,
    difficulty: 67,
  },
  {
    keyword: "SEO analytics tool",
    position: 7,
    change: -1,
    volume: 8100,
    difficulty: 78,
  },
  {
    keyword: "AI content optimization",
    position: 12,
    change: 5,
    volume: 3200,
    difficulty: 45,
  },
  {
    keyword: "answer engine optimization",
    position: 1,
    change: 0,
    volume: 1800,
    difficulty: 34,
  },
  {
    keyword: "LLM brand visibility",
    position: 4,
    change: 3,
    volume: 720,
    difficulty: 23,
  },
]

const backlinkData = [
  { domain: "techcrunch.com", authority: 94, links: 12, type: "DoFollow" },
  { domain: "searchenginejournal.com", authority: 88, links: 8, type: "DoFollow" },
  { domain: "moz.com", authority: 91, links: 5, type: "DoFollow" },
  { domain: "ahrefs.com", authority: 89, links: 3, type: "NoFollow" },
]

const technicalHealth = [
  { name: "SSL Certificate", status: true, icon: Shield },
  { name: "XML Sitemap", status: true, icon: MapPin },
  { name: "Robots.txt", status: true, icon: Bot },
  { name: "Canonical Tags", status: true, icon: FileText },
  { name: "Mobile Friendly", status: true, icon: CheckCircle2 },
  { name: "Core Web Vitals", status: false, icon: TrendingUp },
]

const trafficData = [
  { month: "Jan", organic: 12400, direct: 3200 },
  { month: "Feb", organic: 14200, direct: 3800 },
  { month: "Mar", organic: 15800, direct: 4100 },
  { month: "Apr", organic: 18200, direct: 4500 },
  { month: "May", organic: 22100, direct: 5200 },
  { month: "Jun", organic: 26400, direct: 5800 },
]

export function SEOTab() {
  return (
    <div className="grid gap-6">
      {/* Traffic Growth Chart */}
      <Card className="border-seo/20 bg-seo-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-seo" />
            Organic Traffic Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="organicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.2 250)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.7 0.2 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.13 0.01 260)",
                    border: "1px solid oklch(0.25 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0 0)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="organic"
                  stroke="oklch(0.7 0.2 250)"
                  strokeWidth={2}
                  fill="url(#organicGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Keyword Rankings */}
        <Card className="border-seo/20 bg-seo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-seo" />
              Keyword Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Keyword</TableHead>
                  <TableHead className="text-muted-foreground text-right">Pos</TableHead>
                  <TableHead className="text-muted-foreground text-right">Change</TableHead>
                  <TableHead className="text-muted-foreground text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywordData.map((kw) => (
                  <TableRow key={kw.keyword} className="border-border/30 hover:bg-seo-muted/20">
                    <TableCell className="font-medium text-foreground text-sm">
                      {kw.keyword}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-seo/50 text-seo font-mono",
                          kw.position <= 3 && "bg-seo/20"
                        )}
                      >
                        #{kw.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "flex items-center justify-end gap-1 text-sm",
                          kw.change > 0 && "text-geo",
                          kw.change < 0 && "text-destructive",
                          kw.change === 0 && "text-muted-foreground"
                        )}
                      >
                        {kw.change > 0 && <TrendingUp className="h-3 w-3" />}
                        {kw.change < 0 && <TrendingDown className="h-3 w-3" />}
                        {kw.change !== 0 ? Math.abs(kw.change) : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {kw.volume.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Backlinks */}
        <Card className="border-seo/20 bg-seo-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Link2 className="h-5 w-5 text-seo" />
              Top Backlinks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Domain</TableHead>
                  <TableHead className="text-muted-foreground text-right">DA</TableHead>
                  <TableHead className="text-muted-foreground text-right">Links</TableHead>
                  <TableHead className="text-muted-foreground text-right">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backlinkData.map((bl) => (
                  <TableRow key={bl.domain} className="border-border/30 hover:bg-seo-muted/20">
                    <TableCell className="font-medium text-foreground text-sm">
                      {bl.domain}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="border-seo/50 text-seo font-mono">
                        {bl.authority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {bl.links}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          bl.type === "DoFollow"
                            ? "border-geo/50 text-geo"
                            : "border-muted-foreground/50 text-muted-foreground"
                        )}
                      >
                        {bl.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Technical Health */}
      <Card className="border-seo/20 bg-seo-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-seo" />
            Technical Health Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technicalHealth.map((item) => (
              <div
                key={item.name}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  item.status
                    ? "border-geo/30 bg-geo-muted/20"
                    : "border-destructive/30 bg-destructive/10"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    item.status ? "text-geo" : "text-destructive"
                  )}
                />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <div className="ml-auto">
                  {item.status ? (
                    <CheckCircle2 className="h-5 w-5 text-geo" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
