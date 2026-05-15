import type { ElementType } from "react";

export type SettingsTab =
  | "general"
  | "preferences"
  | "security"
  | "notifications"
  | "account"
  | "billing";

export interface SettingsNavItem {
  id: SettingsTab;
  label: string;
  icon: ElementType;
}

export type NotifChannel = "push" | "email" | "sms";

export type NotifKey =
  | "approvals"
  | "mentions"
  | "reminders"
  | "statusUpdates"
  | "comments";

export interface NotifSetting {
  push: boolean;
  email: boolean;
  sms: boolean;
}
