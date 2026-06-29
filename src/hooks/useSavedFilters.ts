"use client"

import { useEffect, useState } from "react"
import {
  listSavedFilters,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
  type SavedFilter,
} from "@/lib/api/saved-filters"

export function useSavedFilters(context: string) {
  const [filters, setFilters] = useState<SavedFilter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    listSavedFilters(context)
      .then((res) => { if (!ignore) setFilters(res.responseBody.savedFilters) })
      .catch(() => {})
      .finally(() => { if (!ignore) setIsLoading(false) })
    return () => { ignore = true }
  }, [context])

  async function save(name: string, filterValues: Record<string, string>) {
    const res = await createSavedFilter({ name, context, filters: filterValues })
    setFilters((prev) => [...prev, res.responseBody.savedFilter])
    return res.responseBody.savedFilter
  }

  async function remove(publicId: string) {
    await deleteSavedFilter(publicId)
    setFilters((prev) => prev.filter((f) => f.publicId !== publicId))
  }

  async function rename(publicId: string, name: string) {
    const res = await updateSavedFilter(publicId, { name })
    setFilters((prev) =>
      prev.map((f) => (f.publicId === publicId ? res.responseBody.savedFilter : f))
    )
  }

  return { filters, isLoading, save, remove, rename }
}
