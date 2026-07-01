"use client"

import { useEffect, useState } from "react"
import { listApprovalQueue, type ApprovalQueueItem } from "@/lib/api/approvals"
import type { MockTicket } from "@/constants/mockTickets.constants"
import type { Priority } from "@/components/tickets/PriorityBadge"
import type { RequestType } from "@/constants/requestType.constants"

// ── Adapters ──────────────────────────────────────────────────────────────────

const PRIORITY_MAP: Record<string, Priority> = {
  urgent: "P1", critical: "P1", p1: "P1",
  high: "P2", p2: "P2",
}
function mapPriority(value?: string | null): Priority {
  return PRIORITY_MAP[value?.toLowerCase() ?? ""] ?? "P3"
}

const VALID_REQUEST_TYPES = new Set(["general", "access", "finance", "asset", "travel", "hr"])
function mapRequestType(rt?: { key: string; name: string } | null): RequestType {
  const normalized = (rt?.key ?? "").toLowerCase()
  return (VALID_REQUEST_TYPES.has(normalized) ? normalized : "general") as RequestType
}

function adaptQueueItem(item: ApprovalQueueItem): MockTicket {
  return {
    id:                 item.assignmentPublicId,
    reference:          item.requestPublicId ?? item.assignmentPublicId,
    title:              item.title ?? "Untitled",
    requesterName:      item.requesterName ?? "Unknown",
    requestType:        mapRequestType(item.requestType),
    status:             "pending",
    submittedAt:        item.createdAt ?? new Date().toISOString(),
    priority:           mapPriority(item.priority),
    assignee:           "",
    releasedBy:         "",
    completionDate:     item.dueAt ?? undefined,
    assignmentPublicId: item.assignmentPublicId,
    description:        item.description ?? undefined,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useApprovalQueue(params: {
  requestTypeKey?: string
  priority?: string
  page?: number
  limit?: number
} = {}) {
  const [tickets, setTickets]   = useState<MockTicket[]>([])
  const [total, setTotal]       = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState("")

  const { requestTypeKey, priority, page, limit } = params

  useEffect(() => {
    let ignore = false

    listApprovalQueue({ requestTypeKey, priority, page, limit })
      .then((res) => {
        if (ignore) return
        const rb = res.responseBody
        setTickets((rb.data ?? []).map(adaptQueueItem))
        setTotal(rb.total ?? 0)
      })
      .catch((reason) => {
        if (!ignore) {
          setTickets([])
          setTotal(0)
          setError(reason instanceof Error ? reason.message : "Could not load approval queue.")
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => { ignore = true }
  }, [requestTypeKey, priority, page, limit])

  return { tickets, total, isLoading, error }
}