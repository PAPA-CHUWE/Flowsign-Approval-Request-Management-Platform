"use client"

import { useEffect, useState } from "react"

import {
  getCurrentOrganizationSettings,
  type OrganizationSettings,
} from "@/lib/api/organizations"

export function useCurrentOrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    getCurrentOrganizationSettings()
      .then((response) => {
        if (!ignore) {
          setSettings(response.responseBody.settings)
          setError("")
        }
      })
      .catch((reason) => {
        if (!ignore) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load organization settings."
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

  return { settings, isLoading, error, setSettings }
}
