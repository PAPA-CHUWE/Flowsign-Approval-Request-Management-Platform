import { Input } from "@/components/ui/input"
import type { RequestFieldProps } from "@/types/request.types"

export function FinanceRequestFields({ disabled }: RequestFieldProps) {
  return (
    <Input
      disabled={disabled}
      name="amount"
      placeholder="Amount"
      type="number"
    />
  )
}
