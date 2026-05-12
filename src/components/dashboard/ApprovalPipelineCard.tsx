"use client";

import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PipelineStats, RequestsByType } from "@/lib/mock/dashboard.mock";

// Recharts requires hex values as component props — not inline styles
const CHART_COLORS = {
  pending:  "#854F0B",
  approved: "#0F6E56",
  rejected: "#791F1F",
  inReview: "#534AB7",
  bar:      "#0F6E56",
};

const PIE_CONFIG = [
  { name: "Pending",   key: "pending"  as const, dotClass: "bg-brand-amber",        color: CHART_COLORS.pending  },
  { name: "Approved",  key: "approved" as const, dotClass: "bg-brand-teal",         color: CHART_COLORS.approved },
  { name: "Rejected",  key: "rejected" as const, dotClass: "bg-brand-danger-text",  color: CHART_COLORS.rejected },
  { name: "In Review", key: "inReview" as const, dotClass: "bg-brand-purple",       color: CHART_COLORS.inReview },
];

interface ApprovalPipelineCardProps {
  stats: PipelineStats;
  byType: RequestsByType;
}

export function ApprovalPipelineCard({ stats, byType }: ApprovalPipelineCardProps) {
  const total = stats.pending + stats.approved + stats.rejected + stats.inReview;

  const pieData = PIE_CONFIG.map((cfg) => ({
    ...cfg,
    value: stats[cfg.key],
  }));

  const barData = [
    { name: "Funds",  value: byType.funds  },
    { name: "Travel", value: byType.travel },
    { name: "Assets", value: byType.assets },
    { name: "Access", value: byType.access },
    { name: "HR",     value: byType.hr     },
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#E8E6DE] bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E6DE] px-5 pb-4 pt-5">
        <h2 className="font-dm-sans text-[15px] font-semibold text-brand-neutral-dark">
          Approval pipeline
        </h2>
      </div>

      <div className="px-5 py-4">
        {/* Donut chart */}
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #E8E6DE",
                  fontSize: "12px",
                  fontFamily: "DM Sans",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                formatter={(value: number) => [value, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label — absolutely positioned inside the ResponsiveContainer parent */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-dm-sans text-[22px] font-bold leading-none text-brand-neutral-dark">
              {total}
            </span>
            <span className="font-dm-sans text-[11px] text-brand-neutral-mid mt-0.5">total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotClass}`} />
                <span className="font-dm-sans text-[12px] text-brand-neutral-mid">{item.name}</span>
              </div>
              <span className="font-dm-sans text-[12px] font-semibold text-brand-neutral-dark">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-[#E8E6DE]" />

        {/* Horizontal bar chart */}
        <p className="mb-3 font-dm-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-neutral-mid">
          Active requests by type
        </p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fontFamily: "DM Sans", fill: "#5F5E5A" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #E8E6DE",
                fontSize: "12px",
                fontFamily: "DM Sans",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              cursor={{ fill: "#F1EFE8" }}
            />
            <Bar
              dataKey="value"
              fill={CHART_COLORS.bar}
              radius={[0, 4, 4, 0]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#E8E6DE] px-5 py-3">
        <Link
          href="/tickets"
          className="font-dm-sans text-[13px] font-medium text-brand-teal no-underline hover:underline"
        >
          View analytics →
        </Link>
      </div>
    </div>
  );
}
