"use client"

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DownloadReportButtonProps {
  generatePdf: () => Promise<Blob>
  filename: string
  className?: string
}

export function DownloadReportButton({ generatePdf, filename, className }: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const blob = await generatePdf()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
        "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
      {isGenerating ? 'Generating...' : 'Download Report'}
    </button>
  )
}
