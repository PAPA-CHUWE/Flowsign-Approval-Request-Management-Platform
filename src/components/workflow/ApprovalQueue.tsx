"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTicketDate } from "@/lib/format/date"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"
import { FilterRadio } from "@/components/tickets/FilterRadio"
import { TicketSearch } from "@/components/tickets/TicketSearch"
import { PriorityBadge } from "@/components/tickets/PriorityBadge"
import { SortIcon } from "@/components/tickets/SortIcon"
import { RequestTypeBadge } from "./RequestTypeBadge"
import { ApprovalDrawer, type Decision } from "./ApprovalDrawer"
import { takeApprovalAction } from "@/lib/api/approvals"
import type { MockTicket } from "@/constants/mockTickets.constants"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "reference" | "priority" | "submittedAt"

// ─── Config ───────────────────────────────────────────────────────────────────

const FILTERS = [
  { value: "all",       label: "All"       },
  { value: "pending",   label: "Pending"   },
  { value: "in_review", label: "In review" },
  { value: "open",      label: "Open"      },
]

const STATUS_CONFIG = {
  [TICKET_STATUS.PENDING]:   { label: "Pending",   color: "#854F0B", bg: "#FAEEDA", Icon: Clock        },
  [TICKET_STATUS.IN_REVIEW]: { label: "In review", color: "#534AB7", bg: "#EEEDFE", Icon: AlertCircle  },
  [TICKET_STATUS.OPEN]:      { label: "Open",      color: "#185FA5", bg: "#E6F1FB", Icon: Clock        },
} as const

