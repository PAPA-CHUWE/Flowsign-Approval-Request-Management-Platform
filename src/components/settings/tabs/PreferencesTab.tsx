"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useCurrentOrganizationSettings } from "@/hooks/use-current-organization-settings";
import { applyOrganizationBranding } from "@/hooks/use-organization-branding";
import {
  updateCurrentOrganizationSettings,
  type OrganizationSettings,
} from "@/lib/api/organizations";
import { SettingsFieldRow } from "../SettingsFieldRow";
import { SettingsSectionHeading } from "../SettingsSectionHeading";
import { SettingsToggleRow } from "../SettingsToggleRow";

const DEFAULT_SETTINGS: Pick<
  OrganizationSettings,
  "profile" | "branding" | "workflow" | "features"
> = {
  profile: {
    legalName: null,
    displayName: null,
    industry: null,
    companySize: null,
    website: null,
    workEmail: null,
    phoneNumber: null,
    fax: null,
    timezone: "Africa/Harare",
    locale: "en",
    currency: "USD",
    address: {
      line1: null,
      line2: null,
      city: null,
      state: null,
      postalCode: null,
      country: null,
    },
  },
  branding: {
    logoUrl: null,
    primaryColor: "#0F6E56",
    accentColor: "#1D9E75",
    useCustomBranding: false,
    supportEmail: null,
  },
  workflow: {
    defaultEscalationHours: 24,
    defaultReminderHours: 12,
    allowDelegation: true,
    requireRejectionReason: true,
  },
  features: {
    workflowBuilder: true,
    customRequestTypes: true,
    analytics: true,
    auditExports: true,
    webhooks: false,
    multiCurrency: false,
    delegation: true,
    escalations: true,
  },
};

function nullable(value: string) {
  return value.trim() || null;
}

interface PreferencesFormProps {
  settings: OrganizationSettings;
  onSaved: (settings: OrganizationSettings) => void;
}

