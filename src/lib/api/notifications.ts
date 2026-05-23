import { apiClient } from "@/lib/api/client"

export interface Notification {
  publicId: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export interface NotificationsResponse {
  statusCode: string
  message: string
  responseBody: {
    items: Notification[]
    unreadCount: number
    page: number
    limit: number
    total: number
  }
}

export function listNotifications(params: {
  status?: "unread" | "read" | "all"
  page?: number
  limit?: number
} = {}) {
  const qs = new URLSearchParams()
  if (params.status) qs.set("status", params.status)
  if (params.page)   qs.set("page",   String(params.page))
  if (params.limit)  qs.set("limit",  String(params.limit))
  const query = qs.toString()
  return apiClient<NotificationsResponse>(
    `/api/v1/notifications${query ? `?${query}` : ""}`
  )
}

export function markNotificationRead(notificationPublicId: string) {
  return apiClient<{ statusCode: string; message: string; responseBody: Record<string, unknown> }>(
    `/api/v1/notifications/${encodeURIComponent(notificationPublicId)}/read`,
    { method: "PATCH" }
  )
}

export function markAllNotificationsRead() {
  return apiClient<{ statusCode: string; message: string; responseBody: { markedCount: number } }>(
    "/api/v1/notifications/read-all",
    { method: "PATCH" }
  )
}

export function deleteNotification(notificationPublicId: string) {
  return apiClient<{ statusCode: string; message: string; responseBody: Record<string, unknown> }>(
    `/api/v1/notifications/${encodeURIComponent(notificationPublicId)}`,
    { method: "DELETE" }
  )
}