const COLS: { key: SortField | null; label: string; width: string }[] = [
  { key: "reference",   label: "ID",         width: "w-[110px]" },
  { key: "priority",    label: "Priority",   width: "w-[76px]"  },
  { key: null,          label: "Requester",  width: "w-[130px]" },
  { key: null,          label: "Description",width: "flex-1"    },
  { key: null,          label: "Type",       width: "w-[130px]" },
  { key: null,          label: "Status",     width: "w-[110px]" },
  { key: "submittedAt", label: "Submitted",  width: "w-[100px]" },
  { key: null,          label: "Decision",   width: "w-[110px]" },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface ApprovalQueueProps {
  tickets: MockTicket[]
}

export function ApprovalQueue({ tickets }: ApprovalQueueProps) {
  const [filter,    setFilter]    = useState("all")
  const [search,    setSearch]    = useState("")
  const [sortField, setSortField] = useState<SortField>("submittedAt")
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("desc")
  const [decisions,         setDecisions]         = useState<Record<string, Decision>>(
    Object.fromEntries(tickets.map((t) => [t.id, null]))
  )
  const [rejectionComments, setRejectionComments] = useState<Record<string, string>>({})
  const [actioning,         setActioning]         = useState<string | null>(null)
  const [drawerTicket,      setDrawerTicket]      = useState<MockTicket | null>(null)

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("desc") }
  }

  async function handleApprove(id: string) {
    const ticket = tickets.find((t) => t.id === id)
    const assignmentId = ticket?.assignmentPublicId ?? id
    setActioning(id)
    try {
      await takeApprovalAction(assignmentId, { decision: "approve" })
      setDecisions((prev) => ({ ...prev, [id]: "approved" }))
    } catch {
      // Decision already made optimistically — revert on error
    } finally {
      setActioning(null)
    }
  }

  async function handleReject(id: string, comment: string) {
    const ticket = tickets.find((t) => t.id === id)
    const assignmentId = ticket?.assignmentPublicId ?? id
    setActioning(id)
    try {
      await takeApprovalAction(assignmentId, { decision: "reject", comment })
      setDecisions((prev) => ({ ...prev, [id]: "rejected" }))
      setRejectionComments((prev) => ({ ...prev, [id]: comment }))
    } catch {
      // silently ignore — drawer stays open
    } finally {
      setActioning(null)
    }
  }

  const filtered = tickets
    .filter((t) => {
      if (filter === "pending")   return t.status === TICKET_STATUS.PENDING
      if (filter === "in_review") return t.status === TICKET_STATUS.IN_REVIEW
      if (filter === "open")      return t.status === TICKET_STATUS.OPEN
      return true
    })
    .filter((t) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        t.reference.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1
      if (sortField === "reference")   return mul * a.reference.localeCompare(b.reference)
      if (sortField === "priority")    return mul * a.priority.localeCompare(b.priority)
      if (sortField === "submittedAt") return mul * (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      return 0
    })

  const pendingCount = Object.values(decisions).filter((d) => d === null).length

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <FilterRadio
              key={f.value}
              label={f.label}
              value={f.value}
              current={filter}
              onChange={setFilter}
            />
          ))}
        </div>
        <TicketSearch
          value={search}
          onChange={setSearch}
          placeholder="Search approvals…"
        />
      </div>

      {/* ── Table ── */}
      <div className="w-full overflow-x-auto rounded-[12px] border border-[#E8E6DE] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">

        {/* Header */}
        <div className="flex min-w-[960px] items-center gap-3 border-b border-[#E8E6DE] bg-[#FAFAF8] px-4 py-3">
          {COLS.map((col) => (
            <div
              key={col.label}
              className={cn(
                "flex items-center gap-1 shrink-0",
                col.width === "flex-1" ? "flex-1 min-w-0" : col.width,
                col.key && "cursor-pointer select-none hover:text-[#0F6E56]",
              )}
              onClick={() => col.key && toggleSort(col.key)}
            >
              <span className="text-[11px] font-semibold text-[#888780] uppercase tracking-[0.06em] whitespace-nowrap">
                {col.label}
              </span>
              {col.key && (
                <SortIcon col={col.key} active={sortField === col.key} dir={sortDir} />
              )}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[13px] text-[#B4B2A9]">No approvals match your filters.</p>
          </div>
        ) : (
          filtered.map((ticket, idx) => {
            const decision  = decisions[ticket.id]
            const actioned  = decision !== null
            const statusCfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG]

            return (
              <div
                key={ticket.id}
                onClick={() => setDrawerTicket(ticket)}
                className={cn(
                  "flex min-w-[960px] items-center gap-3 px-4 py-3 transition-colors duration-100",
                  "border-b border-[#E8E6DE] last:border-0 cursor-pointer",
                  idx % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]",
                  actioned ? "opacity-60 hover:bg-[#F5FBF8]" : "hover:bg-[#F5FBF8]",
                )}
              >
                {/* ID */}
                <div className="w-[110px] shrink-0">
                  <span className="font-mono text-[12px] font-semibold text-[#0F6E56]">
                    {ticket.reference}
                  </span>
                </div>

                {/* Priority */}
                <div className="w-[76px] shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                </div>

                {/* Requester */}
                <div className="w-[130px] shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-bold text-[#0F6E56]">
                      {ticket.requesterName.charAt(0)}
                    </div>
                    <p className="text-[12px] text-[#5F5E5A] truncate">{ticket.requesterName}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#2C2C2A] truncate">{ticket.title}</p>
                </div>

                {/* Type */}
                <div className="w-[130px] shrink-0">
                  <RequestTypeBadge type={ticket.requestType} />
                </div>

                {/* Status */}
                <div className="w-[110px] shrink-0">
                  {statusCfg ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}
                    >
                      <statusCfg.Icon size={10} strokeWidth={2.5} />
                      {statusCfg.label}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#888780]">{ticket.status}</span>
                  )}
                </div>

                {/* Submitted */}
                <div className="w-[100px] shrink-0">
                  <p className="text-[11px] text-[#888780]">
                    {formatTicketDate(ticket.submittedAt)}
                  </p>
                </div>

                {/* Decision */}
                <div className="w-[110px] shrink-0">
                  {actioned ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        decision === "approved" ? "bg-[#EAF3DE] text-[#27500A]" : "bg-[#FCEBEB] text-[#A32D2D]",
                      )}
                    >
                      {decision === "approved"
                        ? <CheckCircle2 size={10} strokeWidth={2.5} />
                        : <XCircle size={10} strokeWidth={2.5} />}
                      {decision === "approved" ? "Approved" : "Rejected"}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#B4B2A9]">Pending</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pl-1">
        <p className="text-[11px] text-[#B4B2A9]">
          Showing {filtered.length} of {tickets.length} requests
        </p>
        {pendingCount > 0 && (
          <p className="text-[11px] font-medium text-[#854F0B]">
            {pendingCount} awaiting your decision
          </p>
        )}
      </div>

      <ApprovalDrawer
        ticket={drawerTicket}
        open={drawerTicket !== null}
        decision={drawerTicket ? decisions[drawerTicket.id] : null}
        rejectionComment={drawerTicket ? rejectionComments[drawerTicket.id] : undefined}
        isActioning={drawerTicket ? actioning === drawerTicket.id : false}
        onClose={() => setDrawerTicket(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
