"use client"

import { useState } from "react"
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { OrganizationUser } from "@/lib/api/users"

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "org_admin", label: "Org admin" },
]

function getDisplayName(user: OrganizationUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

interface UpdateUserRolesDialogProps {
  user: OrganizationUser | null
  isUpdating: boolean
  error?: string
  onCancel: () => void
  onConfirm: (roles: string[]) => void
}

function UpdateUserRolesForm({
  user,
  isUpdating,
  onCancel,
  onConfirm,
}: {
  user: OrganizationUser
  isUpdating: boolean
  onCancel: () => void
  onConfirm: (roles: string[]) => void
}) {
  const [roles, setRoles] = useState<string[]>(user.roles)

  const toggleRole = (role: string) => {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    )
  }

  return (
    <>
      <fieldset className="space-y-2">
        <legend className="text-[12px] font-semibold text-[#5F5E5A]">
          Roles
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ROLE_OPTIONS.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-2 rounded-[8px] border border-[#E8E6DE] bg-[#FAFAF8] px-3 py-2 text-[12px] font-semibold text-[#2C2C2A]"
            >
              <Checkbox
                checked={roles.includes(role.value)}
                onCheckedChange={() => toggleRole(role.value)}
              />
              {role.label}
            </label>
          ))}
        </div>
      </fieldset>

      <DialogFooter className="-mx-4 -mb-4 mt-2 flex flex-col-reverse gap-3 border-t bg-[#FAFAF8] p-4 sm:flex-row sm:justify-end md:-mx-6 md:-mb-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUpdating}
          className="h-9 w-full rounded-md border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:w-auto sm:min-w-32"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => onConfirm(roles)}
          disabled={isUpdating || roles.length === 0}
          className="h-9 w-full rounded-md bg-brand-teal px-3.5 text-sm font-semibold text-white hover:bg-[#0c5e49] sm:w-auto sm:min-w-32"
        >
          {isUpdating ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Updating
            </>
          ) : (
            "Save roles"
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function UpdateUserRolesDialog({
  user,
  isUpdating,
  error = "",
  onCancel,
  onConfirm,
}: UpdateUserRolesDialogProps) {
  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open && !isUpdating) {
          onCancel()
        }
      }}
    >
      <DialogContent
        showCloseButton={!isUpdating}
        className="max-w-lg border border-slate-100 bg-white p-4 shadow-lg md:p-6"
      >
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#E1F5EE] text-[#0F6E56]">
            <ShieldCheck size={24} strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-base font-semibold text-slate-900">
            Update roles
          </DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-relaxed text-slate-600">
            {user
              ? `Choose the roles assigned to ${getDisplayName(user)}.`
              : "Choose the roles assigned to this user."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {user ? (
          <UpdateUserRolesForm
            key={user.publicId}
            user={user}
            isUpdating={isUpdating}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
