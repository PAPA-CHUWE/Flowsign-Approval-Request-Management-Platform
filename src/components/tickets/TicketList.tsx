import type { Ticket } from "@/types/ticket.types"
import { TicketCard } from "./TicketCard"

interface TicketListProps {
  tickets: Ticket[]
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="text-sm text-muted-foreground">No tickets found.</p>
  }

  return (
    <div className="grid gap-3">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          reference={ticket.reference}
          title={ticket.title}
          requesterName={ticket.requesterName}
          status={ticket.status}
          submittedAt={ticket.submittedAt}
        />
      ))}
    </div>
  )
}
