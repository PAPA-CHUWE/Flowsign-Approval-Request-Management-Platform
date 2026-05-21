"use client"

import { useEffect, useState } from "react"

import {
  getRequestType,
  listRequestTypes,
  type OrganizationRequestType,
} from "@/lib/api/request-types"

export function useRequestTypes() {
  const [requestTypes, setRequestTypes] = useState<OrganizationRequestType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState("")

  function upsertRequestType(requestType: OrganizationRequestType) {
    setRequestTypes((current) => {
      const index = current.findIndex((item) => item.key === requestType.key)

      if (index === -1) {
        return [...current, requestType]
      }

      return current.map((item, itemIndex) =>
        itemIndex === index ? requestType : item
      )
    })
  }

  function addRequestType(requestType: OrganizationRequestType) {
    upsertRequestType(requestType)
  }

  async function loadRequestTypeDetails(key: string) {
    setIsLoadingDetails(true)
    setDetailsError("")

    try {
      const response = await getRequestType(key)
      const requestType = response.responseBody.requestType

      upsertRequestType(requestType)
      return requestType
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not load request type details."

      setDetailsError(message)
      throw reason
    } finally {
      setIsLoadingDetails(false)
    }
  }

  useEffect(() => {
    let ignore = false

    listRequestTypes()
      .then((response) => {
        if (!ignore) {
          setRequestTypes(response.responseBody.requestTypes)
          setError("")
        }
      })
      .catch((reason) => {
        if (!ignore) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load request types."
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

  return {
    requestTypes,
    isLoading,
    error,
    isLoadingDetails,
    detailsError,
    addRequestType,
    loadRequestTypeDetails,
  }
}
