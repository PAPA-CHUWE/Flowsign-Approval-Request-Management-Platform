import { Clock, CheckCircle2, XCircle, Timer } from "lucide-react";
import { DashboardStatCard } from "./DashboardStatCard";
import { RequestsTable } from "./RequestsTable";
import { ApprovalPipelineCard } from "./ApprovalPipelineCard";
import { ActivityFeed } from "./ActivityFeed";
import { QuickActionsGrid } from "./QuickActionsGrid";
import {
  mockRequests,
  mockActivity,
  mockPipelineStats,
  mockRequestsByType,
} from "@/lib/mock/dashboard.mock";

const STAT_CARDS = [
  {
    Icon: Clock,
    label: "Pending approvals",
    value: "4",
    trend: { delta: "+2", direction: "up" as const, label: "vs last week" },
  },
  {
    Icon: CheckCircle2,
    label: "Approved this month",
    value: "12",
    trend: { delta: "+5", direction: "up" as const, label: "vs last month" },
  },
  {
    Icon: XCircle,
    label: "Rejected",
    value: "2",
    trend: { delta: "-1", direction: "down" as const, label: "vs last month" },
  },
  {
    Icon: Timer,
    label: "Avg. resolution time",
    value: "3.2h",
    trend: { delta: "-0.4h", direction: "down" as const, label: "improvement" },
  },
] as const;

export function EmployeeDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="font-dm-sans text-[22px] font-bold tracking-[-0.01em] text-brand-neutral-dark">
          Dashboard
        </h1>
        <p className="mt-0.5 font-dm-sans text-[14px] text-brand-neutral-mid">
          Welcome back, A. User. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Section 1 — Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <DashboardStatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Section 2 — Requests table + pipeline (60/40) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <RequestsTable requests={mockRequests} />
        <ApprovalPipelineCard stats={mockPipelineStats} byType={mockRequestsByType} />
      </div>

      {/* Section 3 — Activity feed + quick actions (50/50) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeed items={mockActivity} updatedAt="just now" />
        <QuickActionsGrid />
      </div>
    </div>
  );
}
