"use client"

import { useEffect, useState } from "react"

import {
  getCurrentOrganizationSettings,
  type OrganizationSettings,
} from "@/lib/api/organizations"

export function useCurrentOrganizationSettings({ enabled = true }: { enabled?: boolean } = {}) {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!enabled) return

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
  }, [enabled])

  return { settings, isLoading, error, setSettings }
}
