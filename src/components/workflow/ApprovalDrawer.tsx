"use client"

import { useRef, useState } from "react"
import {
  CalendarDays, User, Users, Layers,
  CheckCircle2, XCircle, Clock, AlertCircle, Circle,
  MessageSquare, Loader2, Send, Pencil, Trash2, X,
} from "lucide-react"
import type { ElementType } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/components/tickets/PriorityBadge"
import { RequestTypeBadge } from "./RequestTypeBadge"
import { formatTicketDate, formatRelativeTime } from "@/lib/format/date"
import { cn } from "@/lib/utils"
import type { MockTicket } from "@/constants/mockTickets.constants"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"
import { useRequestComments } from "@/hooks/useRequestComments"
import type { RequestComment } from "@/lib/api/comments"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Decision = "approved" | "rejected" | null

// ─── Timeline ─────────────────────────────────────────────────────────────────

type TimelineStep = { key: string; label: string; color: string; Icon: ElementType }

const TIMELINE: TimelineStep[] = [
  { key: TICKET_STATUS.OPEN,      label: "Open",      color: "#185FA5", Icon: Circle       },
  { key: TICKET_STATUS.PENDING,   label: "Pending",   color: "#854F0B", Icon: Clock        },
  { key: TICKET_STATUS.IN_REVIEW, label: "In Review", color: "#534AB7", Icon: AlertCircle  },
  { key: TICKET_STATUS.APPROVED,  label: "Approved",  color: "#27500A", Icon: CheckCircle2 },
]

const REJECTED_STEP: TimelineStep =
  { key: TICKET_STATUS.REJECTED, label: "Rejected", color: "#A32D2D", Icon: XCircle }

function getTimelineSteps(status: string): TimelineStep[] {
  return status === TICKET_STATUS.REJECTED
    ? [...TIMELINE.slice(0, 3), REJECTED_STEP]
    : TIMELINE
}

function getStepIndex(status: string): number {
  const steps = getTimelineSteps(status)
  return steps.findIndex((s) => s.key === status)
}

// ─── MetaRow ──────────────────────────────────────────────────────────────────

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
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

// ─── Comment bubble ───────────────────────────────────────────────────────────

