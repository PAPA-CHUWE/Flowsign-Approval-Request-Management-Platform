"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, ClipboardCheck, CheckCircle2, XCircle, Timer } from "lucide-react";
import { DashboardStatCard } from "./DashboardStatCard";
import { RequestsTable } from "./RequestsTable";
import { ActivityFeed } from "./ActivityFeed";
import { useCurrentUser, getUserDisplayName } from "@/hooks/use-current-user";
import { useManagerDashboard } from "@/hooks/use-manager-dashboard";
import type { ApprovalQueueItem } from "@/lib/api/approvals";

// ── Priority badge ─────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-50 text-red-600 border border-red-200",
  high:   "bg-orange-50 text-orange-500 border border-orange-200",
  normal: "bg-blue-50 text-blue-600 border border-blue-200",
  low:    "bg-gray-100 text-gray-500 border border-gray-200",
};

function PriorityBadge({ priority }: { priority: string | null }) {
  const key = priority?.toLowerCase() ?? "normal";
  const cls = PRIORITY_STYLES[key] ?? PRIORITY_STYLES.normal;
  return (
    <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-bold capitalize ${cls}`}>
      {priority ?? "Normal"}
    </span>
  );
}

// ── Pending queue preview card ─────────────────────────────────────────────────

function PendingQueuePreview({
  items,
  total,
  isLoading,
}: {
  items: ApprovalQueueItem[];
  total: number;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#E8E6DE] bg-white">
      <div className="flex items-center justify-between border-b border-[#E8E6DE] px-5 pb-4 pt-5">
        <div>
          <h2 className="font-dm-sans text-[15px] font-semibold text-brand-neutral-dark">
            Pending your approval
          </h2>
          {!isLoading && total > 0 && (
            <p className="mt-0.5 font-dm-sans text-[12px] text-[#888780]">
              {total} request{total !== 1 ? "s" : ""} awaiting your decision
            </p>
          )}
        </div>
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1 font-dm-sans text-[12px] font-semibold text-brand-teal no-underline hover:underline"
        >
          View all <ArrowRight size={12} strokeWidth={2.5} />
        </Link>
      </div>

      {isLoading ? (
        <div className="divide-y divide-[#E8E6DE]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 animate-pulse rounded bg-[#F1EFE8]" />
                <div className="h-3 w-28 animate-pulse rounded bg-[#F1EFE8]" />
              </div>
              <div className="h-5 w-14 animate-pulse rounded-full bg-[#F1EFE8]" />
              <div className="h-7 w-16 animate-pulse rounded-[6px] bg-[#F1EFE8]" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-24 items-center justify-center">
          <p className="font-dm-sans text-[13px] text-[#B4B2A9]">
            No pending approvals — you&apos;re all caught up.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#E8E6DE]">
          {items.map((item) => (
            <li
              key={item.assignmentPublicId}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#FAFAF8]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-dm-sans text-[13px] font-semibold text-brand-neutral-dark">
                  {item.title ?? "Untitled request"}
                </p>
                <p className="mt-0.5 truncate font-dm-sans text-[11px] text-brand-neutral-mid">
                  {item.requesterName ?? "Unknown"} · {item.requestType?.name ?? item.department ?? "—"}
                </p>
              </div>
              <PriorityBadge priority={item.priority} />
              <Link
                href="/approvals"
                className="flex h-7 shrink-0 items-center gap-1 rounded-[6px] border border-[#E8E6DE] px-2.5 font-dm-sans text-[11px] font-semibold text-brand-neutral-mid no-underline transition-colors hover:border-brand-teal hover:text-brand-teal"
              >
                Review <ChevronRight size={11} strokeWidth={2.5} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Manager Dashboard ──────────────────────────────────────────────────────────

export function ManagerDashboard() {
  const { user } = useCurrentUser();
  const firstName = user?.firstName ?? getUserDisplayName(user).split(" ")[0];

  const {
    stats,
    requests,
    activity,
    activityUpdatedAt,
    queueItems,
    queueTotal,
    isLoading,
  } = useManagerDashboard();

  const statCards = [
    {
      Icon:  ClipboardCheck,
      label: "Pending my approval",
      value: isLoading ? "—" : String(stats?.pendingApprovals ?? 0),
      trend: { delta: "in queue", direction: "up" as const, label: "awaiting your review" },
    },
    {
      Icon:  CheckCircle2,
      label: "Total approved",
      value: isLoading ? "—" : String(stats?.totalApproved ?? 0),
      trend: { delta: "all time", direction: "up" as const, label: "requests approved" },
    },
    {
      Icon:  XCircle,
      label: "Total rejected",
      value: isLoading ? "—" : String(stats?.totalRejected ?? 0),
      trend: { delta: "all time", direction: "down" as const, label: "requests rejected" },
    },
    {
      Icon:  Timer,
      label: "Avg. resolution time",
      value: isLoading ? "—" : stats?.avgResolutionHours != null ? `${stats.avgResolutionHours.toFixed(1)}h` : "—",
      trend: { delta: "avg", direction: "down" as const, label: "hours to resolve" },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-dm-sans text-[28px] font-bold tracking-[-0.02em] text-brand-neutral-dark">
          Dashboard
        </h1>
        <p className="mt-0.5 font-dm-sans text-[14px] text-brand-neutral-mid">
          Welcome back, {firstName}. You have{" "}
          <span className="font-semibold text-brand-teal">
            {isLoading ? "—" : queueTotal}
          </span>{" "}
          request{queueTotal !== 1 ? "s" : ""} awaiting your approval.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <DashboardStatCard key={card.label} {...card} />
        ))}
      </div>

      <PendingQueuePreview items={queueItems} total={queueTotal} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5fr_3fr]">
        <RequestsTable title="Team Requests" requests={isLoading ? [] : requests} />
        <ActivityFeed items={isLoading ? [] : activity} updatedAt={activityUpdatedAt} />
      </div>
    </div>
  );
}
