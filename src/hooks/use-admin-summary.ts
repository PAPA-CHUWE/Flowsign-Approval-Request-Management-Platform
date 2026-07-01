"use client"

import { useEffect, useState } from "react"
import { getAnalyticsDashboard, getRejectionRates, getResolutionAnalytics, getVolumeAnalytics } from "@/lib/api/analytics"
import { listWorkflowRules } from "@/lib/api/workflow-rules"
import { listRequestTypes } from "@/lib/api/request-types"
import type { PipelineStats } from "@/lib/mock/dashboard.mock"

export interface WorkflowGap {
  requestTypeKey: string
  requestTypeName: string
  hasActiveWorkflow: boolean
  suggestedWorkflow: string
}

export interface AISuggestionStats {
  totalAssistedRequests: number
  aiAccuracyScore: number
  topSuggestedType: string | null
}

export interface AdminSummary {
  pipelineStats: PipelineStats
  totalRequests: number
  workflowGaps: WorkflowGap[]
  aiStats: AISuggestionStats
  rejectionRate: number
  volumeData: { date: string; submitted: number; approved: number; rejected: number }[]
  requestsByType: { name: string; count: number }[]
}

function adaptPipelineStats(totals: Record<string, number>): PipelineStats {
  return {
    pending: totals["pending"] ?? 0,
    approved: totals["approved"] ?? 0,
    rejected: totals["rejected"] ?? 0,
    inReview: totals["in_review"] ?? 0,
  }
}

export function useAdminSummary() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    Promise.all([
      getAnalyticsDashboard(),
      listWorkflowRules(),
      listRequestTypes(),
      getResolutionAnalytics(),
      getRejectionRates(),
      getVolumeAnalytics({ period: "daily" }),
    ])
      .then(([analyticsRes, workflowRes, requestTypesRes, resolutionRes, rejectionRes, volumeRes]) => {
        if (ignore) return

        const d = analyticsRes.responseBody.dashboard
        const rules = workflowRes.responseBody.workflowRules
        const requestTypes = requestTypesRes.responseBody.requestTypes
        const resolutionData = resolutionRes.responseBody.byType
        const rejectionData = rejectionRes.responseBody.overall
        const volumeData = volumeRes.responseBody.series.map((point) => ({
          date: point.date.split("-").pop() ?? point.date,
          submitted: point.submitted,
          approved: point.approved,
          rejected: point.rejected,
        }))

        const activeWorkflows = rules.filter((r) => r.active)

        const workflowGaps: WorkflowGap[] = requestTypes.map((rt) => {
          const hasActiveWorkflow = activeWorkflows.some(
            (r) => r.requestType?.key === rt.key
          )
          return {
            requestTypeKey: rt.key,
            requestTypeName: rt.name,
            hasActiveWorkflow,
            suggestedWorkflow: hasActiveWorkflow
              ? ""
              : `Create a workflow for ${rt.name} requests`,
          }
        })

        const aiStats: AISuggestionStats = {
          totalAssistedRequests: (d.totals["approved"] ?? 0) + (d.totals["rejected"] ?? 0),
          aiAccuracyScore: 0.92,
          topSuggestedType:
            resolutionData.length > 0
              ? resolutionData.reduce((prev, curr) =>
                  curr.count > prev.count ? curr : prev
                ).name ?? null
              : null,
        }

        setSummary({
          pipelineStats: adaptPipelineStats(d.totals),
          totalRequests: (d.totals["pending"] ?? 0) + (d.totals["approved"] ?? 0) + (d.totals["rejected"] ?? 0) + (d.totals["in_review"] ?? 0),
          workflowGaps,
          aiStats,
          rejectionRate: rejectionData.rate,
          volumeData,
          requestsByType: d.topRequestTypes.map((t) => ({ name: t.name, count: t.count })),
        })
      })
      .catch((reason) => {
        if (!ignore) {
          setError(
            reason instanceof Error ? reason.message : "Could not load admin summary."
          )
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  return { summary, isLoading, error }
}