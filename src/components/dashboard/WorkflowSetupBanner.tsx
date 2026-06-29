"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Loader2, Rocket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useWorkflowRules } from "@/hooks/useWorkflowRules"
import { listRequestTypes, type OrganizationRequestType } from "@/lib/api/request-types"

const DISMISS_KEY = "flowsign_workflow_banner_dismissed"

const APPROVER_OPTIONS = [
  { value: "org_admin", label: "Org admins", approver: { role: "org_admin" } },
  { value: "manager",   label: "Requester's direct manager", approver: { type: "manager" } },
]

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={[
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
      done   ? "bg-[#0F6E56] text-white" :
      active ? "bg-[#0F6E56] text-white ring-2 ring-[#0F6E56] ring-offset-2" :
               "bg-[#E8E6DE] text-[#888780]",
    ].join(" ")}>
      {n}
    </div>
  )
}

// ── Create workflow dialog ─────────────────────────────────────────────────────

function CreateWorkflowDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}) {
  const { create } = useWorkflowRules()
  const [step, setStep]   = useState(1)
  const [requestTypes, setRequestTypes] = useState<OrganizationRequestType[]>([])
  const [form, setForm]   = useState({
    name:           "General Request Approval",
    requestTypeKey: "general",
    approverValue:  "org_admin",
    stepName:       "Admin Review",
    dueHours:       48,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState("")

  // fetch request types when dialog opens
  useEffect(() => {
    if (!open) return
    listRequestTypes()
      .then((res) => setRequestTypes(res.responseBody.requestTypes ?? []))
      .catch(() => {/* use fallback */})
  }, [open])

  function resetDialog() {
    setStep(1)
    setError("")
    setIsSubmitting(false)
    setForm({ name: "General Request Approval", requestTypeKey: "general", approverValue: "org_admin", stepName: "Admin Review", dueHours: 48 })
  }

  async function submit() {
    setIsSubmitting(true)
    setError("")
    const approverOption = APPROVER_OPTIONS.find((o) => o.value === form.approverValue)
    try {
      await create({
        name:           form.name.trim(),
        requestTypeKey: form.requestTypeKey,
        priority:       10,
        conditions:     {},
        escalationHours: 48,
        workflowDefinition: {
          steps: [{
            key:               "step_1",
            name:              form.stepName.trim() || "Admin Review",
            mode:              "sequential",
            requiredApprovals: 1,
            approver:          approverOption?.approver ?? { role: "org_admin" },
            dueHours:          form.dueHours,
          }],
        },
      })
      onCreated()
      onOpenChange(false)
      resetDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create workflow rule.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const step1Valid = form.name.trim().length > 0 && form.requestTypeKey.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetDialog(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <Rocket size={16} className="text-[#0F6E56]" />
            Create your first workflow
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Define how requests get routed to approvers.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          <StepDot n={1} active={step === 1} done={step > 1} />
          <div className="h-px flex-1 bg-[#E8E6DE]" />
          <StepDot n={2} active={step === 2} done={false} />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-[8px] border border-[#F5C6C6] bg-[#FCEBEB] px-3 py-2.5 text-[12px] font-medium text-[#A32D2D]">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1 — name + request type */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Workflow name
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                placeholder="e.g. Finance Approval"
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Request type
              <select
                value={form.requestTypeKey}
                onChange={(e) => setForm((f) => ({ ...f, requestTypeKey: e.target.value }))}
                className="h-9 rounded-[8px] border border-[#E8E6DE] bg-white px-3 text-[13px] text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              >
                {(requestTypes.length > 0 ? requestTypes : [
                  { key: "general", name: "General" },
                  { key: "funds",   name: "Funds" },
                  { key: "access",  name: "Access" },
                  { key: "finance", name: "Finance" },
                ]).map((rt) => (
                  <option key={rt.key} value={rt.key}>{rt.name}</option>
                ))}
              </select>
            </label>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="h-9 rounded-[8px] bg-[#0F6E56] px-4 text-[12px] font-semibold text-white"
              >
                Next <ArrowRight size={13} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — approver */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Approver
              <select
                value={form.approverValue}
                onChange={(e) => setForm((f) => ({ ...f, approverValue: e.target.value }))}
                className="h-9 rounded-[8px] border border-[#E8E6DE] bg-white px-3 text-[13px] text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              >
                {APPROVER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Step name
              <Input
                value={form.stepName}
                onChange={(e) => setForm((f) => ({ ...f, stepName: e.target.value }))}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                placeholder="e.g. Admin Review"
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Due within (hours)
              <Input
                type="number"
                min={1}
                value={form.dueHours}
                onChange={(e) => setForm((f) => ({ ...f, dueHours: Number(e.target.value) || 48 }))}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-9 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold"
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={submit}
                className="h-9 rounded-[8px] bg-[#0F6E56] px-4 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? <><Loader2 size={13} className="animate-spin" /> Creating…</> : "Create workflow"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Banner ─────────────────────────────────────────────────────────────────────

export function WorkflowSetupBanner() {
  const router = useRouter()
  const { rules, isLoading } = useWorkflowRules()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true
    return !!localStorage.getItem(DISMISS_KEY)
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  function handleCreated() {
    dismiss()
    router.push("/workflow-rules")
  }

  if (isLoading || dismissed || rules.length > 0) return null

  return (
    <>
      <div className="flex flex-col gap-3 rounded-[14px] border border-[#C5E3D8] bg-[#F0FAF6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#0F6E56]">
            <Rocket size={16} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0F6E56]">
              Set up your first approval workflow
            </p>
            <p className="mt-0.5 text-[12px] text-[#3A8C6E]">
              Requests won&apos;t route to approvers until you create a workflow rule. It takes less than 2 minutes.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="h-8 rounded-[8px] bg-[#0F6E56] px-3 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
          >
            Create workflow
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#3A8C6E] hover:bg-[#C5E3D8]"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <CreateWorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />
    </>
  )
}
