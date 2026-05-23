"use client"

import { useState } from "react"
import {
  AlertCircle, ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
  GitBranch, Loader2, Plus, Trash2, User, Users,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useWorkflowRules } from "@/hooks/useWorkflowRules"
import { useRequestTypes } from "@/hooks/requests/useRequestTypes"
import { deleteWorkflowRule, updateWorkflowRule, type WorkflowRule, type WorkflowStep } from "@/lib/api/workflow-rules"
import { formatDisplayDate } from "@/lib/format/date"

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "")
}

// ── Step row in the form ───────────────────────────────────────────────────────

interface StepFormState {
  name: string
  approverType: "manager" | "role"
  role: string
  dueHours: number
}

function StepRow({
  step,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  step: StepFormState
  index: number
  total: number
  onChange: (s: StepFormState) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className="rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal text-[10px] font-bold text-white">
          {index + 1}
        </span>
        <Input
          value={step.name}
          onChange={(e) => onChange({ ...step, name: e.target.value })}
          placeholder="Step name (e.g. Line Manager)"
          className="h-8 flex-1 rounded-[6px] border-[#E8E6DE] text-[12px]"
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#B4B2A9] hover:bg-[#F1EFE8] disabled:opacity-30"
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#B4B2A9] hover:bg-[#F1EFE8] disabled:opacity-30"
          >
            <ChevronDown size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#B4B2A9] hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Approver type toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888780]">Approver</span>
          <div className="flex overflow-hidden rounded-[6px] border border-[#E8E6DE]">
            {(["manager", "role"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...step, approverType: t })}
                className={`flex-1 py-1 text-[11px] font-semibold transition-colors ${
                  step.approverType === t
                    ? "bg-brand-teal text-white"
                    : "bg-white text-[#5F5E5A] hover:bg-[#F1EFE8]"
                }`}
              >
                {t === "manager" ? "Manager" : "Role"}
              </button>
            ))}
          </div>
        </div>

        {/* Role name (shown when type = role) */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888780]">
            {step.approverType === "role" ? "Role name" : "Due (hours)"}
          </span>
          {step.approverType === "role" ? (
            <Input
              value={step.role}
              onChange={(e) => onChange({ ...step, role: e.target.value })}
              placeholder="e.g. finance_officer"
              className="h-8 rounded-[6px] border-[#E8E6DE] text-[12px]"
            />
          ) : (
            <Input
              type="number"
              min={1}
              value={step.dueHours}
              onChange={(e) => onChange({ ...step, dueHours: Number(e.target.value) })}
              className="h-8 rounded-[6px] border-[#E8E6DE] text-[12px]"
            />
          )}
        </div>

        {step.approverType === "role" && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888780]">Due (hours)</span>
            <Input
              type="number"
              min={1}
              value={step.dueHours}
              onChange={(e) => onChange({ ...step, dueHours: Number(e.target.value) })}
              className="h-8 rounded-[6px] border-[#E8E6DE] text-[12px]"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Create dialog ──────────────────────────────────────────────────────────────

function CreateRuleDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (rule: WorkflowRule) => void
}) {
  const { requestTypes, isLoading: rtLoading } = useRequestTypes()

  const [name, setName] = useState("")
  const [requestTypeKey, setRequestTypeKey] = useState("")
  const [priority, setPriority] = useState(10)
  const [escalationHours, setEscalationHours] = useState(48)
  const [amountGt, setAmountGt] = useState("")
  const [steps, setSteps] = useState<StepFormState[]>([
    { name: "", approverType: "manager", role: "", dueHours: 24 },
  ])
  const [saving, setSaving] = useState(false)

  function updateStep(i: number, s: StepFormState) {
    setSteps((prev) => prev.map((p, idx) => (idx === i ? s : p)))
  }
  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i))
  }
  function moveStep(i: number, dir: -1 | 1) {
    setSteps((prev) => {
      const next = [...prev]
      const tmp = next[i]; next[i] = next[i + dir]; next[i + dir] = tmp
      return next
    })
  }

  const isValid = name.trim() && requestTypeKey && steps.length > 0 && steps.every((s) => s.name.trim())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSaving(true)
    try {
      const builtSteps: WorkflowStep[] = steps.map((s) => ({
        key: slugify(s.name) || `step_${Math.random().toString(36).slice(2, 7)}`,
        name: s.name.trim(),
        mode: "sequential",
        approver: s.approverType === "manager" ? { type: "manager" } : { role: s.role.trim() },
        requiredApprovals: 1,
        dueHours: s.dueHours,
      }))
      const conditions = amountGt ? { amountGt: Number(amountGt) } : {}
      const rule = await onCreated({ name, requestTypeKey, priority, escalationHours, conditions, workflowDefinition: { steps: builtSteps } } as never)
      toast.success("Workflow rule created")
      onOpenChange(false)
      // reset
      setName(""); setRequestTypeKey(""); setPriority(10); setEscalationHours(48)
      setAmountGt(""); setSteps([{ name: "", approverType: "manager", role: "", dueHours: 24 }])
      return rule
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create rule")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-[16px] p-0" data-lenis-prevent>
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="font-dm-sans text-[15px] font-semibold text-[#2C2C2A]">
            New workflow rule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pb-6 pt-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-semibold text-[#5F5E5A]">Rule name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Funds approval — above $5,000"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
            />
          </div>

          {/* Request type */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-semibold text-[#5F5E5A]">Request type</Label>
            {rtLoading ? (
              <div className="flex items-center gap-2 text-[12px] text-[#B4B2A9]">
                <Loader2 size={13} className="animate-spin" /> Loading…
              </div>
            ) : (
              <select
                value={requestTypeKey}
                onChange={(e) => setRequestTypeKey(e.target.value)}
                className="h-9 w-full rounded-[8px] border border-[#E8E6DE] bg-white px-3 text-[13px] text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="">Select a request type…</option>
                {requestTypes.map((rt) => (
                  <option key={rt.key} value={rt.key}>{rt.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Priority + escalation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-semibold text-[#5F5E5A]">Priority (lower = first)</Label>
              <Input
                type="number"
                min={1}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-semibold text-[#5F5E5A]">Escalate after (hours)</Label>
              <Input
                type="number"
                min={1}
                value={escalationHours}
                onChange={(e) => setEscalationHours(Number(e.target.value))}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </div>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-semibold text-[#5F5E5A]">
              Condition — amount greater than
              <span className="ml-1 font-normal text-[#B4B2A9]">(optional)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#B4B2A9]">$</span>
              <Input
                type="number"
                min={0}
                value={amountGt}
                onChange={(e) => setAmountGt(e.target.value)}
                placeholder="5000"
                className="h-9 rounded-[8px] border-[#E8E6DE] pl-7 text-[13px]"
              />
            </div>
          </div>

          <Separator className="bg-[#F1EFE8]" />

          {/* Steps */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#2C2C2A]">Approval steps</span>
              <button
                type="button"
                onClick={() => setSteps((p) => [...p, { name: "", approverType: "manager", role: "", dueHours: 24 }])}
                className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-semibold text-brand-teal hover:bg-brand-teal-pale"
              >
                <Plus size={11} strokeWidth={2.5} /> Add step
              </button>
            </div>
            {steps.length === 0 && (
              <p className="text-[12px] italic text-[#B4B2A9]">No steps added — add at least one.</p>
            )}
            {steps.map((s, i) => (
              <StepRow
                key={i}
                step={s}
                index={i}
                total={steps.length}
                onChange={(ns) => updateStep(i, ns)}
                onRemove={() => removeStep(i)}
                onMoveUp={() => moveStep(i, -1)}
                onMoveDown={() => moveStep(i, 1)}
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={saving || !isValid}
            className="h-10 w-full rounded-[8px] bg-brand-teal text-[13px] font-semibold text-white"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            Create rule
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Rule card ──────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: WorkflowRule
  onToggle: (r: WorkflowRule) => void
  onDelete: (publicId: string) => void
}) {
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleToggle() {
    setToggling(true)
    try {
      const updated = await updateWorkflowRule(rule.publicId, { active: !rule.active })
      onToggle(updated.responseBody.workflowRule)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update rule")
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteWorkflowRule(rule.publicId)
      onDelete(rule.publicId)
      toast.success("Rule deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete rule")
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const steps = rule.workflowDefinition.steps

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-[#E8E6DE] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-brand-teal-pale">
            <GitBranch size={14} className="text-brand-teal" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#2C2C2A]">{rule.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {rule.requestType && (
                <span className="inline-flex items-center rounded-full bg-[#F1EFE8] px-2 py-0.5 text-[10px] font-semibold capitalize text-[#5F5E5A]">
                  {rule.requestType.name}
                </span>
              )}
              <span className="text-[11px] text-[#B4B2A9]">Priority {rule.priority}</span>
              {rule.conditions?.amountGt != null && (
                <span className="inline-flex items-center rounded-full border border-[#E8E6DE] px-2 py-0.5 text-[10px] text-[#5F5E5A]">
                  Amount &gt; ${rule.conditions.amountGt.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Active toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={rule.active}
          onClick={handleToggle}
          disabled={toggling}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
            rule.active ? "bg-brand-teal" : "bg-[#E8E6DE]"
          }`}
        >
          {toggling ? (
            <Loader2 size={10} className="absolute inset-0 m-auto animate-spin text-white" />
          ) : (
            <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${rule.active ? "translate-x-4" : "translate-x-0"}`} />
          )}
        </button>
      </div>

      {/* Steps chain */}
      {steps.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 rounded-full border border-[#E8E6DE] bg-[#FAFAF8] px-2.5 py-1">
                {step.approver.type === "manager" ? (
                  <User size={10} className="text-brand-teal" />
                ) : (
                  <Users size={10} className="text-[#888780]" />
                )}
                <span className="text-[11px] font-medium text-[#5F5E5A]">{step.name}</span>
                <span className="text-[10px] text-[#B4B2A9]">{step.dueHours}h</span>
              </div>
              {i < steps.length - 1 && <ArrowRight size={10} className="shrink-0 text-[#B4B2A9]" />}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-[11px] text-[#B4B2A9]">
        <span>Escalates after {rule.escalationHours}h</span>
        <span>·</span>
        <span>Created {formatDisplayDate(rule.createdAt)}</span>
        {rule.active ? (
          <span className="flex items-center gap-1 text-[#0F6E56]">
            <CheckCircle2 size={11} /> Active
          </span>
        ) : (
          <span className="text-[#B4B2A9]">Inactive</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-[11px] text-red-500">Delete this rule?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-[4px] bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={10} className="animate-spin" /> : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[11px] text-[#5F5E5A] hover:underline"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10px] text-[#B4B2A9] hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={10} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function WorkflowRulesContent() {
  const { rules, isLoading, error, create } = useWorkflowRules()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [localRules, setLocalRules] = useState<WorkflowRule[] | null>(null)

  const displayRules = localRules ?? rules

  function handleToggle(updated: WorkflowRule) {
    setLocalRules((prev) =>
      (prev ?? rules).map((r) => (r.publicId === updated.publicId ? updated : r))
    )
  }

  function handleDelete(publicId: string) {
    setLocalRules((prev) => (prev ?? rules).filter((r) => r.publicId !== publicId))
  }

  async function handleCreate(payload: Parameters<typeof create>[0]) {
    const rule = await create(payload)
    setLocalRules((prev) => [rule, ...(prev ?? rules)])
    return rule
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#888780]">
          {isLoading ? "Loading…" : `${displayRules.length} rule${displayRules.length !== 1 ? "s" : ""}`}
        </p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white"
        >
          <Plus size={13} strokeWidth={2.5} />
          New rule
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-[13px] text-[#B4B2A9]">
          <Loader2 size={14} className="animate-spin" /> Loading workflow rules…
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {!isLoading && !error && displayRules.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#E8E6DE] text-center">
          <GitBranch size={20} className="text-[#B4B2A9]" />
          <p className="text-[13px] font-medium text-[#5F5E5A]">No workflow rules yet</p>
          <p className="text-[12px] text-[#B4B2A9]">Create a rule to define approval chains for your request types.</p>
        </div>
      )}

      {!isLoading && displayRules.length > 0 && (
        <div className="flex flex-col gap-3">
          {displayRules.map((rule) => (
            <RuleCard key={rule.publicId} rule={rule} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CreateRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreate as never}
      />
    </div>
  )
}
