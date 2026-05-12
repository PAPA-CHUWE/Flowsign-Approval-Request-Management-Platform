import { apiClient } from "@/lib/api/client"
import type { RequestFormValues } from "@/types/request.types"
import type { Ticket } from "@/types/ticket.types"

export function createRequest(values: RequestFormValues) {
  return apiClient<Ticket>("/api/requests", {
    method: "POST",
    body: JSON.stringify(values),
  })
}
