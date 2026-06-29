"use client"

import { useEffect, useState } from "react"
import { getRequestStats, listApprovalRequests } from "@/lib/api/requests"
import { getActivity } from "@/lib/api/activity"
import { adaptRequest, adaptActivity } from "@/lib/adapters/dashboard"
import type { DashboardRequest, ActivityItem } from "@/lib/mock/dashboard.mock"

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface EmployeeStats {
  pendingCount: number
  approvedThisMonth: number
  rejectedThisMonth: number
  avgResolutionHours: number | null
}

export function useEmployeeDashboard() {
  const [stats, setStats]           = useState<EmployeeStats | null>(null)
  const [requests, setRequests]     = useState<DashboardRequest[]>([])
  const [activity, setActivity]     = useState<ActivityItem[]>([])
  const [activityUpdatedAt, setActivityUpdatedAt] = useState("—")
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState("")

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
          pendingCount:       s.pendingCount,
          approvedThisMonth:  s.approvedThisMonth,
          rejectedThisMonth:  s.rejectedThisMonth,
          avgResolutionHours: s.avgResolutionHours ?? null,
        })
        setRequests(requestsRes.responseBody.result.items.map(adaptRequest))
        const events = activityRes.responseBody.items ?? []
        setActivity(events.map(adaptActivity))
        setActivityUpdatedAt(events.length > 0 ? "just now" : "—")
      })
      .catch((reason) => {
        if (!ignore) setError(reason instanceof Error ? reason.message : "Could not load dashboard.")
      })
      .finally(() => { if (!ignore) setIsLoading(false) })

    return () => { ignore = true }
  }, [])

  return { stats, requests, activity, activityUpdatedAt, isLoading, error }
}
