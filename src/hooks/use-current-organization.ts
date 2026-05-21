"use client"

import { useEffect, useState } from "react"

import {
  getCurrentOrganization,
  type CurrentOrganization,
} from "@/lib/api/organizations"

export function useCurrentOrganization() {
  const [organization, setOrganization] = useState<CurrentOrganization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    getCurrentOrganization()
      .then((response) => {
        if (!ignore) {
          setOrganization(response.responseBody.organization)
          setError("")
        }
      })
      .catch((reason) => {
        if (!ignore) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load organization."
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
  }, [])

  return { organization, isLoading, error, setOrganization }
}
