"use client"

import { useState } from "react"

import {
  createApprovalRequest,
  type CreateApprovalRequestPayload,
} from "@/lib/api/requests"

export function useCreateRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(values: CreateApprovalRequestPayload) {
    setIsSubmitting(true)

    try {
      return await createApprovalRequest(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting }
}
