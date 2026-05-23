"use client"

import { useState } from "react"
import { Bookmark, BookmarkPlus, Plus, Search, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/layout/PageHeader"
import { Loader } from "@/components/loader-ui/loader"
import { RequestFormShell } from "@/components/request-form/RequestFormShell"
import { RequestDrawer } from "@/components/requests/RequestDrawer"
import { REQUEST_TYPE_LABEL } from "@/constants/requestType.constants"
import { TICKET_STATUS_LABEL } from "@/constants/ticketStatus.constants"
import { useApprovalRequests } from "@/hooks/requests/useApprovalRequests"
import { useSavedFilters } from "@/hooks/useSavedFilters"
import { getApprovalRequest } from "@/lib/api/requests"
import { formatTicketDate } from "@/lib/format/date"
import { cn } from "@/lib/utils"
import type { ApprovalRequest } from "@/lib/api/requests"
import { toast } from "sonner"

const COLUMNS = [
  { label: "Type", width: "w-[130px]" },
  { label: "Title", width: "flex-1" },
  { label: "Priority", width: "w-[90px]" },
  { label: "Status", width: "w-[130px]" },
  { label: "Date", width: "w-[120px]" },
  { label: "Approver", width: "w-[140px]" },
]

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#F1EFE8", color: "#5F5E5A" },
  pending: { bg: "#FAEEDA", color: "#854F0B" },
  in_review: { bg: "#EEEDFE", color: "#534AB7" },
  approved: { bg: "#EAF3DE", color: "#27500A" },
  rejected: { bg: "#FCEBEB", color: "#A32D2D" },
  open: { bg: "#E6F1FB", color: "#185FA5" },
  cancelled: { bg: "#F1EFE8", color: "#5F5E5A" },
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getRequestKey(request: ApprovalRequest) {
  return request.publicId ?? request.id ?? request.requestKey ?? request.reference ?? "-"
}

function getRequestTypeLabel(request: ApprovalRequest) {
  if (typeof request.requestType === "object" && request.requestType?.name) {
    return request.requestType.name
  }

  const key =
    request.requestTypeKey ??
    (typeof request.requestType === "string" ? request.requestType : undefined)

  if (!key) return "-"

  return REQUEST_TYPE_LABEL[key as keyof typeof REQUEST_TYPE_LABEL] ?? titleCase(key)
}

function getRequestTitle(request: ApprovalRequest) {
  return request.title ?? request.summary ?? request.description ?? request.details ?? "Untitled request"
}

function getRequesterName(request: ApprovalRequest) {
  if (request.requesterName) return request.requesterName
  const requester = request.requester
  const fullName = `${requester?.firstName ?? ""} ${requester?.lastName ?? ""}`.trim()
  return fullName || requester?.name || requester?.email || "Current user"
}

function getApproverName(request: ApprovalRequest) {
  if (request.approvers?.length) {
    return request.approvers.map((p) => {
      const full = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()
      return full || p.name || p.email || ""
    }).filter(Boolean).join(", ")
  }
  if (request.assignee) return request.assignee
  const approver = request.currentApprover
  const fullName = `${approver?.firstName ?? ""} ${approver?.lastName ?? ""}`.trim()
  return fullName || approver?.name || approver?.email || "-"
}

function getSubmittedDate(request: ApprovalRequest) {
  return request.submittedAt ?? request.createdAt ?? request.updatedAt
}

function StatusPill({ status }: { status?: string }) {
  const value = status ?? "open"
  const style = STATUS_STYLE[value] ?? STATUS_STYLE.open
  const label =
    TICKET_STATUS_LABEL[value as keyof typeof TICKET_STATUS_LABEL] ?? titleCase(value)

  return (
    <span
      className="inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-semibold"
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  )
}

function PriorityPill({ priority }: { priority?: string }) {
  if (!priority || priority === "--") {
    return <span className="text-[12px] text-[#B4B2A9]">-</span>
  }

  return (
    <span className="inline-flex h-6 items-center rounded-full bg-[#F1EFE8] px-2 text-[11px] font-semibold text-[#5F5E5A]">
      {priority.toUpperCase()}
    </span>
  )
}

export function RequestsPageContent() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [saveFilterOpen, setSaveFilterOpen] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState("")
  const [savingFilter, setSavingFilter] = useState(false)

  const { filters: savedFilters, save: saveFilter, remove: removeFilter } = useSavedFilters("requests")

  const { requests, limit, total, isLoading, error } = useApprovalRequests({
    scope: "own",
    search,
    page,
    limit: 25,
  }, refreshKey)

  async function handleSaveFilter() {
    if (!saveFilterName.trim()) return
    setSavingFilter(true)
    try {
      const filterValues: Record<string, string> = {}
      if (search) filterValues.search = search
      await saveFilter(saveFilterName.trim(), filterValues)
      toast.success("Filter saved")
      setSaveFilterOpen(false)
      setSaveFilterName("")
    } catch {
      toast.error("Could not save filter")
    } finally {
      setSavingFilter(false)
    }
  }

  function applyFilter(filters: Record<string, string>) {
    if (filters.search !== undefined) { setSearch(filters.search); setPage(1) }
  }
  const totalPages = Math.max(1, Math.ceil(total / limit))

  function handleRequestCreated() {
    setCreateOpen(false)
    setPage(1)
    setRefreshKey((current) => current + 1)
  }

  async function handleViewInfo(request: ApprovalRequest) {
    setSelectedRequest(request)
    setDetailsError(null)
    setDrawerOpen(true)

    const requestPublicId = request.publicId

    if (!requestPublicId) {
      return
    }

    setDetailsLoading(true)

    try {
      const response = await getApprovalRequest(requestPublicId)
      setSelectedRequest(response.responseBody.request)
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Could not load request details."

      setDetailsError(message)
    } finally {
      setDetailsLoading(false)
    }
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setSelectedRequest(null)
    setDetailsError(null)
    setDetailsLoading(false)
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="Requests"
          description="Track approval requests and create new workflow submissions."
        />

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <div className="flex h-9 w-full items-center gap-2 rounded-[8px] border border-[#E8E6DE] bg-white px-3 sm:w-[260px]">
            <Search size={14} className="text-[#B4B2A9]" strokeWidth={2} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search requests..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-brand-neutral-dark outline-none placeholder:text-[#B4B2A9]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setPage(1)
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[#888780] hover:bg-[#F1EFE8] hover:text-[#2C2C2A]"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {search && (
              <button
                type="button"
                onClick={() => setSaveFilterOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-[8px] border border-[#E8E6DE] px-3 text-[12px] font-semibold text-[#5F5E5A] hover:bg-[#F1EFE8]"
              >
                <BookmarkPlus size={13} />
                Save filter
              </button>
            )}
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="h-9 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
            >
              <Plus size={14} />
              Create new
            </Button>
          </div>
        </div>
      </div>

      {/* Saved filter pills */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-[#B4B2A9]">
            <Bookmark size={11} /> Saved:
          </span>
          {savedFilters.map((f) => (
            <div
              key={f.publicId}
              className="group flex items-center gap-1.5 rounded-full border border-[#E8E6DE] bg-[#FAFAF8] pl-3 pr-1.5 py-1"
            >
              <button
                type="button"
                onClick={() => applyFilter(f.filters)}
                className="text-[11px] font-semibold text-[#5F5E5A] hover:text-brand-teal"
              >
                {f.name}
              </button>
              <button
                type="button"
                onClick={() => removeFilter(f.publicId)}
                className="flex h-4 w-4 items-center justify-center rounded-full text-[#B4B2A9] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-[12px] border border-[#E8E6DE] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex min-w-[860px] items-center gap-3 border-b border-[#E8E6DE] bg-[#FAFAF8] px-4 py-3">
          {COLUMNS.map((column) => (
            <div
              key={column.label}
              className={cn(
                "shrink-0",
                column.width === "flex-1" ? "min-w-0 flex-1" : column.width
              )}
            >
              <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888780]">
                {column.label}
              </span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="min-w-[860px]">
            <Loader label="Loading requests" />
          </div>
        ) : error ? (
          <div className="flex h-36 min-w-[860px] items-center justify-center">
            <p className="text-[13px] font-medium text-brand-danger-text">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex h-36 min-w-[860px] items-center justify-center">
            <p className="text-[13px] text-[#B4B2A9]">No requests match your search.</p>
          </div>
        ) : (
          requests.map((request, index) => {
            const submittedDate = getSubmittedDate(request)

            return (
              <div
                key={getRequestKey(request)}
                onClick={() => void handleViewInfo(request)}
                className={cn(
                  "flex min-w-[860px] items-center gap-3 border-b border-brand-neutral-pale px-4 py-3 last:border-0",
                  index % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]",
                  "cursor-pointer transition-colors duration-100 hover:bg-[#F5FBF8]"
                )}
              >
                <div className="w-[130px] shrink-0">
                  <p className="truncate text-[12px] font-semibold text-[#2C2C2A]">
                    {getRequestTypeLabel(request)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#2C2C2A]">
                    {getRequestTitle(request)}
                  </p>
                  <p className="truncate text-[11px] text-[#888780]">
                    Requested by {getRequesterName(request)}
                  </p>
                </div>
                <div className="w-[90px] shrink-0">
                  <PriorityPill priority={request.priority} />
                </div>
                <div className="w-[130px] shrink-0">
                  <StatusPill status={request.status} />
                </div>
                <div className="w-[120px] shrink-0">
                  <p className="text-[11px] text-[#888780]">
                    {submittedDate ? formatTicketDate(submittedDate) : "-"}
                  </p>
                </div>
                <div className="w-[140px] shrink-0">
                  <p className="truncate text-[12px] text-brand-neutral-mid">
                    {getApproverName(request)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex flex-col gap-3 pl-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-[#B4B2A9]">
          Showing {requests.length} of {total} requests
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="h-8 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold"
          >
            Previous
          </Button>
          <span className="text-[12px] text-[#888780]">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((current) => current + 1)}
            className="h-8 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold"
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex h-[92vh] max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <div className="border-b border-[#E8E6DE] px-6 py-4">
            <DialogHeader>
              <DialogTitle>Create request</DialogTitle>
              <DialogDescription>
                Select a request type and provide the details approvers need.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <RequestFormShell onRequestCreated={handleRequestCreated} />
          </div>
        </DialogContent>
      </Dialog>

      <RequestDrawer
        request={selectedRequest}
        open={drawerOpen}
        isLoading={detailsLoading}
        error={detailsError}
        onClose={closeDrawer}
        onStatusUpdated={(updated) => {
          setSelectedRequest(updated)
          setRefreshKey((k) => k + 1)
        }}
      />

      {/* Save filter dialog */}
      <Dialog open={saveFilterOpen} onOpenChange={setSaveFilterOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <Bookmark size={15} className="text-brand-teal" />
              Save filter preset
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Name this filter so you can quickly apply it later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {search && (
              <div className="rounded-[8px] border border-[#E8E6DE] bg-[#FAFAF8] px-3 py-2 text-[12px] text-[#5F5E5A]">
                Search: <span className="font-semibold">&ldquo;{search}&rdquo;</span>
              </div>
            )}
            <Input
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveFilter() }}
              placeholder="e.g. My pending finance requests"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSaveFilterOpen(false)}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[12px]"
              >
                Cancel
              </Button>
              <Button
                disabled={!saveFilterName.trim() || savingFilter}
                onClick={handleSaveFilter}
                className="h-9 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
