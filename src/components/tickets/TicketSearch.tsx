import { Search } from "lucide-react"

interface TicketSearchProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function TicketSearch({ value, onChange, placeholder = "Search tickets…" }: TicketSearchProps) {
  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-[#E8E6DE] bg-white px-3 h-9 w-full sm:w-[220px]">
      <Search size={14} color="#B4B2A9" strokeWidth={2} />
      <input
        className="flex-1 bg-transparent text-[13px] text-brand-neutral-dark placeholder:text-[#B4B2A9] outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
