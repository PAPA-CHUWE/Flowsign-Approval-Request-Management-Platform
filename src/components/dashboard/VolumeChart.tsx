"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { getVolumeAnalytics, type VolumePeriodPoint } from "@/lib/api/analytics";

// ── Period config ──────────────────────────────────────────────────────────────

type Period = "weekly" | "monthly";

function dateRange(period: Period): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  if (period === "weekly")  from.setDate(from.getDate() - 12 * 7);   // 12 weeks
  else                      from.setMonth(from.getMonth() - 6);       // 6 months
  return {
    from: from.toISOString(),
    to:   to.toISOString(),
  };
}

// ── Label formatter ────────────────────────────────────────────────────────────

function formatLabel(raw: string, period: Period): string {
  // Weekly: "2026-W21" → "W21"
  if (period === "weekly") {
    const match = raw.match(/W(\d+)/)
    return match ? `W${match[1]}` : raw;
  }
  // Monthly: "2026-05" → "May" or daily "2026-05-23" → "23 May"
  const parts = raw.split("-");
  if (parts.length === 2) {
    const [, month] = parts;
    return new Date(`${raw}-01`).toLocaleString("en", { month: "short" });
  }
  if (parts.length === 3) {
    const d = new Date(raw);
    return d.toLocaleString("en", { day: "numeric", month: "short" });
  }
  return raw;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, period }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  period: Period;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-[#E8E6DE] bg-white px-3 py-2.5 shadow-lg">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888780]">
        {label ? formatLabel(label, period) : ""}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[12px]">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize text-[#5F5E5A]">{p.name}</span>
          <span className="ml-auto font-semibold tabular-nums text-[#2C2C2A]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function VolumeChart() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [series, setSeries]   = useState<VolumePeriodPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    const { from, to } = dateRange(period);
    getVolumeAnalytics({ period, from, to })
      .then((res) => { if (!ignore) setSeries(res.responseBody.series ?? []) })
      .catch(() => { if (!ignore) setSeries([]) })
      .finally(() => { if (!ignore) setIsLoading(false) });
    return () => { ignore = true };
  }, [period]);

  const chartData = series.map((p) => ({
    ...p,
    label: formatLabel(p.date, period),
  }));

  const totalSubmitted = series.reduce((s, p) => s + p.submitted, 0);
  const totalApproved  = series.reduce((s, p) => s + p.approved,  0);
  const totalRejected  = series.reduce((s, p) => s + p.rejected,  0);

  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#E8E6DE] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E6DE] px-5 pb-4 pt-5">
        <div>
          <h2 className="font-dm-sans text-[15px] font-semibold text-brand-neutral-dark">
            Request volume
          </h2>
          <p className="mt-0.5 text-[12px] text-[#888780]">
            Submitted, approved and rejected over time
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex overflow-hidden rounded-[8px] border border-[#E8E6DE]">
          {(["weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                period === p
                  ? "bg-brand-teal text-white"
                  : "bg-white text-[#5F5E5A] hover:bg-[#F1EFE8]"
              }`}
            >
              {p === "weekly" ? "12 weeks" : "6 months"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-4 border-b border-[#F1EFE8] px-5 py-3">
        {[
          { label: "Submitted", value: totalSubmitted, color: "#0F6E56", bg: "#E1F5EE" },
          { label: "Approved",  value: totalApproved,  color: "#27500A", bg: "#EAF3DE" },
          { label: "Rejected",  value: totalRejected,  color: "#A32D2D", bg: "#FCEBEB" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: bg }}>
            <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>{value}</span>
            <span className="text-[11px]" style={{ color }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 py-4">
        {isLoading ? (
          <div className="flex h-[220px] items-center justify-center gap-2 text-[13px] text-[#B4B2A9]">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : series.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-[13px] text-[#B4B2A9]">
            No volume data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ left: -10, right: 12, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0F6E56" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F6E56" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#27A25A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#27A25A" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#A32D2D" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#A32D2D" stopOpacity={0}    />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" vertical={false} />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#B4B2A9" }}
                axisLine={false}
                tickLine={false}
                dy={6}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#B4B2A9" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              <Tooltip content={<CustomTooltip period={period} />} />

              <Area
                type="monotone"
                dataKey="submitted"
                name="submitted"
                stroke="#0F6E56"
                strokeWidth={2}
                fill="url(#gradSubmitted)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="approved"
                name="approved"
                stroke="#27A25A"
                strokeWidth={2}
                fill="url(#gradApproved)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="rejected"
                name="rejected"
                stroke="#A32D2D"
                strokeWidth={2}
                fill="url(#gradRejected)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
