"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Plus, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { REQUEST_TYPE } from "@/constants/requestType.constants"
import { useCreateRequest } from "@/hooks/requests/useCreateRequest"
import { useRequestTypes } from "@/hooks/requests/useRequestTypes"
import { Loader } from "@/components/loader-ui/loader"
import { submitRequest, updateApprovalRequest } from "@/lib/api/requests"
import type { ApprovalRequest } from "@/lib/api/requests"
import { aiSuggest, aiGenerateDescription } from "@/lib/api/modelApi"
import type { AIAgentDecision, SynthesizeResult } from "@/lib/api/modelApi"
import { listOrganizationUsers } from "@/lib/api/users"

import { inputCn }             from "./inputCn"
import { SectionHeading }      from "./SectionHeading"
import { FormDivider }         from "./FormDivider"
import { FormField }           from "./FormField"
import { RequestTypeSelector } from "./RequestTypeSelector"
import { getMeta }             from "./RequestTypeSelector"
import { CreateRequestTypeDialog } from "./CreateRequestTypeDialog"
import { PeoplePicker }        from "./PeoplePicker"
import type { Person }         from "./PeoplePicker"
import { AttachmentsSection }  from "./AttachmentsSection"
import type { Attachment }     from "./AttachmentsSection"
import { VisibilityPicker }    from "./VisibilityPicker"
import type { Visibility }     from "./VisibilityPicker"
import { DynamicRequestFields } from "./DynamicRequestFields"

// ── Priority ──────────────────────────────────────────────────────────────────

