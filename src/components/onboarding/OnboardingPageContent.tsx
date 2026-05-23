"use client"

import { useState } from "react"
import { AlertCircle, Building2, Globe, Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { InviteUserDialog } from "@/components/users/InviteUserDialog"
import { useCurrentOrganizationSettings } from "@/hooks/use-current-organization-settings"
import { useOrganizationUsers } from "@/hooks/use-organization-users"
import { updateCurrentOrganizationSettings } from "@/lib/api/organizations"
import type { OrganizationUser } from "@/lib/api/users"
import { formatDisplayDate } from "@/lib/format/date"

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidDomain(value: string) {
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim())
}

// ── Domain badge ──────────────────────────────────────────────────────────────

function DomainChip({ domain, onRemove, disabled }: { domain: string; onRemove: () => void; disabled: boolean }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#9FE1CB] bg-[#E1F5EE] pl-3 pr-1.5 py-1">
      <Globe size={11} className="shrink-0 text-brand-teal" />
      <span className="text-[12px] font-semibold text-[#0F6E56]">@{domain}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full text-[#9FE1CB] transition-colors hover:bg-[#0F6E56] hover:text-white disabled:opacity-40"
      >
        <Trash2 size={9} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ── Pending invites table ─────────────────────────────────────────────────────

function PendingInvitesTable({ users }: { users: OrganizationUser[] }) {
  const pending = users.filter((u) => u.status === "invited" || u.status === "pending")

  if (pending.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-[12px] border border-dashed border-[#E8E6DE] text-[13px] text-[#B4B2A9]">
        No pending invites
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#E8E6DE]">
      <div className="grid grid-cols-[1fr_160px_100px_120px] gap-3 border-b border-[#E8E6DE] bg-[#FAFAF8] px-4 py-2.5">
        {["Name / Email", "Department", "Role", "Invited"].map((h) => (
          <span key={h} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888780]">{h}</span>
        ))}
      </div>
      {pending.map((u) => (
        <div key={u.publicId} className="grid grid-cols-[1fr_160px_100px_120px] items-center gap-3 border-b border-[#E8E6DE] px-4 py-3 last:border-0 hover:bg-[#FAFAF8]">
          <div>
            <p className="text-[13px] font-medium text-[#2C2C2A]">{u.firstName} {u.lastName}</p>
            <p className="text-[11px] text-[#888780]">{u.email}</p>
          </div>
          <span className="text-[12px] text-[#5F5E5A]">{u.department ?? "—"}</span>
          <span className="inline-flex items-center rounded-full bg-[#F1EFE8] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#5F5E5A]">
            {u.roles?.[0] ?? "—"}
          </span>
          <span className="text-[11px] text-[#888780]">
            {u.createdAt ? formatDisplayDate(u.createdAt) : "—"}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function OnboardingPageContent() {
  const { settings, isLoading: settingsLoading } = useCurrentOrganizationSettings()
  const { users, isLoading: usersLoading, refreshUsers } = useOrganizationUsers()

  const [domains, setDomains]       = useState<string[] | null>(null)
  const [domainInput, setDomainInput] = useState("")
  const [savingDomains, setSavingDomains] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  // Initialise domains from settings once loaded
  const liveDomains = domains ?? settings?.security.allowedDomains ?? []

  function addDomain() {
    const value = domainInput.trim().replace(/^@/, "").toLowerCase()
    if (!isValidDomain(value) || liveDomains.includes(value)) return
    setDomains([...liveDomains, value])
    setDomainInput("")
  }

  function removeDomain(domain: string) {
    setDomains(liveDomains.filter((d) => d !== domain))
  }

  async function saveDomains() {
    setSavingDomains(true)
    try {
      await updateCurrentOrganizationSettings({
        security: { allowedDomains: liveDomains },
      })
      toast.success("Allowed domains saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save domains")
    } finally {
      setSavingDomains(false)
    }
  }

  function handleInvited(user: OrganizationUser) {
    toast.success(`Invite sent to ${user.email}`)
    refreshUsers()
  }

  const domainsChanged =
    domains !== null &&
    JSON.stringify(domains) !== JSON.stringify(settings?.security.allowedDomains ?? [])

  return (
    <div className="flex flex-col gap-8">

      {/* Top row — domains + invite */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Allowed domains */}
        <section className="flex flex-col gap-4 rounded-[16px] border border-[#E8E6DE] bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-teal-pale">
              <Building2 size={16} className="text-brand-teal" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-dm-sans text-[14px] font-semibold text-[#2C2C2A]">Company email domains</h2>
              <p className="mt-0.5 text-[12px] text-[#888780]">
                Anyone who signs up with a matching domain is automatically allowed into your organisation.
              </p>
            </div>
          </div>

          <Separator className="bg-[#F1EFE8]" />

          {settingsLoading ? (
            <div className="flex items-center gap-2 text-[13px] text-[#B4B2A9]">
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {/* Current domains */}
              {liveDomains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {liveDomains.map((d) => (
                    <DomainChip key={d} domain={d} onRemove={() => removeDomain(d)} disabled={savingDomains} />
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#B4B2A9] italic">No domains configured — only manual invites work.</p>
              )}

              {/* Add domain */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#B4B2A9]">@</span>
                  <Input
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
                    placeholder="company.com"
                    className="h-9 pl-7 rounded-[8px] border-[#E8E6DE] text-[13px]"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDomain}
                  disabled={!isValidDomain(domainInput.trim().replace(/^@/, ""))}
                  className="h-9 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Add
                </Button>
              </div>

              {domainsChanged && (
                <Button
                  onClick={saveDomains}
                  disabled={savingDomains}
                  className="self-start h-9 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white"
                >
                  {savingDomains ? <Loader2 size={13} className="animate-spin" /> : null}
                  Save domains
                </Button>
              )}
            </>
          )}
        </section>

        {/* Invite individuals */}
        <section className="flex flex-col gap-4 rounded-[16px] border border-[#E8E6DE] bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-teal-pale">
              <UserPlus size={16} className="text-brand-teal" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-dm-sans text-[14px] font-semibold text-[#2C2C2A]">Invite individuals</h2>
              <p className="mt-0.5 text-[12px] text-[#888780]">
                Send a direct invite to a specific person. They'll receive an email with a link to set their password.
              </p>
            </div>
          </div>

          <Separator className="bg-[#F1EFE8]" />

          <div className="flex flex-col gap-3">
            <div className="rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Users size={15} className="shrink-0 text-[#888780]" />
                <div>
                  <p className="text-[13px] font-semibold text-[#2C2C2A]">{users.length} member{users.length !== 1 ? "s" : ""} in your organisation</p>
                  <p className="text-[11px] text-[#888780]">
                    {users.filter((u) => u.status === "active").length} active ·{" "}
                    {users.filter((u) => u.status === "invited" || u.status === "pending").length} pending invite
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setInviteOpen(true)}
              className="h-10 w-full rounded-[8px] bg-brand-teal text-[13px] font-semibold text-white hover:bg-brand-teal-mid"
            >
              <UserPlus size={15} strokeWidth={2.5} />
              Invite a team member
            </Button>
          </div>
        </section>
      </div>

      {/* Pending invites */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-dm-sans text-[14px] font-semibold text-[#2C2C2A]">Pending invites</h2>
          {usersLoading && <Loader2 size={13} className="animate-spin text-[#B4B2A9]" />}
        </div>
        <PendingInvitesTable users={users} />
      </section>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={handleInvited}
      />
    </div>
  )
}
