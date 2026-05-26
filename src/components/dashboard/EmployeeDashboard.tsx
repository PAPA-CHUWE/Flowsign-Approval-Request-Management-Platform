"use client";

import { useState } from "react";
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
import { useEmployeeDashboard } from "@/hooks/use-employee-dashboard";

export function EmployeeDashboard() {
  const { user } = useCurrentUser();
  const firstName = user?.firstName ?? getUserDisplayName(user).split(" ")[0];

  const { stats, requests, activity, activityUpdatedAt, isLoading } = useEmployeeDashboard();

  const [createOpen, setCreateOpen] = useState(false);
  const [initialType, setInitialType] = useState<string | undefined>();

  const statCards = [
    {
      Icon:  Clock,
      label: "My pending requests",
      value: isLoading ? "—" : String(stats?.pendingCount ?? 0),
      trend: { delta: "open", direction: "up" as const, label: "awaiting approval" },
    },
    {
      Icon:  CheckCircle2,
      label: "Approved this month",
      value: isLoading ? "—" : String(stats?.approvedThisMonth ?? 0),
      trend: { delta: "this month", direction: "up" as const, label: "requests approved" },
    },
    {
      Icon:  XCircle,
      label: "Rejected this month",
      value: isLoading ? "—" : String(stats?.rejectedThisMonth ?? 0),
      trend: { delta: "this month", direction: "down" as const, label: "requests rejected" },
    },
    {
      Icon:  Timer,
      label: "Avg. resolution time",
      value: isLoading ? "—" : stats?.avgResolutionHours != null ? `${stats.avgResolutionHours.toFixed(1)}h` : "—",
      trend: { delta: "my avg", direction: "down" as const, label: "hours to resolve" },
    },
  ];

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
      <div>
        <h1 className="font-dm-sans text-[28px] font-bold tracking-[-0.02em] text-brand-neutral-dark">
          Dashboard
        </h1>
        <p className="mt-0.5 font-dm-sans text-[14px] text-brand-neutral-mid">
          Welcome back, {firstName}. Here&apos;s a summary of your requests.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <DashboardStatCard key={card.label} {...card} />
        ))}
      </div>

      <RequestsTable requests={isLoading ? [] : requests} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeed items={isLoading ? [] : activity} updatedAt={activityUpdatedAt} />
        <QuickActionsGrid onCreateRequest={openCreateForType} />
      </div>

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
