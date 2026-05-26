import { USER_ROLE } from "@/constants/role.constants"
import type { NavigationItem } from "@/types/navigation.types"

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    roles: [USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER, USER_ROLE.ADMIN],
  },
  {
    title: "Requests",
    href: "/requests",
    roles: [USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER, USER_ROLE.ADMIN],
  },
  {
    title: "Tickets",
    href: "/tickets",
    roles: [USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER, USER_ROLE.ADMIN],
  },
  {
    title: "Approvals",
    href: "/approvals",
    roles: [USER_ROLE.MANAGER, USER_ROLE.ADMIN],
  },
  {
    title: "Users",
    href: "/users",
    roles: [USER_ROLE.ADMIN],
    permission: "manage_users",
  },
  {
    title: "Workflow Rules",
    href: "/workflow-rules",
    roles: [USER_ROLE.ADMIN],
  },
  {
    title: "Onboarding",
    href: "/onboarding",
    roles: [USER_ROLE.ADMIN],
  },
  {
    title: "Settings",
    href: "/settings",
    roles: [USER_ROLE.ADMIN],
    permission: "manage_settings",
  },
] satisfies NavigationItem[]
