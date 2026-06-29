"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  BadgeCheck,
  ChevronUp,
  ClipboardCheck,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Rocket,
  Settings,
  TicketCheck,
  UserCog,
  Users,
  Workflow,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { clearAuthSession, logout as logoutUser } from "@/lib/api/auth";
import { getUserDisplayName, getUserInitials, getUserRoleLabel, useCurrentUser } from "@/hooks/use-current-user";
import { USER_ROLE, type UserRole } from "@/constants/role.constants";
import { navigationItems } from "@/config/navigation.config";
import { resolveNavRole, filterNavItems } from "@/lib/auth-utils";
import { useApprovalQueueCount } from "@/hooks/useApprovalQueueCount";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutModal } from "@/components/logout-modal-ui/logoutModal";

const NAV_ICONS: Record<string, React.ElementType> = {
  "/dashboard":      LayoutDashboard,
  "/requests":       FilePlus2,
  "/tickets":        TicketCheck,
  "/approvals":      ClipboardCheck,
  "/users":          Users,
  "/workflow-rules": Workflow,
  "/onboarding":     Rocket,
  "/settings":       Settings,
};

const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLE.EMPLOYEE]: "Employee",
  [USER_ROLE.MANAGER]:  "Manager",
  [USER_ROLE.ADMIN]:    "Admin",
};

const ROLE_CYCLE: UserRole[] = [USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER, USER_ROLE.ADMIN];
const ROLE_KEY = "flowsign_dev_role";
const ROLE_CHANGE_EVENT = "flowsign_dev_role_change";

function isUserRole(value: string | null): value is UserRole {
  return !!value && (Object.values(USER_ROLE) as string[]).includes(value);
}

function readStoredRole() {
  if (typeof window === "undefined") {
    return USER_ROLE.ADMIN;
  }

  const stored = localStorage.getItem(ROLE_KEY);
  return isUserRole(stored) ? stored : USER_ROLE.ADMIN;
}

function subscribeToRoleChanges(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(ROLE_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ROLE_CHANGE_EVENT, callback);
  };
}

function useStoredRole() {
  return useSyncExternalStore(
    subscribeToRoleChanges,
    readStoredRole,
    () => USER_ROLE.ADMIN
  );
}

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const role = useStoredRole();
  const { user } = useCurrentUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userInitials = getUserInitials(user);
  const userName = getUserDisplayName(user);
  const userRole = user ? getUserRoleLabel(user) : ROLE_LABELS[role];

  const signOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutUser();
    } catch {
      // Local session should still be cleared if the network logout fails.
    } finally {
      clearAuthSession();
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      router.push("/login");
      router.refresh();
    }
  };

  const navRole = resolveNavRole(user, role)

  const userPerms = user?.permissions ?? []
  const items = filterNavItems(navigationItems, navRole, userPerms)
  const approvalCount = useApprovalQueueCount();

  return (
    <aside className={cn("flex w-[220px] shrink-0 flex-col border-r border-[#E8E6DE] bg-white", className)}>
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
              {Icon && <Icon size={16} strokeWidth={active ? 2.5 : 2} />}
              {item.title}
              {item.href === "/approvals" && approvalCount > 0 && (
                <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0F6E56] px-1 text-[9px] font-bold text-white">
                  {approvalCount > 99 ? "99+" : approvalCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User stub — triggers dropdown */}
      <div className="border-t border-[#E8E6DE] px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2
                       text-left transition-colors duration-150
                       hover:bg-[#F1EFE8]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]
            border-none bg-transparent cursor-pointer"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[11px] font-bold text-[#0F6E56]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13px] font-semibold text-[#2C2C2A]">{userName}</p>
              <p className="truncate text-[11px] text-[#888780]">{userRole}</p>
            </div>
            <ChevronUp size={14} className="shrink-0 text-[#888780]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-52 mb-1">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">
                {user?.email ?? "admin@flowsign.app"}
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {/* Profile */}
              <DropdownMenuItem onClick={() => router.push("/profile")} className="flex items-center gap-2 cursor-pointer">
                <UserCog size={14} />
                Profile
              </DropdownMenuItem>

            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {/* Sign out */}
              <DropdownMenuItem
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut size={14} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LogoutModal
        open={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={signOut}
      />
    </aside>
  );
}

export function MobileDashboardNav() {
  const pathname = usePathname();
  const role = useStoredRole();
  const { user } = useCurrentUser();

  const userPerms = user?.permissions ?? []
  const navRole  = resolveNavRole(user, role)
  const items = filterNavItems(navigationItems, navRole, userPerms)

  return (
    <nav
      aria-label="Dashboard navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E6DE] bg-white/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-md auto-cols-fr grid-flow-col gap-1 overflow-x-auto">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.href];
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[10px] px-2 text-[11px] font-semibold no-underline transition-colors",
                active
                  ? "bg-[#E1F5EE] text-[#0F6E56]"
                  : "text-brand-neutral-mid hover:bg-brand-neutral-pale hover:text-brand-neutral-dark",
              )}
            >
              {Icon && <Icon size={17} strokeWidth={active ? 2.5 : 2} />}
              <span className="max-w-full truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
