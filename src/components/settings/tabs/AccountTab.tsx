import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsSectionHeading } from "../SettingsSectionHeading";

export function AccountTab() {
  return (
    <div>
      <SettingsSectionHeading
        title="Account"
        description="Manage your account details and data."
      />

      <div className="max-w-lg space-y-4">
        <Card className="rounded-[12px] border-[#E8E6DE] shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-[13px] font-semibold text-[#2C2C2A]">
              Export data
            </CardTitle>
            <CardDescription className="text-[12px] text-[#888780]">
              Download a copy of all your requests and tickets as a CSV file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#2C2C2A] hover:bg-[#F6F4EF]"
            >
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-red-100 bg-red-50 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-[13px] font-semibold text-red-700">
              Danger zone
            </CardTitle>
            <CardDescription className="text-[12px] text-red-500">
              Permanently delete your account and all associated data. This action cannot be
              undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              className="h-8 rounded-[8px] bg-red-600 px-4 text-[12px] font-semibold text-white hover:bg-red-700"
            >
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
