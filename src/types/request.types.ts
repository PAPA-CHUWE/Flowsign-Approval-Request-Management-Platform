export interface RequestFormValues {
  type: string
  requesterName: string
  requesterEmail: string
  summary: string
  details: string
  data?: Record<string, string>
}

export interface RequestFieldProps {
  disabled?: boolean
}
