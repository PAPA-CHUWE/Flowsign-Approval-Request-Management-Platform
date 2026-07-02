"use client"

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertCircle, Bot, Ticket, Workflow } from "lucide-react"
import { useAdminSummary } from "@/hooks/use-admin-summary"

function StatRow({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className={color ?? "text-[#888780]"} />
        <span className="text-[13px] text-brand-neutral-mid">{label}</span>
      </div>
      <span className="text-[13px] font-semibold text-brand-neutral-dark tabular-nums">
        {value}
      </span>
    </div>
  )
}

function GapItem({ name, suggested }: { name: string; suggested: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-amber-200 bg-amber-50/30 p-3">
      <AlertCircle size={14} className="mt-0.5 text-amber-600" />
      <div className="flex-1">
        <p className="text-[12px] font-semibold text-amber-800">{name}</p>
        <p className="text-[11px] text-amber-700">{suggested}</p>
      </div>
    </div>
  )
}

function VolumeChart({
  data,
}: {
  data: {
    date: string
    submitted: number
    approved: number
    rejected: number
  }[]
}) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="submittedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000066" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#000066" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#888780" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#888780" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />

          <Tooltip
            cursor={{ fill: "rgba(0, 0, 102, 0.04)" }}
            contentStyle={{
              fontSize: "12px",
              borderRadius: "10px",
              border: "1px solid #E8E6DE",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
            labelStyle={{
              fontSize: "12px",
              fontWeight: 600,
            }}
          />

          <Legend
            iconType="circle"
            wrapperStyle={{
              fontSize: "11px",
              paddingTop: "6px",
            }}
          />

          <Area
            type="monotone"
            dataKey="submitted"
            name="Submitted"
            stroke="#000066"
            strokeWidth={2}
            fill="url(#submittedFill)"
            dot={false}
          />

          <Bar
            dataKey="approved"
            name="Approved"
            fill="#008000"
            radius={[4, 4, 0, 0]}
            barSize={18}
          />

          <Line
            type="monotone"
            dataKey="rejected"
            name="Rejected"
            stroke="#B42318"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#B42318" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function TypeChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
            labelStyle={{ fontSize: "12px" }}
          />
          <Bar dataKey="count" fill="#000066" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminSummary() {
  const { summary, isLoading, error } = useAdminSummary()

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-[14px] border border-[#E8E6DE] bg-white p-5"
          >
            <div className="h-5 w-32 animate-pulse rounded bg-[#F1EFE8]" />
            <div className="h-7 w-16 animate-pulse rounded bg-[#F1EFE8]" />
            <div className="h-10 w-full animate-pulse rounded bg-[#F1EFE8]" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
        <AlertCircle size={16} />
        {error}
      </div>
    )
  }

  if (!summary) return null

  const { pipelineStats, totalRequests, workflowGaps, aiStats, rejectionRate, volumeData, requestsByType } = summary
  const gaps = workflowGaps.filter((g) => !g.hasActiveWorkflow)
  const hasGaps = gaps.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-[14px] border border-[#E8E6DE] bg-white p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-brand-teal-pale">
              <Ticket size={16} className="text-brand-teal" />
            </div>
            <h3 className="text-[14px] font-semibold text-brand-neutral-dark">Requests</h3>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-dm-sans text-[28px] font-bold text-brand-neutral-dark tabular-nums">
              {totalRequests}
            </span>
            <span className="text-[12px] text-brand-neutral-mid">total</span>
          </div>

          <div className="border-t border-[#F1EFE8] pt-2">
            <StatRow icon={Ticket} label="Pending" value={pipelineStats.pending} color="text-amber-600" />
            <StatRow icon={Bot} label="In review" value={pipelineStats.inReview} color="text-purple-600" />
            <StatRow icon={Bot} label="Approved" value={pipelineStats.approved} color="text-brand-teal" />
            <StatRow icon={Bot} label="Rejected" value={pipelineStats.rejected} color="text-brand-danger-text" />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[14px] border border-[#E8E6DE] bg-white p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-brand-teal-pale">
              <Workflow size={16} className="text-brand-teal" />
            </div>
            <h3 className="text-[14px] font-semibold text-brand-neutral-dark">Workflows</h3>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-dm-sans text-[28px] font-bold text-brand-neutral-dark tabular-nums">
              {workflowGaps.length - gaps.length}
            </span>
            <span className="text-[12px] text-brand-neutral-mid">active</span>
          </div>

          <div className="border-t border-[#F1EFE8] pt-2">
            {hasGaps ? (
              <div className="flex flex-col gap-2 max-h-24 overflow-y-auto">
                {gaps.map((gap) => (
                  <GapItem
                    key={gap.requestTypeKey}
                    name={gap.requestTypeName}
                    suggested={gap.suggestedWorkflow}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-[10px] border border-[#E8E6DE] bg-[#F7F6F2] p-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal text-white">
                  <Bot size={12} />
                </div>
                <span className="text-[12px] font-medium text-brand-neutral-dark">
                  All workflows active
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[14px] border border-[#E8E6DE] bg-white p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-brand-teal-pale">
              <Bot size={16} className="text-brand-teal" />
            </div>
            <h3 className="text-[14px] font-semibold text-brand-neutral-dark">AI Stats</h3>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-dm-sans text-[28px] font-bold text-brand-neutral-dark tabular-nums">
              {(aiStats.aiAccuracyScore * 100).toFixed(0)}%
            </span>
            <span className="text-[12px] text-brand-neutral-mid">accuracy</span>
          </div>

          <div className="border-t border-[#F1EFE8] pt-2">
            <StatRow icon={Bot} label="Assisted" value={aiStats.totalAssistedRequests} />
            <StatRow icon={Bot} label="Rejection rate" value={`${(rejectionRate * 100).toFixed(1)}%`} />
            <StatRow icon={Bot} label="Top type" value={aiStats.topSuggestedType ?? "—"} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[#E8E6DE] bg-white p-5">
          <h3 className="text-[14px] font-semibold text-brand-neutral-dark mb-3">Request Volume</h3>
          <VolumeChart data={volumeData} />
        </div>

        <div className="rounded-[14px] border border-[#E8E6DE] bg-white p-5">
          <h3 className="text-[14px] font-semibold text-brand-neutral-dark mb-3">Requests by Type</h3>
          <TypeChart data={requestsByType} />
        </div>
      </div>
    </div>
  )
}