import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

interface SortIconProps {
  col?: string
  active: boolean
  dir: "asc" | "desc"
}

export function SortIcon({ active, dir }: SortIconProps) {
  if (!active) return <ChevronsUpDown size={12} color="#B4B2A9" strokeWidth={2} />
  return dir === "asc"
    ? <ChevronUp   size={12} color="#0F6E56" strokeWidth={2.5} />
    : <ChevronDown size={12} color="#0F6E56" strokeWidth={2.5} />
}
