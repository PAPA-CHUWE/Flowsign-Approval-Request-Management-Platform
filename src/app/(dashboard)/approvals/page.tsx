"use client"

export const dynamic = "force-dynamic"

import { AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { ApprovalQueue } from "@/components/workflow/ApprovalQueue"
import { Loader } from "@/components/loader-ui/loader"
import { useApprovalQueue } from "@/hooks/requests/useApprovalQueue"

export default function ApprovalsPage() {
  const { tickets, isLoading, error } = useApprovalQueue({ limit: 100 })

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Approvals"
        description="Review and action requests assigned to you."
      />

      {isLoading ? (
        <Loader label="Loading approvals" />
      ) : error ? (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <ApprovalQueue tickets={tickets} />
      )}
    </div>
  )
}
