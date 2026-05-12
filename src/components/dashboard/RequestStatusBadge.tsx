import type { RequestStatus } from "@/lib/mock/dashboard.mock";

const CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  pending:    { label: "Pending",   className: "bg-brand-amber-pale text-brand-amber" },
  approved:   { label: "Approved",  className: "bg-brand-success-bg text-brand-success-text" },
  rejected:   { label: "Rejected",  className: "bg-brand-danger-bg text-brand-danger-text" },
  "in-review":{ label: "In Review", className: "bg-brand-purple-pale text-brand-purple" },
  draft:      { label: "Draft",     className: "bg-brand-neutral-pale text-brand-neutral-mid" },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const { label, className } = CONFIG[status] ?? CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold font-dm-sans ${className}`}
    >
      {label}
    </span>
  );
}
