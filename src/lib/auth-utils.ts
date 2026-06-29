import { USER_ROLE, type UserRole } from "@/constants/role.constants"

export function resolveNavRole(
  user: { roles: string[] } | null,
  fallbackRole: UserRole
): UserRole {
  if (!user) return fallbackRole
  const r = user.roles.map((x) => x.toLowerCase())
  if (r.includes("org_admin") || r.includes("it_admin")) return USER_ROLE.ADMIN
  if (r.includes("manager") || r.includes("hr"))         return USER_ROLE.MANAGER
  return USER_ROLE.EMPLOYEE
}

export function filterNavItems<T extends { roles: UserRole[]; permission?: string }>(
  items: T[],
  navRole: UserRole,
  permissions: string[]
): T[] {
  return items.filter((item) => {
    if (!item.roles.includes(navRole)) return false
    if (item.permission && !permissions.includes(item.permission)) return false
    return true
  })
}
