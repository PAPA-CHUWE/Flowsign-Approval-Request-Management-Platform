import { apiClient } from "@/lib/api/client"

export interface ApprovalRequestUser {
  publicId?: string
  email?: string
  firstName?: string
  lastName?: string
  name?: string
}

export interface ApprovalRequestTypeSummary {
  publicId?: string
  key?: string
  name?: string
  category?: string
}

export interface ApprovalRequest {
  publicId?: string
  id?: string
  reference?: string
  requestKey?: string
  requestNumber?: string
  title?: string
  summary?: string
  description?: string
  details?: string
  data?: Record<string, unknown>
  amount?: number
  department?: string
  urgency?: string
  status?: string
  priority?: string
  visibility?: string
  requestTypeKey?: string
  requestType?: string | ApprovalRequestTypeSummary
  requester?: ApprovalRequestUser
  requesterName?: string
  assignee?: string
  currentApprover?: ApprovalRequestUser
  approvers?: ApprovalRequestUser[]
  implementors?: ApprovalRequestUser[]
  workflow?: unknown
  createdAt?: string
  submittedAt?: string
  updatedAt?: string
  resolvedAt?: string | null
  cancelledAt?: string | null
  dueAt?: string | null
}

export interface CreateApprovalRequestPayload {
  requestTypeKey: string
  type: string
  requestKey?: string
  title: string
  summary: string
  description: string
  details: string
  data: Record<string, string | number>
  amount?: number
  department?: string
  urgency: string
  priority: string
  visibility: string
  approverPublicIds: string[]
  implementorPublicIds: string[]
  submit: boolean
}

export interface ListApprovalRequestsParams {
  scope?: string
  status?: string
  requestTypeKey?: string
  priority?: string
  search?: string
  page?: number
  limit?: number
}

export interface ListApprovalRequestsResponse {
  statusCode: string
  message: string
  responseBody: {
    result: {
      items: ApprovalRequest[]
      page: number
      limit: number
      total: number
    }
  }
}

export interface CreateApprovalRequestResponse {
  statusCode: string
  message: string
  responseBody: {
    request: ApprovalRequest
  }
}

export interface GetApprovalRequestResponse {
  statusCode: string
  message: string
  responseBody: {
    request: ApprovalRequest
  }
}

export function createApprovalRequest(payload: CreateApprovalRequestPayload) {
  return apiClient<CreateApprovalRequestResponse>("/api/v1/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function listApprovalRequests(params: ListApprovalRequestsParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      searchParams.set(key, `${value}`)
    }
  })

  const query = searchParams.toString()

  return apiClient<ListApprovalRequestsResponse>(
    `/api/v1/requests${query ? `?${query}` : ""}`
  )
}

export function getApprovalRequest(requestPublicId: string) {
  return apiClient<GetApprovalRequestResponse>(
    `/api/v1/requests/${encodeURIComponent(requestPublicId)}`
  )
}

export interface RequestStats {
  pendingCount: number
  approvedThisMonth: number
  rejectedThisMonth: number
  avgResolutionHours: number
  byStatus: { status: string; count: number }[]
  byType: { key: string; name: string; count: number }[]
  pendingDelta: number
  approvedDelta: number
  rejectedDelta: number
}

export interface RequestStatsResponse {
  statusCode: string
  message: string
  responseBody: RequestStats
}

export function getRequestStats() {
  return apiClient<RequestStatsResponse>("/api/v1/requests/stats")
}
