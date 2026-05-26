"use client"

import { useEffect, useState } from "react"
import { getAnalyticsDashboard, type TopRequestType } from "@/lib/api/analytics"
import { listApprovalRequests, type ApprovalRequest } from "@/lib/api/requests"
import { getActivity, type ActivityEvent } from "@/lib/api/activity"
import { formatRelativeTime } from "@/lib/format/date"
import type { DashboardRequest, ActivityItem, PipelineStats } from "@/lib/mock/dashboard.mock"

// ── Adapters ──────────────────────────────────────────────────────────────────

const STATUS_STEPS: Record<string, [number, number]> = {
  draft:     [0, 3],
  pending:   [1, 3],
  in_review: [2, 3],
  approved:  [3, 3],
  rejected:  [2, 2],
  cancelled: [0, 0],
}

function adaptRequest(r: ApprovalRequest): DashboardRequest {
  const status = (r.status ?? "pending") as DashboardRequest["status"]
  const [step, totalSteps] = STATUS_STEPS[status] ?? [1, 3]
  const type =
    typeof r.requestType === "string"
      ? r.requestType
      : (r.requestType?.name ?? r.requestTypeKey ?? "General")
  return {
    id:          r.publicId ?? r.requestKey ?? "",
    type,
    description: r.title ?? r.summary ?? r.description ?? "Untitled",
    amount:      r.amount ?? null,
    status,
    date:        r.submittedAt ?? r.createdAt ?? new Date().toISOString(),
    step,
    totalSteps,
  }
}

function adaptActivity(e: ActivityEvent): ActivityItem {
  return {
    id:   e.id as number,
    type: e.type,
    text: e.text,
    time: formatRelativeTime(e.occurredAt),
  }
}

function adaptPipelineStats(totals: Record<string, number>): PipelineStats {
  return {
    pending:  totals["pending"]   ?? 0,
    approved: totals["approved"]  ?? 0,
    rejected: totals["rejected"]  ?? 0,
    inReview: totals["in_review"] ?? 0,
  }
}

// ── Dashboard data shape ──────────────────────────────────────────────────────

export interface DashboardStats {
  pendingApprovals: number
  totalPending: number
  totalApproved: number
  totalRejected: number
  avgResolutionHours: number | null
  pipelineStats: PipelineStats
  topRequestTypes: TopRequestType[]
}

export interface DashboardData {
  stats: DashboardStats | null
  requests: DashboardRequest[]
  activity: ActivityItem[]
  activityUpdatedAt: string
  isLoading: boolean
  error: string
}

export function useDashboard(): DashboardData {
  const [stats, setStats]           = useState<DashboardStats | null>(null)
  const [requests, setRequests]     = useState<DashboardRequest[]>([])
  const [activity, setActivity]     = useState<ActivityItem[]>([])
  const [activityUpdatedAt, setActivityUpdatedAt] = useState("—")
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState("")

  useEffect(() => {
    let ignore = false

    Promise.all([
      getAnalyticsDashboard(),
      listApprovalRequests({ limit: 10, page: 1 }),
      getActivity({ scope: "all", limit: 10 }),
    ])
      .then(([analyticsRes, requestsRes, activityRes]) => {
        if (ignore) return

        const d = analyticsRes.responseBody.dashboard
        setStats({
          pendingApprovals:   d.pendingApprovals,
          totalPending:       d.totals["pending"]  ?? 0,
          totalApproved:      d.totals["approved"] ?? 0,
          totalRejected:      d.totals["rejected"] ?? 0,
          avgResolutionHours: d.averageResolutionHours,
          pipelineStats:      adaptPipelineStats(d.totals),
          topRequestTypes:    d.topRequestTypes ?? [],
        })

        setRequests(requestsRes.responseBody.result.items.map(adaptRequest))

        const events = activityRes.responseBody.items ?? []
        setActivity(events.map(adaptActivity))
        setActivityUpdatedAt(events.length > 0 ? "just now" : "—")
      })
      .catch((reason) => {
        if (!ignore) {
          setError(reason instanceof Error ? reason.message : "Could not load dashboard.")
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => { ignore = true }
  }, [])

  return { stats, requests, activity, activityUpdatedAt, isLoading, error }
}
