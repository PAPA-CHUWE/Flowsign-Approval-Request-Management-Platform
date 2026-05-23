"use client"

import { useEffect, useState } from "react"
import {
  listApprovalQueue,
  type ApprovalQueueItem,
  type ApprovalQueueRequest,
} from "@/lib/api/approvals"
import type { MockTicket } from "@/constants/mockTickets.constants"
import type { Priority } from "@/components/tickets/PriorityBadge"
import type { RequestType } from "@/constants/requestType.constants"

// ── Adapters ──────────────────────────────────────────────────────────────────

const VALID_PRIORITIES = new Set(["P1", "P2", "P3"])
const PRIORITY_MAP: Record<string, Priority> = {
  urgent: "P1", critical: "P1", p1: "P1",
  high: "P2", p2: "P2",
}
function mapPriority(value?: string): Priority {
  const v = value?.toLowerCase() ?? ""
  return (PRIORITY_MAP[v] ?? "P3") as Priority
}

const VALID_REQUEST_TYPES = new Set(["general", "access", "finance", "asset", "travel", "hr"])
function mapRequestType(rt?: ApprovalQueueRequest["requestType"]): RequestType {
  const raw = typeof rt === "string" ? rt : (rt?.key ?? rt?.name ?? "")
  const normalized = raw.toLowerCase()
  return (VALID_REQUEST_TYPES.has(normalized) ? normalized : "general") as RequestType
}

function adaptQueueItem(item: ApprovalQueueItem): MockTicket {
  const req = item.request
  const requester = req.requester
  const requesterName =
    `${requester?.firstName ?? ""} ${requester?.lastName ?? ""}`.trim() ||
    requester?.email ||
    "Unknown"

  return {
    id:                 item.publicId,
    reference:          req.publicId ?? item.publicId,
    title:              req.title ?? "Untitled",
    requesterName,
    requestType:        mapRequestType(req.requestType),
    status:             "pending",
    submittedAt:        req.submittedAt ?? new Date().toISOString(),
    priority:           mapPriority(req.priority),
    assignee:           "",
    releasedBy:         "",
    completionDate:     item.step?.dueAt ?? undefined,
    assignmentPublicId: item.publicId,
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

    setIsLoading(true)
    setError("")

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
