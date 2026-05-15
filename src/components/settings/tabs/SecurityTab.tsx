import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SettingsSectionHeading } from "../SettingsSectionHeading";
import { SettingsFieldRow } from "../SettingsFieldRow";

export function SecurityTab() {
  return (
    <div>
      <SettingsSectionHeading
        title="Security"
        description="Manage your password and account access."
      />

      <div className="space-y-6">
        <div>
          <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A]">Change password</p>
          <div className="max-w-md space-y-4">
            <SettingsFieldRow label="Current password" htmlFor="current-password">
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
              />
            </SettingsFieldRow>
            <SettingsFieldRow label="New password" htmlFor="new-password">
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
              />
            </SettingsFieldRow>
            <SettingsFieldRow label="Confirm new password" htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] focus-visible:ring-[#0F6E56]"
              />
            </SettingsFieldRow>
          </div>
        </div>

        <Separator className="bg-[#E8E6DE]" />

        <div>
          <p className="mb-1 text-[13px] font-semibold text-[#2C2C2A]">
            Two-factor authentication
          </p>
          <p className="mb-3 text-[12px] text-[#888780]">
            Add an extra layer of security to your account.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
          >
            Enable 2FA
          </Button>
        </div>
      </div>
    </div>
  );
}
