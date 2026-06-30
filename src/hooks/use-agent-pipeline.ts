"use client"

import { useEffect, useState } from "react"
import { runAgentPipeline, getAuditTrail } from "@/lib/api/modelApi"
import type { AgentPipelineOutput, AuditEvent } from "@/types/agent.types"

export function useAgentPipeline(requestPublicId: string) {
  const [pipeline, setPipeline] = useState<AgentPipelineOutput | null>(null)
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runPipeline() {
    if (!requestPublicId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await runAgentPipeline({ request_public_id: requestPublicId })
      setPipeline(result)
      if (result) {
        const events = await getAuditTrail(requestPublicId)
        setAuditEvents(events)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run agent pipeline")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runPipeline()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPublicId])

  return {
    pipeline,
    auditEvents,
    isLoading,
    error,
    refetch: runPipeline,
  }
}