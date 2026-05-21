import {
  Coins,
  Plane,
  Laptop,
  KeyRound,
  UserCog,
  Layers,
  Boxes,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  REQUEST_TYPE,
  REQUEST_TYPE_LABEL,
  type RequestType,
} from "@/constants/requestType.constants"
import type { OrganizationRequestType } from "@/lib/api/request-types"
import { cn } from "@/lib/utils"

const TYPE_META: Record<string, { Icon: React.ElementType; color: string; pale: string }> = {
  finance: { Icon: Coins,    color: "#854F0B", pale: "#FAEEDA" },
  funds:   { Icon: Coins,    color: "#854F0B", pale: "#FAEEDA" },
  travel:  { Icon: Plane,    color: "#185FA5", pale: "#E6F1FB" },
  asset:   { Icon: Laptop,   color: "#534AB7", pale: "#EEEDFE" },
  access:  { Icon: KeyRound, color: "#0F6E56", pale: "#E1F5EE" },
  hr:      { Icon: UserCog,  color: "#993556", pale: "#FBEAF0" },
  general: { Icon: Layers,   color: "#5F5E5A", pale: "#F1EFE8" },
  custom:  { Icon: Boxes,    color: "#5F5E5A", pale: "#F1EFE8" },
}

const FALLBACK_TYPES = Object.values(REQUEST_TYPE).map((key) => ({
  key,
  name: REQUEST_TYPE_LABEL[key as RequestType],
  category: key,
  description: "",
}))

interface RequestTypeSelectorProps {
  value: string
  onChange: (type: string) => void
  requestTypes?: Pick<OrganizationRequestType, "key" | "name" | "category" | "description">[]
  disabled?: boolean
}

function getMeta(type: Pick<OrganizationRequestType, "key" | "category">) {
  return TYPE_META[type.key] ?? TYPE_META[type.category] ?? TYPE_META.custom
}

export function RequestTypeSelector({
  value,
  onChange,
  requestTypes,
  disabled,
}: RequestTypeSelectorProps) {
  const types = requestTypes?.length ? requestTypes : FALLBACK_TYPES

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((requestType) => {
        const { Icon, color, pale } = getMeta(requestType)
        const active = value === requestType.key

        return (
          <Button
            key={requestType.key}
            type="button"
            title={requestType.description || requestType.name}
            onClick={() => onChange(requestType.key)}
            disabled={disabled}
            className={cn(
              "flex h-9 items-center gap-2 rounded-[8px] px-3.5",
              "cursor-pointer border text-[13px] font-semibold transition-all duration-150"
            )}
            style={
              active
                ? { background: color, borderColor: color, color: "#fff" }
                : { background: pale, borderColor: "transparent", color }
            }
          >
            <Icon size={14} strokeWidth={2} />
            {requestType.name}
          </Button>
        )
      })}
    </div>
  )
}
