import Link from "next/link";
import { DollarSign, Plane, Package, Users, ArrowRight } from "lucide-react";

const ACTIONS = [
  {
    label: "New funds request",
    Icon: DollarSign,
    href: "/requests",
    iconClass: "text-brand-teal",
    iconBg: "bg-brand-teal-pale",
    border: "hover:border-brand-teal-light",
  },
  {
    label: "New travel request",
    Icon: Plane,
    href: "/requests",
    iconClass: "text-brand-blue",
    iconBg: "bg-brand-blue-pale",
    border: "hover:border-brand-blue",
  },
  {
    label: "New asset request",
    Icon: Package,
    href: "/requests",
    iconClass: "text-brand-purple",
    iconBg: "bg-brand-purple-pale",
    border: "hover:border-brand-purple",
  },
  {
    label: "New HR request",
    Icon: Users,
    href: "/requests",
    iconClass: "text-brand-amber",
    iconBg: "bg-brand-amber-pale",
    border: "hover:border-brand-amber",
  },
] as const;

export function QuickActionsGrid() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#E8E6DE] bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E6DE] px-5 pb-4 pt-5">
        <h2 className="font-dm-sans text-[15px] font-semibold text-brand-neutral-dark">
          Quick actions
        </h2>
      </div>

      {/* 2×2 Grid */}
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {ACTIONS.map(({ label, Icon, href, iconClass, iconBg, border }) => (
          <Link
            key={label}
            href={href}
            className={[
              "group flex flex-col items-start gap-3 rounded-[12px] border border-[#E8E6DE] p-4 no-underline",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
              border,
            ].join(" ")}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${iconBg}`}
            >
              <Icon size={17} className={iconClass} strokeWidth={2} />
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="pr-2 font-dm-sans text-[13px] font-semibold leading-tight text-brand-neutral-dark">
                {label}
              </span>
              <ArrowRight
                size={14}
                className="shrink-0 text-brand-neutral-light transition-colors duration-150 group-hover:text-brand-neutral-mid"
                strokeWidth={2}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
