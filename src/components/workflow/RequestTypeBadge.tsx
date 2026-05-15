import { REQUEST_TYPE_LABEL } from "@/constants/requestType.constants"
import type { RequestType } from "@/constants/requestType.constants"

const TYPE_STYLE: Record<RequestType, { color: string; bg: string }> = {
  general: { color: "#5F5E5A", bg: "#F1EFE8" },
  access:  { color: "#185FA5", bg: "#E6F1FB" },
  finance: { color: "#854F0B", bg: "#FAEEDA" },
  asset:   { color: "#534AB7", bg: "#EEEDFE" },
  travel:  { color: "#27500A", bg: "#EAF3DE" },
  hr:      { color: "#A32D2D", bg: "#FCEBEB" },
}

interface RequestTypeBadgeProps {
  type: RequestType
}

export function RequestTypeBadge({ type }: RequestTypeBadgeProps) {
  const style = TYPE_STYLE[type] ?? { color: "#5F5E5A", bg: "#F1EFE8" }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}
    >
      {REQUEST_TYPE_LABEL[type]}
    </span>
  )
}
