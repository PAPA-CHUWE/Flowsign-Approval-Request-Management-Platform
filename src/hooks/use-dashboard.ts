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

const ACTIVITY_TYPE_MAP: Record<string, ActivityItem["type"]> = {
  approved:        "approved",
  approve:         "approved",
  rejected:        "rejected",
  reject:          "rejected",
  pending:         "pending",
  submitted:       "pending",
  submit:          "pending",
  request_changes: "info",
  delegated:       "info",
  escalated:       "info",
  comment:         "info",
  commented:       "info",
}

function adaptActivity(e: ActivityEvent): ActivityItem {
  const type = ACTIVITY_TYPE_MAP[e.type?.toLowerCase()] ?? "info"
  return {
    id:   e.id as number,
    type,
    text: e.text,
    time: formatRelativeTime(e.createdAt),
  }
}

function adaptPipelineStats(byStatus: { status: string; count: number }[]): PipelineStats {
  const map: Record<string, number> = {}
  byStatus.forEach((s) => { map[s.status] = s.count })
  return {
    pending:  map["pending"]   ?? 0,
    approved: map["approved"]  ?? 0,
    rejected: map["rejected"]  ?? 0,
    inReview: map["in_review"] ?? 0,
  }
}

function adaptRequestsByType(byType: { key: string; name: string; count: number }[]): RequestsByType {
  const map: Record<string, number> = {}
  byType.forEach((t) => { map[t.key.toLowerCase()] = t.count })
  return {
    funds:  map["finance"]      ?? map["funds"]  ?? map["expense_claim"] ?? 0,
    travel: map["travel"]       ?? 0,
    assets: map["asset"]        ?? map["assets"] ?? 0,
    access: map["access"]       ?? 0,
    hr:     map["hr"]           ?? 0,
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

const EMPTY_PIPELINE: PipelineStats  = { pending: 0, approved: 0, rejected: 0, inReview: 0 }
const EMPTY_BY_TYPE: RequestsByType  = { funds: 0, travel: 0, assets: 0, access: 0, hr: 0 }

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

        const rb = statsRes.responseBody
        setStats({
          pendingCount:        rb.pendingCount,
          approvedThisMonth:   rb.approvedThisMonth,
          rejectedThisMonth:   rb.rejectedThisMonth,
          avgResolutionHours:  rb.avgResolutionHours,
          pendingDelta:        rb.pendingDelta,
          approvedDelta:       rb.approvedDelta,
          rejectedDelta:       rb.rejectedDelta,
          pipelineStats:       adaptPipelineStats(rb.byStatus ?? []),
          requestsByType:      adaptRequestsByType(rb.byType ?? []),
        })

        setRequests(requestsRes.responseBody.result.items.map(adaptRequest))

        const events = activityRes.responseBody.activities ?? []
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
