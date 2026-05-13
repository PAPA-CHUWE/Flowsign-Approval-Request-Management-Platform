import { Lock, Globe, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Visibility = "private" | "approvers" | "org"

const VIS_OPTIONS: {
  value: Visibility
  Icon: React.ElementType
  label: string
  desc: string
}[] = [
  { value: "private",   Icon: Lock,  label: "Private",        desc: "Only you and assigned approvers" },
  { value: "approvers", Icon: Users, label: "Approvers only", desc: "All users in the approval chain"  },
  { value: "org",       Icon: Globe, label: "Organisation",   desc: "Anyone in your organisation"      },
]

interface VisibilityPickerProps {
  value: Visibility
  onChange: (v: Visibility) => void
  disabled?: boolean
}

export function VisibilityPicker({ value, onChange, disabled }: VisibilityPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {VIS_OPTIONS.map((opt) => {
        const active = value === opt.value
        return (
          <Button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-[10px] h-auto",
              "border text-left transition-all duration-150 cursor-pointer justify-start",
              active
                ? "border-[#1D9E75] bg-[#E1F5EE]"
                : "border-[#E8E6DE] bg-white hover:border-[#D3D1C7] hover:bg-[#F1EFE8]"
            )}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[8px] shrink-0",
              active ? "bg-[#0F6E56]" : "bg-[#F1EFE8]"
            )}>
              <opt.Icon size={15} color={active ? "#fff" : "#888780"} strokeWidth={1.8} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn("text-[13px] font-semibold", active ? "text-[#0F6E56]" : "text-[#2C2C2A]")}>
                {opt.label}
              </p>
              <p className="text-[11px] text-[#888780] leading-[1.4]">{opt.desc}</p>
            </div>

            <div className={cn(
              "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
              active ? "border-[#0F6E56] bg-[#0F6E56]" : "border-[#D3D1C7] bg-white"
            )}>
              {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
          </Button>
        )
      })}
    </div>
  )
}
