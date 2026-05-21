"use client";

import { useState } from "react";
import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SettingsSectionHeading } from "../SettingsSectionHeading";
import { SettingsFieldRow } from "../SettingsFieldRow";
import { getUserDisplayName, getUserInitials, getUserRoleLabel, useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentOrganization } from "@/hooks/use-current-organization";
import {
  updateCurrentOrganizationProfile,
  type CurrentOrganization,
} from "@/lib/api/organizations";

function fieldValue(value: string | null | undefined) {
  return value ?? "";
}

function nullableValue(value: string) {
  return value.trim() || null;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type OrganizationForm = {
  name: string;
  slug: string;
  displayName: string;
  legalName: string;
  industry: string;
  companySize: string;
  website: string;
  workEmail: string;
  phoneNumber: string;
  fax: string;
  timezone: string;
  locale: string;
  currency: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

function createOrganizationForm(organization: CurrentOrganization | null): OrganizationForm {
  const profile = organization?.profile;
  const address = profile?.address;

  return {
    name: organization?.name ?? "",
    slug: organization?.slug ?? "",
    displayName: fieldValue(profile?.displayName),
    legalName: fieldValue(profile?.legalName),
    industry: fieldValue(profile?.industry),
    companySize: fieldValue(profile?.companySize),
    website: fieldValue(profile?.website),
    workEmail: fieldValue(profile?.workEmail),
    phoneNumber: fieldValue(profile?.phoneNumber),
    fax: fieldValue(profile?.fax),
    timezone: profile?.timezone ?? "Africa/Harare",
    locale: profile?.locale ?? "en",
    currency: profile?.currency ?? "USD",
    line1: fieldValue(address?.line1),
    line2: fieldValue(address?.line2),
    city: fieldValue(address?.city),
    state: fieldValue(address?.state),
    postalCode: fieldValue(address?.postalCode),
    country: fieldValue(address?.country),
  };
}

interface OrganizationProfileFormProps {
  organization: CurrentOrganization | null;
  onUpdated: (organization: CurrentOrganization) => void;
}

function OrganizationProfileForm({ organization, onUpdated }: OrganizationProfileFormProps) {
  const [form, setForm] = useState(() => createOrganizationForm(organization));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave =
    form.name.trim().length > 0 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug);

  const setField =
    (field: keyof OrganizationForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "slug" ? slugify(event.target.value) : event.target.value;

      setForm((current) => ({ ...current, [field]: value }));
    };

  const reset = () => {
    setForm(createOrganizationForm(organization));
    setError("");
  };

  const save = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await updateCurrentOrganizationProfile({
        name: form.name.trim(),
        slug: form.slug,
        profile: {
          legalName: nullableValue(form.legalName),
          industry: nullableValue(form.industry),
          website: nullableValue(form.website),
          timezone: form.timezone.trim() || "Africa/Harare",
          currency: form.currency.trim() || "USD",
          address: {
            line1: nullableValue(form.line1),
            line2: nullableValue(form.line2),
            city: nullableValue(form.city),
            state: nullableValue(form.state),
            postalCode: nullableValue(form.postalCode),
            country: nullableValue(form.country),
          },
        },
      });

      onUpdated(response.responseBody.organization);
      toast.success("Organization profile saved", {
        description: "Profile details were updated successfully.",
      });
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not update organization.";

      setError(message);
      toast.error("Organization profile not saved", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {error ? (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-[#2C2C2A]">Organisation information</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={reset}
              className="h-8 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#5F5E5A] hover:bg-[#F6F4EF]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canSave || isSaving}
              onClick={save}
              className="h-8 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Business name" htmlFor="business-name">
            <Input
              id="business-name"
              value={form.name}
              onChange={setField("name")}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Legal name" htmlFor="legal-name">
            <Input
              id="legal-name"
              value={form.legalName}
              onChange={setField("legalName")}
              placeholder="Not provided"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Display name" htmlFor="display-name">
            <Input
              id="display-name"
              value={form.displayName}
              onChange={setField("displayName")}
              placeholder={organization?.name ?? "Not provided"}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Organisation slug" htmlFor="organization-slug">
            <Input
              id="organization-slug"
              value={form.slug}
              onChange={setField("slug")}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Work email" htmlFor="work-email">
            <Input
              id="work-email"
              type="email"
              value={form.workEmail}
              onChange={setField("workEmail")}
              placeholder="Not provided"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Phone number" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              value={form.phoneNumber}
              onChange={setField("phoneNumber")}
              placeholder="Not provided"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Fax" htmlFor="fax">
            <Input
              id="fax"
              type="tel"
              value={form.fax}
              onChange={setField("fax")}
              placeholder="Not provided"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Industry" htmlFor="industry">
            <Input
              id="industry"
              value={form.industry}
              onChange={setField("industry")}
              placeholder="Not provided"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Company size" htmlFor="company-size">
            <Input
              id="company-size"
              value={form.companySize}
              onChange={setField("companySize")}
              placeholder="1-25"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Website" htmlFor="website">
            <Input
              id="website"
              value={form.website}
              onChange={setField("website")}
              placeholder="Not provided"
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Timezone" htmlFor="timezone">
            <Input
              id="timezone"
              value={form.timezone}
              onChange={setField("timezone")}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Locale" htmlFor="locale">
            <Input
              id="locale"
              value={form.locale}
              onChange={setField("locale")}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Currency" htmlFor="currency">
            <Input
              id="currency"
              value={form.currency}
              onChange={setField("currency")}
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
        </div>
      </div>

      <Separator className="bg-[#E8E6DE]" />

      <div>
        <p className="mb-4 text-[13px] font-semibold text-[#2C2C2A]">Address</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Country" htmlFor="country">
            <Input id="country" value={form.country} onChange={setField("country")} placeholder="Not provided" className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]" />
          </SettingsFieldRow>
          <SettingsFieldRow label="City" htmlFor="city">
            <Input id="city" value={form.city} onChange={setField("city")} placeholder="Not provided" className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]" />
          </SettingsFieldRow>
          <SettingsFieldRow label="Postcode" htmlFor="postcode">
            <Input id="postcode" value={form.postalCode} onChange={setField("postalCode")} placeholder="Not provided" className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]" />
          </SettingsFieldRow>
          <SettingsFieldRow label="State" htmlFor="state">
            <Input id="state" value={form.state} onChange={setField("state")} placeholder="Not provided" className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]" />
          </SettingsFieldRow>
          <SettingsFieldRow label="Address line 1" htmlFor="line1">
            <Input id="line1" value={form.line1} onChange={setField("line1")} placeholder="Not provided" className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]" />
          </SettingsFieldRow>
          <SettingsFieldRow label="Address line 2" htmlFor="line2">
            <Input id="line2" value={form.line2} onChange={setField("line2")} placeholder="Not provided" className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] placeholder:text-[#C4C2BB] focus-visible:ring-[#0F6E56]" />
          </SettingsFieldRow>
        </div>
      </div>
    </>
  );
}

export function GeneralTab() {
  const { user } = useCurrentUser();
  const { organization, setOrganization } = useCurrentOrganization();
  const displayName = getUserDisplayName(user);
  const roleLabel = getUserRoleLabel(user);

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
                {getUserInitials(user)}
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
              value={displayName}
              readOnly
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Role / Title" htmlFor="role">
            <Input
              id="role"
              value={roleLabel}
              readOnly
              className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px] text-[#2C2C2A] focus-visible:ring-[#0F6E56]"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Email address" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={user?.email ?? ""}
              readOnly
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

      <OrganizationProfileForm
        key={organization?.publicId ?? "loading"}
        organization={organization}
        onUpdated={setOrganization}
      />
    </div>
  );
}
