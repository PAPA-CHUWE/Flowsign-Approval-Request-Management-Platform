"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Building2, KeyRound, Loader2, Mail, Phone, Settings, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCurrentUser, getUserDisplayName, getUserInitials, getUserRoleLabel } from "@/hooks/use-current-user"
import { changePassword } from "@/lib/api/auth"
import { getOrganizationUser, type OrganizationUser } from "@/lib/api/users"
import { USER_ROLE } from "@/constants/role.constants"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveRole(roles: string[]) {
  const r = roles.map((x) => x.toLowerCase())
  if (r.includes("org_admin") || r.includes("it_admin")) return USER_ROLE.ADMIN
  if (r.includes("manager") || r.includes("hr")) return USER_ROLE.MANAGER
  return USER_ROLE.EMPLOYEE
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const ROLE_BADGE: Record<string, { label: string; cn: string }> = {
  [USER_ROLE.ADMIN]:    { label: "Admin",    cn: "bg-[#EEEDFE] text-[#534AB7]" },
  [USER_ROLE.MANAGER]:  { label: "Manager",  cn: "bg-[#E1F5EE] text-[#0F6E56]" },
  [USER_ROLE.EMPLOYEE]: { label: "Employee", cn: "bg-[#F1EFE8] text-[#5F5E5A]" },
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-[#E8E6DE] bg-white p-6">
      <h2 className="text-[14px] font-semibold text-[#2C2C2A] mb-4">{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-[8px] bg-[#F1EFE8] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} color="#5F5E5A" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#B4B2A9] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[14px] text-[#2C2C2A] mt-0.5 break-all">{value || "—"}</p>
      </div>
    </div>
  )
}

// ── Change Password form ──────────────────────────────────────────────────────

function ChangePasswordForm() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" })
  const [isSaving, setIsSaving] = useState(false)

  const valid =
    form.current.length >= 6 &&
    form.next.length >= 8 &&
    form.next === form.confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || isSaving) return
    setIsSaving(true)
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next })
      toast.success("Password updated successfully.")
      setForm({ current: "", next: "", confirm: "" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password.")
    } finally {
      setIsSaving(false)
    }
  }

  const inputCn =
    "h-10 rounded-[9px] border-[#D3D1C7] bg-[#F1EFE8] text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] " +
    "focus-visible:border-[#1D9E75] focus-visible:ring-[3px] focus-visible:ring-[#E1F5EE] focus-visible:bg-white transition-all duration-150"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-semibold text-[#5F5E5A] tracking-wide uppercase">Current password</Label>
        <Input type="password" placeholder="••••••••" value={form.current} onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))} className={inputCn} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-semibold text-[#5F5E5A] tracking-wide uppercase">New password</Label>
        <Input type="password" placeholder="Min. 8 characters" value={form.next} onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))} className={inputCn} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-semibold text-[#5F5E5A] tracking-wide uppercase">Confirm new password</Label>
        <Input
          type="password"
          placeholder="Re-enter new password"
          value={form.confirm}
          onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
          className={cn(inputCn, form.confirm && form.confirm !== form.next && "border-[#F5C6C6]")}
        />
        {form.confirm && form.confirm !== form.next && (
          <p className="text-[11px] text-[#A32D2D]">Passwords do not match.</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={!valid || isSaving}
        className={cn(
          "h-9 rounded-[9px] text-[13px] font-semibold mt-1 transition-all duration-200",
          valid && !isSaving
            ? "bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white hover:opacity-90 cursor-pointer"
            : "bg-[#D3D1C7] text-[#5F5E5A] cursor-not-allowed"
        )}
      >
        {isSaving ? <><Loader2 size={14} className="animate-spin" />Updating…</> : "Update password"}
      </Button>
    </form>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export function ProfileShell() {
  const { user, isLoading } = useCurrentUser()
  const [profile, setProfile] = useState<OrganizationUser | null>(null)

  useEffect(() => {
    if (!user?.publicId) return
    getOrganizationUser(user.publicId)
      .then((res) => setProfile(res.responseBody.user))
      .catch(() => {/* non-critical — fall back to auth user data */})
  }, [user?.publicId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-[#1D9E75]" />
      </div>
    )
  }

  if (!user) return null

  const role     = resolveRole(user.roles)
  const badge    = ROLE_BADGE[role] ?? ROLE_BADGE[USER_ROLE.EMPLOYEE]
  const initials = getUserInitials(user)
  const name     = getUserDisplayName(user)
  const roleLabel = getUserRoleLabel(user)
  const isAdmin  = role === USER_ROLE.ADMIN

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-5">

      {/* ── Profile header ── */}
      <div className="rounded-[16px] border border-[#E8E6DE] bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E1F5EE] to-[#9FE1CB] flex items-center justify-center text-[22px] font-bold text-[#0F6E56] shrink-0">
          {initials}
        </div>
        {/* Identity */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold text-[#2C2C2A] tracking-[-0.01em] truncate">{name}</h1>
          <p className="text-[13px] text-[#5F5E5A] mt-0.5 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold", badge.cn)}>
              <Shield size={10} className="mr-1" />
              {roleLabel}
            </span>
            <span className="text-[12px] text-[#B4B2A9]">·</span>
            <span className="text-[12px] text-[#5F5E5A]">{user.organization.name}</span>
          </div>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Personal info */}
        <Section title="Personal info">
          <div className="divide-y divide-[#F1EFE8]">
            <InfoRow icon={User}     label="Full name"   value={name} />
            <InfoRow icon={Mail}     label="Email"       value={user.email} />
            <InfoRow icon={Building2} label="Department" value={profile?.department ?? ""} />
            <InfoRow icon={User}     label="Job title"   value={profile?.title ?? ""} />
            <InfoRow icon={Phone}    label="Phone"       value={profile?.phoneNumber ?? ""} />
          </div>
          {profile?.lastLoginAt && (
            <>
              <Separator className="my-3" />
              <p className="text-[11px] text-[#B4B2A9]">
                Last login: {formatDate(profile.lastLoginAt)}
              </p>
            </>
          )}
        </Section>

        {/* Change password */}
        <Section title="Change password">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-[7px] bg-[#E1F5EE] flex items-center justify-center">
              <KeyRound size={13} color="#0F6E56" strokeWidth={2} />
            </div>
            <p className="text-[12px] text-[#5F5E5A]">Keep your account secure with a strong password.</p>
          </div>
          <ChangePasswordForm />
        </Section>
      </div>

      {/* ── Admin: Organisation card ── */}
      {isAdmin && (
        <Section title="Organisation">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <InfoRow icon={Building2} label="Name"  value={user.organization.name} />
              <InfoRow icon={Building2} label="Slug"  value={user.organization.slug} />
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#D3D1C7] px-3 py-1.5 text-[12px] font-medium text-[#5F5E5A] hover:border-[#0F6E56] hover:text-[#0F6E56] transition-colors duration-150 shrink-0 no-underline"
            >
              <Settings size={13} strokeWidth={2} />
              Manage
            </Link>
          </div>
        </Section>
      )}

    </div>
  )
}
