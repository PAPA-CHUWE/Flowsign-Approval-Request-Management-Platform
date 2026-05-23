import { apiClient } from "@/lib/api/client"

// Flat shape returned by GET /approvals/queue (backend service flattens it)
export interface ApprovalQueueItem {
  assignmentPublicId: string
  requestPublicId: string | null
  title: string | null
  description: string | null
  requestType: { key: string; name: string } | null
  requesterName: string | null
  amount: number | null
  department: string | null
  urgency: string | null
  priority: string | null
  status: string | null
  stepName: string | null
  stepOrder: number | null
  dueAt: string | null
  createdAt: string | null
}

export interface ListApprovalQueueResponse {
  statusCode: string
  message: string
  responseBody: {
    data: ApprovalQueueItem[]
    total: number
    page: number
    limit: number
  }
}

export interface ApprovalActionPayload {
  decision: "approve" | "reject" | "request_changes" | "delegate"
  comment?: string
  delegateToUserPublicId?: string
}

export interface ApprovalActionResponse {
  statusCode: string
  message: string
  responseBody: {
    assignment: ApprovalQueueItem
  }
}

export function listApprovalQueue(params: {
  requestTypeKey?: string
  priority?: string
  page?: number
  limit?: number
} = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && `${v}`.trim() !== "") searchParams.set(k, `${v}`)
  })
  const query = searchParams.toString()
  return apiClient<ListApprovalQueueResponse>(
    `/api/v1/approvals/queue${query ? `?${query}` : ""}`
  )
}

export function takeApprovalAction(
  assignmentPublicId: string,
  payload: ApprovalActionPayload
) {
  return apiClient<ApprovalActionResponse>(
    `/api/v1/approvals/${encodeURIComponent(assignmentPublicId)}/actions`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}
