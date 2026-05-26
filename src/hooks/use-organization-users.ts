"use client"

import { useCallback, useEffect, useState } from "react"

import { listOrganizationUsers, type OrganizationUser } from "@/lib/api/users"

export function useOrganizationUsers({ enabled = true }: { enabled?: boolean } = {}) {
  const [users, setUsers] = useState<OrganizationUser[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState("")

  const loadUsers = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)

    try {
      const response = await listOrganizationUsers()
      setUsers(response.responseBody.users)
      setError("")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load users.")
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }
    let ignore = false

    listOrganizationUsers()
      .then((response) => {
        if (!ignore) {
          setUsers(response.responseBody.users)
          setError("")
        }
      })
      .catch((reason) => {
        if (!ignore) {
          setError(reason instanceof Error ? reason.message : "Could not load users.")
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
  }, [enabled])

  return { users, isLoading, error, setUsers, refreshUsers: loadUsers }
}
