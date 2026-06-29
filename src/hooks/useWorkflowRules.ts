"use client"

import { useEffect, useState } from "react"
import {
  listWorkflowRules,
  createWorkflowRule,
  type WorkflowRule,
  type CreateWorkflowRulePayload,
} from "@/lib/api/workflow-rules"

export function useWorkflowRules() {
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  async function refresh() {
    setIsLoading(true)
    setError("")
    try {
      const res = await listWorkflowRules()
      setRules(res.responseBody.workflowRules)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load workflow rules.")
    } finally {
      setIsLoading(false)
    }
  }

  async function create(payload: CreateWorkflowRulePayload) {
    const res = await createWorkflowRule(payload)
    const rule = res.responseBody.workflowRule
    setRules((prev) => [rule, ...prev])
    return rule
  }

  useEffect(() => {
    let ignore = false
    listWorkflowRules()
      .then((res) => { if (!ignore) setRules(res.responseBody.workflowRules) })
      .catch((err) => { if (!ignore) setError(err instanceof Error ? err.message : "Could not load workflow rules.") })
      .finally(() => { if (!ignore) setIsLoading(false) })
    return () => { ignore = true }
  }, [])

  return { rules, isLoading, error, refresh, create }
}
