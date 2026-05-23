"use client"

import { useEffect, useState } from "react"
import { getRequestStats, listApprovalRequests, type ApprovalRequest } from "@/lib/api/requests"
import { getActivity, type ActivityEvent } from "@/lib/api/activity"
import { formatRelativeTime } from "@/lib/format/date"
import type {
  DashboardRequest,
  ActivityItem,
  PipelineStats,
  RequestsByType,
} from "@/lib/mock/dashboard.mock"

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

function adaptPipelineStats(byStatus: Record<string, number>): PipelineStats {
  return {
    pending:  byStatus["pending"]   ?? 0,
    approved: byStatus["approved"]  ?? 0,
    rejected: byStatus["rejected"]  ?? 0,
    inReview: byStatus["in_review"] ?? 0,
  }
}

function adaptRequestsByType(byType: Record<string, number>): RequestsByType {
  return {
    funds:  byType["finance"]      ?? byType["funds"]  ?? byType["expense_claim"] ?? 0,
    travel: byType["travel"]       ?? 0,
    assets: byType["asset"]        ?? byType["assets"] ?? 0,
    access: byType["access"]       ?? 0,
    hr:     byType["hr"]           ?? 0,
  }
}

// ── Dashboard data shape ──────────────────────────────────────────────────────

export interface DashboardStats {
  pendingCount: number
  approvedThisMonth: number
  rejectedThisMonth: number
  avgResolutionHours: number
  pendingDelta: number
  approvedDelta: number
  rejectedDelta: number
  pipelineStats: PipelineStats
  requestsByType: RequestsByType
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
  const [stats, setStats]     = useState<DashboardStats | null>(null)
  const [requests, setRequests] = useState<DashboardRequest[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [activityUpdatedAt, setActivityUpdatedAt] = useState("—")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    let ignore = false

    Promise.all([
      getRequestStats(),
      listApprovalRequests({ limit: 10, page: 1 }),
      getActivity({ scope: "own", limit: 10 }),
    ])
      .then(([statsRes, requestsRes, activityRes]) => {
        if (ignore) return

        const s = statsRes.responseBody.stats
        setStats({
          pendingCount:        s.pendingCount,
          approvedThisMonth:   s.approvedThisMonth,
          rejectedThisMonth:   s.rejectedThisMonth,
          avgResolutionHours:  s.avgResolutionHours,
          pendingDelta:        s.pendingDelta,
          approvedDelta:       s.approvedDelta,
          rejectedDelta:       s.rejectedDelta,
          pipelineStats:       adaptPipelineStats(s.byStatus ?? {}),
          requestsByType:      adaptRequestsByType(s.byType ?? {}),
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
