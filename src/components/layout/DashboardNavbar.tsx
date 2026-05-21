"use client";

import { Bell, Search } from "lucide-react";
import { getUserInitials, useCurrentUser } from "@/hooks/use-current-user";

export function DashboardNavbar() {
  const { user } = useCurrentUser();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E8E6DE] bg-white px-4 sm:px-6">
      <div className="flex h-9 w-full max-w-[320px] items-center gap-2 rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] px-3">
        <Search size={14} color="#888780" strokeWidth={2} />
        <input
          className="min-w-0 flex-1 bg-transparent font-dm-sans text-[13px] text-brand-neutral-dark outline-none placeholder:text-[#B4B2A9]"
          placeholder="Search..."
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] transition-colors duration-150 hover:bg-brand-teal-pale">
          <Bell size={16} color="#5F5E5A" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-teal ring-2 ring-white" />
        </button>
        <div className="flex h-9 w-9 select-none items-center justify-center rounded-full bg-brand-teal-pale text-[12px] font-bold text-brand-teal">
          {getUserInitials(user)}
        </div>
      </div>
    </header>
  );
}