function PreferencesForm({ settings, onSaved }: PreferencesFormProps) {
  const [compactView, setCompactView] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(settings.branding.primaryColor);
  const [accentColor, setAccentColor] = useState(settings.branding.accentColor);
  const [useCustomBranding, setUseCustomBranding] = useState(
    settings.branding.useCustomBranding
  );
  const [supportEmail, setSupportEmail] = useState(
    settings.branding.supportEmail ?? ""
  );
  const [defaultEscalationHours, setDefaultEscalationHours] = useState(
    String(settings.workflow.defaultEscalationHours)
  );
  const [defaultReminderHours, setDefaultReminderHours] = useState(
    String(settings.workflow.defaultReminderHours)
  );
  const [allowDelegation, setAllowDelegation] = useState(
    settings.workflow.allowDelegation
  );
  const [requireRejectionReason, setRequireRejectionReason] = useState(
    settings.workflow.requireRejectionReason
  );
  const [workflowBuilder, setWorkflowBuilder] = useState(
    settings.features.workflowBuilder
  );
  const [customRequestTypes, setCustomRequestTypes] = useState(
    settings.features.customRequestTypes
  );
  const [webhooks, setWebhooks] = useState(settings.features.webhooks);
  const [multiCurrency, setMultiCurrency] = useState(settings.features.multiCurrency);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  function clearSavedMessage() {
    setSavedMessage("");
  }

  async function savePreferences() {
    if (isSaving) return;

    const escalationHours = Number(defaultEscalationHours);
    const reminderHours = Number(defaultReminderHours);

    if (!Number.isFinite(escalationHours) || escalationHours < 1) {
      setError("Default escalation hours must be greater than 0.");
      return;
    }

    if (!Number.isFinite(reminderHours) || reminderHours < 1) {
      setError("Default reminder hours must be greater than 0.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await updateCurrentOrganizationSettings({
        branding: {
          primaryColor,
          accentColor,
          useCustomBranding,
          supportEmail: nullable(supportEmail),
        },
        workflow: {
          defaultEscalationHours: escalationHours,
          defaultReminderHours: reminderHours,
          allowDelegation,
          requireRejectionReason,
        },
        features: {
          workflowBuilder,
          customRequestTypes,
          webhooks,
          multiCurrency,
        },
      });

      onSaved(response.responseBody.settings);
      applyOrganizationBranding(response.responseBody.settings.branding);
      setSavedMessage("Preferences saved.");
      toast.success("Preferences saved", {
        description: "Workspace settings were updated successfully.",
      });
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Could not save preferences.";

      setError(message);
      toast.error("Preferences not saved", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {savedMessage && (
        <p className="text-[12px] font-medium text-[#0F6E56]">{savedMessage}</p>
      )}

      <div>
        <SettingsToggleRow
          title="Compact view"
          description="Reduce spacing in lists and tables."
          checked={compactView}
          onCheckedChange={setCompactView}
          showSeparator={false}
        />
      </div>

      <Separator className="bg-[#E8E6DE]" />

      <div className="grid gap-4 sm:grid-cols-3">
        <SettingsFieldRow label="Locale" htmlFor="locale">
          <Input
            id="locale"
            value={settings.profile.locale}
            readOnly
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Currency" htmlFor="currency">
          <Input
            id="currency"
            value={settings.profile.currency}
            readOnly
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Timezone" htmlFor="timezone">
          <Input
            id="timezone"
            value={settings.profile.timezone}
            readOnly
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
        </SettingsFieldRow>
      </div>

      <Separator className="bg-[#E8E6DE]" />

      <div>
        <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
          Branding
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Primary color" htmlFor="primary-color">
            <Input
              id="primary-color"
              value={primaryColor}
              onChange={(event) => {
                setPrimaryColor(event.target.value);
                clearSavedMessage();
              }}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Accent color" htmlFor="accent-color">
            <Input
              id="accent-color"
              value={accentColor}
              onChange={(event) => {
                setAccentColor(event.target.value);
                clearSavedMessage();
              }}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Support email" htmlFor="support-email">
            <Input
              id="support-email"
              type="email"
              value={supportEmail}
              onChange={(event) => {
                setSupportEmail(event.target.value);
                clearSavedMessage();
              }}
              placeholder="support@solvifytech.com"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <div className="flex items-center justify-between rounded-[8px] border border-[#E8E6DE] px-4 py-3 dark:border-border">
            <div>
              <p className="text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
                Custom branding
              </p>
              <p className="text-[12px] text-[#888780]">Use workspace colors.</p>
            </div>
            <Switch
              checked={useCustomBranding}
              onCheckedChange={(checked) => {
                setUseCustomBranding(checked);
                clearSavedMessage();
              }}
              className="data-[state=checked]:bg-[#0F6E56]"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-[#E8E6DE]" />

      <div>
        <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
          Workflow
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Escalation hours" htmlFor="escalation-hours">
            <Input
              id="escalation-hours"
              type="number"
              min={1}
              value={defaultEscalationHours}
              onChange={(event) => {
                setDefaultEscalationHours(event.target.value);
                clearSavedMessage();
              }}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Reminder hours" htmlFor="reminder-hours">
            <Input
              id="reminder-hours"
              type="number"
              min={1}
              value={defaultReminderHours}
              onChange={(event) => {
                setDefaultReminderHours(event.target.value);
                clearSavedMessage();
              }}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
        </div>
        <div className="mt-4 space-y-3">
          {[
            {
              label: "Allow delegation",
              checked: allowDelegation,
              onCheckedChange: setAllowDelegation,
            },
            {
              label: "Require rejection reason",
              checked: requireRejectionReason,
              onCheckedChange: setRequireRejectionReason,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
                {item.label}
              </p>
              <Switch
                checked={item.checked}
                onCheckedChange={(checked) => {
                  item.onCheckedChange(checked);
                  clearSavedMessage();
                }}
                className="data-[state=checked]:bg-[#0F6E56]"
              />
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-[#E8E6DE]" />

      <div>
        <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
          Features
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              label: "Workflow builder",
              checked: workflowBuilder,
              onCheckedChange: setWorkflowBuilder,
            },
            {
              label: "Custom request types",
              checked: customRequestTypes,
              onCheckedChange: setCustomRequestTypes,
            },
            {
              label: "Webhooks",
              checked: webhooks,
              onCheckedChange: setWebhooks,
            },
            {
              label: "Multi-currency",
              checked: multiCurrency,
              onCheckedChange: setMultiCurrency,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-[8px] border border-[#E8E6DE] px-4 py-3 dark:border-border">
              <p className="text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
                {item.label}
              </p>
              <Switch
                checked={item.checked}
                onCheckedChange={(checked) => {
                  item.onCheckedChange(checked);
                  clearSavedMessage();
                }}
                className="data-[state=checked]:bg-[#0F6E56]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={savePreferences}
          className="h-8 rounded-[8px] bg-brand-teal px-5 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving
            </>
          ) : (
            "Save preferences"
          )}
        </Button>
      </div>
    </div>
  );
}

export function PreferencesTab() {
  const { settings, isLoading, error, setSettings } = useCurrentOrganizationSettings();
  const mergedSettings = settings
    ? {
        ...settings,
        profile: { ...DEFAULT_SETTINGS.profile, ...settings.profile },
        branding: { ...DEFAULT_SETTINGS.branding, ...settings.branding },
        workflow: { ...DEFAULT_SETTINGS.workflow, ...settings.workflow },
        features: { ...DEFAULT_SETTINGS.features, ...settings.features },
      }
    : ({ ...DEFAULT_SETTINGS } as OrganizationSettings);

  return (
    <div>
      <SettingsSectionHeading
        title="Preferences"
        description="Customise your dashboard experience."
      />

      {isLoading && (
        <p className="mb-4 text-[12px] text-[#888780]">
          Loading organization preferences...
        </p>
      )}
      {error && (
        <p className="mb-4 text-[12px] font-medium text-brand-danger-text">
          {error}
        </p>
      )}

      <PreferencesForm
        key={settings ? "loaded" : "defaults"}
        settings={mergedSettings}
        onSaved={setSettings}
      />
    </div>
  );
}
