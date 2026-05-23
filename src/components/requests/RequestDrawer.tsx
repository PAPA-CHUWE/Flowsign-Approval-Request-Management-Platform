"use client"

import { useState } from "react"
import {
  AlertCircle,
  Banknote,
  Briefcase,
  Building2,
  CalendarDays,
  Eye,
  Fingerprint,
  Layers,
  Loader2,
  Users,
  Zap,
} from "lucide-react"
import type { ElementType } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatusDropdown, type StatusKey } from "@/components/tickets/StatusDropdown"
import { formatTicketDate } from "@/lib/format/date"
import { TICKET_STATUS_LABEL } from "@/constants/ticketStatus.constants"
import { REQUEST_TYPE_LABEL } from "@/constants/requestType.constants"
import { updateRequestStatus, type ApprovalRequest } from "@/lib/api/requests"
import { toast } from "sonner"

// ─── Helpers (mirrored from RequestsPageContent) ──────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft:     { bg: "#F1EFE8", color: "#5F5E5A" },
  pending:   { bg: "#FAEEDA", color: "#854F0B" },
  in_review: { bg: "#EEEDFE", color: "#534AB7" },
  approved:  { bg: "#EAF3DE", color: "#27500A" },
  rejected:  { bg: "#FCEBEB", color: "#A32D2D" },
  open:      { bg: "#E6F1FB", color: "#185FA5" },
  cancelled: { bg: "#F1EFE8", color: "#5F5E5A" },
}

function titleCase(value: string) {
  return value.split(/[_\s-]+/).filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
}

function formatDate(value?: string | null) {
  return value ? formatTicketDate(value) : "—"
}

function formatAmount(amount?: number) {
  if (typeof amount !== "number") return null
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(amount)
}

function formatPeople(people?: ApprovalRequest["approvers"]) {
  if (!people?.length) return "—"
  return people.map((p) => {
    const full = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()
    return full || p.name || p.email || p.publicId || ""
  }).filter(Boolean).join(", ")
}

export function getRequestId(r: ApprovalRequest) {
  return r.requestKey ?? r.reference ?? r.requestNumber ?? r.publicId ?? r.id ?? "—"
}

function getTitle(r: ApprovalRequest) {
  return r.title ?? r.summary ?? r.description ?? r.details ?? "Untitled request"
}

function getTypeLabel(r: ApprovalRequest) {
  if (typeof r.requestType === "object" && r.requestType?.name) return r.requestType.name
  const key = r.requestTypeKey ?? (typeof r.requestType === "string" ? r.requestType : undefined)
  if (!key) return "—"
  return REQUEST_TYPE_LABEL[key as keyof typeof REQUEST_TYPE_LABEL] ?? titleCase(key)
}

