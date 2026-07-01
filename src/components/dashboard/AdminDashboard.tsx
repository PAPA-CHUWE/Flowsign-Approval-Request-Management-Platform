"use client";

import dynamic from "next/dynamic";
import { AdminSummary } from "./AdminSummary";
import { AgentPipeline } from "./AgentPipeline";
import { WorkflowSetupBanner } from "./WorkflowSetupBanner";
import { RequestsTable } from "./RequestsTable";
import { ActivityFeed } from "./ActivityFeed";
import { useCurrentUser, getUserDisplayName } from "@/hooks/use-current-user";
import { useDashboard } from "@/hooks/use-dashboard";

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
        </div>
      </div>
    ),
  }
);

export function AdminDashboard() {
  const { user } = useCurrentUser();
  const firstName = user?.firstName ?? getUserDisplayName(user).split(" ")[0];

  const { stats, requests, activity, activityUpdatedAt, isLoading } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-dm-sans text-[28px] font-bold tracking-[-0.02em] text-brand-neutral-dark">
          Dashboard
        </h1>
        <p className="mt-0.5 font-dm-sans text-[14px] text-brand-neutral-mid">
          Welcome back, {firstName}. Here&apos;s your organisation at a glance.
        </p>
      </div>

      <AdminSummary />

      <WorkflowSetupBanner />

      <AgentPipeline requestPublicId={requests[0]?.id ?? ""} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5fr_3fr]">
        <RequestsTable title="All Requests" requests={isLoading ? [] : requests} />
        <ApprovalPipelineCard
          stats={stats?.pipelineStats ?? { pending: 0, approved: 0, rejected: 0, inReview: 0 }}
          topRequestTypes={stats?.topRequestTypes ?? []}
        />
      </div>

      <ActivityFeed items={isLoading ? [] : activity} updatedAt={activityUpdatedAt} />
    </div>
  );
}