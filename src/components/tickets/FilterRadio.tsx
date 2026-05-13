import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FilterRadioProps {
  label: string
  value: string
  current: string
  onChange: (v: string) => void
}

export function FilterRadio({ label, value, current, onChange }: FilterRadioProps) {
  const active = current === value
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={() => onChange(value)}
      className={cn(
        "flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium cursor-pointer",
        active
          ? "bg-brand-teal border-brand-teal text-white hover:bg-brand-teal/90"
          : "bg-white border-[#E8E6DE] text-brand-neutral-mid hover:border-brand-teal-light hover:bg-brand-neutral-pale"
      )}
    >
      <div className={cn(
        "h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0",
        active ? "border-white bg-white" : "border-brand-neutral-light bg-white"
      )}>
        {active && <div className="h-1.5 w-1.5 rounded-full bg-brand-teal" />}
      </div>
      {label}
    </Button>
  )
}