function getRequesterName(r: ApprovalRequest) {
  if (r.requesterName) return r.requesterName
  const full = `${r.requester?.firstName ?? ""} ${r.requester?.lastName ?? ""}`.trim()
  return full || r.requester?.name || r.requester?.email || "—"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaRow({ icon: Icon, label, children }: {
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status?: string }) {
  const value = status ?? "open"
  const style = STATUS_STYLE[value] ?? STATUS_STYLE.open
  const label = TICKET_STATUS_LABEL[value as keyof typeof TICKET_STATUS_LABEL] ?? titleCase(value)
  return (
    <span
      className="inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold"
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  )
}

function SectionHeading({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">{label}</p>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const VALID_STATUS_KEYS = new Set<string>(["pending", "in_review", "approved", "rejected", "open"])

function toStatusKey(status?: string): StatusKey {
  return (status && VALID_STATUS_KEYS.has(status) ? status : "open") as StatusKey
}

interface RequestDrawerProps {
  request: ApprovalRequest | null
  open: boolean
  isLoading?: boolean
  error?: string | null
  onClose: () => void
  onStatusUpdated?: (updated: ApprovalRequest) => void
}

export function RequestDrawer({
  request,
  open,
  isLoading = false,
  error,
  onClose,
  onStatusUpdated,
}: RequestDrawerProps) {
  const [statusOverride, setStatusOverride] = useState<StatusKey | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const currentStatus = statusOverride ?? toStatusKey(request?.status)
  const amount = request ? formatAmount(request.amount) : null
  const description = request?.description ?? request?.details ?? request?.summary

  async function handleStatusChange(next: StatusKey) {
    if (!request?.publicId || isUpdatingStatus) return
    setStatusOverride(next)
    setIsUpdatingStatus(true)
    try {
      const res = await updateRequestStatus(request.publicId, next)
      onStatusUpdated?.(res.responseBody.request)
      toast.success("Status updated")
    } catch {
      setStatusOverride(toStatusKey(request.status))
      toast.error("Could not update status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { setStatusOverride(null); onClose() } }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[500px]"
      >
        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-1 flex-col">
            <SheetHeader className="border-b border-[#E8E6DE] px-6 py-5">
              <SheetTitle className="sr-only">Loading request</SheetTitle>
              <div className="space-y-2 pr-8">
                <div className="h-3 w-24 animate-pulse rounded bg-[#F1EFE8]" />
                <div className="h-4 w-64 animate-pulse rounded bg-[#F1EFE8]" />
              </div>
            </SheetHeader>
            <div className="flex flex-1 items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[#B4B2A9]" />
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <div className="flex flex-1 flex-col">
            <SheetHeader className="border-b border-[#E8E6DE] px-6 py-5">
              <SheetTitle className="text-[16px] font-semibold text-[#2C2C2A]">Request details</SheetTitle>
            </SheetHeader>
            <div className="px-6 py-5">
              <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Loaded ── */}
        {!isLoading && !error && request && (
          <>
            {/* Header */}
            <SheetHeader className="gap-2 border-b border-[#E8E6DE] px-6 py-5">
              <div className="flex items-center gap-2 pr-8">
                <span className="font-mono text-[12px] font-semibold text-brand-teal">
                  {getRequestId(request)}
                </span>
                <StatusDropdown
                  value={currentStatus}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus || !request.publicId || request.status !== "draft"}
                />
              </div>
              <SheetTitle className="pr-8 text-[16px] font-semibold leading-snug text-[#2C2C2A]">
                {getTitle(request)}
              </SheetTitle>
            </SheetHeader>

            {/* Body */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto">

              {/* Overview */}
              <div className="flex flex-col gap-5 border-b border-[#E8E6DE] px-6 py-5">
                <SectionHeading label="Overview" />

                <MetaRow icon={Layers} label="Request type">
                  <span className="text-[13px] text-[#2C2C2A]">{getTypeLabel(request)}</span>
                </MetaRow>

                {request.priority && (
                  <MetaRow icon={Zap} label="Priority">
                    <span className="text-[13px] text-[#2C2C2A]">{request.priority.toUpperCase()}</span>
                  </MetaRow>
                )}

                {request.urgency && (
                  <MetaRow icon={AlertCircle} label="Urgency">
                    <span className="text-[13px] text-[#2C2C2A]">{titleCase(request.urgency)}</span>
                  </MetaRow>
                )}

                {request.department && (
                  <MetaRow icon={Building2} label="Department">
                    <span className="text-[13px] text-[#2C2C2A]">{request.department}</span>
                  </MetaRow>
                )}

                {request.visibility && (
                  <MetaRow icon={Eye} label="Visibility">
                    <span className="text-[13px] text-[#2C2C2A]">{titleCase(request.visibility)}</span>
                  </MetaRow>
                )}

                {amount !== null && (
                  <MetaRow icon={Banknote} label="Amount">
                    <span className="text-[13px] font-semibold text-[#2C2C2A]">{amount}</span>
                  </MetaRow>
                )}
              </div>

              {/* People */}
              <div className="flex flex-col gap-5 border-b border-[#E8E6DE] px-6 py-5">
                <SectionHeading label="People" />

                <MetaRow icon={Briefcase} label="Requested by">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-bold text-brand-teal">
                      {getRequesterName(request).charAt(0)}
                    </div>
                    <span className="text-[13px] text-[#2C2C2A]">{getRequesterName(request)}</span>
                  </div>
                </MetaRow>

                <MetaRow icon={Users} label="Approvers">
                  <span className="text-[13px] text-[#2C2C2A]">{formatPeople(request.approvers)}</span>
                </MetaRow>

                {(request.implementors?.length ?? 0) > 0 && (
                  <MetaRow icon={Users} label="Implementors">
                    <span className="text-[13px] text-[#2C2C2A]">{formatPeople(request.implementors)}</span>
                  </MetaRow>
                )}
              </div>

              {/* Dates */}
              <div className="flex flex-col gap-5 border-b border-[#E8E6DE] px-6 py-5">
                <SectionHeading label="Timeline" />

                <MetaRow icon={CalendarDays} label="Created">
                  <span className="text-[13px] text-[#2C2C2A]">{formatDate(request.createdAt)}</span>
                </MetaRow>

                <MetaRow icon={CalendarDays} label="Submitted">
                  <span className="text-[13px] text-[#2C2C2A]">{formatDate(request.submittedAt)}</span>
                </MetaRow>

                {request.dueAt && (
                  <MetaRow icon={CalendarDays} label="Due">
                    <span className="text-[13px] text-[#2C2C2A]">{formatDate(request.dueAt)}</span>
                  </MetaRow>
                )}

                {request.resolvedAt && (
                  <MetaRow icon={CalendarDays} label="Resolved">
                    <span className="text-[13px] text-[#2C2C2A]">{formatDate(request.resolvedAt)}</span>
                  </MetaRow>
                )}
              </div>

              {/* Description */}
              {description && (
                <div className="flex flex-col gap-3 px-6 py-5">
                  <SectionHeading label="Description" />
                  <p className="text-[13px] leading-relaxed text-[#5F5E5A]">{description}</p>
                </div>
              )}

              {/* Public ID */}
              <div className="border-t border-[#F1EFE8] px-6 py-4">
                <MetaRow icon={Fingerprint} label="Public ID">
                  <span className="font-mono text-[12px] text-[#888780]">{request.publicId ?? "—"}</span>
                </MetaRow>
              </div>

            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
