import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDisplayDate } from "@/lib/format/date"
import type { TicketCardProps } from "@/types/ticket.types"
import { TicketStatusBadge } from "./TicketStatusBadge"

export function TicketCard({
  reference,
  title,
  requesterName,
  status,
  submittedAt,
}: TicketCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <TicketStatusBadge status={status} />
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-1 text-sm text-muted-foreground">
        <p>{reference}</p>
        <p>Requested by {requesterName}</p>
        <p>Submitted {formatDisplayDate(submittedAt)}</p>
      </CardContent>
    </Card>
  )
}
