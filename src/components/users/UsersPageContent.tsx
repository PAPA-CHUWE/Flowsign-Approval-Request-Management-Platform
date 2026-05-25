"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Download, FileDown, FileSpreadsheet, FileText, Loader2, Mail, RefreshCw, Search, Trash2, UserPlus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/layout/PageHeader"
import { getUserInitials, useCurrentUser } from "@/hooks/use-current-user"
import { useOrganizationUsers } from "@/hooks/use-organization-users"
import { cn } from "@/lib/utils"
import {
  deleteOrganizationUser,
  getOrganizationUser,
  resendInvite,
  type OrganizationUser,
  updateUserRoles,
  updateUserStatus,
} from "@/lib/api/users"
import { DeactivateUserDialog } from "./DeactivateUserDialog"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { InviteUserDialog } from "./InviteUserDialog"
import { RevokeInviteDialog } from "./RevokeInviteDialog"
import { UpdateUserRolesDialog } from "./UpdateUserRolesDialog"
import { UserDrawer } from "./UserDrawer"
import { UserStatusPill } from "./UserStatusPill"

const FILTERS = [
  { value: "all",      label: "All" },
  { value: "active",   label: "Active" },
  { value: "invited",  label: "Pending Invites" },
  { value: "inactive", label: "Inactive" },
]

const COLS = [
  { label: "User",       width: "flex-1" },
  { label: "Department", width: "w-[140px]" },
  { label: "Status",     width: "w-[120px]" },
  { label: "Roles",      width: "w-[190px]" },
  { label: "",           width: "w-[160px]" },
]

