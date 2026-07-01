import type { RequestType } from "@/constants/requestType.constants"
import type { TicketStatus } from "@/constants/ticketStatus.constants"

export interface Ticket {
  id: string
  reference: string
  title: string
  requesterName: string
  requestType: RequestType
  status: TicketStatus
  submittedAt: string
  description?: string
}

export interface TicketCardProps {
  reference: string
  title: string
  requesterName: string
  status: TicketStatus
  submittedAt: string
}