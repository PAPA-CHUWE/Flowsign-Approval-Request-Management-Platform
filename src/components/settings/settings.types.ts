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

export type NotifChannel = "inApp" | "email" | "sms";

export type NotifKey =
  | "approvals"
  | "mentions"
  | "reminders"
  | "statusUpdates"
  | "comments"
  | "escalations";

export interface NotifSetting {
  inApp: boolean;
  email: boolean;
  sms: boolean;
}
