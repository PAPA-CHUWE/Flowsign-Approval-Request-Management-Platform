import { apiClient } from "@/lib/api/client"

export interface SavedFilter {
  publicId: string
  name: string
  context: string
  filters: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface SavedFiltersResponse {
  statusCode: string
  message: string
  responseBody: { savedFilters: SavedFilter[] }
}

export interface SavedFilterResponse {
  statusCode: string
  message: string
  responseBody: { savedFilter: SavedFilter }
}

export function listSavedFilters(context?: string) {
  const qs = context ? `?context=${encodeURIComponent(context)}` : ""
  return apiClient<SavedFiltersResponse>(`/api/v1/saved-filters${qs}`)
}

export function createSavedFilter(payload: {
  name: string
  context: string
  filters: Record<string, string>
}) {
  return apiClient<SavedFilterResponse>("/api/v1/saved-filters", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateSavedFilter(
  publicId: string,
  payload: { name?: string; filters?: Record<string, string> }
) {
  return apiClient<SavedFilterResponse>(
    `/api/v1/saved-filters/${encodeURIComponent(publicId)}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  )
}

export function deleteSavedFilter(publicId: string) {
  return apiClient<{ statusCode: string; message: string; responseBody: Record<string, unknown> }>(
    `/api/v1/saved-filters/${encodeURIComponent(publicId)}`,
    { method: "DELETE" }
  )
}
