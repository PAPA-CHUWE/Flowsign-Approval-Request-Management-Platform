"use client"

import { useState } from "react"
import { AlertCircle, Loader2, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { inviteUser, type OrganizationUser } from "@/lib/api/users"

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "org_admin", label: "Org admin" },
]

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (user: OrganizationUser) => void
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onInvited,
}: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    department: "",
    title: "",
    roles: ["manager"],
  })

  const setField =
    (field: keyof Omit<typeof form, "roles">) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }

  const toggleRole = (role: string) => {
    setForm((current) => {
      const roles = current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role]

      return { ...current, roles }
    })
  }

  const isValid =
    form.email.includes("@") &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.roles.length > 0

  const resetForm = () => {
    setForm({
      email: "",
      firstName: "",
      lastName: "",
      department: "",
      title: "",
      roles: ["manager"],
    })
    setError("")
  }

  const submitInvite = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await inviteUser({
        email: form.email.trim().toLowerCase(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        department: form.department.trim() || undefined,
        title: form.title.trim() || undefined,
        roles: form.roles,
      })

      onInvited(response.responseBody.user)
      resetForm()
      onOpenChange(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not invite user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          resetForm()
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            Add a new member to your organisation and assign their initial role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitInvite} className="space-y-4">
          {error ? (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              First name
              <Input
                value={form.firstName}
                onChange={setField("firstName")}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Last name
              <Input
                value={form.lastName}
                onChange={setField("lastName")}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
            Email
            <Input
              type="email"
              value={form.email}
              onChange={setField("email")}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Department
              <Input
                value={form.department}
                onChange={setField("department")}
                placeholder="Finance"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Title
              <Input
                value={form.title}
                onChange={setField("title")}
                placeholder="Finance Manager"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
          </div>

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
                    checked={form.roles.includes(role.value)}
                    onCheckedChange={() => toggleRole(role.value)}
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-9 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Inviting
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Send invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
