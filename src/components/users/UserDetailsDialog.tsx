"use client"

import { AlertCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getUserInitials } from "@/hooks/use-current-user"
import type { OrganizationUser } from "@/lib/api/users"
import { UserStatusPill } from "./UserStatusPill"

function formatRole(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getDisplayName(user: OrganizationUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888780]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-medium text-[#2C2C2A]">
        {value || "Not provided"}
      </p>
    </div>
  )
}

interface UserDetailsDialogProps {
  user: OrganizationUser | null
  isLoading?: boolean
  error?: string
  onOpenChange: (open: boolean) => void
}

export function UserDetailsDialog({
  user,
  isLoading = false,
  error = "",
  onOpenChange,
}: UserDetailsDialogProps) {
  return (
    <Dialog open={!!user || isLoading || !!error} onOpenChange={onOpenChange}>
      {user ? (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User information</DialogTitle>
            <DialogDescription>
              Organisation profile and access details visible to admins.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[12px] font-bold text-[#0F6E56]">
              {getUserInitials(user)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#2C2C2A]">
                {getDisplayName(user)}
              </p>
              <p className="truncate text-[12px] text-[#888780]">{user.email}</p>
            </div>
            <UserStatusPill status={user.status} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Department" value={user.department} />
            <Field label="Title" value={user.title} />
            <Field label="Phone" value={user.phoneNumber} />
            <Field label="Last login" value={user.lastLoginAt} />
            <Field label="Created" value={user.createdAt} />
            <Field label="Public ID" value={user.publicId} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888780]">
              Roles
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex h-6 items-center rounded-full border border-[#E8E6DE] bg-[#F6F4EF] px-2 text-[11px] font-semibold text-[#5F5E5A]"
                >
                  {formatRole(role)}
                </span>
              ))}
            </div>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User information</DialogTitle>
            <DialogDescription>
              Loading organisation profile and access details.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-16 animate-pulse rounded-[10px] bg-[#F1EFE8]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#F1EFE8]" />
                    <div className="h-4 w-32 animate-pulse rounded bg-[#F1EFE8]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  )
}
