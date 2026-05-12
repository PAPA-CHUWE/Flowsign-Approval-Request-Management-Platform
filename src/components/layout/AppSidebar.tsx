"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  LayoutDashboard,
  FilePlus2,
  TicketCheck,
  ClipboardCheck,
  Settings,
} from "lucide-react";

import { USER_ROLE, type UserRole } from "@/constants/role.constants";
import { navigationItems } from "@/config/navigation.config";

const NAV_ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/requests":  FilePlus2,
  "/tickets":   TicketCheck,
  "/approvals": ClipboardCheck,
  "/settings":  Settings,
};

interface AppSidebarProps {
  role?: UserRole;
}

export function AppSidebar({ role = USER_ROLE.EMPLOYEE }: AppSidebarProps) {
  const pathname = usePathname();
  const items = navigationItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-[#E8E6DE] bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[#E8E6DE] px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#0F6E56] to-[#1D9E75]">
          <BadgeCheck size={16} color="#fff" strokeWidth={2.5} />
        </div>
        <span className="text-[16px] font-bold tracking-[-0.02em] text-[#2C2C2A]">
          Flow<span className="text-[#0F6E56]">sign</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.href];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-[#E1F5EE] text-[#0F6E56] font-semibold"
                  : "text-[#5F5E5A] hover:bg-[#F1EFE8] hover:text-[#2C2C2A]",
              ].join(" ")}
            >
              {Icon && (
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              )}
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User stub */}
      <div className="border-t border-[#E8E6DE] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[11px] font-bold text-[#0F6E56]">
            AU
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#2C2C2A]">A. User</p>
            <p className="truncate text-[11px] text-[#888780]">Employee</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
