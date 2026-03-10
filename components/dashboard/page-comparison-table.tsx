"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PageData {
  url: string
  title: string
  seoScore: number
  aeoScore: number
  geoScore: number
  wordCount: number
  hasH1: boolean
  hasMetaDescription: boolean
  schemaCount: number
  issueCount: number
  responseTimeMs: number
}

interface PageComparisonTableProps {
  pages: PageData[]
  itemsPerPage?: number
}

type SortField = 'url' | 'seoScore' | 'aeoScore' | 'geoScore' | 'wordCount' | 'issueCount' | 'responseTimeMs'
type SortDirection = 'asc' | 'desc'

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-geo'
  if (score >= 60) return 'text-yellow-600'
  return 'text-destructive'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-geo/10'
  if (score >= 60) return 'bg-yellow-500/10'
  return 'bg-destructive/10'
}

export function PageComparisonTable({ pages, itemsPerPage = 10 }: PageComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('seoScore')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })
  }, [pages, sortField, sortDirection])

  const totalPages = Math.ceil(sortedPages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPages = sortedPages.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-geo" />
      : <ArrowDown className="h-3.5 w-3.5 text-geo" />
  }

  return (
    <Card className="border-geo/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-geo" />
              Page-by-Page Comparison
            </CardTitle>
            <CardDescription>
              Detailed metrics for all {pages.length} crawled pages
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-geo/30 text-geo bg-geo/5">
            {pages.length} Pages
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="text-left p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('url')}
                      className="flex items-center gap-1 hover:text-geo transition-colors"
                    >
                      URL
                      <SortIcon field="url" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('seoScore')}
                      className="flex items-center gap-1 hover:text-geo transition-colors mx-auto"
                    >
                      SEO
                      <SortIcon field="seoScore" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('aeoScore')}
                      className="flex items-center gap-1 hover:text-geo transition-colors mx-auto"
                    >
                      AEO
                      <SortIcon field="aeoScore" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('geoScore')}
                      className="flex items-center gap-1 hover:text-geo transition-colors mx-auto"
                    >
                      GEO
                      <SortIcon field="geoScore" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('wordCount')}
                      className="flex items-center gap-1 hover:text-geo transition-colors mx-auto"
                    >
                      Words
                      <SortIcon field="wordCount" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('issueCount')}
                      className="flex items-center gap-1 hover:text-geo transition-colors mx-auto"
                    >
                      Issues
                      <SortIcon field="issueCount" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPages.map((page, idx) => (
                  <tr 
                    key={page.url}
                    className={cn(
                      "border-b border-border/30 hover:bg-muted/30 transition-colors",
                      idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}
                  >
                    {/* URL */}
                    <td className="p-3">
                      <div className="flex items-center gap-2 max-w-md">
                        <a 
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-geo hover:underline truncate flex-1"
                          title={page.url}
                        >
                          {page.url}
                        </a>
                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-md" title={page.title}>
                        {page.title}
                      </p>
                    </td>

                    {/* SEO Score */}
                    <td className="p-3 text-center">
                      <div className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold", getScoreBg(page.seoScore))}>
                        <span className={getScoreColor(page.seoScore)}>{page.seoScore}</span>
                      </div>
                    </td>

                    {/* AEO Score */}
                    <td className="p-3 text-center">
                      <div className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold", getScoreBg(page.aeoScore))}>
                        <span className={getScoreColor(page.aeoScore)}>{page.aeoScore}</span>
                      </div>
                    </td>

                    {/* GEO Score */}
                    <td className="p-3 text-center">
                      <div className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold", getScoreBg(page.geoScore))}>
                        <span className={getScoreColor(page.geoScore)}>{page.geoScore}</span>
                      </div>
                    </td>

                    {/* Word Count */}
                    <td className="p-3 text-center">
                      <span className={cn(
                        "text-sm font-mono",
                        page.wordCount < 300 ? "text-destructive" : "text-foreground"
                      )}>
                        {page.wordCount.toLocaleString()}
                      </span>
                    </td>

                    {/* Issue Count */}
                    <td className="p-3 text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-bold",
                          page.issueCount === 0 
                            ? "border-geo/30 text-geo bg-geo/5"
                            : page.issueCount <= 2
                            ? "border-yellow-500/30 text-yellow-600 bg-yellow-500/5"
                            : "border-destructive/30 text-destructive bg-destructive/5"
                        )}
                      >
                        {page.issueCount}
                      </Badge>
                    </td>

                    {/* Status Indicators */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {page.hasH1 ? (
                          <CheckCircle2 className="h-4 w-4 text-geo" title="Has H1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" title="Missing H1" />
                        )}
                        {page.hasMetaDescription ? (
                          <CheckCircle2 className="h-4 w-4 text-geo" title="Has Meta Description" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" title="Missing Meta Description" />
                        )}
                        {page.schemaCount > 0 ? (
                          <Badge variant="outline" className="text-[10px] border-geo/30 text-geo bg-geo/5">
                            {page.schemaCount}
                          </Badge>
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" title="No Schema" />
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyUrl(page.url)}
                        className="h-8 px-2"
                      >
                        {copiedUrl === page.url ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-geo" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/20">
              <div className="text-xs text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, pages.length)} of {pages.length} pages
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "default" : "ghost"}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "h-8 w-8 p-0",
                        currentPage === page && "bg-geo text-geo-foreground hover:bg-geo/90"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
