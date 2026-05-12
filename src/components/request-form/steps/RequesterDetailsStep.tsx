import { Input } from "@/components/ui/input"

interface RequesterDetailsStepProps {
  disabled?: boolean
}

export function RequesterDetailsStep({ disabled }: RequesterDetailsStepProps) {
  return (
    <div className="grid gap-3">
      <Input disabled={disabled} name="requesterName" placeholder="Name" />
      <Input
        disabled={disabled}
        name="requesterEmail"
        placeholder="Email"
        type="email"
      />
    </div>
  )
}