function CommentBubble({
  comment,
  onEdit,
  onDelete,
}: {
  comment: RequestComment
  onEdit: (id: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSaveEdit() {
    if (!draft.trim() || draft === comment.body) { setEditing(false); return }
    setSaving(true)
    try {
      await onEdit(comment.publicId, draft.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try { await onDelete(comment.publicId) }
    finally { setDeleting(false) }
  }

  const initials = comment.authorName
    ? comment.authorName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <div className="flex items-start gap-2.5">
      {/* Avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[10px] font-bold text-brand-teal">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-semibold text-[#2C2C2A]">{comment.authorName}</span>
          <span className="text-[10px] text-[#B4B2A9]">{formatRelativeTime(comment.createdAt)}</span>
          {comment.internal && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
              Internal
            </span>
          )}
        </div>

        {editing ? (
          <div className="mt-1.5 flex flex-col gap-1.5">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              autoFocus
              className="resize-none rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8] text-[12px] text-[#2C2C2A]"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving || !draft.trim()}
                className="flex items-center gap-1 rounded-[5px] bg-brand-teal px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
              >
                {saving ? <Loader2 size={10} className="animate-spin" /> : null}
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setDraft(comment.body) }}
                className="flex items-center gap-1 text-[11px] text-[#888780] hover:text-[#2C2C2A]"
              >
                <X size={10} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group mt-1 flex items-start justify-between gap-2">
            <p className="text-[12px] leading-relaxed text-[#5F5E5A] whitespace-pre-wrap break-words">
              {comment.body}
            </p>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => { setDraft(comment.body); setEditing(true) }}
                className="flex h-5 w-5 items-center justify-center rounded-[4px] text-[#B4B2A9] hover:bg-[#F1EFE8] hover:text-[#5F5E5A]"
              >
                <Pencil size={10} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-5 w-5 items-center justify-center rounded-[4px] text-[#B4B2A9] hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
              >
                {deleting ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Comments section ─────────────────────────────────────────────────────────

function CommentsSection({ requestPublicId }: { requestPublicId: string }) {
  const { comments, isLoading, error, post, edit, remove } = useRequestComments(requestPublicId)
  const [draft, setDraft] = useState("")
  const [posting, setPosting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function handlePost() {
    const text = draft.trim()
    if (!text) return
    setPosting(true)
    try {
      await post(text)
      setDraft("")
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    } catch {
      // error surfaced by hook
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[#E8E6DE] px-6 py-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
        Discussion
      </p>

      {/* Thread */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-[12px] text-[#B4B2A9]">
          <Loader2 size={13} className="animate-spin" /> Loading comments…
        </div>
      ) : error ? (
        <p className="text-[12px] text-red-500">{error}</p>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-[10px] border border-dashed border-[#E8E6DE] py-6">
          <MessageSquare size={18} className="text-[#D3D1C7]" />
          <p className="text-[12px] text-[#B4B2A9]">No comments yet — start the discussion</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <CommentBubble key={c.publicId} comment={c} onEdit={edit} onDelete={remove} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Compose */}
      <div className="flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handlePost()
            }
          }}
          placeholder="Add a comment… (Ctrl+Enter to send)"
          rows={2}
          className="flex-1 resize-none rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8] text-[12px] text-[#2C2C2A] placeholder:text-[#B4B2A9]"
        />
        <Button
          type="button"
          onClick={handlePost}
          disabled={posting || !draft.trim()}
          className="h-9 w-9 shrink-0 rounded-[8px] bg-brand-teal p-0 text-white disabled:opacity-40"
        >
          {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </Button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ApprovalDrawerProps {
  ticket: MockTicket | null
  open: boolean
  decision: Decision
  rejectionComment?: string
  isActioning?: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, comment: string) => void
}

export function ApprovalDrawer({
  ticket,
  open,
  decision,
  rejectionComment,
  isActioning = false,
  onClose,
  onApprove,
  onReject,
}: ApprovalDrawerProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectDraft,      setRejectDraft]      = useState("")

  if (!ticket) return null

  const steps        = getTimelineSteps(ticket.status)
  const currentIndex = getStepIndex(ticket.status)

  // reference is requestPublicId (req_xxx); only use it if it looks like a real request ID
  const requestPublicId = ticket.reference?.startsWith("req_") ? ticket.reference : null

  function openRejectDialog() {
    setRejectDraft("")
    setRejectDialogOpen(true)
  }

  function confirmRejection() {
    if (!rejectDraft.trim()) return
    onReject(ticket!.id, rejectDraft.trim())
    setRejectDialogOpen(false)
    setRejectDraft("")
  }

  return (
    <>
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

            {/* Progress timeline */}
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
                          <step.Icon size={13} strokeWidth={2.5} color={future ? "#D3D1C7" : "#fff"} />
                        </div>
                        <span
                          className="whitespace-nowrap text-[10px] font-medium"
                          style={{ color: future ? "#D3D1C7" : step.color }}
                        >
                          {step.label}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className="mx-1 mt-3.5 h-[2px] flex-1 rounded-full"
                          style={{ backgroundColor: done ? step.color : "#E8E6DE" }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-col gap-5 border-b border-[#E8E6DE] px-6 py-5">
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

              <MetaRow icon={CalendarDays} label="Submitted">
                <span className="text-[13px] text-[#2C2C2A]">
                  {formatTicketDate(ticket.submittedAt)}
                </span>
              </MetaRow>

              {ticket.completionDate && (
                <MetaRow icon={CalendarDays} label="Due date">
                  <span className="text-[13px] text-[#2C2C2A]">
                    {formatTicketDate(ticket.completionDate)}
                  </span>
                </MetaRow>
              )}
            </div>

            {/* Decision section */}
            <div className="border-b border-[#E8E6DE] px-6 py-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
                Your decision
              </p>

              {decision !== null ? (
                <div className="flex flex-col gap-2">
                  <span
                    className={cn(
                      "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold",
                      decision === "approved" ? "bg-[#EAF3DE] text-[#27500A]" : "bg-[#FCEBEB] text-[#A32D2D]",
                    )}
                  >
                    {decision === "approved"
                      ? <CheckCircle2 size={13} strokeWidth={2.5} />
                      : <XCircle size={13} strokeWidth={2.5} />}
                    {decision === "approved" ? "You approved this request" : "You rejected this request"}
                  </span>
                  {decision === "rejected" && rejectionComment && (
                    <div className="mt-1 flex items-start gap-2 rounded-[8px] border border-[#E8E6DE] bg-[#FAFAF8] px-3 py-2.5">
                      <MessageSquare size={13} className="mt-0.5 shrink-0 text-[#888780]" />
                      <p className="text-[12px] leading-relaxed text-[#5F5E5A]">{rejectionComment}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onApprove(ticket.id)}
                    disabled={isActioning}
                    className="h-10 w-full rounded-[8px] bg-[#0F6E56] text-[13px] font-semibold text-white hover:bg-[#0c5e49] disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} strokeWidth={2.5} />
                    {isActioning ? "Processing…" : "Approve request"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openRejectDialog}
                    disabled={isActioning}
                    className="h-10 w-full rounded-[8px] border-red-200 text-[13px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                  >
                    <XCircle size={15} strokeWidth={2.5} />
                    Reject request
                  </Button>
                </div>
              )}
            </div>

            {/* Comments thread */}
            {requestPublicId && <CommentsSection requestPublicId={requestPublicId} />}

          </div>
        </SheetContent>
      </Sheet>

      {/* Rejection reason dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(o) => { if (!o) setRejectDialogOpen(false) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <XCircle size={16} className="text-red-500" strokeWidth={2.5} />
              Reject request
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Provide a reason so the requester understands why this was rejected and can resubmit if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-[8px] border border-[#E8E6DE] bg-[#FAFAF8] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888780]">Request</p>
            <p className="mt-0.5 text-[13px] font-medium text-[#2C2C2A]">{ticket.title}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#2C2C2A]">
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={rejectDraft}
              onChange={(e) => setRejectDraft(e.target.value)}
              placeholder="e.g. Budget limit exceeded for this quarter. Please resubmit in Q3 with updated cost breakdown."
              rows={4}
              className="resize-none rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8] text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus-visible:border-red-300 focus-visible:ring-2 focus-visible:ring-red-100"
            />
            <p className="text-[11px] text-[#B4B2A9]">{rejectDraft.trim().length} / 500 characters</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!rejectDraft.trim()}
              onClick={confirmRejection}
              className="h-9 rounded-[8px] bg-red-600 px-5 text-[13px] font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            >
              <XCircle size={14} strokeWidth={2.5} />
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
