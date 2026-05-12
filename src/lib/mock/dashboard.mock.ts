// ── Types ─────────────────────────────────────────────────────────────────────

export type RequestStatus = "pending" | "approved" | "rejected" | "in-review" | "draft";

export type DashboardRequest = {
  id: string;
  type: string;
  description: string;
  amount: number | null;
  status: RequestStatus;
  date: string;
  step: number;
  totalSteps: number;
};

export type ActivityType = "approved" | "rejected" | "pending" | "info";

export type ActivityItem = {
  id: number;
  type: ActivityType;
  text: string;
  time: string;
};

export type PipelineStats = {
  pending: number;
  approved: number;
  rejected: number;
  inReview: number;
};

export type RequestsByType = {
  funds: number;
  travel: number;
  assets: number;
  access: number;
  hr: number;
};

// ── Mock data ──────────────────────────────────────────────────────────────────

export const mockRequests: DashboardRequest[] = [
  {
    id: "FS-001",
    type: "Finance",
    description: "Q4 office equipment procurement",
    amount: 12500,
    status: "pending",
    date: "2026-05-10",
    step: 2,
    totalSteps: 3,
  },
  {
    id: "FS-002",
    type: "Travel",
    description: "Nairobi conference — May 2026",
    amount: 3450,
    status: "approved",
    date: "2026-05-07",
    step: 3,
    totalSteps: 3,
  },
  {
    id: "FS-003",
    type: "Access",
    description: "CRM system read/write access",
    amount: null,
    status: "in-review",
    date: "2026-05-09",
    step: 1,
    totalSteps: 2,
  },
  {
    id: "FS-004",
    type: "Assets",
    description: "MacBook Pro 14-inch",
    amount: 2800,
    status: "rejected",
    date: "2026-05-05",
    step: 2,
    totalSteps: 2,
  },
  {
    id: "FS-005",
    type: "HR",
    description: "Parental leave administration",
    amount: null,
    status: "pending",
    date: "2026-05-11",
    step: 1,
    totalSteps: 3,
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: 1,
    type: "approved",
    text: "Your funds request FS-001 was approved by James K.",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "pending",
    text: "Travel request FS-005 submitted and pending review.",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "rejected",
    text: "Asset request FS-004 was rejected by Finance Controller.",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "info",
    text: "Access request FS-003 is now in review with IT Security.",
    time: "2 days ago",
  },
  {
    id: 5,
    type: "approved",
    text: "Travel request FS-002 fully approved and closed.",
    time: "3 days ago",
  },
];

export const mockPipelineStats: PipelineStats = {
  pending: 4,
  approved: 12,
  rejected: 2,
  inReview: 3,
};

export const mockRequestsByType: RequestsByType = {
  funds: 8,
  travel: 5,
  assets: 3,
  access: 4,
  hr: 2,
};
