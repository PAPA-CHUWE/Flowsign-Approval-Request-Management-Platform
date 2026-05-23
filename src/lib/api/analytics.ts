import { apiClient } from "@/lib/api/client"

export interface TopRequestType {
  key: string
  name: string
  count: number
}

export interface AnalyticsDashboard {
  totals: Record<string, number>       // e.g. { pending: 1, draft: 2, approved: 5 }
  pendingApprovals: number
  averageResolutionHours: number | null
  topRequestTypes: TopRequestType[]
}

export interface AnalyticsDashboardResponse {
  statusCode: string
  message: string
  responseBody: { dashboard: AnalyticsDashboard }
}

export interface VolumePeriodPoint {
  date: string       // e.g. "2026-W21" or "2026-05-23"
  submitted: number
  approved: number
  rejected: number
}

export interface VolumeAnalyticsResponse {
  statusCode: string
  message: string
  responseBody: {
    period: string
    from: string
    to: string
    series: VolumePeriodPoint[]
  }
}

export function getAnalyticsDashboard() {
  return apiClient<AnalyticsDashboardResponse>("/api/v1/analytics/dashboard")
}

export interface ResolutionByType {
  key: string
  name: string
  avgHours: number | null
  count: number
}

export interface ResolutionAnalyticsResponse {
  statusCode: string
  message: string
  responseBody: {
    overall: { avgHours: number | null; count: number }
    byType: ResolutionByType[]
  }
}

export function getResolutionAnalytics() {
  return apiClient<ResolutionAnalyticsResponse>("/api/v1/analytics/resolution")
}

export interface RejectionRateByType {
  key: string
  name: string
  total: number
  rejected: number
  rate: number
}

export interface RejectionRatesResponse {
  statusCode: string
  message: string
  responseBody: {
    overall: { total: number; rejected: number; rate: number }
    byType: RejectionRateByType[]
  }
}

export function getRejectionRates() {
  return apiClient<RejectionRatesResponse>("/api/v1/analytics/rejection-rates")
}

export function getVolumeAnalytics(params: {
  period?: "daily" | "weekly" | "monthly"
  from?: string
  to?: string
} = {}) {
  const qs = new URLSearchParams()
  if (params.period) qs.set("period", params.period)
  if (params.from)   qs.set("from",   params.from)
  if (params.to)     qs.set("to",     params.to)
  const query = qs.toString()
  return apiClient<VolumeAnalyticsResponse>(
    `/api/v1/analytics/volume${query ? `?${query}` : ""}`
  )
}
