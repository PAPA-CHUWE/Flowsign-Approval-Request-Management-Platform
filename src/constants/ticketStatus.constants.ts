export const TICKET_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  OPEN: "open",
  CANCELLED: "cancelled",
} as const

export const TICKET_STATUS_LABEL = {
  [TICKET_STATUS.DRAFT]: "Draft",
  [TICKET_STATUS.PENDING]: "Pending",
  [TICKET_STATUS.IN_REVIEW]: "In review",
  [TICKET_STATUS.APPROVED]: "Approved",
  [TICKET_STATUS.REJECTED]: "Rejected",
  [TICKET_STATUS.OPEN]: "Open",
  [TICKET_STATUS.CANCELLED]: "Cancelled",
} as const

export type TicketStatus =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]
