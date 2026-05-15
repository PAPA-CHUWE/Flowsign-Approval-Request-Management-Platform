import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface SettingsToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  showSeparator?: boolean;
}

export function SettingsToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  showSeparator = true,
}: SettingsToggleRowProps) {
  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="pr-6">
          <p className="text-[13px] font-semibold text-[#2C2C2A]">{title}</p>
          <p className="mt-0.5 text-[12px] text-[#888780]">{description}</p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="data-[state=checked]:bg-[#0F6E56]"
        />
      </div>
      {showSeparator && <Separator className="bg-[#E8E6DE]" />}
    </>
  );
}
