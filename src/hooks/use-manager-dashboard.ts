"use client"

import { useEffect, useState } from "react"
import { getAnalyticsDashboard } from "@/lib/api/analytics"
import { listApprovalRequests } from "@/lib/api/requests"
import { getActivity } from "@/lib/api/activity"
import { listApprovalQueue, type ApprovalQueueItem } from "@/lib/api/approvals"
import type { DashboardRequest, ActivityItem } from "@/lib/mock/dashboard.mock"
import { adaptRequest, adaptActivity } from "@/lib/adapters/dashboard"

export interface ManagerStats {
  pendingApprovals: number
  totalApproved: number
  totalRejected: number
  avgResolutionHours: number | null
}

export function useManagerDashboard() {
  const [stats, setStats]           = useState<ManagerStats | null>(null)
  const [requests, setRequests]     = useState<DashboardRequest[]>([])
  const [activity, setActivity]     = useState<ActivityItem[]>([])
  const [activityUpdatedAt, setActivityUpdatedAt] = useState("—")
  const [queueItems, setQueueItems] = useState<ApprovalQueueItem[]>([])
  const [queueTotal, setQueueTotal] = useState(0)
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState("")

  useEffect(() => {
    let ignore = false

    Promise.all([
      getAnalyticsDashboard(),
      listApprovalRequests({ limit: 10, page: 1 }),
      getActivity({ scope: "all", limit: 10 }),
      listApprovalQueue({ page: 1, limit: 5 }),
    ])
      .then(([analyticsRes, requestsRes, activityRes, queueRes]) => {
        if (ignore) return
        const d = analyticsRes.responseBody.dashboard
        setStats({
          pendingApprovals:   d.pendingApprovals,
          totalApproved:      d.totals["approved"]  ?? 0,
          totalRejected:      d.totals["rejected"]  ?? 0,
          avgResolutionHours: d.averageResolutionHours,
        })
        setRequests(requestsRes.responseBody.result.items.map(adaptRequest))
        const events = activityRes.responseBody.items ?? []
        setActivity(events.map(adaptActivity))
        setActivityUpdatedAt(events.length > 0 ? "just now" : "—")
        setQueueItems(queueRes.responseBody.data ?? [])
        setQueueTotal(queueRes.responseBody.total ?? 0)
      })
      .catch((reason) => {
        if (!ignore) setError(reason instanceof Error ? reason.message : "Could not load dashboard.")
      })
      .finally(() => { if (!ignore) setIsLoading(false) })

    return () => { ignore = true }
  }, [])

  return { stats, requests, activity, activityUpdatedAt, queueItems, queueTotal, isLoading, error }
}
