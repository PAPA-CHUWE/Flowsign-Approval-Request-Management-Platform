import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Trend {
  delta: string;
  direction: "up" | "down";
  label: string;
}

interface DashboardStatCardProps {
  Icon: LucideIcon;
  label: string;
  value: string;
  trend: Trend;
}

export function DashboardStatCard({ Icon, label, value, trend }: DashboardStatCardProps) {
  const up = trend.direction === "up";
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#E8E6DE] bg-white px-5 py-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-teal-pale">
          <Icon size={18} className="text-brand-teal" strokeWidth={2} />
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold font-dm-sans ${
            up
              ? "bg-brand-success-bg text-brand-success-text"
              : "bg-brand-amber-pale text-brand-amber"
          }`}
        >
          {up
            ? <TrendingUp size={11} strokeWidth={2.5} />
            : <TrendingDown size={11} strokeWidth={2.5} />
          }
          {trend.delta}
        </span>
      </div>

      <div>
        <p className="font-dm-sans text-[28px] font-bold leading-none text-brand-neutral-dark mb-1">
          {value}
        </p>
        <p className="font-dm-sans text-[13px] text-brand-neutral-mid">{label}</p>
      </div>

      <p className="font-dm-sans text-[11px] text-brand-neutral-light">{trend.label}</p>
    </div>
  );
}
