import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SettingsFieldRowProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

export function SettingsFieldRow({ label, htmlFor, children }: SettingsFieldRowProps) {
  return (
    <div className="grid gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-[12px] font-medium text-brand-neutral-mid"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
