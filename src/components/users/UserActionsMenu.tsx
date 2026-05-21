"use client"

import { MoreHorizontal, Power, PowerOff, ShieldCheck, Trash2, UserRoundSearch } from "lucide-react"

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
import type { OrganizationUser } from "@/lib/api/users"

interface UserActionsMenuProps {
  user: OrganizationUser
  onView: (user: OrganizationUser) => void
  onEditRoles: (user: OrganizationUser) => void
  onStatusChange: (user: OrganizationUser) => void
  onDelete: (user: OrganizationUser) => void
  isBusy?: boolean
}

export function UserActionsMenu({
  user,
  onView,
  onEditRoles,
  onStatusChange,
  onDelete,
  isBusy = false,
}: UserActionsMenuProps) {
  const isDeactivated = user.status.toLowerCase() === "deactivated"
  const StatusIcon = isDeactivated ? Power : PowerOff

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-[8px] text-[#5F5E5A] hover:bg-[#E1F5EE] hover:text-[#0F6E56]"
            aria-label={`Open actions for ${user.email}`}
          />
        }
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>User actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onView(user)}
            className="cursor-pointer text-[12px]"
          >
            <UserRoundSearch size={14} />
            View info
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isBusy}
            onClick={() => onEditRoles(user)}
            className="cursor-pointer text-[12px]"
          >
            <ShieldCheck size={14} />
            Update roles
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isBusy}
            onClick={() => onStatusChange(user)}
            className="cursor-pointer text-[12px]"
          >
            <StatusIcon size={14} />
            {isDeactivated ? "Activate" : "Deactivate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(user)}
            disabled={isBusy}
            variant="destructive"
            className="cursor-pointer text-[12px]"
          >
            <Trash2 size={14} />
            Delete user
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
