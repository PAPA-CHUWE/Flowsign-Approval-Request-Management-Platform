"use client"

import { AlertCircle, Bot, Ticket, Workflow } from "lucide-react"
import { useAdminSummary } from "@/hooks/use-admin-summary"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-32 w-full animate-pulse rounded bg-[#F1EFE8]" />
  ),
})

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

function VolumeChart({ data }: { data: { date: string; submitted: number; approved: number; rejected: number }[] }) {
  const options = {
    chart: {
      type: "area" as const,
      height: 120,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#5E5D57", "#2A9D8F", "#E76F51"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    markers: { size: 3 },
    xaxis: {
      categories: data.map(d => d.date),
      labels: { style: { fontSize: "10px" }, colors: "#888780" },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "10px" }, colors: "#888780" } },
    legend: { show: false },
    grid: { borderColor: "#F1EFE8", strokeDashArray: 3 },
    tooltip: {
      theme: "light" as const,
      style: { fontSize: "12px" },
    },
  }

  const series = [
    { name: "Submitted", data: data.map(d => d.submitted) },
    { name: "Approved", data: data.map(d => d.approved) },
    { name: "Rejected", data: data.map(d => d.rejected) },
  ]

  return (
    <div className="h-32 w-full">
      <Chart options={options} series={series} height={120} />
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

  const { pipelineStats, totalRequests, workflowGaps, aiStats, rejectionRate, volumeData } = summary
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

          <div className="flex items-baseline gap-3">
            <span className="font-dm-sans text-[28px] font-bold text-brand-neutral-dark tabular-nums">
              {totalRequests}
            </span>
            <span className="text-[12px] text-brand-neutral-mid">total requests</span>
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
            <h3 className="text-[14px] font-semibold text-brand-neutral-dark">Workflow Coverage</h3>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-dm-sans text-[28px] font-bold text-brand-neutral-dark tabular-nums">
              {workflowGaps.length - gaps.length}
            </span>
            <span className="text-[12px] text-brand-neutral-mid">of {workflowGaps.length} configured</span>
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
                  All workflows active — great coverage!
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
            <h3 className="text-[14px] font-semibold text-brand-neutral-dark">AI Automation</h3>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-dm-sans text-[28px] font-bold text-brand-neutral-dark tabular-nums">
              {(aiStats.aiAccuracyScore * 100).toFixed(0)}%
            </span>
            <span className="text-[12px] text-brand-neutral-mid">accuracy score</span>
          </div>

          <div className="border-t border-[#F1EFE8] pt-2">
            <StatRow icon={Bot} label="Assisted requests" value={aiStats.totalAssistedRequests} />
            <StatRow icon={Bot} label="Rejection rate" value={`${(rejectionRate * 100).toFixed(1)}%`} color="text-brand-neutral-mid" />
            <StatRow icon={Bot} label="Top type" value={aiStats.topSuggestedType ?? "—"} />
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E8E6DE] bg-white p-5">
        <h3 className="text-[14px] font-semibold text-brand-neutral-dark mb-3">Request Volume</h3>
        <VolumeChart data={volumeData} />
      </div>
    </div>
  )
}