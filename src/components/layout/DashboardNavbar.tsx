"use client"

import { Bell, CheckCheck, Loader2, Trash2, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar"
import { getUserInitials, useCurrentUser } from "@/hooks/use-current-user"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/lib/api/notifications"
import { formatRelativeTime } from "@/lib/format/date"

// ── Notification type → colour ────────────────────────────────────────────────

const TYPE_DOT: Record<string, string> = {
  approval:       "bg-brand-teal",
  approved:       "bg-[#27A25A]",
  rejected:       "bg-red-500",
  comment:        "bg-[#534AB7]",
  mention:        "bg-amber-500",
  reminder:       "bg-amber-400",
  escalation:     "bg-red-400",
  status_update:  "bg-[#185FA5]",
}
function dotColor(n: Notification) {
  const type = (n.metadata?.type as string | undefined) ?? ""
  return TYPE_DOT[type.toLowerCase()] ?? "bg-[#888780]"
}

// ── Single notification row ───────────────────────────────────────────────────

function NotifRow({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF8] ${
        notif.status === "unread" ? "bg-[#F5FBF8]" : ""
      }`}
      onClick={() => { if (notif.status === "unread") onRead(notif.publicId) }}
      role={notif.status === "unread" ? "button" : undefined}
      style={{ cursor: notif.status === "unread" ? "pointer" : "default" }}
    >
      {/* Colour dot */}
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor(notif)} ${notif.status === "read" ? "opacity-30" : ""}`} />

      <div className="min-w-0 flex-1">
        <p className={`text-[12px] font-semibold leading-snug ${notif.status === "read" ? "text-[#888780]" : "text-[#2C2C2A]"}`}>
          {notif.title}
        </p>
        {notif.body && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-[#B4B2A9]">{notif.body}</p>
        )}
        <p className="mt-1 text-[10px] text-[#D3D1C7]">{formatRelativeTime(notif.createdAt)}</p>
      </div>

      {/* Delete on hover */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(notif.publicId) }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-[#D3D1C7] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
      >
        <X size={11} />
      </button>
    </div>
  )
}

// ── Bell button + popover ─────────────────────────────────────────────────────

function NotificationBell() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead, remove } = useNotifications()

  return (
    <Popover>
      <PopoverTrigger className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] transition-colors duration-150 hover:bg-brand-teal-pale">
        <Bell size={16} color="#5F5E5A" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-brand-teal px-0.5 text-[8px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] rounded-[14px] border border-[#E8E6DE] p-0 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E6DE] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-dm-sans text-[13px] font-semibold text-[#2C2C2A]">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-teal px-1.5 py-0.5 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-teal hover:underline"
            >
              <CheckCheck size={11} />
              Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[380px] overflow-y-auto" data-lenis-prevent>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-[#B4B2A9]">
              <Loader2 size={13} className="animate-spin" /> Loading…
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <Bell size={22} className="text-[#D3D1C7]" />
              <p className="text-[12px] text-[#B4B2A9]">You&apos;re all caught up</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F1EFE8]">
              {notifications.map((n) => (
                <NotifRow
                  key={n.publicId}
                  notif={n}
                  onRead={markRead}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export function DashboardNavbar() {
  const { user } = useCurrentUser()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E8E6DE] bg-white px-4 sm:px-6">
      <GlobalSearchBar />

      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        <div className="flex h-9 w-9 select-none items-center justify-center rounded-full bg-brand-teal-pale text-[12px] font-bold text-brand-teal">
          {getUserInitials(user)}
        </div>
      </div>
    </header>
  )
}
