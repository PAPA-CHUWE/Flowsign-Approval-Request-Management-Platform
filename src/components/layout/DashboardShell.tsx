import type { ReactNode } from "react"

import { AppSidebar } from "./AppSidebar"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-svh bg-background">
      <AppSidebar />
      <main data-lenis-prevent className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
