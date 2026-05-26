"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronDown, Loader2, RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getOrgMembers, type OrgMember } from "@/lib/api/users"
import { FormField } from "./FormField"

// ── Person type (re-exported for form compatibility) ──────────────────────────

export interface Person {
  id: string
  name: string
  role: string
  initials: string
  status?: "active" | "invited"
}

// ── Avatar colour — deterministic per publicId ────────────────────────────────

const AVATAR_COLORS = [
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#F3E8FF", text: "#6B21A8" },
  { bg: "#FFEDD5", text: "#C2410C" },
  { bg: "#DCFCE7", text: "#166534" },
  { bg: "#FCE7F3", text: "#9D174D" },
]

function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function memberToPerson(m: OrgMember): Person {
  const name = `${m.firstName} ${m.lastName}`.trim() || m.email
  return {
    id:       m.publicId,
    name,
    role:     m.title ?? m.department ?? "",
    initials: `${(m.firstName[0] ?? "").toUpperCase()}${(m.lastName[0] ?? "").toUpperCase()}`,
    status:   m.status,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ person }: { person: Person }) {
  const { bg, text } = avatarColor(person.id)
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
      style={{ background: bg, color: text }}
    >
      {person.initials}
    </span>
  )
}

function PendingBadge() {
  return (
    <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 ring-1 ring-amber-200">
      Pending
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-[#F1EFE8]" />
      <div className="flex flex-col gap-1">
        <div className="h-3 w-28 animate-pulse rounded bg-[#F1EFE8]" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-[#F1EFE8]" />
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PeoplePickerProps {
  label: string
  required?: boolean
  selected: Person[]
  onChange: (p: Person[]) => void
  placeholder?: string
  disabled?: boolean
}

// ── Main component ────────────────────────────────────────────────────────────

export function PeoplePicker({
  label,
  required,
  selected,
  onChange,
  placeholder = "Search people…",
  disabled,
}: PeoplePickerProps) {
  const [query,        setQuery]        = useState("")
  const [open,         setOpen]         = useState(false)
  const [results,      setResults]      = useState<Person[]>([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(false)
  const [focusedIdx,   setFocusedIdx]   = useState(-1)
  const [lastQuery,    setLastQuery]    = useState<string | undefined>(undefined)

  const containerRef  = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const listRef       = useRef<HTMLUListElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch members ──────────────────────────────────────────────────────────

  const fetchMembers = useCallback(async (q: string | undefined) => {
    setLoading(true)
    setError(false)
    setLastQuery(q)
    try {
      const members = await getOrgMembers(q)
      setResults(members.map(memberToPerson))
    } catch {
      setError(true)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Open picker ────────────────────────────────────────────────────────────

  function handleOpen() {
    if (disabled) return
    setOpen(true)
    setFocusedIdx(-1)
    if (results.length === 0 && !loading) fetchMembers(undefined)
  }

  // ── Query change (debounced) ───────────────────────────────────────────────

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    setOpen(true)
    setFocusedIdx(-1)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchMembers(val || undefined), 300)
  }

  // ── Toggle selection ───────────────────────────────────────────────────────

  function toggle(person: Person) {
    const isSelected = selected.some((s) => s.id === person.id)
    onChange(isSelected ? selected.filter((s) => s.id !== person.id) : [...selected, person])
    // keep dropdown open for multi-select
    inputRef.current?.focus()
  }

  // ── Click outside ─────────────────────────────────────────────────────────

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  // ── Keyboard navigation ───────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") handleOpen()
      return
    }
    const total = visible.length
    if (e.key === "Escape") { setOpen(false); return }
    if (e.key === "Tab")    { setOpen(false); return }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIdx((i) => Math.min(i + 1, total - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && focusedIdx >= 0) {
      e.preventDefault()
      if (visible[focusedIdx]) toggle(visible[focusedIdx])
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIdx >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIdx] as HTMLElement | undefined
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [focusedIdx])

  // ── Filtered visible list ──────────────────────────────────────────────────

  const visible = results

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <FormField label={label} required={required}>
      <div ref={containerRef} className="relative flex flex-col gap-2">

        {/* Search input */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            placeholder={placeholder}
            value={query}
            disabled={disabled}
            onChange={handleQueryChange}
            onFocus={handleOpen}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-10 w-full rounded-[8px] border border-[#E8E6DE] bg-[#FAFAF8] pl-3 pr-8",
              "text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9]",
              "focus:border-[#1D9E75] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E1F5EE]",
              "transition-all duration-150",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
          <span className="pointer-events-none absolute right-2.5 flex items-center">
            {loading
              ? <Loader2 size={13} className="animate-spin text-[#B4B2A9]" />
              : <ChevronDown size={13} className="text-[#B4B2A9]" />}
          </span>
        </div>

        {/* Dropdown */}
        {open && !disabled && (
          <div className="absolute top-[calc(100%-0.5rem)] left-0 right-0 z-30 mt-1.5 overflow-hidden rounded-[10px] border border-[#E8E6DE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-52 overflow-y-auto py-1"
              data-lenis-prevent
            >
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : error ? (
                <li className="flex flex-col items-center gap-2 px-3 py-4 text-center">
                  <p className="text-[12px] text-[#888780]">Couldn&apos;t load members.</p>
                  <button
                    type="button"
                    onClick={() => fetchMembers(lastQuery)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0F6E56] hover:underline"
                  >
                    <RefreshCw size={10} /> Try again
                  </button>
                </li>
              ) : visible.length === 0 ? (
                <li className="px-3 py-3 text-[12px] text-[#B4B2A9]">
                  {query ? `No members found for "${query}"` : "No members available."}
                </li>
              ) : (
                visible.map((person, idx) => {
                  const isSelected = selected.some((s) => s.id === person.id)
                  const isFocused  = idx === focusedIdx
                  const { bg, text } = avatarColor(person.id)
                  return (
                    <li
                      key={person.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggle(person)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 px-3 py-2.5 transition-colors",
                        isFocused ? "bg-[#F5FBF8]" : "hover:bg-[#F5FBF8]",
                        isSelected && "bg-[#F0FAF6]"
                      )}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: bg, color: text }}
                      >
                        {person.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-[#2C2C2A]">
                          {person.name}
                        </span>
                        {person.role && (
                          <span className="block truncate text-[11px] text-[#888780]">
                            {person.role}
                          </span>
                        )}
                      </span>
                      {person.status === "invited" && <PendingBadge />}
                      {isSelected && (
                        <span className="ml-1 shrink-0 text-[#0F6E56]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((person) => {
              const { bg, text } = avatarColor(person.id)
              return (
                <div
                  key={person.id}
                  className="flex h-7 max-w-full items-center gap-1.5 rounded-full border border-[#D3D1C7] bg-white pl-1 pr-1.5"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: bg, color: text }}
                  >
                    {person.initials}
                  </span>
                  <span className="max-w-[120px] truncate text-[12px] font-medium text-[#2C2C2A]">
                    {person.name}
                  </span>
                  {person.status === "invited" && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-1 text-[9px] font-semibold text-amber-600">
                      Pending
                    </span>
                  )}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => onChange(selected.filter((s) => s.id !== person.id))}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[#B4B2A9] hover:bg-[#F1EFE8] hover:text-[#2C2C2A]"
                    >
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </FormField>
  )
}
