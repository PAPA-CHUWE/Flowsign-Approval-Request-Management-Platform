import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/layout/PageHeader"
import { TicketList } from "@/components/tickets/TicketList"
import { REQUEST_TYPE } from "@/constants/requestType.constants"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"
import type { Ticket } from "@/types/ticket.types"

const tickets: Ticket[] = [
  {
    id: "ticket_001",
    reference: "FS-001",
    title: "Laptop access request",
    requesterName: "A. User",
    requestType: REQUEST_TYPE.ACCESS,
    status: TICKET_STATUS.PENDING,
    submittedAt: "2026-05-09T10:00:00.000Z",
  },
]

export default function TicketsPage() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        <PageHeader
          title="Tickets"
          description="Review all submitted workflow tickets."
        />
        <TicketList tickets={tickets} />
      </div>
    </DashboardShell>
  )
}
