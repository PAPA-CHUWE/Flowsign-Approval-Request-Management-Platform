import {
  Banknote,
  BarChart3,
  Car,
  ClipboardList,
  KeyRound,
  Laptop,
  Layers,
  Plane,
  UserCog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  REQUEST_TYPE,
  REQUEST_TYPE_LABEL,
  type RequestType,
} from "@/constants/requestType.constants"
import type { OrganizationRequestType } from "@/lib/api/request-types"
import { cn } from "@/lib/utils"

export const TYPE_META: Record<string, { Icon: React.ElementType; color: string; pale: string }> = {
  general: { Icon: ClipboardList, color: "#5F5E5A", pale: "#F1EFE8" },
  funds:   { Icon: Banknote,      color: "#854F0B", pale: "#FAEEDA" },
  finance: { Icon: BarChart3,     color: "#854F0B", pale: "#FAEEDA" },
  travel:  { Icon: Plane,         color: "#185FA5", pale: "#E6F1FB" },
  asset:   { Icon: Laptop,        color: "#534AB7", pale: "#EEEDFE" },
  access:  { Icon: KeyRound,      color: "#0F6E56", pale: "#E1F5EE" },
  hr:      { Icon: UserCog,       color: "#993556", pale: "#FBEAF0" },
  vehicle: { Icon: Car,           color: "#185FA5", pale: "#E6F1FB" },
  custom:  { Icon: Layers,        color: "#5F5E5A", pale: "#F1EFE8" },
}

const FALLBACK_TYPES = Object.values(REQUEST_TYPE).map((key) => ({
  key,
  name: REQUEST_TYPE_LABEL[key as RequestType],
  category: key,
  description: "",
}))

type RequestTypeLike = Pick<OrganizationRequestType, "key" | "name" | "category" | "description">

interface RequestTypeSelectorProps {
  value: string
  onChange: (type: string) => void
  requestTypes?: RequestTypeLike[]
  disabled?: boolean
  /** "pills" = compact button row (default); "cards" = full description cards */
  variant?: "pills" | "cards"
}

export function getMeta(type: Pick<OrganizationRequestType, "key" | "category">) {
  return TYPE_META[type.key] ?? TYPE_META[type.category] ?? TYPE_META.custom
}

export function RequestTypeSelector({
  value,
  onChange,
  requestTypes,
  disabled,
  variant = "pills",
}: RequestTypeSelectorProps) {
  const types = requestTypes?.length ? requestTypes : FALLBACK_TYPES

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {types.map((requestType) => {
          const { Icon, color, pale } = getMeta(requestType)
          const active = value === requestType.key

          return (
            <button
              key={requestType.key}
              type="button"
              onClick={() => onChange(requestType.key)}
              disabled={disabled}
              className={cn(
                "flex items-start gap-3 rounded-[12px] border p-4 text-left transition-all duration-150",
                active
                  ? "border-[#1D9E75] bg-[#F0FAF6] shadow-sm"
                  : "border-[#E8E6DE] bg-white hover:border-[#B0D9CB] hover:shadow-sm",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: pale }}
              >
                <Icon size={16} strokeWidth={2} style={{ color }} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-[#2C2C2A]">
                  {requestType.name}
                </span>
                {requestType.description && (
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-[#888780]">
                    {requestType.description}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // Default pills variant
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
