import type { ReactNode } from "react"

import { AppSidebar } from "./AppSidebar"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar />
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  )
}
