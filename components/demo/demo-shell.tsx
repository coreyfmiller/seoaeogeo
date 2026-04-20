"use client"

import { DemoSidebar } from "./demo-sidebar"

interface DemoShellProps {
  children: React.ReactNode
}

export function DemoShell({ children }: DemoShellProps) {
  return (
    <div className="flex h-screen bg-background">
      <DemoSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
