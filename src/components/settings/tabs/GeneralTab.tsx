import { Camera } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SettingsSectionHeading } from "../SettingsSectionHeading";
import { SettingsFieldRow } from "../SettingsFieldRow";

export function GeneralTab() {
  return (
    <div className="space-y-8">
      <SettingsSectionHeading
        title="General Information"
        description="Update your profile and organisation details."
      />

      {/* Avatar */}
      <div>
        <p className="mb-3 text-[13px] font-semibold text-[#2C2C2A]">Profile picture</p>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-[72px] w-[72px]">
              <AvatarFallback className="bg-[#E1F5EE] text-[20px] font-bold text-[#0F6E56]">
                AU
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-[#E8E6DE] bg-white shadow-sm">
              <Camera size={12} className="text-[#5F5E5A]" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-8 rounded-[8px] bg-[#0F6E56] px-4 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
            >
              Upload new photo
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#5F5E5A] hover:bg-[#F6F4EF]"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-[#E8E6DE]" />

      {/* Personal details */}
      <div>
        <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A]">Personal details</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Full name" htmlFor="full-name">
            <Input
              id="full-name"
              defaultValue="A. User"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Role / Title" htmlFor="role">
            <Input
              id="role"
              defaultValue="Employee"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Email address" htmlFor="email">
            <Input
              id="email"
              type="email"
              defaultValue="a.user@company.com"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Location" htmlFor="location">
            <Input
              id="location"
              placeholder="City, Country"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
        </div>
      </div>

      <Separator className="bg-[#E8E6DE]" />

      {/* Organisation */}
      <div>
        <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A]">Organisation information</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Business name" htmlFor="business-name">
            <Input
              id="business-name"
              placeholder="Acme Corp"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Work email" htmlFor="work-email">
            <Input
              id="work-email"
              type="email"
              placeholder="contact@acme.com"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Phone number" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Fax" htmlFor="fax">
            <Input
              id="fax"
              type="tel"
              placeholder="+1 (555) 000-0001"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
        </div>
      </div>

      <Separator className="bg-[#E8E6DE]" />

      {/* Address */}
      <div>
        <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A]">Address</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Country" htmlFor="country">
            <Input
              id="country"
              placeholder="United States"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="City" htmlFor="city">
            <Input
              id="city"
              placeholder="San Francisco"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Postcode" htmlFor="postcode">
            <Input
              id="postcode"
              placeholder="94105"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="State" htmlFor="state">
            <Input
              id="state"
              placeholder="California"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
        </div>
      </div>
    </div>
  );
}
