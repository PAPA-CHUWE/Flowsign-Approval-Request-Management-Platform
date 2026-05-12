import { PageHeader } from "@/components/layout/PageHeader"
import { ApprovalQueue } from "@/components/workflow/ApprovalQueue"
import { REQUEST_TYPE } from "@/constants/requestType.constants"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"
import type { Ticket } from "@/types/ticket.types"

const approvalTickets: Ticket[] = [
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

export default function ApprovalsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Approvals"
        description="Approve or reject requests assigned to you."
      />
      <ApprovalQueue tickets={approvalTickets} />
    </div>
  )
}
