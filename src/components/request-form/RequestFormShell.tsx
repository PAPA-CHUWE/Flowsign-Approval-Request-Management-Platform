"use client"

import { useState } from "react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { REQUEST_TYPE, type RequestType } from "@/constants/requestType.constants"
import { useCreateRequest } from "@/hooks/requests/useCreateRequest"

import { inputCn }             from "./inputCn"
import { SectionHeading }      from "./SectionHeading"
import { FormDivider }         from "./FormDivider"
import { FormField }           from "./FormField"
import { RequestTypeSelector } from "./RequestTypeSelector"
import { RequestKeyField, generateRequestKey } from "./RequestKeyField"
import { PeoplePicker }        from "./PeoplePicker"
import type { Person }         from "./PeoplePicker"
import { AttachmentsSection }  from "./AttachmentsSection"
import type { Attachment }     from "./AttachmentsSection"
import { VisibilityPicker }    from "./VisibilityPicker"
import type { Visibility }     from "./VisibilityPicker"

import { AccessRequestFields }  from "./fields/AccessRequestFields"
import { FinanceRequestFields } from "./fields/FinanceRequestFields"
import { GeneralRequestFields } from "./fields/GeneralRequestFields"
import { RequesterDetailsStep } from "./steps/RequesterDetailsStep"

export function RequestFormShell() {
  const { isSubmitting } = useCreateRequest()

  const [type,         setType]         = useState<RequestType>(REQUEST_TYPE.GENERAL)
  const [title,        setTitle]        = useState("")
  const [requestKey,   setRequestKey]   = useState(() => generateRequestKey())
  const [description,  setDescription]  = useState("")
  const [approvers,    setApprovers]    = useState<Person[]>([])
  const [implementors, setImplementors] = useState<Person[]>([])
  const [attachments,  setAttachments]  = useState<Attachment[]>([])
  const [visibility,   setVisibility]   = useState<Visibility>("approvers")

  const regenerateKey = () => setRequestKey(generateRequestKey())

  const valid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    approvers.length > 0

  return (
    <form className="w-full flex flex-col">

      {/* ══════════════════════════════════════════
          SCROLLABLE BODY
      ══════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-6 md:px-8 py-6 flex flex-col gap-8">

          {/* ── 1. Request type ── */}
          <div>
            <SectionHeading title="Request type" />
            <RequestTypeSelector value={type} onChange={setType} disabled={isSubmitting} />
          </div>

          <FormDivider />

          {/* ── 2. Basic details ── */}
          <div className="flex flex-col gap-4">
            <SectionHeading title="Basic details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <RequestKeyField
                value={requestKey}
                onRegenerate={regenerateKey}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <FormDivider />

          {/* ── 3. Requester details ── */}
          <div className="flex flex-col gap-4">
            <SectionHeading title="Requester details" />
            <RequesterDetailsStep disabled={isSubmitting} />
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
                  "focus-visible:border-[#1D9E75] focus-visible:ring-[2px]",
                  "focus-visible:ring-brand-teal-pale focus-visible:bg-white",
                  "resize-y min-h-[120px] leading-relaxed transition-all duration-150"
                )}
              />
            </FormField>

            {type === REQUEST_TYPE.ACCESS  && <AccessRequestFields  disabled={isSubmitting} />}
            {type === REQUEST_TYPE.FINANCE && <FinanceRequestFields disabled={isSubmitting} />}
            {type === REQUEST_TYPE.GENERAL && <GeneralRequestFields disabled={isSubmitting} />}
          </div>

          <FormDivider />

          {/* ── 5. Approvers ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Approvers" />
            <p className="text-[12px] text-[#888780] -mt-1">
              Add the people who need to approve this request. They'll be notified immediately.
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
      <div className="shrink-0 flex items-center justify-between px-6 md:px-8 py-4 border-t border-[#E8E6DE] bg-white">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" disabled={isSubmitting}
            className="h-9 px-4 rounded-[8px] text-[13px] text-[#888780] hover:bg-[#F1EFE8]">
            Save draft
          </Button>
          <p className="text-[11px] text-[#B4B2A9] ml-1">
            <span className="text-[#0F6E56]">*</span> Required fields
          </p>
        </div>

        <Button
          type="submit"
          disabled={!valid || isSubmitting}
          className={cn(
            "h-9 px-6 rounded-[8px] text-[13px] font-semibold",
            "border-none transition-all duration-200",
            valid && !isSubmitting
              ? "bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white " +
                "hover:opacity-90 shadow-[0_4px_16px_rgba(15,110,86,0.2)] cursor-pointer"
              : "bg-[#D3D1C7] text-[#5F5E5A] cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  )
}
