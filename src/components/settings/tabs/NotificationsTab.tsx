"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCurrentOrganizationSettings } from "@/hooks/use-current-organization-settings";
import { updateCurrentOrganizationSettings } from "@/lib/api/organizations";
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
  {
    key: "escalations",
    label: "Escalations",
    description: "When requests are escalated or require urgent action.",
  },
];

const INITIAL_SETTINGS: Record<NotifKey, NotifSetting> = {
  approvals:     { inApp: true,  email: true,  sms: false },
  mentions:      { inApp: true,  email: false, sms: false },
  reminders:     { inApp: true,  email: true,  sms: false },
  statusUpdates: { inApp: true,  email: false, sms: false },
  comments:      { inApp: true,  email: false, sms: false },
  escalations:   { inApp: true,  email: true,  sms: false },
};

const CHANNELS: { key: NotifChannel; label: string }[] = [
  { key: "inApp", label: "In app" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
];

interface NotificationsFormProps {
  defaultChannels: NotifSetting;
  initialSettings: Record<NotifKey, NotifSetting>;
  reminderHours: number[];
  onSaved: (settings: Awaited<ReturnType<typeof updateCurrentOrganizationSettings>>["responseBody"]["settings"]) => void;
}

function parseReminderHours(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function NotificationsForm({
  defaultChannels,
  initialSettings,
  reminderHours,
  onSaved,
}: NotificationsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [channels, setChannels] = useState(defaultChannels);
  const [hours, setHours] = useState(() => reminderHours.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  function toggle(key: NotifKey, channel: NotifChannel) {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
    setSavedMessage("");
  }

  function toggleDefault(channel: NotifChannel) {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
    setSavedMessage("");
  }

  async function save() {
    if (isSaving) return;

    const parsedHours = parseReminderHours(hours);

    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await updateCurrentOrganizationSettings({
        notifications: {
          defaultChannels: channels,
          events: settings,
          reminderHours: parsedHours,
        },
      });

      onSaved(response.responseBody.settings);
      setSavedMessage("Notification settings saved.");
      toast.success("Notification settings saved", {
        description: "Notification channels were updated successfully.",
      });
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not save notification settings.";

      setError(message);
      toast.error("Notification settings not saved", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <SettingsSectionHeading
        title="Notification settings"
        description="We may still send you important notifications about your account outside of these settings."
      />

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {savedMessage && (
        <p className="mb-4 text-[12px] font-medium text-[#0F6E56]">
          {savedMessage}
        </p>
      )}

      <div className="mb-5 rounded-[8px] border border-[#E8E6DE] p-4 dark:border-border">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
              Default channels
            </p>
            <p className="mt-0.5 text-[12px] text-[#888780]">
              Applied to new notification events.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {CHANNELS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-[12px] text-[#5F5E5A] dark:text-muted-foreground">
                <Switch
                  checked={channels[key]}
                  onCheckedChange={() => toggleDefault(key)}
                  className="data-[state=checked]:bg-[#0F6E56]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <Input
          value={hours}
          onChange={(event) => {
            setHours(event.target.value);
            setSavedMessage("");
          }}
          placeholder="24, 48"
          className="h-9 max-w-xs rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
        />
        <p className="mt-1 text-[11px] text-[#888780]">
          Reminder hours, separated by commas.
        </p>
      </div>

      <div className="mb-2 flex items-center">
        <div className="flex-1" />
        <div className="flex w-[210px] shrink-0 justify-between pr-1">
          {CHANNELS.map(({ key, label }) => (
            <span
              key={key}
              className="w-16 text-center text-[11px] font-semibold uppercase tracking-wider text-[#888780]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <Separator className="mb-0 bg-[#E8E6DE]" />

      <div className="divide-y divide-[#E8E6DE]">
        {NOTIF_ITEMS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center gap-4 py-5">
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">{label}</p>
              <p className="mt-0.5 text-[12px] text-[#888780]">{description}</p>
            </div>
            <div className="flex w-[210px] shrink-0 items-center justify-between pr-1">
              {CHANNELS.map(({ key: channel }) => (
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

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={save}
          className="h-8 rounded-[8px] bg-brand-teal px-5 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving
            </>
          ) : (
            "Save notifications"
          )}
        </Button>
      </div>
    </div>
  );
}

export function NotificationsTab() {
  const { settings, isLoading, error, setSettings } = useCurrentOrganizationSettings();
  const notifications = settings?.notifications;

  return (
    <div>
      {isLoading && (
        <p className="mb-4 text-[12px] text-[#888780]">
          Loading notification settings...
        </p>
      )}
      {error && (
        <p className="mb-4 text-[12px] font-medium text-brand-danger-text">
          {error}
        </p>
      )}
      <NotificationsForm
        key={settings ? "loaded" : "defaults"}
        defaultChannels={notifications?.defaultChannels ?? INITIAL_SETTINGS.approvals}
        initialSettings={notifications?.events ?? INITIAL_SETTINGS}
        reminderHours={notifications?.reminderHours ?? [24, 48]}
        onSaved={setSettings}
      />
    </div>
  );
}
