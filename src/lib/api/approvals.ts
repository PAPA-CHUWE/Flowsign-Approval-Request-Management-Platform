import { apiClient } from "@/lib/api/client"

export interface ApprovalQueueRequester {
  publicId?: string
  firstName?: string
  lastName?: string
  email?: string
}

export interface ApprovalQueueRequestType {
  key?: string
  name?: string
  category?: string
}

export interface ApprovalQueueRequest {
  publicId?: string
  title?: string
  priority?: string
  requestType?: ApprovalQueueRequestType | string
  requester?: ApprovalQueueRequester
  submittedAt?: string
}

export interface ApprovalQueueStep {
  name?: string
  dueAt?: string
  order?: number
}

export interface ApprovalQueueItem {
  publicId: string
  status: string
  decidedAt?: string | null
  request: ApprovalQueueRequest
  step?: ApprovalQueueStep
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
