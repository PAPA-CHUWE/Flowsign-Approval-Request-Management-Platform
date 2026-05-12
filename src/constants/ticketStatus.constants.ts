export const TICKET_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const

export const TICKET_STATUS_LABEL = {
  [TICKET_STATUS.DRAFT]: "Draft",
  [TICKET_STATUS.PENDING]: "Pending",
  [TICKET_STATUS.APPROVED]: "Approved",
  [TICKET_STATUS.REJECTED]: "Rejected",
  [TICKET_STATUS.CANCELLED]: "Cancelled",
} as const

export type TicketStatus =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]
