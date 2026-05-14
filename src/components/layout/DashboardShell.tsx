import type { ReactNode } from "react"

import { AppSidebar, MobileDashboardNav } from "./AppSidebar"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-svh bg-background md:h-svh md:overflow-hidden">
      <AppSidebar className="hidden md:flex" />
      <main data-lenis-prevent className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-8">{children}</main>
      <MobileDashboardNav />
    </div>
  )
}