function formatRole(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getDisplayName(user: OrganizationUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function toCsv(users: OrganizationUser[]) {
  const rows = [
    ["Public ID", "Name", "Email", "Status", "Department", "Title", "Roles"],
    ...users.map((user) => [
      user.publicId,
      getDisplayName(user),
      user.email,
      user.status,
      user.department ?? "",
      user.title ?? "",
      user.roles.join("; "),
    ]),
  ]

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`)
        .join(",")
    )
    .join("\n")
}

export function UsersPageContent() {
  const { user: currentUser } = useCurrentUser()
  const canManageUsers = currentUser?.permissions?.includes("manage_users") ?? false

  const { users, isLoading, error, setUsers } = useOrganizationUsers()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null)
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false)
  const [userDetailsError, setUserDetailsError] = useState("")
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<OrganizationUser | null>(null)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  const [deleteUserError, setDeleteUserError] = useState("")
  const [userToDeactivate, setUserToDeactivate] = useState<OrganizationUser | null>(null)
  const [userStatusAction, setUserStatusAction] = useState<"activate" | "deactivate">("deactivate")
  const [isUpdatingUserStatus, setIsUpdatingUserStatus] = useState(false)
  const [userStatusError, setUserStatusError] = useState("")
  const [userToUpdateRoles, setUserToUpdateRoles] = useState<OrganizationUser | null>(null)
  const [isUpdatingUserRoles, setIsUpdatingUserRoles] = useState(false)
  const [userRolesError, setUserRolesError] = useState("")
  const [userToRevoke, setUserToRevoke] = useState<OrganizationUser | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set())

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()

    return users.filter((user) => {
      const statusMatches = filter === "all" || user.status.toLowerCase() === filter
      const queryMatches =
        !q ||
        getDisplayName(user).toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.roles.some((role) => role.toLowerCase().includes(q)) ||
        user.department?.toLowerCase().includes(q)

      return statusMatches && queryMatches
    })
  }, [filter, query, users])

  const exportCsv = () => {
    const blob = new Blob([toCsv(filteredUsers)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "flowsign-users.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const viewUserDetails = async (user: OrganizationUser) => {
    setSelectedUser(null)
    setUserDetailsError("")
    setIsLoadingUserDetails(true)
    setDrawerOpen(true)

    try {
      const response = await getOrganizationUser(user.publicId)
      setSelectedUser(response.responseBody.user)
    } catch (reason) {
      setUserDetailsError(
        reason instanceof Error ? reason.message : "Could not load user details."
      )
    } finally {
      setIsLoadingUserDetails(false)
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedUser(null)
    setUserDetailsError("")
    setIsLoadingUserDetails(false)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete || isDeletingUser) return

    setIsDeletingUser(true)
    setDeleteUserError("")

    try {
      const response = await deleteOrganizationUser(userToDelete.publicId)

      if (response.responseBody.deleted) {
        setUsers((current) =>
          current.filter((user) => user.publicId !== userToDelete.publicId)
        )
        setUserToDelete(null)
      }
    } catch (reason) {
      setDeleteUserError(
        reason instanceof Error ? reason.message : "Could not delete user."
      )
    } finally {
      setIsDeletingUser(false)
    }
  }

  const confirmDeactivateUser = async () => {
    if (!userToDeactivate || isUpdatingUserStatus) return

    setIsUpdatingUserStatus(true)
    setUserStatusError("")

    try {
      const response = await updateUserStatus(userToDeactivate.publicId, {
        status: userStatusAction === "activate" ? "active" : "deactivated",
      })
      const updatedUser = response.responseBody.user

      setUsers((current) =>
        current.map((user) =>
          user.publicId === updatedUser.publicId ? updatedUser : user
        )
      )
      setUserToDeactivate(null)
    } catch (reason) {
      setUserStatusError(
        reason instanceof Error ? reason.message : "Could not update user status."
      )
    } finally {
      setIsUpdatingUserStatus(false)
    }
  }

  const confirmUpdateUserRoles = async (roles: string[]) => {
    if (!userToUpdateRoles || isUpdatingUserRoles) return

    setIsUpdatingUserRoles(true)
    setUserRolesError("")

    try {
      const response = await updateUserRoles(userToUpdateRoles.publicId, {
        roles,
      })
      const updatedUser = response.responseBody.user

      setUsers((current) =>
        current.map((user) =>
          user.publicId === updatedUser.publicId ? updatedUser : user
        )
      )
      setUserToUpdateRoles(null)
    } catch (reason) {
      setUserRolesError(
        reason instanceof Error ? reason.message : "Could not update user roles."
      )
    } finally {
      setIsUpdatingUserRoles(false)
    }
  }

  const handleResendInvite = async (user: OrganizationUser, e: React.MouseEvent) => {
    e.stopPropagation()
    if (resendingIds.has(user.publicId)) return
    setResendingIds((prev) => new Set(prev).add(user.publicId))
    try {
      await resendInvite(user.publicId)
      toast.success(`Invite resent to ${user.email}`)
    } catch {
      toast.error("Failed to resend invite. Please try again.")
    } finally {
      setResendingIds((prev) => { const s = new Set(prev); s.delete(user.publicId); return s })
    }
  }

  const handleRevokeConfirm = async () => {
    if (!userToRevoke || isRevoking) return
    setIsRevoking(true)
    try {
      await deleteOrganizationUser(userToRevoke.publicId)
      setUsers((prev) => prev.filter((u) => u.publicId !== userToRevoke.publicId))
      toast.success(`Invite for ${userToRevoke.email} has been revoked`)
      setUserToRevoke(null)
    } catch {
      toast.error("Failed to revoke invite. Please try again.")
      setUserToRevoke(null)
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Users"
          description="Invite, review, and manage organisation members."
        />
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
                />
              }
            >
              <Download size={14} />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Export users</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="text-[12px]">
                  <FileText size={14} />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-[12px]">
                  <FileSpreadsheet size={14} />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportCsv} className="cursor-pointer text-[12px]">
                  <FileDown size={14} />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {canManageUsers && (
            <Button
              size="sm"
              onClick={() => setShowInviteDialog(true)}
              className="h-8 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white"
            >
              <UserPlus size={14} />
              Invite user
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "h-8 rounded-full px-3 text-[12px] font-semibold transition-colors",
                filter === item.value
                  ? "bg-[#E1F5EE] text-[#0F6E56]"
                  : "bg-white text-[#5F5E5A] ring-1 ring-[#E8E6DE] hover:bg-[#F6F4EF]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[8px] border border-[#E8E6DE] bg-white px-3 sm:w-[260px]">
            <Search size={14} color="#B4B2A9" strokeWidth={2} />
            <input
              className="min-w-0 flex-1 bg-transparent text-[13px] text-brand-neutral-dark outline-none placeholder:text-[#B4B2A9]"
              placeholder="Search users"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear user search"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#888780] transition-colors hover:bg-[#F1EFE8] hover:text-[#2C2C2A]"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="w-full overflow-x-auto rounded-[12px] border border-[#E8E6DE] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex min-w-[900px] items-center gap-3 border-b border-[#E8E6DE] bg-[#FAFAF8] px-4 py-3">
          {COLS.map((col) => (
            <div
              key={col.label}
              className={cn(
                "shrink-0",
                col.width === "flex-1" ? "min-w-0 flex-1" : col.width
              )}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888780]">
                {col.label}
              </span>
            </div>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-[900px] items-center gap-3 border-b border-brand-neutral-pale px-4 py-3 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <div className="h-9 w-56 animate-pulse rounded bg-[#F1EFE8]" />
              </div>
              <div className="w-[140px] shrink-0">
                <div className="h-5 w-24 animate-pulse rounded bg-[#F1EFE8]" />
              </div>
              <div className="w-[120px] shrink-0">
                <div className="h-7 w-20 animate-pulse rounded-full bg-[#F1EFE8]" />
              </div>
              <div className="w-[190px] shrink-0">
                <div className="h-6 w-28 animate-pulse rounded bg-[#F1EFE8]" />
              </div>
            </div>
          ))
        ) : filteredUsers.length === 0 ? (
          filter === "invited" ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Mail size={22} className="text-[#D3D1C7]" />
              <div className="text-center">
                <p className="text-[13px] font-semibold text-[#2C2C2A]">No pending invites</p>
                <p className="mt-0.5 text-[12px] text-[#B4B2A9]">
                  Invited users will appear here until they accept.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteDialog(true)}
                className="mt-1 flex h-8 items-center gap-1.5 rounded-[8px] bg-brand-teal px-3 text-[12px] font-semibold text-white hover:opacity-90"
              >
                <UserPlus size={13} /> Invite a user
              </button>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-[13px] text-[#B4B2A9]">No users match your filters.</p>
            </div>
          )
        ) : (
          filteredUsers.map((user, index) => (
            <div
              key={user.publicId}
              onClick={() => viewUserDetails(user)}
              className={cn(
                "flex min-w-[900px] items-center gap-3 border-b border-brand-neutral-pale px-4 py-3 transition-colors duration-100 last:border-0",
                index % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]",
                "cursor-pointer hover:bg-[#F5FBF8]"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[11px] font-bold text-[#0F6E56]">
                    {getUserInitials(user)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#2C2C2A]">
                      {getDisplayName(user)}
                    </p>
                    <p className="truncate text-[12px] text-[#888780]">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="w-[140px] shrink-0">
                <p className="truncate text-[12px] text-brand-neutral-mid">
                  {user.department || "Not provided"}
                </p>
              </div>
              <div className="w-[120px] shrink-0">
                <UserStatusPill status={user.status} />
              </div>
              <div className="w-[190px] shrink-0">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.slice(0, 2).map((role) => (
                    <span
                      key={role}
                      className="inline-flex h-6 items-center rounded-full border border-[#E8E6DE] bg-[#F6F4EF] px-2 text-[11px] font-semibold text-[#5F5E5A]"
                    >
                      {formatRole(role)}
                    </span>
                  ))}
                  {user.roles.length > 2 ? (
                    <span className="inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold text-[#888780]">
                      +{user.roles.length - 2}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Invite actions — only for invited users with manage_users permission */}
              <div className="w-[160px] shrink-0" onClick={(e) => e.stopPropagation()}>
                {canManageUsers && user.status.toLowerCase() === "invited" && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={resendingIds.has(user.publicId)}
                      onClick={(e) => handleResendInvite(user, e)}
                      title="Resend invite email"
                      className="flex h-7 items-center gap-1 rounded-[6px] border border-[#E8E6DE] bg-white px-2 text-[11px] font-semibold text-[#5F5E5A] transition-colors hover:border-[#1D9E75] hover:text-[#0F6E56] disabled:opacity-50"
                    >
                      {resendingIds.has(user.publicId)
                        ? <Loader2 size={11} className="animate-spin" />
                        : <RefreshCw size={11} />}
                      Resend
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setUserToRevoke(user) }}
                      title="Revoke invite"
                      className="flex h-7 items-center gap-1 rounded-[6px] border border-red-200 bg-white px-2 text-[11px] font-semibold text-red-400 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={11} />
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="pl-1 text-[11px] text-[#B4B2A9]">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      <UserDrawer
        user={selectedUser}
        open={drawerOpen}
        isLoading={isLoadingUserDetails}
        error={userDetailsError}
        onClose={closeDrawer}
        onEditRoles={(user) => {
          closeDrawer()
          setUserRolesError("")
          setUserToUpdateRoles(user)
        }}
        onStatusChange={(user) => {
          closeDrawer()
          setUserStatusError("")
          setUserStatusAction(
            user.status.toLowerCase() === "deactivated" ? "activate" : "deactivate"
          )
          setUserToDeactivate(user)
        }}
        onDelete={(user) => {
          closeDrawer()
          setDeleteUserError("")
          setUserToDelete(user)
        }}
      />

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInvited={(user) => {
          setUsers((current) => [user, ...current])
          setFilter("all")
          setQuery("")
        }}
      />

      <DeleteUserDialog
        user={userToDelete}
        isDeleting={isDeletingUser}
        error={deleteUserError}
        onCancel={() => {
          if (!isDeletingUser) {
            setUserToDelete(null)
            setDeleteUserError("")
          }
        }}
        onConfirm={confirmDeleteUser}
      />

      <DeactivateUserDialog
        user={userToDeactivate}
        action={userStatusAction}
        isUpdating={isUpdatingUserStatus}
        error={userStatusError}
        onCancel={() => {
          if (!isUpdatingUserStatus) {
            setUserToDeactivate(null)
            setUserStatusError("")
          }
        }}
        onConfirm={confirmDeactivateUser}
      />

      <UpdateUserRolesDialog
        user={userToUpdateRoles}
        isUpdating={isUpdatingUserRoles}
        error={userRolesError}
        onCancel={() => {
          if (!isUpdatingUserRoles) {
            setUserToUpdateRoles(null)
            setUserRolesError("")
          }
        }}
        onConfirm={confirmUpdateUserRoles}
      />

      <RevokeInviteDialog
        user={userToRevoke}
        isRevoking={isRevoking}
        onCancel={() => { if (!isRevoking) setUserToRevoke(null) }}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  )
}
