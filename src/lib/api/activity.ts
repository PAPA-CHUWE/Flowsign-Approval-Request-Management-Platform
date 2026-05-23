import { apiClient } from "@/lib/api/client"

export interface ActivityEvent {
  id: string | number
  type: string
  text: string
  actorName?: string
  requestTitle?: string
  requestPublicId?: string
  entityType?: string
  createdAt: string
}

export interface GetActivityResponse {
  statusCode: string
  message: string
  responseBody: {
    activities: ActivityEvent[]
  }
}

export function getActivity(params: { scope?: "own" | "all"; limit?: number } = {}) {
  const searchParams = new URLSearchParams()
  if (params.scope) searchParams.set("scope", params.scope)
  if (params.limit != null) searchParams.set("limit", String(params.limit))
  const query = searchParams.toString()
  return apiClient<GetActivityResponse>(`/api/v1/activity${query ? `?${query}` : ""}`)
}
