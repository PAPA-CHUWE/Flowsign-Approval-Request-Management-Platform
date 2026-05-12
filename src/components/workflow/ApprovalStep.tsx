import type { ApprovalStep as ApprovalStepType } from "@/types/approval.types"

interface ApprovalStepProps {
  step: ApprovalStepType
}

export function ApprovalStep({ step }: ApprovalStepProps) {
  return (
    <li className="grid gap-1 border-l pl-3">
      <span className="text-sm font-medium">{step.label}</span>
      <span className="text-xs text-muted-foreground">{step.ownerName}</span>
    </li>
  )
}
