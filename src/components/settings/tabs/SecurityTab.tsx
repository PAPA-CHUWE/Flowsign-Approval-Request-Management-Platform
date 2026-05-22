"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useCurrentOrganizationSettings } from "@/hooks/use-current-organization-settings";
import {
  updateCurrentOrganizationSettings,
  type OrganizationSecuritySettings,
} from "@/lib/api/organizations";
import { changePassword } from "@/lib/api/auth";
import { SettingsSectionHeading } from "../SettingsSectionHeading";
import { SettingsFieldRow } from "../SettingsFieldRow";

const DEFAULT_SECURITY: OrganizationSecuritySettings = {
  enforceMfa: false,
  allowedDomains: [],
  sessionTimeoutMinutes: 480,
  passwordMinLength: 8,
  ssoEnabled: false,
  ssoProvider: null,
};

function formatProvider(provider: string | null) {
  return provider || "Not configured";
}

function parseDomains(value: string) {
  return value
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean);
}

interface SecurityFormProps {
  initialSecurity: OrganizationSecuritySettings;
  onSaved: (settings: Awaited<ReturnType<typeof updateCurrentOrganizationSettings>>["responseBody"]["settings"]) => void;
}

function SecurityForm({ initialSecurity, onSaved }: SecurityFormProps) {
  const [enforceMfa, setEnforceMfa] = useState(initialSecurity.enforceMfa);
  const [allowedDomains, setAllowedDomains] = useState(() =>
    initialSecurity.allowedDomains.join(", ")
  );
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(
    String(initialSecurity.sessionTimeoutMinutes)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  async function saveSecurity() {
    if (isSaving) return;

    const timeout = Number(sessionTimeoutMinutes);

    if (!Number.isFinite(timeout) || timeout < 15) {
      setError("Session timeout must be at least 15 minutes.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await updateCurrentOrganizationSettings({
        security: {
          enforceMfa,
          allowedDomains: parseDomains(allowedDomains),
          sessionTimeoutMinutes: timeout,
        },
      });

      onSaved(response.responseBody.settings);
      setSavedMessage("Security settings saved.");
      toast.success("Security settings saved", {
        description: "Security preferences were updated successfully.",
      });
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not save security settings.";

      setError(message);
      toast.error("Security settings not saved", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function clearSavedMessage() {
    setSavedMessage("");
  }

  return (
    <>
      {error && (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {savedMessage && (
        <p className="text-[12px] font-medium text-[#0F6E56]">{savedMessage}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SettingsFieldRow label="Session timeout (minutes)" htmlFor="session-timeout">
          <Input
            id="session-timeout"
            type="number"
            min={15}
            value={sessionTimeoutMinutes}
            onChange={(event) => {
              setSessionTimeoutMinutes(event.target.value);
              clearSavedMessage();
            }}
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Minimum password length" htmlFor="password-min-length">
          <Input
            id="password-min-length"
            type="number"
            min={8}
            value={initialSecurity.passwordMinLength}
            readOnly
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
        </SettingsFieldRow>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="pr-6">
            <p className="text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
              Enforce MFA
            </p>
            <p className="mt-0.5 text-[12px] text-[#888780]">
              Require multi-factor authentication for users.
            </p>
          </div>
          <Switch
            checked={enforceMfa}
            onCheckedChange={(checked) => {
              setEnforceMfa(checked);
              clearSavedMessage();
            }}
            className="data-[state=checked]:bg-[#0F6E56]"
          />
        </div>
        <SettingsFieldRow label="Allowed domains" htmlFor="allowed-domains">
          <Input
            id="allowed-domains"
            value={allowedDomains}
            onChange={(event) => {
              setAllowedDomains(event.target.value);
              clearSavedMessage();
            }}
            placeholder="solvifytech.com"
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
        </SettingsFieldRow>
        <p className="-mt-3 text-[11px] text-[#888780]">
          Separate multiple domains with commas.
        </p>
        <div className="flex items-center justify-between">
          <div className="pr-6">
            <p className="text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
              Single sign-on
            </p>
            <p className="mt-0.5 text-[12px] text-[#888780]">
              Provider: {formatProvider(initialSecurity.ssoProvider)}
            </p>
          </div>
          <Switch
            checked={initialSecurity.ssoEnabled}
            disabled
            className="data-[state=checked]:bg-[#0F6E56]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={saveSecurity}
          className="h-8 rounded-[8px] bg-brand-teal px-5 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving
            </>
          ) : (
            "Save security"
          )}
        </Button>
      </div>
    </>
  );
}

function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [current,  setCurrent]  = useState("")
  const [next,     setNext]     = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState(false)

  const mismatch    = confirm.length > 0 && next !== confirm
  const tooShort    = next.length > 0 && next.length < minLength
  const valid       = current.trim().length > 0 && next.length >= minLength && next === confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || isSaving) return

    setIsSaving(true)
    setError("")
    setSuccess(false)

    try {
      await changePassword({ currentPassword: current, newPassword: next })
      setSuccess(true)
      setCurrent("")
      setNext("")
      setConfirm("")
      toast.success("Password changed", {
        description: "Your password was updated successfully.",
      })
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not change password."
      setError(message)
      toast.error("Password not changed", { description: message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A] dark:text-foreground">
        Change password
      </p>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <p className="text-[12px] font-medium text-[#0F6E56]">Password changed successfully.</p>
        )}

        <SettingsFieldRow label="Current password" htmlFor="current-password">
          <Input
            id="current-password"
            type="password"
            placeholder="........"
            value={current}
            onChange={(e) => { setCurrent(e.target.value); setSuccess(false) }}
            disabled={isSaving}
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
        </SettingsFieldRow>

        <SettingsFieldRow label="New password" htmlFor="new-password">
          <Input
            id="new-password"
            type="password"
            placeholder="........"
            value={next}
            onChange={(e) => { setNext(e.target.value); setSuccess(false) }}
            disabled={isSaving}
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
          {tooShort && (
            <p className="mt-1 text-[11px] text-[#A32D2D]">
              Must be at least {minLength} characters.
            </p>
          )}
        </SettingsFieldRow>

        <SettingsFieldRow label="Confirm new password" htmlFor="confirm-password">
          <Input
            id="confirm-password"
            type="password"
            placeholder="........"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setSuccess(false) }}
            disabled={isSaving}
            className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
          />
          {mismatch && (
            <p className="mt-1 text-[11px] text-[#A32D2D]">Passwords do not match.</p>
          )}
        </SettingsFieldRow>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!valid || isSaving}
            className="h-8 rounded-[8px] bg-brand-teal px-5 text-[12px] font-semibold text-white hover:bg-[#0c5e49] disabled:opacity-40"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export function SecurityTab() {
  const { settings, isLoading, error, setSettings } = useCurrentOrganizationSettings();
  const security = settings?.security ?? DEFAULT_SECURITY;

  return (
    <div>
      <SettingsSectionHeading
        title="Security"
        description="Manage your password and account access."
      />

      <div className="space-y-6">
        {isLoading && (
          <p className="text-[12px] text-[#888780]">Loading security settings...</p>
        )}
        {error && (
          <p className="text-[12px] font-medium text-brand-danger-text">{error}</p>
        )}

        <SecurityForm
          key={settings ? "loaded" : "defaults"}
          initialSecurity={security}
          onSaved={setSettings}
        />

        <Separator className="bg-[#E8E6DE]" />

        <ChangePasswordForm minLength={security.passwordMinLength} />
      </div>
    </div>
  );
}
