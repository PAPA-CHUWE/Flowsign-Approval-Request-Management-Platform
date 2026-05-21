"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Download, FileDown, FileSpreadsheet, FileText, Search, UserPlus, X } from "lucide-react"

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
import { getUserInitials } from "@/hooks/use-current-user"
import { useOrganizationUsers } from "@/hooks/use-organization-users"
import { cn } from "@/lib/utils"
import {
  deleteOrganizationUser,
  getOrganizationUser,
  type OrganizationUser,
  updateUserRoles,
  updateUserStatus,
} from "@/lib/api/users"
import { DeactivateUserDialog } from "./DeactivateUserDialog"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { InviteUserDialog } from "./InviteUserDialog"
import { UpdateUserRolesDialog } from "./UpdateUserRolesDialog"
import { UserActionsMenu } from "./UserActionsMenu"
import { UserDetailsDialog } from "./UserDetailsDialog"
import { UserStatusPill } from "./UserStatusPill"

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
]

const COLS = [
  { label: "User", width: "flex-1" },
  { label: "Department", width: "w-[140px]" },
  { label: "Status", width: "w-[120px]" },
  { label: "Roles", width: "w-[190px]" },
  { label: "Actions", width: "w-[80px]" },
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
  const { users, isLoading, error, setUsers } = useOrganizationUsers()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
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
          <Button
            size="sm"
            onClick={() => setShowInviteDialog(true)}
            className="h-8 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white"
          >
            <UserPlus size={14} />
            Invite user
          </Button>
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
              <div className="w-[80px] shrink-0" />
            </div>
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-[13px] text-[#B4B2A9]">No users match your filters.</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div
              key={user.publicId}
              className={cn(
                "flex min-w-[900px] items-center gap-3 border-b border-brand-neutral-pale px-4 py-3 transition-colors duration-100 last:border-0",
                index % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]",
                "hover:bg-[#F5FBF8]"
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
              <div className="flex w-[80px] shrink-0 justify-end">
                <UserActionsMenu
                  user={user}
                  onView={viewUserDetails}
                  onEditRoles={(nextUser) => {
                    setUserRolesError("")
                    setUserToUpdateRoles(nextUser)
                  }}
                  onStatusChange={(nextUser) => {
                    setUserStatusError("")
                    setUserStatusAction(
                      nextUser.status.toLowerCase() === "deactivated"
                        ? "activate"
                        : "deactivate"
                    )
                    setUserToDeactivate(nextUser)
                  }}
                  onDelete={(nextUser) => {
                    setDeleteUserError("")
                    setUserToDelete(nextUser)
                  }}
                  isBusy={isDeletingUser || isUpdatingUserStatus || isUpdatingUserRoles}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <p className="pl-1 text-[11px] text-[#B4B2A9]">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      <UserDetailsDialog
        user={selectedUser}
        isLoading={isLoadingUserDetails}
        error={userDetailsError}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null)
            setUserDetailsError("")
            setIsLoadingUserDetails(false)
          }
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
    </div>
  )
}
