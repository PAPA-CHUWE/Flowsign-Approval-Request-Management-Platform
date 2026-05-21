"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SettingsSidebar } from "./SettingsSidebar";
import { GeneralTab } from "./tabs/GeneralTab";
import { PreferencesTab } from "./tabs/PreferencesTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { AccountTab } from "./tabs/AccountTab";
import { BillingTab } from "./tabs/BillingTab";
import type { SettingsTab } from "./settings.types";

const TAB_CONTENT: Record<SettingsTab, React.ReactNode> = {
  general:       <GeneralTab />,
  preferences:   <PreferencesTab />,
  security:      <SecurityTab />,
  notifications: <NotificationsTab />,
  account:       <AccountTab />,
  billing:       <BillingTab />,
};

export function SettingsShell() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-brand-neutral-dark">
            Settings
          </h1>
          <p className="mt-0.5 text-[13px] text-[#888780]">
            Manage your account, preferences, and workspace configuration.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <Separator orientation="vertical" className="bg-[#E8E6DE]" />
        <div className="flex-1 overflow-y-auto pb-8 pr-1">
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </div>
  );
}