const PRIORITIES = [
  { value: "low",    label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high",   label: "High" },
  { value: "urgent", label: "Urgent" },
] as const
type Priority = typeof PRIORITIES[number]["value"]

// ── Helpers ───────────────────────────────────────────────────────────────────

function userToPerson(u: { publicId?: string; firstName?: string; lastName?: string; email?: string }): Person {
  const fn = u.firstName ?? ""
  const ln = u.lastName  ?? ""
  return {
    id:       u.publicId ?? "",
    name:     `${fn} ${ln}`.trim() || (u.email ?? ""),
    role:     "",
    initials: `${fn[0] ?? ""}${ln[0] ?? ""}`.toUpperCase(),
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RequestFormShellProps {
  onRequestCreated?: () => void
  initialType?:    string
  initialRequest?: ApprovalRequest
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RequestFormShell({ onRequestCreated, initialType, initialRequest }: RequestFormShellProps) {
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

  // ── State ─────────────────────────────────────────────────────────────────

  const [step,         setStep]         = useState<1 | 2>(initialRequest ? 2 : 1)
  const [type,         setType]         = useState<string>(
    initialRequest?.requestTypeKey ?? initialType ?? REQUEST_TYPE.GENERAL
  )
  const [title,        setTitle]        = useState(initialRequest?.title ?? "")
  const [department,   setDepartment]   = useState(initialRequest?.department ?? "")
  const [description,  setDescription]  = useState(initialRequest?.description ?? initialRequest?.details ?? "")
  const [priority,     setPriority]     = useState<Priority>((initialRequest?.priority as Priority) ?? "normal")
  const [requestData,  setRequestData]  = useState<Record<string, string>>({})
  const [approvers,    setApprovers]    = useState<Person[]>(() =>
    (initialRequest?.approvers ?? []).map(userToPerson).filter((p) => p.id)
  )
  const [implementors, setImplementors] = useState<Person[]>(() =>
    (initialRequest?.implementors ?? []).map(userToPerson).filter((p) => p.id)
  )
  const [attachments,  setAttachments]  = useState<Attachment[]>([])
  const [visibility,   setVisibility]   = useState<Visibility>(
    (initialRequest?.visibility as Visibility) ?? "approvers"
  )
  const [createTypeOpen, setCreateTypeOpen] = useState(false)
  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({})
  const [aiLoading,       setAiLoading]       = useState(false)
  const [aiDecision,      setAiDecision]      = useState<AIAgentDecision | null>(null)
  const [descGenerating,  setDescGenerating]  = useState(false)

  const isEditingDraft = !!initialRequest?.publicId

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedRequestType = requestTypes.find((rt) => rt.key === type)
  const dynamicFields       = selectedRequestType?.fields ?? []
  const requiredDynamic     = dynamicFields.filter((f) => f.required)

  // ── Read synthesized data from chat → create flow ─────────────────────────

  const initialisedRef = useRef(false)

  useEffect(() => {
    if (initialisedRef.current) return
    initialisedRef.current = true
    if (initialRequest) return

    const raw = sessionStorage.getItem("flowsign_synthesized")
    if (!raw) return
    sessionStorage.removeItem("flowsign_synthesized")

    try {
      const data = JSON.parse(raw) as SynthesizeResult
      if (data.title) setTitle(data.title)
      if (data.description) setDescription(data.description)
      if (data.request_type_key) {
        setType(data.request_type_key)
        if (data.suggested_fields) {
          const coerced: Record<string, string> = {}
          for (const [k, v] of Object.entries(data.suggested_fields)) {
            coerced[k] = String(v)
          }
          setRequestData(coerced)
        }
      }
      if (data.priority) setPriority(data.priority as Priority)
      if (data.department) setDepartment(data.department)
      setStep(2)
      if (data.recommended_approver || data.backup_approver) {
        const roleKeys = [data.recommended_approver, data.backup_approver].filter(Boolean) as string[]
        if (roleKeys.length > 0) {
          listOrganizationUsers().then(({ responseBody: { users } }) => {
            const byRole = (role: string) =>
              users
                .filter((u) => u.roles.includes(role))
                .map((u) => ({
                  id: u.publicId,
                  name: `${u.firstName} ${u.lastName}`.trim() || u.email,
                  role: u.title ?? u.department ?? "",
                  initials: `${(u.firstName[0] ?? "").toUpperCase()}${(u.lastName[0] ?? "").toUpperCase()}`,
                }))
            if (data.recommended_approver) setApprovers(byRole(data.recommended_approver))
            if (data.backup_approver) setImplementors(byRole(data.backup_approver))
          }).catch(() => { /* silent */ })
        }
      }
    } catch {
      /* ignore bad data */
    }
  }, [initialRequest, requestTypes])

  // ── Real-time AI validation on input changes ──────────────────────────────

  const validateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const validatingRef = useRef(false)

  useEffect(() => {
    if (validateTimer.current) clearTimeout(validateTimer.current)
    if (validatingRef.current) return
    if (!title.trim() && !description.trim()) {
      setAiDecision(null)
      return
    }
    validateTimer.current = setTimeout(async () => {
      validatingRef.current = true
      setAiLoading(true)
      try {
        const decision = await aiSuggest({
          title: title.trim(),
          description: description.trim() || undefined,
        })
        if (decision?.validation) {
          setAiDecision((prev) => prev ? { ...prev, validation: decision.validation } : decision)
        }
      } catch {
        /* silent */
      } finally {
        setAiLoading(false)
        validatingRef.current = false
      }
    }, 1500)
    return () => { if (validateTimer.current) clearTimeout(validateTimer.current) }
  }, [title, description])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleTypeChange(nextType: string) {
    setType(nextType)
    setRequestData({})
    setFieldErrors({})
    try { await loadRequestTypeDetails(nextType) } catch { /* keep list */ }
  }

  function handleTypeSelectAndAdvance(nextType: string) {
    handleTypeChange(nextType)
    setStep(2)
  }

  function setRequestField(key: string, value: string) {
    setRequestData((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }

  function handleRequestTypeCreated(rt: (typeof requestTypes)[number]) {
    addRequestType(rt)
    setType(rt.key)
    setRequestData({})
    setStep(2)
  }

  async function handleAiSuggest() {
    if (!title.trim()) {
      setFieldErrors({ title: "Enter a title before using AI suggest." })
      return
    }
    setAiLoading(true)
    setAiDecision(null)
    try {
      const decision = await aiSuggest({
        title: title.trim(),
        description: description.trim() || undefined,
        data: normalizedData(),
        fieldDefinitions: dynamicFields as unknown as Record<string, unknown>[],
        requestTypeKey: type,
      })
      if (decision?.classification) {
        const c = decision.classification
        const matched = requestTypes.find((rt) => rt.key === c.request_type_key)
        const coerceFields = (fields: Record<string, string | number> | undefined) => {
          if (!fields) return {}
          return Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, String(v)])
          )
        }
        if (matched && !initialType) {
          setType(matched.key)
          setRequestData(coerceFields(c.suggested_fields))
          setFieldErrors({})
        } else {
          const coerced = coerceFields(c.suggested_fields)
          if (Object.keys(coerced).length > 0) {
            setRequestData((prev) => ({ ...prev, ...coerced }))
          }
        }
        if (c.priority) setPriority(c.priority as Priority)
        if (c.department) setDepartment(c.department)
      }

      if (decision?.routing) {
        const r = decision.routing
        const roleKeys = [r.recommended_approver, r.backup_approver].filter(Boolean) as string[]
        if (roleKeys.length > 0) {
          try {
            const { responseBody: { users } } = await listOrganizationUsers()
            const byRole = (role: string) =>
              users
                .filter((u) => u.roles.includes(role))
                .map((u) => ({
                  id: u.publicId,
                  name: `${u.firstName} ${u.lastName}`.trim() || u.email,
                  role: u.title ?? u.department ?? "",
                  initials: `${(u.firstName[0] ?? "").toUpperCase()}${(u.lastName[0] ?? "").toUpperCase()}`,
                }))
            if (r.recommended_approver) setApprovers(byRole(r.recommended_approver))
            if (r.backup_approver) setImplementors(byRole(r.backup_approver))
          } catch {
            /* silent — manual picker still works */
          }
        }
      }

      setAiDecision(decision)
      if (!decision) {
        toast.error("AI suggestion unavailable", { description: "The AI service could not process this request." })
      } else {
        toast.success("AI suggestion ready", { description: "Review the suggested type, priority, and approvers above." })
      }
    } catch {
      toast.error("AI suggestion failed")
    } finally {
      setAiLoading(false)
    }
  }

  async function handleGenerateDescription() {
    if (!title.trim()) {
      setFieldErrors({ title: "Enter a title first." })
      return
    }
    setDescGenerating(true)
    try {
      const result = await aiGenerateDescription(title.trim(), type)
      if (result) {
        setDescription(result)
        toast.success("Description generated")
      } else {
        toast.error("Could not generate description")
      }
    } catch {
      toast.error("Generation failed")
    } finally {
      setDescGenerating(false)
    }
  }

  // ── Payload ───────────────────────────────────────────────────────────────

  function normalizedData() {
    return Object.fromEntries(
      Object.entries(requestData).map(([key, value]) => {
        const field = dynamicFields.find((f) => f.key === key)
        return [key, field?.type === "number" && value.trim() !== "" ? Number(value) : value]
      })
    ) as Record<string, string | number>
  }

  function buildPayload(doSubmit: boolean) {
    const data  = normalizedData()
    const amountVal = data.amount
    const amount = typeof amountVal === "number" ? amountVal : undefined

    return {
      requestTypeKey:       type,
      type:                 selectedRequestType?.category ?? type,
      title:                title.trim(),
      summary:              title.trim(),
      description:          description.trim() || undefined,
      details:              description.trim() || undefined,
      data,
      amount,
      department:           department.trim() || undefined,
      urgency:              priority,
      priority,
      visibility,
      approverPublicIds:    approvers.map((p) => p.id),
      implementorPublicIds: implementors.map((p) => p.id),
      submit:               doSubmit,
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validateForDraft(): boolean {
    if (!title.trim()) {
      setFieldErrors({ title: "Title is required." })
      return false
    }
    setFieldErrors({})
    return true
  }

  function validateForSubmit(): boolean {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Title is required."
    for (const field of requiredDynamic) {
      const val = requestData[field.key]
      if (!val?.trim()) errs[field.key] = `${field.label} is required.`
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit handlers ───────────────────────────────────────────────────────

  async function handleSaveDraft() {
    if (!validateForDraft() || isSubmitting) return
    try {
      if (isEditingDraft) {
        await updateApprovalRequest(initialRequest!.publicId!, buildPayload(false))
      } else {
        await submit(buildPayload(false))
      }
      toast.success("Draft saved")
      onRequestCreated?.()
    } catch (err) {
      toast.error("Draft not saved", {
        description: err instanceof Error ? err.message : "Could not save request draft.",
      })
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateForSubmit() || isSubmitting) return
    try {
      if (isEditingDraft) {
        await updateApprovalRequest(initialRequest!.publicId!, buildPayload(false))
        await submitRequest(initialRequest!.publicId!)
      } else {
        await submit(buildPayload(true))
      }
      toast.success("Request submitted — approvers have been notified")
      onRequestCreated?.()
    } catch (err) {
      toast.error("Request not submitted", {
        description: err instanceof Error ? err.message : "Could not submit request.",
      })
    }
  }

  // ── Step 1 — Type selector ────────────────────────────────────────────────

  if (step === 1) {
    return (
      <>
        <div className="flex min-h-full w-full flex-col">
          <div className="flex-1 px-6 py-6 md:px-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-bold text-[#2C2C2A]">What type of request?</h2>
                <p className="mt-0.5 text-[12px] text-[#888780]">Select a category to get started</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateTypeOpen(true)}
                className="h-8 shrink-0 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
              >
                <Plus size={14} />
                New type
              </Button>
            </div>

            {requestTypesError && (
              <p className="mb-3 text-[12px] font-medium text-brand-danger-text">{requestTypesError}</p>
            )}
            {isLoadingRequestTypes ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[72px] animate-pulse rounded-[12px] border border-[#E8E6DE] bg-[#F6F4EF]" />
                ))}
              </div>
            ) : (
              <RequestTypeSelector
                value={type}
                onChange={handleTypeSelectAndAdvance}
                requestTypes={requestTypes}
                variant="cards"
              />
            )}
          </div>
        </div>

        <CreateRequestTypeDialog
          open={createTypeOpen}
          onOpenChange={setCreateTypeOpen}
          onCreated={handleRequestTypeCreated}
        />
      </>
    )
  }

  // ── Step 2 — Form ─────────────────────────────────────────────────────────

  const selType = requestTypes.find((rt) => rt.key === type)
  const typeMeta = selType ? getMeta(selType) : null

  return (
    <>
    <form data-lenis-prevent onSubmit={handleSubmit} className="flex min-h-full w-full flex-col">

      {/* Step 2 header — back + selected type */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#E8E6DE] px-6 py-3">
        {!isEditingDraft && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#E8E6DE] text-[#5F5E5A] transition-colors hover:bg-[#F1EFE8]"
            aria-label="Back to type selection"
          >
            <ArrowLeft size={14} />
          </button>
        )}
        {typeMeta && selType && (
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px]"
              style={{ background: typeMeta.pale }}
            >
              <typeMeta.Icon size={12} strokeWidth={2} style={{ color: typeMeta.color }} />
            </span>
            <span className="text-[13px] font-semibold text-[#2C2C2A]">{selType.name}</span>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1">
        <div className="flex w-full flex-col gap-8 px-6 py-6 md:px-8">

          {/* ── 1. Basic details ── */}
          <div className="flex flex-col gap-4">
            <SectionHeading title="Basic details" />
            <FormField label="Request title" required hint="Give this request a clear, specific title" error={fieldErrors.title}>
              <Input
                name="title"
                placeholder="e.g. Q4 office equipment procurement"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (fieldErrors.title) setFieldErrors((p) => { const e = { ...p }; delete e.title; return e }) }}
                disabled={isSubmitting}
                className={cn(inputCn, fieldErrors.title && "border-red-300")}
              />
            </FormField>
            <FormField label="Description" hint="Provide context and any supporting details">
              <div className="flex items-center gap-1.5 mb-1">
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={descGenerating || isSubmitting || !title.trim()}
                  className="ml-auto text-[11px] font-medium text-brand-teal hover:text-brand-teal-dark disabled:text-[#B4B2A9] transition-colors"
                >
                  {descGenerating ? "Generating…" : "Generate"}
                </button>
              </div>
              <Textarea
                name="description"
                placeholder="Provide context and any supporting details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={cn(
                  "rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8]",
                  "text-[13px] text-brand-neutral-dark placeholder:text-[#B4B2A9]",
                  "focus-visible:border-brand-teal-mid focus-visible:ring-2",
                  "focus-visible:ring-brand-teal-pale focus-visible:bg-white",
                  "resize-y min-h-[100px] leading-relaxed transition-all duration-150",
                  aiDecision?.validation && !aiDecision.validation.valid && "border-amber-300"
                )}
              />
              {aiDecision?.validation && !aiDecision.validation.valid && (
                <div className="mt-2 flex flex-col gap-1.5 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">
                  {aiDecision.validation.warnings.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-amber-800">Warnings</span>
                      {aiDecision.validation.warnings.map((w, i) => (
                        <p key={i} className="text-[11px] text-amber-700">&bull; {w}</p>
                      ))}
                    </div>
                  )}
                  {aiDecision.validation.recommendations.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-amber-800">Recommendations</span>
                      {aiDecision.validation.recommendations.map((r, i) => (
                        <p key={i} className="text-[11px] text-amber-700">&bull; {r}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </FormField>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAiSuggest}
                disabled={aiLoading || isSubmitting}
                className="h-8 shrink-0 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
              >
                <Sparkles size={14} className="mr-1.5 text-brand-teal" />
                {aiLoading ? "Analysing…" : "AI Suggest"}
              </Button>
            </div>
          </div>

          {/* ── 2. Dynamic type-specific fields ── */}
          {dynamicFields.length > 0 && (
            <>
              <FormDivider />
              <div className="flex flex-col gap-4">
                <SectionHeading title="Request details" />
                {isLoadingDetails && (
                  <Loader label="Loading fields" className="min-h-12 justify-start" />
                )}
                {detailsError && (
                  <p className="text-[12px] font-medium text-brand-danger-text">{detailsError}</p>
                )}
                <DynamicRequestFields
                  fields={dynamicFields}
                  values={requestData}
                  onChange={setRequestField}
                  disabled={isSubmitting}
                  errors={fieldErrors}
                />
              </div>
            </>
          )}

          <FormDivider />

          {/* ── 3. Priority + Department ── */}
          <div className="flex flex-col gap-4">
            <SectionHeading title="Priority & department" />
            <FormField label="Priority">
              <div className="flex rounded-[8px] border border-[#E8E6DE] bg-[#FAFAF8] p-0.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex-1 rounded-[6px] py-1.5 text-[12px] font-semibold transition-all duration-150",
                      priority === p.value
                        ? "bg-white text-[#2C2C2A] shadow-sm"
                        : "text-[#888780] hover:text-[#2C2C2A]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Department" hint="Optional department or team">
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

          {/* ── 4. Visibility ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Visibility" />
            <p className="text-[12px] text-[#888780] -mt-1">Control who can see this request.</p>
            <VisibilityPicker value={visibility} onChange={setVisibility} disabled={isSubmitting} />
          </div>

          <FormDivider />

          {/* ── 5. Approvers ── */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Approvers" badge="Optional" />
            <p className="text-[12px] text-[#888780] -mt-1">
              Add the people who need to approve this request. If none are selected, the workflow
              engine assigns approvers automatically.
            </p>
            <PeoplePicker
              label="Add approvers"
              selected={approvers}
              onChange={setApprovers}
              placeholder="Search people…"
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
              selected={implementors}
              onChange={setImplementors}
              placeholder="Search people…"
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
            <AttachmentsSection files={attachments} onChange={setAttachments} disabled={isSubmitting} />
          </div>

          <div className="h-2" />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex shrink-0 flex-col gap-3 border-t border-[#E8E6DE] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" disabled={isSubmitting}
            onClick={handleSaveDraft}
            className="h-9 px-4 rounded-[8px] text-[13px] text-[#888780] hover:bg-brand-neutral-pale">
            {isEditingDraft ? "Save draft" : "Save as Draft"}
          </Button>
          <p className="text-[11px] text-[#B4B2A9] ml-1">
            <span className="text-brand-teal">*</span> Required fields
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "h-9 w-full px-6 rounded-[8px] text-[13px] font-semibold sm:w-auto",
            "border-none transition-all duration-200",
            !isSubmitting
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
