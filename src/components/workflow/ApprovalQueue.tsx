"use client"

import { Button } from "@/components/ui/button"
import { useApproveTicket } from "@/hooks/tickets/useApproveTicket"
import type { Ticket } from "@/types/ticket.types"
import { TicketCard } from "@/components/tickets/TicketCard"

interface ApprovalQueueProps {
  tickets: Ticket[]
}

export function ApprovalQueue({ tickets }: ApprovalQueueProps) {
  const { approve, isApproving } = useApproveTicket()

  if (tickets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No approvals are waiting for review.
      </p>
    )
  }

  return (
    <div className="grid gap-3">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="grid gap-2">
          <TicketCard
            reference={ticket.reference}
            title={ticket.title}
            requesterName={ticket.requesterName}
            status={ticket.status}
            submittedAt={ticket.submittedAt}
          />
          <Button
            className="w-fit"
            disabled={isApproving}
            onClick={() => void approve(ticket.id)}
          >
            Approve
          </Button>
        </div>
      ))}
    </div>
  )
}
