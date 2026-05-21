import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"

const STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "#27500A",
    bg: "#EAF3DE",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    color: "#854F0B",
    bg: "#FAEEDA",
    Icon: Clock,
  },
  invited: {
    label: "Invited",
    color: "#534AB7",
    bg: "#EEEDFE",
    Icon: Clock,
  },
  inactive: {
    label: "Inactive",
    color: "#5F5E5A",
    bg: "#F1EFE8",
    Icon: AlertCircle,
  },
  deactivated: {
    label: "Deactivated",
    color: "#A32D2D",
    bg: "#FCEBEB",
    Icon: XCircle,
  },
} as const

interface UserStatusPillProps {
  status: string
}

export function UserStatusPill({ status }: UserStatusPillProps) {
  const key = status.toLowerCase() as keyof typeof STATUS_CONFIG
  const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.inactive

  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <cfg.Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  )
}
