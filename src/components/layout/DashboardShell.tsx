import type { ReactNode } from "react";

import { AppSidebar, MobileDashboardNav } from "./AppSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-svh bg-background md:h-svh md:overflow-hidden">
      <AppSidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main data-lenis-prevent className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-8">
          {children}
        </main>
      </div>
      <MobileDashboardNav />
    </div>
  );
}
