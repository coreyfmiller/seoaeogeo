"use client"

import React, { useState, useMemo } from "react"
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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PageIssue {
  type: string
  severity: 'high' | 'medium' | 'low'
  fix: string
}

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
  issues: PageIssue[]
  responseTimeMs: number
}

interface PageComparisonTableProps {
  pages: PageData[]
  itemsPerPage?: number
}

type SortField = 'url' | 'seoScore' | 'aeoScore' | 'geoScore' | 'wordCount' | 'issueCount' | 'responseTimeMs'
type SortDirection = 'asc' | 'desc'

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-green-500/10'
  if (score >= 50) return 'bg-yellow-500/10'
  return 'bg-red-500/10'
}

export function PageComparisonTable({ pages, itemsPerPage = 10 }: PageComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('seoScore')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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

  const toggleRow = (url: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(url)) {
      newExpanded.delete(url)
    } else {
      newExpanded.add(url)
    }
    setExpandedRows(newExpanded)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-[#00e5ff]" />
      : <ArrowDown className="h-3.5 w-3.5 text-[#00e5ff]" />
  }

  return (
    <Card className="border-[#00e5ff]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-[#00e5ff]" />
              Page-by-Page Comparison
            </CardTitle>
            <CardDescription>
              Detailed metrics for all {pages.length} crawled pages
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/5">
            {pages.length} Pages
          </Badge>
        </div>
        {/* Issues summary */}
        {(() => {
          const totalIssues = pages.reduce((s, p) => s + p.issueCount, 0)
          const highIssues = pages.reduce((s, p) => s + p.issues.filter(i => i.severity === 'high').length, 0)
          const medIssues = pages.reduce((s, p) => s + p.issues.filter(i => i.severity === 'medium').length, 0)
          if (totalIssues === 0) return null
          return (
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-muted-foreground">{totalIssues} issues across {pages.filter(p => p.issueCount > 0).length} pages</span>
              {highIssues > 0 && <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/5 text-[10px]">{highIssues} High</Badge>}
              {medIssues > 0 && <Badge variant="outline" className="border-yellow-500/30 text-yellow-600 bg-yellow-500/5 text-[10px]">{medIssues} Medium</Badge>}
            </div>
          )
        })()}
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
                      className="flex items-center gap-1 hover:text-[#00e5ff] transition-colors"
                    >
                      URL
                      <SortIcon field="url" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('seoScore')}
                      className="flex items-center gap-1 hover:text-[#00e5ff] transition-colors mx-auto"
                    >
                      SEO
                      <SortIcon field="seoScore" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('aeoScore')}
                      className="flex items-center gap-1 hover:text-[#00e5ff] transition-colors mx-auto"
                    >
                      AEO
                      <SortIcon field="aeoScore" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('geoScore')}
                      className="flex items-center gap-1 hover:text-[#00e5ff] transition-colors mx-auto"
                    >
                      GEO
                      <SortIcon field="geoScore" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('wordCount')}
                      className="flex items-center gap-1 hover:text-[#00e5ff] transition-colors mx-auto"
                    >
                      Words
                      <SortIcon field="wordCount" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('issueCount')}
                      className="flex items-center gap-1 hover:text-[#00e5ff] transition-colors mx-auto"
                    >
                      Issues
                      <SortIcon field="issueCount" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-xs font-bold uppercase tracking-wider">
                    View Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPages.map((page, idx) => {
                  const isExpanded = expandedRows.has(page.url)
                  return (
                    <React.Fragment key={page.url}>
                      <tr 
                        className={cn(
                          "border-b border-border/30 hover:bg-muted/30 transition-colors",
                          idx % 2 === 0 ? "bg-background" : "bg-muted/10",
                          isExpanded && "bg-muted/50"
                        )}
                      >
                        {/* URL */}
                        <td className="p-3">
                          <div className="flex items-center gap-2 max-w-md">
                            <a 
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-[#00e5ff] hover:underline truncate flex-1"
                              title={page.url}
                            >
                              {page.url}
                            </a>
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 hover:text-[#00e5ff] transition-colors"
                              title="Open in new tab"
                            >
                              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-[#00e5ff]" />
                            </a>
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
                                ? "border-green-500/30 text-green-500 bg-green-500/5"
                                : page.issueCount <= 2
                                ? "border-yellow-500/30 text-yellow-600 bg-yellow-500/5"
                                : "border-destructive/30 text-destructive bg-destructive/5"
                            )}
                          >
                            {page.issueCount}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          {page.issueCount > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleRow(page.url)}
                              className="h-8 px-2"
                              title={isExpanded ? "Hide actions" : "View actions"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row - Issues Detail */}
                      {isExpanded && page.issues.length > 0 && (
                        <tr key={`${page.url}-expanded`} className="bg-muted/30 border-b border-border/50">
                          <td colSpan={7} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <h4 className="text-sm font-bold">Issues Found ({page.issues.length})</h4>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyUrl(page.url)}
                                  className="h-7 px-2 text-xs"
                                >
                                  {copiedUrl === page.url ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 mr-1.5 text-[#00e5ff]" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1.5" />
                                      Copy URL
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {page.issues.map((issue, issueIdx) => {
                                  const severityConfig = {
                                    high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: 'HIGH' },
                                    medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30', label: 'MEDIUM' },
                                    low: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30', label: 'LOW' }
                                  }
                                  const config = severityConfig[issue.severity]
                                  
                                  return (
                                    <div 
                                      key={issueIdx}
                                      className={cn(
                                        "p-3 rounded-lg border flex items-start gap-3",
                                        config.border,
                                        config.bg
                                      )}
                                    >
                                      <Badge 
                                        variant="outline" 
                                        className={cn(
                                          "text-[9px] font-black uppercase tracking-wider shrink-0",
                                          config.bg,
                                          config.text,
                                          config.border
                                        )}
                                      >
                                        {config.label}
                                      </Badge>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold mb-1">{issue.type}</p>
                                        <div className="flex items-start gap-2 p-2 rounded bg-background/50 border border-border/30">
                                          <Zap className="h-3 w-3 text-[#00e5ff] shrink-0 mt-0.5" />
                                          <p className="text-xs text-foreground/90 leading-relaxed">
                                            <span className="font-semibold text-[#00e5ff]">Fix:</span> {issue.fix}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
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
                        currentPage === page && "bg-[#00e5ff] text-white hover:bg-[#00e5ff]/90"
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
