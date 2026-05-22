"use client"

import { CalendarDays, User, Users, Layers, CheckCircle2, XCircle, Clock, AlertCircle, Circle } from "lucide-react"
import type { ElementType } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatusDropdown } from "./StatusDropdown"
import { PriorityBadge } from "./PriorityBadge"
import { RequestTypeBadge } from "@/components/workflow/RequestTypeBadge"
import { formatTicketDate } from "@/lib/format/date"
import { cn } from "@/lib/utils"
import type { MockTicket } from "@/constants/mockTickets.constants"
import type { StatusKey } from "./StatusDropdown"

// ─── Timeline ─────────────────────────────────────────────────────────────────

type TimelineStep = { key: StatusKey; label: string; color: string; Icon: ElementType }

const TIMELINE: TimelineStep[] = [
  { key: "open",      label: "Open",      color: "#185FA5", Icon: Circle       },
  { key: "pending",   label: "Pending",   color: "#854F0B", Icon: Clock        },
  { key: "in_review", label: "In Review", color: "#534AB7", Icon: AlertCircle  },
  { key: "approved",  label: "Approved",  color: "#27500A", Icon: CheckCircle2 },
]

const REJECTED_STEP: TimelineStep =
  { key: "rejected",  label: "Rejected",  color: "#A32D2D", Icon: XCircle }

function getTimelineSteps(status: StatusKey): TimelineStep[] {
  return status === "rejected"
    ? [...TIMELINE.slice(0, 3), REJECTED_STEP]
    : TIMELINE
}

function getStepIndex(status: StatusKey): number {
  const steps = getTimelineSteps(status)
  return steps.findIndex((s) => s.key === status)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#F7F6F2]">
        <Icon size={13} className="text-[#888780]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TicketDrawerProps {
  ticket: (MockTicket & { currentStatus: StatusKey }) | null
  open: boolean
  onClose: () => void
  onStatusChange: (id: string, status: StatusKey) => void
}

export function TicketDrawer({ ticket, open, onClose, onStatusChange }: TicketDrawerProps) {
  if (!ticket) return null

  const steps        = getTimelineSteps(ticket.currentStatus)
  const currentIndex = getStepIndex(ticket.currentStatus)

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]"
      >
        {/* ── Header ── */}
        <SheetHeader className="gap-2 border-b border-[#E8E6DE] px-6 py-5">
          <div className="flex items-center gap-2 pr-8">
            <span className="shrink-0 font-mono text-[12px] font-semibold text-brand-teal">
              {ticket.reference}
            </span>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <SheetTitle className="pr-8 text-[16px] font-semibold leading-snug text-[#2C2C2A]">
            {ticket.title}
          </SheetTitle>
        </SheetHeader>

        {/* ── Scrollable body ── */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto">

          {/* Status timeline */}
          <div className="border-b border-[#E8E6DE] px-6 py-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
              Progress
            </p>
            <div className="flex items-start">
              {steps.map((step, i) => {
                const done    = i < currentIndex
                const current = i === currentIndex
                const future  = i > currentIndex
                const isLast  = i === steps.length - 1

                return (
                  <div key={step.key} className="flex flex-1 items-start">
                    {/* Step node + label */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full transition-all",
                          future && "border-2 border-[#E8E6DE] bg-white",
                        )}
                        style={
                          current
                            ? { backgroundColor: step.color, boxShadow: `0 0 0 2px white, 0 0 0 4px ${step.color}` }
                            : done
                            ? { backgroundColor: step.color }
                            : {}
                        }
                      >
                        <step.Icon
                          size={13}
                          strokeWidth={2.5}
                          color={future ? "#D3D1C7" : "#fff"}
                        />
                      </div>
                      <span
                        className="whitespace-nowrap text-[10px] font-medium"
                        style={{ color: future ? "#D3D1C7" : step.color }}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className="mx-1 mt-3.5 h-[2px] flex-1 rounded-full"
                        style={{ backgroundColor: done ? "#D3D1C7" : "#E8E6DE" }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-5 px-6 py-5">

            <MetaRow icon={Circle} label="Status">
              <StatusDropdown
                value={ticket.currentStatus}
                onChange={(v) => onStatusChange(ticket.id, v)}
              />
            </MetaRow>

            <MetaRow icon={Layers} label="Request type">
              <RequestTypeBadge type={ticket.requestType} />
            </MetaRow>

            <div className="h-px bg-[#F1EFE8]" />

            <MetaRow icon={User} label="Requested by">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-bold text-brand-teal">
                  {ticket.requesterName.charAt(0)}
                </div>
                <span className="text-[13px] text-[#2C2C2A]">{ticket.requesterName}</span>
              </div>
            </MetaRow>

            <MetaRow icon={Users} label="Assignee">
              <span className="text-[13px] text-[#2C2C2A]">{ticket.assignee}</span>
            </MetaRow>

            <MetaRow icon={Users} label="Released by">
              <span className="text-[13px] text-[#2C2C2A]">{ticket.releasedBy}</span>
            </MetaRow>

            <div className="h-px bg-[#F1EFE8]" />

            <MetaRow icon={CalendarDays} label="Created on">
              <span className="text-[13px] text-[#2C2C2A]">
                {formatTicketDate(ticket.submittedAt)}
              </span>
            </MetaRow>

            <MetaRow icon={CalendarDays} label="Completion date">
              <span className="text-[13px] text-[#2C2C2A]">
                {ticket.completionDate ? formatTicketDate(ticket.completionDate) : "—"}
              </span>
            </MetaRow>

          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
