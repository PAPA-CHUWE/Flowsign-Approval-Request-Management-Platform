import type { UserRole } from "@/constants/role.constants"

export interface NavigationItem {
  title: string
  href: string
  roles: UserRole[]
  permission?: string
}
