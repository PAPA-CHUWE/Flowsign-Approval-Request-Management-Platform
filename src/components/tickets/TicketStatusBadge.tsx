import { Badge } from "@/components/ui/badge"
import {
  TICKET_STATUS,
  TICKET_STATUS_LABEL,
  type TicketStatus,
} from "@/constants/ticketStatus.constants"

interface TicketStatusBadgeProps {
  status: TicketStatus
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const variant =
    status === TICKET_STATUS.REJECTED ? "destructive" : "secondary"

  return <Badge variant={variant}>{TICKET_STATUS_LABEL[status]}</Badge>
}
