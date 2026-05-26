import { Label } from "@/components/ui/label"

interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, required, hint, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label className="text-[12px] font-medium text-[#888780]">
          {label}
          {required && <span className="text-[#0F6E56] ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {error
        ? <p className="text-[11px] font-medium text-[#A32D2D]">{error}</p>
        : hint
          ? <p className="text-[11px] text-[#B4B2A9]">{hint}</p>
          : null}
    </div>
  )
}
