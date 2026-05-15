"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SettingsSectionHeading } from "../SettingsSectionHeading";
import { SettingsToggleRow } from "../SettingsToggleRow";

export function PreferencesTab() {
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [language, setLanguage] = useState("english");

  return (
    <div>
      <SettingsSectionHeading
        title="Preferences"
        description="Customise your dashboard experience."
      />

      <div className="max-w-lg">
        <SettingsToggleRow
          title="Dark mode"
          description="Switch to a darker colour scheme."
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
        <SettingsToggleRow
          title="Compact view"
          description="Reduce spacing in lists and tables."
          checked={compactView}
          onCheckedChange={setCompactView}
          showSeparator={false}
        />

        <Separator className="bg-[#E8E6DE]" />

        <div className="flex items-center justify-between py-4">
          <div className="pr-6">
            <p className="text-[13px] font-semibold text-[#2C2C2A]">Language</p>
            <p className="mt-0.5 text-[12px] text-[#888780]">
              Choose your preferred language.
            </p>
          </div>
          <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
            <SelectTrigger className="h-9 w-[140px] rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] focus:ring-[#0F6E56]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="arabic">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
