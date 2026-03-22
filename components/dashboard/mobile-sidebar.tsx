"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSidebar({ open, onClose, children }: MobileSidebarProps) {
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    if (open) onClose()
  }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-0 top-0 bottom-0 w-64 animate-in slide-in-from-left duration-200 bg-sidebar border-r border-border/50 flex flex-col overflow-y-auto" role="dialog" aria-label="Navigation menu">
        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}
