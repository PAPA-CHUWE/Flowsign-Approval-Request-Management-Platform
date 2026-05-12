import { Input } from "@/components/ui/input"
import type { RequestFieldProps } from "@/types/request.types"

export function AccessRequestFields({ disabled }: RequestFieldProps) {
  return (
    <Input
      disabled={disabled}
      name="accessResource"
      placeholder="System or resource"
    />
  )
}
