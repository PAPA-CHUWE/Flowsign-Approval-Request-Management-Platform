"use client"

import { useEffect, useState } from "react"

import { getTickets } from "@/lib/api/tickets"
import type { Ticket } from "@/types/ticket.types"

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    getTickets()
      .then((data) => {
        if (isMounted) {
          setTickets(data)
        }
      })
      .catch((reason: unknown) => {
        if (isMounted) {
          setError(reason instanceof Error ? reason : new Error("Unknown error"))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { tickets, isLoading, error }
}
