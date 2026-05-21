"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Clock, CheckCircle2, XCircle, Timer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardStatCard } from "./DashboardStatCard";
import { RequestsTable } from "./RequestsTable";
import { ActivityFeed } from "./ActivityFeed";
import { QuickActionsGrid } from "./QuickActionsGrid";
import { RequestFormShell } from "@/components/request-form/RequestFormShell";
import { useCurrentUser, getUserDisplayName } from "@/hooks/use-current-user";
import {
  mockRequests,
  mockActivity,
  mockPipelineStats,
  mockRequestsByType,
} from "@/lib/mock/dashboard.mock";

// Dynamically import the Recharts-heavy card — keeps initial bundle lean
const ApprovalPipelineCard = dynamic(
  () => import("./ApprovalPipelineCard").then((m) => ({ default: m.ApprovalPipelineCard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex animate-pulse flex-col overflow-hidden rounded-[16px] border border-[#E8E6DE] bg-white">
        <div className="border-b border-[#E8E6DE] px-5 pb-4 pt-5">
          <div className="h-4 w-36 rounded-full bg-[#F1EFE8]" />
        </div>
        <div className="flex flex-col gap-4 px-5 py-6">
          <div className="mx-auto h-[180px] w-[180px] rounded-full bg-[#F1EFE8]" />
          <div className="flex flex-col gap-3">
            {[80, 60, 40, 30].map((w) => (
              <div key={w} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-16 rounded-full bg-[#F1EFE8]" />
                  <div className="h-3 w-6 rounded-full bg-[#F1EFE8]" />
                </div>
                <div className="h-1.5 rounded-full bg-[#F1EFE8]" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

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
  const { user } = useCurrentUser();
  const firstName = user?.firstName ?? getUserDisplayName(user).split(" ")[0];

  const [createOpen, setCreateOpen] = useState(false);
  const [initialType, setInitialType] = useState<string | undefined>();

  function openCreateForType(typeKey: string) {
    setInitialType(typeKey);
    setCreateOpen(true);
  }

  function handleRequestCreated() {
    setCreateOpen(false);
    setInitialType(undefined);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="font-dm-sans text-[28px] font-bold tracking-[-0.02em] text-brand-neutral-dark">
          Dashboard
        </h1>
        <p className="mt-0.5 font-dm-sans text-[14px] text-brand-neutral-mid">
          Welcome back, {firstName}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Section 1 — Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <DashboardStatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Section 2 — Requests table + pipeline (5/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5fr_3fr]">
        <RequestsTable requests={mockRequests} />
        <ApprovalPipelineCard stats={mockPipelineStats} byType={mockRequestsByType} />
      </div>

      {/* Section 3 — Activity feed + quick actions (50/50) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeed items={mockActivity} updatedAt="just now" />
        <QuickActionsGrid onCreateRequest={openCreateForType} />
      </div>

      {/* Create request dialog — opened from quick actions */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex h-[92vh] max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <div className="border-b border-[#E8E6DE] px-6 py-4">
            <DialogHeader>
              <DialogTitle>Create request</DialogTitle>
              <DialogDescription>
                Select a request type and provide the details approvers need.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <RequestFormShell
              onRequestCreated={handleRequestCreated}
              initialType={initialType}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
