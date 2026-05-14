import { PageHeader } from "@/components/layout/PageHeader"
import { TicketList } from "@/components/tickets/TicketList"
import { MOCK_TICKETS } from "@/constants/mockTickets.constants"

export default function TicketsPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Tickets"
        description="Review and manage all submitted workflow tickets."
      />
      <TicketList tickets={MOCK_TICKETS} />
    </div>
  )
}
