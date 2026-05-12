import { Textarea } from "@/components/ui/textarea"
import type { RequestFieldProps } from "@/types/request.types"

export function GeneralRequestFields({ disabled }: RequestFieldProps) {
  return (
    <Textarea
      disabled={disabled}
      name="details"
      placeholder="Describe the request"
    />
  )
}
