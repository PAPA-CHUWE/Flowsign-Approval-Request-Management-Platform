import { apiClient } from "@/lib/api/client"

export interface SearchResultRequest {
  publicId: string
  requestKey: string
  title: string
  status: string
  priority: string
  requestType: { key: string; name: string }
  requester: { publicId: string; name: string }
  createdAt: string
}

export interface SearchResultUser {
  publicId: string
  name: string
  email: string
  department?: string | null
}

export interface SearchResultComment {
  publicId: string
  body: string
  authorName: string
  requestPublicId: string
  createdAt: string
}

export interface SearchResponse {
  statusCode: string
  message: string
  responseBody: {
    q: string
    total: number
    results: {
      requests: SearchResultRequest[]
      users: SearchResultUser[]
      comments: SearchResultComment[]
    }
  }
}

export interface Suggestion {
  publicId: string
  label: string
  sublabel: string
}

export interface SuggestionsResponse {
  statusCode: string
  message: string
  responseBody: {
    type: string
    suggestions: Suggestion[]
  }
}

export function globalSearch(params: {
  q: string
  types?: string
  limit?: number
}) {
  const qs = new URLSearchParams({ q: params.q })
  if (params.types)  qs.set("types",  params.types)
  if (params.limit)  qs.set("limit",  String(params.limit))
  return apiClient<SearchResponse>(`/api/v1/search?${qs}`)
}

export function getSearchSuggestions(params: {
  q: string
  type?: "requests" | "users" | "comments"
  limit?: number
}) {
  const qs = new URLSearchParams({ q: params.q })
  if (params.type)  qs.set("type",  params.type)
  if (params.limit) qs.set("limit", String(params.limit))
  return apiClient<SuggestionsResponse>(`/api/v1/search/suggestions?${qs}`)
}
