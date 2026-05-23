"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { TicketList } from "@/components/tickets/TicketList"
import { Loader } from "@/components/loader-ui/loader"
import { Button } from "@/components/ui/button"
import { useApprovalRequests } from "@/hooks/requests/useApprovalRequests"
import { adaptRequestToTicket } from "@/lib/adapters/request-to-ticket"

export default function TicketsPage() {
  const [page, setPage] = useState(1)
  const { requests, total, limit, isLoading, error } = useApprovalRequests({
    page,
    limit: 50,
  })

  const tickets = requests.map(adaptRequestToTicket)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Tickets"
        description="Review and manage all submitted workflow tickets."
      />

      {isLoading ? (
        <Loader label="Loading tickets" />
      ) : error ? (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <TicketList tickets={tickets} />
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold"
              >
                Previous
              </Button>
              <span className="text-[12px] text-[#888780]">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
