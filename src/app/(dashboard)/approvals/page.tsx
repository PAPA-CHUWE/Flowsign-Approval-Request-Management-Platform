import { PageHeader } from "@/components/layout/PageHeader"
import { ApprovalQueue } from "@/components/workflow/ApprovalQueue"
import { MOCK_TICKETS } from "@/constants/mockTickets.constants"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"

const ACTIONABLE_STATUSES = new Set([
  TICKET_STATUS.PENDING,
  TICKET_STATUS.IN_REVIEW,
  TICKET_STATUS.OPEN,
])

const approvalTickets = MOCK_TICKETS.filter((t) =>
  ACTIONABLE_STATUSES.has(t.status as typeof TICKET_STATUS[keyof typeof TICKET_STATUS])
)

export default function ApprovalsPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Approvals"
        description="Review and action requests assigned to you."
      />
      <ApprovalQueue tickets={approvalTickets} />
    </div>
  )
}
