import Link from "next/link"

import { USER_ROLE, type UserRole } from "@/constants/role.constants"
import { navigationItems } from "@/config/navigation.config"

interface AppSidebarProps {
  role?: UserRole
}

export function AppSidebar({ role = USER_ROLE.EMPLOYEE }: AppSidebarProps) {
  const items = navigationItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 px-3 py-4">
      <nav className="grid gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            href={item.href}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
