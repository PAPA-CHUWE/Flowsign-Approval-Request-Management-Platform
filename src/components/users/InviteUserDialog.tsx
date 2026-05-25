"use client"

import { useState } from "react"
import { AlertCircle, Check, Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { inviteUser, type OrganizationUser } from "@/lib/api/users"

// ── Role catalogue ─────────────────────────────────────────────────────────────

const ROLES = [
  { value: "employee",  label: "Employee",  description: "Can create and view their own requests" },
  { value: "manager",   label: "Manager",   description: "Can view team requests and approve assigned work" },
  { value: "finance",   label: "Finance",   description: "Can review finance requests and analytics" },
  { value: "hr",        label: "HR",        description: "Can manage users and review org requests" },
  { value: "it_admin",  label: "IT Admin",  description: "Can manage users, settings, and workflows" },
  { value: "org_admin", label: "Org Admin", description: "Full organization administration" },
] as const

type RoleValue = typeof ROLES[number]["value"]

// ── Form state ─────────────────────────────────────────────────────────────────

interface FormState {
  email: string
  roles: RoleValue[]
  firstName: string
  lastName: string
  department: string
  title: string
}

const INITIAL_FORM: FormState = {
  email: "",
  roles: ["employee"],
  firstName: "",
  lastName: "",
  department: "",
  title: "",
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (user: OrganizationUser) => void
}

// ── Component ──────────────────────────────────────────────────────────────────

export function InviteUserDialog({ open, onOpenChange, onInvited }: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [touched, setTouched] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  function setField<K extends keyof Omit<FormState, "roles">>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      if (key === "email") setEmailError("") // clear inline email error on type
    }
  }

  function toggleRole(value: RoleValue) {
    setForm((prev) => {
      const has = prev.roles.includes(value)
      // Prevent deselecting last role
      if (has && prev.roles.length === 1) return prev
      return {
        ...prev,
        roles: has ? prev.roles.filter((r) => r !== value) : [...prev.roles, value],
      }
    })
  }

  function validateEmail() {
    if (!form.email.trim()) return "Email address is required."
    if (!form.email.includes("@")) return "Enter a valid email address."
    return ""
  }

  function resetForm() {
    setForm(INITIAL_FORM)
    setGeneralError("")
    setEmailError("")
    setTouched(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)

    const emailErr = validateEmail()
    if (emailErr) { setEmailError(emailErr); return }
    if (form.roles.length === 0) return

    setIsSubmitting(true)
    setGeneralError("")
    setEmailError("")

    const payload = {
      email:     form.email.trim().toLowerCase(),
      roles:     form.roles as string[],
      ...(form.firstName.trim() ? { firstName: form.firstName.trim() } : {}),
      ...(form.lastName.trim()  ? { lastName:  form.lastName.trim()  } : {}),
      ...(form.department.trim() ? { department: form.department.trim() } : {}),
      ...(form.title.trim()     ? { title:      form.title.trim()     } : {}),
    }

    try {
      const response = await inviteUser(payload)
      const newUser = response.responseBody.user
      toast.success(`Invite sent to ${newUser.email}`)
      onInvited(newUser)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEmailError("A user with this email is already in your organization.")
      } else {
        setGeneralError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSubmitting) resetForm()
        onOpenChange(next)
      }}
    >
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {/* Header */}
        <div className="border-b border-[#E8E6DE] px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-[#2C2C2A]">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#E1F5EE]">
                <UserPlus size={14} className="text-[#0F6E56]" />
              </div>
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#5F5E5A]">
              They&apos;ll receive an email with a link to activate their account.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable body */}
        <form id="invite-form" onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-6 py-5">

            {generalError && (
              <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#5F5E5A]">
                Email address <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={form.email}
                onChange={setField("email")}
                onBlur={() => { if (touched || form.email) setEmailError(validateEmail()) }}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
              {emailError && (
                <p className="text-[11px] font-medium text-[#A32D2D]">{emailError}</p>
              )}
            </div>

            {/* Role selector */}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-[12px] font-semibold text-[#5F5E5A]">
                Role <span className="text-red-400">*</span>
              </legend>
              <div className="flex flex-col gap-2">
                {ROLES.map((role) => {
                  const selected = form.roles.includes(role.value)
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => toggleRole(role.value)}
                      className={[
                        "flex items-start gap-3 rounded-[10px] border px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-[#1D9E75] bg-[#F0FAF6]"
                          : "border-[#E8E6DE] bg-white hover:border-[#B0D9CB] hover:bg-[#FAFAF8]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                          selected
                            ? "border-[#0F6E56] bg-[#0F6E56]"
                            : "border-[#D3D1C7] bg-white",
                        ].join(" ")}
                      >
                        {selected && <Check size={10} color="white" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-[#2C2C2A]">
                          {role.label}
                        </span>
                        <span className="block text-[11px] text-[#888780]">
                          {role.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#5F5E5A]">First name</label>
                <Input
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={setField("firstName")}
                  className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#5F5E5A]">Last name</label>
                <Input
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={setField("lastName")}
                  className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                />
              </div>
            </div>

            {/* Department + Title */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#5F5E5A]">Department</label>
                <Input
                  placeholder="e.g. Finance"
                  value={form.department}
                  onChange={setField("department")}
                  className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#5F5E5A]">Job title</label>
                <Input
                  placeholder="e.g. Finance Manager"
                  value={form.title}
                  onChange={setField("title")}
                  className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <DialogFooter className="border-t border-[#E8E6DE] bg-[#FAFAF8] px-6 py-4">
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
            form="invite-form"
            disabled={isSubmitting}
            className="h-9 rounded-[8px] bg-[#0F6E56] px-4 text-[12px] font-semibold text-white hover:bg-[#0c5e49] disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Sending…</>
            ) : (
              <><UserPlus size={14} /> Send Invite</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
