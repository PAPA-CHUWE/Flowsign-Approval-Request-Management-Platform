"use client"

import { useState } from "react"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"
import type { MockTicket } from "@/constants/mockTickets.constants"
import { cn } from "@/lib/utils"
import { formatTicketDate } from "@/lib/format/date"
import { StatusDropdown } from "./StatusDropdown"
import type { StatusKey } from "./StatusDropdown"
import { PriorityBadge } from "./PriorityBadge"
import { SortIcon } from "./SortIcon"
import { FilterRadio } from "./FilterRadio"
import { TicketSearch } from "./TicketSearch"

export type SortField = "reference" | "priority" | "submittedAt" | "completionDate"

const FILTERS = [
  { value: "all",       label: "All"       },
  { value: "open",      label: "Open"      },
  { value: "pending",   label: "Pending"   },
  { value: "in_review", label: "In review" },
  { value: "approved",  label: "Approved"  },
  { value: "rejected",  label: "Rejected"  },
]

const COLS: { key: SortField | null; label: string; width: string }[] = [
  { key: "reference",      label: "ID",              width: "w-[110px]"  },
  { key: "priority",       label: "Priority",        width: "w-[80px]"   },
  { key: null,             label: "Assignee",        width: "w-[130px]"  },
  { key: null,             label: "Description",     width: "flex-1"     },
  { key: null,             label: "Status",          width: "w-[130px]"  },
  { key: null,             label: "Released by",     width: "w-[130px]"  },
  { key: "submittedAt",    label: "Created on",      width: "w-[110px]"  },
  { key: "completionDate", label: "Completion date", width: "w-[120px]"  },
]

interface TicketListProps {
  tickets: MockTicket[]
}

export function TicketList({ tickets }: TicketListProps) {
  const [filter,    setFilter]    = useState("all")
  const [search,    setSearch]    = useState("")
  const [sortField, setSortField] = useState<SortField>("submittedAt")
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("desc")
  const [statuses,  setStatuses]  = useState<Record<string, StatusKey>>(
    Object.fromEntries(tickets.map((t) => [t.id, t.status as StatusKey]))
  )

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("desc") }
  }

  const filtered = tickets
    .filter((t) => {
      const s = statuses[t.id]
      if (filter === "pending")   return s === TICKET_STATUS.PENDING
      if (filter === "in_review") return s === TICKET_STATUS.IN_REVIEW
      if (filter === "approved")  return s === TICKET_STATUS.APPROVED
      if (filter === "rejected")  return s === TICKET_STATUS.REJECTED
      if (filter === "open")      return s === TICKET_STATUS.OPEN
      return true
    })
    .filter((t) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        t.reference.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1
      if (sortField === "reference")      return mul * a.reference.localeCompare(b.reference)
      if (sortField === "priority")       return mul * a.priority.localeCompare(b.priority)
      if (sortField === "submittedAt")    return mul * (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      if (sortField === "completionDate") {
        const ad = a.completionDate ? new Date(a.completionDate).getTime() : 0
        const bd = b.completionDate ? new Date(b.completionDate).getTime() : 0
        return mul * (ad - bd)
      }
      return 0
    })

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Filter + search bar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">

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

        <TicketSearch value={search} onChange={setSearch} />
      </div>

      {/* ── Table ── */}
      <div className="w-full bg-white border border-[#E8E6DE] rounded-[12px] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)]">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E6DE] bg-[#FAFAF8]">
          {COLS.map((col) => (
            <div
              key={col.label}
              className={cn(
                "flex items-center gap-1 shrink-0",
                col.width === "flex-1" ? "flex-1 min-w-0" : col.width,
                col.key && "cursor-pointer select-none hover:text-brand-teal",
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
            <p className="text-[13px] text-[#B4B2A9]">No tickets match your filters.</p>
          </div>
        ) : (
          filtered.map((ticket, idx) => (
            <div
              key={ticket.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors duration-100",
                "border-b border-brand-neutral-pale last:border-0",
                idx % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]",
                "hover:bg-[#F5FBF8] cursor-pointer"
              )}
            >
              <div className="w-[110px] shrink-0">
                <span className="font-mono text-[12px] font-semibold text-brand-teal">{ticket.reference}</span>
              </div>

              <div className="w-[80px] shrink-0">
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div className="w-[130px] shrink-0">
                <p className="text-[12px] text-brand-neutral-mid truncate">{ticket.assignee}</p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#2C2C2A] truncate">{ticket.title}</p>
              </div>

              <div className="w-[130px] shrink-0">
                <StatusDropdown
                  value={statuses[ticket.id]}
                  onChange={(v) => setStatuses((prev) => ({ ...prev, [ticket.id]: v }))}
                />
              </div>

              <div className="w-[130px] shrink-0">
                <p className="text-[12px] text-brand-neutral-mid truncate">{ticket.releasedBy}</p>
              </div>

              <div className="w-[110px] shrink-0">
                <p className="text-[11px] text-[#888780]">{formatTicketDate(ticket.submittedAt)}</p>
              </div>

              <div className="w-[120px] shrink-0">
                <p className="text-[11px] text-[#888780]">
                  {ticket.completionDate ? formatTicketDate(ticket.completionDate) : "—"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Row count */}
      <p className="text-[11px] text-[#B4B2A9] pl-1">
        Showing {filtered.length} of {tickets.length} tickets
      </p>
    </div>
  )
}
