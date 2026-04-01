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
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
        "bg-green-500 hover:bg-green-500/90 text-black",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {isGenerating ? 'Generating PDF...' : 'Download Report'}
    </button>
  )
}
