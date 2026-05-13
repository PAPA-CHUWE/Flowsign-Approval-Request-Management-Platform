import {
  Coins, Plane, Laptop, KeyRound, UserCog, Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  REQUEST_TYPE,
  REQUEST_TYPE_LABEL,
  type RequestType,
} from "@/constants/requestType.constants"

const TYPE_META: Record<RequestType, { Icon: React.ElementType; color: string; pale: string }> = {
  [REQUEST_TYPE.FINANCE]: { Icon: Coins,    color: "#854F0B", pale: "#FAEEDA" },
  [REQUEST_TYPE.TRAVEL]:  { Icon: Plane,    color: "#185FA5", pale: "#E6F1FB" },
  [REQUEST_TYPE.ASSET]:   { Icon: Laptop,   color: "#534AB7", pale: "#EEEDFE" },
  [REQUEST_TYPE.ACCESS]:  { Icon: KeyRound, color: "#0F6E56", pale: "#E1F5EE" },
  [REQUEST_TYPE.HR]:      { Icon: UserCog,  color: "#993556", pale: "#FBEAF0" },
  [REQUEST_TYPE.GENERAL]: { Icon: Layers,   color: "#5F5E5A", pale: "#F1EFE8" },
}

interface RequestTypeSelectorProps {
  value: RequestType
  onChange: (t: RequestType) => void
  disabled?: boolean
}

export function RequestTypeSelector({ value, onChange, disabled }: RequestTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.values(REQUEST_TYPE).map((rt) => {
        const { Icon, color, pale } = TYPE_META[rt]
        const active = value === rt
        return (
          <Button
            key={rt}
            type="button"
            onClick={() => onChange(rt)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 h-9 px-3.5 rounded-[8px]",
              "text-[13px] font-semibold border transition-all duration-150 cursor-pointer"
            )}
            style={active
              ? { background: color, borderColor: color, color: "#fff" }
              : { background: pale, borderColor: "transparent", color }
            }
          >
            <Icon size={14} strokeWidth={2} />
            {REQUEST_TYPE_LABEL[rt]}
          </Button>
        )
      })}
    </div>
  )
}
