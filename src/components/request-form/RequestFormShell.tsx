"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { REQUEST_TYPE } from "@/constants/requestType.constants"
import { useCreateRequest } from "@/hooks/requests/useCreateRequest"
import { useRequestTypes } from "@/hooks/requests/useRequestTypes"
import { Loader } from "@/components/loader-ui/loader"

import { inputCn }             from "./inputCn"
import { SectionHeading }      from "./SectionHeading"
import { FormDivider }         from "./FormDivider"
import { FormField }           from "./FormField"
import { RequestTypeSelector } from "./RequestTypeSelector"
import { CreateRequestTypeDialog } from "./CreateRequestTypeDialog"
import { PeoplePicker }        from "./PeoplePicker"
import type { Person }         from "./PeoplePicker"
import { AttachmentsSection }  from "./AttachmentsSection"
import type { Attachment }     from "./AttachmentsSection"
import { VisibilityPicker }    from "./VisibilityPicker"
import type { Visibility }     from "./VisibilityPicker"
import { DynamicRequestFields } from "./DynamicRequestFields"

interface RequestFormShellProps {
  onRequestCreated?: () => void
  initialType?: string
}

export function RequestFormShell({ onRequestCreated, initialType }: RequestFormShellProps) {
  const { submit, isSubmitting } = useCreateRequest()
  const {
    requestTypes,
    isLoading: isLoadingRequestTypes,
    error: requestTypesError,
    isLoadingDetails,
    detailsError,
    addRequestType,
    loadRequestTypeDetails,
  } = useRequestTypes()

  const [type,         setType]         = useState<string>(initialType ?? REQUEST_TYPE.GENERAL)
  const [title,        setTitle]        = useState("")
  const [department,   setDepartment]   = useState("")
  const [description,  setDescription]  = useState("")
  const [requestData,  setRequestData]  = useState<Record<string, string>>({})
  const [approvers,    setApprovers]    = useState<Person[]>([])
  const [implementors, setImplementors] = useState<Person[]>([])
  const [attachments,  setAttachments]  = useState<Attachment[]>([])
  const [visibility,   setVisibility]   = useState<Visibility>("approvers")
  const [createTypeOpen, setCreateTypeOpen] = useState(false)

  const selectedRequestType = requestTypes.find((requestType) => requestType.key === type)
  const dynamicFields = selectedRequestType?.fields ?? []
  const requiredDynamicFields = dynamicFields.filter((field) => field.required)

  const valid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    approvers.length > 0 &&
    requiredDynamicFields.every((field) => {
      const value = requestData[field.key]

      return typeof value === "string" && value.trim().length > 0
    })

  async function handleTypeChange(nextType: string) {
    setType(nextType)
    setRequestData({})

    try {
      await loadRequestTypeDetails(nextType)
    } catch {
      // The list payload remains usable when the detail refresh fails.
    }
  }

  function setRequestField(key: string, value: string) {
    setRequestData((current) => ({ ...current, [key]: value }))
  }

  function handleRequestTypeCreated(requestType: (typeof requestTypes)[number]) {
    addRequestType(requestType)
    setType(requestType.key)
    setRequestData({})
  }

  function normalizedData() {
    return Object.fromEntries(
      Object.entries(requestData).map(([key, value]) => {
        const field = dynamicFields.find((item) => item.key === key)

        return [
          key,
          field?.type === "number" && value.trim() !== "" ? Number(value) : value,
        ]
      })
    ) as Record<string, string | number>
  }

  function requestPayload(submitRequest: boolean) {
    const data = normalizedData()
    const amountValue = data.amount
    const amount = typeof amountValue === "number" ? amountValue : undefined

    return {
      requestTypeKey: type,
      type: selectedRequestType?.category ?? type,
      title: title.trim(),
      summary: title.trim(),
      description: description.trim(),
      details: description.trim(),
      data,
      amount,
      department: department.trim() || undefined,
      urgency: "normal",
      priority: "normal",
      visibility,
      approverPublicIds: approvers.map((person) => person.id),
      implementorPublicIds: implementors.map((person) => person.id),
      submit: submitRequest,
    }
  }

  async function handleSaveDraft() {
    if (!valid || isSubmitting) return

    try {
      await submit(requestPayload(false))
      toast.success("Draft saved", {
        description: "Your request draft was created successfully.",
      })
      onRequestCreated?.()
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Could not save request draft."

      toast.error("Draft not saved", { description: message })
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!valid || isSubmitting) return

    try {
      await submit(requestPayload(true))
      toast.success("Request submitted", {
        description: "Your approval request was created successfully.",
      })
      onRequestCreated?.()
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Could not submit request."

      toast.error("Request not submitted", { description: message })
    }
  }

  return (
    <>
    <form data-lenis-prevent onSubmit={handleSubmit} className="flex min-h-full w-full flex-col">

      {/* ══════════════════════════════════════════
          SCROLLABLE BODY
      ══════════════════════════════════════════ */}
      <div className="flex-1">
        <div className="w-full px-6 md:px-8 py-6 flex flex-col gap-8">

          {/* ── 1. Request type ── */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <SectionHeading title="Request type" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateTypeOpen(true)}
                className="h-8 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
              >
                <Plus size={14} />
                New type
              </Button>
            </div>
            {requestTypesError && (
              <p className="mb-3 text-[12px] font-medium text-brand-danger-text">
                {requestTypesError}
              </p>
            )}
            {detailsError && (
              <p className="mb-3 text-[12px] font-medium text-brand-danger-text">
                {detailsError}
              </p>
            )}
            {isLoadingRequestTypes && (
              <Loader
                label="Loading request types"
                size="sm"
                className="mb-3 min-h-16 justify-start"
              />
            )}
            {isLoadingDetails && (
              <Loader
                label="Loading selected request type"
                size="sm"
                className="mb-3 min-h-16 justify-start"
              />
            )}
            <RequestTypeSelector
              value={type}
              onChange={handleTypeChange}
              requestTypes={requestTypes}
              disabled={isSubmitting || isLoadingRequestTypes || isLoadingDetails}
            />
            {selectedRequestType?.description && (
              <p className="mt-3 max-w-2xl text-[12px] text-[#888780]">
                {selectedRequestType.description}
              </p>
            )}
          </div>

          <FormDivider />

          {/* ── 2. Basic details ── */}
          <div className="flex flex-col gap-4">
            <SectionHeading title="Basic details" />
            <FormField label="Request title" required hint="Give this request a clear, specific title">
              <Input
                name="title"
                placeholder="e.g. Q4 office equipment procurement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className={inputCn}
              />
            </FormField>
            <FormField label="Department" hint="Optional department or team for this request">
              <Input
                name="department"
                placeholder="e.g. Finance"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isSubmitting}
                className={inputCn}
              />
            </FormField>
          </div>

          <FormDivider />

          {/* ── 4. Description ── */}
          <div className="flex flex-col gap-4">
            <SectionHeading title="Description" />
            <FormField
              label="What is this request for?"
              required
              hint="Provide enough context for approvers to make an informed decision"
            >
              <Textarea
                name="description"
                placeholder="Describe the request, its purpose, and why it is needed. Include context, deadlines, and business justification…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={5}
                className={cn(
                  "rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8]",
                  "text-[13px] text-brand-neutral-dark placeholder:text-[#B4B2A9]",
                  "focus-visible:border-brand-teal-mid focus-visible:ring-2",
                  "focus-visible:ring-brand-teal-pale focus-visible:bg-white",
                  "resize-y min-h-[120px] leading-relaxed transition-all duration-150"
                )}
              />
            </FormField>

            <DynamicRequestFields
              fields={dynamicFields}
              values={requestData}
              onChange={setRequestField}
              disabled={isSubmitting}
            />
          </div>

          <FormDivider />

          {/* ── 5. Approvers ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Approvers" />
            <p className="text-[12px] text-[#888780] -mt-1">
              Add the people who need to approve this request. They&apos;ll be notified immediately.
            </p>
            <PeoplePicker
              label="Add approvers" required
              selected={approvers} onChange={setApprovers}
              placeholder="Search by name or role…"
              disabled={isSubmitting}
            />
          </div>

          <FormDivider />

          {/* ── 6. Implementors ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Implementors" badge="Optional" />
            <p className="text-[12px] text-[#888780] -mt-1">
              People responsible for carrying out this request once approved.
            </p>
            <PeoplePicker
              label="Add implementors"
              selected={implementors} onChange={setImplementors}
              placeholder="Search by name or role…"
              disabled={isSubmitting}
            />
          </div>

          <FormDivider />

          {/* ── 7. Attachments ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Attachments" badge="Optional" />
            <p className="text-[12px] text-[#888780] -mt-1">
              Attach invoices, quotes, forms, or any supporting documents.
            </p>
            <AttachmentsSection
              files={attachments}
              onChange={setAttachments}
              disabled={isSubmitting}
            />
          </div>

          <FormDivider />

          {/* ── 8. Visibility ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Visibility" />
            <p className="text-[12px] text-[#888780] -mt-1">
              Control who can see this request in Flowsign.
            </p>
            <VisibilityPicker
              value={visibility}
              onChange={setVisibility}
              disabled={isSubmitting}
            />
          </div>

          <div className="h-2" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STICKY FOOTER
      ══════════════════════════════════════════ */}
      <div className="flex shrink-0 flex-col gap-3 border-t border-[#E8E6DE] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" disabled={isSubmitting}
            onClick={handleSaveDraft}
            className="h-9 px-4 rounded-[8px] text-[13px] text-[#888780] hover:bg-brand-neutral-pale">
            Save draft
          </Button>
          <p className="text-[11px] text-[#B4B2A9] ml-1">
            <span className="text-brand-teal">*</span> Required fields
          </p>
        </div>

        <Button
          type="submit"
          disabled={!valid || isSubmitting}
          className={cn(
            "h-9 w-full px-6 rounded-[8px] text-[13px] font-semibold sm:w-auto",
            "border-none transition-all duration-200",
            valid && !isSubmitting
              ? "bg-linear-to-r from-brand-teal to-brand-teal-mid text-white " +
                "hover:opacity-90 shadow-[0_4px_16px_rgba(15,110,86,0.2)] cursor-pointer"
              : "bg-brand-neutral-light text-brand-neutral-mid cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
    <CreateRequestTypeDialog
      open={createTypeOpen}
      onOpenChange={setCreateTypeOpen}
      onCreated={handleRequestTypeCreated}
    />
    </>
  )
}
