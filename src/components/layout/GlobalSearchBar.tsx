"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2, Search, User, X } from "lucide-react"
import { globalSearch, getSearchSuggestions, type SearchResultRequest } from "@/lib/api/search"

// ── Debounce ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

// ── Status pill colour ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  draft:     "#5F5E5A",
  pending:   "#854F0B",
  in_review: "#534AB7",
  approved:  "#27500A",
  rejected:  "#A32D2D",
}

function StatusDot({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "#888780"
  return (
    <span
      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function GlobalSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<SearchResultRequest[]>([])
  const [users, setUsers] = useState<{ publicId: string; name: string; email: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query.trim(), 280)

  // Fetch full search results when debounced query is ready
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return
    let ignore = false
    globalSearch({ q: debouncedQuery, types: "requests,users", limit: 10 })
      .then((res) => {
        if (ignore) return
        setResults(res.responseBody.results.requests ?? [])
        setUsers(res.responseBody.results.users ?? [])
      })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [debouncedQuery])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const allItems = [
    ...results.map((r) => ({ type: "request" as const, item: r })),
    ...users.map((u) => ({ type: "user" as const, item: u })),
  ]

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && allItems[activeIdx]) {
        handleSelect(allItems[activeIdx])
      } else if (query.trim()) {
        router.push(`/requests?q=${encodeURIComponent(query.trim())}`)
        setOpen(false)
      }
    }
  }

  function handleSelect(entry: (typeof allItems)[number]) {
    if (entry.type === "request") {
      router.push(`/requests?highlight=${entry.item.publicId}`)
    } else {
      router.push(`/users`)
    }
    setOpen(false)
    setQuery("")
  }

  function clear() {
    setQuery("")
    setResults([])
    setUsers([])
    setOpen(false)
    setActiveIdx(-1)
    inputRef.current?.focus()
  }

  const hasResults = results.length > 0 || users.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-[320px]">
      {/* Input */}
      <div className={`flex h-9 items-center gap-2 rounded-[10px] border bg-[#FAFAF8] px-3 transition-colors ${open ? "border-brand-teal ring-2 ring-brand-teal/20" : "border-[#E8E6DE]"}`}>
        {loading ? (
          <Loader2 size={14} className="shrink-0 animate-spin text-brand-teal" />
        ) : (
          <Search size={14} className="shrink-0text-[#888780]" color="#888780" strokeWidth={2} />
        )}
        <input
          ref={inputRef}
          value={query}
          onFocus={() => { if (query.trim().length >= 2) setOpen(true) }}
          onChange={(e) => {
            const val = e.target.value
            setQuery(val)
            const trimmed = val.trim()
            if (trimmed.length >= 2) { setOpen(true); setActiveIdx(-1); setLoading(true) }
            else { setOpen(false); setActiveIdx(-1); setResults([]); setUsers([]); setLoading(false) }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="min-w-0 flex-1 bg-transparent font-dm-sans text-[13px] text-brand-neutral-dark outline-none placeholder:text-[#B4B2A9]"
        />
        {query && (
          <button type="button" onClick={clear} className="shrink-0 text-[#B4B2A9] hover:text-[#5F5E5A]">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[360px] overflow-hidden rounded-[12px] border border-[#E8E6DE] bg-white shadow-lg"
          data-lenis-prevent
        >
          {!hasResults && !loading && (
            <div className="flex items-center gap-2 px-4 py-6 text-[12px] text-[#B4B2A9]">
              <Search size={14} />
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="border-b border-[#F1EFE8] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
                Requests
              </p>
              {results.map((r, i) => {
                const idx = i
                return (
                  <button
                    key={r.publicId}
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => handleSelect({ type: "request", item: r })}
                    className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? "bg-[#F5FBF8]" : "hover:bg-[#FAFAF8]"}`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-brand-teal-pale mt-0.5">
                      <FileText size={11} className="text-brand-teal" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={r.status} />
                        <p className="truncate text-[12px] font-semibold text-[#2C2C2A]">{r.title}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#B4B2A9]">
                        {r.requestKey} · {r.requestType.name} · {r.requester.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {users.length > 0 && (
            <div className={results.length > 0 ? "border-t border-[#F1EFE8]" : ""}>
              <p className="border-b border-[#F1EFE8] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
                Users
              </p>
              {users.map((u, i) => {
                const idx = results.length + i
                return (
                  <button
                    key={u.publicId}
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => handleSelect({ type: "user", item: u })}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? "bg-[#F5FBF8]" : "hover:bg-[#FAFAF8]"}`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[9px] font-bold text-brand-teal">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-[#2C2C2A]">{u.name}</p>
                      <p className="truncate text-[10px] text-[#B4B2A9]">{u.email}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Footer — full results link */}
          {hasResults && (
            <div className="border-t border-[#F1EFE8] px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  router.push(`/requests?q=${encodeURIComponent(query.trim())}`)
                  setOpen(false)
                }}
                className="text-[11px] font-semibold text-brand-teal hover:underline"
              >
                See all results for &ldquo;{query}&rdquo; →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
