import type { RequestType } from "@/constants/requestType.constants"

export interface RequestFormValues {
  type: RequestType
  requesterName: string
  requesterEmail: string
  summary: string
  details: string
}

export interface RequestFieldProps {
  disabled?: boolean
}
