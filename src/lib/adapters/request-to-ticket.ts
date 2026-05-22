import type { ApprovalRequest } from "@/lib/api/requests"
import type { MockTicket } from "@/constants/mockTickets.constants"
import type { Priority } from "@/components/tickets/PriorityBadge"
import type { RequestType } from "@/constants/requestType.constants"
import type { TicketStatus } from "@/constants/ticketStatus.constants"

const VALID_REQUEST_TYPES = new Set([
  "general", "access", "finance", "asset", "travel", "hr",
])

const VALID_STATUSES = new Set([
  "draft", "pending", "in_review", "approved", "rejected", "open", "cancelled",
])

function mapPriority(value?: string): Priority {
  const v = value?.toLowerCase() ?? ""
  if (v === "urgent" || v === "critical" || v === "p1") return "P1"
  if (v === "high" || v === "p2") return "P2"
  return "P3"
}

function mapRequestType(r: ApprovalRequest): RequestType {
  const raw =
    r.requestTypeKey ??
    (typeof r.requestType === "string" ? r.requestType : r.requestType?.key ?? r.requestType?.category)

  const normalized = raw?.toLowerCase() ?? ""
  return (VALID_REQUEST_TYPES.has(normalized) ? normalized : "general") as RequestType
}

function mapStatus(value?: string): TicketStatus {
  const normalized = value?.toLowerCase() ?? "open"
  return (VALID_STATUSES.has(normalized) ? normalized : "open") as TicketStatus
}

function formatPersonList(people?: ApprovalRequest["approvers"]): string {
  if (!people?.length) return ""
  return people
    .map((p) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.name || p.email || "")
    .filter(Boolean)
    .join(", ")
}

export function adaptRequestToTicket(r: ApprovalRequest): MockTicket {
  const requesterFullName = `${r.requester?.firstName ?? ""} ${r.requester?.lastName ?? ""}`.trim()
  const requesterName = r.requesterName ?? (requesterFullName || r.requester?.name || r.requester?.email || "Unknown")

  const assignee =
    r.assignee ?? formatPersonList(r.approvers) ?? ""

  const releasedBy = formatPersonList(r.implementors) ?? ""

  return {
    id:             r.publicId ?? r.id ?? r.requestKey ?? "",
    reference:      r.requestKey ?? r.reference ?? r.requestNumber ?? r.publicId ?? "—",
    title:          r.title ?? r.summary ?? r.description ?? "Untitled request",
    requesterName,
    requestType:    mapRequestType(r),
    status:         mapStatus(r.status),
    submittedAt:    r.submittedAt ?? r.createdAt ?? new Date().toISOString(),
    priority:       mapPriority(r.priority),
    assignee,
    releasedBy,
    completionDate: r.dueAt ?? r.resolvedAt ?? undefined,
  }
}
