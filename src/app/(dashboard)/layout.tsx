import { AppSidebar, MobileDashboardNav } from "@/components/layout/AppSidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-[#FAFAF8] md:h-svh md:overflow-hidden">
      <AppSidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <DashboardNavbar />
        <main data-lenis-prevent className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-8">{children}</main>
      </div>
      <MobileDashboardNav />
    </div>
  );
}
