import { formatRelativeTime } from "@/lib/format/date"
import type { ApprovalRequest } from "@/lib/api/requests"
import type { ActivityEvent } from "@/lib/api/activity"
import type { DashboardRequest, ActivityItem } from "@/lib/mock/dashboard.mock"

const STATUS_STEPS: Record<string, [number, number]> = {
  draft:     [0, 3],
  pending:   [1, 3],
  in_review: [2, 3],
  approved:  [3, 3],
  rejected:  [2, 2],
  cancelled: [0, 0],
}

export function adaptRequest(r: ApprovalRequest): DashboardRequest {
  const status = (r.status ?? "pending") as DashboardRequest["status"]
  const [step, totalSteps] = STATUS_STEPS[status] ?? [1, 3]
  const type =
    typeof r.requestType === "string"
      ? r.requestType
      : (r.requestType?.name ?? r.requestTypeKey ?? "General")
  return {
    id:          r.publicId ?? r.requestKey ?? "",
    type,
    description: r.title ?? r.summary ?? r.description ?? "Untitled",
    amount:      r.amount ?? null,
    status,
    date:        r.submittedAt ?? r.createdAt ?? new Date().toISOString(),
    step,
    totalSteps,
  }
}

export function adaptActivity(e: ActivityEvent): ActivityItem {
  return {
    id:   e.id as number,
    type: e.type,
    text: e.text,
    time: formatRelativeTime(e.occurredAt),
  }
}
