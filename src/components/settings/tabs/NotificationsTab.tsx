"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SettingsSectionHeading } from "../SettingsSectionHeading";
import type { NotifChannel, NotifKey, NotifSetting } from "../settings.types";

const NOTIF_ITEMS: { key: NotifKey; label: string; description: string }[] = [
  {
    key: "approvals",
    label: "Approvals",
    description: "When a request you submitted is approved or rejected.",
  },
  {
    key: "mentions",
    label: "Mentions",
    description: "When someone mentions you in a comment or note.",
  },
  {
    key: "reminders",
    label: "Reminders",
    description: "Reminders to act on pending approvals assigned to you.",
  },
  {
    key: "statusUpdates",
    label: "Status updates",
    description: "When a ticket you own changes status.",
  },
  {
    key: "comments",
    label: "Comments",
    description: "Replies and new comments on your requests.",
  },
];

const INITIAL_SETTINGS: Record<NotifKey, NotifSetting> = {
  approvals:     { push: true,  email: true,  sms: false },
  mentions:      { push: true,  email: false, sms: false },
  reminders:     { push: false, email: true,  sms: false },
  statusUpdates: { push: true,  email: false, sms: false },
  comments:      { push: false, email: false, sms: false },
};

const CHANNELS: NotifChannel[] = ["push", "email", "sms"];

export function NotificationsTab() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  function toggle(key: NotifKey, channel: NotifChannel) {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  }

  return (
    <div>
      <SettingsSectionHeading
        title="Notification settings"
        description="We may still send you important notifications about your account outside of these settings."
      />

      {/* Column headers */}
      <div className="mb-2 flex items-center">
        <div className="flex-1" />
        <div className="flex w-[210px] shrink-0 justify-between pr-1">
          {CHANNELS.map((ch) => (
            <span
              key={ch}
              className="w-16 text-center text-[11px] font-semibold uppercase tracking-wider text-[#888780]"
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      <Separator className="mb-0 bg-[#E8E6DE]" />

      <div className="divide-y divide-[#E8E6DE]">
        {NOTIF_ITEMS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center gap-4 py-5">
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#2C2C2A]">{label}</p>
              <p className="mt-0.5 text-[12px] text-[#888780]">{description}</p>
            </div>
            <div className="flex w-[210px] shrink-0 items-center justify-between pr-1">
              {CHANNELS.map((channel) => (
                <div key={channel} className="flex w-16 justify-center">
                  <Switch
                    checked={settings[key][channel]}
                    onCheckedChange={() => toggle(key, channel)}
                    className="data-[state=checked]:bg-[#0F6E56]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
