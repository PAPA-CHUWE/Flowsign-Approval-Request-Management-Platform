import { apiClient } from "@/lib/api/client"
import type { Ticket } from "@/types/ticket.types"

export function getTickets() {
  return apiClient<Ticket[]>("/api/tickets")
}

export function approveTicket(ticketId: string) {
  return apiClient<Ticket>(`/api/tickets/${ticketId}/approve`, {
    method: "POST",
  })
}
