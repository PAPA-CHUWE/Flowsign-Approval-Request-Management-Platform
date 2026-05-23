"use client"

import { ChevronDown, Circle, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { TICKET_STATUS } from "@/constants/ticketStatus.constants"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const STATUS_CONFIG = {
  [TICKET_STATUS.PENDING]: {
    label: "Pending",
    color: "#854F0B",
    bg: "#FAEEDA",
    Icon: Clock,
  },
  [TICKET_STATUS.IN_REVIEW]: {
    label: "In review",
    color: "#534AB7",
    bg: "#EEEDFE",
    Icon: AlertCircle,
  },
  [TICKET_STATUS.APPROVED]: {
    label: "Approved",
    color: "#27500A",
    bg: "#EAF3DE",
    Icon: CheckCircle2,
  },
  [TICKET_STATUS.REJECTED]: {
    label: "Rejected",
    color: "#A32D2D",
    bg: "#FCEBEB",
    Icon: XCircle,
  },
  [TICKET_STATUS.OPEN]: {
    label: "Open",
    color: "#185FA5",
    bg: "#E6F1FB",
    Icon: Circle,
  },
} as const

export type StatusKey = keyof typeof STATUS_CONFIG

interface StatusDropdownProps {
  value: StatusKey
  onChange: (v: StatusKey) => void
  disabled?: boolean
}

const FALLBACK_CONFIG = {
  label: "Unknown",
  color: "#888780",
  bg: "#F1EFE8",
  Icon: Circle,
}

export function StatusDropdown({ value, onChange, disabled }: StatusDropdownProps) {
  const cfg = STATUS_CONFIG[value] ?? FALLBACK_CONFIG

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 h-7 px-2 rounded-full",
          "text-[11px] font-semibold transition-all duration-150",
          "border border-transparent outline-none focus-visible:outline-none",
          !disabled && "hover:opacity-80 cursor-pointer",
          disabled && "cursor-default",
        )}
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <cfg.Icon size={11} strokeWidth={2.5} />
        {cfg.label}
        {!disabled && <ChevronDown size={10} strokeWidth={2.5} />}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-36">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Select status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((s) => {
            const c = STATUS_CONFIG[s]
            const sel = s === value
            return (
              <DropdownMenuItem
                key={s}
                onClick={() => onChange(s)}
                className={cn(
                  "text-[12px] font-medium cursor-pointer",
                  sel && "text-white! focus:text-white!",
                )}
                style={sel ? { background: c.color } : {}}
              >
                <c.Icon size={12} strokeWidth={2.5} color={sel ? "#fff" : c.color} />
                {c.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
