"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { RequestStatusBadge } from "./RequestStatusBadge";
import type { DashboardRequest } from "@/lib/mock/dashboard.mock";

const TABS = ["All", "Pending", "Approved", "Rejected"] as const;
type Tab = (typeof TABS)[number];

function ApprovalProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-5 rounded-full ${
              i < step ? "bg-brand-teal" : "bg-brand-neutral-light"
            }`}
          />
        ))}
      </div>
      <span className="whitespace-nowrap font-dm-sans text-[11px] text-brand-neutral-mid">
        {step}/{total}
      </span>
    </div>
  );
}

export function RequestsTable({ requests }: { requests: DashboardRequest[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = requests.filter((r) => {
    if (activeTab === "All")      return true;
    if (activeTab === "Pending")  return r.status === "pending";
    if (activeTab === "Approved") return r.status === "approved";
    if (activeTab === "Rejected") return r.status === "rejected";
    return true;
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#E8E6DE] bg-white">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#E8E6DE] px-5 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-dm-sans text-[15px] font-semibold text-brand-neutral-dark">
          My Requests
        </h2>
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 rounded-[8px] bg-brand-teal px-3.5 py-2 font-dm-sans text-[12px] font-semibold text-white no-underline transition-colors duration-150 hover:bg-brand-teal-mid"
        >
          New request
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#E8E6DE] px-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "-mb-px cursor-pointer border-b-2 px-4 py-3 font-dm-sans text-[13px] font-medium transition-colors duration-150",
              activeTab === tab
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-brand-neutral-mid hover:text-brand-neutral-dark",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAF8]">
              {["Type", "Description", "Amount", "Status", "Progress", "Date", ""].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-left font-dm-sans text-[11px] font-semibold uppercase tracking-[0.05em] text-brand-neutral-mid"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center font-dm-sans text-[13px] text-brand-neutral-light"
                >
                  No requests found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[#E8E6DE] transition-colors duration-100 hover:bg-[#FAFAF8]"
                >
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="font-dm-sans text-[12px] font-semibold text-brand-neutral-dark">
                      {r.type}
                    </span>
                  </td>
                  <td className="min-w-[180px] px-4 py-3.5">
                    <span className="font-dm-sans text-[13px] text-brand-neutral-dark">
                      {r.description}
                    </span>
                    <span className="block font-dm-sans text-[11px] text-brand-neutral-light">
                      {r.id}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="font-dm-sans text-[13px] font-semibold text-brand-neutral-dark">
                      {r.amount != null ? `$${r.amount.toLocaleString()}` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <RequestStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <ApprovalProgress step={r.step} total={r.totalSteps} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="font-dm-sans text-[12px] text-brand-neutral-mid">
                      {r.date}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 hover:bg-brand-teal-pale">
                      <ChevronRight size={14} className="text-brand-neutral-mid" strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#E8E6DE] px-5 py-3">
        <Link
          href="/tickets"
          className="font-dm-sans text-[13px] font-medium text-brand-teal no-underline hover:underline"
        >
          View all requests →
        </Link>
      </div>
    </div>
  );
}
