"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { listApprovalQueue } from "@/lib/api/approvals"

const POLL_INTERVAL_MS = 60_000

export function useApprovalQueueCount() {
  const [count, setCount]   = useState(0)
  const isHiddenRef         = useRef(false)

  const load = useCallback(async () => {
    try {
      const res = await listApprovalQueue({ page: 1, limit: 1 })
      setCount(res.responseBody.total ?? 0)
    } catch {
      // silent — badge absence is acceptable on error
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    function onVisibilityChange() {
      isHiddenRef.current = document.visibilityState === "hidden"
      if (document.visibilityState === "visible") load()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [load])

  useEffect(() => {
    const id = setInterval(() => {
      if (!isHiddenRef.current) load()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  return count
}
