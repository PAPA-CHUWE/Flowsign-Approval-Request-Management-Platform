import {
  User,
  SlidersHorizontal,
  ShieldCheck,
  Bell,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import type { SettingsNavItem, SettingsTab } from "./settings.types";

const NAV_ITEMS: SettingsNavItem[] = [
  { id: "general",       label: "General Information", icon: User },
  { id: "preferences",   label: "Preferences",         icon: SlidersHorizontal },
  { id: "security",      label: "Security",            icon: ShieldCheck },
  { id: "notifications", label: "Notifications",       icon: Bell },
  { id: "account",       label: "Account",             icon: User },
  { id: "billing",       label: "Billing",             icon: CreditCard },
];

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <nav className="flex w-[200px] shrink-0 flex-col gap-0.5">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={[
              "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-150 text-left",
              active
                ? "bg-[#E1F5EE] text-[#0F6E56] font-semibold"
                : "text-[#5F5E5A] hover:bg-[#F1EFE8] hover:text-[#2C2C2A]",
            ].join(" ")}
          >
            <Icon size={15} strokeWidth={active ? 2.5 : 2} />
            <span className="flex-1">{label}</span>
            {active && <ChevronRight size={13} strokeWidth={2.5} />}
          </button>
        );
      })}
    </nav>
  );
}
