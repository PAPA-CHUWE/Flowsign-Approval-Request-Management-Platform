import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsSectionHeading } from "../SettingsSectionHeading";

export function BillingTab() {
  return (
    <div>
      <SettingsSectionHeading
        title="Billing"
        description="Manage your plan and payment details."
      />

      <div className="max-w-lg space-y-4">
        <Card className="rounded-[12px] border-[#E8E6DE] shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#888780]">
                  Current plan
                </p>
                <CardTitle className="mt-1 text-[20px] font-bold text-[#2C2C2A]">
                  Pro
                </CardTitle>
                <CardDescription className="text-[12px] text-[#888780]">
                  $29 / month · renews 1 Jun 2026
                </CardDescription>
              </div>
              <Badge className="rounded-full bg-[#E1F5EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#0F6E56] hover:bg-[#E1F5EE]">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              size="sm"
              className="h-8 rounded-[8px] bg-[#0F6E56] px-4 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
            >
              Upgrade plan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#5F5E5A] hover:bg-[#F6F4EF]"
            >
              Cancel plan
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-[#E8E6DE] shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-[13px] font-semibold text-[#2C2C2A]">
              Payment method
            </CardTitle>
            <CardDescription className="text-[12px] text-[#888780]">
              Visa ending in 4242 · expires 08/28
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold text-[#5F5E5A] hover:bg-[#F6F4EF]"
            >
              Update card
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
