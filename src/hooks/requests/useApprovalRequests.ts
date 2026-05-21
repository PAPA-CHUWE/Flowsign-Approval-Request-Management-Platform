"use client"

import { useEffect, useState } from "react"

import {
  listApprovalRequests,
  type ApprovalRequest,
  type ListApprovalRequestsParams,
} from "@/lib/api/requests"

export function useApprovalRequests(
  params: ListApprovalRequestsParams,
  refreshKey = 0
) {
  const scope = params.scope
  const status = params.status
  const requestTypeKey = params.requestTypeKey
  const priority = params.priority
  const search = params.search
  const requestedPage = params.page
  const requestedLimit = params.limit

  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [page, setPage] = useState(requestedPage ?? 1)
  const [limit, setLimit] = useState(requestedLimit ?? 25)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    Promise.resolve().then(() => {
      if (!ignore) {
        setIsLoading(true)
        setError("")
      }
    })

    listApprovalRequests({
      scope,
      status,
      requestTypeKey,
      priority,
      search,
      page: requestedPage,
      limit: requestedLimit,
    })
      .then((response) => {
        if (!ignore) {
          const result = response.responseBody.result

          setRequests(result.items)
          setPage(result.page)
          setLimit(result.limit)
          setTotal(result.total)
        }
      })
      .catch((reason) => {
        if (!ignore) {
          setRequests([])
          setTotal(0)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load requests."
          )
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [
    scope,
    status,
    requestTypeKey,
    priority,
    search,
    requestedPage,
    requestedLimit,
    refreshKey,
  ])

  return { requests, page, limit, total, isLoading, error }
}
