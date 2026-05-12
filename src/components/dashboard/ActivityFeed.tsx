import Link from "next/link";
import { CheckCircle2, Clock, XCircle, Info } from "lucide-react";
import type { ActivityItem, ActivityType } from "@/lib/mock/dashboard.mock";

const ICON_CONFIG: Record<
  ActivityType,
  { Icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  approved: {
    Icon: CheckCircle2,
    iconClass: "text-brand-success-text",
    bgClass: "bg-brand-success-bg",
  },
  pending: {
    Icon: Clock,
    iconClass: "text-brand-amber",
    bgClass: "bg-brand-amber-pale",
  },
  rejected: {
    Icon: XCircle,
    iconClass: "text-brand-danger-text",
    bgClass: "bg-brand-danger-bg",
  },
  info: {
    Icon: Info,
    iconClass: "text-brand-blue",
    bgClass: "bg-brand-blue-pale",
  },
};

interface ActivityFeedProps {
  items: ActivityItem[];
  updatedAt: string;
}

export function ActivityFeed({ items, updatedAt }: ActivityFeedProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#E8E6DE] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E6DE] px-5 pb-4 pt-5">
        <h2 className="font-dm-sans text-[15px] font-semibold text-brand-neutral-dark">
          Recent activity
        </h2>
        <span className="font-dm-sans text-[11px] text-brand-neutral-light">
          Updated {updatedAt}
        </span>
      </div>

      {/* Items */}
      <ul className="divide-y divide-[#E8E6DE] px-5">
        {items.map((item) => {
          const { Icon, iconClass, bgClass } = ICON_CONFIG[item.type];
          return (
            <li key={item.id} className="flex items-start gap-3.5 py-4">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgClass}`}
              >
                <Icon size={15} className={iconClass} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-dm-sans text-[13px] leading-[1.5] text-brand-neutral-dark">
                  {item.text}
                </p>
                <p className="mt-0.5 font-dm-sans text-[11px] text-brand-neutral-light">
                  {item.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="mt-auto border-t border-[#E8E6DE] px-5 py-3">
        <Link
          href="/tickets"
          className="font-dm-sans text-[13px] font-medium text-brand-teal no-underline hover:underline"
        >
          View all activity →
        </Link>
      </div>
    </div>
  );
}
