"use client"

import { useState } from "react"

import { approveTicket } from "@/lib/api/tickets"

export function useApproveTicket() {
  const [isApproving, setIsApproving] = useState(false)

  async function approve(ticketId: string) {
    setIsApproving(true)

    try {
      return await approveTicket(ticketId)
    } finally {
      setIsApproving(false)
    }
  }

  return { approve, isApproving }
}
