import { Badge } from "@/components/ui/badge"

const PRIORITY_CONFIG = {
  P1: { label: "P1", color: "#A32D2D", bg: "#FCEBEB" },
  P2: { label: "P2", color: "#854F0B", bg: "#FAEEDA" },
  P3: { label: "P3", color: "#27500A", bg: "#EAF3DE" },
} as const

export type Priority = keyof typeof PRIORITY_CONFIG

interface PriorityBadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <Badge
      className="h-6 w-8 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </Badge>
  )
}
