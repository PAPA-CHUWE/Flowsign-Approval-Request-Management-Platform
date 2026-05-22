"use client"

import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarDays,
  Fingerprint,
  Loader2,
  Phone,
  Power,
  PowerOff,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react"
import type { ElementType } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { getUserInitials } from "@/hooks/use-current-user"
import type { OrganizationUser } from "@/lib/api/users"
import { UserStatusPill } from "./UserStatusPill"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRole(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getDisplayName(user: OrganizationUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return value
  }
}

// ─── MetaRow ──────────────────────────────────────────────────────────────────

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#F7F6F2]">
        <Icon size={13} className="text-[#888780]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface UserDrawerProps {
  user: OrganizationUser | null
  open: boolean
  isLoading?: boolean
  error?: string
  onClose: () => void
  onEditRoles: (user: OrganizationUser) => void
  onStatusChange: (user: OrganizationUser) => void
  onDelete: (user: OrganizationUser) => void
}

export function UserDrawer({
  user,
  open,
  isLoading = false,
  error = "",
  onClose,
  onEditRoles,
  onStatusChange,
  onDelete,
}: UserDrawerProps) {
  const isDeactivated = user?.status.toLowerCase() === "deactivated"
  const StatusIcon = isDeactivated ? Power : PowerOff

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[460px]"
      >
        {/* ── Loading state ── */}
        {isLoading && !user && (
          <div className="flex flex-1 flex-col gap-0">
            <SheetHeader className="gap-2 border-b border-[#E8E6DE] px-6 py-5">
              <div className="flex items-center gap-3 pr-8">
                <div className="h-10 w-10 animate-pulse rounded-full bg-[#F1EFE8]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 animate-pulse rounded bg-[#F1EFE8]" />
                  <div className="h-3 w-48 animate-pulse rounded bg-[#F1EFE8]" />
                </div>
              </div>
              <SheetTitle className="sr-only">Loading user</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[#B4B2A9]" />
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !user && (
          <div className="flex flex-1 flex-col gap-0">
            <SheetHeader className="border-b border-[#E8E6DE] px-6 py-5">
              <SheetTitle className="text-[16px] font-semibold text-[#2C2C2A]">
                User details
              </SheetTitle>
            </SheetHeader>
            <div className="px-6 py-5">
              <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Loaded state ── */}
        {user && (
          <>
            {/* Header */}
            <SheetHeader className="gap-3 border-b border-[#E8E6DE] px-6 py-5">
              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[12px] font-bold text-brand-teal">
                  {getUserInitials(user)}
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-[16px] font-semibold leading-snug text-[#2C2C2A]">
                    {getDisplayName(user)}
                  </SheetTitle>
                  <p className="truncate text-[12px] text-[#888780]">{user.email}</p>
                </div>
                <UserStatusPill status={user.status} />
              </div>
            </SheetHeader>

            {/* Scrollable body */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto">
              {/* Profile section */}
              <div className="flex flex-col gap-5 border-b border-[#E8E6DE] px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
                  Profile
                </p>

                <MetaRow icon={Building2} label="Department">
                  <span className="text-[13px] text-[#2C2C2A]">
                    {user.department || "Not provided"}
                  </span>
                </MetaRow>

                <MetaRow icon={Briefcase} label="Title">
                  <span className="text-[13px] text-[#2C2C2A]">
                    {user.title || "Not provided"}
                  </span>
                </MetaRow>

                <MetaRow icon={Phone} label="Phone">
                  <span className="text-[13px] text-[#2C2C2A]">
                    {user.phoneNumber || "Not provided"}
                  </span>
                </MetaRow>
              </div>

              {/* Access section */}
              <div className="flex flex-col gap-4 border-b border-[#E8E6DE] px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
                  Access
                </p>

                <MetaRow icon={ShieldCheck} label="Roles">
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex h-6 items-center rounded-full border border-[#E8E6DE] bg-[#F6F4EF] px-2 text-[11px] font-semibold text-[#5F5E5A]"
                        >
                          {formatRole(role)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[13px] text-[#888780]">No roles assigned</span>
                    )}
                  </div>
                </MetaRow>
              </div>

              {/* Dates + ID section */}
              <div className="flex flex-col gap-5 border-b border-[#E8E6DE] px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
                  Activity
                </p>

                <MetaRow icon={CalendarDays} label="Last login">
                  <span className="text-[13px] text-[#2C2C2A]">
                    {formatDate(user.lastLoginAt)}
                  </span>
                </MetaRow>

                <MetaRow icon={CalendarDays} label="Member since">
                  <span className="text-[13px] text-[#2C2C2A]">
                    {formatDate(user.createdAt)}
                  </span>
                </MetaRow>

                <MetaRow icon={Fingerprint} label="Public ID">
                  <span className="font-mono text-[12px] text-[#5F5E5A]">
                    {user.publicId}
                  </span>
                </MetaRow>
              </div>

              {/* Actions section */}
              <div className="flex flex-col gap-3 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B4B2A9]">
                  Actions
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditRoles(user)}
                  className="h-9 w-full justify-start rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
                >
                  <ShieldCheck size={14} />
                  Edit roles
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(user)}
                  className="h-9 w-full justify-start rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
                >
                  <StatusIcon size={14} />
                  {isDeactivated ? "Activate user" : "Deactivate user"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(user)}
                  className="h-9 w-full justify-start rounded-[8px] border border-red-200 px-4 text-[12px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 size={14} />
                  Delete user
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
