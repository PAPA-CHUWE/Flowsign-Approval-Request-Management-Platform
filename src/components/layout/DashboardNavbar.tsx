"use client";

import { Bell, Search } from "lucide-react";

export function DashboardNavbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E8E6DE] bg-white px-6 gap-4">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] px-3 h-9 w-full max-w-[320px]">
        <Search size={14} color="#888780" strokeWidth={2} />
        <input
          className="flex-1 bg-transparent text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] outline-none font-dm-sans"
          placeholder="Search…"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E8E6DE] bg-[#FAFAF8] hover:bg-[#E1F5EE] transition-colors duration-150 cursor-pointer">
          <Bell size={16} color="#5F5E5A" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#0F6E56] ring-2 ring-white" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE] text-[12px] font-bold text-[#0F6E56] select-none">
          AU
        </div>
      </div>
    </header>
  );
}
