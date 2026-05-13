"use client"

import { useEffect, useRef, useState } from "react"
import { UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MOCK_PEOPLE, type Person } from "@/constants/mockPeople.constants"
import { FormField } from "./FormField"

export type { Person }

interface PeoplePickerProps {
  label: string
  required?: boolean
  selected: Person[]
  onChange: (p: Person[]) => void
  placeholder: string
  disabled?: boolean
}

export function PeoplePicker({
  label, required, selected, onChange, placeholder, disabled,
}: PeoplePickerProps) {
  const [query, setQuery] = useState("")
  const [open,  setOpen]  = useState(false)
  const ref               = useRef<HTMLDivElement>(null)

  const filtered = MOCK_PEOPLE.filter(
    (p) => !selected.find((s) => s.id === p.id) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
       p.role.toLowerCase().includes(query.toLowerCase()))
  )

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const add    = (p: Person) => { onChange([...selected, p]); setQuery(""); setOpen(false) }
  const remove = (id: string) => onChange(selected.filter((p) => p.id !== id))

  return (
    <FormField label={label} required={required}>
      <div ref={ref} className="relative">

        {/* Chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selected.map((p) => (
              <div key={p.id}
                className="flex items-center gap-1.5 h-7 pl-1.5 pr-2 rounded-full bg-[#E1F5EE] border border-[#9FE1CB]">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F6E56] text-[9px] font-bold text-white shrink-0">
                  {p.initials}
                </div>
                <span className="text-[12px] font-medium text-[#0F6E56]">{p.name}</span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(p.id)}
                    className="text-[#9FE1CB] hover:text-[#0F6E56] h-auto w-auto p-0 ml-0.5 cursor-pointer"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <UserPlus size={13} color="#B4B2A9" strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            disabled={disabled}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            className={cn(
              "w-full h-10 pl-8 pr-3 rounded-[8px]",
              "border border-[#E8E6DE] bg-[#FAFAF8]",
              "text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9]",
              "focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE] focus:bg-white",
              "outline-none transition-all duration-150",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Dropdown */}
        {open && filtered.length > 0 && !disabled && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-[#E8E6DE] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-48 overflow-y-auto">
            {filtered.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="ghost"
                onClick={() => add(p)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 h-auto rounded-none text-left justify-start cursor-pointer hover:bg-[#F1EFE8]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E1F5EE] text-[11px] font-bold text-[#0F6E56] shrink-0">
                  {p.initials}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#2C2C2A]">{p.name}</p>
                  <p className="text-[11px] text-[#888780]">{p.role}</p>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </FormField>
  )
}
