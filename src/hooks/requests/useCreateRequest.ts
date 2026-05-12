"use client"

import { useState } from "react"

import { createRequest } from "@/lib/api/requests"
import type { RequestFormValues } from "@/types/request.types"

export function useCreateRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(values: RequestFormValues) {
    setIsSubmitting(true)

    try {
      return await createRequest(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting }
}
